from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Analytics
from .serializers import AnalyticsSerializer


class AnalyticsViewSet(viewsets.ReadOnlyModelViewSet):
    """Analytics and reports."""
    queryset = Analytics.objects.all()
    serializer_class = AnalyticsSerializer
    permission_classes = [IsAuthenticated]
