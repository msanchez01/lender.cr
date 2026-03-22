from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class DealCreate(BaseModel):
    loan_application_id: UUID
    investor_interest_id: UUID
    interest_rate_monthly: Decimal = Field(..., description="Borrower rate (monthly %)")
    investor_rate_monthly: Decimal = Field(..., description="Investor rate (monthly %)")
    origination_fee_pct: Decimal = Field(default=Decimal("4.5"))
    document_fee_amount: Decimal = Field(default=Decimal("500"))
    servicing_fee_monthly_pct: Decimal = Field(default=Decimal("0.5"))
    start_date: date
    notario_name: str | None = None
    notario_contact: str | None = None


class DealUpdate(BaseModel):
    status: str | None = None
    notario_name: str | None = None
    notario_contact: str | None = None
    mortgage_registry_number: str | None = None
    fideicomiso_number: str | None = None


class PaymentResponse(BaseModel):
    id: UUID
    deal_id: UUID
    payment_number: int
    due_date: date
    payment_type: str
    amount_due: Decimal
    interest_portion: Decimal | None
    principal_portion: Decimal | None
    servicing_fee_portion: Decimal | None
    late_fee_portion: Decimal | None
    amount_paid: Decimal | None
    paid_date: date | None
    payment_method: str | None
    payment_reference: str | None
    investor_disbursement_amount: Decimal | None
    investor_disbursement_date: date | None
    platform_revenue_amount: Decimal | None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class DealResponse(BaseModel):
    id: UUID
    deal_number: str
    loan_application_id: UUID
    borrower_id: UUID
    investor_id: UUID
    property_id: UUID
    principal_amount: Decimal
    currency: str
    interest_rate_monthly: Decimal
    investor_rate_monthly: Decimal
    platform_spread_monthly: Decimal | None
    term_months: int
    ltv_at_origination: Decimal
    origination_fee_pct: Decimal
    origination_fee_amount: Decimal
    document_fee_amount: Decimal | None
    servicing_fee_monthly_pct: Decimal
    start_date: date
    maturity_date: date
    first_payment_date: date
    status: str
    outstanding_principal: Decimal | None
    total_interest_paid: Decimal | None
    total_servicing_fees_collected: Decimal | None
    days_past_due: int | None
    notario_name: str | None
    notario_contact: str | None
    mortgage_registry_number: str | None
    fideicomiso_number: str | None
    payments: list[PaymentResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True


class DealListItem(BaseModel):
    id: UUID
    deal_number: str
    principal_amount: Decimal
    currency: str
    interest_rate_monthly: Decimal
    term_months: int
    status: str
    start_date: date
    maturity_date: date
    outstanding_principal: Decimal | None
    days_past_due: int | None
    created_at: datetime

    class Config:
        from_attributes = True


class DealList(BaseModel):
    items: list[DealListItem]
    total: int


class PaymentUpdate(BaseModel):
    status: str | None = None
    amount_paid: Decimal | None = None
    paid_date: date | None = None
    payment_method: str | None = None
    payment_reference: str | None = None
    investor_disbursement_amount: Decimal | None = None
    investor_disbursement_date: date | None = None
    platform_revenue_amount: Decimal | None = None
    notes: str | None = None
