# Aurevia Jewels concept/demo catalog

This folder is a safe merchandising concept pack for Aurevia Jewels. It is
not a Phase 16 onboarding package and it must not be imported into a database.

## Contents

- `products.csv` — exactly 24 concept products using the current onboarding
  field names and BDT planning prices.
- `taxonomy.csv` — exactly 8 concept categories and 8 concept collections.
  Collection membership is represented as a pipe-separated M2M slug list in
  `products.csv`.
- `image-manifest.csv` — a three-image-per-product shot plan. Every planned
  image has `representative_demo` provenance; no image is verified product
  photography.

All rows use `published=false` and `availability=ask_about_availability` so
the package remains clearly non-commercial. Prices, material descriptions,
dimensions, and copy are planning values only. They are not claims about
stock, supplier specifications, customer deliverability, or actual imagery.

## Future handoff shape

If the owner later approves real catalog data, use this folder only as a
content-planning reference. Build a fresh `data/catalog/phase16-input/`
package from owner-approved values, replace every concept specification and
price, provide exact-product photography, and classify those images as
`verified_product` only after the owner confirms provenance and usage rights.
Do not copy this package directly into Phase 16.

Recommended future image planning layout:

```text
<future-approved-package>/
  products.csv
  images/
    <PRODUCT_CODE>/
      01.jpg
      02.jpg
      03.jpg
```

