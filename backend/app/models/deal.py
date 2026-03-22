import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class DealStatus(str, enum.Enum):
    PENDING_LEGAL = "pending_legal"
    DOCUMENTS_SIGNED = "documents_signed"
    MORTGAGE_REGISTERED = "mortgage_registered"
    ACTIVE = "active"
    CURRENT = "current"
    LATE = "late"
    DEFAULT = "default"
    RESTRUCTURED = "restructured"
    PAID_OFF = "paid_off"
    FORECLOSURE = "foreclosure"
    SETTLED = "settled"


class PaymentStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    PENDING = "pending"
    PAID = "paid"
    LATE = "late"
    PARTIAL = "partial"
    MISSED = "missed"
    WAIVED = "waived"


class PaymentType(str, enum.Enum):
    INTEREST = "interest"
    PRINCIPAL = "principal"
    INTEREST_AND_PRINCIPAL = "interest_and_principal"
    LATE_FEE = "late_fee"
    PREPAYMENT = "prepayment"


class Deal(Base):
    __tablename__ = "deals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    deal_number = Column(String(20), unique=True, nullable=False)
    loan_application_id = Column(UUID(as_uuid=True), ForeignKey("loan_applications.id"))
    borrower_id = Column(UUID(as_uuid=True), ForeignKey("borrower_profiles.id"))
    investor_id = Column(UUID(as_uuid=True), ForeignKey("investor_profiles.id"))
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"))

    # Loan terms
    principal_amount = Column(Numeric(14, 2), nullable=False)
    currency = Column(String(3), default="USD")
    interest_rate_monthly = Column(Numeric(5, 2), nullable=False)
    investor_rate_monthly = Column(Numeric(5, 2), nullable=False)
    platform_spread_monthly = Column(Numeric(5, 2))
    term_months = Column(Integer, nullable=False)
    ltv_at_origination = Column(Numeric(5, 2), nullable=False)

    # Fees
    origination_fee_pct = Column(Numeric(5, 2), nullable=False)
    origination_fee_amount = Column(Numeric(12, 2), nullable=False)
    document_fee_amount = Column(Numeric(8, 2), default=500)
    servicing_fee_monthly_pct = Column(Numeric(5, 2), nullable=False)

    # Dates
    start_date = Column(Date, nullable=False)
    maturity_date = Column(Date, nullable=False)
    first_payment_date = Column(Date, nullable=False)

    # Status
    status = Column(Enum(DealStatus), default=DealStatus.PENDING_LEGAL, index=True)
    outstanding_principal = Column(Numeric(14, 2))
    total_interest_paid = Column(Numeric(14, 2), default=0)
    total_servicing_fees_collected = Column(Numeric(14, 2), default=0)
    days_past_due = Column(Integer, default=0)

    # Legal
    notario_name = Column(String(200))
    notario_contact = Column(String(200))
    mortgage_registry_number = Column(String(100))
    fideicomiso_number = Column(String(100))

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    payments = relationship("Payment", back_populates="deal", cascade="all, delete-orphan")
    loan_application = relationship("LoanApplication")
    property = relationship("Property")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    deal_id = Column(UUID(as_uuid=True), ForeignKey("deals.id", ondelete="CASCADE"))
    payment_number = Column(Integer, nullable=False)
    due_date = Column(Date, nullable=False)
    payment_type = Column(Enum(PaymentType), default=PaymentType.INTEREST)

    # Amounts
    amount_due = Column(Numeric(12, 2), nullable=False)
    interest_portion = Column(Numeric(12, 2))
    principal_portion = Column(Numeric(12, 2), default=0)
    servicing_fee_portion = Column(Numeric(12, 2))
    late_fee_portion = Column(Numeric(12, 2), default=0)

    # Payment details
    amount_paid = Column(Numeric(12, 2), default=0)
    paid_date = Column(Date)
    payment_method = Column(String(50))
    payment_reference = Column(String(100))

    # Disbursement
    investor_disbursement_amount = Column(Numeric(12, 2))
    investor_disbursement_date = Column(Date)
    platform_revenue_amount = Column(Numeric(12, 2))

    status = Column(Enum(PaymentStatus), default=PaymentStatus.SCHEDULED, index=True)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    deal = relationship("Deal", back_populates="payments")
