import csv
from decimal import Decimal
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

from django.core.management import call_command, CommandError
from django.test import TestCase

from catalog.models import Category, Product, ProductImage
from catalog.onboarding import CatalogPackage, validate_package


class OnboardingValidationTests(TestCase):
    def product(self, **overrides):
        value = {"product_code": "AJ-001", "name": "Verified item", "slug": "verified-item", "category": "necklaces", "price": "1200.00", "availability": "ask_about_availability", "published": "true", "short_description": "Approved copy", "description": "Approved description", "material": "Owner verified", "color": "Owner verified", "finish": "Owner verified"}
        value.update(overrides)
        return value

    def image(self, **overrides):
        value = {"product_code": "AJ-001", "local_filename": "images/AJ-001/01.png", "alt_text": "Verified item product image", "sort_order": "0", "is_primary": "true", "source_classification": "verified_product"}
        value.update(overrides)
        return value

    def package(self, products=None, media=None):
        return CatalogPackage(products or [self.product()], media or [self.image()])

    def test_valid_manifest_and_verified_classification(self):
        with TemporaryDirectory() as directory:
            root = Path(directory); image = root / "images/AJ-001/01.png"; image.parent.mkdir(parents=True); image.write_bytes(b"\x89PNG\r\n\x1a\n" + b"0" * 100)
            report = validate_package(self.package(), root)
        self.assertFalse(report["errors"])

    def test_rejects_duplicate_identity_unknowns_bad_price_missing_image_and_demo(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)
            report = validate_package(self.package([self.product(), self.product(slug="other")], [self.image(source_classification="representative_demo", local_filename="../bad.jpg"), self.image(sort_order="0")]), root)
        self.assertTrue(report["errors"])
        self.assertTrue(any("duplicate" in e for e in report["errors"]))

    def test_dry_run_command_does_not_mutate_or_upload(self):
        with TemporaryDirectory() as directory:
            root = Path(directory); (root / "images").mkdir()
            with (root / "products.csv").open("w", newline="") as handle:
                writer = csv.DictWriter(handle, fieldnames=["product_code"]); writer.writeheader(); writer.writerow({"product_code": "AJ-001"})
            with patch("catalog.media.uploader.upload") as upload, self.assertRaises(CommandError):
                call_command("validate_catalog_onboarding", root, "--dry-run")
            self.assertEqual(Category.objects.count(), 0); self.assertEqual(Product.objects.count(), 0); self.assertEqual(ProductImage.objects.count(), 0); upload.assert_not_called()
