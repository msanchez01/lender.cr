from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.permissions import require_borrower
from app.core import storage
from app.models.property import (
    ApplicationStatus,
    LoanApplication,
    Property,
    PropertyDocument,
    PropertyImage,
)
from app.models.user import BorrowerProfile, User
from app.schemas.profile import BorrowerProfileResponse, BorrowerProfileUpdate
from app.schemas.property import (
    LoanApplicationCreate,
    LoanApplicationList,
    LoanApplicationResponse,
    LoanApplicationUpdate,
    PropertyCreate,
    PropertyDocumentResponse,
    PropertyImageResponse,
    PropertyList,
    PropertyListItem,
    PropertyResponse,
    PropertyUpdate,
)

router = APIRouter()


# --- Helpers ---

def _get_borrower_profile(user: User, db: Session) -> BorrowerProfile:
    profile = db.query(BorrowerProfile).filter(BorrowerProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Borrower profile not found.")
    return profile


def _get_owned_property(property_id: str, borrower_id, db: Session) -> Property:
    prop = (
        db.query(Property)
        .options(joinedload(Property.images), joinedload(Property.documents))
        .filter(Property.id == property_id, Property.borrower_id == borrower_id)
        .first()
    )
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found.")
    return prop


def _generate_application_number(db: Session) -> str:
    year = datetime.now(timezone.utc).year
    prefix = f"LCR-{year}-"
    last = (
        db.query(LoanApplication)
        .filter(LoanApplication.application_number.startswith(prefix))
        .order_by(LoanApplication.application_number.desc())
        .first()
    )
    if last:
        seq = int(last.application_number.split("-")[-1]) + 1
    else:
        seq = 1
    return f"{prefix}{seq:04d}"


# --- Profile ---

@router.get("/profile", response_model=BorrowerProfileResponse)
async def get_profile(user: User = Depends(require_borrower), db: Session = Depends(get_db)):
    profile = _get_borrower_profile(user, db)
    return BorrowerProfileResponse.model_validate(profile)


@router.put("/profile", response_model=BorrowerProfileResponse)
async def update_profile(
    data: BorrowerProfileUpdate,
    user: User = Depends(require_borrower),
    db: Session = Depends(get_db),
):
    profile = _get_borrower_profile(user, db)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, key, value)
    db.commit()
    db.refresh(profile)
    return BorrowerProfileResponse.model_validate(profile)


# --- Properties ---

@router.post("/properties", response_model=PropertyResponse)
async def create_property(
    data: PropertyCreate,
    user: User = Depends(require_borrower),
    db: Session = Depends(get_db),
):
    profile = _get_borrower_profile(user, db)
    prop = Property(borrower_id=profile.id, **data.model_dump())
    db.add(prop)
    db.commit()
    db.refresh(prop)
    return PropertyResponse.model_validate(prop)


@router.get("/properties", response_model=PropertyList)
async def list_properties(
    user: User = Depends(require_borrower),
    db: Session = Depends(get_db),
):
    profile = _get_borrower_profile(user, db)
    props = (
        db.query(Property)
        .options(joinedload(Property.images), joinedload(Property.documents))
        .filter(Property.borrower_id == profile.id)
        .order_by(Property.created_at.desc())
        .all()
    )
    items = []
    for p in props:
        items.append(PropertyListItem(
            id=p.id,
            property_type=p.property_type.value,
            address=p.address,
            city=p.city,
            province=p.province,
            estimated_value_usd=p.estimated_value_usd,
            image_count=len(p.images) if p.images else 0,
            document_count=len(p.documents) if p.documents else 0,
            created_at=p.created_at,
        ))
    return PropertyList(items=items, total=len(items))


@router.get("/properties/{property_id}", response_model=PropertyResponse)
async def get_property(
    property_id: str,
    user: User = Depends(require_borrower),
    db: Session = Depends(get_db),
):
    profile = _get_borrower_profile(user, db)
    prop = _get_owned_property(property_id, profile.id, db)
    return PropertyResponse.model_validate(prop)


@router.put("/properties/{property_id}", response_model=PropertyResponse)
async def update_property(
    property_id: str,
    data: PropertyUpdate,
    user: User = Depends(require_borrower),
    db: Session = Depends(get_db),
):
    profile = _get_borrower_profile(user, db)
    prop = _get_owned_property(property_id, profile.id, db)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(prop, key, value)
    db.commit()
    db.refresh(prop)
    return PropertyResponse.model_validate(prop)


@router.delete("/properties/{property_id}")
async def delete_property(
    property_id: str,
    user: User = Depends(require_borrower),
    db: Session = Depends(get_db),
):
    profile = _get_borrower_profile(user, db)
    prop = _get_owned_property(property_id, profile.id, db)
    if storage.is_configured():
        for img in prop.images:
            storage.delete_file(img.image_url)
        for doc in prop.documents:
            storage.delete_file(doc.file_url)
    db.delete(prop)
    db.commit()
    return {"success": True}


# --- Property Images ---

@router.post("/properties/{property_id}/images", response_model=PropertyImageResponse)
async def upload_image(
    property_id: str,
    file: UploadFile = File(...),
    user: User = Depends(require_borrower),
    db: Session = Depends(get_db),
):
    profile = _get_borrower_profile(user, db)
    prop = _get_owned_property(property_id, profile.id, db)

    file_data = await file.read()
    content_type = file.content_type or "application/octet-stream"
    error = storage.validate_image(content_type, len(file_data))
    if error:
        raise HTTPException(status_code=400, detail=error)

    if storage.is_configured():
        url = storage.upload_file(file_data, file.filename or "image.jpg", content_type, "properties/images/")
    else:
        url = f"/placeholder/properties/images/{property_id}/{file.filename}"

    image = PropertyImage(
        property_id=prop.id,
        image_url=url,
        is_primary=len(prop.images) == 0,
        sort_order=len(prop.images),
    )
    db.add(image)
    db.commit()
    db.refresh(image)
    return PropertyImageResponse.model_validate(image)


@router.delete("/properties/{property_id}/images/{image_id}")
async def delete_image(
    property_id: str,
    image_id: str,
    user: User = Depends(require_borrower),
    db: Session = Depends(get_db),
):
    profile = _get_borrower_profile(user, db)
    _get_owned_property(property_id, profile.id, db)
    image = db.query(PropertyImage).filter(
        PropertyImage.id == image_id, PropertyImage.property_id == property_id
    ).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found.")
    if storage.is_configured():
        storage.delete_file(image.image_url)
    db.delete(image)
    db.commit()
    return {"success": True}


# --- Property Documents ---

@router.post("/properties/{property_id}/documents", response_model=PropertyDocumentResponse)
async def upload_document(
    property_id: str,
    document_type: str = Query(...),
    file: UploadFile = File(...),
    user: User = Depends(require_borrower),
    db: Session = Depends(get_db),
):
    profile = _get_borrower_profile(user, db)
    _get_owned_property(property_id, profile.id, db)

    file_data = await file.read()
    content_type = file.content_type or "application/octet-stream"
    error = storage.validate_document(content_type, len(file_data))
    if error:
        raise HTTPException(status_code=400, detail=error)

    if storage.is_configured():
        url = storage.upload_file(file_data, file.filename or "document.pdf", content_type, "properties/documents/")
    else:
        url = f"/placeholder/properties/documents/{property_id}/{file.filename}"

    doc = PropertyDocument(
        property_id=property_id,
        document_type=document_type,
        file_url=url,
        file_name=file.filename,
        file_size_bytes=len(file_data),
        uploaded_by=user.id,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return PropertyDocumentResponse.model_validate(doc)


@router.delete("/properties/{property_id}/documents/{doc_id}")
async def delete_document(
    property_id: str,
    doc_id: str,
    user: User = Depends(require_borrower),
    db: Session = Depends(get_db),
):
    profile = _get_borrower_profile(user, db)
    _get_owned_property(property_id, profile.id, db)
    doc = db.query(PropertyDocument).filter(
        PropertyDocument.id == doc_id, PropertyDocument.property_id == property_id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    if storage.is_configured():
        storage.delete_file(doc.file_url)
    db.delete(doc)
    db.commit()
    return {"success": True}


# --- Loan Applications ---

@router.post("/applications", response_model=LoanApplicationResponse)
async def create_application(
    data: LoanApplicationCreate,
    user: User = Depends(require_borrower),
    db: Session = Depends(get_db),
):
    profile = _get_borrower_profile(user, db)
    prop = db.query(Property).filter(
        Property.id == data.property_id, Property.borrower_id == profile.id
    ).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found.")

    preliminary_ltv = None
    if prop.estimated_value_usd and prop.estimated_value_usd > 0:
        preliminary_ltv = (data.amount_requested / prop.estimated_value_usd) * 100

    app = LoanApplication(
        application_number=_generate_application_number(db),
        borrower_id=profile.id,
        property_id=data.property_id,
        amount_requested=data.amount_requested,
        currency=data.currency,
        purpose=data.purpose,
        purpose_description=data.purpose_description,
        preferred_term_months=data.preferred_term_months,
        max_interest_rate_monthly=data.max_interest_rate_monthly,
        preliminary_ltv=preliminary_ltv,
        status=ApplicationStatus.DRAFT,
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return LoanApplicationResponse.model_validate(app)


@router.get("/applications", response_model=LoanApplicationList)
async def list_applications(
    status: str | None = None,
    user: User = Depends(require_borrower),
    db: Session = Depends(get_db),
):
    profile = _get_borrower_profile(user, db)
    query = db.query(LoanApplication).filter(LoanApplication.borrower_id == profile.id)
    if status:
        query = query.filter(LoanApplication.status == status)
    apps = query.order_by(LoanApplication.created_at.desc()).all()
    return LoanApplicationList(
        items=[LoanApplicationResponse.model_validate(a) for a in apps],
        total=len(apps),
    )


@router.get("/applications/{app_id}", response_model=LoanApplicationResponse)
async def get_application(
    app_id: str,
    user: User = Depends(require_borrower),
    db: Session = Depends(get_db),
):
    profile = _get_borrower_profile(user, db)
    app = db.query(LoanApplication).filter(
        LoanApplication.id == app_id, LoanApplication.borrower_id == profile.id
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")
    return LoanApplicationResponse.model_validate(app)


@router.put("/applications/{app_id}", response_model=LoanApplicationResponse)
async def update_application(
    app_id: str,
    data: LoanApplicationUpdate,
    user: User = Depends(require_borrower),
    db: Session = Depends(get_db),
):
    profile = _get_borrower_profile(user, db)
    app = db.query(LoanApplication).filter(
        LoanApplication.id == app_id, LoanApplication.borrower_id == profile.id
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    update_data = data.model_dump(exclude_unset=True)
    if "status" in update_data:
        new_status = update_data["status"]
        if new_status == "submitted" and app.status == ApplicationStatus.DRAFT:
            app.submitted_at = datetime.now(timezone.utc)
        elif new_status != "withdrawn" and app.status != ApplicationStatus.DRAFT:
            raise HTTPException(status_code=400, detail="Can only edit applications in draft status.")

    for key, value in update_data.items():
        setattr(app, key, value)
    db.commit()
    db.refresh(app)
    return LoanApplicationResponse.model_validate(app)
