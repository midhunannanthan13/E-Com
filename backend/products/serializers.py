from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'product_count')


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    original_price = serializers.SerializerMethodField()
    discount_percent = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()
    badge = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            'id', 'category', 'category_name', 'name', 'slug', 'description',
            'price', 'original_price', 'discount_percent', 'stock', 'image_url',
            'rating', 'reviews_count', 'badge', 'is_active', 'in_stock', 'created_at',
        )
        read_only_fields = ('created_at',)

    def get_original_price(self, obj):
        try:
            p = float(obj.price)
            factor = 1.25 + (((obj.id or 1) * 7) % 35) / 100.0
            return round(p * factor, 2)
        except Exception:
            return float(obj.price)

    def get_discount_percent(self, obj):
        try:
            orig = self.get_original_price(obj)
            p = float(obj.price)
            if orig > p:
                return int(round((1.0 - (p / orig)) * 100))
        except Exception:
            pass
        return 0

    def get_reviews_count(self, obj):
        try:
            return (((obj.id or 1) * 83) % 1800) + 124
        except Exception:
            return 150

    def get_badge(self, obj):
        try:
            r = float(obj.rating)
            if r >= 4.7:
                return "BESTSELLER"
            if r >= 4.5:
                return "TOP RATED"
            if (obj.id or 1) % 4 == 0:
                return "HOT DEAL"
            if (obj.id or 1) % 3 == 0:
                return "TRENDING"
            if (obj.id or 1) % 5 == 0:
                return "ASSURED"
        except Exception:
            pass
        return ""

