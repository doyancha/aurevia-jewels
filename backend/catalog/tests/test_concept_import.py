import os
import shutil
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

from django.core.management import call_command, CommandError
from django.test import SimpleTestCase, TestCase, override_settings

from catalog.concept_import import load_concept
from catalog.models import Collection, ProductImage


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


class ConceptImportImageTests(TestCase):
    def test_mixed_one_and_three_image_import_has_deterministic_collection_covers(self):
        call_command("import_concept_catalog", PACKAGE, "--apply", "--local-only", "--settings=config.settings.development")
        self.assertEqual(ProductImage.objects.count(), 48)
        self.assertEqual(Collection.objects.exclude(legacy_image_path="").count(), 8)
        self.assertEqual(ProductImage.objects.filter(provenance_status="representative_demo").count(), 48)
        self.assertTrue(Collection.objects.first().legacy_image_path.endswith("/01.png"))

    def test_manifest_accepts_three_ordered_images_when_supplied(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)
            shutil.copytree(PACKAGE, root, dirs_exist_ok=True)
            source = root / "images" / "AJ-CD-001"
            (source / "02-styled-neckline.jpg").write_bytes((root / "images" / "AJ-CD-002" / "01.png").read_bytes() + b"secondary-one")
            (source / "03-detail-pearl.jpg").write_bytes((root / "images" / "AJ-CD-003" / "01.png").read_bytes() + b"secondary-two")
            data = load_concept(root)
            images = sorted((item for item in data["images"] if item["code"] == "AJ-CD-001"), key=lambda item: item["sort_order"])
            self.assertEqual([item["sort_order"] for item in images], [0, 1, 2])
            self.assertEqual([item["is_primary"] for item in images], [True, False, False])

    def test_collection_card_defends_against_empty_image(self):
        source = (ROOT / "src" / "components" / "ui" / "CollectionCard.tsx").read_text(encoding="utf-8")
        self.assertIn("collection.image ?", source)
        self.assertIn("<Image", source)
