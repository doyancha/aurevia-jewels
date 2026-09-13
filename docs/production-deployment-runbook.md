# Aurevia Jewels v1.2 production deployment and recovery runbook

The v1.2 deployment is complete and verified. Use this runbook for future
operator review or recovery; do not reseed, flush, truncate, re-import catalog
rows, or mutate Cloudinary assets as part of release lock.

## Current deployment

Railway service `backend` runs Django/DRF with Gunicorn and WhiteNoise. Railway
private PostgreSQL is the only production database. Railway runs migrations in
the normal pre-deploy path and checks `/health/`. Vercel project `aurevia-jewels`
serves the Next.js frontend at <https://aurevia-jewels-gamma.vercel.app>.

## Health and smoke checks

Verify HTTP 200 for:

- `https://backend-production-b210.up.railway.app/health/`
- `https://backend-production-b210.up.railway.app/api/v1/`
- the frontend `/`, `/shop`, one product route, one collection route, and `/sitemap.xml`

Confirm the catalog remains 8 Categories, 8 Collections, 24 published Products,
and 48 ProductImages, with 48 Cloudinary-backed and `representative_demo`, and
0 `verified_product`. Confirm `siteConfig.isDemo = true` and no commercial flow
is enabled.

## Safe deployment and recovery

1. Keep the owner’s VPN connected for GitHub, Railway, and Vercel operations.
2. Deploy Railway from the intended clean release source. Do not alter provider
   variables or manually run migrations outside the normal deployment path.
3. Confirm `/health/`, `/api/v1/`, Admin static assets, and the read-only API.
4. Deploy the existing Vercel project and wait for READY. Preserve the canonical
   alias; do not create another project or domain.
5. Run the smoke checks above. If frontend runtime checks fail, roll back the
   Vercel deployment. If backend runtime checks fail, roll back Railway.
6. Do not automatically reverse database migrations; assess and repair forward.

Required production configuration includes explicit `DJANGO_ALLOWED_HOSTS`
containing the backend hostname and `healthcheck.railway.app`, trusted forwarded
HTTPS only behind Railway, and a private PostgreSQL connection. Environment
variable names and secret-handling rules are in
[`production-environment.md`](production-environment.md).

Admin is the only authenticated surface. The public catalog API is anonymous,
read-only, and server-consumed by Next.js. Do not enable customer auth, live
WhatsApp ordering, checkout, payments, reviews, or commercial inventory in v1.2.
Phase 16 owns real product catalog and photography; Phase 17 owns commercial
activation.
