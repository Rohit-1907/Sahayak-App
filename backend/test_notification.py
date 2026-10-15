"""
Quick notification test script
Run this after logging in to send a test notification
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sahayak_backend.settings')
django.setup()

from authentication.models import SahayakUser
from notifications.notification_manager import notification_manager, NotificationPayload
from django.utils import timezone

print("[TEST] Notification Test Script")
print("=" * 50)

# Get user (replace with your email)
user_email = "siya@gmail.com"
user = SahayakUser.objects.filter(email=user_email).first()

if not user:
    print(f"[FAIL] User {user_email} not found!")
    exit(1)

print(f"[OK] Found user: {user.get_full_name() or user.email}")

# Check device tokens
from authentication.models import DeviceToken
tokens = DeviceToken.objects.filter(user=user, is_active=True)
print(f"[DEV] Active device tokens: {tokens.count()}")

for token in tokens:
    print(f"  - {token.device_name} ({token.device_type})")
    print(f"    Token: {token.token[:50]}...")

if tokens.count() == 0:
    print("[WARN]  No device tokens found!")
    print("Make sure you've logged into the mobile app first.")
    exit(1)

# Send test notification
print("\n[REQ] Sending test notification...")

payload = NotificationPayload(
    title=" Test Notification",
    body="If you see this, FCM is working perfectly!",
    data={
        'type': 'test',
        'timestamp': timezone.now().isoformat(),
    },
    priority='high',
)

try:
    result = notification_manager.send_to_user(user, payload)
    print(f"\n[OK] Notification sent!")
    print(f"   Success: {result.success} device(s)")
    print(f"   Failed: {result.failure} device(s)")
    
    if result.success > 0:
        print("\n[DONE] CHECK YOUR PHONE NOW! You should see the notification!")
    else:
        print("\n[FAIL] Failed to send notification. Check the logs above.")
        
except Exception as e:
    print(f"\n[FAIL] Error: {e}")
    import traceback
    traceback.print_exc()
