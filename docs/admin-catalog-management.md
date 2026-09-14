# Aurevia catalog administration

Local administration is available at /admin/ on the Django development
server. Access requires an active Django user with is_staff=True and the
normal Django model permissions for the requested action. There is no public
catalog mutation API or separate frontend admin-token system.

Use Products → Add product to create a record. Save it as an unpublished draft
while metadata or media is incomplete, then edit the catalog, pricing,
descriptions, discovery fields, SEO fields, category, and collection
membership as needed. The stable product_code and existing product slug are
read-only after creation; this protects media paths, imports, and storefront
URLs.

Published controls storefront visibility eligibility only. It does not mean
verified inventory, real photography, or commercial availability. Existing
concept images are shown as Representative Demo. verified_product cannot be
selected or changed in this milestone. Product media operations are documented
below; verification remains deferred to a future approved onboarding workflow.

## Product media manager

On a saved Product page, use Upload image to add JPG, JPEG, PNG, WebP, or AVIF
media up to 10 MiB. Django validates the content signature, rejects empty or
disguised files, normalizes alt text, assigns a UUID-backed safe storage name,
and defaults new media to representative_demo. The first image becomes
primary; later uploads are secondary.

Each existing image has separate controls for Set primary, Edit alt, Replace,
and Remove. Set-primary is transactional and demotes the old primary.
Reordering is product-scoped and compacts positions to 0, 1, 2, .... Removing
a primary promotes the first remaining image; a published product cannot be
left without an image. Replacing preserves the ProductImage identity,
position, primary flag, and provenance. Local obsolete files are cleaned up
only when they belong to the admin media directory.

Local development uses the Django filesystem storage rooted at .tmp/media and
the development URL /media/; it is separate from data/catalog/concept-demo/
and the public concept mirror. Production selects the existing server-side
Cloudinary adapter through authenticated Django Admin requests. Cloudinary
secrets never reach browser code, and this milestone does not perform any
production Cloudinary mutation.

Thumbnails show safe bounded previews or Unavailable. Alt text should describe
the visible jewelry view without unsupported claims about real materials,
purity, stones, or verification. Provenance is read-only in normal media
management: representative_demo cannot be promoted to verified_product.
Verification and owner-approved real-product onboarding remain Phase 16 work.

Category and Collection records remain manageable from their own admin pages.
Collection legacy cover data is protected from casual editing so the
deterministic cover behavior is preserved.

## Taxonomy and publishing safety

Category slugs are prepopulated when a category is created and are read-only
after creation. Products use a protected category relationship, so a category
with products must be reassigned before it can be deleted. Category results
can be opened from the admin using the existing `/shop?category=<slug>` route.

Collections expose their products through a validated membership selector.
Saving the collection updates only the existing many-to-many memberships; it
does not delete products. Collection slugs are stable after creation, and a
collection with members must be cleared before deletion. Its cover remains a
resolved member-product primary image; an empty collection safely reports
"No cover available" and never emits an empty image URL.

Publishing means eligible for storefront visibility, not verified inventory,
commercial activation, or real photography. Drafts may be saved without
media. Publishing requires valid identity, an active category, non-negative
pricing, a supported availability value, required descriptions, and exactly
one usable primary image with alt text. The same representative-demo images
used by the concept catalog satisfy structural publication readiness; they do
not become verified by being published.

Unpublished products use an authenticated Django Admin secure draft preview.
They are not exposed through the public API or a query-string preview bypass.
Published products retain the stable `/products/<slug>` storefront link.
There are no bulk publish/delete shortcuts. Media provenance remains read-only
in normal admin workflows, and `verified_product` approval is deferred to a
future owner-approved workflow. Phase 16 remains paused and Phase 17 has not
started.

## Catalog Health Dashboard and audit

The Admin home page includes a read-only Catalog overview and Catalog health
panel. It reports products, publication state, taxonomy, media totals, image
primaries, and provenance. Representative Demo imagery is informational: it
describes concept media and is not a health error. Verified Product imagery is
reserved for the owner-approved Phase 16 workflow.

Health meanings are intentionally restrained: Healthy means no issue is
reported; Attention identifies draft or optional metadata needing review;
Blocked identifies a published/readiness or structural problem; and
Informational identifies known concept-state facts such as demo media.

Dashboard issue links use normal Django Admin changelist filters. To
investigate a blocked product, inspect its category, descriptions, pricing,
and exactly one usable primary image, then use the existing Product form and
media manager. The dashboard reuses the same
`catalog.publishing.get_publish_readiness_errors` validator used by Product
publish validation.

The `audit_catalog` management command is local and read-only. It checks
primary-image and ordering invariants, usable media paths, alt text,
provenance values, published readiness, and collection-cover resolution. It
returns a non-zero status for structural failures and never writes catalog
rows or calls Cloudinary.

Django's built-in admin history remains the source of truth for Product,
Category, and Collection changes. Custom media-manager actions also write
safe Product history entries for upload, replace, remove, reorder, primary
selection, and alt-text edits. Entries identify the authenticated actor,
Product, action, and timestamp; they never contain credentials, tokens,
passwords, binary data, or unnecessary absolute paths. A small recent catalog
activity list is shown on the Admin home page.

Final admin certification uses a temporary `AJ-ADMIN-CERT-QA` draft and
development media only. The workflow crosses Admin, ORM/database, API, and
Next storefront/gallery checks, then removes temporary records and media and
verifies the canonical concept baseline. This certification does not onboard
real inventory and does not resume Phase 16.

## Premium owner dashboard

The Admin home page is presented as the Aurevia Owner Dashboard while
remaining entirely within Django Admin. It uses a restrained ivory, charcoal,
and champagne-gold design system with visible focus states, responsive panels,
semantic status text, and reduced-motion support. The dashboard contains only
catalog metrics: Products, Published, Categories, Collections, Images, health,
media provenance, permission-aware shortcuts, catalog management links, and
recent catalog activity. It intentionally contains no sales, revenue, order,
customer, or conversion metrics.

The shared Aurevia Admin styling also applies to the login page, changelists,
forms, filters, navigation, buttons, and media presentation. Product lists
show safe primary-image thumbnails with an accessible fallback, readable Draft
or Published badges, canonical readiness badges, and accurate provenance
badges. Product editing is grouped into Identity, Catalog, Pricing, Content,
Product Details, Discovery, Merchandising, SEO, Media manager, Publishing,
and System sections without changing model or validation behavior.
