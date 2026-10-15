"""
Authentication views for SAHAYAK platform.
Handles registration, login, OTP verification, and token management.
"""
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
import logging
from django.contrib.auth import get_user_model
from datetime import timedelta
import random

from .models import SahayakUser, OTPVerification, UserRole
from .serializers import (
    SahayakUserSerializer, RegisterSerializer, OTPRequestSerializer,
    OTPVerifySerializer, CustomTokenObtainPairSerializer, ChangePasswordSerializer
)

User = get_user_model()
logger = logging.getLogger(__name__)



class RegisterView(viewsets.ModelViewSet):
    """
    Register new users (Customer, Individual Worker).
    """
    queryset = SahayakUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        """Register a new user."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'success': True,
            'message': 'User registered successfully.',
            'user': SahayakUserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user (customer or individual worker)."""
    serializer = RegisterSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            'success': True,
            'message': 'User registered successfully',
            'user': SahayakUserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_worker(request):
    """
    Register individual worker with complete profile.
    
    Expected data:
    {
        "name": str,
        "dob": str (YYYY-MM-DD),
        "gender": str,
        "workType": str,
        "phone": str,
        "aadhaar": str,
        "address": str,
        "city": str,
        "state": str,
        "pinCode": str,
        "country": str,
        "primaryLocation": {
            "address": str,
            "city": str,
            "state": str,
            "latitude": float (optional),
            "longitude": float (optional)
        },
        "experience": str,
        "visitCharge": str,
        "email": str,
        "password": str
    }
    """
    try:
        from users.models import WorkerProfile
        from django.db import transaction
        
        with transaction.atomic():
            # Extract data
            full_name = request.data.get('name')
            dob = request.data.get('dob')
            gender = request.data.get('gender', '').lower()
            work_type = request.data.get('workType')
            phone = request.data.get('phone')
            aadhaar = request.data.get('aadhaar')
            address = request.data.get('address')
            city = request.data.get('city')
            state = request.data.get('state')
            pin_code = request.data.get('pinCode')
            country = request.data.get('country', 'India')
            experience = request.data.get('experience')
            visit_charge = request.data.get('visitCharge')
            email = request.data.get('email')
            password = request.data.get('password')
            
            # Extract primary location data (new)
            primary_location = request.data.get('primaryLocation', {})
            primary_address = primary_location.get('address', address)  # Fallback to address if not provided
            primary_city = primary_location.get('city', city)
            primary_state = primary_location.get('state', state)
            primary_latitude = primary_location.get('latitude')
            primary_longitude = primary_location.get('longitude')
            
            # Validate required fields
            if not all([full_name, dob, gender, work_type, phone, aadhaar, address,
                       city, state, pin_code, experience, visit_charge, email, password]):
                return Response({
                    'success': False,
                    'error': 'All fields are required.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if phone or email already exists
            if SahayakUser.objects.filter(phone_number=phone).exists():
                return Response({
                    'success': False,
                    'error': 'Phone number already registered.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if SahayakUser.objects.filter(email=email).exists():
                return Response({
                    'success': False,
                    'error': 'Email already registered.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get or create individual_worker role
            worker_role, _ = UserRole.objects.get_or_create(
                role='individual_worker',
                defaults={'description': 'Individual Worker'}
            )
            
            # Create user
            name_parts = full_name.split(' ', 1)
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ''
            
            username = phone  # Use phone as username
            
            user = SahayakUser.objects.create_user(
                username=username,
                email=email,
                phone_number=phone,
                first_name=first_name,
                last_name=last_name,
                password=password,
                role=worker_role,
                is_verified=True,
                is_phone_verified=True
            )
            
            # Create user profile
            from .models import UserProfile
            UserProfile.objects.create(
                user=user,
                date_of_birth=dob,
                gender=gender,
                aadhaar_number=aadhaar,
                street_address=address,
                city=city,
                state=state,
                pin_code=pin_code,
                country=country
            )
            
            # Create worker profile with primary location
            WorkerProfile.objects.create(
                user=user,
                service_categories=[work_type],
                years_of_experience=int(experience.split()[0]) if experience.split()[0].isdigit() else 0,
                hourly_rate=float(visit_charge),
                # Legacy address fields (kept for backward compatibility)
                address=address,
                city=city,
                state=state,
                pincode=pin_code,
                # New primary location fields
                primary_address=primary_address,
                primary_city=primary_city,
                primary_state=primary_state,
                primary_latitude=primary_latitude,
                primary_longitude=primary_longitude,
                is_available=True
            )
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
        return Response({
                'success': True,
                'message': 'Worker registered successfully.',
                'user': {
                    'id': str(user.id),
                    'username': user.username,
                    'email': user.email,
                    'phone_number': user.phone_number,
                    'full_name': user.get_full_name(),
                    'role': 'individual_worker',
                    'role_name': 'individual_worker'
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Registration failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OTPViewSet(viewsets.ViewSet):
    """
    Handle OTP generation and verification for phone authentication.
    """
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'])
    def request_otp(self, request):
        """Request OTP for phone verification."""
        serializer = OTPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        phone_number = serializer.validated_data['phone_number']
        
        # Generate OTP
        otp_code = str(random.randint(100000, 999999))
        
        # Set expiry to 10 minutes
        expires_at = timezone.now() + timedelta(minutes=10)
        
        # Save or update OTP
        otp, created = OTPVerification.objects.update_or_create(
            phone_number=phone_number,
            defaults={
                'otp_code': otp_code,
                'expires_at': expires_at,
                'attempts': 0,
                'is_verified': False
            }
        )
        
        # TODO: Send OTP via SMS (integrate with Twilio or similar)
        print(f"OTP for {phone_number}: {otp_code}")  # Remove in production
        
        return Response({
            'success': True,
            'message': 'OTP sent to your phone number.',
            'phone_number': phone_number,
            'expires_in': 600  # seconds
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def verify_otp(self, request):
        """Verify OTP and activate user."""
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        phone_number = serializer.validated_data['phone_number']
        otp_code = serializer.validated_data['otp_code']
        
        try:
            otp = OTPVerification.objects.get(
                phone_number=phone_number,
                is_verified=False
            )
        except OTPVerification.DoesNotExist:
            return Response({
                'success': False,
                'error': 'No pending OTP found for this phone number.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if OTP expired
        if timezone.now() > otp.expires_at:
            return Response({
                'success': False,
                'error': 'OTP has expired. Please request a new one.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check attempts
        if otp.attempts >= otp.max_attempts:
            return Response({
                'success': False,
                'error': 'Maximum OTP verification attempts exceeded.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify OTP
        if otp.otp_code != otp_code:
            otp.attempts += 1
            otp.save()
            return Response({
                'success': False,
                'error': 'Invalid OTP.',
                'attempts_left': otp.max_attempts - otp.attempts
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark OTP as verified
        otp.is_verified = True
        otp.save()
        
        # Activate user if exists
        try:
            user = SahayakUser.objects.get(phone_number=phone_number)
            user.is_phone_verified = True
            user.is_active = True
            user.save()
        except SahayakUser.DoesNotExist:
            pass
        
        return Response({
            'success': True,
            'message': 'Phone number verified successfully.',
            'phone_number': phone_number
        }, status=status.HTTP_200_OK)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token obtain view with additional claims."""
    serializer_class = CustomTokenObtainPairSerializer


class UserProfileViewSet(viewsets.ModelViewSet):
    """
    User profile management.
    """
    queryset = SahayakUser.objects.all()
    serializer_class = SahayakUserSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile."""
        serializer = self.get_serializer(request.user)
        return Response({
            'success': True,
            'user': serializer.data
        })
    
    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """Update current user profile."""
        user = request.user
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            'success': True,
            'message': 'Profile updated successfully',
            'user': serializer.data
        })
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change user password."""
        user = request.user
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({
                'success': False,
                'error': 'Old password is incorrect.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'success': True,
            'message': 'Password changed successfully.'
        }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """Get current authenticated user details."""
    serializer = SahayakUserSerializer(request.user)
    return Response({
        'success': True,
        'user': serializer.data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """Logout user by blacklisting refresh token."""
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response({
            'success': True,
            'message': 'Logged out successfully'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)



# User Profile Views
@api_view(['GET', 'POST', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    GET: Retrieve current user's profile
    POST/PUT/PATCH: Create or update current user's profile
    """
    from .models import UserProfile
    from .serializers import UserProfileSerializer, UserProfileCreateUpdateSerializer
    
    user = request.user
    
    if request.method == 'GET':
        try:
            profile = user.profile
            serializer = UserProfileSerializer(profile)
            return Response({
                'success': True,
                'profile': serializer.data
            })
        except UserProfile.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Profile not found. Please create your profile.'
            }, status=status.HTTP_404_NOT_FOUND)
    
    elif request.method in ['POST', 'PUT', 'PATCH']:
        try:
            profile = user.profile
            serializer = UserProfileCreateUpdateSerializer(profile, data=request.data, partial=(request.method == 'PATCH'))
        except UserProfile.DoesNotExist:
            serializer = UserProfileCreateUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            profile = serializer.save(user=user)
            response_serializer = UserProfileSerializer(profile)
            return Response({
                'success': True,
                'message': 'Profile updated successfully',
                'profile': response_serializer.data
            }, status=status.HTTP_200_OK if profile else status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_complete_user_data(request):
    """Get complete user data including profile."""
    from .serializers import SahayakUserWithProfileSerializer
    
    serializer = SahayakUserWithProfileSerializer(request.user)
    return Response({
        'success': True,
        'user': serializer.data
    })



class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom login view with enhanced user data."""
    serializer_class = CustomTokenObtainPairSerializer
