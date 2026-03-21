from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel


class BorrowerProfileResponse(BaseModel):
    id: UUID
    user_id: UUID
    borrower_type: str | None
    id_document_type: str | None
    id_document_number: str | None
    nationality: str | None
    residency_status: str | None
    company_name: str | None
    company_cedula: str | None
    address: str | None
    city: str | None
    province: str | None
    notes: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BorrowerProfileUpdate(BaseModel):
    borrower_type: str | None = None
    id_document_type: str | None = None
    id_document_number: str | None = None
    nationality: str | None = None
    residency_status: str | None = None
    company_name: str | None = None
    company_cedula: str | None = None
    address: str | None = None
    city: str | None = None
    province: str | None = None


class InvestorProfileResponse(BaseModel):
    id: UUID
    user_id: UUID
    accreditation_status: str | None
    min_investment_usd: Decimal | None
    max_investment_usd: Decimal | None
    total_available_capital_usd: Decimal | None
    preferred_ltv_max: Decimal | None
    preferred_term_months_min: int | None
    preferred_term_months_max: int | None
    preferred_regions: str | None
    tax_country: str | None
    tax_id: str | None
    notes: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class InvestorProfileUpdate(BaseModel):
    accreditation_status: str | None = None
    min_investment_usd: Decimal | None = None
    max_investment_usd: Decimal | None = None
    total_available_capital_usd: Decimal | None = None
    preferred_ltv_max: Decimal | None = None
    preferred_term_months_min: int | None = None
    preferred_term_months_max: int | None = None
    preferred_regions: str | None = None
    tax_country: str | None = None
    tax_id: str | None = None
