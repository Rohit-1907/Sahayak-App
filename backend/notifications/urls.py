from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet
from .bypass_views import register_device_token

router = DefaultRouter()
router.register(r'', NotificationViewSet, basename='notification')

urlpatterns = [
    # Bypass endpoint (temporary workaround)
    path('register-token/', register_device_token, name='register-token'),
    
    # ViewSet routes
    path('', include(router.urls)),
]
