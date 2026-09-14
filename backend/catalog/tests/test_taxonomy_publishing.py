from decimal import Decimal

from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.test import Client, TestCase
from django.urls import reverse

from catalog.models import Category, Collection, Product, ProductImage
from catalog.publishing import get_publish_readiness_errors


class TaxonomyPublishingAdminTests(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Rings", slug="rings")
        self.other_category = Category.objects.create(name="Necklaces", slug="necklaces")
        self.collection = Collection.objects.create(name="Evening", slug="evening")
        user = get_user_model().objects.create_user(username="taxonomy-admin", password="test-password", is_staff=True)
        permissions = []
        for model in (Category, Collection, Product, ProductImage):
            permissions.extend(ContentType.objects.get_for_model(model).permission_set.all())
        user.user_permissions.set(permissions)
        self.client = Client()
        self.client.force_login(user)

    def product(self, **overrides):
        values = {
            "name": "QA Ring", "slug": "qa-ring", "product_code": "AJ-TAX-QA",
            "category": self.category, "price": Decimal("100.00"),
            "short_description": "A ring for QA.", "description": "A longer ring description.",
            "material": "Demo material", "color": "Gold", "finish": "Polished",
        }
        values.update(overrides)
        return Product.objects.create(**values)

    def test_category_management_counts_stable_slug_and_safe_delete(self):
        product = self.product()
        change = reverse("admin:catalog_category_change", args=[self.category.pk])
        response = self.client.get(change)
        self.assertEqual(response.status_code, 200)
        self.assertNotContains(response, 'name="slug"')
        self.assertContains(response, "Products")
        self.assertContains(response, "View category results")
        delete = reverse("admin:catalog_category_delete", args=[self.category.pk])
        response = self.client.post(delete, {"post": "yes"})
        self.assertEqual(response.status_code, 302)
        self.assertTrue(Category.objects.filter(pk=self.category.pk).exists())
        self.assertTrue(Product.objects.filter(pk=product.pk).exists())

    def test_collection_membership_cover_and_safe_delete(self):
        product = self.product()
        image = ProductImage.objects.create(product=product, source_path="/media/admin-product/qa.png", alt_text="QA ring", is_primary=True)
        response = self.client.post(
            reverse("admin:catalog_collection_change", args=[self.collection.pk]),
            {"name": self.collection.name, "slug": self.collection.slug, "description": "", "is_active": "on", "display_order": "0", "products": [str(product.pk)]},
        )
        self.assertEqual(response.status_code, 302, response.content)
        self.assertTrue(self.collection.products.filter(pk=product.pk).exists())
        collection_admin = __import__("django.contrib.admin", fromlist=["site"]).site._registry[Collection]
        row = collection_admin.get_queryset(None).get(pk=self.collection.pk)
        self.assertEqual(collection_admin.member_product_count(row), 1)
        self.assertEqual(collection_admin.resolved_cover_source(row), product)
        self.assertContains(self.client.get(reverse("admin:catalog_collection_change", args=[self.collection.pk])), "Resolved cover")
        response = self.client.post(reverse("admin:catalog_collection_delete", args=[self.collection.pk]), {"post": "yes"})
        self.assertEqual(response.status_code, 302)
        self.assertTrue(Collection.objects.filter(pk=self.collection.pk).exists())
        self.assertTrue(ProductImage.objects.filter(pk=image.pk).exists())

    def test_empty_collection_has_no_cover_markup(self):
        response = self.client.get(reverse("admin:catalog_collection_change", args=[self.collection.pk]))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "No cover available")
        self.assertNotContains(response, '<img src="">')

    def test_publication_readiness_allows_drafts_and_requires_valid_primary(self):
        draft = self.product(product_code="AJ-DRAFT-QA", slug="draft-qa")
        self.assertFalse(get_publish_readiness_errors(draft) == [])
        image = ProductImage.objects.create(product=draft, source_path="/media/admin-product/draft.png", alt_text="Draft ring", is_primary=True)
        self.assertEqual(get_publish_readiness_errors(draft), [])
        draft.is_published = True
        draft.save(update_fields=["is_published"])
        self.assertEqual(get_publish_readiness_errors(draft), [])
        self.assertEqual(image.provenance_status, ProductImage.ProvenanceStatus.REPRESENTATIVE_DEMO)

    def test_published_product_without_media_is_rejected_by_admin_form(self):
        data = {
            "product_code": "AJ-PUBLISH-QA", "name": "Publishing QA", "slug": "publishing-qa",
            "category": str(self.category.pk), "price": "100.00", "compare_at_price": "",
            "currency_code": "BDT", "availability_status": Product.AvailabilityStatus.ASK_ABOUT_AVAILABILITY,
            "short_description": "QA short", "description": "QA description", "long_description": "",
            "material": "Demo", "color": "Gold", "finish": "Polished", "dimensions": "",
            "occasions": "[]", "tags": "[]", "badges": "[]", "seo_title": "", "seo_description": "",
            "display_order": "0", "is_published": "on", "_save": "Save",
            "images-TOTAL_FORMS": "0", "images-INITIAL_FORMS": "0", "images-MIN_NUM_FORMS": "0", "images-MAX_NUM_FORMS": "1000",
        }
        response = self.client.post(reverse("admin:catalog_product_add"), data)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Add at least one valid product image before publishing")
        self.assertFalse(Product.objects.filter(product_code="AJ-PUBLISH-QA").exists())

    def test_unpublished_preview_requires_admin_and_does_not_publish(self):
        product = self.product(product_code="AJ-PREVIEW-QA", slug="preview-qa")
        preview = reverse("admin:catalog_product_preview", args=[product.pk])
        self.client.logout()
        self.assertEqual(self.client.get(preview).status_code, 302)
        customer = get_user_model().objects.create_user(username="customer")
        self.client.force_login(customer)
        self.assertEqual(self.client.get(preview).status_code, 302)
        admin_user = get_user_model().objects.get(username="taxonomy-admin")
        self.client.force_login(admin_user)
        response = self.client.get(preview)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Secure owner preview")
        product.refresh_from_db()
        self.assertFalse(product.is_published)

    def test_taxonomy_admin_has_no_mass_delete_action(self):
        from django.contrib import admin
        for model in (Category, Collection, Product):
            model_admin = admin.site._registry[model]
            request = self.client.get(reverse("admin:index")).wsgi_request
            self.assertNotIn("delete_selected", model_admin.get_actions(request))
