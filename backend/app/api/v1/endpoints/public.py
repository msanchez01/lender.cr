import logging

import httpx
from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings
from app.schemas.contact import ContactFormRequest, ContactFormResponse

logger = logging.getLogger(__name__)

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.get("/health")
def health():
    return {"status": "healthy"}


@router.get("/rates")
def rates():
    return {
        "tiers": [
            {"ltv_min": 0, "ltv_max": 30, "rate_min": 12, "rate_max": 13, "tier": "excellent"},
            {"ltv_min": 30, "ltv_max": 40, "rate_min": 13, "rate_max": 14, "tier": "good"},
            {"ltv_min": 40, "ltv_max": 50, "rate_min": 14, "rate_max": 16, "tier": "standard"},
        ],
        "max_ltv": 50,
        "origination_fee_percent": 4.5,
    }


async def verify_turnstile(token: str) -> bool:
    if not settings.TURNSTILE_SECRET_KEY:
        return True
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                data={
                    "secret": settings.TURNSTILE_SECRET_KEY,
                    "response": token,
                },
            )
            result = response.json()
            return result.get("success", False)
    except Exception:
        logger.exception("Turnstile verification failed")
        return False


@router.post("/contact", response_model=ContactFormResponse)
@limiter.limit("5/minute")
async def contact(request: Request, data: ContactFormRequest):
    # Verify Turnstile token if configured
    if settings.TURNSTILE_SECRET_KEY and data.turnstile_token:
        is_valid = await verify_turnstile(data.turnstile_token)
        if not is_valid:
            return ContactFormResponse(success=False, message="Verification failed.")

    # Send notification email via Resend
    if settings.RESEND_API_KEY:
        try:
            import resend

            resend.api_key = settings.RESEND_API_KEY
            resend.Emails.send(
                {
                    "from": settings.FROM_EMAIL,
                    "to": ["info@lender.cr"],
                    "subject": f"New Contact: {data.name} ({data.user_type})",
                    "html": (
                        f"<h2>New Contact Form Submission</h2>"
                        f"<p><strong>Name:</strong> {data.name}</p>"
                        f"<p><strong>Email:</strong> {data.email}</p>"
                        f"<p><strong>Phone:</strong> {data.phone or 'Not provided'}</p>"
                        f"<p><strong>Type:</strong> {data.user_type}</p>"
                        f"<p><strong>Message:</strong></p>"
                        f"<p>{data.message}</p>"
                    ),
                }
            )
        except Exception:
            logger.exception("Failed to send contact notification email")

    return ContactFormResponse(success=True, message="Message received. We'll be in touch within 24-48 hours.")
