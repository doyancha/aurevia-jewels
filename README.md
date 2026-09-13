# Aurevia Jewels

Premium jewelry and ornaments storefront built with Next.js 16, TypeScript, Tailwind CSS, Framer Motion, and Lucide React.

Current mode: **demo storefront**

## Highlights

- 24 curated products across 8 collections
- SEO-friendly product and collection routes
- Demo-safe WhatsApp ordering flow
- Locally self-hosted storefront imagery
- Delivery, returns, FAQ, privacy, and terms pages
- Sitemap, robots, and structured data included

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` after the dev server starts.

## Validation

```bash
npm run lint
npm run build
npm start
```

The canonical backend regression suite is:

```powershell
.venv\Scripts\python.exe backend\manage.py test catalog core --settings=config.settings.development
```

With Django running locally, verify the live read-only API contract with:

```powershell
npm run verify:catalog-contract
```

The machine-readable contract is [`contracts/catalog-api-v1.json`](contracts/catalog-api-v1.json). Backend tests use Django's isolated test database, mock Cloudinary, and require no external network. Public API breaking changes require coordinated v1-compatible updates or a future `/api/v2/`; Phase 12 remains full-stack integration QA.

## Environment

Copy `.env.example` to `.env.local` for local overrides if needed. The main public variable is:

- `NEXT_PUBLIC_SITE_URL`
- `AUREVIA_CATALOG_API_BASE_URL` — server-only Django REST catalog base URL. For local work use `http://127.0.0.1:8000/api/v1`; Django must be running for API-backed builds and runtime. It has no `NEXT_PUBLIC_` prefix, and this server-to-server architecture requires no CORS.

Set `NEXT_PUBLIC_SITE_URL` in Vercel after the first deployment so canonical URLs, sitemap entries, Open Graph tags, and structured data resolve to the deployment URL.

The Django API is now the storefront catalog source of truth. The legacy TypeScript catalog remains unchanged for migration audit/history and is not used by runtime storefront paths.

## Backend security boundary

Django Admin at `/admin/` is the only authenticated surface and requires an active staff user using Django’s built-in session authentication and model permissions. Production requires a strong `DJANGO_SECRET_KEY`, explicit `DJANGO_ALLOWED_HOSTS`, HTTPS, secure `HttpOnly` `SameSite=Lax` cookies, staged HSTS, and native Django CSP. The public catalog API remains anonymous and read-only; Admin sessions do not enable API writes. This phase adds no customer accounts, JWT, REST tokens, CORS, or shared API key. Admin login rate limiting remains an edge/proxy/WAF requirement for the deployment phases after the production topology is known.

## Deployment note

This repository is prepared for a public demo deployment, not a commercial launch. Demo contact details and image provenance still require business-owner verification before real commercial use.

## Asset provenance

See [`docs/asset-provenance.md`](docs/asset-provenance.md) for the current storefront image inventory and source-verification status.
# Catalog resilience

The storefront reads the Django catalog only from Next.js server code through
`AUREVIA_CATALOG_API_BASE_URL`; the browser never calls Django directly. Each
catalog request has a 5-second timeout and at most one retry (two total
attempts) for network errors, timeouts, and HTTP 502/503/504 responses.

Stable catalog reads use Next's server Data Cache with 60-second revalidation:
categories, collections, details, the unfiltered product list, and bounded
filters. Search and any `min_price` or `max_price` filter use `cache: no-store`
to avoid high-cardinality cache keys. Previously successful cached data may be
served during normal stale-on-revalidation behavior; a cold upstream failure is
surfaced as a branded error state. Global search is optional and explicitly
shows that it is temporarily unavailable if its catalog read fails.

The storefront never falls back to the historical static catalog files. Builds,
sitemap generation, and required catalog pages intentionally remain API-backed.
