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

## Phase 10 authentication and security

The only authenticated surface is Django Admin at `/admin/`, using Django session authentication for active staff users and standard model permissions. Superusers retain normal Django full access. Admin sessions are CSRF-protected; production uses HTTPS redirects, secure HttpOnly `SameSite=Lax` cookies, browser-close expiry, an eight-hour session age, staged one-hour HSTS, security headers, and Django 6.1 native enforced CSP. CSP permits only same-origin backend assets plus the required `https://res.cloudinary.com` image origin; no `unsafe-inline` script or wildcard source is used.

The catalog API remains intentionally anonymous and read-only. Its Category, Collection, and Product endpoints accept public GET/HEAD/OPTIONS only; an Admin session does not grant API write access. There is no customer authentication, REST login, API token, or JWT in this phase. The storefront server consumes the API, so no CORS or shared API key is needed. Production requires `DJANGO_SECRET_KEY` (a non-placeholder value at least 50 characters) and explicit `DJANGO_ALLOWED_HOSTS`; optional `DJANGO_CSRF_TRUSTED_ORIGINS` accepts explicit HTTP(S) origins only. `DJANGO_TRUST_X_FORWARDED_PROTO=true` is an explicit opt-in only: the trusted proxy must strip client-supplied `X-Forwarded-Proto`, set it itself, and mark HTTPS only for an HTTPS-origin request.

Admin login rate limiting is intentionally deferred to the real edge/proxy/WAF deployment layer. Django-side IP throttling would aggregate all server-side Next.js catalog traffic and local-memory login throttling would not be production-grade. This remains a Phase 13/14 deployment requirement.

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

## Phase 5 read-only catalog API

The versioned public API is available under `GET /api/v1/` and is anonymous and read-only. It exposes these resources:

- `GET /api/v1/categories/` and `GET /api/v1/categories/<slug>/`
- `GET /api/v1/collections/` and `GET /api/v1/collections/<slug>/`
- `GET /api/v1/products/` and `GET /api/v1/products/<slug>/`

Detail routes use slugs. Categories and collections include only active records. Products include only published records whose category is active and which have a usable, non-retired primary image. Public product images expose one storage-independent `url`, preferring a stored Cloudinary `secure_url` and falling back to the legacy `source_path`; Cloudinary IDs, provenance, and other storage fields are never exposed. Collection images are returned as `image_url` using the transitional legacy path.

Prices are exact decimal strings such as `"1250.00"`; an absent compare-at price is `null`. Product responses include nested category and active collection summaries, availability machine/status values and labels, JSON arrays for occasions/tags/badges, and deterministically ordered images. There is no pagination, filtering, or search yet. No public write endpoints exist.

Abbreviated product response:

```json
{
  "slug": "sample-necklace",
  "name": "Sample Necklace",
  "product_code": "AJ-SAMPLE-001",
  "category": {"name": "Necklaces", "slug": "necklaces"},
  "collections": [{"name": "Evening", "slug": "evening"}],
  "price": "1250.00",
  "compare_at_price": null,
  "currency_code": "BDT",
  "availability_status": "made_to_order",
  "availability_label": "Made to Order",
  "occasions": ["Wedding"],
  "tags": ["gold-tone"],
  "badges": ["New Arrival"],
  "images": [{"url": "/images/source/sample-necklace.jpg", "alt_text": "Sample necklace", "sort_order": 0, "is_primary": true, "width": 1200, "height": 1200}]
}
```

Catalog data migration remains Phase 6, Next.js integration remains Phase 7, and search/filtering/pagination remain Phase 8. Caching, resilience, authentication, and commercial ordering are not part of this API phase.

## Phase 6 legacy catalog migration

The operational migration command extracts the locked v1.1.2 arrays directly from `src/data/products.ts` and `src/data/collections.ts` with the repository's narrow Node extractor (`scripts/export-nextjs-catalog.mjs`). No catalog records are manually retyped. Run the complete preflight first:

```powershell
. .\backend\.env.local.ps1
.venv\Scripts\python.exe backend\manage.py import_nextjs_catalog --dry-run --settings=config.settings.development
.venv\Scripts\python.exe backend\manage.py import_nextjs_catalog --apply --settings=config.settings.development
```

Mutation requires the explicit `--apply` flag. The dry run performs source, image, database collision, and credential checks without database writes or Cloudinary calls. The apply is idempotent and resumable: matching rows are reused, identity drift is refused, complete ProductImages are not uploaded again, and partial progress is retained for retry. Product image source paths remain traceability fields; every ProductImage owns a separate Cloudinary asset and remains `representative_demo`. The importer publishes each demo product only after its two images and usable primary image are ready. A second apply should be a no-op. Collection images remain legacy paths, and no Collection-to-Category relationship is introduced. The Next.js source remains the storefront source until Phase 7. Automated importer tests mock Cloudinary; only the real apply performs live uploads.
