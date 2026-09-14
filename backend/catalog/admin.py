from django.contrib import admin
from django.conf import settings
from django.contrib import messages
from django.db import transaction
from django.db.models import Count, Q
from django.http import HttpResponseForbidden, HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.template.response import TemplateResponse
from django.urls import path, reverse
from django.utils.html import format_html
from urllib.parse import urljoin

from .forms import (
    CategoryAdminForm, CollectionAdminForm, ProductAdminForm,
    ProductMediaAltForm, ProductMediaReorderForm, ProductMediaUploadForm,
)
from .media import cleanup_stored_metadata, delete_stored_asset, store_upload
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
    readonly_fields = ("created_at", "updated_at", "product_count", "storefront_link")
    fieldsets = (
        ("Category", {"fields": ("name", "slug", "description", "is_active", "display_order", "storefront_link", "product_count")}),
        ("System", {"fields": ("created_at", "updated_at")}),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(_product_count=Count("products"))

    @admin.display(description="Products", ordering="_product_count")
    def product_count(self, obj):
        return obj._product_count

    @admin.display(description="Storefront")
    def storefront_link(self, obj):
        if not obj or not obj.pk:
            return "Save the category to view it."
        return format_html('<a href="/shop?category={}" target="_blank" rel="noopener">View category results</a>', obj.slug)

    def get_actions(self, request):
        actions = super().get_actions(request)
        actions.pop("delete_selected", None)
        return actions

    def delete_view(self, request, object_id, extra_context=None):
        obj = get_object_or_404(self.get_queryset(request), pk=object_id)
        if request.method == "POST" and obj.products.exists():
            self.message_user(request, "Reassign or remove the category's products before deleting this category.", messages.ERROR)
            return HttpResponseRedirect(reverse("admin:catalog_category_change", args=[obj.pk]))
        return super().delete_view(request, object_id, extra_context)


@admin.register(Collection)
class CollectionAdmin(StableSlugAdminMixin, admin.ModelAdmin):
    form = CollectionAdminForm
    list_display = ("name", "slug", "member_product_count", "cover_status", "is_active", "display_order", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("name", "slug", "description")
    ordering = ("display_order", "name", "pk")
    readonly_fields = ("legacy_image_path", "resolved_cover", "resolved_cover_source", "storefront_link", "member_product_count", "created_at", "updated_at")
    fieldsets = (
        ("Collection", {"fields": ("name", "slug", "description", "is_active", "display_order", "products", "storefront_link")}),
        ("Resolved cover", {"fields": ("resolved_cover", "resolved_cover_source", "legacy_image_path"), "description": "The cover remains derived from the established member-product primary image. Empty collections show no cover."}),
        ("System", {"fields": ("member_product_count", "created_at", "updated_at")}),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            _member_product_count=Count("products", distinct=True),
            _cover_image_count=Count(
                "products__images",
                filter=Q(products__images__is_primary=True)
                & ~Q(products__images__provenance_status=ProductImage.ProvenanceStatus.RETIRED)
                & (Q(products__images__source_path__startswith="/") | Q(products__images__secure_url__startswith="http://") | Q(products__images__secure_url__startswith="https://")),
                distinct=True,
            ),
        )

    @admin.display(description="Products", ordering="_member_product_count")
    def member_product_count(self, obj):
        return obj._member_product_count

    def _cover_image(self, obj):
        path = (obj.legacy_image_path or "").strip()
        images = ProductImage.objects.filter(
            product__collections=obj,
            is_primary=True,
        ).exclude(provenance_status=ProductImage.ProvenanceStatus.RETIRED).filter(
            Q(source_path__startswith="/") | Q(secure_url__startswith="http://") | Q(secure_url__startswith="https://")
        ).select_related("product")
        if path:
            image = images.filter(source_path=path).first()
            if image:
                return image
        return images.order_by("product__display_order", "product__name", "product__pk", "pk").first()

    @admin.display(description="Cover")
    def cover_status(self, obj):
        return "Resolved" if obj._cover_image_count else "No cover available"

    @admin.display(description="Resolved cover")
    def resolved_cover(self, obj):
        image = self._cover_image(obj)
        if not image:
            return "No cover available"
        source = image.secure_url or image.source_path
        if not source.startswith(("http://", "https://", "/")):
            return "No cover available"
        if source.startswith("/catalog/"):
            source = urljoin(getattr(settings, "ADMIN_STOREFRONT_BASE_URL", ""), source)
        return format_html('<img src="{}" alt="{}" style="max-width:120px;max-height:120px;object-fit:cover;border-radius:4px;" />', source, image.alt_text)

    @admin.display(description="Source product")
    def resolved_cover_source(self, obj):
        image = self._cover_image(obj)
        return image.product if image else "No cover available"

    @admin.display(description="Storefront")
    def storefront_link(self, obj):
        if not obj or not obj.pk:
            return "Save the collection to view it."
        return format_html('<a href="/collections/{}" target="_blank" rel="noopener">View collection</a>', obj.slug)

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        form.instance.products.set(form.cleaned_data.get("products", []))

    def get_actions(self, request):
        actions = super().get_actions(request)
        actions.pop("delete_selected", None)
        return actions

    def delete_view(self, request, object_id, extra_context=None):
        obj = get_object_or_404(self.get_queryset(request), pk=object_id)
        if request.method == "POST" and obj.products.exists():
            self.message_user(request, "Remove this collection's product memberships before deleting the collection. Products will never be deleted by collection management.", messages.ERROR)
            return HttpResponseRedirect(reverse("admin:catalog_collection_change", args=[obj.pk]))
        return super().delete_view(request, object_id, extra_context)


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0
    can_delete = False
    ordering = ("sort_order", "pk")
    fields = (
        "thumbnail", "alt_text", "provenance_status", "sort_order", "is_primary", "media_actions",
    )
    readonly_fields = (
        "thumbnail", "alt_text", "provenance_status", "sort_order", "is_primary", "media_actions",
    )

    def has_add_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def get_formset(self, request, obj=None, **kwargs):
        self._request = request
        self._admin_storefront_base = getattr(settings, "ADMIN_STOREFRONT_BASE_URL", "")
        return super().get_formset(request, obj, **kwargs)

    @admin.display(description="Preview")
    def thumbnail(self, image):
        source = image.secure_url or image.source_path
        if source and not source.startswith(("http://", "https://", "/")):
            source = ""
        if source and source.startswith("/catalog/"):
            source = urljoin(self._admin_storefront_base, source)
        if not source:
            return "Unavailable"
        return format_html('<img src="{}" alt="{}" style="max-width:80px;max-height:80px;width:80px;height:80px;object-fit:cover;border-radius:4px;" />', source, image.alt_text)

    @admin.display(description="Actions")
    def media_actions(self, image):
        product_id = image.product_id
        links = [
            ("Set primary", reverse("admin:catalog_product_media_primary", args=[product_id, image.pk])),
            ("Edit alt", reverse("admin:catalog_product_media_alt", args=[product_id, image.pk])),
            ("Replace", reverse("admin:catalog_product_media_replace", args=[product_id, image.pk])),
            ("Remove", reverse("admin:catalog_product_media_remove", args=[product_id, image.pk])),
        ]
        return format_html(" | ".join('<a href="{}">{}</a>' for _label, _url in links), *[item for pair in links for item in pair[::-1]])


@admin.register(Product)
class ProductAdmin(StableSlugAdminMixin, admin.ModelAdmin):
    form = ProductAdminForm
    inlines = (ProductImageInline,)
    list_display = (
        "product_code", "name", "category", "price", "currency_code",
        "availability_status", "is_published", "is_featured", "is_new_arrival",
        "is_best_seller", "image_count", "collection_count", "media_provenance", "updated_at",
        "publication_readiness",
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
        "legacy_key", "legacy_code", "created_at", "updated_at", "media_summary", "media_manager_link", "storefront_preview",
    )
    fieldsets = (
        ("Identity", {"fields": ("product_code", "name", "slug", "storefront_preview", "legacy_key", "legacy_code")}),
        ("Catalog", {"fields": ("category", "collections", "availability_status")}),
        ("Pricing", {"fields": ("price", "compare_at_price", "currency_code")}),
        ("Descriptions", {"fields": ("short_description", "description", "long_description")}),
        ("Product Attributes", {"fields": ("material", "color", "finish", "dimensions", "occasions", "tags")}),
        ("Merchandising", {"fields": ("badges", "is_featured", "is_new_arrival", "is_best_seller", "is_published", "display_order")}),
        ("SEO", {"fields": ("seo_title", "seo_description")}),
        ("Media manager", {"fields": ("media_summary", "media_manager_link"), "description": "Uploads are server-validated and local development media is stored outside the concept fixture. Provenance is read-only and remains Representative Demo."}),
        ("System", {"fields": ("created_at", "updated_at")}),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            _image_count=Count("images", distinct=True),
            _collection_count=Count("collections", distinct=True),
            _demo_image_count=Count("images", filter=Q(images__provenance_status=ProductImage.ProvenanceStatus.REPRESENTATIVE_DEMO), distinct=True),
            _verified_image_count=Count("images", filter=Q(images__provenance_status=ProductImage.ProvenanceStatus.VERIFIED_PRODUCT), distinct=True),
            _primary_image_count=Count("images", filter=Q(images__is_primary=True), distinct=True),
            _usable_primary_count=Count("images", filter=Q(
                images__is_primary=True,
            ) & ~Q(images__provenance_status=ProductImage.ProvenanceStatus.RETIRED) & (Q(images__source_path__startswith="/") | Q(images__secure_url__startswith="http://") | Q(images__secure_url__startswith="https://")), distinct=True),
        )

    def get_urls(self):
        custom = [
            path("<int:product_id>/preview/", self.admin_site.admin_view(self.product_preview), name="catalog_product_preview"),
            path("<int:product_id>/media/add/", self.admin_site.admin_view(self.media_add), name="catalog_product_media_add"),
            path("<int:product_id>/media/<int:image_id>/replace/", self.admin_site.admin_view(self.media_replace), name="catalog_product_media_replace"),
            path("<int:product_id>/media/<int:image_id>/remove/", self.admin_site.admin_view(self.media_remove), name="catalog_product_media_remove"),
            path("<int:product_id>/media/<int:image_id>/primary/", self.admin_site.admin_view(self.media_primary), name="catalog_product_media_primary"),
            path("<int:product_id>/media/<int:image_id>/alt/", self.admin_site.admin_view(self.media_alt), name="catalog_product_media_alt"),
            path("<int:product_id>/media/reorder/", self.admin_site.admin_view(self.media_reorder), name="catalog_product_media_reorder"),
        ]
        return custom + super().get_urls()

    def product_preview(self, request, product_id):
        if not request.user.has_perm("catalog.view_product"):
            return HttpResponseForbidden()
        product = get_object_or_404(
            Product.objects.select_related("category").prefetch_related("collections", "images"),
            pk=product_id,
        )
        media = []
        for image in product.images.all():
            source = image.secure_url or image.source_path
            if source.startswith("/catalog/"):
                source = urljoin(getattr(settings, "ADMIN_STOREFRONT_BASE_URL", ""), source)
            if source.startswith(("http://", "https://", "/")):
                media.append({"image": image, "url": source})
        return TemplateResponse(request, "admin/catalog/product/preview.html", {
            **self.admin_site.each_context(request),
            "title": f"Preview {product.name}",
            "product": product,
            "media": media,
        })

    def _media_allowed(self, request, codename):
        return request.user.is_active and request.user.is_staff and request.user.has_perm(f"catalog.{codename}")

    def _media_page(self, request, product, form, title):
        return TemplateResponse(request, "admin/catalog/product/media_form.html", {
            **self.admin_site.each_context(request), "title": title, "product": product, "form": form,
        })

    def _redirect_change(self, product):
        return HttpResponseRedirect(reverse("admin:catalog_product_change", args=[product.pk]))

    def media_add(self, request, product_id):
        product = get_object_or_404(Product, pk=product_id)
        if not self._media_allowed(request, "add_productimage") or not request.user.has_perm("catalog.change_product"):
            return HttpResponseForbidden()
        form = ProductMediaUploadForm(request.POST or None, request.FILES or None)
        if request.method == "POST" and form.is_valid():
            metadata = None
            try:
                with transaction.atomic():
                    locked = Product.objects.select_for_update().get(pk=product.pk)
                    has_primary = locked.images.filter(is_primary=True).exists()
                    metadata = store_upload(form.cleaned_data["upload_file"], locked)
                    ProductImage.objects.create(product=locked, alt_text=form.cleaned_data["alt_text"], sort_order=locked.images.count(), is_primary=not has_primary, **metadata)
            except Exception:
                if metadata:
                    cleanup_stored_metadata(metadata)
                raise
            messages.success(request, "Product image uploaded as {}.".format("primary" if not has_primary else "secondary"))
            return self._redirect_change(product)
        return self._media_page(request, product, form, "Upload product media")

    def _get_image(self, product_id, image_id):
        return get_object_or_404(ProductImage, pk=image_id, product_id=product_id)

    def media_primary(self, request, product_id, image_id):
        product = get_object_or_404(Product, pk=product_id)
        image = self._get_image(product_id, image_id)
        if request.method != "POST" or not self._media_allowed(request, "change_productimage") or not request.user.has_perm("catalog.change_product"):
            if request.method == "POST":
                return HttpResponseForbidden()
            return TemplateResponse(request, "admin/catalog/product/media_confirm.html", {**self.admin_site.each_context(request), "title": "Set primary image", "product": product, "image": image, "primary_action": True})
        with transaction.atomic():
            locked = Product.objects.select_for_update().get(pk=product.pk)
            target = locked.images.select_for_update().get(pk=image.pk)
            locked.images.exclude(pk=target.pk).filter(is_primary=True).update(is_primary=False)
            target.is_primary = True
            target.save(update_fields=["is_primary", "updated_at"])
        messages.success(request, "Primary image updated.")
        return self._redirect_change(product)

    def media_alt(self, request, product_id, image_id):
        product = get_object_or_404(Product, pk=product_id)
        image = self._get_image(product_id, image_id)
        if not self._media_allowed(request, "change_productimage") or not request.user.has_perm("catalog.change_product"):
            return HttpResponseForbidden()
        form = ProductMediaAltForm(request.POST or None, initial={"alt_text": image.alt_text})
        if request.method == "POST" and form.is_valid():
            image.alt_text = form.cleaned_data["alt_text"]
            image.save(update_fields=["alt_text", "updated_at"])
            messages.success(request, "Alt text updated.")
            return self._redirect_change(product)
        return self._media_page(request, product, form, "Edit image alt text")

    def media_reorder(self, request, product_id):
        product = get_object_or_404(Product, pk=product_id)
        if not self._media_allowed(request, "change_productimage") or not request.user.has_perm("catalog.change_product"):
            return HttpResponseForbidden()
        if request.method == "GET":
            return TemplateResponse(request, "admin/catalog/product/media_reorder.html", {**self.admin_site.each_context(request), "title": "Reorder product media", "product": product, "images": product.images.all()})
        if request.method != "POST":
            return HttpResponseForbidden()
        data = request.POST.copy()
        data["order"] = ",".join(request.POST.getlist("order"))
        form = ProductMediaReorderForm(data)
        if form.is_valid():
            with transaction.atomic():
                locked = Product.objects.select_for_update().get(pk=product.pk)
                images = list(locked.images.select_for_update().all())
                by_id = {image.pk: image for image in images}
                if set(form.cleaned_data["order"]) != set(by_id):
                    return HttpResponseForbidden()
                for image in images:
                    image.sort_order += len(images)
                ProductImage.objects.bulk_update(images, ["sort_order"])
                for position, image_id in enumerate(form.cleaned_data["order"]):
                    by_id[image_id].sort_order = position
                ProductImage.objects.bulk_update(images, ["sort_order", "updated_at"])
            messages.success(request, "Image order updated.")
        return self._redirect_change(product)

    def media_remove(self, request, product_id, image_id):
        product = get_object_or_404(Product, pk=product_id)
        image = self._get_image(product_id, image_id)
        if not self._media_allowed(request, "delete_productimage") or not request.user.has_perm("catalog.change_product"):
            return HttpResponseForbidden()
        if request.method == "GET":
            return TemplateResponse(request, "admin/catalog/product/media_confirm.html", {**self.admin_site.each_context(request), "title": "Remove product image", "product": product, "image": image})
        if request.method != "POST":
            return HttpResponseForbidden()
        old_source = image.source_path
        with transaction.atomic():
            locked = Product.objects.select_for_update().get(pk=product.pk)
            target = locked.images.select_for_update().get(pk=image.pk)
            if locked.is_published and locked.images.count() == 1:
                messages.error(request, "A published product must retain one image.")
                return self._redirect_change(product)
            was_primary = target.is_primary
            target.delete()
            remaining = list(locked.images.select_for_update().order_by("sort_order", "pk"))
            if remaining and was_primary:
                remaining[0].is_primary = True
            for position, item in enumerate(remaining):
                item.sort_order = position
            ProductImage.objects.bulk_update(remaining, ["sort_order", "is_primary", "updated_at"])
        if old_source.startswith("/media/admin-product/"):
            transaction.on_commit(lambda source=old_source: delete_stored_asset(ProductImage(source_path=source)))
        messages.success(request, "Product image removed.")
        return self._redirect_change(product)

    def media_replace(self, request, product_id, image_id):
        product = get_object_or_404(Product, pk=product_id)
        image = self._get_image(product_id, image_id)
        if not self._media_allowed(request, "change_productimage") or not request.user.has_perm("catalog.change_product"):
            return HttpResponseForbidden()
        form = ProductMediaUploadForm(request.POST or None, request.FILES or None)
        if request.method == "POST" and form.is_valid():
            metadata = None
            old = ProductImage(source_path=image.source_path, cloudinary_public_id=image.cloudinary_public_id, secure_url=image.secure_url)
            try:
                with transaction.atomic():
                    locked = Product.objects.select_for_update().get(pk=product.pk)
                    target = locked.images.select_for_update().get(pk=image.pk)
                    metadata = store_upload(form.cleaned_data["upload_file"], locked)
                    target.source_path = metadata["source_path"]
                    target.cloudinary_public_id = metadata["cloudinary_public_id"]
                    target.secure_url = metadata["secure_url"]
                    target.width = metadata["width"]
                    target.height = metadata["height"]
                    target.alt_text = form.cleaned_data["alt_text"]
                    target.save(update_fields=["source_path", "cloudinary_public_id", "secure_url", "width", "height", "alt_text", "updated_at"])
                    transaction.on_commit(lambda old=old: delete_stored_asset(old))
            except Exception:
                if metadata:
                    cleanup_stored_metadata(metadata)
                raise
            messages.success(request, "Product image replaced.")
            return self._redirect_change(product)
        return self._media_page(request, product, form, "Replace product media")

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

    @admin.display(description="Publish readiness", ordering="_usable_primary_count")
    def publication_readiness(self, obj):
        if not obj.category or not obj.category.is_active:
            return "Missing category"
        if not obj._image_count:
            return "Missing image"
        if obj._primary_image_count != 1 or obj._usable_primary_count != 1:
            return "Primary image issue"
        return "Ready"

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

    @admin.display(description="Manage media")
    def media_manager_link(self, obj):
        if not obj or not obj.pk:
            return "Save the product before adding media."
        add_url = reverse("admin:catalog_product_media_add", args=[obj.pk])
        reorder_url = reverse("admin:catalog_product_media_reorder", args=[obj.pk])
        return format_html('<a href="{}">Upload image</a> &nbsp; <a href="{}">Reorder images</a>', add_url, reorder_url)

    @admin.display(description="Storefront preview")
    def storefront_preview(self, obj):
        if not obj or not obj.pk:
            return "Save the product to preview it."
        if obj.is_published:
            url = f"/products/{obj.slug}"
            label = "View storefront product"
        else:
            url = reverse("admin:catalog_product_preview", args=[obj.pk])
            label = "Open secure draft preview"
        return format_html('<a href="{}" target="_blank" rel="noopener">{}</a>', url, label)

    def get_actions(self, request):
        actions = super().get_actions(request)
        actions.pop("delete_selected", None)
        return actions


admin.site.site_header = "Aurevia Jewels Admin"
admin.site.site_title = "Aurevia Administration"
admin.site.index_title = "Catalog Management"
