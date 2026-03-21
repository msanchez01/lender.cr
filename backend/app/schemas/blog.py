from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class BlogPostBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    slug: str = Field(..., min_length=1, max_length=500)
    content: str = Field(..., min_length=1)
    excerpt: str | None = None
    category: str | None = None
    tags: str | None = None
    featured_image: str | None = None
    author: str | None = None
    seo_title: str | None = None
    seo_description: str | None = None


class BlogPostCreate(BlogPostBase):
    status: str = "draft"


class BlogPostUpdate(BaseModel):
    title: str | None = None
    slug: str | None = None
    content: str | None = None
    excerpt: str | None = None
    category: str | None = None
    tags: str | None = None
    featured_image: str | None = None
    author: str | None = None
    seo_title: str | None = None
    seo_description: str | None = None
    status: str | None = None


class BlogPost(BlogPostBase):
    id: UUID
    status: str
    view_count: int
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BlogPostList(BaseModel):
    items: list[BlogPost]
    total: int
    page: int
    page_size: int
