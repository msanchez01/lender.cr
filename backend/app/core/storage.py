import logging
import uuid
from io import BytesIO

import boto3
from botocore.config import Config as BotoConfig

from app.core.config import settings

logger = logging.getLogger(__name__)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_DOCUMENT_TYPES = {"application/pdf", "image/jpeg", "image/png"}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB
MAX_DOCUMENT_SIZE = 10 * 1024 * 1024  # 10 MB


def _get_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.R2_ENDPOINT_URL,
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        config=BotoConfig(signature_version="s3v4"),
    )


def is_configured() -> bool:
    return bool(settings.R2_ACCESS_KEY_ID and settings.R2_SECRET_ACCESS_KEY and settings.R2_ENDPOINT_URL)


def upload_file(
    file_data: bytes,
    original_filename: str,
    content_type: str,
    prefix: str = "",
) -> str:
    """Upload file to R2 and return the public URL."""
    if not is_configured():
        raise RuntimeError("R2 storage is not configured.")

    ext = original_filename.rsplit(".", 1)[-1].lower() if "." in original_filename else "bin"
    key = f"{prefix}{uuid.uuid4()}.{ext}"

    client = _get_s3_client()
    client.upload_fileobj(
        BytesIO(file_data),
        settings.R2_BUCKET_NAME,
        key,
        ExtraArgs={"ContentType": content_type},
    )

    if settings.R2_PUBLIC_URL:
        return f"{settings.R2_PUBLIC_URL.rstrip('/')}/{key}"
    return f"https://{settings.R2_BUCKET_NAME}.r2.dev/{key}"


def delete_file(file_url: str) -> bool:
    """Delete file from R2 by its public URL."""
    if not is_configured():
        return False

    try:
        # Extract key from URL
        if settings.R2_PUBLIC_URL and file_url.startswith(settings.R2_PUBLIC_URL):
            key = file_url[len(settings.R2_PUBLIC_URL.rstrip("/")) + 1:]
        else:
            key = file_url.split("/", 3)[-1] if "/" in file_url else file_url

        client = _get_s3_client()
        client.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=key)
        return True
    except Exception:
        logger.exception("Failed to delete file from R2: %s", file_url)
        return False


def validate_image(content_type: str, size: int) -> str | None:
    """Validate image file. Returns error message or None if valid."""
    if content_type not in ALLOWED_IMAGE_TYPES:
        return f"Invalid image type: {content_type}. Allowed: JPEG, PNG, WebP."
    if size > MAX_IMAGE_SIZE:
        return f"Image too large: {size / 1024 / 1024:.1f}MB. Maximum: {MAX_IMAGE_SIZE / 1024 / 1024:.0f}MB."
    return None


def validate_document(content_type: str, size: int) -> str | None:
    """Validate document file. Returns error message or None if valid."""
    if content_type not in ALLOWED_DOCUMENT_TYPES:
        return f"Invalid document type: {content_type}. Allowed: PDF, JPEG, PNG."
    if size > MAX_DOCUMENT_SIZE:
        return f"Document too large: {size / 1024 / 1024:.1f}MB. Maximum: {MAX_DOCUMENT_SIZE / 1024 / 1024:.0f}MB."
    return None
