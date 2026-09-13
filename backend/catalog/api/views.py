from django.db.models import Exists, OuterRef, Prefetch, Q
from rest_framework.permissions import AllowAny
from rest_framework.viewsets import ReadOnlyModelViewSet

from catalog.models import Category, Collection, Product, ProductImage

from .serializers import CategorySerializer, CollectionSerializer, ProductSerializer


def usable_image_queryset():
    return ProductImage.objects.exclude(
        provenance_status=ProductImage.ProvenanceStatus.RETIRED
    ).filter(Q(secure_url__gt="") | Q(source_path__gt="")).order_by("sort_order", "pk")


def public_product_queryset():
    usable_primary = ProductImage.objects.filter(
        product=OuterRef("pk"),
        is_primary=True,
    ).exclude(
        provenance_status=ProductImage.ProvenanceStatus.RETIRED
    ).filter(Q(secure_url__gt="") | Q(source_path__gt=""))
    public_collections = Collection.objects.filter(is_active=True).order_by(
        "display_order", "name", "pk"
    )
    return Product.objects.filter(
        is_published=True,
        category__is_active=True,
    ).annotate(
        has_usable_primary=Exists(usable_primary)
    ).filter(
        has_usable_primary=True
    ).select_related(
        "category"
    ).prefetch_related(
        Prefetch("collections", queryset=public_collections, to_attr="public_collections"),
        Prefetch("images", queryset=usable_image_queryset(), to_attr="public_images"),
    ).order_by("display_order", "name", "pk")


class PublicReadOnlyViewSet(ReadOnlyModelViewSet):
    authentication_classes = []
    permission_classes = [AllowAny]
    lookup_field = "slug"


class CategoryViewSet(PublicReadOnlyViewSet):
    serializer_class = CategorySerializer

    def get_queryset(self):
        return Category.objects.filter(is_active=True).order_by("display_order", "name", "pk")


class CollectionViewSet(PublicReadOnlyViewSet):
    serializer_class = CollectionSerializer

    def get_queryset(self):
        return Collection.objects.filter(is_active=True).order_by("display_order", "name", "pk")


class ProductViewSet(PublicReadOnlyViewSet):
    serializer_class = ProductSerializer

    def get_queryset(self):
        return public_product_queryset()
