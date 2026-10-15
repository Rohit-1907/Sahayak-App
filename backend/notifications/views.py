from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.conf import settings
from django.utils import timezone
import firebase_admin

from .models import Notification
from .serializers import NotificationSerializer, OTPNotificationSerializer, DeviceTokenSerializer
from .otp_service import get_active_otps
from .notification_manager import notification_manager, NotificationPayload


class NotificationPagination(PageNumberPagination):
    """Pagination for notifications (20 per page)"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class NotificationViewSet(viewsets.ModelViewSet):
    """
    Notification management with FCM push notification support.
    All endpoints require JWT authentication.
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = NotificationPagination
    
    def get_queryset(self):
        """Filter notifications by authenticated user"""
        return Notification.objects.filter(user=self.request.user)
    
    def list(self, request):
        """
        Get paginated notification history.
        GET /api/v1/notifications/?page=1
        """
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def register_token(self, request):
        """
        Register device token for push notifications.
        
        POST /api/v1/notifications/register-token/
        Body: {
            "token": "ExponentPushToken[...]",
            "device_type": "android",
            "device_name": "Pixel 6"
        }
        """
        serializer = DeviceTokenSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(
                {'status': 'token registered', 'message': 'Device registered for push notifications'},
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def unregister_token(self, request):
        """
        Deactivate device token.
        
        POST /api/v1/notifications/unregister-token/
        Body: {"token": "ExponentPushToken[...]"}
        """
        from authentication.models import DeviceToken
        
        token = request.data.get('token')
        
        if not token:
            return Response(
                {'error': 'Token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        updated_count = DeviceToken.objects.filter(
            user=request.user,
            token=token
        ).update(is_active=False)
        
        if updated_count > 0:
            return Response({'status': 'token unregistered', 'message': 'Device unregistered successfully'})
        else:
            return Response(
                {'status': 'token not found', 'message': 'Token not found for this user'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """
        Mark notification as read.
        
        POST /api/v1/notifications/{id}/mark-read/
        """
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        
        return Response({
            'status': 'marked as read',
            'notification_id': str(notification.id)
        })

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        """
        Mark all notifications as read for current user.
        
        POST /api/v1/notifications/mark-all-read/
        """
        updated = self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({
            'status': 'all marked as read',
            'count': updated
        })
    
    @action(detail=False, methods=['get'])
    def otps(self, request):
        """
        Get active OTP notifications.
        
        GET /api/v1/notifications/otps/
        """
        active_otps = get_active_otps(request.user)
        serializer = OTPNotificationSerializer(active_otps, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def test(self, request):
        """
        Send test notification (development only).
        
        POST /api/v1/notifications/test/
        """
        if not settings.DEBUG:
            return Response(
                {'error': 'Only available in debug mode'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not settings.NOTIFICATIONS_ENABLED:
            return Response(
                {'error': 'Notifications are disabled (Firebase not initialized)'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        payload = NotificationPayload(
            title="Test Notification",
            body="This is a test notification from Sahayak",
            data={'type': 'test', 'timestamp': timezone.now().isoformat()},
        )
        
        result = notification_manager.send_to_user(request.user, payload)
        
        return Response({
            'status': 'sent',
            'success_count': result.success,
            'failure_count': result.failure,
            'message': f'Sent to {result.success} device(s), {result.failure} failed'
        })
    
    @action(detail=False, methods=['get'])
    def health(self, request):
        """
        Check FCM connectivity.
        
        GET /api/v1/notifications/health/
        """
        try:
            # Check if Firebase is initialized
            firebase_admin.get_app()
            
            return Response({
                'status': 'healthy',
                'fcm_connected': True,
                'notifications_enabled': settings.NOTIFICATIONS_ENABLED
            })
        except ValueError:
            return Response(
                {
                    'status': 'unhealthy',
                    'fcm_connected': False,
                    'notifications_enabled': False,
                    'error': 'Firebase not initialized'
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            return Response(
                {
                    'status': 'unhealthy',
                    'fcm_connected': False,
                    'error': str(e)
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
