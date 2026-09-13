# Aurevia Jewels concept catalog workstream

## Status

This is a local demo/concept catalog package only. It contains no verified
real products, no commercially active listings, and no actual product
photography. It does not activate commerce, checkout, payments, ordering,
reviews, Cloudinary assets, or production data.

The package contains 24 products across 8 independent categories and 8
independent collections. Category assignment is one-to-many; collections are
merchandising groupings represented as many-to-many slugs.

## Merchandising direction

The product mix is designed for an accessible-premium Bangladesh boutique:
daily chains and hoops form the entry layer; pearl, festive, wedding, and
occasion pieces provide gifting and event depth; sculptural rings and cuffs
create distinctive signature moments. Planning prices range from BDT 1,290 to
BDT 3,290 and should not be treated as quotes or live prices.

Featured concept anchors are Solenne, Vespera, Seraphine, Aria, Devika, and
Samaira. Best-seller planning signals are distributed across earrings,
bracelets, bangles, rings, and anklets. New-arrival signals support a balanced
refresh story without implying launch or stock status.

## Demo-safety copy audit

The current concept package keeps all products unpublished and uses explicit
concept language in descriptions, badges, SEO copy, and documentation. If
these rows are ever shown in a richer local demo, retain a visible site-level
notice such as “Concept catalog — representative demo items, not verified
inventory” and avoid CTAs that imply checkout, payment, WhatsApp ordering, or
confirmed availability. Keep image provenance visible in internal tooling as
`representative_demo`.

The existing Phase 16 onboarding docs correctly reserve `verified_product` for
owner-approved photography and must remain unchanged. No storefront source or
production configuration was changed in this workstream.

## Validation

Run the local non-mutating structural check from the repository root:

```text
node scripts/validate-concept-catalog.mjs
```

The Phase 16 Django onboarding validator is intentionally not used as an
import command for this package: it requires verified photography and rejects
`representative_demo` provenance by design. If run against this concept CSV it
would therefore report the expected Phase 16 verification errors. Structural
validation still confirms the shared column contract, taxonomy references,
counts, uniqueness, booleans, prices, and demo provenance.

## Explicit phase boundary

Phase 16 remains paused for owner-approved real product data and photography.
Phase 17 was not started.

