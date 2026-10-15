"""
OTP Service for worker arrival verification
Generates and manages OTP notifications for authentication
"""
from django.utils import timezone
from .models import OTPNotification
from .notification_manager import notification_manager
import logging

logger = logging.getLogger(__name__)


def generate_otp(user, title="Worker Arrival Verification", body="Please provide this PIN to verify worker arrival"):
    """
    Generate an OTP notification for a user and send push notification
    
    Args:
        user: SahayakUser instance
        title: OTP notification title
        body: OTP notification body
    
    Returns:
        OTPNotification: Created OTP instance
    """
    try:
        otp = OTPNotification.objects.create(
            user=user,
            title=title,
            body=body
        )
        
        logger.info(f'[OK] OTP {otp.pin} generated for {user.email}')
        
        # Send push notification
        try:
            notification_manager.send_otp_notification(user, otp)
            logger.info(f'[REQ] Push notification sent for OTP {otp.pin}')
        except Exception as e:
            logger.error(f'[FAIL] Failed to send OTP push notification: {e}')
            # Don't fail OTP generation if notification fails
        
        return otp
        
    except Exception as e:
        logger.error(f'[FAIL] Error generating OTP: {str(e)}')
        raise


def verify_otp(user, pin):
    """
    Verify an OTP PIN for a user
    
    Args:
        user: SahayakUser instance
        pin: 6-digit PIN to verify
    
    Returns:
        tuple: (success: bool, message: str)
    """
    try:
        from django.utils import timezone as tz
        
        # Find valid OTP
        otp = OTPNotification.objects.filter(
            user=user,
            pin=pin,
            is_used=False
        ).order_by('-created_at').first()
        
        if not otp:
            logger.warning(f'[WARN] No matching OTP found for {user.email}')
            return False, "Invalid PIN"
        
        # Get current time and expiry time with proper timezone handling
        now = tz.now()
        expires_at = otp.expires_at
        
        # Make expires_at timezone-aware if it's naive
        if expires_at.tzinfo is None:
            expires_at = tz.make_aware(expires_at)
        
        # Calculate time difference
        time_diff = (expires_at - now).total_seconds()
        
        logger.info(f"[TIME] Current time: {now}")
        logger.info(f"[TIME] OTP expires at: {expires_at}")
        logger.info(f"[TIME] Time difference: {time_diff} seconds")
        
        if time_diff <= 0:
            logger.warning(f'[WARN] Expired OTP for {user.email} (expired {abs(time_diff):.0f}s ago)')
            return False, "PIN has expired"
        
        # Mark as used
        otp.is_used = True
        otp.used_at = tz.now()
        otp.save()
        
        logger.info(f'[OK] OTP verified for {user.email}')
        return True, "PIN verified successfully"
        
    except Exception as e:
        logger.error(f'[FAIL] Error verifying OTP: {str(e)}')
        import traceback
        traceback.print_exc()
        return False, "Verification error"


def get_active_otps(user):
    """
    Get all active (unexpired) OTPs for a user
    
    Args:
        user: SahayakUser instance
    
    Returns:
        QuerySet: Active OTPNotification instances
    """
    try:
        now = timezone.now()
        active_otps = OTPNotification.objects.filter(
            user=user,
            expires_at__gt=now,
            is_used=False
        ).order_by('-created_at')
        
        logger.info(f'[DEV] Retrieved {active_otps.count()} active OTPs for {user.email}')
        return active_otps
        
    except Exception as e:
        logger.error(f'[FAIL] Error fetching active OTPs: {str(e)}')
        return OTPNotification.objects.none()
