# 🗺️ Google Maps Navigation Testing Guide

## ✅ What Was Fixed

### Backend Changes:
1. **Updated `WorkRequestSerializer`** in `backend/jobs/serializers.py`:
   - Added `worker_latitude` and `worker_longitude` fields
   - These pull from worker's `current_latitude`/`current_longitude` (first priority)
   - Falls back to `primary_latitude`/`primary_longitude` if current location not set
   - Added `latitude`/`longitude` aliases for client location (for backward compatibility)

### Frontend Changes:
2. **Updated `handleNavigateToWorker()`** in `client/frontend/screens/Bookingsummary.js`:
   - Now supports both `work_latitude`/`work_longitude` AND `latitude`/`longitude`
   - Better error logging to see what's missing

## 🧪 Testing Steps

### Step 1: Ensure Workers Have Location Data

Workers need coordinates in the database. Run this SQL to check:

```sql
-- Check which workers have coordinates
SELECT 
    u.first_name, 
    u.last_name, 
    u.phone_number,
    wp.current_latitude, 
    wp.current_longitude,
    wp.primary_latitude,
    wp.primary_longitude,
    wp.latitude,
    wp.longitude
FROM worker_profiles wp
JOIN sahayak_users u ON wp.user_id = u.id
LIMIT 10;
```

If workers are missing coordinates, update them:

```sql
-- Update test worker with Pune coordinates
UPDATE worker_profiles
SET 
    current_latitude = 18.5204,
    current_longitude = 73.8567,
    primary_latitude = 18.5204,
    primary_longitude = 73.8567,
    location_updated_at = NOW()
WHERE user_id IN (
    SELECT id FROM sahayak_users WHERE phone_number = '9632587410'
);
```

### Step 2: Test Client App Navigation

1. **Start backend server:**
   ```bash
   cd d:\capstone\backend
   .\venv\Scripts\Activate.ps1
   python manage.py runserver 0.0.0.0:8000
   ```

2. **Start client app:**
   ```bash
   cd d:\capstone\client\frontend
   npx expo start -c
   # Press 'a' for Android
   ```

3. **Test navigation:**
   - Login as client: `siya@gmail.com`
   - Go to "My Bookings"
   - Select a SCHEDULED booking
   - Click "Navigate to Worker" button
   - Map should open with:
     - 🏠 Blue marker (client location)
     - 👤 Green marker (worker location)
     - 🛣️ Blue route line
     - 📏 Distance and duration

### Step 3: Test Worker App Navigation

1. **Start worker app:**
   ```bash
   cd d:\capstone\worker\frontend
   npx expo start -c
   # Press 'a' for Android
   ```

2. **Test navigation:**
   - Login as worker: `9632587410`
   - Go to job details
   - Click "Navigate to Job Location"
   - Map should open similarly

## 🐛 Troubleshooting

### Error: "Client location not available"
**Cause:** Work request doesn't have `work_latitude`/`work_longitude` or `latitude`/`longitude`

**Fix:** Check the booking data in logs. The location should be saved when the service request is created.

```javascript
// Look for this in logs:
📦 Booking details: { work_latitude: 18.xxx, work_longitude: 73.xxx }
```

### Error: "Worker location not available"
**Cause:** Worker doesn't have coordinates in database

**Fix:** Update worker coordinates in database:

```sql
-- Pune coordinates (example)
UPDATE worker_profiles
SET 
    current_latitude = 18.5204,
    current_longitude = 73.8567,
    primary_latitude = 18.5204,
    primary_longitude = 73.8567
WHERE user_id IN (
    SELECT id FROM sahayak_users WHERE phone_number = '9632587410'
);
```

### Error: "Google Maps Authorization failure"
**Cause:** API key not loaded or invalid

**Fix:**
1. Rebuild app with clean cache: `npx expo start -c`
2. Wait 5 minutes for API key to propagate
3. Check API key in app.json: `AIzaSyC7pA_4_cuuBw_dtRUjJ7tIAFXUeJ8hBIA`

### Map shows but no route
**Cause:** OSRM API couldn't calculate route (locations too far, or in water, etc.)

**Fix:** Check console for routing errors. Try different test coordinates.

## 📍 Sample Test Coordinates (Pune, India)

```javascript
// Pune Railway Station
{ latitude: 18.5284, longitude: 73.8740 }

// Pune Airport
{ latitude: 18.5821, longitude: 73.9197 }

// Kothrud
{ latitude: 18.5074, longitude: 73.8077 }

// Hinjewadi
{ latitude: 18.5912, longitude: 73.7389 }
```

## ✅ Success Criteria

Navigation is working correctly when:
1. ✅ Button click opens map INSIDE the app (not external Google Maps)
2. ✅ Two custom markers appear (blue and green circles)
3. ✅ Blue route line connects the markers
4. ✅ Distance (km) and duration (min) are displayed
5. ✅ "Open in Google Maps" button works for external navigation

## 🎯 Next Steps After Testing

If navigation works:
- [ ] Update more workers with real location coordinates
- [ ] Test with org workers (organization admin flow)
- [ ] Test with different cities/locations
- [ ] Add location update feature for workers to update their current location

If navigation doesn't work:
- Check logs for specific error messages
- Verify backend returns worker_latitude/worker_longitude
- Ensure react-native-maps is installed correctly
- Verify Google Maps API key is valid
