"""
URL configuration for sahayak_backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # API Endpoints
    path('api/v1/auth/', include('authentication.urls')),
    path('api/v1/users/', include('users.urls')),
    path('api/v1/services/', include('services.urls')),
    path('api/v1/jobs/', include('jobs.urls')),
    path('api/v1/payments/', include('payments.urls')),
    path('api/v1/notifications/', include('notifications.urls')),
    path('api/v1/recommendations/', include('recommendations.urls')),
    path('api/v1/analytics/', include('analytics.urls')),
    path('api/v1/organizations/', include('organization.urls')),
    path('api/v1/org/', include('organization.urls')),  # Organisation System
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
