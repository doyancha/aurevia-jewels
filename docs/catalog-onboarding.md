# Phase 16 catalog onboarding contract

This is a validation-first contract for owner-approved Aurevia catalog data. It does not activate commerce. The existing model is the source of truth; no unsupported specification columns are accepted.

## Package layout

```text
phase16-input/
  products.csv
  images/
    <PRODUCT_CODE>/
      01.jpg
      02.jpg
```

Place the package at `data/catalog/phase16-input/` locally (ignored from Git if it contains owner data). An optional `images.csv` may be used instead of directory discovery with columns: `product_code,local_filename,alt_text,sort_order,is_primary,source_classification`. `source_classification` must be exactly `verified_product`.

## `products.csv`

Required columns: `product_code,name,slug,category,price,availability,published,short_description,description,material,color,finish`.

Optional supported columns: `collections,compare_at_price,currency_code,featured,new_arrival,best_seller,long_description,dimensions,occasions,tags,badges,seo_title,seo_description`.

Use `availability` values `ask_about_availability` or `made_to_order`; prices are non-negative BDT decimals with at most two decimal places. Boolean values are `true`/`false` (also `1`/`0` and `yes`/`no`). Collections are comma-separated slugs. Every published product needs at least one owner-approved image. Material/specification fields must be explicitly verified by the owner; blank or guessed values are not acceptable.

Directory image names must start with a numeric order such as `01.jpg`; the first image is primary when no manifest is supplied. Supported formats are JPG/JPEG, PNG, WebP, AVIF, max 10 MiB each. The product-code directory is the mandatory relationship between a product and its photographs. Image filenames must not contain path traversal. Alt text should be truthful, normally `<Verified product name> product image`.

## Validation

From `backend/`, run:

```text
python manage.py validate_catalog_onboarding ..\data\catalog\phase16-input --dry-run
```

The command is strictly non-mutating: it performs no database writes and no Cloudinary calls. It detects duplicate product codes/slugs, missing or unsupported values, unknown image products, path traversal, missing/empty/oversized files, duplicate file hashes, image-order and primary conflicts, unsupported provenance, and published products without verified photography. Warnings include dimensions requiring owner review and generated truthful alt text.

The later import workflow must remain `validate → preview → plan → execute`, use `product_code` as the stable reconciliation key, upload to `aurevia/products/<product-code>/`, retain provenance, and keep demo assets until verification and rollback gates pass. No Phase 16 package may contain secrets, credentials, production dumps, or unapproved supplier files.

## Owner verification checklist

The owner must provide the stable code, name, taxonomy, price/currency, availability, publication decision, approved copy, collection membership, and every claimed material/specification. For each published product, provide an actual photograph of that exact product and confirm its usage rights/provenance. Confirm any category/collection additions or retirements explicitly.
