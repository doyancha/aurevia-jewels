"""Read-only catalog health and structural audit helpers.

This module deliberately keeps health checks close to the existing catalog
models and publishing validator. It does not persist audit results or mutate
catalog data.
"""

from dataclasses import dataclass

from django.db.models import Count, Q

from .models import Category, Collection, Product, ProductImage
from .publishing import get_publish_readiness_errors


@dataclass
class HealthItem:
    key: str
    label: str
    count: int
    severity: str
    description: str
    url: str = ""


def build_catalog_health():
    """Return dashboard metrics and issue diagnostics using bounded queries."""
    product_rows = list(
        Product.objects.select_related("category").prefetch_related("images", "collections")
    )
    product_counts = Product.objects.aggregate(
        total=Count("pk"),
        published=Count("pk", filter=Q(is_published=True)),
        drafts=Count("pk", filter=Q(is_published=False)),
    )
    image_counts = ProductImage.objects.aggregate(
        total=Count("pk"),
        primary=Count("pk", filter=Q(is_primary=True)),
        secondary=Count("pk", filter=Q(is_primary=False)),
        demo=Count("pk", filter=Q(provenance_status=ProductImage.ProvenanceStatus.REPRESENTATIVE_DEMO)),
        verified=Count("pk", filter=Q(provenance_status=ProductImage.ProvenanceStatus.VERIFIED_PRODUCT)),
    )

    annotated_products = Product.objects.annotate(
        image_count=Count("images", distinct=True),
        primary_count=Count("images", filter=Q(images__is_primary=True), distinct=True),
        collection_count=Count("collections", distinct=True),
    )
    no_image = annotated_products.filter(image_count=0).count()
    no_primary = annotated_products.filter(primary_count=0).count()
    multiple_primary = annotated_products.filter(primary_count__gt=1).count()
    missing_alt = sum(
        not image.alt_text.strip()
        for product in product_rows
        for image in product.images.all()
    )
    inactive_category = Product.objects.filter(category__is_active=False).count()
    no_collections = annotated_products.filter(collection_count=0).count()

    collections = Collection.objects.annotate(
        member_count=Count("products", distinct=True),
        resolved_cover_count=Count(
            "products__images",
            filter=Q(products__images__is_primary=True)
            & ~Q(products__images__provenance_status=ProductImage.ProvenanceStatus.RETIRED)
            & (Q(products__images__source_path__startswith="/")
               | Q(products__images__secure_url__startswith="http://")
               | Q(products__images__secure_url__startswith="https://")),
            distinct=True,
        ),
    )
    no_members = collections.filter(member_count=0).count()
    no_cover = collections.filter(resolved_cover_count=0).count()

    not_ready = []
    published_not_ready = []
    missing_seo_title = 0
    missing_seo_description = 0
    missing_short_description = 0
    for product in product_rows:
        errors = get_publish_readiness_errors(product)
        if errors:
            not_ready.append(product)
            if product.is_published:
                published_not_ready.append(product)
        missing_seo_title += not bool(product.seo_title.strip())
        missing_seo_description += not bool(product.seo_description.strip())
        missing_short_description += not bool(product.short_description.strip())

    issues = [
        HealthItem("not_ready", "Products not ready to publish", len(not_ready), "Attention", "Drafts with incomplete publish-readiness data."),
        HealthItem("published_not_ready", "Published products failing readiness", len(published_not_ready), "Blocked", "Published records must remain publish-ready."),
        HealthItem("no_image", "Products with no image", no_image, "Blocked", "Add at least one usable product image."),
        HealthItem("no_primary", "Products with no primary image", no_primary, "Blocked", "Choose exactly one primary image."),
        HealthItem("multiple_primary", "Products with multiple primaries", multiple_primary, "Blocked", "Structural invariant violation."),
        HealthItem("missing_alt", "Images missing alt text", missing_alt, "Attention", "Describe the visible jewelry view."),
        HealthItem("inactive_category", "Products with inactive category", inactive_category, "Blocked", "Published products require an active category."),
        HealthItem("no_collections", "Products with no collection membership", no_collections, "Attention", "Optional merchandising relationship is absent."),
        HealthItem("no_members", "Collections with no members", no_members, "Attention", "Add products if this collection is intended for storefront use."),
        HealthItem("no_cover", "Collections with no resolved cover", no_cover, "Attention", "A cover resolves from a usable member-product primary image."),
        HealthItem("missing_seo_title", "Products missing SEO title", missing_seo_title, "Attention", "Optional search presentation data is absent."),
        HealthItem("missing_seo_description", "Products missing SEO description", missing_seo_description, "Attention", "Optional search presentation data is absent."),
        HealthItem("missing_short_description", "Products missing short description", missing_short_description, "Attention", "A short description is required before publishing."),
        HealthItem("demo_media", "Representative Demo images", image_counts["demo"], "Informational", "Concept imagery remains non-verified and is not an error."),
    ]
    return {
        "metrics": {
            "Products": product_counts["total"],
            "Published Products": product_counts["published"],
            "Draft Products": product_counts["drafts"],
            "Categories": Category.objects.count(),
            "Collections": Collection.objects.count(),
            "ProductImages": image_counts["total"],
            "Primary Images": image_counts["primary"],
            "Secondary Images": image_counts["secondary"],
            "Representative Demo Images": image_counts["demo"],
            "Verified Product Images": image_counts["verified"],
        },
        "issues": issues,
        "blocked_count": sum(item.count for item in issues if item.severity == "Blocked"),
        "attention_count": sum(item.count for item in issues if item.severity == "Attention"),
    }


def audit_catalog():
    """Return structural invariant failures for local QA and diagnostics."""
    failures = []
    products = Product.objects.select_related("category").prefetch_related("images", "collections")
    for product in products:
        images = list(product.images.all())
        if len([image for image in images if image.is_primary]) != 1:
            failures.append(f"{product.product_code}: exactly one primary image required")
        if [image.sort_order for image in images] != list(range(len(images))):
            failures.append(f"{product.product_code}: image ordering is not compact")
        for image in images:
            if not image.alt_text.strip():
                failures.append(f"{product.product_code}: image {image.pk} has missing alt text")
            if image.provenance_status not in ProductImage.ProvenanceStatus.values:
                failures.append(f"{product.product_code}: image {image.pk} has invalid provenance")
            if not ((image.source_path.startswith("/") or image.secure_url.startswith(("http://", "https://"))) or image.provenance_status == ProductImage.ProvenanceStatus.RETIRED):
                failures.append(f"{product.product_code}: image {image.pk} has unusable media")
        if product.is_published and get_publish_readiness_errors(product):
            failures.append(f"{product.product_code}: published product is not publish-ready")
    for collection in Collection.objects.annotate(member_count=Count("products")):
        if collection.member_count and not ProductImage.objects.filter(
            product__collections=collection, is_primary=True,
        ).exclude(provenance_status=ProductImage.ProvenanceStatus.RETIRED).filter(
            Q(source_path__startswith="/") | Q(secure_url__startswith="http://") | Q(secure_url__startswith="https://")
        ).exists():
            failures.append(f"{collection.slug}: collection cover cannot be resolved")
    return failures
