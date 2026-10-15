from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import WorkerRecommendation
from .serializers import WorkerRecommendationSerializer


class WorkerRecommendationViewSet(viewsets.ReadOnlyModelViewSet):
    """Get AI-based worker recommendations."""
    queryset = WorkerRecommendation.objects.all()
    serializer_class = WorkerRecommendationSerializer
    permission_classes = [IsAuthenticated]
