# Organization Worker Navigation - FINAL FIX

## Problem
Backend API doesn't return latitude/longitude for work assignments, so navigation fails.

## Changes Made

### 1. Backend Model (organization/models.py)
Added coordinate fields to OrgWorkRequest:
- work_latitude (DecimalField)
- work_longitude (DecimalField)

### 2. Backend Serializer (organization/serializers.py)  
Added fields to OrgWorkRequestCreateSerializer:
- work_latitude
- work_longitude

### 3. Backend View (organization/views.py)
Updated get_worker_assigned_work() to return coordinates:
- 'latitude': assignment.request.work_latitude
- 'longitude': assignment.request.work_longitude

## NEXT STEPS (DO THIS):

### Step 1: Create Migration
```powershell
cd d:\capstone\backend
.\venv\Scripts\Activate.ps1
python manage.py makemigrations organization
python manage.py migrate
```

### Step 2: Update Existing Data
```powershell
python manage.py shell
```

Then paste:
```python
from organization.models import OrgWorkRequest
from decimal import Decimal

OrgWorkRequest.objects.filter(work_location__icontains='BOYS HOSTEL').update(
    work_latitude=Decimal('18.5368048'),
    work_longitude=Decimal('73.8319807')
)
print('✅ Updated coordinates')
exit()
```

### Step 3: Restart Backend
Press CTRL+C to stop the server, then:
```powershell
python manage.py runserver 0.0.0.0:8000
```

### Step 4: Test Navigation
1. Login as organization worker (9966332255 / a3faSon99)
2. Go to work assignment
3. Click "Navigate to Job Location"
4. ✅ Map should open with route!

## Files Modified
- d:\capstone\backend\organization\models.py
- d:\capstone\backend\organization\serializers.py
- d:\capstone\backend\organization\views.py
- d:\capstone\worker\frontend\screen\home\OrgWorkerJobDetails.js

