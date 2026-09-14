from django.core.management.base import BaseCommand

from catalog.health import audit_catalog


class Command(BaseCommand):
    help = "Report structural catalog invariant failures without mutating data."

    def handle(self, *args, **options):
        failures = audit_catalog()
        if failures:
            self.stdout.write(self.style.ERROR("Catalog audit: BLOCKED"))
            for failure in failures:
                self.stdout.write(f"- {failure}")
            raise SystemExit(1)
        self.stdout.write(self.style.SUCCESS("Catalog audit: PASS (no structural failures)"))
