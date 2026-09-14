import os
from pathlib import Path
from unittest.mock import patch

from django.core.management import call_command, CommandError
from django.test import SimpleTestCase, override_settings


ROOT = Path(__file__).resolve().parents[3]
PACKAGE = ROOT / "data" / "catalog" / "concept-demo"


class ConceptImportGuardTests(SimpleTestCase):
    def test_apply_requires_local_only(self):
        with self.assertRaisesMessage(CommandError, "requires --local-only"):
            call_command("import_concept_catalog", PACKAGE, "--apply", "--settings=config.settings.development")

    @override_settings(DATABASES={"default": {"ENGINE": "django.db.backends.postgresql", "HOST": "railway.internal"}})
    def test_remote_database_is_refused(self):
        with self.assertRaisesMessage(CommandError, "database host is not local"):
            call_command("import_concept_catalog", PACKAGE, "--dry-run", "--settings=config.settings.development")

    def test_production_settings_are_refused(self):
        with patch.dict(os.environ, {"DJANGO_SETTINGS_MODULE": "config.settings.production"}):
            with self.assertRaisesMessage(CommandError, "production settings"):
                call_command("import_concept_catalog", PACKAGE, "--dry-run", "--settings=config.settings.development")
