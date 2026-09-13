from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.db.models.deletion import ProtectedError
from django.test import TestCase

from catalog.models import Category, Collection, Product, ProductImage


class CatalogModelTests(TestCase):
    def product_kwargs(self, **overrides):
        values = {
            "name": "Test Necklace",
            "slug": "test-necklace",
            "product_code": "AJ-TEST-001",
            "category": self.category,
            "price": Decimal("1200.00"),
            "short_description": "A test product.",
            "description": "A longer test product description.",
            "material": "Gold-tone finish",
            "color": "Gold",
            "finish": "Polished",
        }
        values.update(overrides)
        return values

    def setUp(self):
        self.category = Category.objects.create(name="Necklaces", slug="necklaces")
        self.collection = Collection.objects.create(name="Evening", slug="evening")

    def test_category_defaults_ordering_and_string(self):
        later = Category.objects.create(name="Earlier Alphabetically", slug="earlier", display_order=1)
        first = Category.objects.create(name="First", slug="first", display_order=0)

        self.assertEqual(list(Category.objects.values_list("name", flat=True)[:2]), ["First", "Necklaces"])
        self.assertEqual(str(self.category), "Necklaces")
        self.assertEqual(str(first), "First")
        self.assertTrue(self.category.is_active)
        self.assertEqual(later.display_order, 1)

    def test_category_slug_is_unique(self):
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Category.objects.create(name="Duplicate", slug="necklaces")

    def test_collection_is_independent_and_legacy_image_may_be_blank(self):
        self.assertEqual(self.collection.legacy_image_path, "")
        self.assertEqual(self.collection.products.count(), 0)
        self.assertEqual(str(self.collection), "Evening")

    def test_collection_slug_is_unique_and_ordered(self):
        Collection.objects.create(name="First", slug="first", display_order=0)
        self.assertEqual(Collection.objects.order_by("display_order").first().name, "Evening")
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Collection.objects.create(name="Duplicate", slug="evening")

    def test_product_defaults_relationships_and_string(self):
        product = Product.objects.create(**self.product_kwargs())
        product.collections.add(self.collection)

        self.assertFalse(product.is_published)
        self.assertFalse(product.is_featured)
        self.assertFalse(product.is_new_arrival)
        self.assertFalse(product.is_best_seller)
        self.assertEqual(product.category, self.category)
        self.assertEqual(list(product.collections.all()), [self.collection])
        self.assertEqual(product.availability_status, Product.AvailabilityStatus.ASK_ABOUT_AVAILABILITY)
        self.assertEqual(str(product), "Test Necklace (AJ-TEST-001)")

    def test_product_unique_slug_and_code(self):
        Product.objects.create(**self.product_kwargs())
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Product.objects.create(**self.product_kwargs(product_code="AJ-TEST-002"))
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Product.objects.create(**self.product_kwargs(slug="another-necklace", product_code="AJ-TEST-001"))

    def test_legacy_key_allows_nulls_but_rejects_duplicate_non_null(self):
        Product.objects.create(**self.product_kwargs(legacy_key=None))
        Product.objects.create(**self.product_kwargs(slug="second", product_code="AJ-TEST-002", legacy_key=None))
        Product.objects.create(**self.product_kwargs(slug="third", product_code="AJ-TEST-003", legacy_key="p1"))
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Product.objects.create(**self.product_kwargs(slug="fourth", product_code="AJ-TEST-004", legacy_key="p1"))

    def test_price_and_compare_at_price_constraints_are_database_enforced(self):
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Product.objects.create(**self.product_kwargs(price=Decimal("-1.00")))
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Product.objects.create(**self.product_kwargs(compare_at_price=Decimal("1199.99")))

        equal = Product.objects.create(**self.product_kwargs(compare_at_price=Decimal("1200.00")))
        greater = Product.objects.create(
            **self.product_kwargs(slug="greater", product_code="AJ-TEST-002", compare_at_price=Decimal("1400.00"))
        )
        self.assertEqual(equal.compare_at_price, Decimal("1200.00"))
        self.assertEqual(greater.compare_at_price, Decimal("1400.00"))

    def test_availability_choices_and_string_list_validation(self):
        product = Product(**self.product_kwargs(availability_status=Product.AvailabilityStatus.MADE_TO_ORDER))
        product.full_clean()
        self.assertEqual(product.availability_status, "made_to_order")

        product.tags = ["gift", "evening"]
        product.full_clean()
        product.tags = {"invalid": "object"}
        with self.assertRaises(ValidationError):
            product.full_clean()

    def test_category_deletion_is_protected(self):
        Product.objects.create(**self.product_kwargs())
        with self.assertRaises(ProtectedError):
            self.category.delete()

    def test_product_image_defaults_and_nullable_dimensions(self):
        product = Product.objects.create(**self.product_kwargs())
        image = ProductImage.objects.create(product=product, alt_text="Test necklace")

        self.assertEqual(image.provenance_status, ProductImage.ProvenanceStatus.REPRESENTATIVE_DEMO)
        self.assertEqual(image.sort_order, 0)
        self.assertIsNone(image.width)
        self.assertIsNone(image.height)
        self.assertEqual(str(image), "Test Necklace (AJ-TEST-001) image 0")

        image.width = 800
        image.height = 800
        image.save()
        self.assertEqual((image.width, image.height), (800, 800))

    def test_product_image_sort_order_and_primary_constraints(self):
        product = Product.objects.create(**self.product_kwargs())
        other = Product.objects.create(**self.product_kwargs(slug="other", product_code="AJ-TEST-002"))
        ProductImage.objects.create(product=product, alt_text="Primary", is_primary=True)
        ProductImage.objects.create(product=other, alt_text="Other primary", is_primary=True)

        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                ProductImage.objects.create(product=product, alt_text="Duplicate primary", sort_order=1, is_primary=True)
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                ProductImage.objects.create(product=product, alt_text="Duplicate order", sort_order=0)

    def test_product_delete_cascades_images(self):
        product = Product.objects.create(**self.product_kwargs())
        ProductImage.objects.create(product=product, alt_text="To delete")
        product.delete()
        self.assertEqual(ProductImage.objects.count(), 0)
