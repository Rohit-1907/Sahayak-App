"""
URL configuration for authentication app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView, OTPViewSet, CustomTokenObtainPairView,
    UserProfileViewSet, register_user, register_worker, get_current_user, logout_user,
    user_profile, get_complete_user_data
)
from .google_auth import google_auth
from .password_reset import request_password_reset, verify_otp_and_reset

router = DefaultRouter()
router.register(r'register-viewset', RegisterView, basename='register-viewset')
router.register(r'otp', OTPViewSet, basename='otp')
router.register(r'profile', UserProfileViewSet, basename='profile')

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),
    
    # Token endpoints
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh_alt'),
    
    # User endpoints
    path('register/', register_user, name='register'),
    path('register-worker/', register_worker, name='register_worker'),
    path('me/', get_current_user, name='current_user'),
    path('logout/', logout_user, name='logout'),
    
    # Google OAuth
    path('google-auth/', google_auth, name='google_auth'),
    
    # Password Reset
    path('password-reset/request/', request_password_reset, name='password_reset_request'),
    path('password-reset/verify/', verify_otp_and_reset, name='password_reset_verify'),
    
    # User Profile endpoints
    path('my-profile/', user_profile, name='user_profile'),
    path('me/complete/', get_complete_user_data, name='complete_user_data'),
]
