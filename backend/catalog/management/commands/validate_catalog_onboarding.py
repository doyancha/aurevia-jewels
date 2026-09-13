from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from catalog.onboarding import load_package, validate_package
from catalog.models import Category, Collection


class Command(BaseCommand):
    help = "Validate an owner-approved Phase 16 catalog package without DB or Cloudinary writes."

    def add_arguments(self, parser):
        parser.add_argument("input_dir", type=Path)
        parser.add_argument("--dry-run", action="store_true", help="Explicitly confirm non-mutating validation mode.")

    def handle(self, *args, **options):
        if not options["dry_run"]:
            raise CommandError("Validation is non-mutating; pass --dry-run explicitly.")
        try:
            report = validate_package(
                load_package(options["input_dir"].resolve()),
                options["input_dir"].resolve(),
                known_categories=set(Category.objects.values_list("name", flat=True)),
                known_collections=set(Collection.objects.values_list("slug", flat=True)),
            )
        except ValueError as exc:
            raise CommandError(str(exc)) from exc
        self.stdout.write(f"Products: {report['products']}  ProductImages: {report['images']}  Categories: {report['categories']}  Collections: {report['collections']}")
        for warning in report["warnings"]:
            self.stdout.write(self.style.WARNING(f"WARNING: {warning}"))
        if report["errors"]:
            for error in report["errors"]:
                self.stderr.write(self.style.ERROR(f"ERROR: {error}"))
            raise CommandError(f"Phase 16 validation failed with {len(report['errors'])} error(s); no writes performed.")
        self.stdout.write(self.style.SUCCESS("PHASE 16 VALIDATION PASS — dry-run only; no DB or Cloudinary writes."))
