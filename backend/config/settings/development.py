from .base import *  # noqa: F403


DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]
CSRF_TRUSTED_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]
ADMIN_STOREFRONT_BASE_URL = os.environ.get("ADMIN_STOREFRONT_BASE_URL", "http://127.0.0.1:3000")
