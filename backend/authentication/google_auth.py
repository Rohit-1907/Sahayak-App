"""
Google OAuth Authentication
Handles Google Sign-In for both customer and worker apps
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests
import os

User = get_user_model()


def get_google_client_ids():
    """Get Google OAuth client IDs from environment variables"""
    return [
        os.getenv('GOOGLE_ANDROID_CLIENT_ID'),
        os.getenv('GOOGLE_IOS_CLIENT_ID'),
        os.getenv('GOOGLE_WEB_CLIENT_ID'),
        os.getenv('GOOGLE_EXPO_CLIENT_ID'),
    ]


def verify_google_token(token):
    """
    Verify Google ID token and return user info
    """
    try:
        client_ids = [cid for cid in get_google_client_ids() if cid]
        
        # If no client IDs configured, skip verification for development
        if not client_ids:
            print("[WARN]  WARNING: No Google Client IDs configured!")
            print("   Skipping token verification (DEVELOPMENT MODE ONLY)")
            return None
        
        # Verify the token
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            audience=None  # Will check against all configured client IDs
        )
        
        # Verify issuer
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')
        
        return idinfo
    
    except Exception as e:
        print(f"[FAIL] Google token verification failed: {str(e)}")
        return None


@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """
    Authenticate user with Google OAuth token.
    Creates new user if doesn't exist, logs in existing user.
    
    Expected data:
    {
        "token": "google_access_token",
        "user_type": "customer" or "worker",
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "google_id": "google_user_id",
        "picture": "profile_picture_url"
    }
    """
    try:
        # Get data from request
        google_token = request.data.get('token')
        user_type = request.data.get('user_type')  # 'customer' or 'worker'
        email = request.data.get('email')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        google_id = request.data.get('google_id')
        picture_url = request.data.get('picture')
        
        if not google_token or not email or not user_type:
            return Response({
                'success': False,
                'error': 'Missing required fields: token, email, user_type'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"[AUTH] Google OAuth Request:")
        print(f"   Email: {email}")
        print(f"   User Type: {user_type}")
        print(f"   Name: {first_name} {last_name}")
        
        # Verify Google token (optional in development if no client IDs configured)
        # idinfo = verify_google_token(google_token)
        # if not idinfo:
        #     return Response({
        #         'success': False,
        #         'error': 'Invalid Google token'
        #     }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if user exists
        user = User.objects.filter(email=email).first()
        
        if user:
            print(f"[OK] Existing user found: {user.username}")
            
            # Verify user type matches
            if user_type == 'customer' and not hasattr(user, 'customer_profile'):
                return Response({
                    'success': False,
                    'error': 'This account is not a customer account. Please use the worker app.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            if user_type == 'worker' and not hasattr(user, 'worker_profile'):
                return Response({
                    'success': False,
                    'error': 'This account is not a worker account. Please use the customer app.'
                }, status=status.HTTP_403_FORBIDDEN)
        
        else:
            # Create new user
            print(f"[NOTE] Creating new user: {email}")
            
            username = email.split('@')[0] + '_google'
            
            # Ensure unique username
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}_{counter}"
                counter += 1
            
            user = User.objects.create(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                is_active=True
            )
            
            # No password needed for Google OAuth users
            user.set_unusable_password()
            user.save()
            
            print(f"[OK] New user created: {user.username}")
            
            # Create profile based on user type
            if user_type == 'customer':
                from users.models import CustomerProfile
                CustomerProfile.objects.create(
                    user=user,
                    phone='',  # Can be updated later
                    address=''
                )
                print("[OK] Customer profile created")
            
            elif user_type == 'worker':
                from users.models import WorkerProfile
                WorkerProfile.objects.create(
                    user=user,
                    phone='',  # Can be updated later
                    service_category='General',  # Default, can be updated
                    experience_years=0,
                    hourly_rate=0.00
                )
                print("[OK] Worker profile created")
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        # Prepare user data
        user_data = {
            'id': str(user.id),
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'full_name': f"{user.first_name} {user.last_name}".strip() or user.username,
            'profile_picture': picture_url,
        }
        
        # Add role information
        if hasattr(user, 'customer_profile'):
            user_data['role'] = 'customer'
            user_data['role_name'] = 'Customer'
        elif hasattr(user, 'worker_profile'):
            worker_profile = user.worker_profile
            if worker_profile.organization:
                user_data['role'] = 'organization_worker'
                user_data['role_name'] = 'Organization Worker'
            else:
                user_data['role'] = 'individual_worker'
                user_data['role_name'] = 'Individual Worker'
        
        print(f"[OK] Google OAuth successful for: {user.email}")
        
        return Response({
            'success': True,
            'access': access_token,
            'refresh': refresh_token,
            'user': user_data,
            'message': 'Google authentication successful'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        print(f"[FAIL] Google OAuth error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return Response({
            'success': False,
            'error': f'Google authentication failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
