from django.test import SimpleTestCase


class HealthEndpointTests(SimpleTestCase):
    def test_health_returns_minimal_no_store_response(self):
        response = self.client.get("/health/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})
        self.assertEqual(response["Cache-Control"], "no-store")
        self.assertNotIn("password", response.content.decode().lower())

    def test_health_only_allows_get(self):
        response = self.client.post("/health/")

        self.assertEqual(response.status_code, 405)
