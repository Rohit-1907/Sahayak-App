from rest_framework import serializers
from .models import ServiceCategory, ServiceSubcategory


class ServiceSubcategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceSubcategory
        fields = ['id', 'name', 'description', 'is_active']


class ServiceCategorySerializer(serializers.ModelSerializer):
    subcategories = ServiceSubcategorySerializer(many=True, read_only=True)
    
    class Meta:
        model = ServiceCategory
        fields = ['id', 'name', 'description', 'icon_url', 'is_active', 'subcategories']
