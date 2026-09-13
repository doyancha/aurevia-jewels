# Aurevia Jewels Django backend

This directory contains the Django foundation for Aurevia Jewels. The existing Next.js storefront remains the public demo storefront and is not integrated with this backend in Phase 1.

## Requirements

- Python `>=3.12,<3.15`
- Django `6.1.1`
- Django REST Framework `3.18.1`
- Psycopg `3.3.5` with its binary distribution
- Cloudinary Python SDK `1.46.2`

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

PostgreSQL 18.x is required for local development. Phase 2 uses the dedicated local database `aurevia_jewels` and development role `aurevia_dev`; the role is not a PostgreSQL superuser and is intended only for local Django development and isolated test-database creation.

For a local PowerShell session, load the Git-ignored credential file (created during local bootstrap) before running Django commands:

```powershell
. .\backend\.env.local.ps1
python backend\manage.py migrate --settings=config.settings.development
python backend\manage.py test --settings=config.settings.development
```

Never commit `backend/.env.local.ps1` or any database credential. The repository's `.env.example` contains placeholders only. The current schema is intentionally empty of catalog data; Phase 6 owns data migration. Phase 4 owns Cloudinary integration.

The storefront remains demo-only: commercial activation, live ordering, Cloudinary, and frontend/API integration are deferred to their locked phases.

## Phase 4 Cloudinary product media

Admin image uploads use the official Cloudinary SDK server-side: Browser Admin → Django → Cloudinary. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in the backend environment. Unsigned browser uploads and frontend Cloudinary configuration are not used.

Each `ProductImage` owns one unique Cloudinary image asset. New uploads use collision-resistant IDs under `aurevia-jewels/products/`; replacements upload a new asset, commit the database change, then delete the superseded asset. ProductImage and product-cascade deletion clean up owned assets after database commit, with not-found cleanup treated as complete. The database stores only the public ID, HTTPS URL, width, and height.

Uploads are limited to JPG, JPEG, PNG, WebP, or AVIF images up to 10 MiB. Cloudinary storage does not change provenance: normal Admin uploads remain `representative_demo`, `retired` remains available, and `verified_product` remains blocked until Phase 16. Phase 6 owns migration of legacy demo media; no current storefront images are uploaded in Phase 4. To run the controlled live smoke test, use the project environment credentials, upload an ephemeral tiny image under `aurevia-jewels/phase4-smoke/<uuid>`, validate the response, and destroy it immediately. Never print or commit credentials. The storefront remains demo-only.

## Django Admin catalog management

The standard Django Admin is available at `/admin/` for authenticated catalog staff. Categories, collections, and products are registered with searchable, filterable changelists; product images are managed inline on products. Public slugs become read-only after creation, and publishing requires an active category plus one usable primary image. `verified_product` media is reserved until Phase 16, while Cloudinary remains Phase 4. No persistent superuser is created by this project phase, and the storefront remains demo-only.

## Deferred architecture notes

- A future published-product image requirement is a cross-row/domain invariant for Phase 2/3 validation, not a PostgreSQL `CHECK` constraint.
- Phase 4 Cloudinary deletion must use independently owned assets or explicit reference-aware shared asset management; removing one relationship must not delete an asset still used elsewhere.
- Future publication state must remain separate from commercial activation. Publishing a product must never enable ordering automatically.
