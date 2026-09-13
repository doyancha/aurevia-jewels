"""Validation-only boundary for owner-approved Phase 16 catalog packages."""

from __future__ import annotations

import csv
import hashlib
import re
import struct
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from pathlib import Path

from .media import ALLOWED_FORMATS, MAX_UPLOAD_SIZE
from .models import Product

PRODUCT_COLUMNS = (
    "product_code", "name", "slug", "category", "collections", "price",
    "compare_at_price", "currency_code", "availability", "featured",
    "new_arrival", "best_seller", "published", "short_description",
    "description", "long_description", "material", "color", "finish",
    "dimensions", "occasions", "tags", "badges", "seo_title", "seo_description",
)
REQUIRED_COLUMNS = {
    "product_code", "name", "slug", "category", "price", "availability",
    "published", "short_description", "description", "material", "color", "finish",
}
MEDIA_COLUMNS = ("product_code", "local_filename", "alt_text", "sort_order", "is_primary", "source_classification")
TRUE_VALUES = {"true", "1", "yes"}
FALSE_VALUES = {"false", "0", "no"}
SAFE_NAME = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*$")


@dataclass(frozen=True)
class CatalogPackage:
    products: list[dict]
    media: list[dict]


def _read_csv(path: Path) -> tuple[list[str], list[dict]]:
    if not path.is_file():
        raise ValueError(f"missing required file: {path.name}")
    with path.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        if not reader.fieldnames:
            raise ValueError(f"{path.name} has no header")
        return [field.strip() for field in reader.fieldnames], [dict(row) for row in reader]


def load_package(root: Path) -> CatalogPackage:
    columns, products = _read_csv(root / "products.csv")
    missing = sorted(REQUIRED_COLUMNS - set(columns))
    unsupported = sorted(set(columns) - set(PRODUCT_COLUMNS))
    errors = []
    if missing:
        errors.append(f"products.csv missing required columns: {', '.join(missing)}")
    if unsupported:
        errors.append(f"products.csv unsupported columns: {', '.join(unsupported)}")
    media_path = root / "images.csv"
    if media_path.exists():
        media_columns, media_rows = _read_csv(media_path)
        media_missing = sorted(set(MEDIA_COLUMNS) - set(media_columns))
        media_unsupported = sorted(set(media_columns) - set(MEDIA_COLUMNS))
        if media_missing:
            errors.append(f"images.csv missing required columns: {', '.join(media_missing)}")
        if media_unsupported:
            errors.append(f"images.csv unsupported columns: {', '.join(media_unsupported)}")
    else:
        media_rows = []
        images_root = root / "images"
        if not images_root.is_dir():
            errors.append("missing required images/ directory")
        else:
            for product_dir in sorted(images_root.iterdir()):
                if product_dir.is_dir():
                    for image in sorted(product_dir.iterdir()):
                        media_rows.append({
                            "product_code": product_dir.name,
                            "local_filename": str(Path("images") / product_dir.name / image.name),
                            "alt_text": "", "sort_order": image.stem.split("-", 1)[0],
                            "is_primary": "true" if image == sorted(product_dir.iterdir())[0] else "false",
                            "source_classification": "verified_product",
                        })
    if errors:
        raise ValueError("; ".join(errors))
    return CatalogPackage(products, media_rows)


def _boolean(value: str, field: str, row: int, errors: list[str]) -> bool | None:
    normalized = (value or "").strip().lower()
    if normalized in TRUE_VALUES:
        return True
    if normalized in FALSE_VALUES:
        return False
    errors.append(f"row {row}: invalid boolean for {field}")
    return None


def _dimensions(path: Path) -> tuple[int, int] | None:
    data = path.read_bytes()
    if data.startswith(b"\x89PNG\r\n\x1a\n") and len(data) >= 24:
        return struct.unpack(">II", data[16:24])
    if data.startswith(b"RIFF") and data[8:12] == b"WEBP" and data[12:16] == b"VP8X" and len(data) >= 30:
        return (1 + int.from_bytes(data[24:27], "little"), 1 + int.from_bytes(data[27:30], "little"))
    if data.startswith(b"\xff\xd8"):
        index = 2
        while index + 9 < len(data):
            if data[index] != 0xFF:
                index += 1
                continue
            marker = data[index + 1]
            index += 2
            if marker in {0xD8, 0xD9}:
                continue
            if index + 2 > len(data):
                break
            size = int.from_bytes(data[index:index + 2], "big")
            if marker in set(range(0xC0, 0xC4)) | set(range(0xC5, 0xC8)) | set(range(0xC9, 0xCC)) | set(range(0xCD, 0xD0)):
                return (int.from_bytes(data[index + 5:index + 7], "big"), int.from_bytes(data[index + 3:index + 5], "big"))
            index += size
    return None


def validate_package(package: CatalogPackage, root: Path, *, known_categories=None, known_collections=None) -> dict:
    errors: list[str] = []
    warnings: list[str] = []
    products_by_code = {}
    slugs = set()
    for row_number, product in enumerate(package.products, 2):
        code = (product.get("product_code") or "").strip()
        slug = (product.get("slug") or "").strip()
        if not code or code in products_by_code:
            errors.append(f"row {row_number}: duplicate or missing product_code")
        products_by_code[code] = product
        if not slug or slug in slugs:
            errors.append(f"row {row_number}: duplicate or missing slug")
        slugs.add(slug)
        for field in REQUIRED_COLUMNS - {"product_code", "slug", "published"}:
            if not (product.get(field) or "").strip():
                errors.append(f"row {row_number}: missing required field {field}")
        if known_categories is not None and product.get("category", "").strip() not in known_categories:
            errors.append(f"row {row_number}: unknown category")
        if known_collections is not None:
            for collection in (product.get("collections") or "").split(","):
                if collection.strip() and collection.strip() not in known_collections:
                    errors.append(f"row {row_number}: unknown collection {collection.strip()}")
        try:
            price = Decimal(product.get("price", ""))
            if not price.is_finite() or price < 0 or price.as_tuple().exponent < -2:
                raise InvalidOperation
        except (InvalidOperation, ValueError):
            errors.append(f"row {row_number}: invalid non-negative price")
        availability = (product.get("availability") or "").strip()
        if availability not in Product.AvailabilityStatus.values:
            errors.append(f"row {row_number}: invalid availability")
        _boolean(product.get("published", ""), "published", row_number, errors)
        for field in ("featured", "new_arrival", "best_seller"):
            if product.get(field, "").strip():
                _boolean(product[field], field, row_number, errors)
    seen_files = set()
    seen_hashes = set()
    order_by_product: dict[str, set[int]] = {}
    primaries: dict[str, int] = {}
    for row_number, image in enumerate(package.media, 2):
        code = (image.get("product_code") or "").strip()
        relative = Path(image.get("local_filename") or "")
        target = (root / relative).resolve()
        if code not in products_by_code:
            errors.append(f"image row {row_number}: unknown product_code")
        if relative.is_absolute() or ".." in relative.parts or not SAFE_NAME.match(relative.name):
            errors.append(f"image row {row_number}: unsafe image path")
            continue
        if target != root.resolve() and root.resolve() not in target.parents:
            errors.append(f"image row {row_number}: image escapes package")
        if not target.is_file() or target.stat().st_size == 0:
            errors.append(f"image row {row_number}: missing or empty image")
            continue
        if target.suffix.lower().lstrip(".") not in ALLOWED_FORMATS or target.stat().st_size > MAX_UPLOAD_SIZE:
            errors.append(f"image row {row_number}: unsupported file type or size")
        digest = hashlib.sha256(target.read_bytes()).hexdigest()
        if str(relative) in seen_files or digest in seen_hashes:
            errors.append(f"image row {row_number}: duplicate image")
        seen_files.add(str(relative)); seen_hashes.add(digest)
        try:
            order = int(image.get("sort_order", ""))
            if order < 0 or order in order_by_product.setdefault(code, set()):
                raise ValueError
            order_by_product[code].add(order)
        except ValueError:
            errors.append(f"image row {row_number}: invalid or duplicate sort_order")
        primary = _boolean(image.get("is_primary", ""), "is_primary", row_number, errors)
        if primary:
            primaries[code] = primaries.get(code, 0) + 1
        if image.get("source_classification") != "verified_product":
            errors.append(f"image row {row_number}: source_classification must be verified_product")
        if _dimensions(target) is None:
            warnings.append(f"image row {row_number}: dimensions could not be read; owner review required")
        if not (image.get("alt_text") or "").strip():
            warnings.append(f"image row {row_number}: alt_text will use '<product name> product image'")
    for code, product in products_by_code.items():
        if _boolean(product.get("published", ""), "published", 0, []) and (sum(1 for item in package.media if item.get("product_code") == code) == 0):
            errors.append(f"published product {code}: no verified image")
        if primaries.get(code, 0) > 1:
            errors.append(f"product {code}: multiple primary images")
    return {"errors": errors, "warnings": warnings, "products": len(package.products), "images": len(package.media), "categories": len({p.get('category') for p in package.products if p.get('category')}), "collections": len({c.strip() for p in package.products for c in (p.get('collections') or '').split(',') if c.strip()})}
