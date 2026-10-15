# Worker Location GPS Coordinates Fix

## Problem Found
Worker profiles were not showing in client app searches because:
1. **Existing worker "Sam" has NULL GPS coordinates** in database
2. **Worker registration was NOT saving location coordinates** to backend API

## Root Cause
In `d:\capstone\worker\frontend\App.js` registration flow:
- `RegisterScreen.js` collects `primaryLocation` from `LocationPicker` component ✅
- `onNext` callback receives `registrationData.primaryLocation` ✅  
- **BUT** when constructing `apiData` for backend API, `primaryLocation` was **missing** ❌

## Fixes Applied

### 1. Fixed Worker Registration Code
**File:** `d:\capstone\worker\frontend\App.js`

**Changed:** Added `primaryLocation` to API payload (line ~678)
```javascript
const apiData = {
  // ... other fields ...
  primaryLocation: registrationData.primaryLocation  // ✅ NOW INCLUDED
};
```

### 2. SQL to Update Existing Worker
**File:** `d:\capstone\UPDATE_WORKER_COORDINATES.sql`

Run this in Supabase SQL Editor to add coordinates to Sam's profile:
```sql
UPDATE worker_profiles 
SET 
  primary_latitude = 18.6771,
  primary_longitude = 73.8978,
  current_latitude = 18.6771,
  current_longitude = 73.8978,
  location_updated_at = NOW()
WHERE user_id = '33e20d20-0779-4147-bf33-7b2749800803';
```

**Location:** Alandi, Pune (18.6771, 73.8978)

## Testing Steps

### Immediate Fix (Update Existing Worker)
1. Open Supabase SQL Editor
2. Run the SQL from `UPDATE_WORKER_COORDINATES.sql`
3. Verify coordinates are saved
4. Search for "Cook" in client app - Sam's profile should now appear

### Test New Registration (After Code Fix)
1. Register a new worker in worker app
2. **Make sure to select location** using the LocationPicker
3. Complete registration
4. Check database - coordinates should be saved
5. Search for that worker in client app - should appear immediately

## Backend API Verification Needed
Check if backend API endpoint accepts `primaryLocation` field:
- Endpoint: `POST /api/v1/users/register/worker/`
- Expected format:
```json
{
  "primaryLocation": {
    "latitude": 18.6771,
    "longitude": 73.8978,
    "address": "Alandi, Pune, Maharashtra",
    "city": "Pune",
    "state": "Maharashtra"
  }
}
```

If backend doesn't accept `primaryLocation`, it may need:
- Flat fields: `primary_latitude`, `primary_longitude`, etc.
- Check Django serializer and model

## Files Modified
1. ✅ `d:\capstone\worker\frontend\App.js` - Added primaryLocation to registration API call
2. ✅ `d:\capstone\UPDATE_WORKER_COORDINATES.sql` - SQL to update existing worker
3. ✅ `d:\capstone\WORKER_LOCATION_FIX.md` - This documentation

## Current Situation
- **Sam (Cook)** - Coordinates: NULL → Need SQL update
- **Future workers** - Will save coordinates after code fix

## Login Credentials for Sam
Based on database:
- **Email:** sam@example.com *(check actual email in database)*
- **Phone:** *(check in database)*
- **Password:** *(set during registration)*

To get actual credentials, run:
```sql
SELECT 
  u.username,
  u.email,
  wp.phone_number,
  wp.full_name
FROM users u
JOIN worker_profiles wp ON u.id = wp.user_id
WHERE u.id = '33e20d20-0779-4147-bf33-7b2749800803';
```
