import json
from decimal import Decimal
from pathlib import Path

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from catalog.models import Category, Collection, Product, ProductImage


CONTRACT = json.loads((Path(__file__).resolve().parents[3] / "contracts/catalog-api-v1.json").read_text())


class CatalogContractTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(name="Necklaces", slug="necklaces", description="Necklace designs")
        self.other_category = Category.objects.create(name="Rings", slug="rings", description="Ring designs")
        self.collection = Collection.objects.create(name="Evening", slug="evening", description="Evening pieces")
        self.other_collection = Collection.objects.create(name="Bridal", slug="bridal", description="Bridal pieces")

    def product(self, **overrides):
        values = {
            "name": "Contract Necklace", "slug": "contract-necklace", "product_code": "AJ-CONTRACT-001",
            "category": self.category, "price": Decimal("1250.00"), "compare_at_price": Decimal("1500.00"),
            "short_description": "Short", "description": "Description", "long_description": "Long",
            "material": "Gold", "color": "Gold", "finish": "Polished", "dimensions": "10 cm",
            "occasions": ["Wedding"], "tags": ["gold"], "badges": ["Featured"], "is_published": True,
        }
        values.update(overrides)
        return Product.objects.create(**values)

    def image(self, product, **overrides):
        values = {"product": product, "source_path": "/images/source/contract.jpg", "alt_text": "Contract image", "is_primary": True, "sort_order": 0, "width": 1200, "height": 1200}
        values.update(overrides)
        return ProductImage.objects.create(**values)

    def assert_shape(self, value, fields):
        self.assertEqual(set(value), set(fields))

    def test_manifest_has_required_shape_and_matches_public_serializer_fields(self):
        self.assertEqual(CONTRACT["contract_version"], "v1")
        self.assertEqual(CONTRACT["api_prefix"], "/api/v1")
        self.assertEqual(set(CONTRACT["resources"]), {"categories", "collections", "products"})
        self.assertTrue(CONTRACT["semantics"]["read_only"])
        self.assertEqual(set(CONTRACT["resources"]["categories"]["fields"]), {"name", "slug", "description"})
        self.assertEqual(set(CONTRACT["resources"]["collections"]["fields"]), {"name", "slug", "description", "image_url"})
        self.assertEqual(set(CONTRACT["resources"]["products"]["fields"]), {
            "slug", "name", "product_code", "category", "collections", "price", "compare_at_price", "currency_code",
            "short_description", "description", "long_description", "material", "color", "finish", "dimensions",
            "occasions", "tags", "badges", "availability_status", "availability_label", "is_featured", "is_new_arrival",
            "is_best_seller", "seo_title", "seo_description", "images",
        })
        self.assertEqual(CONTRACT["product_query_parameters"].keys().__len__(), 10)

    def test_exact_shapes_types_and_money(self):
        product = self.product()
        product.collections.add(self.collection, self.other_collection)
        self.image(product)
        category = self.client.get("/api/v1/categories/necklaces/").json()
        collection = self.client.get("/api/v1/collections/evening/").json()
        data = self.client.get(f"/api/v1/products/{product.slug}/").json()
        self.assert_shape(category, CONTRACT["resources"]["categories"]["fields"])
        self.assert_shape(collection, CONTRACT["resources"]["collections"]["fields"])
        self.assert_shape(data, CONTRACT["resources"]["products"]["fields"])
        self.assert_shape(data["category"], CONTRACT["nested_fields"]["category_summary"])
        self.assertTrue(all(set(item) == {"name", "slug"} for item in data["collections"]))
        self.assert_shape(data["images"][0], CONTRACT["nested_fields"]["image"])
        self.assertIsInstance(data["price"], str)
        self.assertEqual(data["price"], "1250.00")
        self.assertIsInstance(data["compare_at_price"], str)
        nullable = self.product(slug="nullable", product_code="AJ-NULLABLE", compare_at_price=None)
        self.image(nullable)
        self.assertIsNone(self.client.get(f"/api/v1/products/{nullable.slug}/").json()["compare_at_price"])
        for key in ("is_featured", "is_new_arrival", "is_best_seller"):
            self.assertIsInstance(data[key], bool)
        for key in ("collections", "images", "occasions", "tags", "badges"):
            self.assertIsInstance(data[key], list)
        self.assertIsInstance(data["images"][0]["sort_order"], int)
        self.assertIsInstance(data["images"][0]["is_primary"], bool)
        self.assertNotIn("cloudinary_public_id", json.dumps(data))

    def test_list_detail_parity_and_nested_public_visibility(self):
        product = self.product()
        product.collections.add(self.collection, self.other_collection)
        self.image(product)
        listed = self.client.get("/api/v1/products/").json()[0]
        detail = self.client.get(f"/api/v1/products/{product.slug}/").json()
        for key in ("slug", "name", "product_code", "category", "collections", "price", "compare_at_price", "images"):
            self.assertEqual(listed[key], detail[key])
        self.collection.is_active = False
        self.collection.save(update_fields=["is_active"])
        detail = self.client.get(f"/api/v1/products/{product.slug}/").json()
        self.assertEqual([item["slug"] for item in detail["collections"]], ["bridal"])

    def test_public_eligibility_list_and_detail(self):
        cases = [
            ("visible", {"is_published": True}, "valid"), ("unpublished", {"is_published": False}, "valid"),
            ("inactive-category", {"category": self.other_category}, "valid"), ("no-image", {}, "none"),
            ("retired", {}, "retired"), ("empty", {}, "empty"),
        ]
        self.other_category.is_active = False
        self.other_category.save(update_fields=["is_active"])
        for slug, values, kind in cases:
            item = self.product(slug=slug, product_code=f"AJ-{slug}", **values)
            if kind == "valid": self.image(item)
            elif kind == "retired": self.image(item, provenance_status=ProductImage.ProvenanceStatus.RETIRED)
            elif kind == "empty": self.image(item, source_path="")
            response = self.client.get(f"/api/v1/products/{slug}/")
            visible = response.status_code == 200
            self.assertEqual(visible, slug == "visible")
            self.assertEqual(slug in [x["slug"] for x in self.client.get("/api/v1/products/").json()], slug == "visible")

    def test_category_collection_independence_search_and_distinct(self):
        product = self.product(category=self.category, name="Ruby Cross", product_code="AJ-RUBY", tags=["rare-tag"])
        product.collections.add(self.other_collection)
        self.image(product)
        self.assertEqual([x["slug"] for x in self.client.get("/api/v1/products/?category=necklaces").json()], [product.slug])
        self.assertEqual([x["slug"] for x in self.client.get("/api/v1/products/?collection=bridal").json()], [product.slug])
        for query in ("ruby", "AJ-RUBY", "rare-tag", "bridal"):
            self.assertEqual(len(self.client.get(f"/api/v1/products/?search={query}").json()), 1)
        self.assertEqual(len({x["slug"] for x in self.client.get("/api/v1/products/?search=ruby").json()}), 1)

    def test_query_filters_sort_and_invalid_contract(self):
        first = self.product(slug="first", product_code="AJ-FIRST", name="Alpha", price=Decimal("100.00"), is_featured=True, is_new_arrival=True, is_best_seller=True)
        second = self.product(slug="second", product_code="AJ-SECOND", name="Beta", price=Decimal("200.00"), availability_status=Product.AvailabilityStatus.MADE_TO_ORDER)
        self.image(first); self.image(second)
        for query in ("featured=true", "new_arrival=true", "best_seller=true", "availability=made_to_order", "min_price=100&max_price=100", "sort=price_asc", "search=alpha&category=necklaces&featured=true&min_price=100&max_price=100&sort=name_asc"):
            self.assertEqual(self.client.get(f"/api/v1/products/?{query}").status_code, 200, query)
        for query in ("unknown=x", "featured=yes", "availability=Available", "min_price=nope", "min_price=-1", "min_price=2.001", "min_price=200&max_price=100", "sort=wrong"):
            self.assertEqual(self.client.get(f"/api/v1/products/?{query}").status_code, 400, query)
        self.assertEqual([x["slug"] for x in self.client.get("/api/v1/products/?sort=price_asc").json()], ["first", "second"])
        self.assertEqual([x["slug"] for x in self.client.get("/api/v1/products/?sort=name_desc").json()], ["second", "first"])

    def test_http_read_only_authentication_and_root_contract(self):
        self.assertEqual(self.client.get("/api/v1/").status_code, 200)
        for path in ("categories/", "collections/", "products/"):
            self.assertEqual(self.client.get(f"/api/v1/{path}", HTTP_ACCEPT="application/json")["Content-Type"].split(";")[0], "application/json")
        product = self.product(); self.image(product)
        for path in ("categories/", "collections/", "products/", f"products/{product.slug}/"):
            self.assertIn(self.client.head(f"/api/v1/{path}").status_code, (200, 404))
            self.assertEqual(self.client.options(f"/api/v1/{path}").status_code, 200)
        for path, method in (("products/", "post"), (f"products/{product.slug}/", "put"), (f"products/{product.slug}/", "patch"), (f"products/{product.slug}/", "delete"), ("categories/", "post"), ("collections/", "post")):
            self.assertEqual(getattr(self.client, method)(f"/api/v1/{path}", {}, format="json").status_code, 405)
        admin = get_user_model().objects.create_superuser(username="contract-admin", password="test-password", email="contract@example.com")
        self.client.force_authenticate(user=admin)
        self.assertEqual(self.client.get("/api/v1/products/").status_code, 200)
        for path, method in (("products/", "post"), (f"products/{product.slug}/", "put"), (f"products/{product.slug}/", "patch"), (f"products/{product.slug}/", "delete")):
            self.assertEqual(getattr(self.client, method)(f"/api/v1/{path}", {}, format="json").status_code, 405)
        self.assertEqual(self.client.get("/api/v1/products/never-created-by-phase-11/").status_code, 404)

    def test_query_count_bound_and_health_minimality(self):
        for index in range(4):
            item = self.product(slug=f"query-{index}", product_code=f"AJ-QUERY-{index}")
            item.collections.add(self.collection)
            self.image(item)
        with self.assertNumQueries(3):
            response = self.client.get("/api/v1/products/")
        self.assertEqual(response.status_code, 200)
        health = self.client.get("/health/")
        self.assertEqual(health.json(), {"status": "ok"})
        self.assertEqual(health["Cache-Control"], "no-store")
