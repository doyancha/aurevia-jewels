"""Server-side Cloudinary boundary for ProductImage assets."""

import logging
import uuid
from pathlib import Path

import cloudinary
from cloudinary import uploader
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured, ValidationError

logger = logging.getLogger(__name__)

ALLOWED_FORMATS = frozenset({"jpg", "jpeg", "png", "webp", "avif"})
MAX_UPLOAD_SIZE = 10 * 1024 * 1024
PUBLIC_ID_PREFIX = "aurevia-jewels/products/"
LOCAL_MEDIA_PREFIX = "/media/admin-product/"


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
    if not upload_file or not getattr(upload_file, "size", 0):
        raise ValidationError("Product images cannot be empty.")
    if upload_file.size > MAX_UPLOAD_SIZE:
        raise ValidationError("Product images must be 10 MiB or smaller.")
    extension = (upload_file.name.rsplit(".", 1)[-1] if upload_file.name and "." in upload_file.name else "").lower()
    if extension not in ALLOWED_FORMATS:
        raise ValidationError("Upload a JPG, PNG, WebP, or AVIF image.")
    upload_file.seek(0)
    header = upload_file.read(32)
    upload_file.seek(0)
    signatures = {
        "jpg": header.startswith(b"\xff\xd8\xff"),
        "jpeg": header.startswith(b"\xff\xd8\xff"),
        "png": header.startswith(b"\x89PNG\r\n\x1a\n"),
        "webp": header.startswith(b"RIFF") and header[8:12] == b"WEBP",
        "avif": b"ftypavif" in header or b"ftypavis" in header,
    }
    if not signatures.get(extension, False):
        raise ValidationError("The uploaded file is not a valid image of its declared type.")
    return extension


def _local_root():
    return Path(settings.MEDIA_ROOT).resolve() / "admin-product"


def _local_path(source_path):
    if not source_path.startswith(LOCAL_MEDIA_PREFIX):
        return None
    relative = Path(source_path[len(LOCAL_MEDIA_PREFIX):])
    if relative.is_absolute() or ".." in relative.parts:
        return None
    root = _local_root()
    path = (root / relative).resolve()
    return path if path.parent == root / relative.parent and str(path).startswith(str(root)) else None


def _local_metadata(upload_file, product, extension):
    filename = f"{uuid.uuid4().hex}.{extension}"
    relative = Path(str(product.pk)) / filename
    root = _local_root()
    target = (root / relative).resolve()
    if not str(target).startswith(str(root)):
        raise ValidationError("The media destination is invalid.")
    target.parent.mkdir(parents=True, exist_ok=True)
    try:
        with target.open("xb") as destination:
            for chunk in upload_file.chunks():
                destination.write(chunk)
    except Exception:
        target.unlink(missing_ok=True)
        raise ValidationError("The image could not be saved.")
    return {"source_path": f"{LOCAL_MEDIA_PREFIX}{product.pk}/{filename}", "secure_url": "", "cloudinary_public_id": "", "width": None, "height": None}


def store_upload(upload_file, product):
    extension = validate_upload_file(upload_file)
    if getattr(settings, "CATALOG_MEDIA_BACKEND", "local") == "cloudinary":
        metadata = upload_image(upload_file)
        metadata["source_path"] = ""
        return metadata
    return _local_metadata(upload_file, product, extension)


def delete_stored_asset(image):
    if image.cloudinary_public_id:
        return destroy_remote_asset(image.cloudinary_public_id)
    path = _local_path(image.source_path)
    if path and path.exists():
        path.unlink()
    return True


def cleanup_stored_metadata(metadata):
    """Remove a newly stored asset when its database transaction cannot commit."""
    if metadata.get("cloudinary_public_id"):
        return destroy_remote_asset(metadata["cloudinary_public_id"])
    path = _local_path(metadata.get("source_path", ""))
    if path and path.exists():
        path.unlink()
    return True


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
