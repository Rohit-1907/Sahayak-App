# OTP Notification System Implementation

## Overview
Successfully implemented an OTP notification system for worker arrival verification. The system generates 6-digit PINs that clients can view in their notification screen, with automatic expiry after 3 minutes.

## Backend Implementation

### 1. Models (`backend/notifications/models.py`)
- **Notification**: Standard notification model for various notification types
- **OTPNotification**: Dedicated model for OTP/PIN notifications
  - Fields: `id`, `user`, `pin`, `title`, `body`, `expires_at`, `is_used`, `created_at`, `used_at`
  - Auto-generates 6-digit PIN on creation
  - Auto-sets expiry time (3 minutes from creation)
  - Helper methods: `is_expired()`, `is_valid()`

### 2. Serializers (`backend/notifications/serializers.py`)
- **NotificationSerializer**: Serializes standard notifications
- **OTPNotificationSerializer**: Serializes OTP notifications with computed fields
  - Includes `is_expired` and `is_valid` as SerializerMethod fields

### 3. Services (`backend/notifications/otp_service.py`)
Core functions:
- `generate_otp(user, title, body)`: Creates a new OTP for a user
- `verify_otp(user, pin)`: Validates a PIN and marks it as used
- `get_active_otps(user)`: Returns all unexpired, unused OTPs for a user

### 4. Views (`backend/notifications/views.py`)
- **NotificationViewSet**: REST API viewset with CRUD operations
- **Custom Action**: `/api/v1/notifications/otps/` (GET)
  - Returns active OTPs for authenticated user
  - Requires: Bearer token authentication
  - Permissions: `IsAuthenticated`

### 5. URL Configuration
```
/api/v1/notifications/          - Standard CRUD operations
/api/v1/notifications/otps/     - GET active OTPs
```

### 6. Database Schema
Table: `otp_notifications`
```sql
id          UUID PRIMARY KEY
user_id     UUID REFERENCES users(id) ON DELETE CASCADE
pin         VARCHAR(6)
title       VARCHAR(255)
body        TEXT
expires_at  TIMESTAMP
is_used     BOOLEAN DEFAULT FALSE
created_at  TIMESTAMP
used_at     TIMESTAMP
```

## Frontend Implementation

### Client App (`client/frontend/screens/Notificationscreen.js`)

#### Features Added:
1. **OTP Tab**: New tab specifically for OTP notifications
2. **Auto-refresh**: Fetches OTPs every 30 seconds
3. **PIN Display**: Prominently displays 6-digit PIN in green highlighted box
4. **Expiry Countdown**: Shows remaining time until PIN expires
5. **Visual Distinction**: OTP notifications have green theme vs blue for regular notifications

#### Key Functions:
- `fetchOTPNotifications()`: Fetches active OTPs from backend
- `formatTime(timestamp)`: Converts timestamp to readable format
- `calculateTimeRemaining(expiresAt)`: Shows countdown timer for PIN expiry

#### UI Components:
- **OTP Card**: Special styling with green accents
  - Large PIN display in bordered box
  - Real-time expiry countdown
  - Green icon and indicators
- **Loading State**: Shows spinner while fetching
- **Error Handling**: Displays error message with retry button

## Testing

### Test Script (`backend/test_otp_generation.py`)
```bash
cd backend
.\venv\Scripts\Activate.ps1
python test_otp_generation.py
```

Example output:
```
✅ Found customer user: ram@gmail.com
✅ OTP Generated Successfully!
   PIN: 839873
   Expires at: 2026-08-24 18:13:16
   Valid for: 3 minutes
```

## API Usage

### Generate OTP
```python
from notifications.otp_service import generate_otp
otp = generate_otp(
    user=user_instance,
    title="Worker Arrival Verification",
    body="Please provide this PIN to the worker to confirm arrival"
)
print(f"PIN: {otp.pin}")
```

### Fetch Active OTPs (Client App)
```javascript
const response = await fetch(`${API_BASE_URL}/api/v1/notifications/otps/`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
const otps = await response.json();
```

### Verify OTP
```python
from notifications.otp_service import verify_otp
success, message = verify_otp(user=user_instance, pin="123456")
if success:
    print("PIN verified!")
else:
    print(f"Verification failed: {message}")
```

## Security Features

1. **Time-limited**: PINs expire after 3 minutes
2. **Single-use**: Once verified, PINs cannot be reused
3. **User-specific**: PINs are tied to specific user accounts
4. **Authentication required**: API endpoint requires valid JWT token
5. **Auto-cleanup**: Expired PINs are filtered out automatically

## Integration Points

### Worker App Flow (To Be Implemented)
1. Worker clicks "Arrived at Job Location" button
2. Backend generates OTP for the job's client
3. Client sees OTP in notification screen
4. Client verbally provides PIN to worker
5. Worker enters PIN to verify arrival
6. Backend validates PIN and updates job status

## Files Modified/Created

### Backend:
- ✅ `notifications/models.py` - Added OTPNotification model
- ✅ `notifications/serializers.py` - Added OTPNotificationSerializer
- ✅ `notifications/views.py` - Added otps endpoint
- ✅ `notifications/otp_service.py` - Refactored to use Django ORM
- ✅ `notifications/urls.py` - URL routing (already configured)
- ✅ `test_otp_generation.py` - Test script
- ✅ `update_otp_schema.py` - Database schema migration script

### Frontend:
- ✅ `screens/Notificationscreen.js` - Complete redesign with OTP support

### Database:
- ✅ otp_notifications table updated with correct schema
- ✅ Migrations applied and faked where necessary

## Next Steps

1. **Worker App Integration**:
   - Add "Arrived" button on job details screen
   - Create OTP entry screen for worker
   - Implement PIN verification flow
   - Update job status on successful verification

2. **Enhancements** (Optional):
   - Push notifications when OTP is generated
   - SMS fallback for OTP delivery
   - Admin dashboard to view OTP usage stats
   - Rate limiting on OTP generation

## Configuration

### API Endpoint
Update `client/frontend/config/api.js` if your backend IP changes:
```javascript
export const API_BASE_URL = 'http://10.255.241.150:8000';
```

### Expiry Time
To change OTP expiry time, edit `backend/notifications/models.py`:
```python
self.expires_at = timezone.now() + timedelta(minutes=3)  # Change minutes here
```

### PIN Length
To change PIN length, edit `backend/notifications/models.py`:
```python
self.pin = ''.join([str(random.randint(0, 9)) for _ in range(6)])  # Change 6 to desired length
```

## Status: ✅ COMPLETE

The OTP notification system is fully functional. Clients can now view OTPs in their notification screen in real-time with auto-refresh and expiry countdown.
