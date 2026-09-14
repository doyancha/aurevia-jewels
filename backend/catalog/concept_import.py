"""Local-only reconciliation for the Phase 16 concept/demo catalog."""

from __future__ import annotations

import csv
import hashlib
import struct
from pathlib import Path
from decimal import Decimal

from django.db import transaction

from .models import Category, Collection, Product, ProductImage


class ConceptImportError(ValueError):
    pass


def _csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8-sig") as handle:
        return list(csv.DictReader(handle))


def _bool(value: str) -> bool:
    if value.lower() not in {"true", "false"}:
        raise ConceptImportError(f"invalid boolean: {value}")
    return value.lower() == "true"


def _dimensions(path: Path) -> tuple[int, int] | tuple[None, None]:
    data = path.read_bytes()
    if data.startswith(b"\x89PNG\r\n\x1a\n") and len(data) >= 24:
        return struct.unpack(">II", data[16:24])
    return (None, None)


def load_concept(root: Path) -> dict:
    root = root.resolve()
    products = _csv(root / "products.csv")
    taxonomy = _csv(root / "taxonomy.csv")
    manifest = _csv(root / "image-manifest.csv")
    categories = [row for row in taxonomy if row["type"] == "category"]
    collections = [row for row in taxonomy if row["type"] == "collection"]
    errors: list[str] = []
    if len(products) != 24 or len(categories) != 8 or len(collections) != 8 or len(manifest) != 24:
        errors.append("concept package must contain 24 products, 8 categories, 8 collections, and 24 images")
    category_slugs = {row["slug"] for row in categories}
    collection_slugs = {row["slug"] for row in collections}
    product_codes = set()
    product_slugs = set()
    images = []
    for row in products:
        if row["product_code"] in product_codes or row["slug"] in product_slugs:
            errors.append(f"duplicate product identity: {row['product_code']}")
        product_codes.add(row["product_code"]); product_slugs.add(row["slug"])
        if row["category"] not in category_slugs:
            errors.append(f"unknown category: {row['category']}")
        if any(slug not in collection_slugs for slug in row["collections"].split("|")):
            errors.append(f"unknown collection for {row['product_code']}")
        try:
            if Decimal(row["price"]) < 0 or Decimal(row["compare_at_price"]) < 0:
                raise ValueError
        except Exception as exc:
            raise ConceptImportError(f"invalid price for {row['product_code']}") from exc
        for field in ("featured", "new_arrival", "best_seller", "published"):
            _bool(row[field])
    seen_hashes = set()
    for row in manifest:
        if row["product_code"] not in product_codes or row["image_provenance"] != "representative_demo":
            errors.append(f"invalid image manifest row: {row['product_code']}")
        path = root / "images" / row["product_code"] / row["primary_image"]
        if not path.is_file() or not path.stat().st_size:
            errors.append(f"missing primary image: {row['product_code']}")
            continue
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        if digest in seen_hashes:
            errors.append(f"duplicate image: {row['product_code']}")
        seen_hashes.add(digest)
        width, height = _dimensions(path)
        images.append({"code": row["product_code"], "path": path, "width": width, "height": height})
    if errors:
        raise ConceptImportError("; ".join(errors))
    return {"root": root, "products": products, "categories": categories, "collections": collections, "images": images}


def reconcile_concept(data: dict, *, dry_run: bool) -> dict[str, int]:
    """Replace only catalog rows. Existing Cloudinary IDs are cleared before deletion."""
    if dry_run:
        return {"categories": 8, "collections": 8, "products": 24, "images": 24}
    with transaction.atomic():
        # Prevent the existing delete signal from attempting Cloudinary cleanup.
        ProductImage.objects.exclude(cloudinary_public_id="").update(cloudinary_public_id="", secure_url="")
        Product.objects.all().delete()
        Category.objects.all().delete()
        Collection.objects.all().delete()
        category_map = {}
        for index, row in enumerate(data["categories"]):
            category_map[row["slug"]] = Category.objects.create(name=row["name"], slug=row["slug"], description=row["description"], display_order=index)
        collection_map = {}
        for index, row in enumerate(data["collections"]):
            collection_map[row["slug"]] = Collection.objects.create(name=row["name"], slug=row["slug"], description=row["description"], display_order=index)
        image_map = {row["code"]: row for row in data["images"]}
        for index, row in enumerate(data["products"]):
            product = Product.objects.create(
                legacy_key=row["product_code"], name=row["name"], slug=row["slug"], product_code=row["product_code"],
                category=category_map[row["category"]], price=Decimal(row["price"]), compare_at_price=Decimal(row["compare_at_price"]),
                currency_code=row["currency_code"], short_description=row["short_description"], description=row["description"],
                long_description=row["long_description"], material=row["material"], color=row["color"], finish=row["finish"],
                dimensions=row["dimensions"], occasions=row["occasions"].split("|"), tags=row["tags"].split("|"), badges=[row["badges"]],
                availability_status=row["availability"], is_published=True, is_featured=_bool(row["featured"]),
                is_new_arrival=_bool(row["new_arrival"]), is_best_seller=_bool(row["best_seller"]), display_order=index,
                seo_title=row["seo_title"], seo_description=row["seo_description"],
            )
            product.collections.set([collection_map[slug] for slug in row["collections"].split("|")])
            image = image_map[row["product_code"]]
            ProductImage.objects.create(product=product, source_path=f"/catalog/concept-demo/{row['product_code']}/01.png", alt_text=f"{row['name']} concept product image", sort_order=0, is_primary=True, width=image["width"], height=image["height"], provenance_status=ProductImage.ProvenanceStatus.REPRESENTATIVE_DEMO)
    return {"categories": 8, "collections": 8, "products": 24, "images": 24}
