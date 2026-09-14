# Aurevia catalog administration

Local administration is available at `/admin/` on the Django development
server. Access requires an active Django user with `is_staff=True` and the
normal Django model permissions for the requested action. There is no public
catalog mutation API or separate frontend admin-token system.

Use **Products → Add product** to create a record. Save it as an unpublished
draft while metadata or media is incomplete, then edit the catalog, pricing,
descriptions, discovery fields, SEO fields, category, and collection
membership as needed. The stable `product_code` and existing product `slug`
are read-only after creation; this protects media paths, imports, and storefront
URLs.

`Published` controls storefront visibility eligibility only. It does not mean
verified inventory, real photography, or commercial availability. Existing
concept images are shown as **Representative Demo**. `verified_product` cannot
be selected or changed in this milestone. Product media upload, replacement,
removal, reordering, and verification are deferred to the next admin
milestone.

Category and Collection records remain manageable from their own admin pages.
Collection legacy cover data is protected from casual editing so the
deterministic cover behavior is preserved. Product media is displayed on the
Product page as a read-only summary.
