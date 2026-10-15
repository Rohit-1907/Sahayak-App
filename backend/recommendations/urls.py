from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkerRecommendationViewSet

router = DefaultRouter()
router.register(r'workers', WorkerRecommendationViewSet, basename='worker-recommendation')

urlpatterns = [
    path('', include(router.urls)),
]
