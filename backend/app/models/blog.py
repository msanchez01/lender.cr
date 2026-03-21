import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class PostStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=False)
    slug = Column(String(500), unique=True, nullable=False, index=True)
    content = Column(Text, nullable=False)
    excerpt = Column(String(1000))
    category = Column(String(100), index=True)
    tags = Column(String(500))
    featured_image = Column(String(1000))
    author = Column(String(255))
    seo_title = Column(String(200))
    seo_description = Column(String(500))
    status = Column(Enum(PostStatus), default=PostStatus.DRAFT, index=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
    view_count = Column(Integer, default=0)
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
