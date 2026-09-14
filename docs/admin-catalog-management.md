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
