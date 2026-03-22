from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.permissions import require_investor
from app.models.investor import InvestorInterest, InterestStatus
from app.models.property import ApplicationStatus, LoanApplication, Property
from app.models.user import InvestorProfile, User
from app.schemas.marketplace import (
    InvestorInterestCreate,
    InvestorInterestResponse,
    InvestorInterestWithDeal,
    MarketplaceDealList,
    MarketplaceDealResponse,
    MarketplacePropertySummary,
    PortfolioSummary,
)
from app.schemas.profile import InvestorProfileResponse, InvestorProfileUpdate

router = APIRouter()


def _get_investor_profile(user: User, db: Session) -> InvestorProfile:
    profile = db.query(InvestorProfile).filter(InvestorProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Investor profile not found.")
    return profile


# --- Profile ---

@router.get("/profile", response_model=InvestorProfileResponse)
async def get_profile(user: User = Depends(require_investor), db: Session = Depends(get_db)):
    return InvestorProfileResponse.model_validate(_get_investor_profile(user, db))


@router.put("/profile", response_model=InvestorProfileResponse)
async def update_profile(
    data: InvestorProfileUpdate,
    user: User = Depends(require_investor),
    db: Session = Depends(get_db),
):
    profile = _get_investor_profile(user, db)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, key, value)
    db.commit()
    db.refresh(profile)
    return InvestorProfileResponse.model_validate(profile)


# --- Marketplace ---

def _build_deal_response(
    app: LoanApplication, prop: Property, investor_profile_id=None, db: Session = None
) -> MarketplaceDealResponse:
    image_urls = [img.image_url for img in (prop.images or [])]

    interest_count = 0
    my_interest = None
    if db:
        interest_count = db.query(InvestorInterest).filter(
            InvestorInterest.loan_application_id == app.id
        ).count()
        if investor_profile_id:
            my = db.query(InvestorInterest).filter(
                InvestorInterest.loan_application_id == app.id,
                InvestorInterest.investor_id == investor_profile_id,
            ).first()
            if my:
                my_interest = InvestorInterestResponse.model_validate(my)

    return MarketplaceDealResponse(
        id=app.id,
        application_number=app.application_number,
        amount_requested=app.amount_requested,
        currency=app.currency.value if app.currency else "USD",
        purpose=app.purpose.value if app.purpose else "",
        purpose_description=app.purpose_description,
        preferred_term_months=app.preferred_term_months,
        max_interest_rate_monthly=app.max_interest_rate_monthly,
        preliminary_ltv=app.preliminary_ltv,
        final_ltv=app.final_ltv,
        status=app.status.value if app.status else "",
        property=MarketplacePropertySummary(
            property_type=prop.property_type.value if prop.property_type else "",
            city=prop.city,
            province=prop.province,
            estimated_value_usd=prop.estimated_value_usd,
            appraised_value_usd=prop.appraised_value_usd,
            lot_size_sqm=prop.lot_size_sqm,
            built_area_sqm=prop.built_area_sqm,
            year_built=prop.year_built,
            image_urls=image_urls,
        ),
        interest_count=interest_count,
        my_interest=my_interest,
        created_at=app.created_at,
    )


@router.get("/marketplace", response_model=MarketplaceDealList)
async def list_marketplace(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    min_amount: float | None = None,
    max_amount: float | None = None,
    max_ltv: float | None = None,
    property_type: str | None = None,
    province: str | None = None,
    min_term: int | None = None,
    max_term: int | None = None,
    sort_by: str = Query("created_at", pattern="^(created_at|amount_requested)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    user: User = Depends(require_investor),
    db: Session = Depends(get_db),
):
    profile = _get_investor_profile(user, db)

    query = (
        db.query(LoanApplication)
        .join(Property, LoanApplication.property_id == Property.id)
        .options(joinedload(LoanApplication.property).joinedload(Property.images))
        .filter(LoanApplication.status.in_([ApplicationStatus.APPROVED, ApplicationStatus.MATCHING]))
    )

    if min_amount:
        query = query.filter(LoanApplication.amount_requested >= min_amount)
    if max_amount:
        query = query.filter(LoanApplication.amount_requested <= max_amount)
    if max_ltv:
        query = query.filter(
            (LoanApplication.final_ltv <= max_ltv) | (LoanApplication.preliminary_ltv <= max_ltv)
        )
    if property_type:
        query = query.filter(Property.property_type == property_type)
    if province:
        query = query.filter(Property.province == province)
    if min_term:
        query = query.filter(LoanApplication.preferred_term_months >= min_term)
    if max_term:
        query = query.filter(LoanApplication.preferred_term_months <= max_term)

    total = query.count()

    sort_col = getattr(LoanApplication, sort_by)
    if sort_order == "desc":
        query = query.order_by(sort_col.desc())
    else:
        query = query.order_by(sort_col.asc())

    apps = query.offset((page - 1) * page_size).limit(page_size).all()

    items = [_build_deal_response(a, a.property, profile.id, db) for a in apps]

    return MarketplaceDealList(items=items, total=total, page=page, page_size=page_size)


@router.get("/marketplace/{app_id}", response_model=MarketplaceDealResponse)
async def get_marketplace_deal(
    app_id: str,
    user: User = Depends(require_investor),
    db: Session = Depends(get_db),
):
    profile = _get_investor_profile(user, db)

    app = (
        db.query(LoanApplication)
        .options(joinedload(LoanApplication.property).joinedload(Property.images))
        .filter(
            LoanApplication.id == app_id,
            LoanApplication.status.in_([ApplicationStatus.APPROVED, ApplicationStatus.MATCHING]),
        )
        .first()
    )
    if not app:
        raise HTTPException(status_code=404, detail="Deal not found.")

    return _build_deal_response(app, app.property, profile.id, db)


@router.post("/marketplace/{app_id}/interest", response_model=InvestorInterestResponse)
async def express_interest(
    app_id: str,
    data: InvestorInterestCreate,
    user: User = Depends(require_investor),
    db: Session = Depends(get_db),
):
    profile = _get_investor_profile(user, db)

    app = db.query(LoanApplication).filter(
        LoanApplication.id == app_id,
        LoanApplication.status.in_([ApplicationStatus.APPROVED, ApplicationStatus.MATCHING]),
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Deal not found or not available.")

    existing = db.query(InvestorInterest).filter(
        InvestorInterest.investor_id == profile.id,
        InvestorInterest.loan_application_id == app_id,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="You have already expressed interest in this deal.")

    interest = InvestorInterest(
        investor_id=profile.id,
        loan_application_id=app_id,
        amount_willing=data.amount_willing,
        proposed_rate_monthly=data.proposed_rate_monthly,
        message=data.message,
        status=InterestStatus.EXPRESSED,
    )
    db.add(interest)
    db.commit()
    db.refresh(interest)
    return InvestorInterestResponse.model_validate(interest)


# --- Portfolio ---

@router.get("/portfolio", response_model=PortfolioSummary)
async def get_portfolio(
    user: User = Depends(require_investor),
    db: Session = Depends(get_db),
):
    profile = _get_investor_profile(user, db)

    interests = db.query(InvestorInterest).filter(InvestorInterest.investor_id == profile.id).all()

    expressed = sum(1 for i in interests if i.status == InterestStatus.EXPRESSED)
    committed = sum(1 for i in interests if i.status == InterestStatus.COMMITTED)
    total_invested = sum(
        float(i.amount_willing or 0) for i in interests if i.status == InterestStatus.COMMITTED
    )

    return PortfolioSummary(
        total_invested=Decimal(str(total_invested)),
        active_deals_count=committed,
        interests_expressed=expressed,
        interests_committed=committed,
    )


@router.get("/portfolio/interests", response_model=list[InvestorInterestWithDeal])
async def list_interests(
    user: User = Depends(require_investor),
    db: Session = Depends(get_db),
):
    profile = _get_investor_profile(user, db)

    interests = (
        db.query(InvestorInterest)
        .options(joinedload(InvestorInterest.loan_application).joinedload(LoanApplication.property))
        .filter(InvestorInterest.investor_id == profile.id)
        .order_by(InvestorInterest.created_at.desc())
        .all()
    )

    results = []
    for i in interests:
        app = i.loan_application
        prop = app.property if app else None
        results.append(InvestorInterestWithDeal(
            id=i.id,
            investor_id=i.investor_id,
            loan_application_id=i.loan_application_id,
            amount_willing=i.amount_willing,
            proposed_rate_monthly=i.proposed_rate_monthly,
            message=i.message,
            status=i.status.value,
            created_at=i.created_at,
            application_number=app.application_number if app else None,
            amount_requested=app.amount_requested if app else None,
            property_type=prop.property_type.value if prop and prop.property_type else None,
            property_city=prop.city if prop else None,
        ))

    return results
