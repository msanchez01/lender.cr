from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class AppraiserCreate(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=200)
    appraiser_name: str = Field(..., min_length=1, max_length=200)
    phone: str | None = None
    email: str | None = None
    license_number: str | None = None
    specialties: str | None = None
    regions: str | None = None
    notes: str | None = None


class AppraiserUpdate(BaseModel):
    company_name: str | None = None
    appraiser_name: str | None = None
    phone: str | None = None
    email: str | None = None
    license_number: str | None = None
    specialties: str | None = None
    regions: str | None = None
    is_active: bool | None = None
    notes: str | None = None


class AppraiserResponse(BaseModel):
    id: UUID
    company_name: str
    appraiser_name: str
    phone: str | None
    email: str | None
    license_number: str | None
    specialties: str | None
    regions: str | None
    is_active: bool
    notes: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AppraiserList(BaseModel):
    items: list[AppraiserResponse]
    total: int
