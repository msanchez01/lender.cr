from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app.core.auth import require_api_key
from app.core.database import get_db
from app.models.appraiser import Appraiser as AppraiserModel
from app.models.investor import InvestorInterest
from app.schemas.appraiser import (
    AppraiserCreate as AppraiserCreateSchema,
    AppraiserList as AppraiserListSchema,
    AppraiserResponse as AppraiserResponseSchema,
    AppraiserUpdate as AppraiserUpdateSchema,
)
from app.models.property import (
    Appraisal,
    AppraisalStatus,
    LoanApplication,
    Property,
    PropertyDocument,
    PropertyImage,
)
from app.models.user import BorrowerProfile, InvestorProfile, User

router = APIRouter()


# --- Schemas ---

class DashboardStats(BaseModel):
    total_users: int
    total_borrowers: int
    total_investors: int
    active_applications: int
    pending_documents: int
    interests_expressed: int


class PipelineCount(BaseModel):
    status: str
    count: int


class StatusUpdate(BaseModel):
    status: str
    admin_notes: str | None = None
    rejection_reason: str | None = None


class AppraisalCreate(BaseModel):
    appraiser_id: str | None = None
    appraiser_name: str | None = None
    appraiser_company: str | None = None
    appraiser_license: str | None = None
    appraised_value_usd: float | None = None
    appraisal_date: str | None = None
    status: str = "not_requested"
    notes: str | None = None
    cost_usd: float | None = None


class UserUpdate(BaseModel):
    status: str | None = None
    kyc_verified: bool | None = None


class InterestStatusUpdate(BaseModel):
    status: str


# --- Dashboard ---

@router.get("/dashboard/stats", response_model=DashboardStats)
async def dashboard_stats(
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    total_users = db.query(User).count()
    total_borrowers = db.query(User).filter(User.role == "borrower").count()
    total_investors = db.query(User).filter(User.role == "investor").count()
    active_applications = db.query(LoanApplication).filter(
        LoanApplication.status.notin_(["draft", "expired", "withdrawn", "rejected", "funded"])
    ).count()
    pending_documents = db.query(PropertyDocument).filter(PropertyDocument.is_verified == False).count()
    interests_expressed = db.query(InvestorInterest).count()

    return DashboardStats(
        total_users=total_users,
        total_borrowers=total_borrowers,
        total_investors=total_investors,
        active_applications=active_applications,
        pending_documents=pending_documents,
        interests_expressed=interests_expressed,
    )


@router.get("/dashboard/pipeline", response_model=list[PipelineCount])
async def dashboard_pipeline(
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    counts = (
        db.query(LoanApplication.status, func.count(LoanApplication.id))
        .group_by(LoanApplication.status)
        .all()
    )
    return [PipelineCount(status=s.value if hasattr(s, 'value') else str(s), count=c) for s, c in counts]


# --- Applications ---

@router.get("/applications")
async def list_applications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    query = (
        db.query(LoanApplication)
        .join(BorrowerProfile, LoanApplication.borrower_id == BorrowerProfile.id)
        .join(User, BorrowerProfile.user_id == User.id)
        .join(Property, LoanApplication.property_id == Property.id)
    )

    if status:
        query = query.filter(LoanApplication.status == status)
    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                User.first_name.ilike(term),
                User.last_name.ilike(term),
                User.email.ilike(term),
                LoanApplication.application_number.ilike(term),
            )
        )

    total = query.count()
    apps = query.order_by(LoanApplication.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    items = []
    for app in apps:
        borrower_profile = db.query(BorrowerProfile).filter(BorrowerProfile.id == app.borrower_id).first()
        borrower_user = db.query(User).filter(User.id == borrower_profile.user_id).first() if borrower_profile else None
        prop = db.query(Property).filter(Property.id == app.property_id).first()

        items.append({
            "id": str(app.id),
            "application_number": app.application_number,
            "borrower_name": f"{borrower_user.first_name} {borrower_user.last_name}" if borrower_user else "Unknown",
            "borrower_email": borrower_user.email if borrower_user else "",
            "amount_requested": float(app.amount_requested),
            "preliminary_ltv": float(app.preliminary_ltv) if app.preliminary_ltv else None,
            "final_ltv": float(app.final_ltv) if app.final_ltv else None,
            "status": app.status.value if app.status else "",
            "purpose": app.purpose.value if app.purpose else "",
            "preferred_term_months": app.preferred_term_months,
            "property_type": prop.property_type.value if prop and prop.property_type else "",
            "property_city": prop.city if prop else "",
            "admin_notes": app.admin_notes,
            "created_at": app.created_at.isoformat() if app.created_at else None,
            "submitted_at": app.submitted_at.isoformat() if app.submitted_at else None,
        })

    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.get("/applications/{app_id}")
async def get_application(
    app_id: str,
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    app = (
        db.query(LoanApplication)
        .options(
            joinedload(LoanApplication.property).joinedload(Property.images),
            joinedload(LoanApplication.property).joinedload(Property.documents),
            joinedload(LoanApplication.appraisals),
        )
        .filter(LoanApplication.id == app_id)
        .first()
    )
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    borrower_profile = db.query(BorrowerProfile).filter(BorrowerProfile.id == app.borrower_id).first()
    borrower_user = db.query(User).filter(User.id == borrower_profile.user_id).first() if borrower_profile else None
    prop = app.property

    interests = db.query(InvestorInterest).filter(
        InvestorInterest.loan_application_id == app_id
    ).all()

    interest_items = []
    for i in interests:
        inv_profile = db.query(InvestorProfile).filter(InvestorProfile.id == i.investor_id).first()
        inv_user = db.query(User).filter(User.id == inv_profile.user_id).first() if inv_profile else None
        interest_items.append({
            "id": str(i.id),
            "investor_name": f"{inv_user.first_name} {inv_user.last_name}" if inv_user else "Unknown",
            "investor_email": inv_user.email if inv_user else "",
            "amount_willing": float(i.amount_willing) if i.amount_willing else None,
            "proposed_rate_monthly": float(i.proposed_rate_monthly) if i.proposed_rate_monthly else None,
            "message": i.message,
            "status": i.status.value if i.status else "",
            "created_at": i.created_at.isoformat() if i.created_at else None,
        })

    return {
        "id": str(app.id),
        "application_number": app.application_number,
        "amount_requested": float(app.amount_requested),
        "currency": app.currency.value if app.currency else "USD",
        "purpose": app.purpose.value if app.purpose else "",
        "purpose_description": app.purpose_description,
        "preferred_term_months": app.preferred_term_months,
        "max_interest_rate_monthly": float(app.max_interest_rate_monthly) if app.max_interest_rate_monthly else None,
        "preliminary_ltv": float(app.preliminary_ltv) if app.preliminary_ltv else None,
        "final_ltv": float(app.final_ltv) if app.final_ltv else None,
        "status": app.status.value if app.status else "",
        "admin_notes": app.admin_notes,
        "rejection_reason": app.rejection_reason,
        "created_at": app.created_at.isoformat() if app.created_at else None,
        "submitted_at": app.submitted_at.isoformat() if app.submitted_at else None,
        "approved_at": app.approved_at.isoformat() if app.approved_at else None,
        "borrower": {
            "name": f"{borrower_user.first_name} {borrower_user.last_name}" if borrower_user else "Unknown",
            "email": borrower_user.email if borrower_user else "",
            "phone": borrower_user.phone if borrower_user else None,
            "kyc_verified": borrower_user.kyc_verified if borrower_user else False,
        },
        "property": {
            "id": str(prop.id) if prop else None,
            "property_type": prop.property_type.value if prop and prop.property_type else "",
            "address": prop.address if prop else "",
            "city": prop.city if prop else "",
            "province": prop.province if prop else "",
            "estimated_value_usd": float(prop.estimated_value_usd) if prop and prop.estimated_value_usd else None,
            "appraised_value_usd": float(prop.appraised_value_usd) if prop and prop.appraised_value_usd else None,
            "lot_size_sqm": float(prop.lot_size_sqm) if prop and prop.lot_size_sqm else None,
            "built_area_sqm": float(prop.built_area_sqm) if prop and prop.built_area_sqm else None,
            "images": [{"id": str(img.id), "image_url": img.image_url, "is_primary": img.is_primary} for img in (prop.images or [])],
            "documents": [{"id": str(doc.id), "document_type": doc.document_type, "file_url": doc.file_url, "file_name": doc.file_name, "is_verified": doc.is_verified} for doc in (prop.documents or [])],
        },
        "appraisals": [
            {
                "id": str(a.id),
                "appraiser_name": a.appraiser_name,
                "appraiser_company": a.appraiser_company,
                "appraised_value_usd": float(a.appraised_value_usd) if a.appraised_value_usd else None,
                "status": a.status.value if a.status else "",
                "appraisal_date": a.appraisal_date.isoformat() if a.appraisal_date else None,
                "notes": a.notes,
                "cost_usd": float(a.cost_usd) if a.cost_usd else None,
            }
            for a in (app.appraisals or [])
        ],
        "interests": interest_items,
    }


@router.put("/applications/{app_id}/status")
async def update_application_status(
    app_id: str,
    data: StatusUpdate,
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    app = db.query(LoanApplication).filter(LoanApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    app.status = data.status
    if data.admin_notes is not None:
        app.admin_notes = data.admin_notes
    if data.rejection_reason is not None:
        app.rejection_reason = data.rejection_reason

    now = datetime.now(timezone.utc)
    if data.status == "approved":
        app.approved_at = now
    elif data.status == "funded":
        app.funded_at = now

    db.commit()
    return {"success": True, "status": data.status}


@router.post("/applications/{app_id}/appraisal")
async def record_appraisal(
    app_id: str,
    data: AppraisalCreate,
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    from app.models.appraiser import Appraiser as AppraiserModel

    app = db.query(LoanApplication).filter(LoanApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    # Auto-fill from appraiser record if appraiser_id provided
    appraiser_name = data.appraiser_name
    appraiser_company = data.appraiser_company
    appraiser_license = data.appraiser_license
    if data.appraiser_id:
        appraiser = db.query(AppraiserModel).filter(AppraiserModel.id == data.appraiser_id).first()
        if appraiser:
            appraiser_name = appraiser.appraiser_name
            appraiser_company = appraiser.company_name
            appraiser_license = appraiser.license_number

    appraisal = Appraisal(
        property_id=app.property_id,
        loan_application_id=app.id,
        appraiser_id=data.appraiser_id,
        appraiser_name=appraiser_name,
        appraiser_company=appraiser_company,
        appraiser_license=appraiser_license,
        appraised_value_usd=data.appraised_value_usd,
        appraisal_date=data.appraisal_date,
        status=data.status,
        notes=data.notes,
        cost_usd=data.cost_usd,
    )
    db.add(appraisal)

    # Update property appraised value if completed
    if data.status == "completed" and data.appraised_value_usd:
        prop = db.query(Property).filter(Property.id == app.property_id).first()
        if prop:
            prop.appraised_value_usd = data.appraised_value_usd
            # Recalculate final LTV
            if prop.appraised_value_usd and prop.appraised_value_usd > 0:
                app.final_ltv = (float(app.amount_requested) / float(prop.appraised_value_usd)) * 100

    db.commit()
    db.refresh(appraisal)
    return {"success": True, "appraisal_id": str(appraisal.id)}


# --- Users ---

@router.get("/users")
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    role: str | None = None,
    status: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if status:
        query = query.filter(User.status == status)
    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(User.first_name.ilike(term), User.last_name.ilike(term), User.email.ilike(term))
        )

    total = query.count()
    users = query.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": [
            {
                "id": str(u.id),
                "email": u.email,
                "first_name": u.first_name,
                "last_name": u.last_name,
                "role": u.role.value if u.role else "",
                "status": u.status.value if u.status else "",
                "email_verified": u.email_verified,
                "kyc_verified": u.kyc_verified,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/users/{user_id}")
async def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    result = {
        "id": str(user.id),
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role.value if user.role else "",
        "status": user.status.value if user.status else "",
        "phone": user.phone,
        "whatsapp": user.whatsapp,
        "preferred_language": user.preferred_language.value if user.preferred_language else "en",
        "email_verified": user.email_verified,
        "kyc_verified": user.kyc_verified,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }

    if user.role and user.role.value == "borrower":
        bp = db.query(BorrowerProfile).filter(BorrowerProfile.user_id == user.id).first()
        if bp:
            apps = db.query(LoanApplication).filter(LoanApplication.borrower_id == bp.id).count()
            props = db.query(Property).filter(Property.borrower_id == bp.id).count()
            result["borrower_profile"] = {
                "borrower_type": bp.borrower_type.value if bp.borrower_type else None,
                "nationality": bp.nationality,
                "residency_status": bp.residency_status,
                "application_count": apps,
                "property_count": props,
            }
    elif user.role and user.role.value == "investor":
        ip = db.query(InvestorProfile).filter(InvestorProfile.user_id == user.id).first()
        if ip:
            interests = db.query(InvestorInterest).filter(InvestorInterest.investor_id == ip.id).count()
            result["investor_profile"] = {
                "accreditation_status": ip.accreditation_status.value if ip.accreditation_status else None,
                "min_investment_usd": float(ip.min_investment_usd) if ip.min_investment_usd else None,
                "max_investment_usd": float(ip.max_investment_usd) if ip.max_investment_usd else None,
                "interest_count": interests,
            }

    return result


@router.put("/users/{user_id}")
async def update_user(
    user_id: str,
    data: UserUpdate,
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if data.status is not None:
        user.status = data.status
    if data.kyc_verified is not None:
        user.kyc_verified = data.kyc_verified

    db.commit()
    return {"success": True}


# --- Documents ---

@router.get("/documents/pending")
async def list_pending_documents(
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    docs = (
        db.query(PropertyDocument)
        .join(Property, PropertyDocument.property_id == Property.id)
        .join(BorrowerProfile, Property.borrower_id == BorrowerProfile.id)
        .join(User, BorrowerProfile.user_id == User.id)
        .filter(PropertyDocument.is_verified == False)
        .order_by(PropertyDocument.created_at.desc())
        .all()
    )

    items = []
    for doc in docs:
        prop = db.query(Property).filter(Property.id == doc.property_id).first()
        borrower_profile = db.query(BorrowerProfile).filter(BorrowerProfile.id == prop.borrower_id).first() if prop else None
        borrower_user = db.query(User).filter(User.id == borrower_profile.user_id).first() if borrower_profile else None

        items.append({
            "id": str(doc.id),
            "document_type": doc.document_type,
            "file_url": doc.file_url,
            "file_name": doc.file_name,
            "file_size_bytes": doc.file_size_bytes,
            "property_address": prop.address if prop else "",
            "property_city": prop.city if prop else "",
            "borrower_name": f"{borrower_user.first_name} {borrower_user.last_name}" if borrower_user else "Unknown",
            "created_at": doc.created_at.isoformat() if doc.created_at else None,
        })

    return {"items": items, "total": len(items)}


@router.put("/documents/{doc_id}/verify")
async def verify_document(
    doc_id: str,
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    doc = db.query(PropertyDocument).filter(PropertyDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    doc.is_verified = True
    doc.verified_at = datetime.now(timezone.utc)
    db.commit()
    return {"success": True}


# --- Send Appraisal Request Email ---

@router.post("/applications/{app_id}/appraisal/{appraisal_id}/send")
async def send_appraisal_request(
    app_id: str,
    appraisal_id: str,
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    from app.models.appraiser import Appraiser as AppraiserModel

    appraisal = db.query(Appraisal).filter(Appraisal.id == appraisal_id).first()
    if not appraisal:
        raise HTTPException(status_code=404, detail="Appraisal not found.")

    # Get appraiser email
    appraiser_email = None
    if appraisal.appraiser_id:
        appraiser = db.query(AppraiserModel).filter(AppraiserModel.id == appraisal.appraiser_id).first()
        if appraiser:
            appraiser_email = appraiser.email

    if not appraiser_email:
        raise HTTPException(status_code=400, detail="No appraiser email found. Please assign an appraiser first.")

    # Get property and application details
    app = db.query(LoanApplication).filter(LoanApplication.id == app_id).first()
    prop = db.query(Property).filter(Property.id == appraisal.property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found.")

    borrower_profile = db.query(BorrowerProfile).filter(BorrowerProfile.id == app.borrower_id).first() if app else None
    borrower_user = db.query(User).filter(User.id == borrower_profile.user_id).first() if borrower_profile else None

    # Build document links
    docs_html = ""
    if prop.documents:
        docs_html = "<h3>Documents</h3><ul>"
        for doc in prop.documents:
            docs_html += f'<li><a href="{doc.file_url}">{doc.document_type}: {doc.file_name or "View"}</a></li>'
        docs_html += "</ul>"

    # Build image links
    images_html = ""
    if prop.images:
        images_html = "<h3>Property Photos</h3>"
        for img in prop.images:
            images_html += f'<img src="{img.image_url}" width="300" style="margin:5px;border-radius:8px;" />'

    # Build email
    from app.core.config import settings
    import logging
    logger = logging.getLogger(__name__)

    subject = f"Appraisal Request — {app.application_number if app else 'N/A'} — {prop.address}"
    html = f"""
    <h2>Appraisal Request from Lender.cr</h2>
    <p>We'd like to request an appraisal for the following property:</p>

    <h3>Property Details</h3>
    <table style="border-collapse:collapse;">
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Type:</td><td>{prop.property_type.value if prop.property_type else ''}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Address:</td><td>{prop.address}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Location:</td><td>{', '.join(filter(None, [prop.district, prop.city, prop.province]))}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Lot Size:</td><td>{prop.lot_size_sqm} m² </td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Built Area:</td><td>{prop.built_area_sqm} m²</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Year Built:</td><td>{prop.year_built or 'N/A'}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Folio Real:</td><td>{prop.folio_real or 'N/A'}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Plano Catastrado:</td><td>{prop.plano_catastrado or 'N/A'}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Owner Est. Value:</td><td>${float(prop.estimated_value_usd):,.0f}</td></tr>
        {f'<tr><td style="padding:4px 12px 4px 0;color:#666;">Google Maps:</td><td><a href="{prop.google_maps_url}">View on Map</a></td></tr>' if prop.google_maps_url else ''}
    </table>

    <h3>Contact</h3>
    <p><strong>Borrower:</strong> {borrower_user.first_name + ' ' + borrower_user.last_name if borrower_user else 'N/A'}<br/>
    <strong>Phone:</strong> {borrower_user.phone if borrower_user else 'N/A'}<br/>
    <strong>Email:</strong> {borrower_user.email if borrower_user else 'N/A'}</p>

    {images_html}
    {docs_html}

    <p style="margin-top:20px;color:#666;">Application #{app.application_number if app else ''}<br/>
    Sent from <a href="{settings.SITE_URL}">Lender.cr</a></p>
    """

    if settings.RESEND_API_KEY:
        try:
            import resend
            resend.api_key = settings.RESEND_API_KEY
            resend.Emails.send({
                "from": settings.FROM_EMAIL,
                "to": [appraiser_email],
                "subject": subject,
                "html": html,
            })
        except Exception:
            logger.exception("Failed to send appraisal request email")
            raise HTTPException(status_code=500, detail="Failed to send email.")
    else:
        logger.warning("RESEND_API_KEY not configured — email not sent")

    # Update appraisal status to ordered
    appraisal.status = "ORDERED"
    db.commit()

    return {"success": True, "message": f"Appraisal request sent to {appraiser_email}"}


# --- Interests ---

@router.get("/interests")
async def list_interests(
    status: str | None = None,
    application_id: str | None = None,
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    query = db.query(InvestorInterest)
    if status:
        query = query.filter(InvestorInterest.status == status)
    if application_id:
        query = query.filter(InvestorInterest.loan_application_id == application_id)

    interests = query.order_by(InvestorInterest.created_at.desc()).all()

    items = []
    for i in interests:
        inv_profile = db.query(InvestorProfile).filter(InvestorProfile.id == i.investor_id).first()
        inv_user = db.query(User).filter(User.id == inv_profile.user_id).first() if inv_profile else None
        app = db.query(LoanApplication).filter(LoanApplication.id == i.loan_application_id).first()

        items.append({
            "id": str(i.id),
            "investor_name": f"{inv_user.first_name} {inv_user.last_name}" if inv_user else "Unknown",
            "investor_email": inv_user.email if inv_user else "",
            "application_number": app.application_number if app else "",
            "amount_willing": float(i.amount_willing) if i.amount_willing else None,
            "proposed_rate_monthly": float(i.proposed_rate_monthly) if i.proposed_rate_monthly else None,
            "message": i.message,
            "status": i.status.value if i.status else "",
            "created_at": i.created_at.isoformat() if i.created_at else None,
        })

    return {"items": items, "total": len(items)}


@router.put("/interests/{interest_id}/status")
async def update_interest_status(
    interest_id: str,
    data: InterestStatusUpdate,
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    interest = db.query(InvestorInterest).filter(InvestorInterest.id == interest_id).first()
    if not interest:
        raise HTTPException(status_code=404, detail="Interest not found.")

    interest.status = data.status
    interest.responded_at = datetime.now(timezone.utc)
    db.commit()
    return {"success": True, "status": data.status}


# --- Appraisers ---


@router.get("/appraisers", response_model=AppraiserListSchema)
async def list_appraisers(
    is_active: bool | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    query = db.query(AppraiserModel)

    if is_active is not None:
        query = query.filter(AppraiserModel.is_active == is_active)
    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                AppraiserModel.appraiser_name.ilike(term),
                AppraiserModel.company_name.ilike(term),
                AppraiserModel.email.ilike(term),
            )
        )

    total = query.count()
    appraisers = query.order_by(AppraiserModel.created_at.desc()).all()

    return {"items": appraisers, "total": total}


@router.get("/appraisers/{appraiser_id}", response_model=AppraiserResponseSchema)
async def get_appraiser(
    appraiser_id: str,
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    appraiser = db.query(AppraiserModel).filter(AppraiserModel.id == appraiser_id).first()
    if not appraiser:
        raise HTTPException(status_code=404, detail="Appraiser not found.")
    return appraiser


@router.post("/appraisers", response_model=AppraiserResponseSchema, status_code=201)
async def create_appraiser(
    data: AppraiserCreateSchema,
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    appraiser = AppraiserModel(**data.model_dump())
    db.add(appraiser)
    db.commit()
    db.refresh(appraiser)
    return appraiser


@router.put("/appraisers/{appraiser_id}", response_model=AppraiserResponseSchema)
async def update_appraiser(
    appraiser_id: str,
    data: AppraiserUpdateSchema,
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    appraiser = db.query(AppraiserModel).filter(AppraiserModel.id == appraiser_id).first()
    if not appraiser:
        raise HTTPException(status_code=404, detail="Appraiser not found.")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(appraiser, key, value)

    db.commit()
    db.refresh(appraiser)
    return appraiser


@router.delete("/appraisers/{appraiser_id}")
async def delete_appraiser(
    appraiser_id: str,
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    appraiser = db.query(AppraiserModel).filter(AppraiserModel.id == appraiser_id).first()
    if not appraiser:
        raise HTTPException(status_code=404, detail="Appraiser not found.")

    appraiser.is_active = False
    db.commit()
    return {"success": True}
