import os
import subprocess
import sys
from pathlib import Path

from django.test import SimpleTestCase, override_settings


class ProductionSettingsTests(SimpleTestCase):
    backend_dir = Path(__file__).resolve().parents[2]

    def import_production(self, **values):
        env = os.environ.copy()
        for name in ("DJANGO_SECRET_KEY", "DJANGO_ALLOWED_HOSTS", "DJANGO_CSRF_TRUSTED_ORIGINS", "DJANGO_TRUST_X_FORWARDED_PROTO"):
            env.pop(name, None)
        env.update(values)
        return subprocess.run(
            [sys.executable, "-c", "import config.settings.production"],
            cwd=self.backend_dir,
            env=env,
            capture_output=True,
            text=True,
        )

    def test_production_fails_closed_for_secret_and_hosts(self):
        strong = "phase10-test-secret-" + "x" * 50
        self.assertNotEqual(self.import_production(DJANGO_ALLOWED_HOSTS="example.com").returncode, 0)
        self.assertNotEqual(self.import_production(DJANGO_SECRET_KEY="short", DJANGO_ALLOWED_HOSTS="example.com").returncode, 0)
        self.assertNotEqual(self.import_production(DJANGO_SECRET_KEY=strong, DJANGO_ALLOWED_HOSTS="").returncode, 0)
        self.assertNotEqual(self.import_production(DJANGO_SECRET_KEY=strong, DJANGO_ALLOWED_HOSTS="*").returncode, 0)

    def test_valid_production_settings_load_and_proxy_is_opt_in(self):
        strong = "phase10-test-secret-" + "x" * 50
        result = self.import_production(
            DJANGO_SECRET_KEY=strong,
            DJANGO_ALLOWED_HOSTS="example.com",
            DJANGO_CSRF_TRUSTED_ORIGINS="https://example.com",
        )
        self.assertEqual(result.returncode, 0, result.stderr)


class SecurityHeaderTests(SimpleTestCase):
    @override_settings(
        SECURE_CSP={
            "default-src": ["'self'"],
            "script-src": ["'self'", "<CSP_NONCE_SENTINEL>"],
            "object-src": ["'none'"],
            "frame-ancestors": ["'none'"],
        },
        SECURE_SSL_REDIRECT=False,
        SECURE_HSTS_SECONDS=3600,
        SECURE_CONTENT_TYPE_NOSNIFF=True,
        SECURE_REFERRER_POLICY="same-origin",
        SECURE_CROSS_ORIGIN_OPENER_POLICY="same-origin",
        X_FRAME_OPTIONS="DENY",
    )
    def test_health_remains_minimal_and_headers_are_present(self):
        response = self.client.get("/health/")
        self.assertEqual(response.json(), {"status": "ok"})
        self.assertEqual(response["X-Content-Type-Options"], "nosniff")
        self.assertEqual(response["Referrer-Policy"], "same-origin")
        self.assertEqual(response["Cross-Origin-Opener-Policy"], "same-origin")
        self.assertEqual(response["X-Frame-Options"], "DENY")
        self.assertIn("default-src 'self'", response["Content-Security-Policy"])
        self.assertNotIn("default-src *", response["Content-Security-Policy"])
        self.assertNotIn("script-src *", response["Content-Security-Policy"])
