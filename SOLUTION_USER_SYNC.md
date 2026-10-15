# User Sync Issue - SOLVED

## Root Cause
The client app is using a **STALE JWT token** from an old login session. The token contains user ID `5770d550-eab6-4e53-a575-c601e41c4a4a`, but the current `siya@gmail.com` user in the database has ID `47c81c28-9808-4b1f-87fa-7a2fb5951484`.

## Evidence
From database query:
```
siya@gmail.com → ID: 47c81c28-9808-4b1f-87fa-7a2fb5951484  ✅ (current/correct)
```

From error message:
```
client_id = 5770d550-eab6-4e53-a575-c601e41c4a4a  ❌ (old/stale)
```

## Why This Happened
1. User logged in previously → Got JWT with ID `5770d550...`
2. Database was reset/changed
3. User registered again → Got new ID `47c81c28...`
4. App still using old JWT token from AsyncStorage
5. Old ID doesn't exist in database → Foreign key error

## Solution Options

### Option 1: Clear App Data & Re-login (RECOMMENDED)
**On Android Device/Emulator:**
```
Settings → Apps → Expo Go → Storage → Clear Data
```

OR press the **Red X** button in Expo error screen → Reload → Login again

### Option 2: Logout from App
1. Open the client app
2. Navigate to Profile/Settings
3. Click Logout
4. Close app completely
5. Reopen and login with siya@gmail.com / siya

### Option 3: Clear AsyncStorage via Code (Quick Fix)
Add this to the login screen BEFORE navigating home:

```javascript
// Clear old tokens before saving new ones
await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_data']);
```

### Option 4: Manual Token Cleanup (Developer)
Run in Expo dev tools console:
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
AsyncStorage.clear().then(() => console.log('Cleared!'));
```

## Backend Fix Applied
The backend now auto-creates missing users, so the problematic user ID `5770d550...` was created with a customer profile. However, the app should still use the correct user ID by logging in fresh.

## Prevention
To prevent this in the future:

1. **Add token expiry checking:**
```javascript
// Check if token is expired before using it
const tokenExpiry = await AsyncStorage.getItem('token_expiry');
if (new Date().getTime() > parseInt(tokenExpiry)) {
  // Token expired, force re-login
  await AsyncStorage.clear();
  navigation.navigate('Login');
}
```

2. **Clear tokens on registration:**
```javascript
// In registration success handler
await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
```

3. **Add logout on 401 errors:**
```javascript
if (response.status === 401) {
  await AsyncStorage.clear();
  Alert.alert('Session Expired', 'Please login again');
  navigation.navigate('Login');
}
```

## Test After Fix

1. **Clear app data** (Option 1)
2. **Login** as siya@gmail.com / siya
3. **Search for Cook**
4. **Request Worker** (Sam)
5. **Confirm & Book Worker**
6. **Should succeed!** ✅

Backend will:
- Use fresh JWT token with correct user ID
- Find or create user in database
- Create customer profile
- Create work request
- Save to database successfully

## Verification
Check backend logs after booking:
```
✅ User exists in database: siya@gmail.com
✅ Found customer profile: <uuid>
✅ Work request created: <uuid>
```

## Files Modified
- `backend/jobs/views.py` - Enhanced user creation with transactions
- `backend/test_user_creation.py` - Created diagnostic script
- `backend/fix_user_sync.py` - Fixed to use SahayakUser

## Database State
- Total users: 10
- Total customer profiles: 2
- siya@gmail.com exists with correct customer profile ✅
- sam@gmail.com exists with worker profile ✅
- All foreign key relationships valid ✅
