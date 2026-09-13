# Aurevia Jewels production environment

This is a Phase 13 preparation manifest. Values below are placeholders only;
no provider settings are changed by this phase.

The frontend target is the existing Vercel project `aurevia-jewels`
(`prj_tprzlBVqlGKwp5x1FEJS4eXwsaz0`), currently aliased as
`aurevia-jewels-gamma.vercel.app`. Phase 14 must reuse it; no second project,
alias, custom domain, or DNS record is prepared here.

## Backend — Railway Django service

| Variable | Owner | Classification | Required | Example / source | Phase | Purpose |
|---|---|---|---|---|---|---|
| `DJANGO_SETTINGS_MODULE` | Railway | non-secret | yes | `config.settings.production` | runtime | Selects fail-closed production settings |
| `DJANGO_SECRET_KEY` | Railway | secret | yes | `<50+-character-random-secret>` | runtime | Django signing and CSRF secret |
| `DJANGO_ALLOWED_HOSTS` | Railway | non-secret | yes | `<railway-host>,healthcheck.railway.app` | runtime | Explicit backend and Railway healthcheck hosts |
| `DJANGO_CSRF_TRUSTED_ORIGINS` | Railway | non-secret | optional | `https://<railway-host>` | runtime | Explicit unsafe-request origins; same-origin Admin normally needs none |
| `DJANGO_TRUST_X_FORWARDED_PROTO` | Railway | non-secret | yes | `true` | runtime | Trusts HTTPS set by Railway’s TLS edge only |
| `DATABASE_URL` | Railway PostgreSQL reference | secret | yes | `postgresql://<user>:<password>@<private-host>:5432/<db>` | runtime | Private PostgreSQL connection; preferred over `POSTGRES_*` |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT` | Railway | mixed (`PASSWORD` secret) | alternative | explicit provider values | runtime | Complete alternative when `DATABASE_URL` is unavailable; no local host allowed |
| `CLOUDINARY_CLOUD_NAME` | Railway | non-secret | yes for Admin media | `<cloud-name>` | runtime | Existing Cloudinary product media account |
| `CLOUDINARY_API_KEY` | Railway | secret | yes for Admin media | `<api-key>` | runtime | Server-side Cloudinary SDK |
| `CLOUDINARY_API_SECRET` | Railway | secret | yes for Admin media | `<api-secret>` | runtime | Server-side Cloudinary SDK; never frontend |
| `WEB_CONCURRENCY` | Railway | non-secret | optional | `2` | runtime | Gunicorn worker count |
| `PORT` | Railway-provided | non-secret | provider | `${PORT:-8000}` locally | runtime | Gunicorn listen port; do not hardcode in Railway |

Production settings reject missing/invalid `DJANGO_SECRET_KEY`, empty or
wildcard hosts, and absent database configuration. They cannot fall back to
`localhost`, `127.0.0.1`, `aurevia_dev`, or the development password.

## Frontend — existing Vercel project

| Variable | Owner | Classification | Required | Example / source | Phase | Purpose |
|---|---|---|---|---|---|---|
| `AUREVIA_CATALOG_API_BASE_URL` | Vercel | non-secret | yes for production build | `https://<railway-backend-domain>/api/v1` | build/runtime server | Server-side Django catalog origin |
| `NEXT_PUBLIC_SITE_URL` | Vercel | non-secret | yes for canonical production URLs | `https://aurevia-jewels-gamma.vercel.app` | build/runtime | Metadata, sitemap, and robots canonical origin |

The catalog API variable intentionally has no `NEXT_PUBLIC_` prefix. There is
no timeout variable: the current Next server client uses a hardcoded 5,000 ms
timeout and one retry. Do not create a second similarly named variable.

Vercel Preview must not be silently pointed at production. Leave the catalog
variable unset for Preview or configure an explicitly approved read-only policy
later.

## Operational boundaries

- Railway PostgreSQL remains private; only the Django service uses its private
  connection reference. `DATABASE_PUBLIC_URL` is not an application variable.
- Railway health checks send `Host: healthcheck.railway.app`; include that exact
  hostname in the explicit production allowlist.
- Railway terminates public TLS. Set forwarded-proto trust to `true` only in
  the Railway production environment; development remains disabled.
- Cloudinary public delivery URLs may reach browser HTML. Cloudinary credentials,
  database credentials, Django secrets, and provider tokens may not.
- Generate `DJANGO_SECRET_KEY` in Phase 14 with a secret manager or a
  process-only command such as `python -c "import secrets; print(secrets.token_urlsafe(64))"`;
  do not paste it into a report or tracked file.
