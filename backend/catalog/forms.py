from django import forms
from django.core.exceptions import ValidationError
from django.forms.models import BaseInlineFormSet

from .models import Category, Collection, Product, ProductImage


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


class ProductImageInlineFormSet(BaseInlineFormSet):
    def clean(self):
        super().clean()
        if any(self.errors):
            return

        effective_images = []
        for form in self.forms:
            data = getattr(form, "cleaned_data", {})
            if data and not data.get("DELETE", False):
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
                and (
                    str(image.get("source_path") or "").strip()
                    or str(image.get("secure_url") or "").strip()
                )
            ]
            if len(usable_primary) != 1:
                raise ValidationError(
                    "A published product must have exactly one usable primary image "
                    "with a source path or secure URL."
                )
