from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


# --- Marketplace Deal (anonymized for investors) ---

class MarketplacePropertySummary(BaseModel):
    property_type: str
    city: str | None
    province: str | None
    estimated_value_usd: Decimal | None
    appraised_value_usd: Decimal | None
    lot_size_sqm: Decimal | None
    built_area_sqm: Decimal | None
    year_built: int | None
    image_urls: list[str] = []


class MarketplaceDealResponse(BaseModel):
    id: UUID
    application_number: str
    amount_requested: Decimal
    currency: str
    purpose: str
    purpose_description: str | None
    preferred_term_months: int
    max_interest_rate_monthly: Decimal | None
    preliminary_ltv: Decimal | None
    final_ltv: Decimal | None
    status: str
    property: MarketplacePropertySummary
    interest_count: int = 0
    my_interest: 'InvestorInterestResponse | None' = None
    created_at: datetime


class MarketplaceDealList(BaseModel):
    items: list[MarketplaceDealResponse]
    total: int
    page: int
    page_size: int


# --- Investor Interest ---

class InvestorInterestCreate(BaseModel):
    amount_willing: Decimal | None = None
    proposed_rate_monthly: Decimal | None = None
    message: str | None = None


class InvestorInterestResponse(BaseModel):
    id: UUID
    investor_id: UUID
    loan_application_id: UUID
    amount_willing: Decimal | None
    proposed_rate_monthly: Decimal | None
    message: str | None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class InvestorInterestWithDeal(InvestorInterestResponse):
    application_number: str | None = None
    amount_requested: Decimal | None = None
    property_type: str | None = None
    property_city: str | None = None


# --- Portfolio ---

class PortfolioSummary(BaseModel):
    total_invested: Decimal = Decimal("0")
    active_deals_count: int = 0
    total_interest_earned: Decimal = Decimal("0")
    avg_annual_return: Decimal = Decimal("0")
    interests_expressed: int = 0
    interests_committed: int = 0
