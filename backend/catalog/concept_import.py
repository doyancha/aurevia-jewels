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
    seen_paths = set()
    manifest_images = []
    for row in manifest:
        if row["product_code"] not in product_codes or row["image_provenance"] != "representative_demo":
            errors.append(f"invalid image manifest row: {row['product_code']}")
        candidates = [(row["primary_image"], 0, True)]
        candidates.extend((name, index + 1, False) for index, name in enumerate((row.get("secondary_images") or "").split("|") if row.get("secondary_images") else []))
        for filename, sort_order, is_primary in candidates:
            if not filename:
                continue
            relative = Path(filename)
            if relative.is_absolute() or ".." in relative.parts or relative.name != filename:
                errors.append(f"unsafe image path: {row['product_code']} {filename}")
                continue
            path = root / "images" / row["product_code"] / filename
            if not path.is_file() or not path.stat().st_size:
                if is_primary:
                    errors.append(f"missing primary image: {row['product_code']}")
                continue
            if path in seen_paths:
                errors.append(f"duplicate image path: {path.name}")
            seen_paths.add(path)
            digest = hashlib.sha256(path.read_bytes()).hexdigest()
            if digest in seen_hashes:
                errors.append(f"duplicate image: {row['product_code']} {filename}")
            seen_hashes.add(digest)
            width, height = _dimensions(path)
            manifest_images.append({"code": row["product_code"], "path": path, "sort_order": sort_order, "is_primary": is_primary, "provenance": row["image_provenance"], "width": width, "height": height})
    for code in product_codes:
        product_images = [item for item in manifest_images if item["code"] == code]
        if sum(item["is_primary"] for item in product_images) != 1:
            errors.append(f"product {code}: exactly one primary image is required")
        if len({item["sort_order"] for item in product_images}) != len(product_images):
            errors.append(f"product {code}: duplicate image sort order")
    images = manifest_images
    if errors:
        raise ConceptImportError("; ".join(errors))
    return {"root": root, "products": products, "categories": categories, "collections": collections, "images": images}


def reconcile_concept(data: dict, *, dry_run: bool) -> dict[str, int]:
    """Reconcile only catalog rows without touching remote media."""
    if dry_run:
        return {"categories": 8, "collections": 8, "products": 24, "images": len(data["images"])}
    with transaction.atomic():
        category_map = {}
        for index, row in enumerate(data["categories"]):
            category, _ = Category.objects.get_or_create(slug=row["slug"], defaults={"name": row["name"], "description": row["description"], "display_order": index})
            category.name = row["name"]; category.description = row["description"]; category.display_order = index; category.is_active = True
            category.save(update_fields=["name", "description", "display_order", "is_active", "updated_at"])
            category_map[row["slug"]] = category
        collection_map = {}
        for index, row in enumerate(data["collections"]):
            collection, _ = Collection.objects.get_or_create(slug=row["slug"], defaults={"name": row["name"], "description": row["description"], "display_order": index})
            collection.name = row["name"]; collection.description = row["description"]; collection.display_order = index; collection.is_active = True
            collection.save(update_fields=["name", "description", "display_order", "is_active", "updated_at"])
            collection_map[row["slug"]] = collection
        image_map = {}
        for image in data["images"]:
            image_map.setdefault(image["code"], []).append(image)
        for index, row in enumerate(data["products"]):
            values = dict(legacy_key=row["product_code"], name=row["name"], slug=row["slug"], product_code=row["product_code"], category=category_map[row["category"]], price=Decimal(row["price"]), compare_at_price=Decimal(row["compare_at_price"]), currency_code=row["currency_code"], short_description=row["short_description"], description=row["description"], long_description=row["long_description"], material=row["material"], color=row["color"], finish=row["finish"], dimensions=row["dimensions"], occasions=row["occasions"].split("|"), tags=row["tags"].split("|"), badges=[row["badges"]], availability_status=row["availability"], is_published=True, is_featured=_bool(row["featured"]), is_new_arrival=_bool(row["new_arrival"]), is_best_seller=_bool(row["best_seller"]), display_order=index, seo_title=row["seo_title"], seo_description=row["seo_description"])
            product, _ = Product.objects.get_or_create(product_code=row["product_code"], defaults=values)
            for field, value in values.items():
                setattr(product, field, value)
            product.save()
            product.collections.set([collection_map[slug] for slug in row["collections"].split("|")])
            desired_orders = {image["sort_order"] for image in image_map[row["product_code"]]}
            stale = product.images.exclude(sort_order__in=desired_orders)
            stale.exclude(cloudinary_public_id="").update(cloudinary_public_id="", secure_url="")
            stale.delete()
            for image in sorted(image_map[row["product_code"]], key=lambda item: item["sort_order"]):
                filename = image["path"].name
                alt_text = f"{row['name']} concept product image" if image["is_primary"] else f"{row['name']} concept product image, {'alternate view' if image['sort_order'] == 1 else 'detail view'}"
                ProductImage.objects.update_or_create(product=product, sort_order=image["sort_order"], defaults={"source_path": f"/catalog/concept-demo/{row['product_code']}/{filename}", "alt_text": alt_text, "is_primary": image["is_primary"], "width": image["width"], "height": image["height"], "provenance_status": ProductImage.ProvenanceStatus.REPRESENTATIVE_DEMO, "cloudinary_public_id": "", "secure_url": ""})
        Product.objects.exclude(product_code__in=[row["product_code"] for row in data["products"]]).delete()
        Category.objects.exclude(slug__in=category_map).delete()
        Collection.objects.exclude(slug__in=collection_map).delete()
        for collection in collection_map.values():
            member = Product.objects.filter(collections=collection).order_by("display_order", "pk").first()
            if member:
                primary = member.images.filter(is_primary=True).first()
                collection.legacy_image_path = primary.source_path if primary else ""
                collection.save(update_fields=["legacy_image_path", "updated_at"])
    return {"categories": 8, "collections": 8, "products": 24, "images": len(data["images"])}
