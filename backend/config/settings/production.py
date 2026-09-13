import os

from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F403


DEBUG = False

if not os.environ.get("DJANGO_SECRET_KEY"):
    raise ImproperlyConfigured("DJANGO_SECRET_KEY must be set in production.")


def _split_env_list(name):
    return [item.strip() for item in os.environ.get(name, "").split(",") if item.strip()]


ALLOWED_HOSTS = _split_env_list("DJANGO_ALLOWED_HOSTS")
CSRF_TRUSTED_ORIGINS = _split_env_list("DJANGO_CSRF_TRUSTED_ORIGINS")
