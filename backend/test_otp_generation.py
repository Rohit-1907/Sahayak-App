"""
Test script to generate OTP notifications for testing
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sahayak_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from notifications.otp_service import generate_otp

User = get_user_model()

def test_otp_generation():
    """Generate test OTP for a client user"""
    print("=== Testing OTP Generation ===\n")
    
    # Find a customer user (clients)
    try:
        client = User.objects.filter(role__role='customer').first()
        
        if not client:
            print("[FAIL] No customer user found!")
            print("Please create a customer user first.")
            return
        
        print(f"[OK] Found customer user: {client.email}")
        print(f"   Name: {client.get_full_name()}")
        print(f"   Phone: {client.phone_number}")
        
        # Generate OTP
        otp = generate_otp(
            user=client,
            title="Worker Arrival Verification",
            body="Please provide this PIN to the worker to confirm arrival"
        )
        
        print(f"\n[OK] OTP Generated Successfully!")
        print(f"   PIN: {otp.pin}")
        print(f"   Expires at: {otp.expires_at}")
        print(f"   Valid for: 3 minutes")
        
        print(f"\n[DEV] API Endpoint: /api/v1/notifications/otps/")
        print(f"   Authorization: Bearer <access_token>")
        
    except Exception as e:
        print(f"[FAIL] Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_otp_generation()
