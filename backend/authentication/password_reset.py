"""
Password Reset with OTP Verification
Handles forgot password flow for both client and worker apps
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.core.cache import cache
import random
import string

User = get_user_model()


def generate_otp():
    """Generate 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))


def send_otp_sms(phone, otp):
    """
    Send OTP via SMS
    TODO: Integrate with SMS gateway (Twilio, AWS SNS, etc.)
    For now, just print to console
    """
    print(f"[DEV] SMS to {phone}: Your Sahayak OTP is: {otp}")
    print(f"   Valid for 10 minutes")
    # TODO: Integrate real SMS service
    return True


@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    """
    Request password reset OTP
    
    Expected data:
    {
        "phone": "9876543210"  // or "email": "user@example.com"
    }
    """
    try:
        phone = request.data.get('phone', '').strip()
        email = request.data.get('email', '').strip()
        
        if not phone and not email:
            return Response({
                'success': False,
                'error': 'Phone number or email is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Find user by phone or email
        user = None
        identifier = None
        
        if phone:
            # Search by phone_number in SahayakUser model
            user = User.objects.filter(phone_number=phone).first()
            identifier = phone
        
        elif email:
            user = User.objects.filter(email=email).first()
            identifier = email
        
        if not user:
            # Don't reveal if user exists or not (security)
            return Response({
                'success': True,
                'message': 'If this account exists, an OTP has been sent'
            }, status=status.HTTP_200_OK)
        
        print(f"[AUTH] Password reset requested for: {user.username}")
        
        # Generate OTP
        otp = generate_otp()
        
        # Store OTP in cache (expires in 10 minutes)
        cache_key = f"password_reset_otp:{identifier}"
        cache.set(cache_key, otp, timeout=600)  # 10 minutes
        
        print(f"[OK] OTP generated: {otp}")
        print(f"   Cached with key: {cache_key}")
        
        # Send OTP (via SMS or email)
        if phone:
            send_otp_sms(phone, otp)
        else:
            # TODO: Send email
            print(f"[MAIL] Email to {email}: Your OTP is: {otp}")
        
        return Response({
            'success': True,
            'message': 'OTP sent successfully',
            'otp': otp  # TODO: Remove this in production! Only for development
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        print(f"[FAIL] Error requesting password reset: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return Response({
            'success': False,
            'error': f'Failed to send OTP: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp_and_reset(request):
    """
    Verify OTP and reset password
    
    Expected data:
    {
        "phone": "9876543210",  // or "email": "user@example.com"
        "otp": "123456",
        "new_password": "newpassword123"
    }
    """
    try:
        phone = request.data.get('phone', '').strip()
        email = request.data.get('email', '').strip()
        otp = request.data.get('otp', '').strip()
        new_password = request.data.get('new_password', '').strip()
        
        if not (phone or email):
            return Response({
                'success': False,
                'error': 'Phone number or email is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not otp:
            return Response({
                'success': False,
                'error': 'OTP is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not new_password or len(new_password) < 6:
            return Response({
                'success': False,
                'error': 'Password must be at least 6 characters'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        identifier = phone or email
        
        # Verify OTP
        cache_key = f"password_reset_otp:{identifier}"
        cached_otp = cache.get(cache_key)
        
        if not cached_otp:
            return Response({
                'success': False,
                'error': 'OTP expired or invalid'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if cached_otp != otp:
            return Response({
                'success': False,
                'error': 'Invalid OTP'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"[OK] OTP verified for: {identifier}")
        
        # Find user
        user = None
        if phone:
            user = User.objects.filter(phone_number=phone).first()
        elif email:
            user = User.objects.filter(email=email).first()
        
        if not user:
            return Response({
                'success': False,
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Reset password
        user.set_password(new_password)
        user.save()
        
        # Clear OTP from cache
        cache.delete(cache_key)
        
        print(f"[OK] Password reset successful for: {user.username}")
        
        return Response({
            'success': True,
            'message': 'Password reset successfully. You can now login with your new password.'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        print(f"[FAIL] Error resetting password: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return Response({
            'success': False,
            'error': f'Failed to reset password: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
