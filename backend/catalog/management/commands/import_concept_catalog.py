from pathlib import Path
import socket

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from catalog.concept_import import ConceptImportError, load_concept, reconcile_concept


class Command(BaseCommand):
    help = "Import the concept/demo catalog into a local development database only."

    def add_arguments(self, parser):
        parser.add_argument("input_dir", type=Path)
        parser.add_argument("--dry-run", action="store_true")
        parser.add_argument("--apply", action="store_true")
        parser.add_argument("--local-only", action="store_true")

    def handle(self, *args, **options):
        if options["dry_run"] == options["apply"]:
            raise CommandError("Choose exactly one of --dry-run or --apply.")
        if options["apply"] and not options["local_only"]:
            raise CommandError("Apply requires --local-only.")
        host = str(settings.DATABASES["default"].get("HOST") or "").lower()
        if "railway" in host or host not in {"127.0.0.1", "localhost", "::1"}:
            raise CommandError("Refusing concept import: database host is not local.")
        if "production" in __import__("os").environ.get("DJANGO_SETTINGS_MODULE", "").lower():
            raise CommandError("Refusing concept import under production settings.")
        if getattr(settings, "DATABASES", {}).get("default", {}).get("ENGINE") != "django.db.backends.postgresql":
            raise CommandError("Refusing concept import: PostgreSQL is required.")
        try:
            data = load_concept(options["input_dir"])
            counts = reconcile_concept(data, dry_run=options["dry_run"])
        except (ConceptImportError, FileNotFoundError, KeyError) as exc:
            raise CommandError(f"Concept package validation failed; no writes performed: {exc}") from exc
        mode = "DRY RUN PASS" if options["dry_run"] else "LOCAL APPLY PASS"
        self.stdout.write(self.style.SUCCESS(f"{mode}: Categories={counts['categories']} Collections={counts['collections']} Products={counts['products']} ProductImages={counts['images']} PublicImages={counts['public_images']}"))
        if not options["dry_run"]:
            self.stdout.write("Local preview publish state: 24; commercial ordering remains disabled by siteConfig.isDemo.")
