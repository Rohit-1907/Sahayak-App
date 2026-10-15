# Worker Registration Primary Location Collection - COMPLETE ✅

## Step 3: Implement Worker Registration Primary Location Collection

### Changes Implemented

#### 1. **Added expo-location to Worker App** ✅

```bash
cd d:\capstone\worker\frontend
npx expo install expo-location
```

**Status:** Package installed successfully  
**Version:** SDK 57.0.0 compatible

**Permissions (Already Configured in app.json):**
```json
"android": {
  "permissions": [
    "ACCESS_FINE_LOCATION",
    "ACCESS_COARSE_LOCATION"
  ]
}
```

---

#### 2. **Created LocationPicker Component** ✅

**File:** `d:\capstone\worker\frontend\components\LocationPicker.js`

**Features:**
- ✅ Request location permission
- ✅ Get current GPS location
- ✅ Reverse geocode to get address
- ✅ Manual location entry option
- ✅ Display selected location with coordinates
- ✅ Clear/change location functionality
- ✅ Responsive design using responsive utilities
- ✅ Error handling with user-friendly messages

**Two Options Provided:**

1. **Use My Current Location**
   - Requests foreground location permission
   - Gets current GPS coordinates
   - Reverse geocodes to get human-readable address
   - Shows latitude/longitude in confirmation
   - Falls back to manual entry if permission denied

2. **Enter Location Manually**
   - Text input for service area address
   - Text input for city
   - Saves location without GPS coordinates
   - Backend can geocode later if needed

**Location Object Structure:**
```javascript
{
  address: "Dighi, Near ABC Mall, Pune",
  city: "Pune",
  state: "Maharashtra",
  latitude: 18.6186,   // Optional (only if GPS used)
  longitude: 73.9196,  // Optional (only if GPS used)
}
```

---

#### 3. **Updated RegisterScreen.js** ✅

**File:** `d:\capstone\worker\frontend\screen\RegisterScreen.js`

**Changes Made:**

**a) Added Import:**
```javascript
import LocationPicker from '../components/LocationPicker';
```

**b) Added State:**
```javascript
const [primaryLocation, setPrimaryLocation] = useState(null);
```

**c) Added UI Section:**
```jsx
{/* PRIMARY SERVICE LOCATION - NEW */}
<Text style={styles.sectionTitle}>
  Service Location
</Text>

<LocationPicker
  onLocationSelected={setPrimaryLocation}
  initialLocation={primaryLocation}
/>
```

**Placement:** After Country field, before Professional Details section

**d) Added Validation:**
```javascript
// Validate primary service location
if (!primaryLocation) {
  Alert.alert(
    "Required",
    "Please set your primary service location. This helps clients find you."
  );
  return;
}
```

**e) Updated Data Passed to onNext:**
```javascript
onNext({
  name,
  dob,
  gender,
  workType,
  phone,
  aadhaar,
  aadhaarImage,
  aadhaarVerified,
  address,
  city,
  state,
  pinCode,
  country,
  primaryLocation,  // ✅ New field
  experience,
  visitCharge,
  email,
  password,
});
```

---

#### 4. **Updated Backend Registration API** ✅

**File:** `d:\capstone\backend\authentication\views.py`

**Function:** `register_worker()`

**Changes Made:**

**a) Updated Docstring:**
```python
"""
Expected data:
{
    ...
    "primaryLocation": {
        "address": str,
        "city": str,
        "state": str,
        "latitude": float (optional),
        "longitude": float (optional)
    },
    ...
}
"""
```

**b) Extract Primary Location Data:**
```python
# Extract primary location data (new)
primary_location = request.data.get('primaryLocation', {})
primary_address = primary_location.get('address', address)  # Fallback to address if not provided
primary_city = primary_location.get('city', city)
primary_state = primary_location.get('state', state)
primary_latitude = primary_location.get('latitude')
primary_longitude = primary_location.get('longitude')
```

**c) Save to WorkerProfile:**
```python
# Create worker profile with primary location
WorkerProfile.objects.create(
    user=user,
    service_categories=[work_type],
    years_of_experience=int(experience.split()[0]) if experience.split()[0].isdigit() else 0,
    hourly_rate=float(visit_charge),
    # Legacy address fields (kept for backward compatibility)
    address=address,
    city=city,
    state=state,
    pincode=pin_code,
    # New primary location fields ✅
    primary_address=primary_address,
    primary_city=primary_city,
    primary_state=primary_state,
    primary_latitude=primary_latitude,
    primary_longitude=primary_longitude,
    is_available=True
)
```

**Backward Compatibility:**
- If `primaryLocation` not provided, falls back to `address`, `city`, `state`
- Legacy fields still populated
- Existing registration flows still work

---

## Registration Flow

### User Journey

1. **Worker Opens Registration**
   - Fills in personal details
   - Fills in identity verification
   - Fills in address details (home address)

2. **Service Location Section (NEW)**
   - Sees "Service Location" heading
   - Sees LocationPicker component
   - Two options presented:

3. **Option A: Use Current Location**
   - Taps "Use My Current Location"
   - App requests location permission
   - If granted:
     - GPS coordinates obtained
     - Address reverse-geocoded
     - Location displayed with confirmation
     - User can proceed or change
   - If denied:
     - Error message shown
     - Can use manual entry instead

4. **Option B: Manual Entry**
   - Enters service area address (e.g., "Dighi, Near ABC Mall")
   - Enters city (e.g., "Pune")
   - Taps "Save Location"
   - Location confirmed
   - User can proceed

5. **Complete Registration**
   - Fills professional details
   - Sets password
   - Taps "Complete Registration"
   - Validation includes location check
   - If location not set: Error "Please set your primary service location"
   - If all valid: Registration proceeds

6. **Backend Saves Data**
   - Creates SahayakUser
   - Creates UserProfile
   - Creates WorkerProfile with:
     - `primary_address`
     - `primary_city`
     - `primary_state`
     - `primary_latitude` (if GPS used)
     - `primary_longitude` (if GPS used)
   - Returns success + JWT tokens

---

## Database After Registration

### Sample Worker Profile Created

```sql
worker_profiles
├── id: UUID
├── user_id: FK (SahayakUser)
├── service_categories: ["Construction"]
├── years_of_experience: 5
├── hourly_rate: 500.00
├── is_available: true
│
├── -- Legacy Address (home) --
├── address: "123 Main Street, Apartment 4B"
├── city: "Pune"
├── state: "Maharashtra"
├── pincode: "411033"
├── latitude: null
├── longitude: null
│
├── -- Primary Service Location (NEW) --
├── primary_address: "Dighi, Near ABC Mall"
├── primary_city: "Pune"
├── primary_state: "Maharashtra"
├── primary_latitude: 18.6186    # If GPS used
├── primary_longitude: 73.9196   # If GPS used
│
├── -- Current Location (will be updated in Step 4) --
├── current_latitude: null
├── current_longitude: null
├── location_updated_at: null
│
└── created_at, updated_at
```

---

## Key Differences: Home Address vs Primary Service Location

### Home Address (Existing)
- `address`, `city`, `state`, `pincode`
- Worker's residential address
- Used for identity verification
- Not used for client matching

### Primary Service Location (NEW)
- `primary_address`, `primary_city`, `primary_state`
- `primary_latitude`, `primary_longitude`
- Worker's base service area
- Used for client matching
- Shown to clients as service location
- Fallback when current location is stale

**Example:**
```
Worker: Amit Kumar

Home Address:
123 Main Street, Apartment 4B
Kharadi, Pune - 411014

Primary Service Location:
Dighi, Pune
Lat: 18.6186, Lon: 73.9196
```

Clients near Dighi will see Amit as available, even though he lives in Kharadi.

---

## Location Permissions Handling

### Permission States

1. **Not Requested**
   - Default state
   - Show "Use My Current Location" button
   - No permission prompt yet

2. **Permission Requested**
   - User taps "Use My Current Location"
   - System permission dialog shown
   - Waiting for user response

3. **Permission Granted**
   - GPS location obtained
   - Reverse geocoding performed
   - Location displayed with coordinates
   - User can proceed

4. **Permission Denied**
   - Error alert shown:
     - "Location permission is required to use current location."
     - "You can enter your location manually instead."
   - Manual entry option still available
   - Registration not blocked

---

## Error Handling

### Location Permission Denied
```javascript
Alert.alert(
  'Permission Denied',
  'Location permission is required to use current location. You can enter your location manually instead.',
  [{ text: 'OK' }]
);
```

### GPS Location Error
```javascript
Alert.alert(
  'Location Error',
  'Unable to get your current location. Please try again or enter manually.',
  [{ text: 'OK' }]
);
```

### Manual Entry Validation
```javascript
if (!manualAddress.trim()) {
  Alert.alert('Required', 'Please enter your service location address.');
  return;
}

if (!manualCity.trim()) {
  Alert.alert('Required', 'Please enter your city.');
  return;
}
```

### Registration Validation
```javascript
if (!primaryLocation) {
  Alert.alert(
    "Required",
    "Please set your primary service location. This helps clients find you."
  );
  return;
}
```

---

## Testing Checklist

### ✅ LocationPicker Component

- [ ] GPS permission request shows system dialog
- [ ] GPS permission granted gets current location
- [ ] GPS permission denied shows error, allows manual entry
- [ ] Reverse geocoding shows readable address
- [ ] Coordinates displayed correctly (format: 18.6186)
- [ ] "Change Location" clears selection
- [ ] Manual address entry accepts text
- [ ] Manual city entry accepts text
- [ ] "Save Location" validates required fields
- [ ] Selected location displays with green checkmark
- [ ] Component is responsive on different screen sizes

### ✅ RegisterScreen Integration

- [ ] "Service Location" section appears after Country
- [ ] LocationPicker renders correctly
- [ ] Location selection updates state
- [ ] Registration validates location is set
- [ ] Registration fails with error if location not set
- [ ] Registration succeeds with location data
- [ ] Location data passed to backend correctly

### ✅ Backend API

- [ ] API accepts primaryLocation object
- [ ] API extracts address, city, state, lat, lon
- [ ] API saves to primary_address, primary_city, etc.
- [ ] API handles missing latitude/longitude gracefully
- [ ] API falls back to address if primaryLocation not provided
- [ ] Registration succeeds with GPS location
- [ ] Registration succeeds with manual location
- [ ] Database fields populated correctly

---

## Sample API Request

### With GPS Location
```json
POST /api/v1/auth/register-worker/

{
  "name": "Amit Kumar",
  "dob": "1990-05-15",
  "gender": "male",
  "workType": "Construction",
  "phone": "9876543210",
  "aadhaar": "123456789012",
  "address": "123 Main Street, Apartment 4B",
  "city": "Pune",
  "state": "Maharashtra",
  "pinCode": "411033",
  "country": "India",
  "primaryLocation": {
    "address": "Dighi, Near ABC Mall, Pune",
    "city": "Pune",
    "state": "Maharashtra",
    "latitude": 18.6186,
    "longitude": 73.9196
  },
  "experience": "5 years",
  "visitCharge": "500",
  "email": "amit@example.com",
  "password": "SecurePass123"
}
```

### With Manual Location (No GPS)
```json
POST /api/v1/auth/register-worker/

{
  ...
  "primaryLocation": {
    "address": "Dighi, Pune",
    "city": "Pune",
    "state": "",
    "latitude": null,
    "longitude": null
  },
  ...
}
```

### Without Primary Location (Backward Compatible)
```json
POST /api/v1/auth/register-worker/

{
  "name": "Amit Kumar",
  ...
  // No primaryLocation field
  ...
}

// Backend falls back to address, city, state
```

---

## Files Modified

1. ✅ `worker/frontend/package.json`
   - Added expo-location dependency

2. ✅ `worker/frontend/components/LocationPicker.js`
   - Created new component (710 lines)

3. ✅ `worker/frontend/screen/RegisterScreen.js`
   - Added import
   - Added state variable
   - Added LocationPicker component
   - Added validation
   - Updated data passed to backend

4. ✅ `backend/authentication/views.py`
   - Updated register_worker() function
   - Extract primaryLocation from request
   - Save to WorkerProfile primary location fields

---

## Next Steps (Step 4)

Now that primary location is collected during registration:

**Step 4: Worker Availability Toggle with Current Location Update**
- Create availability toggle component
- When toggled ON: request location, update current_latitude/longitude
- Update location_updated_at timestamp
- Create backend API endpoint: `/api/v1/workers/toggle-availability/`
- Display availability status in Worker Home screen

---

## Status: ✅ COMPLETE

**Worker Registration now collects primary service location:**
- ✅ Location permission handled gracefully
- ✅ GPS location with reverse geocoding
- ✅ Manual entry fallback
- ✅ Validation ensures location is set
- ✅ Backend saves to primary_address/latitude/longitude fields
- ✅ Database ready for location-based matching

**Workers can now register with their primary service location, which will be used as the base location for matching with nearby work requests.**
