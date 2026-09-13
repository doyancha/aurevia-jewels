# Phase 14 production deployment runbook

This runbook is intentionally future-facing. Phase 13 does not authenticate
with Railway or Vercel and does not execute any step below.

## Sequence

1. Provision a Railway project and environment.
2. Provision Railway PostgreSQL in the same project/environment. Keep database
   networking private and verify the provider backup capability before launch.
3. Add the backend service from this repository, set service root to `/backend`,
   and configure the custom file `/backend/railway.toml`.
4. Configure the backend variables from
   [`production-environment.md`](production-environment.md). Generate a strong
   secret without printing it. Set explicit `DJANGO_ALLOWED_HOSTS` to the
   generated backend hostname plus `healthcheck.railway.app`; do not use `*`.
   Set `DJANGO_TRUST_X_FORWARDED_PROTO=true` only because Railway is the trusted
   TLS-terminating proxy.
5. Deploy the Django service. The image starts Gunicorn and runs collectstatic;
   Railway runs `migrate --noinput` as the pre-deploy command. Do not put
   migrations in the ordinary start command.
6. Generate the Railway public HTTPS backend domain, then verify `/health/`
   returns `{"status":"ok"}` and Admin loads with working CSS and JavaScript.
7. Create an Admin account interactively or with a secure one-time provider
   shell action. Never commit or log its credentials. Verify edge/WAF login
   rate limiting; it is not configured by this repository phase.
8. Populate the fresh database with the current demo catalog using a
   catalog-only fixture. From a reviewed source environment, export only
   `catalog.category`, `catalog.collection`, `catalog.product`, and
   `catalog.productimage` with Django’s serializer (for example, `dumpdata`
   with those four labels and an ignored local output path). The Product
   fixture carries its collection M2M relations and ProductImage carries
   `cloudinary_public_id`, `secure_url`, dimensions, ordering, and provenance.
   Do not use `import_nextjs_catalog --apply`: that importer uploads local media
   when Cloudinary metadata is absent. Do not export auth users, sessions,
   admin credentials, content types, permissions, secrets, or system tables.
9. Load the reviewed fixture once with `loaddata` and verify the expected
   counts: Category 8, Collection 8, Product 24, ProductImage 48, Published
   24, Cloudinary-backed 48, `representative_demo` 48, and `verified_product` 0.
   For a retry, stop and inspect conflicts; do not destructively reset the
   database. A reviewed fixture is idempotent only for a fresh first load; a
   repeat should be guarded by the verified counts/identities or performed
   with an explicit non-destructive reconciliation procedure.
10. Verify API contract, read-only methods, HTTPS behavior, host allowlist,
    and all 48 existing Cloudinary URLs. No media upload, destroy, replace, or
    rename is part of this seed.
11. Configure the existing Vercel project’s Production variable
    `AUREVIA_CATALOG_API_BASE_URL=https://<railway-backend-domain>/api/v1`.
    Do not create a `NEXT_PUBLIC_` version. Because the Next build generates
    catalog-backed routes, the backend must already be healthy and seeded.
12. Deploy the existing Vercel project explicitly, then run live production QA
    across storefront pages, generated product/collection routes, sitemap,
    image delivery, and the browser/backend boundary.

## Rollback and safety

- If frontend QA fails, roll back/revert the Vercel deployment.
- If backend runtime QA fails, roll back the Railway deployment.
- Do not automatically reverse applied database migrations. Assess each
  migration explicitly; repair forward when safer.
- If the first seed fails before commercial activation, stop and repair after
  reviewing the fixture. Never blindly reset production.
- Cloudinary is separate from PostgreSQL backups. Verify Railway PostgreSQL
  backups before commercial launch; a local catalog export is not an ongoing
  backup strategy.
- The repository remains a demo system: `siteConfig.isDemo = true`, no live
  ordering, checkout, reviews, or commercial activation.

## Sequencing hazard

The linked Vercel project tracks `doyancha/aurevia-jewels`. The local `master`
branch is ahead of `origin/master`; pushing before Railway is healthy can
trigger an unprepared Vercel build. Phase 14 must deploy/configure intentionally
after provider authentication and backend readiness are confirmed.
