import enum
import uuid
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import (
    Boolean,
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


class PropertyType(str, enum.Enum):
    HOUSE = "house"
    APARTMENT = "apartment"
    LOT = "lot"
    COMMERCIAL = "commercial"
    FARM = "farm"
    MIXED = "mixed"


class LoanPurpose(str, enum.Enum):
    PROPERTY_PURCHASE = "property_purchase"
    BRIDGE_FINANCING = "bridge_financing"
    CONSTRUCTION = "construction"
    BUSINESS_CAPITAL = "business_capital"
    DEBT_CONSOLIDATION = "debt_consolidation"
    RENOVATION = "renovation"
    OTHER = "other"


class ApplicationStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPRAISAL_ORDERED = "appraisal_ordered"
    APPRAISAL_COMPLETE = "appraisal_complete"
    APPROVED = "approved"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"
    MATCHING = "matching"
    FUNDED = "funded"
    EXPIRED = "expired"


class Currency(str, enum.Enum):
    USD = "USD"
    CRC = "CRC"


class AppraisalStatus(str, enum.Enum):
    ORDERED = "ordered"
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    DISPUTED = "disputed"


class Property(Base):
    __tablename__ = "properties"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    borrower_id = Column(UUID(as_uuid=True), ForeignKey("borrower_profiles.id"))
    ticaluxury_property_id = Column(UUID(as_uuid=True), nullable=True)
    property_type = Column(Enum(PropertyType), nullable=False)
    address = Column(Text, nullable=False)
    city = Column(String(100))
    province = Column(String(100))
    gps_latitude = Column(Numeric(10, 8))
    gps_longitude = Column(Numeric(11, 8))
    lot_size_sqm = Column(Numeric(10, 2))
    built_area_sqm = Column(Numeric(10, 2))
    year_built = Column(Integer)
    folio_real = Column(String(50))
    plano_catastrado = Column(String(50))
    estimated_value_usd = Column(Numeric(14, 2))
    appraised_value_usd = Column(Numeric(14, 2))
    existing_liens_usd = Column(Numeric(14, 2), default=0)
    net_equity_usd = Column(Numeric(14, 2))
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    images = relationship("PropertyImage", back_populates="property", cascade="all, delete-orphan")
    documents = relationship("PropertyDocument", back_populates="property", cascade="all, delete-orphan")
    loan_applications = relationship("LoanApplication", back_populates="property")


class PropertyImage(Base):
    __tablename__ = "property_images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id", ondelete="CASCADE"))
    image_url = Column(String(500), nullable=False)
    is_primary = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    property = relationship("Property", back_populates="images")


class PropertyDocument(Base):
    __tablename__ = "property_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id", ondelete="CASCADE"))
    document_type = Column(String(50), nullable=False)
    file_url = Column(String(500), nullable=False)
    file_name = Column(String(255))
    file_size_bytes = Column(Integer)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    is_verified = Column(Boolean, default=False)
    verified_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    property = relationship("Property", back_populates="documents")


class LoanApplication(Base):
    __tablename__ = "loan_applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_number = Column(String(20), unique=True, nullable=False)
    borrower_id = Column(UUID(as_uuid=True), ForeignKey("borrower_profiles.id"))
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"))
    amount_requested = Column(Numeric(14, 2), nullable=False)
    currency = Column(Enum(Currency), default=Currency.USD)
    purpose = Column(Enum(LoanPurpose), nullable=False)
    purpose_description = Column(Text)
    preferred_term_months = Column(Integer, nullable=False)
    max_interest_rate_monthly = Column(Numeric(5, 2))
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.DRAFT, index=True)
    preliminary_ltv = Column(Numeric(5, 2))
    final_ltv = Column(Numeric(5, 2))
    admin_notes = Column(Text)
    rejection_reason = Column(Text)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    funded_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    property = relationship("Property", back_populates="loan_applications")
    appraisals = relationship("Appraisal", back_populates="loan_application")


class Appraisal(Base):
    __tablename__ = "appraisals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"))
    loan_application_id = Column(UUID(as_uuid=True), ForeignKey("loan_applications.id"))
    appraiser_name = Column(String(200))
    appraiser_company = Column(String(200))
    appraiser_license = Column(String(50))
    appraised_value_usd = Column(Numeric(14, 2))
    appraisal_date = Column(Date)
    report_url = Column(String(500))
    status = Column(Enum(AppraisalStatus), default=AppraisalStatus.ORDERED)
    notes = Column(Text)
    cost_usd = Column(Numeric(8, 2))
    paid_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    loan_application = relationship("LoanApplication", back_populates="appraisals")
