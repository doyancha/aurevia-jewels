from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.core.files import File
from django.db import transaction

from catalog import media
from catalog.legacy_import import CatalogImportError, check_collisions, extract_source, mapped_products, validate_source
from catalog.models import Collection, Product, ProductImage


class Command(BaseCommand):
    help = "Import the locked Next.js demo catalog into the Django catalog."

    def add_arguments(self, parser):
        group = parser.add_mutually_exclusive_group()
        group.add_argument("--dry-run", action="store_true")
        group.add_argument("--apply", action="store_true")

    def handle(self, *args, **options):
        repo_root = Path(__file__).resolve().parents[4]
        try:
            source = extract_source(repo_root)
            counts = validate_source(source, repo_root)
            check_collisions(source)
        except CatalogImportError as exc:
            raise CommandError(str(exc)) from exc
        if options["dry_run"]:
            self.stdout.write(self.style.SUCCESS(f"DRY RUN PASS: {counts['categories']} Categories, {counts['collections']} Collections, {counts['products']} Products, {counts['images']} ProductImages planned."))
            if not all((self._setting("CLOUDINARY_CLOUD_NAME"), self._setting("CLOUDINARY_API_KEY"), self._setting("CLOUDINARY_API_SECRET"))):
                self.stdout.write("Cloudinary credentials: missing (required only when uploads are pending)")
            else:
                self.stdout.write("Cloudinary credentials: present")
            return
        if not options["apply"]:
            raise CommandError("Choose exactly one of --dry-run or --apply.")
        self._apply(source, repo_root)

    @staticmethod
    def _setting(name):
        from django.conf import settings
        return getattr(settings, name, "")

    def _apply(self, source, repo_root):
        existing_images = ProductImage.objects.filter(product__legacy_key__in=[item["id"] for item in source.products])
        pending = existing_images.count() < 48 or existing_images.exclude(
            cloudinary_public_id__gt="", secure_url__gt="", width__isnull=False, height__isnull=False,
        ).exists()
        if pending and not all((self._setting("CLOUDINARY_CLOUD_NAME"), self._setting("CLOUDINARY_API_KEY"), self._setting("CLOUDINARY_API_SECRET"))):
            raise CommandError("Cloudinary credentials are required for pending ProductImage uploads.")
        try:
            with transaction.atomic():
                collections = {}
                for index, item in enumerate(source.collections):
                    row, created = Collection.objects.get_or_create(slug=item["slug"], defaults={"name": item["name"], "description": item["description"], "legacy_image_path": item["image"], "display_order": index, "is_active": True})
                    if not created and (row.name != item["name"] or row.description != item["description"] or row.legacy_image_path != item["image"]):
                        raise CommandError(f"collection drift: {item['slug']}")
                    collections[item["slug"]] = row
                products = mapped_products(source)
                for index, (data, mapped) in enumerate(zip(source.products, products)):
                    mapped["display_order"] = index
                    row = Product.objects.filter(legacy_key=data["id"]).first()
                    created = row is None
                    if created:
                        row = Product.objects.create(**mapped)
                    else:
                        for field, value in mapped.items():
                            if field not in {"category", "is_published", "display_order"} and getattr(row, field) != value:
                                raise CommandError(f"product drift: {data['id']} field {field}")
                        row.category = mapped["category"]
                        row.display_order = index
                        row.is_published = False
                        row.save(update_fields=["category", "display_order", "is_published", "updated_at"])
                    expected_collection = collections[data["collection"]]
                    current_collections = list(row.collections.all())
                    if current_collections and current_collections != [expected_collection]:
                        raise CommandError(f"product collection drift: {data['id']}")
                    row.collections.set([expected_collection])
                    for order, path in enumerate(data["images"]):
                        image, image_created = ProductImage.objects.get_or_create(product=row, sort_order=order, defaults={"source_path": path, "alt_text": f"Representative image for {row.name}" if order == 0 else f"Representative image for {row.name} — view {order + 1}", "is_primary": order == 0, "provenance_status": ProductImage.ProvenanceStatus.REPRESENTATIVE_DEMO})
                        if not image_created and image.source_path != path:
                            raise CommandError(f"product image drift: {data['id']} image {order}")
                        if not image_created and (image.is_primary != (order == 0) or image.provenance_status != ProductImage.ProvenanceStatus.REPRESENTATIVE_DEMO):
                            raise CommandError(f"product image metadata drift: {data['id']} image {order}")
            self._upload_and_publish(source, repo_root)
        except KeyboardInterrupt as exc:
            raise CommandError("Import interrupted; completed rows remain resumable.") from exc
        self.stdout.write(self.style.SUCCESS("IMPORT PASS: Categories=8 Collections=8 Products=24 ProductImages=48; Products published=24"))

    def _upload_and_publish(self, source, repo_root):
        for data in source.products:
            product = Product.objects.get(legacy_key=data["id"])
            for order, path in enumerate(data["images"]):
                image = product.images.get(sort_order=order)
                complete = image.cloudinary_public_id and image.secure_url and image.width and image.height
                if not complete:
                    if any((image.cloudinary_public_id, image.secure_url, image.width, image.height)):
                        raise CommandError(f"partial Cloudinary metadata: {data['id']} image {order}")
                    file_path = (repo_root / "public" / path.lstrip("/")).resolve()
                    uploaded_id = None
                    try:
                        with file_path.open("rb") as handle:
                            metadata = media.upload_image(File(handle, name=file_path.name))
                        uploaded_id = metadata["cloudinary_public_id"]
                        for field, value in metadata.items():
                            setattr(image, field, value)
                        image.save(update_fields=["cloudinary_public_id", "secure_url", "width", "height", "updated_at"])
                    except Exception as exc:
                        if uploaded_id:
                            media.destroy_remote_asset(uploaded_id)
                        raise CommandError(f"Cloudinary upload failed: {data['id']} image {order}") from exc
            product.is_published = True
            product.save(update_fields=["is_published", "updated_at"])
