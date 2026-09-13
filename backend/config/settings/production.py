import os
from urllib.parse import urlsplit

from django.core.exceptions import ImproperlyConfigured
from django.utils.csp import CSP

from .base import *  # noqa: F403


DEBUG = False


def _required_secret_key():
    value = os.environ.get("DJANGO_SECRET_KEY", "").strip()
    if (
        len(value) < 50
        or value == "unsafe-development-only-key"
        or value.startswith("django-insecure-")
    ):
        raise ImproperlyConfigured(
            "DJANGO_SECRET_KEY must be a strong production secret of at least 50 characters."
        )
    return value


def _split_env_list(name):
    return [item.strip() for item in os.environ.get(name, "").split(",") if item.strip()]


ALLOWED_HOSTS = _split_env_list("DJANGO_ALLOWED_HOSTS")
CSRF_TRUSTED_ORIGINS = _split_env_list("DJANGO_CSRF_TRUSTED_ORIGINS")

if not ALLOWED_HOSTS or "*" in ALLOWED_HOSTS:
    raise ImproperlyConfigured(
        "DJANGO_ALLOWED_HOSTS must contain explicit hostnames; wildcard hosts are not allowed."
    )

for origin in CSRF_TRUSTED_ORIGINS:
    parsed = urlsplit(origin)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc or "*" in origin:
        raise ImproperlyConfigured(
            "DJANGO_CSRF_TRUSTED_ORIGINS must contain explicit HTTP(S) origins."
        )

SECRET_KEY = _required_secret_key()
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
SESSION_COOKIE_AGE = 8 * 60 * 60
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = "Lax"
SECURE_HSTS_SECONDS = 3600
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False

if os.environ.get("DJANGO_TRUST_X_FORWARDED_PROTO", "").strip().lower() == "true":
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
else:
    SECURE_PROXY_SSL_HEADER = None

SECURE_CSP = {
    "default-src": [CSP.SELF],
    "script-src": [CSP.SELF, CSP.NONCE],
    "style-src": [CSP.SELF, CSP.NONCE],
    "img-src": [CSP.SELF, "data:", "https://res.cloudinary.com"],
    "font-src": [CSP.SELF],
    "connect-src": [CSP.SELF],
    "object-src": [CSP.NONE],
    "base-uri": [CSP.SELF],
    "form-action": [CSP.SELF],
    "frame-ancestors": [CSP.NONE],
}

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
}
