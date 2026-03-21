from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class ContactFormRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    phone: str | None = None
    message: str = Field(..., min_length=1, max_length=5000)
    user_type: Literal["borrower", "investor", "partner", "other"]
    turnstile_token: str | None = None


class ContactFormResponse(BaseModel):
    success: bool
    message: str
