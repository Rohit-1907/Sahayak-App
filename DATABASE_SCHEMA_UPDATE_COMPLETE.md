# Database Schema Update - COMPLETE ✅

## Step 2: Database Schema Changes

### Changes Applied

#### 1. **WorkerProfile Model** (`users/models.py`)

**Added Primary/Service Location Fields:**
```python
primary_address = TextField(blank=True)
primary_city = CharField(max_length=100, blank=True)
primary_state = CharField(max_length=100, blank=True)
primary_pincode = CharField(max_length=10, blank=True)
primary_latitude = FloatField(null=True, blank=True)
primary_longitude = FloatField(null=True, blank=True)
```

**Added Current Location Fields:**
```python
current_latitude = FloatField(null=True, blank=True)
current_longitude = FloatField(null=True, blank=True)
location_updated_at = DateTimeField(null=True, blank=True)
```

**Kept Legacy Fields:**
```python
address = TextField(blank=True)
city = CharField(max_length=100, blank=True)
state = CharField(max_length=100, blank=True)
pincode = CharField(max_length=10, blank=True)
latitude = FloatField(null=True, blank=True)
longitude = FloatField(null=True, blank=True)
```
*Note: Legacy fields kept for backward compatibility. Can be removed in future cleanup.*

**Added Indexes:**
```python
models.Index(fields=['primary_latitude', 'primary_longitude'])
models.Index(fields=['current_latitude', 'current_longitude'])
models.Index(fields=['location_updated_at'])
```

**Existing Field (Already Present):**
```python
is_available = BooleanField(default=False)  ✅
```

---

#### 2. **WorkerService Model** (`users/models.py`)

**Created New Junction Table:**
```python
class WorkerService(models.Model):
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    worker = ForeignKey(WorkerProfile, on_delete=CASCADE, related_name='worker_services')
    service = ForeignKey('services.ServiceCategory', on_delete=CASCADE, related_name='service_workers')
    experience_years = IntegerField(default=0)
    is_active = BooleanField(default=True)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    
    unique_together = ['worker', 'service']
```

**Purpose:**
- Links workers to multiple services they provide
- Better than JSONField for querying and filtering
- Allows tracking experience per service
- Enables active/inactive status per service

---

#### 3. **JobRequest Model** (`jobs/models.py`)

**Added Work Location Fields:**
```python
work_address = TextField()
work_latitude = FloatField()
work_longitude = FloatField()
```

**Added Work Requirements:**
```python
required_date = DateTimeField()
required_time = TimeField(null=True, blank=True)
number_of_workers = IntegerField(default=1)
```

**Kept Legacy Fields:**
```python
location_address = TextField(blank=True)  # Legacy
latitude = FloatField(null=True, blank=True)  # Legacy
longitude = FloatField(null=True, blank=True)  # Legacy
preferred_date = DateTimeField(null=True, blank=True)  # Legacy
preferred_time = TimeField(null=True, blank=True)  # Legacy
```

**Added Indexes:**
```python
models.Index(fields=['work_latitude', 'work_longitude'])
models.Index(fields=['status'])
models.Index(fields=['required_date'])
```

---

#### 4. **OrganizationProfile Model**

**No Changes Needed:**
```python
address = TextField()  ✅ Already exists
city = CharField(max_length=100)  ✅
state = CharField(max_length=100)  ✅
pincode = CharField(max_length=10)  ✅
latitude = FloatField(null=True, blank=True)  ✅
longitude = FloatField(null=True, blank=True)  ✅
```

---

#### 5. **ServiceCategory Table**

**Already Exists:**
```python
class ServiceCategory(models.Model):
    id = UUIDField(primary_key=True)
    name = CharField(max_length=100, unique=True)
    description = TextField(blank=True)
    icon_url = URLField(blank=True)
    is_active = BooleanField(default=True)
```

**Populated with 8 Basic Services:**
1. ✅ Construction
2. ✅ Plumbing
3. ✅ Electrical
4. ✅ Painting
5. ✅ Cleaning
6. ✅ Carpentry
7. ✅ Masonry
8. ✅ AC Repair

---

## Migrations Applied

### 1. services.0001_initial ✅
```
✓ Created ServiceCategory table
✓ Created ServiceSubcategory table
```

### 2. users.0002_workerservice_workerprofile_current_latitude_and_more ✅
```
✓ Created WorkerService table
✓ Added current_latitude to WorkerProfile
✓ Added current_longitude to WorkerProfile
✓ Added location_updated_at to WorkerProfile
✓ Added primary_address to WorkerProfile
✓ Added primary_city to WorkerProfile
✓ Added primary_latitude to WorkerProfile
✓ Added primary_longitude to WorkerProfile
✓ Added primary_pincode to WorkerProfile
✓ Added primary_state to WorkerProfile
✓ Created indexes for location fields
```

### 3. jobs.0001_initial ✅
```
✓ Created JobRequest table with work location fields
✓ Created JobBooking table
✓ Created JobStatus table
✓ Created indexes for work location and status
```

---

## Database Schema After Update

### worker_profiles table
```sql
-- Identity
id (UUID, PK)
user_id (FK to users)
organization_id (FK to organizations, nullable)

-- Primary/Service Location (Base location)
primary_address (TEXT)
primary_city (VARCHAR)
primary_state (VARCHAR)
primary_pincode (VARCHAR)
primary_latitude (FLOAT)
primary_longitude (FLOAT)

-- Current Location (Updated when available)
current_latitude (FLOAT)
current_longitude (FLOAT)
location_updated_at (TIMESTAMP)

-- Availability
is_available (BOOLEAN, default=False)

-- Profile info
bio, skills, years_of_experience, certifications, 
service_categories, hourly_rate, voice_resume_url, 
total_jobs_completed, average_rating, total_earnings, 
is_verified, verification_documents

-- Legacy location fields (kept for backward compatibility)
address, city, state, pincode, latitude, longitude

-- Timestamps
created_at, updated_at

-- Indexes
INDEX (service_categories)
INDEX (is_available)
INDEX (primary_latitude, primary_longitude)
INDEX (current_latitude, current_longitude)
INDEX (location_updated_at)
```

### worker_services table (NEW)
```sql
id (UUID, PK)
worker_id (FK to worker_profiles)
service_id (FK to service_categories)
experience_years (INT, default=0)
is_active (BOOLEAN, default=True)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)

UNIQUE (worker_id, service_id)
INDEX (worker_id, service_id)
INDEX (is_active)
```

### job_requests table
```sql
-- Identity
id (UUID, PK)
customer_id (FK to customer_profiles)

-- Service
service_category (VARCHAR)

-- Work Location (Where work will happen)
work_address (TEXT)
work_latitude (FLOAT)
work_longitude (FLOAT)

-- Work Requirements
required_date (TIMESTAMP)
required_time (TIME)
number_of_workers (INT, default=1)
description (TEXT)
estimated_budget (DECIMAL)

-- Status
status (VARCHAR: open, assigned, in_progress, completed, cancelled)

-- Legacy fields
location_address, latitude, longitude, 
preferred_date, preferred_time

-- Timestamps
created_at, updated_at

-- Indexes
INDEX (work_latitude, work_longitude)
INDEX (status)
INDEX (required_date)
```

### service_categories table
```sql
id (UUID, PK)
name (VARCHAR, UNIQUE)
description (TEXT)
icon_url (URL)
is_active (BOOLEAN, default=True)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### organization_profiles table
```sql
-- Identity
id (UUID, PK)
user_id (FK to users)

-- Organization Info
company_name, company_registration_number, industry_type,
company_website, company_email, company_phone, description

-- Organization Location
address (TEXT)
city (VARCHAR)
state (VARCHAR)
pincode (VARCHAR)
latitude (FLOAT)
longitude (FLOAT)

-- Stats
total_workers, total_jobs_posted, is_verified

-- Timestamps
created_at, updated_at
```

---

## Location Concept Implementation

### ✅ Three Location Types Now Supported

#### 1. **Worker Primary/Service Location**
```python
WorkerProfile:
  primary_address
  primary_latitude
  primary_longitude
```
- Collected during registration
- Worker's base/service area
- Relatively stable
- Used as fallback when current location is stale

#### 2. **Worker Current Location**
```python
WorkerProfile:
  current_latitude
  current_longitude
  location_updated_at
  is_available
```
- Updated when worker toggles "Available for Work" ON
- Represents actual current position
- Used for matching when recent (< 4 hours old)
- Falls back to primary location if stale

#### 3. **Work Location**
```python
JobRequest:
  work_address
  work_latitude
  work_longitude
```
- Where the actual work needs to happen
- Can be different from client's current location
- Used for distance calculations to find nearby workers
- MOST IMPORTANT for worker matching

---

## Key Design Decisions

### 1. **Backward Compatibility**
- Kept legacy fields (address, latitude, longitude) in WorkerProfile
- Kept legacy fields (location_address, preferred_date) in JobRequest
- Allows gradual migration without breaking existing code

### 2. **Junction Table for Services**
- Created `worker_services` table instead of relying only on JSONField
- Better query performance for service-based filtering
- Allows tracking experience per service
- Enables future features (service-specific ratings, pricing)

### 3. **Indexes for Performance**
- Added indexes on location fields for faster distance queries
- Added indexes on status and date fields for filtering
- Composite index on (worker_id, service_id) for join queries

### 4. **Flexible Location Updates**
- `location_updated_at` allows checking location freshness
- Can implement smart fallback: current → primary
- Future: can add location update triggers (app open, accept job, etc.)

---

## Next Steps (Step 3-12)

Now that database schema is updated:

### ✅ Step 2 Complete - Database Ready For:

**Step 3:** Worker Registration - Collect primary location
- UI can now save to `primary_address`, `primary_latitude`, `primary_longitude`

**Step 4:** Worker Availability Toggle
- UI can now update `is_available`, `current_latitude`, `current_longitude`, `location_updated_at`

**Step 5:** Client Work Location Selection
- UI can now pass `work_address`, `work_latitude`, `work_longitude` to search API

**Step 6-7:** Search API
- Can query workers by:
  - Service (join `worker_services`)
  - Availability (`is_available=True`)
  - Location (calculate distance from work location)
  - Freshness (check `location_updated_at`)

**Step 8:** Radius Grouping
- Can group results by calculated distance

**Step 9:** Worker Profile
- Can show approximate distance (calculated from work location)

**Step 10:** Request Worker
- Can create JobRequest with all required fields

**Step 11:** Security (RLS)
- Can implement row-level security on new tables

---

## Test Data Ready

### Services Available:
```
1. Construction
2. Plumbing
3. Electrical
4. Painting
5. Cleaning
6. Carpentry
7. Masonry
8. AC Repair
```

### Sample Test Scenario (For Step 12):
```
Work Location: Dighi, Pune (18.6186° N, 73.9196° E)
Service: Construction
Radius: 20 km

Expected Workers:
- Amit (3 km, Construction, Available) ✓
- Ravi (8 km, Construction, Available) ✓
- Suresh (4 km, Electrical, Available) ✗ Wrong service
- Vijay (5 km, Construction, Unavailable) ✗ Not available
- Rahul (27 km, Construction, Available) ✗ Outside radius
```

---

## Files Modified

1. ✅ `backend/users/models.py`
   - Updated WorkerProfile with location fields
   - Added WorkerService model

2. ✅ `backend/jobs/models.py`
   - Updated JobRequest with work location fields

3. ✅ `backend/users/migrations/0002_workerservice_workerprofile_current_latitude_and_more.py`
   - Migration for WorkerProfile and WorkerService

4. ✅ `backend/jobs/migrations/0001_initial.py`
   - Migration for JobRequest, JobBooking, JobStatus

5. ✅ `backend/services/migrations/0001_initial.py`
   - Migration for ServiceCategory and ServiceSubcategory

6. ✅ `backend/populate_services.py`
   - Script to populate initial services

---

## Verification

### Check Tables Exist:
```bash
cd d:\capstone\backend
.\venv\Scripts\Activate.ps1
python manage.py dbshell
```

```sql
-- Check worker_profiles has new columns
\d worker_profiles;

-- Check worker_services table exists
\d worker_services;

-- Check job_requests has work location fields
\d job_requests;

-- Check service_categories populated
SELECT name FROM service_categories;
```

### Expected Output:
```
worker_profiles:
  ✓ primary_address
  ✓ primary_latitude
  ✓ primary_longitude
  ✓ current_latitude
  ✓ current_longitude
  ✓ location_updated_at

worker_services:
  ✓ Table exists with foreign keys

job_requests:
  ✓ work_address
  ✓ work_latitude
  ✓ work_longitude
  ✓ number_of_workers

service_categories:
  ✓ 8 services populated
```

---

## Status: ✅ COMPLETE

**Database schema is now ready for location-based worker matching system.**

All three location concepts are now properly modeled:
1. ✅ Worker Primary Location
2. ✅ Worker Current Location
3. ✅ Work Location

Ready to proceed with:
- Step 3: Worker Registration UI
- Step 4: Availability Toggle
- Step 5: Work Location Selection
- Steps 6-12: Search, Matching, Profile, Request, Security, Testing
