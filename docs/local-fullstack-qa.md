# Local full-stack QA

This runbook verifies PostgreSQL → Django/DRF → Next.js production server → rendered storefront. It is read-only and does not deploy, edit catalog data, or mutate Cloudinary.

## Prerequisites

- Install the existing npm dependencies and use the repository `.venv`.
- Load `backend/.env.local.ps1` in the current PowerShell session. Never print or commit its values.
- Ensure the local development database is `aurevia_jewels` for user `aurevia_dev`.
- Keep ports `8012` and `3012` free, or choose replacements and set the corresponding QA variables.

## Run

```powershell
. .\backend\.env.local.ps1
$env:AUREVIA_CATALOG_API_BASE_URL = 'http://127.0.0.1:8012/api/v1'
.venv\Scripts\python.exe backend\manage.py runserver 127.0.0.1:8012 --noreload --settings=config.settings.development
```

In a second terminal:

```powershell
$env:AUREVIA_CATALOG_API_BASE_URL = 'http://127.0.0.1:8012/api/v1'
npm run lint
npx tsc --noEmit
npm run build
npm run start -- -p 3012
```

In a third terminal:

```powershell
$env:AUREVIA_CATALOG_API_BASE_URL = 'http://127.0.0.1:8012/api/v1'
npm run verify:catalog-contract
npm run verify:local-fullstack
```

The verifier also accepts `AUREVIA_QA_DJANGO_API_BASE_URL` and `AUREVIA_QA_NEXT_BASE_URL`. It expects both servers to already be running, never starts or kills processes, and exits non-zero on failure.

## Expected baseline

The development database should remain at 8 Categories, 8 Collections, 24 published Products, and 48 ProductImages (all Cloudinary-backed; 48 `representative_demo`, 0 `verified_product`). Django automated tests use an isolated test database.

## Cleanup and troubleshooting

Stop only the Django and Next processes started for this QA run. Confirm ports 8012 and 3012 are released; do not terminate an existing developer server. If a port is occupied, inspect its owner and choose an unused port. No production host, credentials, Vercel, DNS, TLS, WAF, or deployment configuration is required or assumed.
