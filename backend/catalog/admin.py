from django.contrib import admin
from django.db.models import Count, Q
from django.utils.html import format_html

from .forms import CategoryAdminForm, CollectionAdminForm, ProductAdminForm
from .models import Category, Collection, Product, ProductImage


class StableSlugAdminMixin:
    def get_prepopulated_fields(self, request, obj=None):
        return {} if obj else {"slug": ("name",)}

    def get_readonly_fields(self, request, obj=None):
        fields = list(super().get_readonly_fields(request, obj))
        if obj:
            fields.append("slug")
        return tuple(dict.fromkeys(fields))


@admin.register(Category)
class CategoryAdmin(StableSlugAdminMixin, admin.ModelAdmin):
    form = CategoryAdminForm
    list_display = ("name", "slug", "product_count", "is_active", "display_order", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("name", "slug", "description")
    ordering = ("display_order", "name", "pk")
    readonly_fields = ("created_at", "updated_at")

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(_product_count=Count("products"))

    @admin.display(description="Products", ordering="_product_count")
    def product_count(self, obj):
        return obj._product_count


@admin.register(Collection)
class CollectionAdmin(StableSlugAdminMixin, admin.ModelAdmin):
    form = CollectionAdminForm
    list_display = ("name", "slug", "member_product_count", "is_active", "display_order", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("name", "slug", "description")
    ordering = ("display_order", "name", "pk")
    readonly_fields = ("legacy_image_path", "created_at", "updated_at")

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(_member_product_count=Count("products", distinct=True))

    @admin.display(description="Products", ordering="_member_product_count")
    def member_product_count(self, obj):
        return obj._member_product_count


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0
    can_delete = False
    ordering = ("sort_order", "pk")
    fields = (
        "source_path", "alt_text", "sort_order", "is_primary", "provenance_status",
        "secure_url", "width", "height", "created_at", "updated_at",
    )
    readonly_fields = (
        "source_path", "alt_text", "sort_order", "is_primary", "provenance_status",
        "cloudinary_public_id", "secure_url", "width", "height", "created_at", "updated_at",
    )

    def has_add_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Product)
class ProductAdmin(StableSlugAdminMixin, admin.ModelAdmin):
    form = ProductAdminForm
    inlines = (ProductImageInline,)
    list_display = (
        "product_code", "name", "category", "price", "currency_code",
        "availability_status", "is_published", "is_featured", "is_new_arrival",
        "is_best_seller", "image_count", "collection_count", "media_provenance", "updated_at",
    )
    list_filter = (
        "is_published", "category", "availability_status", "is_featured",
        "is_new_arrival", "is_best_seller", "collections",
    )
    search_fields = (
        "name", "slug", "product_code", "legacy_key", "legacy_code",
        "short_description", "description",
    )
    ordering = ("product_code", "pk")
    list_select_related = ("category",)
    autocomplete_fields = ("category", "collections")
    readonly_fields = (
        "legacy_key", "legacy_code", "created_at", "updated_at", "media_summary", "storefront_preview",
    )
    fieldsets = (
        ("Identity", {"fields": ("product_code", "name", "slug", "storefront_preview", "legacy_key", "legacy_code")}),
        ("Catalog", {"fields": ("category", "collections", "availability_status")}),
        ("Pricing", {"fields": ("price", "compare_at_price", "currency_code")}),
        ("Descriptions", {"fields": ("short_description", "description", "long_description")}),
        ("Product Attributes", {"fields": ("material", "color", "finish", "dimensions", "occasions", "tags")}),
        ("Merchandising", {"fields": ("badges", "is_featured", "is_new_arrival", "is_best_seller", "is_published", "display_order")}),
        ("SEO", {"fields": ("seo_title", "seo_description")}),
        ("Media summary", {"fields": ("media_summary",), "description": "Read-only. Product media remains representative demo unless a future approved workflow verifies it."}),
        ("System", {"fields": ("created_at", "updated_at")}),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            _image_count=Count("images", distinct=True),
            _collection_count=Count("collections", distinct=True),
            _demo_image_count=Count("images", filter=Q(images__provenance_status=ProductImage.ProvenanceStatus.REPRESENTATIVE_DEMO), distinct=True),
            _verified_image_count=Count("images", filter=Q(images__provenance_status=ProductImage.ProvenanceStatus.VERIFIED_PRODUCT), distinct=True),
        )

    def get_readonly_fields(self, request, obj=None):
        fields = list(super().get_readonly_fields(request, obj))
        if obj:
            fields.append("product_code")
        return tuple(dict.fromkeys(fields))

    @admin.display(description="Images", ordering="_image_count")
    def image_count(self, obj):
        return obj._image_count

    @admin.display(description="Collections", ordering="_collection_count")
    def collection_count(self, obj):
        return obj._collection_count

    @admin.display(description="Media provenance")
    def media_provenance(self, obj):
        if obj._verified_image_count and obj._demo_image_count:
            return "Mixed"
        if obj._verified_image_count:
            return "Verified Product"
        if obj._demo_image_count:
            return "Representative Demo"
        return "No media"

    @admin.display(description="Media summary")
    def media_summary(self, obj):
        if not obj or not obj.pk:
            return "Save the product to view media."
        images = obj.images.all()
        total = len(images)
        primary = sum(image.is_primary for image in images)
        secondary = total - primary
        provenance = {image.get_provenance_status_display() for image in images}
        provenance_label = ", ".join(sorted(provenance)) if provenance else "No media"
        return f"Images: {total} | Primary: {primary} | Secondary: {secondary} | Provenance: {provenance_label}"

    @admin.display(description="Storefront preview")
    def storefront_preview(self, obj):
        if not obj or not obj.pk:
            return "Save the product to preview it."
        url = f"/products/{obj.slug}"
        return format_html('<a href="{}" target="_blank" rel="noopener">View / Preview storefront product</a>', url)


admin.site.site_header = "Aurevia Jewels Admin"
admin.site.site_title = "Aurevia Administration"
admin.site.index_title = "Catalog Management"
