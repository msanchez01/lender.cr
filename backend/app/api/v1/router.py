from fastapi import APIRouter

from app.api.v1.endpoints import blog, public

api_router = APIRouter()
api_router.include_router(public.router, prefix="/public", tags=["public"])
api_router.include_router(blog.router, prefix="/blog", tags=["blog"])
