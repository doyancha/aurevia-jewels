from decimal import Decimal, InvalidOperation

from django.db.models import Exists, OuterRef, Prefetch, Q
from rest_framework.exceptions import ValidationError
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
        params = self.request.query_params
        allowed = {
            "search", "category", "collection", "availability", "featured",
            "new_arrival", "best_seller", "min_price", "max_price", "sort",
        }
        unknown = sorted(set(params) - allowed)
        if unknown:
            raise ValidationError({"query": [f"Unknown query parameter: {name}" for name in unknown]})

        def one(name):
            values = params.getlist(name)
            if len(values) > 1 or (values and values[0] == ""):
                raise ValidationError({name: "This parameter must be provided once and must not be empty."})
            return values[0] if values else None

        search = one("search")
        if search is not None and len(search) > 100:
            raise ValidationError({"search": "Search must be 100 characters or fewer."})
        category = one("category")
        collection = one("collection")
        availability = one("availability")
        if availability is not None and availability not in Product.AvailabilityStatus.values:
            raise ValidationError({"availability": "Invalid availability value."})

        def boolean(name):
            value = one(name)
            if value is not None and value not in {"true", "false"}:
                raise ValidationError({name: "Expected true or false."})
            return value == "true" if value is not None else None

        featured = boolean("featured")
        new_arrival = boolean("new_arrival")
        best_seller = boolean("best_seller")

        def decimal(name):
            value = one(name)
            if value is None:
                return None
            try:
                parsed = Decimal(value)
            except (InvalidOperation, ValueError):
                raise ValidationError({name: "Expected a non-negative decimal value."})
            if not parsed.is_finite() or parsed < 0 or parsed.as_tuple().exponent < -2:
                raise ValidationError({name: "Expected a non-negative decimal value with at most 2 decimal places."})
            return parsed

        min_price = decimal("min_price")
        max_price = decimal("max_price")
        if min_price is not None and max_price is not None and min_price > max_price:
            raise ValidationError({"price": "min_price must not exceed max_price."})

        sort = one("sort") or "default"
        sort_fields = {
            "default": ("display_order", "name", "pk"),
            "featured": ("-is_featured", "display_order", "name", "pk"),
            "newest": ("-created_at", "display_order", "name", "pk"),
            "price_asc": ("price", "display_order", "name", "pk"),
            "price_desc": ("-price", "display_order", "name", "pk"),
            "name_asc": ("name", "display_order", "pk"),
            "name_desc": ("-name", "display_order", "pk"),
        }
        if sort not in sort_fields:
            raise ValidationError({"sort": "Invalid sort value."})

        queryset = public_product_queryset()
        if search is not None:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(product_code__icontains=search)
                | Q(short_description__icontains=search)
                | Q(description__icontains=search)
                | Q(category__name__icontains=search)
                | Q(collections__name__icontains=search)
                | Q(collections__slug__icontains=search)
                | Q(tags__icontains=search)
            ).distinct()
        if category is not None:
            queryset = queryset.filter(category__slug=category)
        if collection is not None:
            queryset = queryset.filter(collections__slug=collection).distinct()
        if availability is not None:
            queryset = queryset.filter(availability_status=availability)
        for name, value in (("is_featured", featured), ("is_new_arrival", new_arrival), ("is_best_seller", best_seller)):
            if value is not None:
                queryset = queryset.filter(**{name: value})
        if min_price is not None:
            queryset = queryset.filter(price__gte=min_price)
        if max_price is not None:
            queryset = queryset.filter(price__lte=max_price)
        return queryset.order_by(*sort_fields[sort])
