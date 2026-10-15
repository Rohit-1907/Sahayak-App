from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import ServiceCategory, ServiceSubcategory
from .serializers import ServiceCategorySerializer, ServiceSubcategorySerializer


class ServiceCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """List and retrieve service categories."""
    queryset = ServiceCategory.objects.filter(is_active=True)
    serializer_class = ServiceCategorySerializer
    permission_classes = [IsAuthenticated]
