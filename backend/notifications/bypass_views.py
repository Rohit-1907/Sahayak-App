from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
import json
import logging
import traceback

logger = logging.getLogger(__name__)

@csrf_exempt
@require_http_methods(["POST"])
def register_device_token(request):
    """Bypass endpoint for device token registration"""
    try:
        # Manual JWT authentication
        jwt_auth = JWTAuthentication()
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'No authentication provided'}, status=401)
        
        token = auth_header.split(' ')[1]
        validated_token = jwt_auth.get_validated_token(token)
        user = jwt_auth.get_user(validated_token)
        
        # Parse request body
        body = json.loads(request.body)
        device_token = body.get('token')
        device_type = body.get('device_type', 'unknown')
        device_name = body.get('device_name', 'Unknown Device')
        
        if not device_token:
            return JsonResponse({'error': 'Token is required'}, status=400)
        
        # Save to database
        from authentication.models import DeviceToken
        
        # First, deactivate this token for any OTHER user (device switched accounts)
        DeviceToken.objects.filter(token=device_token).exclude(user=user).delete()
        
        # Now update or create for this user
        device, created = DeviceToken.objects.update_or_create(
            user=user,
            token=device_token,
            defaults={
                'device_type': device_type,
                'device_name': device_name,
                'is_active': True
            }
        )
        
        print(f"[OK] Token registered for user {user.username} (created={created})")
        
        # Only send welcome notification if explicitly requested (e.g. on fresh login)
        is_login = bool(body.get('is_login') or body.get('send_welcome'))
        welcome_sent = False
        
        if is_login:
            try:
                from notifications.notification_manager import notification_manager
                from notifications.models import Notification
                from django.utils import timezone
                from datetime import timedelta
                
                # Check if welcome notification was already sent to this user in the last 60 seconds
                recently_sent = Notification.objects.filter(
                    user=user,
                    type='welcome',
                    created_at__gte=timezone.now() - timedelta(seconds=60)
                ).exists()
                
                if not recently_sent:
                    # Get role from JWT token payload (most reliable)
                    user_role = validated_token.get('role', '')
                    org_worker_name = validated_token.get('org_worker_name', '')
                    
                    # Fallback: try from user model
                    if not user_role and user.role:
                        user_role = user.role.role
                    
                    custom_name = None
                    if user_role in ('customer',):
                        user_type = 'client'
                    elif user_role == 'individual_worker':
                        user_type = 'worker'
                    elif user_role == 'organization_worker':
                        user_type = 'org_worker'
                        custom_name = org_worker_name or None
                    elif user_role == 'organization_admin':
                        user_type = 'organization'
                    else:
                        user_type = 'client'
                    
                    notification_manager.send_welcome_notification(user, user_type, custom_name=custom_name)
                    welcome_sent = True
                    print(f"[REQ] Sent welcome notification to {custom_name or user.username} ({user_type})")
                else:
                    print(f"[INFO] Welcome notification suppressed: already sent to {user.username} in last 60s")
            except Exception as e:
                # Don't fail token registration just because welcome notification failed
                print(f"[WARN] Welcome notification skipped: {e}")
        else:
            print(f"[INFO] Routine token registration for {user.username} - welcome notification not requested")
        
        return JsonResponse({
            'status': 'token registered',
            'message': 'Device registered for push notifications',
            'created': created,
            'welcome_sent': welcome_sent
        }, status=201)
        
    except AuthenticationFailed:
        return JsonResponse({'error': 'Invalid authentication'}, status=401)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        try:
            logger.error(f"Token registration error: {e}\n{traceback.format_exc()}")
            print(f"[FAIL] Token registration error: {e}")
        except Exception:
            pass
        return JsonResponse({'error': str(e)}, status=500)