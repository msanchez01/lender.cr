import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


def send_verification_email(email: str, token: str, language: str = "en") -> bool:
    if not settings.RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not configured — skipping verification email")
        return False

    site_url = settings.SITE_URL
    verify_url = f"{site_url}/{language}/auth/verify-email?token={token}"

    subject = (
        "Verify your email — Lender.cr"
        if language == "en"
        else "Verifique su correo — Lender.cr"
    )
    body = (
        f"<h2>Welcome to Lender.cr!</h2>"
        f"<p>Please verify your email address by clicking the link below:</p>"
        f'<p><a href="{verify_url}">Verify Email</a></p>'
        f"<p>This link expires in 24 hours.</p>"
        if language == "en"
        else f"<h2>¡Bienvenido a Lender.cr!</h2>"
        f"<p>Por favor verifique su correo electrónico haciendo clic en el siguiente enlace:</p>"
        f'<p><a href="{verify_url}">Verificar Correo</a></p>'
        f"<p>Este enlace expira en 24 horas.</p>"
    )

    try:
        import resend

        resend.api_key = settings.RESEND_API_KEY
        resend.Emails.send(
            {"from": settings.FROM_EMAIL, "to": [email], "subject": subject, "html": body}
        )
        return True
    except Exception:
        logger.exception("Failed to send verification email")
        return False


def send_password_reset_email(email: str, token: str, language: str = "en") -> bool:
    if not settings.RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not configured — skipping reset email")
        return False

    site_url = settings.SITE_URL
    reset_url = f"{site_url}/{language}/auth/reset-password?token={token}"

    subject = (
        "Reset your password — Lender.cr"
        if language == "en"
        else "Restablecer contraseña — Lender.cr"
    )
    body = (
        f"<h2>Password Reset</h2>"
        f"<p>Click the link below to reset your password:</p>"
        f'<p><a href="{reset_url}">Reset Password</a></p>'
        f"<p>This link expires in 24 hours. If you didn't request this, ignore this email.</p>"
        if language == "en"
        else f"<h2>Restablecer Contraseña</h2>"
        f"<p>Haga clic en el siguiente enlace para restablecer su contraseña:</p>"
        f'<p><a href="{reset_url}">Restablecer Contraseña</a></p>'
        f"<p>Este enlace expira en 24 horas. Si no solicitó esto, ignore este correo.</p>"
    )

    try:
        import resend

        resend.api_key = settings.RESEND_API_KEY
        resend.Emails.send(
            {"from": settings.FROM_EMAIL, "to": [email], "subject": subject, "html": body}
        )
        return True
    except Exception:
        logger.exception("Failed to send password reset email")
        return False
