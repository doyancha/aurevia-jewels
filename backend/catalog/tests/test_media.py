from decimal import Decimal
from unittest.mock import patch

from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import IntegrityError, transaction
from django.test import TestCase
from django.forms.models import inlineformset_factory

from catalog import media
from catalog.models import Category, Product, ProductImage
from catalog.forms import ProductImageAdminForm, ProductImageInlineFormSet


class CloudinaryMediaTests(TestCase):
    def setUp(self):
        category = Category.objects.create(name="Necklaces", slug="necklaces")
        self.product = Product.objects.create(
            name="Test Necklace", slug="test-necklace", product_code="AJ-TEST-001",
            category=category, price=Decimal("1200.00"), short_description="Test",
            description="Test description", material="Gold-tone", color="Gold", finish="Polished",
        )

    def image_file(self, name="necklace.png", size=8):
        return SimpleUploadedFile(name, b"x" * size, content_type="image/png")

    def response(self, public_id):
        return {
            "public_id": public_id, "secure_url": "https://res.cloudinary.com/demo/image/upload/x.png",
            "resource_type": "image", "width": 800, "height": 600, "format": "png",
        }

    def test_upload_validates_and_maps_metadata(self):
        with patch("catalog.media.uploader.upload") as upload:
            upload.side_effect = lambda file, **kwargs: self.response(kwargs["public_id"])
            result = media.upload_image(self.image_file())
        self.assertTrue(result["cloudinary_public_id"].startswith(media.PUBLIC_ID_PREFIX))
        self.assertEqual(result["secure_url"].split(":", 1)[0], "https")
        upload.assert_called_once()
        self.assertEqual(upload.call_args.kwargs["resource_type"], "image")
        self.assertFalse(upload.call_args.kwargs["overwrite"])

    def test_upload_rejects_oversized_and_disallowed_files(self):
        with self.assertRaises(ValidationError):
            media.validate_upload_file(self.image_file(size=media.MAX_UPLOAD_SIZE + 1))
        with self.assertRaises(ValidationError):
            media.validate_upload_file(self.image_file(name="necklace.gif"))

    def test_malformed_response_is_rejected_and_cleaned(self):
        with patch("catalog.media.uploader.upload") as upload, patch("catalog.media.uploader.destroy") as destroy:
            upload.side_effect = lambda file, **kwargs: {**self.response(kwargs["public_id"]), "secure_url": "http://unsafe"}
            destroy.return_value = {"result": "ok"}
            with self.assertRaises(ValidationError):
                media.upload_image(self.image_file())
        destroy.assert_called_once()

    def test_destroy_ok_and_not_found_are_idempotent(self):
        with patch("catalog.media.uploader.destroy", side_effect=[{"result": "ok"}, {"result": "not found"}]) as destroy:
            self.assertTrue(media.destroy_remote_asset("aurevia-jewels/products/one"))
            self.assertTrue(media.destroy_remote_asset("aurevia-jewels/products/two"))
        self.assertEqual(destroy.call_count, 2)

    def test_cloudinary_ownership_and_metadata_pair_are_database_enforced(self):
        ProductImage.objects.create(
            product=self.product, alt_text="One", sort_order=0,
            cloudinary_public_id="aurevia-jewels/products/one",
            secure_url="https://res.cloudinary.com/demo/image/upload/one.png",
        )
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                ProductImage.objects.create(
                    product=self.product, alt_text="Two", sort_order=1,
                    cloudinary_public_id="aurevia-jewels/products/one",
                    secure_url="https://res.cloudinary.com/demo/image/upload/one.png",
                )
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                ProductImage.objects.create(
                    product=self.product, alt_text="Bad", sort_order=2,
                    cloudinary_public_id="aurevia-jewels/products/bad",
                )

    def test_product_image_delete_schedules_owned_asset_cleanup(self):
        image = ProductImage.objects.create(
            product=self.product, alt_text="One", cloudinary_public_id="aurevia-jewels/products/one",
            secure_url="https://res.cloudinary.com/demo/image/upload/one.png",
        )
        with patch("catalog.signals.destroy_remote_asset") as destroy:
            with self.captureOnCommitCallbacks(execute=True):
                image.delete()
        destroy.assert_called_once_with("aurevia-jewels/products/one")

    def test_replacement_persists_new_asset_then_deletes_old_after_commit(self):
        image = ProductImage.objects.create(
            product=self.product, alt_text="One", cloudinary_public_id="aurevia-jewels/products/old",
            secure_url="https://res.cloudinary.com/demo/image/upload/old.png",
        )
        FormSet = inlineformset_factory(
            Product, ProductImage, form=ProductImageAdminForm,
            formset=ProductImageInlineFormSet, extra=0, can_delete=True,
        )
        data = {
            "images-TOTAL_FORMS": "1", "images-INITIAL_FORMS": "1",
            "images-MIN_NUM_FORMS": "0", "images-MAX_NUM_FORMS": "1000",
            "images-0-id": str(image.pk), "images-0-source_path": "",
            "images-0-cloudinary_public_id": image.cloudinary_public_id,
            "images-0-secure_url": image.secure_url, "images-0-alt_text": "One",
            "images-0-sort_order": "0", "images-0-is_primary": "on",
            "images-0-provenance_status": "representative_demo", "images-0-DELETE": "",
        }
        files = {"images-0-upload_file": self.image_file()}
        formset = FormSet(data, files, instance=self.product, prefix="images")
        self.assertTrue(formset.is_valid(), formset.errors)
        new_metadata = {
            "cloudinary_public_id": "aurevia-jewels/products/new",
            "secure_url": "https://res.cloudinary.com/demo/image/upload/new.png",
            "width": 100, "height": 100,
        }
        with patch("catalog.forms.upload_image", return_value=new_metadata), patch(
            "catalog.forms.destroy_remote_asset", return_value=True
        ) as destroy:
            with self.captureOnCommitCallbacks(execute=True):
                formset.save()
        image.refresh_from_db()
        self.assertEqual(image.cloudinary_public_id, "aurevia-jewels/products/new")
        destroy.assert_called_once_with("aurevia-jewels/products/old")

    def test_product_cascade_schedules_all_owned_assets(self):
        ProductImage.objects.create(
            product=self.product, alt_text="One", sort_order=0,
            cloudinary_public_id="aurevia-jewels/products/one",
            secure_url="https://res.cloudinary.com/demo/image/upload/one.png",
        )
        ProductImage.objects.create(
            product=self.product, alt_text="Two", sort_order=1,
            cloudinary_public_id="aurevia-jewels/products/two",
            secure_url="https://res.cloudinary.com/demo/image/upload/two.png",
        )
        with patch("catalog.signals.destroy_remote_asset") as destroy:
            with self.captureOnCommitCallbacks(execute=True):
                self.product.delete()
        self.assertCountEqual([call.args[0] for call in destroy.call_args_list], [
            "aurevia-jewels/products/one", "aurevia-jewels/products/two",
        ])
