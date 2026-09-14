"""Shared server-side checks for making a catalog product storefront-visible."""

from django.core.exceptions import ValidationError

from .models import Product, ProductImage


def _usable_media(image):
    if image.provenance_status == ProductImage.ProvenanceStatus.RETIRED:
        return False
    has_url = bool(image.secure_url and image.secure_url.startswith(("http://", "https://")))
    has_path = bool(image.source_path.strip().startswith("/"))
    return (has_url or has_path) and bool(image.alt_text.strip())


def get_publish_readiness_errors(product, overrides=None):
    """Return owner-readable errors for a product being changed to published."""
    overrides = overrides or {}
    value = lambda name: overrides.get(name, getattr(product, name, None))
    errors = []
    if not str(value("product_code") or "").strip():
        errors.append("Add a product code before publishing.")
    if not str(value("name") or "").strip():
        errors.append("Add a product name before publishing.")
    if not str(value("slug") or "").strip():
        errors.append("Add a product slug before publishing.")
    category = value("category")
    if category is None:
        errors.append("Choose a category before publishing.")
    elif not category.is_active:
        errors.append("A published product must use an active category.")
    price = value("price")
    if price is None:
        errors.append("Add a price before publishing.")
    elif price < 0:
        errors.append("Price cannot be negative.")
    if value("availability_status") not in {choice for choice, _label in Product.AvailabilityStatus.choices}:
        errors.append("Choose a valid availability status before publishing.")
    for field, label in (("short_description", "short description"), ("description", "description")):
        if not str(value(field) or "").strip():
            errors.append(f"Add a {label} before publishing.")

    images = list(product.images.all()) if product.pk else []
    if not images:
        errors.append("Add at least one valid product image before publishing.")
    else:
        primaries = [image for image in images if image.is_primary]
        if len(primaries) != 1:
            errors.append("A published product must have exactly one primary image.")
        elif not _usable_media(primaries[0]):
            errors.append("The primary image must have usable media and alt text before publishing.")
    return errors


def validate_product_publish_ready(product, overrides=None):
    errors = get_publish_readiness_errors(product, overrides=overrides)
    if errors:
        raise ValidationError(errors)
    return product
