# Location System Inspection - Current State

## Database Schema Analysis

### ✅ Existing Tables

#### 1. **WorkerProfile** (`worker_profiles`)
Current location-related fields:
```python
address = TextField(blank=True)
city = CharField(max_length=100, blank=True)
state = CharField(max_length=100, blank=True)
pincode = CharField(max_length=10, blank=True)
latitude = FloatField(null=True, blank=True)
longitude = FloatField(null=True, blank=True)
is_available = BooleanField(default=False)
```

**Missing fields needed:**
- `primary_address` (separate from current address)
- `primary_latitude` 
- `primary_longitude`
- `current_latitude` (separate from primary)
- `current_longitude`
- `location_updated_at`

**Current Implementation:**
- Has single latitude/longitude (not differentiated between primary and current)
- Has `is_available` field ✅
- No `location_updated_at` timestamp

#### 2. **OrganizationProfile** (`organization_profiles`)
Current location fields:
```python
address = TextField()
city = CharField(max_length=100)
state = CharField(max_length=100)
pincode = CharField(max_length=10)
latitude = FloatField(null=True, blank=True)
longitude = FloatField(null=True, blank=True)
```

**Status:** ✅ Already has organization location fields

#### 3. **JobRequest** (`job_requests`)
Current location fields:
```python
location_address = TextField()
latitude = FloatField()
longitude = FloatField()
```

**Missing fields needed:**
- Rename to `work_address` (for clarity)
- `work_latitude` (rename from latitude)
- `work_longitude` (rename from longitude)
- `required_date` (rename from preferred_date)
- `required_time` (rename from preferred_time)
- `number_of_workers` (new field)

**Current Implementation:**
- Has work location latitude/longitude ✅
- Called `location_address` instead of `work_address`
- Has `preferred_date` and `preferred_time` ✅

#### 4. **ServiceCategory** (`service_categories`)
**Status:** ✅ Already exists

**Missing:**
- Worker-Service junction table (`worker_services`)

### ❌ Missing Tables

#### 1. **WorkerServices** (Junction table)
**Needed:**
```python
worker_id = ForeignKey(WorkerProfile)
service_id = ForeignKey(ServiceCategory)
experience_years = IntegerField(default=0)
created_at = DateTimeField(auto_now_add=True)
```

**Current Workaround:**
- WorkerProfile has `service_categories = JSONField(default=list)`
- This works but junction table is better for querying

---

## Backend Structure

### ✅ Existing Apps
1. **authentication** - User auth, roles, JWT
2. **users** - Customer, Worker, Organization profiles
3. **jobs** - JobRequest, JobBooking, JobStatus
4. **services** - ServiceCategory, ServiceSubcategory
5. **organization** - Organization management
6. **payments** - Payment processing
7. **notifications** - Notifications
8. **analytics** - Analytics
9. **recommendations** - Recommendations

### Authentication Setup
- ✅ Custom authentication backend: `EmailPhoneUsernameAuthBackend`
- ✅ Supabase integration configured
- ✅ JWT authentication working
- ✅ User roles: customer, individual_worker, organization_admin, organization_worker, admin

### API Endpoints Status
**Existing:**
- `/api/v1/auth/login/`
- `/api/v1/auth/register-worker/`
- `/api/v1/organizations/register/`

**Missing (Need to create):**
- `/api/v1/workers/update-location/` - Update worker current location
- `/api/v1/workers/toggle-availability/` - Toggle availability + update location
- `/api/v1/workers/search/` - Search workers by service + location + availability
- `/api/v1/work-requests/create/` - Create work request with work location
- `/api/v1/workers/{id}/profile/` - Get worker profile

---

## Worker App Analysis

### Current Structure
```
d:\capstone\worker\frontend\
├── screen/
│   ├── welcome.js ✅ Responsive
│   ├── login.js ✅ Responsive
│   ├── RegisterScreen.js ✅ Responsive (NO LOCATION COLLECTION)
│   ├── OrganizationRegistrationScreen.js ✅ Responsive
│   ├── dashboard.js ✅ Responsive
│   └── home/
│       ├── IndividualWorkerHome.js ✅ Responsive
│       ├── OrganizationAdminHome.js ✅ Responsive
│       └── OrganizationWorkerHome.js ✅ Responsive
└── utils/
    └── responsive.js ✅ Created
```

### Location Permissions Status
**Packages:**
- ❌ NO `expo-location` in dependencies
- ✅ Has expo-camera (for document scanning)
- ✅ Has expo-image-picker

**Need to add:**
```bash
npx expo install expo-location
```

### Registration Flow Issues
- RegisterScreen.js does NOT collect worker location
- Only collects: name, phone, email, password, skills, experience, certifications
- Missing: primary_address, primary_latitude, primary_longitude

### Availability Toggle
- ❌ NO availability toggle UI currently
- ❌ NO location update on availability change
- Need to add this feature

---

## Client App Analysis

### Current Structure
```
d:\capstone\client\frontend\
├── screens/
│   ├── Welcomescreen.js ✅ Responsive
│   ├── Loginscreen.js ✅ Responsive
│   ├── Registerscreen.js
│   ├── Homescreen.js
│   ├── Electricianscreen.js (service screens)
│   ├── Plumbingscreen.js
│   ├── Carpenterscreen.js
│   ├── Painting.js
│   ├── Acscreen.js
│   ├── Bookingscreen.js
│   ├── Bookworkerscreen.js
│   ├── Workerinfo.js
│   ├── Workerprofilescreen.js
│   ├── Availaiblescreen.js
│   └── ... (many more screens)
└── utils/
    └── responsive.js ✅ Created
```

### Location Permissions Status
**Packages:**
- Need to check if `expo-location` is installed
- Need to add if missing

### Work Location Selection
- ❌ NO dedicated work location selection screen
- Service screens (Electricianscreen, Plumbingscreen, etc.) likely assume client's current location
- Need to add: "Use My Current Location" vs "Search/Enter Work Location" option

### Worker Search Flow
- Has `Availaiblescreen.js` - likely shows available workers
- Has `Workerinfo.js` and `Workerprofilescreen.js` - worker profiles
- Has `Bookworkerscreen.js` - booking flow
- ❌ NO distance-based search currently
- ❌ NO radius grouping

---

## Database Connection

### Supabase Setup ✅
```
URL: https://lefsctqcgrgrsumkxyhz.supabase.co
ANON_KEY: eyJhbGci...isxtGF4
SERVICE_ROLE_KEY: eyJhbGci...1IEiE (backend only)
```

### Django Database Configuration
- Using PostgreSQL via Supabase
- Connection string configured
- Migrations should work

---

## Required Changes Summary

### 1. Database Schema Changes

#### WorkerProfile - Add/Modify:
```python
# Rename existing to primary
primary_address = TextField(blank=True)  # Rename from 'address'
primary_latitude = FloatField(null=True, blank=True)  # Rename from 'latitude'
primary_longitude = FloatField(null=True, blank=True)  # Rename from 'longitude'

# Add new current location
current_latitude = FloatField(null=True, blank=True)
current_longitude = FloatField(null=True, blank=True)
location_updated_at = DateTimeField(null=True, blank=True)

# Keep existing
is_available = BooleanField(default=False)  # Already exists ✅
```

#### JobRequest - Rename/Add:
```python
# Rename for clarity
work_address = TextField()  # Rename from 'location_address'
work_latitude = FloatField()  # Rename from 'latitude'
work_longitude = FloatField()  # Rename from 'longitude'

# Rename
required_date = DateTimeField()  # Rename from 'preferred_date'
required_time = TimeField(null=True, blank=True)  # Rename from 'preferred_time'

# Add new
number_of_workers = IntegerField(default=1)
```

#### Create WorkerServices Table:
```python
class WorkerService(models.Model):
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    worker = ForeignKey(WorkerProfile, on_delete=CASCADE, related_name='worker_services')
    service = ForeignKey(ServiceCategory, on_delete=CASCADE, related_name='workers')
    experience_years = IntegerField(default=0)
    is_active = BooleanField(default=True)
    created_at = DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'worker_services'
        unique_together = ['worker', 'service']
```

### 2. Backend API Endpoints to Create

```python
# workers/views.py
POST /api/v1/workers/update-location/
    - Update current_latitude, current_longitude, location_updated_at
    - Requires authentication (worker only)

POST /api/v1/workers/toggle-availability/
    - Toggle is_available
    - If turning ON: update current location
    - Requires authentication (worker only)

POST /api/v1/workers/search/
    - Parameters: service_id, work_latitude, work_longitude, search_radius
    - Returns: workers grouped by distance (0-5km, 5-10km, 10-15km, 15-20km)
    - Filters: service, is_available=True, location_updated_at recent
    - Distance calculation using PostGIS or Python haversine

GET /api/v1/workers/{id}/profile/
    - Get worker profile (without exact GPS coordinates)
    - Returns: name, photo, services, rating, experience, approximate distance

# jobs/views.py
POST /api/v1/work-requests/create/
    - Create work request with work_address, work_latitude, work_longitude
    - Parameters: service_id, work_location, required_date, required_time, number_of_workers
    - Returns: created work request

POST /api/v1/work-requests/{id}/request-worker/
    - Send work request to specific worker
    - Creates JobBooking with status=PENDING
    - Only selected worker receives request
```

### 3. Worker App Changes

#### Add expo-location:
```bash
cd d:\capstone\worker\frontend
npx expo install expo-location
```

#### Update RegisterScreen.js:
- Add location permission request
- Add "Primary Service Location" section
- Add "Use Current Location" button
- Add "Search Location" input with autocomplete (optional)
- Save primary_address, primary_latitude, primary_longitude

#### Create AvailabilityToggle component:
- Add toggle switch in IndividualWorkerHome.js
- When toggled ON: request location permission, get current GPS
- Update is_available, current_latitude, current_longitude, location_updated_at
- API call to `/api/v1/workers/toggle-availability/`

#### Update app.json:
```json
{
  "expo": {
    "android": {
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    }
  }
}
```

### 4. Client App Changes

#### Add expo-location (if not exists):
```bash
cd d:\capstone\client\frontend
npx expo install expo-location
```

#### Create WorkLocationScreen.js:
- "Where do you need the service?" heading
- Two options:
  1. "Use My Current Location" button
  2. "Search/Enter Location" input
- Save selected work_latitude, work_longitude, work_address

#### Update Service Screens:
- Add "Work Location" selection before "Search Workers"
- Pass work location to search API

#### Create WorkerSearchScreen.js:
- Display workers grouped by distance
- Show: photo, name, service, rating, experience, distance
- "View Profile" button
- "Request Worker" button

#### Update Workerprofilescreen.js:
- Show approximate distance (e.g., "About 3 km away")
- Show services, rating, experience, reviews
- "Request Worker" button

### 5. Security Implementation

#### Supabase RLS Policies:
```sql
-- Workers can only update their own location
CREATE POLICY "Workers can update own location" 
ON worker_profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Workers can only update their own availability
CREATE POLICY "Workers can update own availability" 
ON worker_profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Clients can read worker profiles but not exact coordinates
CREATE POLICY "Clients can read worker profiles" 
ON worker_profiles FOR SELECT 
USING (true);

-- Only worker can modify their own work requests
CREATE POLICY "Workers can update assigned jobs" 
ON job_requests FOR UPDATE 
USING (worker_id = auth.uid());
```

#### Django Permissions:
```python
# views.py
from rest_framework.permissions import IsAuthenticated

class UpdateLocationView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Verify user is worker
        if request.user.role.role != 'individual_worker':
            return Response({'error': 'Only workers can update location'}, 
                          status=403)
        
        # Verify updating own profile
        worker = request.user.worker_profile
        # ... update location
```

---

## Implementation Plan

### Phase 1: Database (Step 2)
1. Create migration to add location fields to WorkerProfile
2. Create migration to rename JobRequest fields
3. Create WorkerService model and migration
4. Run migrations
5. Populate ServiceCategory table with basic services

### Phase 2: Worker App - Registration (Step 3)
1. Add expo-location to Worker App
2. Update RegisterScreen.js to collect primary location
3. Add location permission handling
4. Test registration flow

### Phase 3: Worker App - Availability (Step 4)
1. Create AvailabilityToggle component
2. Add to IndividualWorkerHome.js
3. Implement location update on toggle
4. Create backend API endpoint
5. Test availability toggle

### Phase 4: Client App - Work Location (Step 5)
1. Add expo-location to Client App
2. Create WorkLocationScreen.js
3. Add location selection to service screens
4. Test location selection flow

### Phase 5: Backend - Search API (Steps 6-7)
1. Create worker search API endpoint
2. Implement service filtering
3. Implement availability filtering
4. Implement distance calculation (PostGIS or haversine)
5. Implement radius filtering
6. Test search logic

### Phase 6: Client App - Worker Search (Step 8)
1. Create WorkerSearchScreen.js
2. Implement distance grouping UI
3. Display worker cards
4. Test search results display

### Phase 7: Worker Profile (Step 9)
1. Create/update worker profile API
2. Update Workerprofilescreen.js in Client App
3. Show distance, services, ratings
4. Test profile view

### Phase 8: Request Worker (Step 10)
1. Create work request API endpoint
2. Add "Request Worker" button
3. Create work request for selected worker
4. Test request flow

### Phase 9: Security (Step 11)
1. Implement RLS policies in Supabase
2. Add Django permission checks
3. Test authorization
4. Verify privacy (no exact GPS exposed)

### Phase 10: Testing (Step 12)
1. Create test data (5 workers, different services, locations)
2. Run test scenario (Dighi work location, Construction, 20km)
3. Verify correct matching
4. Verify distance calculations
5. Verify privacy

---

## Technical Decisions

### Distance Calculation Method
**Options:**
1. PostgreSQL + PostGIS extension (most accurate)
2. Python haversine formula (good approximation)
3. Simple Euclidean distance (not recommended for lat/lon)

**Recommendation:** Start with haversine, migrate to PostGIS later if needed

**Haversine formula:**
```python
from math import radians, cos, sin, asin, sqrt

def haversine(lon1, lat1, lon2, lat2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    Returns distance in kilometers
    """
    # Convert decimal degrees to radians
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    
    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    r = 6371  # Radius of earth in kilometers
    return c * r
```

### Location Freshness
**Rule:** Current location is valid if `location_updated_at` is within last 4 hours

```python
from datetime import datetime, timedelta

def is_location_fresh(location_updated_at):
    if not location_updated_at:
        return False
    
    freshness_threshold = timedelta(hours=4)
    age = datetime.now() - location_updated_at
    return age < freshness_threshold
```

### Location Fallback Logic
```python
def get_worker_location(worker):
    if worker.is_available and is_location_fresh(worker.location_updated_at):
        return (worker.current_latitude, worker.current_longitude)
    else:
        return (worker.primary_latitude, worker.primary_longitude)
```

---

## Current Status

### ✅ Working
- Django backend running
- Supabase database configured
- Authentication (JWT + custom backend)
- Worker and Client apps running
- Responsive design implemented
- User registration (without location)
- Organization registration
- Service categories exist

### ❌ Not Working / Missing
- Location permission handling in apps
- Worker primary location collection
- Worker current location tracking
- Worker availability toggle with location update
- Client work location selection
- Distance-based worker search
- Service + availability + location matching
- Radius grouping
- Worker profile with distance
- Request worker for specific work location
- RLS security policies
- Privacy (hiding exact GPS from clients)

---

## Next Steps

**Immediate (Step 2):**
1. Create database migrations for location fields
2. Run migrations on Supabase database
3. Verify schema changes

**Then proceed with Steps 3-12 in order.**

---

## Notes

- Worker App already has responsive utilities ✅
- Client App already has responsive utilities ✅
- Both apps use Expo (easy to add expo-location)
- Backend uses Django + Supabase (PostgreSQL)
- Can use Supabase's built-in PostGIS functions if needed
- Test credentials exist: 8446597587 / sita@gmail.com / 12345678
