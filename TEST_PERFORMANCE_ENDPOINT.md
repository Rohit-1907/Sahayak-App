# 🚨 CRITICAL: Test Performance Endpoint

## Issue
Backend is returning an HTML error page instead of JSON when accessing:
`GET /api/v1/org/performance/worker/3/`

## Steps to Fix & Test

### 1. RESTART BACKEND SERVER ⚠️
**The backend MUST be restarted to apply code changes!**

```powershell
# Stop any running backend
Get-Process python | Where-Object { $_.Path -like "*capstone*backend*" } | Stop-Process -Force

# Start backend
cd d:\capstone\backend
.\venv\Scripts\Activate.ps1
python manage.py runserver 10.125.109.150:8000
```

**WATCH THE TERMINAL!** The print statements will show exactly what's happening.

### 2. Test with Worker App

**Login as Organization Admin:**
- Email: rama@gmail.com
- Phone: 8446597512

**Go to Performance > Click on Worker "Son Mon"**

### 3. Check Backend Terminal

You should see these logs:
```
🔍 get_worker_performance called with worker_id: 3
👤 Requesting user: 8446597512, ID: xxx
👷 Found worker: Son Mon, Org: ORG-a4f8269f-9803-433f-b519-7bda4537a3fa
🏢 Worker's org admin: 8446597512, ID: xxx
✅ Authorization passed
📋 Found 1 assignments
✅ Returning performance data
```

### 4. Check Frontend Console

You should see:
```
LOG 📊 Fetching worker performance: http://10.125.109.150:8000/api/v1/org/performance/worker/3/
LOG 🔑 Token exists: true
LOG 📥 Response status: 200
LOG 📊 Performance data: {success: true, stats: {...}}
```

## Possible Errors & Solutions

### Error 1: "NameError: name 'OrgWorkerStatsSerializer' is not defined"
**Fix:** Add import at top of views.py (should already be there)

### Error 2: "AttributeError: 'OrgWorker' object has no attribute 'get_full_name'"
**Fix:** Worker model needs get_full_name() method

### Error 3: Authorization Failed (403)
**Symptom:** Backend logs show "❌ Authorization failed"
**Fix:** Make sure you're logged in as rama@gmail.com (the organization admin)

### Error 4: Worker Not Found (404)
**Symptom:** Backend logs show "❌ Worker with ID 3 not found"
**Fix:** Check database for correct worker ID

## Quick Database Check

```powershell
cd d:\capstone\backend
.\venv\Scripts\Activate.ps1
python manage.py shell
```

```python
from organization.models import OrgWorker
workers = OrgWorker.objects.all()
for w in workers:
    print(f"ID: {w.id}, Name: {w.first_name} {w.last_name}, Org: {w.org.org_id}")
```

## Test Manually with cURL (Alternative)

If worker app keeps failing, test the endpoint directly:

```powershell
# First login to get token
$loginBody = @{
    username = "rama@gmail.com"
    password = "8446597512"
    app_type = "worker"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://10.125.109.150:8000/api/v1/auth/login/" -Method POST -Body $loginBody -ContentType "application/json"
$token = $response.access

# Then test performance endpoint
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://10.125.109.150:8000/api/v1/org/performance/worker/3/" -Method GET -Headers $headers
```

## Expected Success Response

```json
{
  "success": true,
  "stats": {
    "worker_id": 3,
    "worker_name": "Son Mon",
    "worker_phone": "9966332255",
    "worker_email": "son@example.com",
    "total_assigned": 1,
    "in_progress": 0,
    "completed": 1,
    "pending": 0,
    "assignments": [
      {
        "id": 1,
        "request": 4,
        "status": "completed",
        "assigned_at": "2026-09-08T17:15:00Z",
        "completed_at": "2026-09-08T18:30:00Z"
      }
    ]
  }
}
```

---

## 🎯 ACTION REQUIRED

1. **RESTART the backend server** (most likely fix!)
2. **Login as rama@gmail.com** in worker app
3. **Click on worker** in Performance tab
4. **Share the backend terminal output** (the print statements)
5. **Share the frontend console output** (the LOG statements)

The enhanced logging will show us exactly where it's failing!
