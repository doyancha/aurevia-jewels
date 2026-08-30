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

## Environment

Copy `.env.example` to `.env.local` for local overrides if needed. The main public variable is:

- `NEXT_PUBLIC_SITE_URL`

Set `NEXT_PUBLIC_SITE_URL` in Vercel after the first deployment so canonical URLs, sitemap entries, Open Graph tags, and structured data resolve to the deployment URL.

## Deployment note

This repository is prepared for a public demo deployment, not a commercial launch. Demo contact details and image provenance still require business-owner verification before real commercial use.

## Asset provenance

See [`docs/asset-provenance.md`](docs/asset-provenance.md) for the current storefront image inventory and source-verification status.