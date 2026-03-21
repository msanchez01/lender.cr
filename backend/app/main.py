from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import Base, engine

limiter = Limiter(key_func=get_remote_address)


def seed_admin_user():
    """Create admin user on startup if configured and doesn't exist."""
    if not settings.ADMIN_USER_EMAIL or not settings.ADMIN_USER_PASSWORD:
        return

    from app.core.database import SessionLocal
    from app.core.security import hash_password
    from app.models.user import User, UserRole, UserStatus

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == settings.ADMIN_USER_EMAIL).first()
        if not existing:
            admin = User(
                email=settings.ADMIN_USER_EMAIL,
                password_hash=hash_password(settings.ADMIN_USER_PASSWORD),
                role=UserRole.ADMIN,
                status=UserStatus.ACTIVE,
                first_name="Admin",
                last_name="User",
                email_verified=True,
            )
            db.add(admin)
            db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_admin_user()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
)
app.state.limiter = limiter

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trust proxy headers (nginx / load balancer)
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts=["*"])


# Rate limit error handler
@app.exception_handler(RateLimitExceeded)
async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded. Please try again later."},
    )


# API routes
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "version": settings.VERSION,
    }


@app.get("/health")
def health():
    return {"status": "healthy"}
