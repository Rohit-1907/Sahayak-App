# Organization Worker Navigation Fixes

## Summary
Fixed internal map navigation for organization workers in the Sahayak worker app.

## Changes Made

### 1. ✅ Fixed `jobnear.js` - Jobs Near You Screen
**Location:** `d:\capstone\worker\frontend\screen\jobnear.js`

**What was fixed:**
- Added `org_worker` role handling to fetch assigned + in-progress work
- Uses endpoint: `/api/v1/org/worker/{workerId}/work/?status=assigned` and `status=in_progress`
- Combines both arrays to show all active work

**Code added (lines ~87-131):**
```javascript
// Organization worker: fetch assigned work
if (userRole === 'org_worker') {
  console.log('💼 Fetching organization worker assigned work');
  
  const workerDataStr = await AsyncStorage.getItem('worker_data');
  if (workerDataStr) {
    const workerData = JSON.parse(workerDataStr);
    const workerId = workerData.id;
    
    // Fetch assigned and in-progress work
    const [assignedResponse, inProgressResponse] = await Promise.all([...]);
    
    const assignedWork = assignedData.work || [];
    const inProgressWork = inProgressData.work || [];
    
    const allWork = [...assignedWork, ...inProgressWork];
    setJobs(allWork);
  }
}
```

### 2. ✅ Fixed `jobnear.js` JobDetail Component - Internal Navigation
**Location:** `d:\capstone\worker\frontend\screen\jobnear.js` (line ~631)

**What was fixed:**
- Replaced external Google Maps link with internal navigation
- Uses `expo-location` to get worker's current GPS position
- Navigates to `navigationMap` screen with route

**Before:**
```javascript
const handleNavigateToClient = () => {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;
  Linking.openURL(mapUrl);
};
```

**After:**
```javascript
const handleNavigateToClient = async () => {
  const Location = require('expo-location');
  const { status} = await Location.requestForegroundPermissionsAsync();
  const location = await Location.getCurrentPositionAsync({...});
  
  go('navigationMap', {
    workerLocation: { latitude: location.coords.latitude, longitude: location.coords.longitude },
    jobLocation: { latitude: parseFloat(jobLat), longitude: parseFloat(jobLng) },
    clientName: jobData.client_name,
    serviceType: jobData.service_category
  });
};
```

### 3. ✅ Fixed `OrgWorkerJobDetails.js` - Internal Navigation
**Location:** `d:\capstone\worker\frontend\screen\home\OrgWorkerJobDetails.js` (line ~245)

**What was fixed:**
- Same as above - replaced external Google Maps with internal navigation
- Uses worker's current GPS location instead of stored location
- Opens map inside the app with route displayed

**Before:**
```javascript
const handleNavigateToLocation = async () => {
  const address = encodeURIComponent(work.location);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;
  Linking.openURL(mapUrl);
};
```

**After:**
```javascript
const handleNavigateToLocation = async () => {
  const Location = require('expo-location');
  const { status } = await Location.requestForegroundPermissionsAsync();
  const location = await Location.getCurrentPositionAsync({...});
  
  go('navigationMap', {
    workerLocation,
    jobLocation,
    clientName: work.client_name,
    serviceType: work.work_type
  });
};
```

### 4. ✅ Backend Model Fixes
**Location:** `d:\capstone\backend\organization\models.py`

**What was fixed:**
- Added missing payment fields to `OrgWorkRequest` model
- Added completion/rating fields

**Fields added:**
```python
# Payment fields
service_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0)
platform_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
additional_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
additional_charges_reason = models.TextField(blank=True, default='')
total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
payment_mode = models.CharField(max_length=20, default='CASH')

# Completion fields
rating = models.IntegerField(null=True, blank=True)
feedback = models.TextField(blank=True, default='')
completed_at = models.DateTimeField(null=True, blank=True)
```

### 5. ✅ Backend Serializer Fixes
**Location:** `d:\capstone\backend\organization\serializers.py`

**What was fixed:**
- Added `service_charge` field to `OrgWorkRequestCreateSerializer`
- Set default value of 0 if not provided

```python
service_charge = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0)

def create(self, validated_data):
    if 'service_charge' not in validated_data:
        validated_data['service_charge'] = 0
    request = OrgWorkRequest.objects.create(org=org, **validated_data)
    return request
```

## Testing

### Organization Worker Login: 9966332255 / a3faSon99

**Test Navigation:**
1. Login as organization worker (9966332255)
2. Go to "Jobs Near You" tab
3. Click on an assigned job
4. Click "Navigate to Job Location"
5. ✅ Map should open INSIDE the app with route displayed

**Test Jobs Display:**
1. Home page should show: Assigned (orange) + In Progress (blue) work
2. Jobs Near You should show: Same assigned + in progress work
3. ❌ Should NOT show completed work in Jobs Near You

## Known Issues

### Issue: Duplicate/Wrong Jobs in "Jobs Near You"
**Symptoms:**
- Jobs Near You showing completed jobs instead of assigned
- Home shows 1 completed, Jobs Near You shows 2 completed
- Assigned jobs not appearing

**Possible Causes:**
1. Backend API returning wrong data
2. Role detection issue (detecting as wrong role)
3. Worker ID mismatch

**Debug Steps:**
1. Check Metro logs for: `💼 Jobs Near You: Fetching jobs... User Role:`
2. Should see: `User Role: org_worker`
3. Check: `💼 Worker ID:` - should match database
4. Check API responses in logs

**If role is wrong:**
- Check AsyncStorage `user_role` value
- Should be `org_worker` not `organization_admin`

**If API returns wrong data:**
- Check backend endpoint: `/api/v1/org/worker/{workerId}/work/?status=assigned`
- Verify worker_id is correct
- Check database for work assignments

## Files Modified
1. `d:\capstone\worker\frontend\screen\jobnear.js`
2. `d:\capstone\worker\frontend\screen\home\OrgWorkerJobDetails.js`
3. `d:\capstone\backend\organization\models.py`
4. `d:\capstone\backend\organization\serializers.py`

## Dependencies
- `expo-location` (already installed in worker app)
- Google Maps API key (already configured)
- OSRM routing service (already set up)

## Next Steps
1. ✅ Internal navigation working for all worker types
2. ❌ Need to debug Jobs Near You showing wrong data
3. ❌ Need to verify backend API responses

---
**Last Updated:** 2026-09-10
**Status:** Navigation fixed ✅ | Jobs display issue under investigation ❌
