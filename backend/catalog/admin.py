from django.contrib import admin

from .forms import (
    CategoryAdminForm,
    CollectionAdminForm,
    ProductAdminForm,
    ProductImageAdminForm,
    ProductImageInlineFormSet,
)
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
    list_display = ("name", "slug", "is_active", "display_order", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("name", "slug", "description")
    ordering = ("display_order", "name", "pk")
    readonly_fields = ("created_at", "updated_at")


@admin.register(Collection)
class CollectionAdmin(StableSlugAdminMixin, admin.ModelAdmin):
    form = CollectionAdminForm
    list_display = ("name", "slug", "is_active", "display_order", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("name", "slug", "description")
    ordering = ("display_order", "name", "pk")
    readonly_fields = ("legacy_image_path", "created_at", "updated_at")


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    form = ProductImageAdminForm
    formset = ProductImageInlineFormSet
    extra = 1
    ordering = ("sort_order", "pk")
    fields = (
        "source_path", "alt_text", "sort_order", "is_primary", "provenance_status",
        "cloudinary_public_id", "secure_url", "width", "height", "created_at", "updated_at",
    )
    readonly_fields = (
        "cloudinary_public_id", "secure_url", "width", "height", "created_at", "updated_at",
    )


@admin.register(Product)
class ProductAdmin(StableSlugAdminMixin, admin.ModelAdmin):
    form = ProductAdminForm
    inlines = (ProductImageInline,)
    list_display = (
        "name", "product_code", "category", "price", "currency_code",
        "availability_status", "is_published", "is_featured", "is_new_arrival",
        "is_best_seller", "display_order", "updated_at",
    )
    list_filter = (
        "is_published", "category", "availability_status", "is_featured",
        "is_new_arrival", "is_best_seller", "collections",
    )
    search_fields = (
        "name", "slug", "product_code", "legacy_key", "legacy_code",
        "short_description", "description",
    )
    ordering = ("display_order", "name", "pk")
    list_select_related = ("category",)
    autocomplete_fields = ("category", "collections")
    readonly_fields = ("legacy_key", "legacy_code", "created_at", "updated_at")
    fieldsets = (
        ("Identity", {"fields": ("name", "slug", "product_code", "legacy_key", "legacy_code")}),
        ("Classification", {"fields": ("category", "collections")}),
        ("Pricing & Availability", {"fields": ("price", "compare_at_price", "currency_code", "availability_status", "is_published")}),
        ("Descriptions", {"fields": ("short_description", "description", "long_description")}),
        ("Product Attributes", {"fields": ("material", "color", "finish", "dimensions", "occasions", "tags")}),
        ("Merchandising", {"fields": ("badges", "is_featured", "is_new_arrival", "is_best_seller", "display_order")}),
        ("SEO", {"fields": ("seo_title", "seo_description")}),
        ("System", {"fields": ("created_at", "updated_at")}),
    )


admin.site.site_header = "Aurevia Jewels Administration"
admin.site.site_title = "Aurevia Jewels Admin"
admin.site.index_title = "Catalog Administration"
