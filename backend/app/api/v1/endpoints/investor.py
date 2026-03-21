from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.permissions import require_investor
from app.models.user import InvestorProfile, User
from app.schemas.profile import InvestorProfileResponse, InvestorProfileUpdate

router = APIRouter()


@router.get("/profile", response_model=InvestorProfileResponse)
async def get_profile(
    user: User = Depends(require_investor),
    db: Session = Depends(get_db),
):
    profile = db.query(InvestorProfile).filter(InvestorProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Investor profile not found.")
    return InvestorProfileResponse.model_validate(profile)


@router.put("/profile", response_model=InvestorProfileResponse)
async def update_profile(
    data: InvestorProfileUpdate,
    user: User = Depends(require_investor),
    db: Session = Depends(get_db),
):
    profile = db.query(InvestorProfile).filter(InvestorProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Investor profile not found.")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)
    db.commit()
    db.refresh(profile)
    return InvestorProfileResponse.model_validate(profile)
