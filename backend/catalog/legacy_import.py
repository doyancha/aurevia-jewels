"""Programmatic extraction, validation, and import planning for the locked demo catalog."""

from __future__ import annotations

import json
import subprocess
from collections import Counter
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from pathlib import Path

from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils.text import slugify

from .models import Category, Collection, Product, ProductImage
from . import media


EXPECTED_COUNTS = {"products": 24, "collections": 8, "categories": 8, "images": 48}
SUPPORTED_CURRENCIES = {"BDT"}
AVAILABILITY = {
    "Ask About Availability": Product.AvailabilityStatus.ASK_ABOUT_AVAILABILITY,
    "Made to Order": Product.AvailabilityStatus.MADE_TO_ORDER,
}


@dataclass(frozen=True)
class CatalogSource:
    products: list[dict]
    collections: list[dict]


class CatalogImportError(ValidationError):
    pass


def extract_source(repo_root: Path) -> CatalogSource:
    script = repo_root / "scripts" / "export-nextjs-catalog.mjs"
    result = subprocess.run(
        ["node", str(script), str(repo_root / "src/data/products.ts"), str(repo_root / "src/data/collections.ts")],
        check=False, capture_output=True, text=True,
    )
    if result.returncode:
        raise CatalogImportError(f"TypeScript extraction failed: {result.stderr.strip()}")
    try:
        data = json.loads(result.stdout)
        return CatalogSource(products=data["products"], collections=data["collections"])
    except (KeyError, json.JSONDecodeError) as exc:
        raise CatalogImportError("TypeScript extraction returned invalid catalog data.") from exc


def _duplicates(values):
    return sorted(value for value, count in Counter(values).items() if count > 1)


def validate_source(source: CatalogSource, repo_root: Path) -> dict:
    products, collections = source.products, source.collections
    errors = []
    categories = [item.get("category") for item in products]
    for label, values in (("product IDs", [p.get("id") for p in products]),
                          ("product slugs", [p.get("slug") for p in products]),
                          ("product codes", [p.get("productCode") for p in products]),
                          ("collection slugs", [c.get("slug") for c in collections])):
        duplicates = _duplicates(values)
        if duplicates:
            errors.append(f"duplicate {label}: {duplicates}")
    if len(products) != 24 or len(collections) != 8 or len(set(categories)) != 8:
        errors.append(f"unexpected counts: products={len(products)}, collections={len(collections)}, categories={len(set(categories))}")
    collection_slugs = {c.get("slug") for c in collections}
    allowed_ext = media.ALLOWED_FORMATS
    public_root = (repo_root / "public").resolve()
    image_count = 0
    for product in products:
        if product.get("collection") not in collection_slugs:
            errors.append(f"invalid collection reference: {product.get('id')}")
        if product.get("currency") not in SUPPORTED_CURRENCIES:
            errors.append(f"unsupported currency: {product.get('id')}")
        if product.get("availability") not in AVAILABILITY:
            errors.append(f"unsupported availability: {product.get('id')}")
        try:
            Decimal(str(product["price"]))
        except (KeyError, InvalidOperation):
            errors.append(f"invalid price: {product.get('id')}")
        images = product.get("images")
        if not isinstance(images, list) or len(images) != 2:
            errors.append(f"product must have exactly two images: {product.get('id')}")
            continue
        image_count += len(images)
        for image_path in images:
            if not isinstance(image_path, str) or not image_path.startswith("/images/source/"):
                errors.append(f"unsafe image path: {product.get('id')}")
                continue
            resolved = (public_root / image_path.lstrip("/")).resolve()
            if public_root not in resolved.parents or not resolved.is_file() or resolved.stat().st_size == 0:
                errors.append(f"missing or invalid image file: {image_path}")
                continue
            if resolved.suffix.lower().lstrip(".") not in allowed_ext or resolved.stat().st_size > media.MAX_UPLOAD_SIZE:
                errors.append(f"unsupported image file: {image_path}")
    if image_count != 48:
        errors.append(f"unexpected image relationship count: {image_count}")
    if errors:
        raise CatalogImportError("; ".join(errors))
    return {"products": len(products), "collections": len(collections), "categories": len(set(categories)), "images": image_count}


def _mapped_product(data, category):
    try:
        price = Decimal(str(data["price"])).quantize(Decimal("0.01"))
        compare = data.get("originalPrice")
        compare = Decimal(str(compare)).quantize(Decimal("0.01")) if compare is not None else None
    except (KeyError, InvalidOperation) as exc:
        raise CatalogImportError(f"invalid money value for {data.get('id')}") from exc
    return {
        "legacy_key": data["id"], "slug": data["slug"], "name": data["name"], "product_code": data["productCode"],
        "legacy_code": data.get("code"), "category": category, "price": price, "compare_at_price": compare,
        "currency_code": data["currency"], "short_description": data["shortDescription"], "description": data["description"],
        "long_description": data.get("longDescription", ""), "material": data["material"], "color": data["color"],
        "finish": data["finish"], "dimensions": data.get("dimensions", ""), "occasions": data.get("occasion", []),
        "tags": data.get("tags", []), "badges": data.get("badges", []), "availability_status": AVAILABILITY[data["availability"]],
        "is_featured": data.get("featured", False), "is_new_arrival": data.get("newArrival", False),
        "is_best_seller": data.get("bestSeller", False), "display_order": 0, "is_published": False,
    }


def check_collisions(source: CatalogSource):
    category_map = {slugify(name): name for name in {p["category"] for p in source.products}}
    for slug, name in category_map.items():
        row = Category.objects.filter(slug=slug).first()
        if row and (row.name != name or not row.is_active):
            raise CatalogImportError(f"category slug collision: {slug}")
    for item in source.collections:
        row = Collection.objects.filter(slug=item["slug"]).first()
        if row and (row.name != item["name"] or row.description != item["description"] or row.legacy_image_path != item["image"] or not row.is_active):
            raise CatalogImportError(f"collection drift: {item['slug']}")
    by_key = {p.legacy_key: p for p in Product.objects.exclude(legacy_key__isnull=True)}
    for data in source.products:
        row = by_key.get(data["id"])
        slug_row = Product.objects.filter(slug=data["slug"]).first()
        code_row = Product.objects.filter(product_code=data["productCode"]).first()
        present = [r for r in (row, slug_row, code_row) if r]
        if len({r.pk for r in present}) > 1:
            raise CatalogImportError(f"product identity collision: {data['id']}")
        if row and (row.slug != data["slug"] or row.product_code != data["productCode"]):
            raise CatalogImportError(f"product identity drift: {data['id']}")
        if slug_row and not row:
            raise CatalogImportError(f"product slug collision: {data['slug']}")
        if code_row and not row:
            raise CatalogImportError(f"product code collision: {data['productCode']}")


def mapped_products(source):
    categories = {}
    for index, name in enumerate(dict.fromkeys(p["category"] for p in source.products)):
        category, _ = Category.objects.get_or_create(slug=slugify(name), defaults={"name": name, "display_order": index, "is_active": True})
        categories[name] = category
    return [_mapped_product(p, categories[p["category"]]) for p in source.products]
