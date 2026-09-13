from decimal import Decimal
from pathlib import Path
from unittest.mock import patch

from django.core.management import call_command, CommandError
from django.test import TestCase, override_settings

from catalog.legacy_import import CatalogImportError, extract_source, validate_source
from catalog.models import Category, Collection, Product, ProductImage


ROOT = Path(__file__).resolve().parents[3]


class LegacySourceTests(TestCase):
    def test_source_counts_and_paths(self):
        source = extract_source(ROOT)
        self.assertEqual(validate_source(source, ROOT), {"products": 24, "collections": 8, "categories": 8, "images": 48})

    def test_validation_rejects_duplicate_and_bad_references(self):
        source = extract_source(ROOT)
        source.products[1]["id"] = source.products[0]["id"]
        with self.assertRaises(CatalogImportError):
            validate_source(source, ROOT)

    def test_validation_rejects_traversal(self):
        source = extract_source(ROOT)
        source.products[0]["images"][0] = "/images/source/../../backend/manage.py"
        with self.assertRaises(CatalogImportError):
            validate_source(source, ROOT)


@override_settings(CLOUDINARY_CLOUD_NAME="test", CLOUDINARY_API_KEY="test", CLOUDINARY_API_SECRET="test")
class LegacyImportTests(TestCase):
    upload_sequence = 0

    @staticmethod
    def upload(file, **kwargs):
        LegacyImportTests.upload_sequence += 1
        return {"cloudinary_public_id": f"aurevia-jewels/products/test-{LegacyImportTests.upload_sequence}", "secure_url": f"https://res.cloudinary.com/test/image/upload/{LegacyImportTests.upload_sequence}.jpg", "width": 1200, "height": 1200}

    def run_import(self):
        with patch("catalog.media.upload_image", side_effect=self.upload) as upload:
            call_command("import_nextjs_catalog", "--apply")
        return upload

    def test_first_and_second_apply_are_idempotent(self):
        first = self.run_import()
        self.assertEqual((Category.objects.count(), Collection.objects.count(), Product.objects.count(), ProductImage.objects.count()), (8, 8, 24, 48))
        self.assertEqual(first.call_count, 48)
        self.assertEqual(Product.objects.filter(is_published=True).count(), 24)
        self.assertEqual(ProductImage.objects.filter(is_primary=True).count(), 24)
        self.assertEqual(ProductImage.objects.filter(provenance_status="representative_demo").count(), 48)
        second = self.run_import()
        self.assertEqual(second.call_count, 0)
        self.assertEqual(Product.objects.filter(slug="celestial-pearl-necklace").get().price, Decimal("2450.00"))

    def test_identity_drift_is_refused(self):
        category = Category.objects.create(name="Necklaces", slug="necklaces", is_active=True)
        Product.objects.create(legacy_key="p1", slug="wrong-slug", name="Changed", product_code="AJ-N001", category=category, price=Decimal("1.00"), short_description="x", description="x", material="x", color="x", finish="x")
        with patch("catalog.media.upload_image", side_effect=self.upload), self.assertRaises(CommandError):
            call_command("import_nextjs_catalog", "--apply")

    def test_dry_run_does_not_write_or_upload(self):
        with patch("catalog.media.upload_image", side_effect=self.upload) as upload:
            call_command("import_nextjs_catalog", "--dry-run")
        self.assertEqual(upload.call_count, 0)
        self.assertEqual(Product.objects.count(), 0)
