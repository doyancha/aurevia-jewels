from decimal import Decimal
import re

from django.contrib import admin
from django.contrib.admin.models import LogEntry
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.test import Client, TestCase
from django.urls import reverse

from catalog.admin import CategoryAdmin, CollectionAdmin, ProductAdmin, ProductImageInline
from catalog.models import Category, Collection, Product, ProductImage
from catalog.health import audit_catalog, build_catalog_health


class CatalogAdminTests(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Necklaces", slug="necklaces")
        self.other_category = Category.objects.create(name="Rings", slug="rings")
        self.collection = Collection.objects.create(name="Evening", slug="evening")
        self.other_collection = Collection.objects.create(name="Bridal", slug="bridal")
        self.user = get_user_model().objects.create_user(username="catalog-admin", password="test-password", is_staff=True)
        permissions = []
        for model in (Category, Collection, Product, ProductImage):
            permissions.extend(ContentType.objects.get_for_model(model).permission_set.all())
        self.user.user_permissions.set(permissions)
        self.client = Client()
        self.client.force_login(self.user)

    def product_kwargs(self, **overrides):
        values = {"name": "Amara Stack Rings", "slug": "amara-stack-rings", "product_code": "AJ-CD-009", "category": self.category, "price": Decimal("1200.00"), "short_description": "A stack of rings.", "description": "A longer description.", "material": "Gold-tone", "color": "Gold", "finish": "Polished"}
        values.update(overrides)
        return values

    def create_product(self, **overrides):
        product = Product.objects.create(**self.product_kwargs(**overrides))
        product.collections.add(self.collection, self.other_collection)
        return product

    def admin_url(self, action, product=None):
        return reverse(f"admin:catalog_product_{action}", args=[product.pk]) if product else reverse(f"admin:catalog_product_{action}")

    def product_form_data(self, **overrides):
        data = {"product_code": "AJ-ADMIN-QA", "name": "Admin QA Draft", "slug": "admin-qa-draft", "category": str(self.category.pk), "collections": [str(self.collection.pk)], "price": "900.00", "compare_at_price": "", "currency_code": "BDT", "availability_status": Product.AvailabilityStatus.ASK_ABOUT_AVAILABILITY, "short_description": "Draft short text", "description": "Draft description", "long_description": "", "material": "Gold-tone", "color": "Gold", "finish": "Polished", "dimensions": "", "occasions": "[]", "tags": "[]", "badges": "[]", "seo_title": "", "seo_description": "", "display_order": "0", "images-TOTAL_FORMS": "0", "images-INITIAL_FORMS": "0", "images-MIN_NUM_FORMS": "0", "images-MAX_NUM_FORMS": "1000", "_save": "Save"}
        data.update(overrides)
        return data

    def test_admin_registration_branding_and_read_only_media(self):
        self.assertIsInstance(admin.site._registry[Category], CategoryAdmin)
        self.assertIsInstance(admin.site._registry[Collection], CollectionAdmin)
        self.assertIsInstance(admin.site._registry[Product], ProductAdmin)
        self.assertNotIn(ProductImage, admin.site._registry)
        self.assertEqual(admin.site.site_header, "Aurevia Jewels Admin")
        inline = ProductImageInline(Product, admin.site)
        request = self.client.request().wsgi_request
        request.user = self.user
        self.assertFalse(inline.has_add_permission(request))
        self.assertFalse(inline.has_change_permission(request))
        self.assertFalse(inline.has_delete_permission(request))

    def test_anonymous_and_non_staff_users_cannot_access_admin(self):
        self.client.logout()
        self.assertEqual(self.client.get(reverse("admin:index")).status_code, 302)
        non_staff = get_user_model().objects.create_user(username="customer", password="test-password")
        self.client.force_login(non_staff)
        self.assertEqual(self.client.get(reverse("admin:index")).status_code, 302)
        inactive = get_user_model().objects.create_user(username="inactive", password="test-password", is_staff=True, is_active=False)
        self.client.force_login(inactive)
        self.assertEqual(self.client.get(reverse("admin:index")).status_code, 302)

    def test_product_list_search_filter_and_deterministic_order(self):
        self.create_product(is_published=True)
        Product.objects.create(**self.product_kwargs(product_code="AJ-CD-010", slug="zeta-rings", name="Zeta Rings", is_published=False))
        response = self.client.get(reverse("admin:catalog_product_changelist"), {"q": "AJ-CD-009", "is_published__exact": "1"})
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Amara Stack Rings")
        self.assertNotContains(response, "Zeta Rings")
        self.assertEqual(ProductAdmin.ordering, ("product_code", "pk"))

    def test_valid_unpublished_draft_can_be_created_and_collections_persist_on_edit(self):
        response = self.client.post(self.admin_url("add"), self.product_form_data())
        self.assertEqual(response.status_code, 302, response.content)
        product = Product.objects.get(product_code="AJ-ADMIN-QA")
        self.assertFalse(product.is_published)
        self.assertEqual(set(product.collections.values_list("pk", flat=True)), {self.collection.pk})
        response = self.client.post(self.admin_url("change", product), self.product_form_data(name="Edited Draft", slug=product.slug, product_code=""))
        self.assertEqual(response.status_code, 302, response.content)
        product.refresh_from_db()
        self.assertEqual(product.name, "Edited Draft")
        self.assertEqual(set(product.collections.values_list("pk", flat=True)), {self.collection.pk})

    def test_duplicate_identifiers_and_negative_pricing_are_rejected(self):
        self.create_product()
        duplicate = self.client.post(self.admin_url("add"), self.product_form_data(product_code="AJ-CD-009", slug="new-slug"))
        self.assertEqual(duplicate.status_code, 200)
        self.assertContains(duplicate, "Product with this Product code already exists")
        duplicate_slug = self.client.post(self.admin_url("add"), self.product_form_data(product_code="AJ-NEW", slug="amara-stack-rings"))
        self.assertEqual(duplicate_slug.status_code, 200)
        self.assertContains(duplicate_slug, "Product with this Slug already exists")
        negative = self.client.post(self.admin_url("add"), self.product_form_data(product_code="AJ-NEG", slug="negative", price="-1"))
        self.assertEqual(negative.status_code, 200)
        self.assertContains(negative, "Price cannot be negative")

    def test_product_code_is_immutable_and_existing_media_provenance_is_untouched(self):
        product = self.create_product()
        ProductImage.objects.create(product=product, source_path="/demo/a.jpg", alt_text="A", is_primary=True)
        ProductImage.objects.create(product=product, source_path="/demo/b.jpg", alt_text="B", sort_order=1)
        response = self.client.get(self.admin_url("change", product))
        self.assertNotContains(response, 'name="product_code"')
        data = self.product_form_data(name="Changed", slug=product.slug, product_code="AJ-CHANGED")
        self.client.post(self.admin_url("change", product), data)
        product.refresh_from_db()
        self.assertEqual(product.product_code, "AJ-CD-009")
        self.assertEqual(ProductImage.objects.filter(product=product).count(), 2)
        self.assertEqual(ProductImage.objects.filter(product=product, provenance_status=ProductImage.ProvenanceStatus.REPRESENTATIVE_DEMO).count(), 2)

    def test_csrf_blocks_admin_post_without_token_and_public_api_has_no_write_route(self):
        client = Client(enforce_csrf_checks=True)
        client.force_login(self.user)
        self.assertEqual(client.post(self.admin_url("add"), self.product_form_data()).status_code, 403)
        response = client.post("/api/v1/products/", {}, content_type="application/json")
        self.assertEqual(response.status_code, 405)

    def test_staff_without_catalog_permission_cannot_mutate(self):
        restricted = get_user_model().objects.create_user(username="restricted", password="test-password", is_staff=True)
        self.client.force_login(restricted)
        response = self.client.post(self.admin_url("add"), self.product_form_data())
        self.assertIn(response.status_code, (302, 403))
        self.assertFalse(Product.objects.filter(product_code="AJ-ADMIN-QA").exists())

    def test_optional_metadata_can_remain_blank(self):
        response = self.client.post(self.admin_url("add"), self.product_form_data(product_code="AJ-BLANK", slug="blank-metadata"))
        self.assertEqual(response.status_code, 302, response.content)
        product = Product.objects.get(product_code="AJ-BLANK")
        self.assertEqual(product.dimensions, "")
        self.assertEqual(product.occasions, [])
        self.assertEqual(product.tags, [])
        self.assertEqual(product.badges, [])

    def test_category_and_collection_admin_show_member_counts(self):
        product = self.create_product()
        category = admin.site._registry[Category]
        collection = admin.site._registry[Collection]
        category_row = category.get_queryset(None).get(pk=self.category.pk)
        collection_row = collection.get_queryset(None).get(pk=self.collection.pk)
        self.assertEqual(category.product_count(category_row), 1)
        self.assertEqual(collection.member_product_count(collection_row), 1)
        product.delete()

    def test_premium_dashboard_regions_use_live_metrics_and_no_commerce_metrics(self):
        response = self.client.get(reverse("admin:index"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "aurevia-dashboard")
        self.assertContains(response, "Aurevia Owner Dashboard")
        self.assertContains(response, "Catalog health")
        self.assertContains(response, "Media &amp; provenance")
        self.assertContains(response, "Quick actions")
        self.assertContains(response, "Catalog management")
        self.assertNotContains(response, "Revenue")
        self.assertNotContains(response, "Conversion")
        self.assertContains(response, "Add Product")

    def test_view_store_links_use_resolved_development_storefront_url(self):
        response = self.client.get(reverse("admin:index"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context["site_url"], "http://localhost:3000")
        html = response.content.decode()
        rendered_links = re.findall(
            r'<div id="user-tools"[^>]*>.*?<a href="([^"]+)"[^>]*>View Store</a>',
            html,
            flags=re.DOTALL,
        )
        rendered_links += re.findall(
            r'<a class="aurevia-button aurevia-button--secondary" href="([^"]+)"[^>]*>View Store',
            html,
        )
        self.assertEqual(rendered_links, ["http://localhost:3000", "http://localhost:3000"])
        self.assertNotIn("http://127.0.0.1:3000", html)

    def test_premium_login_and_product_presentation_preserve_semantics(self):
        self.client.logout()
        login = self.client.get(reverse("admin:login"))
        self.assertEqual(login.status_code, 200)
        self.assertContains(login, "Catalog Administration")
        self.assertContains(login, 'name="csrfmiddlewaretoken"')
        self.client.force_login(self.user)
        product = self.create_product(is_published=True)
        ProductImage.objects.create(product=product, source_path="/catalog/qa.png", alt_text="QA product image", is_primary=True)
        response = self.client.get(reverse("admin:catalog_product_changelist"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "aurevia-thumb")
        self.assertContains(response, "aurevia-badge")
        self.assertEqual([title for title, _options in ProductAdmin.fieldsets], [
            "Identity", "Catalog", "Pricing", "Content", "Product Details", "Discovery",
            "Merchandising", "SEO", "Media manager", "Publishing", "System",
        ])

    def test_dashboard_quick_actions_respect_model_permissions(self):
        restricted = get_user_model().objects.create_user(
            username="dashboard-viewer", password="test-password", is_staff=True,
        )
        restricted.user_permissions.add(
            ContentType.objects.get_for_model(Product).permission_set.get(codename="view_product")
        )
        self.client.force_login(restricted)
        response = self.client.get(reverse("admin:index"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Run Catalog Audit")
        self.assertNotContains(response, "Add Product")
        self.assertNotContains(response, "Add Collection")
        self.assertNotContains(response, "Add Category")

    def test_admin_wide_readability_assets_and_standard_pages_render(self):
        self.client.logout()
        login = self.client.get(reverse("admin:login"))
        self.assertContains(login, "admin/aurevia/admin.css")
        self.client.force_login(self.user)
        dashboard = self.client.get(reverse("admin:index"))
        self.assertContains(dashboard, "admin/aurevia/admin.css")
        for url_name in (
            "admin:catalog_product_changelist",
            "admin:catalog_product_add",
            "admin:catalog_category_changelist",
            "admin:catalog_category_add",
            "admin:catalog_collection_changelist",
            "admin:catalog_collection_add",
        ):
            response = self.client.get(reverse(url_name))
            self.assertEqual(response.status_code, 200)
            self.assertContains(response, "admin/aurevia/admin.css")
        self.assertContains(dashboard, "Catalog management")

    def test_catalog_health_dashboard_is_read_only_and_permission_gated(self):
        response = self.client.get(reverse("admin:index"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Catalog overview")
        self.assertContains(response, "Representative Demo images")
        before = list(Product.objects.values_list("pk", "updated_at"))
        self.assertEqual(build_catalog_health()["metrics"]["Products"], 0)
        self.assertEqual(before, list(Product.objects.values_list("pk", "updated_at")))

        self.client.logout()
        self.assertEqual(self.client.get(reverse("admin:index")).status_code, 302)

    def test_catalog_audit_passes_valid_product_and_media_history_is_safe(self):
        product = self.create_product()
        ProductImage.objects.create(product=product, source_path="/media/admin-product/a.png", alt_text="A", is_primary=True)
        self.assertEqual(audit_catalog(), [])
        model_admin = admin.site._registry[Product]
        request = self.client.get(reverse("admin:index")).wsgi_request
        model_admin._log_media_action(request, product, "Reordered product images via media manager.")
        entry = LogEntry.objects.filter(object_id=str(product.pk)).latest("action_time")
        self.assertEqual(entry.user, self.user)
        self.assertIn("media manager", entry.change_message)
        self.assertNotRegex(entry.change_message.lower(), r"password|token|secret|credential|cloudinary|c:\\")
