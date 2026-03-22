from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session, joinedload

from app.core.auth import require_api_key
from app.core.database import get_db
from app.core.pdf import generate_loan_agreement, generate_payment_schedule_pdf
from app.core.security import get_current_user
from app.core.permissions import require_borrower, require_investor
from app.models.deal import Deal, DealStatus, Payment, PaymentStatus, PaymentType
from app.models.investor import InvestorInterest, InterestStatus
from app.models.property import ApplicationStatus, LoanApplication, Property
from app.models.user import BorrowerProfile, InvestorProfile, User
from app.schemas.deal import (
    DealCreate,
    DealList,
    DealListItem,
    DealResponse,
    DealUpdate,
    PaymentResponse,
    PaymentUpdate,
)

router = APIRouter()


def _generate_deal_number(db: Session) -> str:
    year = datetime.now(timezone.utc).year
    prefix = f"LCR-D-{year}-"
    last = (
        db.query(Deal)
        .filter(Deal.deal_number.startswith(prefix))
        .order_by(Deal.deal_number.desc())
        .first()
    )
    seq = int(last.deal_number.split("-")[-1]) + 1 if last else 1
    return f"{prefix}{seq:04d}"


def _generate_payment_schedule(
    deal: Deal, db: Session
) -> list[Payment]:
    """Generate interest-only monthly payments + balloon principal at maturity."""
    principal = float(deal.principal_amount)
    rate = float(deal.interest_rate_monthly) / 100
    servicing = float(deal.servicing_fee_monthly_pct) / 100
    investor_rate = float(deal.investor_rate_monthly) / 100

    payments = []
    current_date = deal.first_payment_date

    for i in range(1, deal.term_months + 1):
        interest = round(principal * rate, 2)
        svc_fee = round(principal * servicing, 2)
        investor_amount = round(principal * investor_rate, 2)
        platform_amount = round(interest + svc_fee - investor_amount, 2)

        is_last = i == deal.term_months
        principal_portion = Decimal(str(principal)) if is_last else Decimal("0")
        ptype = PaymentType.INTEREST_AND_PRINCIPAL if is_last else PaymentType.INTEREST
        amount_due = Decimal(str(interest + svc_fee)) + principal_portion

        payment = Payment(
            deal_id=deal.id,
            payment_number=i,
            due_date=current_date,
            payment_type=ptype,
            amount_due=amount_due,
            interest_portion=Decimal(str(interest)),
            principal_portion=principal_portion,
            servicing_fee_portion=Decimal(str(svc_fee)),
            investor_disbursement_amount=Decimal(str(investor_amount)),
            platform_revenue_amount=Decimal(str(platform_amount)),
            status=PaymentStatus.SCHEDULED,
        )
        payments.append(payment)

        # Move to next month
        if current_date.month == 12:
            current_date = current_date.replace(year=current_date.year + 1, month=1)
        else:
            day = min(current_date.day, 28)
            current_date = current_date.replace(month=current_date.month + 1, day=day)

    return payments


# ============================================================
# ADMIN ENDPOINTS
# ============================================================

@router.post("/admin/deals", response_model=DealResponse)
async def create_deal(
    data: DealCreate,
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    app = db.query(LoanApplication).filter(LoanApplication.id == data.loan_application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")
    if app.status not in (ApplicationStatus.APPROVED, ApplicationStatus.MATCHING):
        raise HTTPException(status_code=400, detail="Application must be approved or matching.")

    interest = db.query(InvestorInterest).filter(InvestorInterest.id == data.investor_interest_id).first()
    if not interest:
        raise HTTPException(status_code=404, detail="Investor interest not found.")

    prop = db.query(Property).filter(Property.id == app.property_id).first()
    ltv = app.final_ltv or app.preliminary_ltv or Decimal("0")
    origination_amount = app.amount_requested * data.origination_fee_pct / 100
    spread = data.interest_rate_monthly - data.investor_rate_monthly

    first_payment = data.start_date.replace(
        month=data.start_date.month + 1 if data.start_date.month < 12 else 1,
        year=data.start_date.year + (1 if data.start_date.month == 12 else 0),
        day=min(data.start_date.day, 28),
    )
    maturity_months = app.preferred_term_months
    maturity = data.start_date
    for _ in range(maturity_months):
        if maturity.month == 12:
            maturity = maturity.replace(year=maturity.year + 1, month=1)
        else:
            maturity = maturity.replace(month=maturity.month + 1, day=min(maturity.day, 28))

    deal = Deal(
        deal_number=_generate_deal_number(db),
        loan_application_id=app.id,
        borrower_id=app.borrower_id,
        investor_id=interest.investor_id,
        property_id=app.property_id,
        principal_amount=app.amount_requested,
        currency=app.currency.value if app.currency else "USD",
        interest_rate_monthly=data.interest_rate_monthly,
        investor_rate_monthly=data.investor_rate_monthly,
        platform_spread_monthly=spread,
        term_months=maturity_months,
        ltv_at_origination=ltv,
        origination_fee_pct=data.origination_fee_pct,
        origination_fee_amount=origination_amount,
        document_fee_amount=data.document_fee_amount,
        servicing_fee_monthly_pct=data.servicing_fee_monthly_pct,
        start_date=data.start_date,
        maturity_date=maturity,
        first_payment_date=first_payment,
        outstanding_principal=app.amount_requested,
        notario_name=data.notario_name,
        notario_contact=data.notario_contact,
    )
    db.add(deal)
    db.flush()

    payments = _generate_payment_schedule(deal, db)
    for p in payments:
        db.add(p)

    app.status = ApplicationStatus.FUNDED
    app.funded_at = datetime.now(timezone.utc)

    interest.status = InterestStatus.COMMITTED
    interest.responded_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(deal)
    return DealResponse.model_validate(deal)


@router.get("/admin/deals", response_model=DealList)
async def admin_list_deals(
    status: str | None = None,
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    query = db.query(Deal)
    if status:
        query = query.filter(Deal.status == status)
    deals = query.order_by(Deal.created_at.desc()).all()
    return DealList(
        items=[DealListItem.model_validate(d) for d in deals],
        total=len(deals),
    )


@router.get("/admin/deals/{deal_id}", response_model=DealResponse)
async def admin_get_deal(
    deal_id: str,
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    deal = db.query(Deal).options(joinedload(Deal.payments)).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found.")
    return DealResponse.model_validate(deal)


@router.put("/admin/deals/{deal_id}")
async def admin_update_deal(
    deal_id: str,
    data: DealUpdate,
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found.")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(deal, key, value)
    db.commit()
    return {"success": True}


@router.get("/admin/payments")
async def admin_list_payments(
    status: str | None = None,
    deal_id: str | None = None,
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    query = db.query(Payment)
    if status:
        query = query.filter(Payment.status == status)
    if deal_id:
        query = query.filter(Payment.deal_id == deal_id)
    payments = query.order_by(Payment.due_date.asc()).all()
    return {"items": [PaymentResponse.model_validate(p) for p in payments], "total": len(payments)}


@router.put("/admin/payments/{payment_id}")
async def admin_update_payment(
    payment_id: str,
    data: PaymentUpdate,
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found.")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(payment, key, value)

    if data.status == "paid":
        deal = db.query(Deal).filter(Deal.id == payment.deal_id).first()
        if deal:
            deal.total_interest_paid = (deal.total_interest_paid or 0) + (payment.interest_portion or 0)
            deal.total_servicing_fees_collected = (deal.total_servicing_fees_collected or 0) + (payment.servicing_fee_portion or 0)
            if payment.principal_portion and payment.principal_portion > 0:
                deal.outstanding_principal = (deal.outstanding_principal or deal.principal_amount) - payment.principal_portion

    db.commit()
    return {"success": True}


@router.get("/admin/payments/overdue")
async def admin_overdue_payments(
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    today = date.today()
    overdue = (
        db.query(Payment)
        .filter(Payment.due_date < today, Payment.status.in_([PaymentStatus.SCHEDULED, PaymentStatus.PENDING]))
        .order_by(Payment.due_date.asc())
        .all()
    )
    return {"items": [PaymentResponse.model_validate(p) for p in overdue], "total": len(overdue)}


@router.get("/admin/deals/{deal_id}/agreement")
async def admin_deal_agreement(
    deal_id: str,
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found.")
    return _generate_agreement_response(deal, db)


# ============================================================
# BORROWER ENDPOINTS
# ============================================================

@router.get("/borrower/deals", response_model=DealList)
async def borrower_list_deals(
    user: User = Depends(require_borrower),
    db: Session = Depends(get_db),
):
    profile = db.query(BorrowerProfile).filter(BorrowerProfile.user_id == user.id).first()
    if not profile:
        return DealList(items=[], total=0)
    deals = db.query(Deal).filter(Deal.borrower_id == profile.id).order_by(Deal.created_at.desc()).all()
    return DealList(items=[DealListItem.model_validate(d) for d in deals], total=len(deals))


@router.get("/borrower/deals/{deal_id}", response_model=DealResponse)
async def borrower_get_deal(
    deal_id: str,
    user: User = Depends(require_borrower),
    db: Session = Depends(get_db),
):
    profile = db.query(BorrowerProfile).filter(BorrowerProfile.user_id == user.id).first()
    deal = (
        db.query(Deal)
        .options(joinedload(Deal.payments))
        .filter(Deal.id == deal_id, Deal.borrower_id == profile.id)
        .first()
    )
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found.")
    return DealResponse.model_validate(deal)


@router.get("/borrower/deals/{deal_id}/agreement")
async def borrower_deal_agreement(
    deal_id: str,
    user: User = Depends(require_borrower),
    db: Session = Depends(get_db),
):
    profile = db.query(BorrowerProfile).filter(BorrowerProfile.user_id == user.id).first()
    deal = db.query(Deal).filter(Deal.id == deal_id, Deal.borrower_id == profile.id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found.")
    return _generate_agreement_response(deal, db)


@router.get("/borrower/deals/{deal_id}/schedule")
async def borrower_deal_schedule(
    deal_id: str,
    user: User = Depends(require_borrower),
    db: Session = Depends(get_db),
):
    profile = db.query(BorrowerProfile).filter(BorrowerProfile.user_id == user.id).first()
    deal = db.query(Deal).options(joinedload(Deal.payments)).filter(Deal.id == deal_id, Deal.borrower_id == profile.id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found.")
    return _generate_schedule_response(deal)


# ============================================================
# INVESTOR ENDPOINTS
# ============================================================

@router.get("/investor/deals", response_model=DealList)
async def investor_list_deals(
    user: User = Depends(require_investor),
    db: Session = Depends(get_db),
):
    profile = db.query(InvestorProfile).filter(InvestorProfile.user_id == user.id).first()
    if not profile:
        return DealList(items=[], total=0)
    deals = db.query(Deal).filter(Deal.investor_id == profile.id).order_by(Deal.created_at.desc()).all()
    return DealList(items=[DealListItem.model_validate(d) for d in deals], total=len(deals))


@router.get("/investor/deals/{deal_id}", response_model=DealResponse)
async def investor_get_deal(
    deal_id: str,
    user: User = Depends(require_investor),
    db: Session = Depends(get_db),
):
    profile = db.query(InvestorProfile).filter(InvestorProfile.user_id == user.id).first()
    deal = (
        db.query(Deal)
        .options(joinedload(Deal.payments))
        .filter(Deal.id == deal_id, Deal.investor_id == profile.id)
        .first()
    )
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found.")
    return DealResponse.model_validate(deal)


# ============================================================
# HELPERS
# ============================================================

def _generate_agreement_response(deal: Deal, db: Session) -> Response:
    borrower_profile = db.query(BorrowerProfile).filter(BorrowerProfile.id == deal.borrower_id).first()
    borrower_user = db.query(User).filter(User.id == borrower_profile.user_id).first() if borrower_profile else None
    investor_profile = db.query(InvestorProfile).filter(InvestorProfile.id == deal.investor_id).first()
    investor_user = db.query(User).filter(User.id == investor_profile.user_id).first() if investor_profile else None
    prop = db.query(Property).filter(Property.id == deal.property_id).first()

    pdf_bytes = generate_loan_agreement(
        deal_number=deal.deal_number,
        principal=deal.principal_amount,
        interest_rate=deal.interest_rate_monthly,
        term_months=deal.term_months,
        start_date=deal.start_date,
        maturity_date=deal.maturity_date,
        origination_fee_pct=deal.origination_fee_pct,
        origination_fee_amount=deal.origination_fee_amount,
        borrower_name=f"{borrower_user.first_name} {borrower_user.last_name}" if borrower_user else "Unknown",
        investor_name=f"{investor_user.first_name} {investor_user.last_name}" if investor_user else "Unknown",
        property_address=prop.address if prop else "",
        property_type=prop.property_type.value if prop and prop.property_type else "",
        ltv=deal.ltv_at_origination,
        language=borrower_user.preferred_language.value if borrower_user and borrower_user.preferred_language else "en",
    )
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="loan-agreement-{deal.deal_number}.pdf"'},
    )


def _generate_schedule_response(deal: Deal) -> Response:
    payments_data = [
        {
            "payment_number": p.payment_number,
            "due_date": p.due_date,
            "payment_type": p.payment_type.value if p.payment_type else "",
            "amount_due": p.amount_due,
            "interest_portion": p.interest_portion,
            "principal_portion": p.principal_portion,
            "servicing_fee_portion": p.servicing_fee_portion,
            "status": p.status.value if p.status else "",
        }
        for p in sorted(deal.payments, key=lambda x: x.payment_number)
    ]
    pdf_bytes = generate_payment_schedule_pdf(deal.deal_number, payments_data)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="payment-schedule-{deal.deal_number}.pdf"'},
    )
