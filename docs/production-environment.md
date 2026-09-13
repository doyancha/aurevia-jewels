# Aurevia Jewels v1.2 production environment

Status: production verified and demo-safe. This document records the current
topology and required environment variable names; it contains no secret values.

## Topology

- Frontend: existing Vercel project `aurevia-jewels`, project ID
  `prj_tprzlBVqlGKwp5x1FEJS4eXwsaz0`
- Frontend URL: <https://aurevia-jewels-gamma.vercel.app>
- Backend: Railway service `backend`
- Backend URL: <https://backend-production-b210.up.railway.app>
- Database: Railway-managed private PostgreSQL, reachable by the backend
  service through its private connection reference
- Media: Cloudinary; public HTTPS delivery is used by catalog images

Request boundary: `Browser → Vercel Next.js → server-side Django API access →
Railway Django → private PostgreSQL`. The browser does not call Django directly.
`AUREVIA_CATALOG_API_BASE_URL` is server-only and does not use a
`NEXT_PUBLIC_` prefix; CORS and a shared API key are not required.

## Required variable names

Railway backend runtime:

- `DJANGO_SETTINGS_MODULE` = production settings module
- `DJANGO_SECRET_KEY` (secret; strong, non-placeholder value)
- `DJANGO_ALLOWED_HOSTS` (explicit backend hostname plus `healthcheck.railway.app`)
- `DJANGO_TRUST_X_FORWARDED_PROTO` = `true` only behind Railway’s trusted TLS edge
- `DATABASE_URL` (secret private PostgreSQL connection reference; preferred)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY` (secret)
- `CLOUDINARY_API_SECRET` (secret)
- Optional: `DJANGO_CSRF_TRUSTED_ORIGINS`, `WEB_CONCURRENCY`; Railway supplies `PORT`

If `DATABASE_URL` is unavailable, the complete alternative names are
`POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, and
`POSTGRES_PORT`. Do not use a public database URL, wildcard hosts, localhost,
or development credentials in production.

Vercel Production:

- `AUREVIA_CATALOG_API_BASE_URL` = Railway `/api/v1` origin
- `NEXT_PUBLIC_SITE_URL` = canonical Vercel origin

Preview must not be silently pointed at production. Never put secret values in
tracked files, documentation, browser variables, or release notes.

## Verified state and boundaries

The catalog is 8 Categories, 8 Collections, 24 Products, and 48 ProductImages;
all 24 products are published. Cloudinary-backed images are 48/48,
`representative_demo` is 48, and `verified_product` is 0. Django Admin is
available at `/admin/` to the active production superuser. `siteConfig.isDemo`
is `true`; ordering, checkout, payments, customer authentication, reviews, and
commercial inventory are disabled. Phase 16 owns real catalog/photography;
Phase 17 owns commercial activation.

The Railway healthcheck calls `/health/` and must receive HTTP 200. The API root
`/api/v1/` must receive HTTP 200. The explicit `DJANGO_ALLOWED_HOSTS` value
must include the Railway backend hostname and `healthcheck.railway.app`.
