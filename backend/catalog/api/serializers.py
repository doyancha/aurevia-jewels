from rest_framework import serializers


class CategorySerializer(serializers.Serializer):
    name = serializers.CharField()
    slug = serializers.CharField()
    description = serializers.CharField()


class CollectionSerializer(serializers.Serializer):
    name = serializers.CharField()
    slug = serializers.CharField()
    description = serializers.CharField()
    image_url = serializers.SerializerMethodField()

    def get_image_url(self, obj):
        return obj.legacy_image_path or None


class CategorySummarySerializer(serializers.Serializer):
    name = serializers.CharField()
    slug = serializers.CharField()


class CollectionSummarySerializer(serializers.Serializer):
    name = serializers.CharField()
    slug = serializers.CharField()


class ProductImageSerializer(serializers.Serializer):
    url = serializers.SerializerMethodField()
    alt_text = serializers.CharField()
    sort_order = serializers.IntegerField()
    is_primary = serializers.BooleanField()
    width = serializers.IntegerField(allow_null=True)
    height = serializers.IntegerField(allow_null=True)

    def get_url(self, obj):
        return obj.secure_url or obj.source_path


class ProductSerializer(serializers.Serializer):
    slug = serializers.CharField()
    name = serializers.CharField()
    product_code = serializers.CharField()
    category = CategorySummarySerializer()
    collections = CollectionSummarySerializer(many=True, source="public_collections")
    price = serializers.DecimalField(max_digits=12, decimal_places=2)
    compare_at_price = serializers.DecimalField(max_digits=12, decimal_places=2, allow_null=True)
    currency_code = serializers.CharField()
    short_description = serializers.CharField()
    description = serializers.CharField()
    long_description = serializers.CharField()
    material = serializers.CharField()
    color = serializers.CharField()
    finish = serializers.CharField()
    dimensions = serializers.CharField()
    occasions = serializers.ListField(child=serializers.CharField())
    tags = serializers.ListField(child=serializers.CharField())
    badges = serializers.ListField(child=serializers.CharField())
    availability_status = serializers.CharField()
    availability_label = serializers.SerializerMethodField()
    is_featured = serializers.BooleanField()
    is_new_arrival = serializers.BooleanField()
    is_best_seller = serializers.BooleanField()
    seo_title = serializers.CharField()
    seo_description = serializers.CharField()
    images = ProductImageSerializer(many=True, source="public_images")

    def get_availability_label(self, obj):
        return obj.get_availability_status_display()
