from decimal import Decimal

from django.contrib import admin
from django.contrib.auth import get_user_model
from django.forms import inlineformset_factory
from django.test import TestCase
from django.urls import reverse

from catalog.admin import CategoryAdmin, CollectionAdmin, ProductAdmin, ProductImageInline
from catalog.forms import ProductImageAdminForm, ProductImageInlineFormSet
from catalog.models import Category, Collection, Product, ProductImage


class CatalogAdminTests(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Necklaces", slug="necklaces")
        self.collection = Collection.objects.create(name="Evening", slug="evening")
        self.user = get_user_model().objects.create_superuser(
            username="phase3-admin", email="admin@example.com", password="test-password"
        )
        self.client.force_login(self.user)

    def product_kwargs(self, **overrides):
        values = {
            "name": "Test Necklace", "slug": "test-necklace", "product_code": "AJ-TEST-001",
            "category": self.category, "price": Decimal("1200.00"),
            "short_description": "A test product.", "description": "A longer description.",
            "material": "Gold-tone", "color": "Gold", "finish": "Polished",
        }
        values.update(overrides)
        return values

    def image_formset(self, product, rows):
        FormSet = inlineformset_factory(
            Product, ProductImage, formset=ProductImageInlineFormSet,
            form=ProductImageAdminForm, extra=0, can_delete=True,
        )
        data = {"images-TOTAL_FORMS": str(len(rows)), "images-INITIAL_FORMS": "0",
                "images-MIN_NUM_FORMS": "0", "images-MAX_NUM_FORMS": "1000"}
        for index, row in enumerate(rows):
            for field in ("source_path", "secure_url", "alt_text", "sort_order", "provenance_status"):
                data[f"images-{index}-{field}"] = row.get(field, "")
            data[f"images-{index}-is_primary"] = "on" if row.get("is_primary") else ""
            data[f"images-{index}-DELETE"] = "on" if row.get("DELETE") else ""
        return FormSet(data, instance=product, prefix="images")

    def test_admin_registration_and_security_configuration(self):
        self.assertIsInstance(admin.site._registry[Category], CategoryAdmin)
        self.assertIsInstance(admin.site._registry[Collection], CollectionAdmin)
        self.assertIsInstance(admin.site._registry[Product], ProductAdmin)
        self.assertNotIn(ProductImage, admin.site._registry)
        self.assertIn(ProductImageInline, ProductAdmin.inlines)

    def test_admin_authentication_and_catalog_pages(self):
        self.client.logout()
        response = self.client.get(reverse("admin:index"))
        self.assertEqual(response.status_code, 302)
        self.client.force_login(self.user)
        for model in (Category, Collection, Product):
            response = self.client.get(reverse(f"admin:catalog_{model._meta.model_name}_changelist"))
            self.assertEqual(response.status_code, 200)
        self.assertEqual(self.client.get(reverse("admin:catalog_product_add")).status_code, 200)

    def test_admin_configuration_protects_slugs_legacy_fields_and_publication(self):
        category_admin = admin.site._registry[Category]
        collection_admin = admin.site._registry[Collection]
        product_admin = admin.site._registry[Product]
        self.assertEqual(category_admin.get_prepopulated_fields(None), {"slug": ("name",)})
        self.assertIn("created_at", category_admin.get_readonly_fields(None))
        self.assertIn("updated_at", collection_admin.get_readonly_fields(None))
        self.assertIn("legacy_image_path", collection_admin.get_readonly_fields(None))
        product = Product.objects.create(**self.product_kwargs())
        self.assertIn("slug", product_admin.get_readonly_fields(None, product))
        self.assertIn("legacy_key", product_admin.get_readonly_fields(None, product))
        self.assertNotIn("is_published", product_admin.list_editable)
        self.assertEqual(product_admin.autocomplete_fields, ("category", "collections"))

    def test_published_product_requires_active_category_and_usable_primary(self):
        product = Product(**self.product_kwargs(is_published=True))
        formset = self.image_formset(product, [])
        self.assertFalse(formset.is_valid())
        self.assertTrue(Category.objects.filter(is_active=True).exists())
        product.category.is_active = False
        product.category.save(update_fields=["is_active"])
        from catalog.forms import ProductAdminForm
        form = ProductAdminForm({**self.product_kwargs(is_published=True), "category": str(self.category.pk)})
        self.assertFalse(form.is_valid())

    def test_inline_publication_handles_add_delete_retire_and_replacement(self):
        product = Product(**self.product_kwargs(is_published=True))
        valid = self.image_formset(product, [{"source_path": "demo/necklace.jpg", "alt_text": "Demo", "sort_order": 0, "is_primary": True, "provenance_status": "representative_demo"}])
        self.assertTrue(valid.is_valid(), valid.errors)
        retired = self.image_formset(product, [{"source_path": "demo/necklace.jpg", "alt_text": "Demo", "sort_order": 0, "is_primary": True, "provenance_status": "retired"}])
        self.assertFalse(retired.is_valid())
        replacement = self.image_formset(product, [
            {"source_path": "demo/old.jpg", "alt_text": "Old", "sort_order": 0, "is_primary": True, "provenance_status": "representative_demo", "DELETE": True},
            {"source_path": "demo/new.jpg", "alt_text": "New", "sort_order": 1, "is_primary": True, "provenance_status": "representative_demo"},
        ])
        self.assertTrue(replacement.is_valid(), replacement.errors)

    def test_provenance_and_primary_duplicates_are_rejected(self):
        draft = Product(**self.product_kwargs())
        verified = self.image_formset(draft, [{"source_path": "demo/x.jpg", "alt_text": "x", "sort_order": 0, "is_primary": True, "provenance_status": "verified_product"}])
        self.assertFalse(verified.is_valid())
        duplicate = self.image_formset(draft, [
            {"source_path": "demo/x.jpg", "alt_text": "x", "sort_order": 0, "is_primary": True, "provenance_status": "representative_demo"},
            {"source_path": "demo/y.jpg", "alt_text": "y", "sort_order": 1, "is_primary": True, "provenance_status": "representative_demo"},
        ])
        self.assertFalse(duplicate.is_valid())
