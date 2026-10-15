# 🗺️ Fix Black Map Screen Issue

## ✅ What I Fixed

### 1. Updated app.json Files (Both Apps)
Added `react-native-maps` plugin configuration with Google Maps API key:

```json
"plugins": [
  ...other plugins,
  [
    "react-native-maps",
    {
      "googleMapsApiKey": "AIzaSyC7pA_4_cuuBw_dtRUjJ7tIAFXUeJ8hBIA"
    }
  ]
]
```

**Files Updated:**
- ✅ `client/frontend/app.json`
- ✅ `worker/frontend/app.json`

### 2. Enhanced NavigationMapScreen.js
- ✅ Added better error handling
- ✅ Added loading indicators
- ✅ Added error retry button
- ✅ Better console logging for debugging
- ✅ Platform-specific map provider selection
- ✅ Map loads region before fetching route (faster initial display)

## 🚀 How to Fix the Black Screen

### Step 1: Rebuild the App with Plugins

The plugin configuration requires a **full rebuild**, not just cache clear:

```bash
# Stop the current Metro bundler (Ctrl+C)

# For CLIENT app:
cd d:\capstone\client\frontend

# IMPORTANT: Delete build cache
Remove-Item -Recurse -Force .expo
Remove-Item -Recurse -Force node_modules\.cache

# Rebuild with clean cache
npx expo start -c

# Press 'a' for Android
```

### Step 2: Check Console Logs

When you click "Navigate to Worker", watch the Metro bundler terminal for these logs:

**✅ Good signs:**
```
🗺️ NavigationMapScreen mounted
📍 Params: {...}
📍 Client Location: {...}
📍 Worker Location: {...}
📍 Map region calculated: {...}
🔄 Fetching route from OSRM...
✅ Route loaded: 123 points
✅ Map is ready
```

**❌ Bad signs:**
```
❌ Client location missing
❌ Worker location missing
❌ MapView error: ...
❌ Error loading map: ...
```

### Step 3: Verify Google Maps API Key

Check if your API key is valid and has the right APIs enabled:

1. Go to: https://console.cloud.google.com/google/maps-apis/credentials
2. Find your API key: `AIzaSyC7pA_4_cuuBw_dtRUjJ7tIAFXUeJ8hBIA`
3. Make sure these APIs are enabled:
   - ✅ Maps SDK for Android
   - ✅ Maps SDK for iOS
   - ✅ Places API (optional but recommended)

### Step 4: Check Worker Coordinates in Database

The "Worker location not available" error means the worker doesn't have coordinates in the database.

**Run this SQL in Supabase:**

```sql
-- Check if worker has coordinates
SELECT 
    u.first_name, 
    u.last_name, 
    u.phone_number,
    wp.current_latitude,
    wp.current_longitude,
    wp.primary_latitude,
    wp.primary_longitude
FROM worker_profiles wp
JOIN sahayak_users u ON wp.user_id = u.id
WHERE u.phone_number = '9632587410';
```

**If coordinates are NULL, update them:**

```sql
-- Add Pune coordinates to test worker
UPDATE worker_profiles
SET 
    current_latitude = 18.5074,
    current_longitude = 73.8077,
    primary_latitude = 18.5074,
    primary_longitude = 73.8077,
    location_updated_at = NOW()
WHERE user_id IN (
    SELECT id FROM sahayak_users WHERE phone_number = '9632587410'
);
```

## 🐛 Common Issues & Solutions

### Issue 1: Black Screen After Rebuild
**Cause:** API key not propagated or invalid

**Solution:**
1. Wait 5-10 minutes (Google API key propagation delay)
2. Rebuild again: `npx expo start -c`
3. Check API key restrictions in Google Cloud Console
4. Make sure API key has no IP/domain restrictions

### Issue 2: Map Shows But No Markers
**Cause:** Invalid coordinates or coordinates are 0,0

**Solution:**
- Check console logs for coordinate values
- Verify database has correct latitude/longitude values
- Coordinates should be: Pune area (18.xxx, 73.xxx)

### Issue 3: "Authorization failure" Error
**Cause:** Google Maps API key not activated or restricted

**Solution:**
1. Go to Google Cloud Console
2. Enable "Maps SDK for Android"
3. Remove any API key restrictions (for testing)
4. Wait 5 minutes, then rebuild app

### Issue 4: App Crashes When Opening Map
**Cause:** react-native-maps not properly linked

**Solution:**
```bash
cd d:\capstone\client\frontend

# Reinstall dependencies
npm install

# Clear all caches
npx expo start -c --clear
```

## 🔍 Debug Checklist

Before testing, verify:

- [ ] ✅ app.json has react-native-maps plugin
- [ ] ✅ Google Maps API key in both iOS and Android config
- [ ] ✅ Location permissions in app.json (ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION)
- [ ] ✅ Worker has coordinates in database (current_latitude/longitude or primary_latitude/longitude)
- [ ] ✅ Booking has client coordinates (work_latitude/work_longitude)
- [ ] ✅ App rebuilt with clean cache: `npx expo start -c`
- [ ] ✅ Metro bundler shows no red errors

## 🎯 Expected Behavior

After following these steps, when you click "Navigate to Worker":

1. ✅ Screen shows "Loading route..." for 1-2 seconds
2. ✅ Map appears with Google Maps branding
3. ✅ Blue home marker appears (client location)
4. ✅ Green person marker appears (worker location)
5. ✅ Blue route line connects the two markers
6. ✅ Info card at bottom shows distance, duration, worker name
7. ✅ "Open in Google Maps" button works

## 🛠️ Test Commands

```bash
# Client App
cd d:\capstone\client\frontend
Remove-Item -Recurse -Force .expo, node_modules\.cache -ErrorAction SilentlyContinue
npx expo start -c

# Worker App  
cd d:\capstone\worker\frontend
Remove-Item -Recurse -Force .expo, node_modules\.cache -ErrorAction SilentlyContinue
npx expo start -c
```

## 📞 Still Black Screen?

If the screen is still black after following all steps:

1. **Share the console logs** - Look for errors in Metro bundler
2. **Check Logcat** (Android): `adb logcat | Select-String "Google"`
3. **Verify API Key** - Try a different Google Maps API key
4. **Try on different device** - Sometimes emulator has issues

## 🔗 Useful Links

- Google Cloud Console: https://console.cloud.google.com/
- Supabase Dashboard: https://supabase.com/dashboard/project/lefsctqcgrgrsumkxyhz
- Expo Maps Documentation: https://docs.expo.dev/versions/v57.0.0/sdk/map-view/
- react-native-maps Troubleshooting: https://github.com/react-native-maps/react-native-maps/blob/master/docs/troubleshooting.md
