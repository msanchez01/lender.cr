import logging

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.email import send_password_reset_email, send_verification_email
from app.core.security import (
    create_access_token,
    create_email_token,
    create_refresh_token,
    decode_access_token,
    decode_email_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.models.user import BorrowerProfile, InvestorProfile, User, UserRole, UserStatus
from app.schemas.user import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    LoginResponse,
    MessageResponse,
    RefreshRequest,
    RegisterRequest,
    ResetPasswordRequest,
    UserResponse,
    UserUpdate,
)

logger = logging.getLogger(__name__)

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


async def verify_turnstile(token: str) -> bool:
    if not settings.TURNSTILE_SECRET_KEY:
        return True
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                data={"secret": settings.TURNSTILE_SECRET_KEY, "response": token},
            )
            return response.json().get("success", False)
    except Exception:
        logger.exception("Turnstile verification failed")
        return False


@router.post("/register", response_model=LoginResponse)
@limiter.limit("10/minute")
async def register(request: Request, data: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role,
        status=UserStatus.ACTIVE,
        first_name=data.first_name,
        last_name=data.last_name,
        preferred_language=data.preferred_language,
    )
    db.add(user)
    db.flush()

    if data.role == "borrower":
        db.add(BorrowerProfile(user_id=user.id))
    elif data.role == "investor":
        db.add(InvestorProfile(user_id=user.id))

    db.commit()
    db.refresh(user)

    # Send verification email
    token = create_email_token(user.email, "verify_email")
    send_verification_email(user.email, token, data.preferred_language)

    access_token = create_access_token({"sub": str(user.id), "role": user.role.value})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=LoginResponse)
@limiter.limit("10/minute")
async def login(request: Request, data: LoginRequest, db: Session = Depends(get_db)):
    if data.turnstile_token:
        is_valid = await verify_turnstile(data.turnstile_token)
        if not is_valid:
            raise HTTPException(status_code=400, detail="Verification failed.")

    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if user.status == UserStatus.SUSPENDED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been suspended.",
        )

    access_token = create_access_token({"sub": str(user.id), "role": user.role.value})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/refresh")
@limiter.limit("30/minute")
async def refresh(request: Request, data: RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_access_token(data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token.")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found.")

    access_token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)


@router.put("/me", response_model=UserResponse)
async def update_me(
    data: UserUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)


@router.post("/forgot-password", response_model=MessageResponse)
@limiter.limit("5/minute")
async def forgot_password(request: Request, data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if user:
        token = create_email_token(user.email, "reset_password")
        lang = user.preferred_language.value if user.preferred_language else "en"
        send_password_reset_email(user.email, token, lang)

    # Always return success to prevent email enumeration
    return MessageResponse(message="If an account with that email exists, a reset link has been sent.")


@router.post("/reset-password", response_model=MessageResponse)
@limiter.limit("5/minute")
async def reset_password(request: Request, data: ResetPasswordRequest, db: Session = Depends(get_db)):
    email = decode_email_token(data.token, "reset_password")
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")

    user.password_hash = hash_password(data.new_password)
    db.commit()

    return MessageResponse(message="Password has been reset successfully.")


@router.post("/verify-email", response_model=MessageResponse)
async def verify_email_endpoint(token: str, db: Session = Depends(get_db)):
    email = decode_email_token(token, "verify_email")
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token.")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token.")

    user.email_verified = True
    db.commit()

    return MessageResponse(message="Email verified successfully.")


@router.put("/change-password", response_model=MessageResponse)
async def change_password(
    data: ChangePasswordRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(data.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")

    user.password_hash = hash_password(data.new_password)
    db.commit()

    return MessageResponse(message="Password changed successfully.")
