from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import F, Q

from .validators import validate_string_list


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["display_order", "name", "pk"]

    def __str__(self):
        return self.name


class Collection(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    legacy_image_path = models.CharField(max_length=500, blank=True)
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["display_order", "name", "pk"]

    def __str__(self):
        return self.name


class Product(models.Model):
    class AvailabilityStatus(models.TextChoices):
        ASK_ABOUT_AVAILABILITY = "ask_about_availability", "Ask About Availability"
        MADE_TO_ORDER = "made_to_order", "Made to Order"

    legacy_key = models.CharField(max_length=100, unique=True, null=True, blank=True)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    product_code = models.CharField(max_length=50, unique=True)
    legacy_code = models.CharField(max_length=100, null=True, blank=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products",
    )
    collections = models.ManyToManyField(
        Collection,
        blank=True,
        related_name="products",
    )
    price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    compare_at_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
    )
    currency_code = models.CharField(max_length=3, default="BDT")
    short_description = models.CharField(max_length=500)
    description = models.TextField()
    long_description = models.TextField(blank=True)
    material = models.CharField(max_length=255)
    color = models.CharField(max_length=100)
    finish = models.CharField(max_length=100)
    dimensions = models.CharField(max_length=255, blank=True)
    occasions = models.JSONField(default=list, blank=True, validators=[validate_string_list])
    tags = models.JSONField(default=list, blank=True, validators=[validate_string_list])
    badges = models.JSONField(default=list, blank=True, validators=[validate_string_list])
    availability_status = models.CharField(
        max_length=32,
        choices=AvailabilityStatus,
        default=AvailabilityStatus.ASK_ABOUT_AVAILABILITY,
    )
    is_published = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    is_new_arrival = models.BooleanField(default=False)
    is_best_seller = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(default=0)
    seo_title = models.CharField(max_length=255, blank=True)
    seo_description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["display_order", "name", "pk"]
        constraints = [
            models.CheckConstraint(
                condition=Q(price__gte=0),
                name="product_price_nonnegative",
            ),
            models.CheckConstraint(
                condition=Q(compare_at_price__isnull=True)
                | Q(compare_at_price__gte=F("price")),
                name="product_compare_price_valid",
            ),
            models.CheckConstraint(
                condition=Q(display_order__gte=0),
                name="product_display_order_nonnegative",
            ),
        ]
        indexes = [
            models.Index(
                fields=["is_published", "display_order"],
                name="product_pub_order_idx",
            ),
            models.Index(
                fields=["category", "is_published", "display_order"],
                name="product_cat_pub_order_idx",
            ),
        ]

    def __str__(self):
        return f"{self.name} ({self.product_code})"


class ProductImage(models.Model):
    class ProvenanceStatus(models.TextChoices):
        REPRESENTATIVE_DEMO = "representative_demo", "Representative Demo"
        VERIFIED_PRODUCT = "verified_product", "Verified Product"
        RETIRED = "retired", "Retired"

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images",
    )
    source_path = models.CharField(max_length=500, blank=True)
    cloudinary_public_id = models.CharField(max_length=255, blank=True)
    secure_url = models.URLField(max_length=500, blank=True)
    alt_text = models.CharField(max_length=255)
    sort_order = models.PositiveIntegerField(default=0)
    is_primary = models.BooleanField(default=False)
    width = models.PositiveIntegerField(null=True, blank=True)
    height = models.PositiveIntegerField(null=True, blank=True)
    provenance_status = models.CharField(
        max_length=32,
        choices=ProvenanceStatus,
        default=ProvenanceStatus.REPRESENTATIVE_DEMO,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "pk"]
        constraints = [
            models.UniqueConstraint(
                fields=["product", "sort_order"],
                name="product_image_sort_unique",
            ),
            models.UniqueConstraint(
                fields=["product"],
                condition=Q(is_primary=True),
                name="product_one_primary_image",
            ),
            models.UniqueConstraint(
                fields=["cloudinary_public_id"],
                condition=~Q(cloudinary_public_id=""),
                name="product_image_cloudinary_id_unique",
            ),
            models.CheckConstraint(
                condition=(Q(cloudinary_public_id="", secure_url="")
                           | (~Q(cloudinary_public_id="") & ~Q(secure_url=""))),
                name="product_image_cloudinary_metadata_pair",
            ),
        ]

    def __str__(self):
        return f"{self.product} image {self.sort_order}"
