from fastapi import APIRouter

from app.api.v1.endpoints import admin, auth, blog, borrower, deals, investor, public

api_router = APIRouter()
api_router.include_router(public.router, prefix="/public", tags=["public"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(blog.router, prefix="/blog", tags=["blog"])
api_router.include_router(borrower.router, prefix="/borrower", tags=["borrower"])
api_router.include_router(investor.router, prefix="/investor", tags=["investor"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(deals.router, tags=["deals"])
