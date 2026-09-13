from django import forms
from django.core.exceptions import ValidationError
from django.db import transaction
from django.forms.models import BaseInlineFormSet

from .models import Category, Collection, Product, ProductImage
from .media import validate_upload_file, upload_image, destroy_remote_asset


ADMIN_PROVENANCE_CHOICES = (
    (ProductImage.ProvenanceStatus.REPRESENTATIVE_DEMO, "Representative Demo"),
    (ProductImage.ProvenanceStatus.RETIRED, "Retired"),
)


class CategoryAdminForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = "__all__"


class CollectionAdminForm(forms.ModelForm):
    class Meta:
        model = Collection
        fields = "__all__"


class ProductAdminForm(forms.ModelForm):
    is_published = forms.BooleanField(
        required=False,
        help_text=(
            "Publishing makes this product eligible for the future catalog API; "
            "it does not enable ordering or payments."
        ),
    )

    class Meta:
        model = Product
        fields = "__all__"

    def clean(self):
        cleaned_data = super().clean()
        category = cleaned_data.get("category")
        if cleaned_data.get("is_published") and category and not category.is_active:
            self.add_error("category", "A published product must use an active category.")
        return cleaned_data


class ProductImageAdminForm(forms.ModelForm):
    upload_file = forms.FileField(
        required=False,
        help_text="Optional. JPG, PNG, WebP, or AVIF; maximum 10 MiB.",
    )
    provenance_status = forms.ChoiceField(
        choices=ADMIN_PROVENANCE_CHOICES,
        help_text="Verified product photography is reserved for a later onboarding phase.",
    )

    class Meta:
        model = ProductImage
        fields = "__all__"

    def clean_provenance_status(self):
        value = self.cleaned_data["provenance_status"]
        if value == ProductImage.ProvenanceStatus.VERIFIED_PRODUCT:
            raise ValidationError(
                "Verified product photography cannot be marked in Admin during Phase 3."
            )
        return value

    def clean_upload_file(self):
        upload_file = self.cleaned_data.get("upload_file")
        if upload_file:
            validate_upload_file(upload_file)
        return upload_file

    def clean(self):
        cleaned_data = super().clean()
        if self.cleaned_data.get("DELETE"):
            return cleaned_data
        upload_file = cleaned_data.get("upload_file")
        submitted_source_path = str(cleaned_data.get("source_path") or "").strip()
        existing_media = bool(
            self.instance.pk
            and (
                submitted_source_path
                or self.instance.source_path.strip()
                or (self.instance.cloudinary_public_id and self.instance.secure_url)
            )
        )
        if not upload_file and not existing_media and not submitted_source_path and not self.instance.source_path.strip():
            raise ValidationError("A new product image requires an upload file.")
        return cleaned_data


class ProductImageInlineFormSet(BaseInlineFormSet):
    def clean(self):
        super().clean()
        if any(self.errors):
            return

        effective_images = []
        for form in self.forms:
            data = getattr(form, "cleaned_data", {})
            if data and not data.get("DELETE", False):
                data = {**data, "_instance": form.instance}
                effective_images.append(data)

        if any(
            image.get("provenance_status") == ProductImage.ProvenanceStatus.VERIFIED_PRODUCT
            for image in effective_images
        ):
            raise ValidationError(
                "Verified product photography cannot be managed through Admin during Phase 3."
            )

        primary_images = [image for image in effective_images if image.get("is_primary")]
        if len(primary_images) > 1:
            raise ValidationError("Only one primary image may be submitted for a product.")

        if self.instance.is_published:
            usable_primary = [
                image for image in primary_images
                if image.get("provenance_status") != ProductImage.ProvenanceStatus.RETIRED
                and self._image_has_media(image)
            ]
            if len(usable_primary) != 1:
                raise ValidationError(
                    "A published product must have exactly one usable primary image "
                    "with a source path or secure URL."
                )

    @staticmethod
    def _image_has_media(image):
        if image.get("upload_file"):
            return True
        instance = image.get("_instance")
        if instance:
            return bool(instance.source_path.strip() or (instance.cloudinary_public_id and instance.secure_url))
        return bool(str(image.get("source_path") or "").strip() or str(image.get("secure_url") or "").strip())

    def save(self, commit=True):
        if not commit:
            return super().save(commit=False)
        instances = super().save(commit=False)
        uploaded_ids = []
        replacements = []
        try:
            for form in self.forms:
                if not form.cleaned_data or form.cleaned_data.get("DELETE"):
                    continue
                upload_file = form.cleaned_data.get("upload_file")
                if not upload_file:
                    continue
                instance = form.instance
                old_public_id = instance.cloudinary_public_id
                metadata = upload_image(upload_file)
                uploaded_ids.append(metadata["cloudinary_public_id"])
                for field, value in metadata.items():
                    setattr(instance, field, value)
                if old_public_id:
                    replacements.append(old_public_id)

            for instance in self.changed_objects:
                instance[0].save()
            for instance in self.new_objects:
                instance.save()
            for instance in self.deleted_objects:
                self.delete_existing(instance, commit=True)
            self.save_m2m()
            for old_public_id in replacements:
                transaction.on_commit(lambda public_id=old_public_id: destroy_remote_asset(public_id))
            return instances
        except Exception:
            for public_id in uploaded_ids:
                destroy_remote_asset(public_id)
            raise
