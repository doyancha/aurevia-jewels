# Aurevia Jewels Django backend

This directory contains the Django foundation for Aurevia Jewels. The existing Next.js storefront remains the public demo storefront and is not integrated with this backend in Phase 1.

## Requirements

- Python `>=3.12,<3.15`
- Django `6.1.1`
- Django REST Framework `3.18.1`
- Psycopg `3.3.5` with its binary distribution

Use the existing repository virtual environment at `..\.venv`; do not install these packages globally.

```powershell
python -m pip install -r backend\requirements\development.txt
```

Set environment variables in PowerShell as needed, or copy `backend\.env.example` as a reference. Phase 1 uses Python's standard-library environment handling and does not load `.env` files automatically.

The default development settings module is `config.settings.development`. Production uses `config.settings.production`, which requires `DJANGO_SECRET_KEY` and explicit `DJANGO_ALLOWED_HOSTS` values.

Run Django from the repository root:

```powershell
python backend\manage.py runserver 8000
```

The foundation health check is available at `GET http://127.0.0.1:8000/health/` and returns `{"status":"ok"}`. It is process-level only and does not touch PostgreSQL.

PostgreSQL is configured as the architectural database through `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, and `POSTGRES_PORT`. Phase 1 does not create a database, define catalog models, create project migrations, or apply migrations. PostgreSQL schema and core data models begin in Phase 2.

The storefront remains demo-only: commercial activation, live ordering, Cloudinary, and frontend/API integration are deferred to their locked phases.

## Deferred architecture notes

- A future published-product image requirement is a cross-row/domain invariant for Phase 2/3 validation, not a PostgreSQL `CHECK` constraint.
- Phase 4 Cloudinary deletion must use independently owned assets or explicit reference-aware shared asset management; removing one relationship must not delete an asset still used elsewhere.
- Future publication state must remain separate from commercial activation. Publishing a product must never enable ordering automatically.
