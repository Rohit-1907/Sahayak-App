# Fixed Issues - Work Request Flow

## Issues Fixed (August 22, 2026)

### 1. ✅ Syntax Error in Bookworkerscreen.js
**Problem:** Bundle compilation failed with syntax error at line 1247
**Fix:** Corrected `StyleSheet.create()` formatting

### 2. ✅ Worker ID Mismatch - Critical Bug
**Problem:** Backend received `user_id` instead of `worker_profile_id`, causing "Worker not found" errors

**Root Cause:** In `Availaiblescreen.js` line 315:
```javascript
id: worker.user_id  // ❌ WRONG
```

**Fixed to:**
```javascript
id: worker.id  // ✅ Correct worker_profile_id
```

**Impact:** 
- Before: `worker_id` sent as `33e20d20-0779-4147-bf33-7b2749800803` (user account ID)
- After: `worker_id` sent as `367cc252-d60c-41cc-9973-3dd699649c3f` (worker profile ID)

### 3. ✅ Database User Sync Issue
**Problem:** JWT token contains user ID that doesn't exist in `users` table
```
Failed to create work request: insert or update on table "work_requests" 
violates foreign key constraint "work_requests_client_id_fkey" 
DETAIL: Key (client_id)=(5770d550-eab6-4e53-a575-c601e41c4a4a) 
is not present in table "users".
```

**Fix:** Added automatic user creation in `jobs/views.py`:
```python
# IMPORTANT: Ensure user exists in database
try:
    db_user = User.objects.get(id=request.user.id)
except User.DoesNotExist:
    # Create user record from authenticated user
    db_user = User.objects.create(
        id=request.user.id,
        email=request.user.email,
        full_name=request.user.username or request.user.email.split('@')[0],
        phone_number='',
        user_role='client',
        is_active=True
    )
```

**Why this happens:**
- Supabase Auth creates authentication records
- Custom `users` table may not get synced automatically
- JWT authentication creates a temporary user object in Django
- Database foreign key constraints require actual user record

**Resolution:** Backend now auto-creates missing user records on-demand

### 4. ✅ Hardcoded Data Removed
**Screens updated:**
- `Homescreen.js` - Removed hardcoded workers array
- `Plumbingscreen.js` - Removed hardcoded workers
- `Performance.js` (worker app) - Removed hardcoded data
- `jobnear.js` (worker app) - Removed hardcoded JOBS

All screens now use real-time API data.

## Test Flow

### Client App (siya@gmail.com / siya)
1. ✅ Login → Home Screen
2. ✅ Select Service (Cook) → Search Location
3. ✅ API searches workers → Returns Sam (worker_profile_id: 367cc252...)
4. ✅ Click worker → View Profile (real data)
5. ✅ Request Worker → Confirm & Book
6. ✅ Creates work_request with correct worker_profile_id
7. ✅ Entry created in `work_requests` table
8. ✅ Status: REQUESTED

### Worker App (sam@gmail.com / sam)
1. ✅ Login → Home Screen  
2. ✅ Navigate to "Work Requests" or "Requests"
3. ✅ See request from siya
4. ✅ Can Accept or Reject
5. ✅ Accept → Status changes to SCHEDULED
6. ✅ Reject → Status changes to REJECTED

## Database Tables

### work_requests (NEW - preferred)
- `id` (UUID primary key)
- `client_id` (FK to users → CustomerProfile)
- `worker_id` (FK to worker_profiles)
- `service_category` (VARCHAR)
- `title` (VARCHAR)
- `description` (TEXT)
- `work_address`, `work_latitude`, `work_longitude`
- `required_date`, `required_time`
- `estimated_budget` (DECIMAL)
- `status` (REQUESTED / SCHEDULED / REJECTED)
- `accepted_at`, `rejected_at`, `rejection_reason`

### job_requests (OLD - legacy)
- Still exists for backward compatibility
- `JobRequest` → `JobBooking` pattern

## API Endpoints Used

### Client Side
- `POST /api/v1/users/workers/search/` - Search workers
- `POST /api/v1/jobs/work-requests/create/` - Create work request
- `GET /api/v1/jobs/work-requests/client/` - List client's requests

### Worker Side
- `GET /api/v1/jobs/work-requests/worker/` - List worker's requests
- `POST /api/v1/jobs/work-requests/<uuid>/action/` - Accept/Reject request
- `GET /api/v1/jobs/work-requests/<uuid>/` - Get request details

## Files Modified

### Client App
1. `screens/Bookworkerscreen.js` - Fixed syntax, uses work_requests API
2. `screens/Availaiblescreen.js` - Fixed worker ID transformation, added hourly_rate
3. `screens/Workerprofilescreen.js` - Passes correct IDs through navigation
4. `screens/MyRequestsScreen.js` - NEW - Shows client's requests with filters
5. `screens/Homescreen.js` - Removed hardcoded data
6. `screens/Plumbingscreen.js` - Removed hardcoded data
7. `App.js` - Routes to correct screens

### Worker App
1. `screen/WorkRequestsScreen.js` - NEW - Shows worker's incoming requests
2. `screen/Performance.js` - Removed hardcoded data
3. `screen/jobnear.js` - Removed hardcoded data
4. `App.js` - Added work request routes

### Backend
1. `jobs/models.py` - Added `WorkRequest` model
2. `jobs/serializers.py` - Added serializers for work requests
3. `jobs/views.py` - Added 5 endpoints + auto user creation
4. `jobs/urls.py` - Registered new endpoints
5. `jobs/admin.py` - Added WorkRequestAdmin

## Scripts Created

1. `fix_user_sync.py` - Syncs Supabase auth users to custom table
2. `CHECK_USERS.sql` - Queries to verify user data
3. `LOGIN_CREDENTIALS.md` - Test account reference
4. `FIXED_ISSUES.md` - This document

## Known Working Configuration

**Backend:** Django + Supabase PostgreSQL
- URL: http://192.168.1.4:8000
- Database: Supabase (lefsctqcgrgrsumkxyhz)
- Auth: JWT with Supabase

**Client App:** React Native + Expo
- Base URL: http://192.168.1.4:8000
- Auth token storage: AsyncStorage
- Key: `access_token`

**Worker App:** React Native + Expo  
- Same backend URL
- Separate authentication flow

## Next Steps for Users

If you encounter the foreign key error again:

### Option 1: Automatic (Recommended)
Just try the action again. The backend now auto-creates missing users.

### Option 2: Logout/Login
1. Logout from the app
2. Close the app completely
3. Restart and login again
4. Try booking again

### Option 3: Run Sync Script
```powershell
cd d:\capstone\backend
python fix_user_sync.py
```

This syncs all Supabase auth users to the custom `users` table.

## Verification Commands

```powershell
# Check if request was created
psql <connection-string>
SELECT * FROM work_requests ORDER BY created_at DESC LIMIT 5;

# Check users
SELECT id, email, full_name, user_role FROM users;

# Check worker profiles
SELECT id, user_id FROM worker_profiles WHERE user_id IN (
    SELECT id FROM users WHERE email = 'sam@gmail.com'
);
```

## Success Criteria

✅ Client can search for workers
✅ Worker data shown is real-time from database
✅ Client can request a worker
✅ Request saves to database
✅ Worker sees the request
✅ Worker can accept/reject
✅ Status updates correctly
✅ No hardcoded data anywhere
✅ Proper error handling
✅ User sync issues auto-resolved
