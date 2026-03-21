import re
import unicodedata
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.auth import require_api_key
from app.core.database import get_db
from app.models.blog import BlogPost, PostStatus
from app.schemas.blog import (
    BlogPostCreate,
    BlogPostList,
    BlogPostUpdate,
    BlogPost as BlogPostSchema,
)

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = text.strip("-")
    return re.sub(r"-+", "-", text)


# --- Public endpoints ---


@router.get("/", response_model=BlogPostList)
@limiter.limit("60/minute")
def list_posts(
    request: Request,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    category: str | None = None,
    search: str | None = None,
    sort_by: str = Query("published_at", pattern="^(published_at|view_count)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    query = db.query(BlogPost).filter(BlogPost.status == PostStatus.PUBLISHED)

    if category:
        query = query.filter(BlogPost.category == category)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                BlogPost.title.ilike(search_term),
                BlogPost.content.ilike(search_term),
                BlogPost.excerpt.ilike(search_term),
            )
        )

    total = query.count()

    sort_col = getattr(BlogPost, sort_by)
    if sort_order == "desc":
        query = query.order_by(sort_col.desc().nullslast())
    else:
        query = query.order_by(sort_col.asc().nullsfirst())

    posts = query.offset((page - 1) * page_size).limit(page_size).all()

    return BlogPostList(
        items=[BlogPostSchema.model_validate(p) for p in posts],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{slug}", response_model=BlogPostSchema)
@limiter.limit("60/minute")
def get_post(request: Request, slug: str, db: Session = Depends(get_db)):
    post = (
        db.query(BlogPost)
        .filter(BlogPost.slug == slug, BlogPost.status == PostStatus.PUBLISHED)
        .first()
    )
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found.")
    return BlogPostSchema.model_validate(post)


@router.post("/{slug}/view")
@limiter.limit("30/minute")
def increment_view(request: Request, slug: str, db: Session = Depends(get_db)):
    post = db.query(BlogPost).filter(BlogPost.slug == slug).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found.")
    post.view_count = (post.view_count or 0) + 1
    db.commit()
    return {"view_count": post.view_count}


# --- Admin endpoints (require API key) ---


@router.get("/admin/all", response_model=BlogPostList)
def list_all_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    status: str | None = None,
    category: str | None = None,
    search: str | None = None,
    sort_by: str = Query("created_at", pattern="^(published_at|created_at|view_count|title)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    query = db.query(BlogPost)

    if status:
        query = query.filter(BlogPost.status == status)
    if category:
        query = query.filter(BlogPost.category == category)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(BlogPost.title.ilike(search_term), BlogPost.content.ilike(search_term))
        )

    total = query.count()

    sort_col = getattr(BlogPost, sort_by)
    if sort_order == "desc":
        query = query.order_by(sort_col.desc().nullslast())
    else:
        query = query.order_by(sort_col.asc().nullsfirst())

    posts = query.offset((page - 1) * page_size).limit(page_size).all()

    return BlogPostList(
        items=[BlogPostSchema.model_validate(p) for p in posts],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/admin/categories")
def list_categories(
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    categories = (
        db.query(BlogPost.category)
        .filter(BlogPost.category.isnot(None))
        .distinct()
        .all()
    )
    return [c[0] for c in categories]


@router.get("/admin/{post_id}", response_model=BlogPostSchema)
def get_post_by_id(
    post_id: str,
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found.")
    return BlogPostSchema.model_validate(post)


@router.post("/", response_model=BlogPostSchema)
def create_post(
    data: BlogPostCreate,
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    slug = data.slug or slugify(data.title)

    existing = db.query(BlogPost).filter(BlogPost.slug == slug).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"Slug '{slug}' already exists.")

    post = BlogPost(
        title=data.title,
        slug=slug,
        content=data.content,
        excerpt=data.excerpt,
        category=data.category,
        tags=data.tags,
        featured_image=data.featured_image,
        author=data.author,
        seo_title=data.seo_title,
        seo_description=data.seo_description,
        status=data.status,
        published_at=datetime.now(timezone.utc) if data.status == "published" else None,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return BlogPostSchema.model_validate(post)


@router.put("/{post_id}", response_model=BlogPostSchema)
def update_post(
    post_id: str,
    data: BlogPostUpdate,
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found.")

    update_data = data.model_dump(exclude_unset=True)

    if "slug" in update_data and update_data["slug"] != post.slug:
        existing = db.query(BlogPost).filter(BlogPost.slug == update_data["slug"]).first()
        if existing:
            raise HTTPException(status_code=409, detail=f"Slug '{update_data['slug']}' already exists.")

    if "status" in update_data:
        if update_data["status"] == "published" and post.status != PostStatus.PUBLISHED:
            post.published_at = datetime.now(timezone.utc)

    for key, value in update_data.items():
        setattr(post, key, value)

    db.commit()
    db.refresh(post)
    return BlogPostSchema.model_validate(post)


@router.delete("/{post_id}")
def delete_post(
    post_id: str,
    db: Session = Depends(get_db),
    _api_key: str = Depends(require_api_key),
):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found.")
    db.delete(post)
    db.commit()
    return {"success": True}
