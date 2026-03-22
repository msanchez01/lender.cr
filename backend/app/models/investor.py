import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Numeric, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class InterestStatus(str, enum.Enum):
    EXPRESSED = "expressed"
    REVIEWING = "reviewing"
    COMMITTED = "committed"
    WITHDRAWN = "withdrawn"
    DECLINED = "declined"


class InvestorInterest(Base):
    __tablename__ = "investor_interests"
    __table_args__ = (
        UniqueConstraint("investor_id", "loan_application_id", name="uq_investor_application"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    investor_id = Column(UUID(as_uuid=True), ForeignKey("investor_profiles.id"), nullable=False)
    loan_application_id = Column(UUID(as_uuid=True), ForeignKey("loan_applications.id"), nullable=False)
    amount_willing = Column(Numeric(14, 2))
    proposed_rate_monthly = Column(Numeric(5, 2))
    message = Column(Text)
    status = Column(Enum(InterestStatus), default=InterestStatus.EXPRESSED, index=True)
    responded_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    investor_profile = relationship("InvestorProfile")
    loan_application = relationship("LoanApplication")
