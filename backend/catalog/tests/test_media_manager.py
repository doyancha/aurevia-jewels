import base64
from decimal import Decimal
from tempfile import TemporaryDirectory

from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.test import Client, TestCase, override_settings
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile

from catalog.models import Category, Product, ProductImage


TINY_PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk"
    "+A8AAQUBAScY42YAAAAASUVORK5CYII="
)


@override_settings(CATALOG_MEDIA_BACKEND="local")
class ProductMediaManagerTests(TestCase):
    def setUp(self):
        self.media_dir = TemporaryDirectory()
        self.settings = override_settings(MEDIA_ROOT=self.media_dir.name)
        self.settings.enable()
        self.category = Category.objects.create(name="Necklaces", slug="necklaces")
        self.product = Product.objects.create(
            name="Media Manager QA Draft", slug="media-manager-qa",
            product_code="AJ-MEDIA-QA", category=self.category, price=Decimal("100.00"),
            short_description="QA", description="QA", material="Gold-tone",
            color="Gold", finish="Polished",
        )
        user = get_user_model().objects.create_user(username="media-admin", password="test-password", is_staff=True)
        permissions = ContentType.objects.get_for_model(ProductImage).permission_set.all()
        user.user_permissions.set(permissions | ContentType.objects.get_for_model(Product).permission_set.all())
        self.client = Client()
        self.client.force_login(user)

    def tearDown(self):
        self.settings.disable()
        self.media_dir.cleanup()

    def url(self, action, image=None):
        if action == "add":
            return reverse("admin:catalog_product_media_add", args=[self.product.pk])
        return reverse(f"admin:catalog_product_media_{action}", args=[self.product.pk, image.pk])

    def upload(self, name="qa.png", alt="QA product image"):
        return SimpleUploadedFile(name, TINY_PNG, content_type="image/png"), alt

    def add_image(self, name="qa.png", alt="QA product image"):
        upload, alt = self.upload(name, alt)
        response = self.client.post(self.url("add"), {"alt_text": alt, "upload_file": upload})
        self.assertEqual(response.status_code, 302, response.content)
        return ProductImage.objects.latest("pk")

    def test_upload_replace_primary_alt_reorder_remove_and_api_coherence(self):
        first = self.add_image(alt="First")
        self.assertTrue(first.is_primary)
        second = self.add_image(name="second.png", alt="Second")
        third = self.add_image(name="third.png", alt="Third")
        self.assertEqual(list(self.product.images.values_list("sort_order", flat=True)), [0, 1, 2])
        self.assertEqual(self.product.images.filter(is_primary=True).count(), 1)

        response = self.client.post(self.url("primary", third))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(ProductImage.objects.get(pk=third.pk).is_primary, True)
        self.assertEqual(ProductImage.objects.get(pk=first.pk).is_primary, False)

        response = self.client.post(self.url("alt", second), {"alt_text": "  Second   view "})
        self.assertEqual(response.status_code, 302)
        self.assertEqual(ProductImage.objects.get(pk=second.pk).alt_text, "Second view")

        response = self.client.post(
            reverse("admin:catalog_product_media_reorder", args=[self.product.pk]),
            {"order": [str(third.pk), str(first.pk), str(second.pk)]},
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(list(self.product.images.order_by("sort_order").values_list("pk", flat=True)), [third.pk, first.pk, second.pk])

        replacement, _ = self.upload("replacement.png", "Replacement")
        response = self.client.post(self.url("replace", first), {"alt_text": "Replacement", "upload_file": replacement})
        self.assertEqual(response.status_code, 302)
        first.refresh_from_db()
        self.assertEqual(first.alt_text, "Replacement")
        self.assertTrue(first.source_path.startswith("/media/admin-product/"))

        response = self.client.post(self.url("remove", second))
        self.assertEqual(response.status_code, 302)
        self.assertFalse(ProductImage.objects.filter(pk=second.pk).exists())
        self.assertEqual(self.product.images.count(), 2)
        self.assertEqual(self.product.images.filter(is_primary=True).count(), 1)

        self.product.is_published = True
        self.product.save(update_fields=["is_published"])
        api_response = self.client.get(f"/api/v1/products/{self.product.slug}/")
        self.assertEqual(api_response.status_code, 200)
        self.assertEqual(len(api_response.json()["images"]), 2)
        self.assertTrue(api_response.json()["images"][0]["url"].startswith("/media/admin-product/"))

    def test_uploaded_media_is_representative_demo_and_invalid_files_are_rejected(self):
        image = self.add_image()
        self.assertEqual(image.provenance_status, ProductImage.ProvenanceStatus.REPRESENTATIVE_DEMO)
        self.assertNotIn("..", image.source_path)
        invalid = SimpleUploadedFile("evil.png", b"not-an-image", content_type="image/png")
        response = self.client.post(self.url("add"), {"alt_text": "Invalid", "upload_file": invalid})
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "valid image")
        oversized = SimpleUploadedFile("large.png", b"x" * (10 * 1024 * 1024 + 1), content_type="image/png")
        response = self.client.post(self.url("add"), {"alt_text": "Large", "upload_file": oversized})
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "10 MiB or smaller")
        svg = SimpleUploadedFile("vector.svg", b"<svg></svg>", content_type="image/svg+xml")
        response = self.client.post(self.url("add"), {"alt_text": "SVG", "upload_file": svg})
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "JPG, PNG, WebP, or AVIF")

    def test_csrf_permissions_and_product_scope_are_enforced(self):
        csrf_client = Client(enforce_csrf_checks=True)
        csrf_client.force_login(self.client.session.get("_auth_user_id") and get_user_model().objects.get(username="media-admin"))
        upload, alt = self.upload()
        self.assertEqual(csrf_client.post(self.url("add"), {"alt_text": alt, "upload_file": upload}).status_code, 403)
        other = Product.objects.create(
            name="Other", slug="other", product_code="AJ-OTHER", category=self.category,
            price=Decimal("100"), short_description="Other", description="Other",
            material="Gold", color="Gold", finish="Polished",
        )
        image = ProductImage.objects.create(product=other, source_path="/other.png", alt_text="Other", is_primary=True)
        self.assertEqual(self.client.post(self.url("remove", image)).status_code, 404)

    def test_published_product_cannot_remove_its_last_image(self):
        image = self.add_image()
        self.product.is_published = True
        self.product.save(update_fields=["is_published"])
        response = self.client.post(self.url("remove", image))
        self.assertEqual(response.status_code, 302)
        self.assertTrue(ProductImage.objects.filter(pk=image.pk).exists())

    def test_product_change_page_exposes_bounded_media_preview_and_controls(self):
        image = self.add_image(alt="Visible QA image")
        response = self.client.get(reverse("admin:catalog_product_change", args=[self.product.pk]))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Visible QA image")
        self.assertContains(response, "Set primary")
        self.assertContains(response, "Upload image")
        self.assertContains(response, "max-width")
        self.assertNotContains(response, "file://")
        self.assertTrue(image.source_path.startswith("/media/admin-product/"))
