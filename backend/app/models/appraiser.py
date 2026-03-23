import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class Appraiser(Base):
    __tablename__ = "appraisers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_name = Column(String(200), nullable=False)
    appraiser_name = Column(String(200), nullable=False)
    phone = Column(String(20))
    email = Column(String(255))
    license_number = Column(String(50))
    specialties = Column(Text)
    regions = Column(Text)
    is_active = Column(Boolean, default=True)
    notes = Column(Text)
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
