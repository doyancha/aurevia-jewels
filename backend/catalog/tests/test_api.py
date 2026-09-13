from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIClient

from catalog.models import Category, Collection, Product, ProductImage


class CatalogApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(
            name="Necklaces", slug="necklaces", description="Necklace designs", display_order=1
        )
        self.other_category = Category.objects.create(
            name="Rings", slug="rings", display_order=2
        )
        self.active_collection = Collection.objects.create(
            name="Evening", slug="evening", description="Evening pieces", display_order=1,
            legacy_image_path="/images/source/evening.jpg",
        )
        self.inactive_collection = Collection.objects.create(
            name="Private", slug="private", is_active=False, display_order=0
        )

    def product(self, **overrides):
        values = {
            "name": "Test Necklace", "slug": "test-necklace", "product_code": "AJ-TEST-001",
            "category": self.category, "price": Decimal("1250.00"),
            "compare_at_price": Decimal("1500.00"), "short_description": "A short description.",
            "description": "A description.", "long_description": "A long description.",
            "material": "Gold-tone", "color": "Gold", "finish": "Polished",
            "dimensions": "10 cm", "occasions": ["Wedding"], "tags": ["gold-tone"],
            "badges": ["Best Seller"], "is_published": True, "display_order": 1,
        }
        values.update(overrides)
        return Product.objects.create(**values)

    def primary_image(self, product, **overrides):
        values = {
            "product": product, "source_path": "/images/source/necklace.jpg", "alt_text": "Necklace",
            "sort_order": 0, "is_primary": True, "width": 1200, "height": 1200,
        }
        values.update(overrides)
        return ProductImage.objects.create(**values)

    def test_api_root_and_anonymous_read_routes(self):
        self.assertEqual(self.client.get("/api/v1/").status_code, 200)
        self.assertEqual(self.client.get("/api/v1/categories/").status_code, 200)
        self.assertEqual(self.client.get("/api/v1/categories/necklaces/").status_code, 200)
        self.assertEqual(self.client.get("/api/v1/collections/").status_code, 200)
        self.assertEqual(self.client.get("/api/v1/collections/evening/").status_code, 200)
        product = self.product()
        self.primary_image(product)
        self.assertEqual(self.client.get("/api/v1/products/").status_code, 200)
        self.assertEqual(self.client.get(f"/api/v1/products/{product.slug}/").status_code, 200)

    def test_taxonomy_is_active_only_and_ordered(self):
        Category.objects.create(name="Amethyst", slug="amethyst", display_order=1)
        category_data = self.client.get("/api/v1/categories/").json()
        self.assertEqual([item["slug"] for item in category_data], ["amethyst", "necklaces", "rings"])
        inactive_category = Category.objects.create(name="Hidden", slug="hidden", is_active=False)
        self.assertNotIn("hidden", [item["slug"] for item in self.client.get("/api/v1/categories/").json()])
        self.assertEqual(self.client.get(f"/api/v1/categories/{inactive_category.slug}/").status_code, 404)

        collection_data = self.client.get("/api/v1/collections/").json()
        self.assertEqual([item["slug"] for item in collection_data], ["evening"])
        self.assertEqual(self.client.get("/api/v1/collections/private/").status_code, 404)
        self.assertEqual(collection_data[0]["image_url"], "/images/source/evening.jpg")
        self.assertNotIn("legacy_image_path", collection_data[0])
        self.assertNotIn("is_active", collection_data[0])

    def test_product_contract_and_public_media(self):
        product = self.product(availability_status=Product.AvailabilityStatus.MADE_TO_ORDER)
        product.collections.add(self.active_collection, self.inactive_collection)
        self.primary_image(product)
        ProductImage.objects.create(
            product=product, source_path="/images/source/retired.jpg", alt_text="Retired",
            sort_order=1, provenance_status=ProductImage.ProvenanceStatus.RETIRED,
        )
        data = self.client.get(f"/api/v1/products/{product.slug}/").json()
        self.assertEqual(data["price"], "1250.00")
        self.assertEqual(data["compare_at_price"], "1500.00")
        self.assertEqual(data["availability_status"], "made_to_order")
        self.assertEqual(data["availability_label"], "Made to Order")
        self.assertEqual(data["occasions"], ["Wedding"])
        self.assertEqual(data["category"], {"name": "Necklaces", "slug": "necklaces"})
        self.assertEqual(data["collections"], [{"name": "Evening", "slug": "evening"}])
        self.assertEqual(data["images"][0]["url"], "/images/source/necklace.jpg")
        self.assertNotIn("retired.jpg", str(data["images"]))
        for field in ("legacy_key", "legacy_code", "is_published", "display_order", "created_at", "updated_at"):
            self.assertNotIn(field, data)
        for field in ("cloudinary_public_id", "source_path", "secure_url", "provenance_status", "created_at", "updated_at"):
            self.assertNotIn(field, data["images"][0])

        product.compare_at_price = None
        product.save(update_fields=["compare_at_price"])
        self.assertIsNone(self.client.get(f"/api/v1/products/{product.slug}/").json()["compare_at_price"])

    def test_cloudinary_url_takes_precedence_and_legacy_url_remains_valid(self):
        product = self.product()
        self.primary_image(product, source_path="/images/source/old.jpg", cloudinary_public_id="aurevia-jewels/products/test", secure_url="https://res.cloudinary.com/demo/image/upload/test.jpg")
        data = self.client.get(f"/api/v1/products/{product.slug}/").json()
        self.assertEqual(data["images"][0]["url"], "https://res.cloudinary.com/demo/image/upload/test.jpg")
        self.assertNotIn("CLOUDINARY_API_SECRET", str(data))

    def test_product_public_eligibility_is_enforced_at_queryset_boundary(self):
        cases = [
            ("unpublished", {"is_published": False}, "valid"),
            ("no-image", {}, "none"),
            ("non-primary", {}, "non-primary"),
            ("retired-primary", {}, "retired"),
            ("empty-locator", {}, "empty"),
        ]
        for suffix, kwargs, image_kind in cases:
            product = self.product(slug=f"{suffix}-product", product_code=f"AJ-{suffix.upper()}", **kwargs)
            if image_kind == "valid":
                self.primary_image(product)
            elif image_kind == "non-primary":
                self.primary_image(product, is_primary=False)
            elif image_kind == "retired":
                self.primary_image(product, provenance_status=ProductImage.ProvenanceStatus.RETIRED)
            elif image_kind == "empty":
                self.primary_image(product, source_path="")
            self.assertEqual(self.client.get(f"/api/v1/products/{product.slug}/").status_code, 404)

        inactive = Category.objects.create(name="Inactive", slug="inactive")
        inactive.is_active = False
        inactive.save(update_fields=["is_active"])
        product = self.product(slug="inactive-category-product", product_code="AJ-INACTIVE", category=inactive)
        self.primary_image(product)
        self.assertEqual(self.client.get(f"/api/v1/products/{product.slug}/").status_code, 404)

    def test_ordering_and_read_only_methods(self):
        first = self.product(slug="a-product", product_code="AJ-A", name="A", display_order=1)
        second = self.product(slug="b-product", product_code="AJ-B", name="B", display_order=1)
        self.primary_image(first)
        self.primary_image(second)
        self.assertEqual([item["slug"] for item in self.client.get("/api/v1/products/").json()], ["a-product", "b-product"])
        for path, method in (("/api/v1/products/", "post"), ("/api/v1/products/a-product/", "put"), ("/api/v1/products/a-product/", "patch"), ("/api/v1/products/a-product/", "delete"), ("/api/v1/categories/", "post"), ("/api/v1/collections/", "post")):
            self.assertEqual(getattr(self.client, method)(path, {}, format="json").status_code, 405)

    def test_missing_resources_return_404_and_no_product_image_route_exists(self):
        for path in ("/api/v1/categories/missing/", "/api/v1/collections/missing/", "/api/v1/products/missing/", "/api/v1/product-images/", "/api/v1/images/"):
            self.assertEqual(self.client.get(path).status_code, 404)

    def test_product_list_avoids_per_product_relation_queries(self):
        first = self.product(slug="query-a", product_code="AJ-QUERY-A", name="A")
        second = self.product(slug="query-b", product_code="AJ-QUERY-B", name="B")
        first.collections.add(self.active_collection)
        second.collections.add(self.active_collection)
        self.primary_image(first)
        self.primary_image(second)
        with self.assertNumQueries(3):
            response = self.client.get("/api/v1/products/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 2)
