import enum
import uuid
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    Column,
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


class UserRole(str, enum.Enum):
    BORROWER = "borrower"
    INVESTOR = "investor"
    ADMIN = "admin"
    PARTNER = "partner"


class UserStatus(str, enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    SUSPENDED = "suspended"


class LanguagePreference(str, enum.Enum):
    EN = "en"
    ES = "es"


class BorrowerType(str, enum.Enum):
    INDIVIDUAL = "individual"
    COMPANY = "company"


class IdDocumentType(str, enum.Enum):
    CEDULA = "cedula"
    PASSPORT = "passport"
    DIMEX = "dimex"
    NITE = "nite"


class AccreditationStatus(str, enum.Enum):
    SELF_CERTIFIED = "self_certified"
    VERIFIED = "verified"
    INSTITUTIONAL = "institutional"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    status = Column(Enum(UserStatus), default=UserStatus.PENDING)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20))
    whatsapp = Column(String(20))
    preferred_language = Column(
        Enum(LanguagePreference), default=LanguagePreference.ES
    )
    email_verified = Column(Boolean, default=False)
    kyc_verified = Column(Boolean, default=False)
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    borrower_profile = relationship(
        "BorrowerProfile", back_populates="user", uselist=False
    )
    investor_profile = relationship(
        "InvestorProfile", back_populates="user", uselist=False
    )


class BorrowerProfile(Base):
    __tablename__ = "borrower_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True
    )
    borrower_type = Column(Enum(BorrowerType), default=BorrowerType.INDIVIDUAL)
    id_document_type = Column(Enum(IdDocumentType), nullable=True)
    id_document_number = Column(String(50))
    nationality = Column(String(50))
    residency_status = Column(String(50))
    company_name = Column(String(200))
    company_cedula = Column(String(50))
    address = Column(Text)
    city = Column(String(100))
    province = Column(String(100))
    notes = Column(Text)
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="borrower_profile")


class InvestorProfile(Base):
    __tablename__ = "investor_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True
    )
    accreditation_status = Column(
        Enum(AccreditationStatus), default=AccreditationStatus.SELF_CERTIFIED
    )
    min_investment_usd = Column(Numeric(12, 2))
    max_investment_usd = Column(Numeric(12, 2))
    total_available_capital_usd = Column(Numeric(14, 2))
    preferred_ltv_max = Column(Numeric(5, 2))
    preferred_term_months_min = Column(Integer)
    preferred_term_months_max = Column(Integer)
    preferred_regions = Column(Text)  # comma-separated
    tax_country = Column(String(50))
    tax_id = Column(String(50))
    notes = Column(Text)
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="investor_profile")
