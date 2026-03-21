from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.permissions import require_borrower
from app.models.user import BorrowerProfile, User
from app.schemas.profile import BorrowerProfileResponse, BorrowerProfileUpdate

router = APIRouter()


@router.get("/profile", response_model=BorrowerProfileResponse)
async def get_profile(
    user: User = Depends(require_borrower),
    db: Session = Depends(get_db),
):
    profile = db.query(BorrowerProfile).filter(BorrowerProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Borrower profile not found.")
    return BorrowerProfileResponse.model_validate(profile)


@router.put("/profile", response_model=BorrowerProfileResponse)
async def update_profile(
    data: BorrowerProfileUpdate,
    user: User = Depends(require_borrower),
    db: Session = Depends(get_db),
):
    profile = db.query(BorrowerProfile).filter(BorrowerProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Borrower profile not found.")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)
    db.commit()
    db.refresh(profile)
    return BorrowerProfileResponse.model_validate(profile)
