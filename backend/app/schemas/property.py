from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


# --- Property schemas ---

class PropertyCreate(BaseModel):
    property_type: str
    address: str = Field(..., min_length=1)
    city: str | None = None
    province: str | None = None
    gps_latitude: Decimal | None = None
    gps_longitude: Decimal | None = None
    lot_size_sqm: Decimal | None = None
    built_area_sqm: Decimal | None = None
    year_built: int | None = None
    folio_real: str | None = None
    plano_catastrado: str | None = None
    estimated_value_usd: Decimal | None = None
    existing_liens_usd: Decimal | None = None
    description: str | None = None


class PropertyUpdate(BaseModel):
    property_type: str | None = None
    address: str | None = None
    city: str | None = None
    province: str | None = None
    gps_latitude: Decimal | None = None
    gps_longitude: Decimal | None = None
    lot_size_sqm: Decimal | None = None
    built_area_sqm: Decimal | None = None
    year_built: int | None = None
    folio_real: str | None = None
    plano_catastrado: str | None = None
    estimated_value_usd: Decimal | None = None
    existing_liens_usd: Decimal | None = None
    description: str | None = None


class PropertyImageResponse(BaseModel):
    id: UUID
    image_url: str
    is_primary: bool
    sort_order: int
    created_at: datetime

    class Config:
        from_attributes = True


class PropertyDocumentResponse(BaseModel):
    id: UUID
    document_type: str
    file_url: str
    file_name: str | None
    file_size_bytes: int | None
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class PropertyResponse(BaseModel):
    id: UUID
    borrower_id: UUID
    property_type: str
    address: str
    city: str | None
    province: str | None
    lot_size_sqm: Decimal | None
    built_area_sqm: Decimal | None
    year_built: int | None
    folio_real: str | None
    plano_catastrado: str | None
    estimated_value_usd: Decimal | None
    appraised_value_usd: Decimal | None
    existing_liens_usd: Decimal | None
    net_equity_usd: Decimal | None
    description: str | None
    images: list[PropertyImageResponse] = []
    documents: list[PropertyDocumentResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PropertyListItem(BaseModel):
    id: UUID
    property_type: str
    address: str
    city: str | None
    province: str | None
    estimated_value_usd: Decimal | None
    image_count: int = 0
    document_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class PropertyList(BaseModel):
    items: list[PropertyListItem]
    total: int


# --- Loan Application schemas ---

class LoanApplicationCreate(BaseModel):
    property_id: UUID
    amount_requested: Decimal = Field(..., gt=0)
    currency: str = "USD"
    purpose: str
    purpose_description: str | None = None
    preferred_term_months: int = Field(..., ge=6, le=36)
    max_interest_rate_monthly: Decimal | None = None


class LoanApplicationUpdate(BaseModel):
    amount_requested: Decimal | None = None
    purpose: str | None = None
    purpose_description: str | None = None
    preferred_term_months: int | None = None
    max_interest_rate_monthly: Decimal | None = None
    status: str | None = None  # only draft→submitted allowed for borrower


class LoanApplicationResponse(BaseModel):
    id: UUID
    application_number: str
    borrower_id: UUID
    property_id: UUID
    amount_requested: Decimal
    currency: str
    purpose: str
    purpose_description: str | None
    preferred_term_months: int
    max_interest_rate_monthly: Decimal | None
    status: str
    preliminary_ltv: Decimal | None
    final_ltv: Decimal | None
    rejection_reason: str | None
    submitted_at: datetime | None
    approved_at: datetime | None
    funded_at: datetime | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LoanApplicationList(BaseModel):
    items: list[LoanApplicationResponse]
    total: int
