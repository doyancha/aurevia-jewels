"""Server-side Cloudinary boundary for ProductImage assets."""

import logging
import uuid

import cloudinary
from cloudinary import uploader
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured, ValidationError

logger = logging.getLogger(__name__)

ALLOWED_FORMATS = frozenset({"jpg", "jpeg", "png", "webp", "avif"})
MAX_UPLOAD_SIZE = 10 * 1024 * 1024
PUBLIC_ID_PREFIX = "aurevia-jewels/products/"


def ensure_configured():
    values = (
        settings.CLOUDINARY_CLOUD_NAME,
        settings.CLOUDINARY_API_KEY,
        settings.CLOUDINARY_API_SECRET,
    )
    if not all(values):
        raise ImproperlyConfigured("Cloudinary media configuration is unavailable.")
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )


def generate_public_id():
    return f"{PUBLIC_ID_PREFIX}{uuid.uuid4().hex}"


def validate_upload_file(upload_file):
    if upload_file.size > MAX_UPLOAD_SIZE:
        raise ValidationError("Product images must be 10 MiB or smaller.")
    extension = (upload_file.name.rsplit(".", 1)[-1] if upload_file.name and "." in upload_file.name else "").lower()
    if extension not in ALLOWED_FORMATS:
        raise ValidationError("Upload a JPG, PNG, WebP, or AVIF image.")


def _validated_response(response, expected_public_id):
    public_id = response.get("public_id")
    secure_url = response.get("secure_url")
    resource_type = response.get("resource_type")
    width = response.get("width")
    height = response.get("height")
    image_format = str(response.get("format") or "").lower()
    if (
        public_id != expected_public_id
        or resource_type != "image"
        or not isinstance(secure_url, str)
        or not secure_url.startswith("https://")
        or not isinstance(width, int)
        or width <= 0
        or not isinstance(height, int)
        or height <= 0
        or image_format not in ALLOWED_FORMATS
    ):
        raise ValueError("Cloudinary returned invalid image metadata.")
    return {
        "cloudinary_public_id": public_id,
        "secure_url": secure_url,
        "width": width,
        "height": height,
    }


def upload_image(upload_file):
    validate_upload_file(upload_file)
    ensure_configured()
    public_id = generate_public_id()
    try:
        response = uploader.upload(
            upload_file,
            public_id=public_id,
            resource_type="image",
            overwrite=False,
            secure=True,
            allowed_formats=sorted(ALLOWED_FORMATS),
        )
        try:
            return _validated_response(response, public_id)
        except Exception:
            destroy_remote_asset(public_id)
            raise ValidationError("Cloudinary returned unusable image metadata.")
    except ValidationError:
        raise
    except Exception as exc:
        logger.warning("Cloudinary upload failed (%s).", exc.__class__.__name__)
        raise ValidationError("Cloudinary image upload failed. No image was saved.") from exc


def destroy_remote_asset(public_id):
    if not public_id:
        return True
    try:
        ensure_configured()
        response = uploader.destroy(public_id, resource_type="image", invalidate=True)
        result = response.get("result") if isinstance(response, dict) else None
        if result in {"ok", "not found"}:
            return True
        logger.warning("Cloudinary destroy returned an unexpected result for %s.", public_id)
        return False
    except Exception as exc:
        logger.warning("Cloudinary destroy failed for %s (%s).", public_id, exc.__class__.__name__)
        return False
