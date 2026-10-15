# Testing Worker Performance Page

## Changes Made

### 1. Frontend - Enhanced Error Logging
**File:** `worker/frontend/screen/organisation/WorkerPerformanceDetail.js`

Added detailed logging to see:
- URL being called
- Response status
- Response headers
- Actual response text (to detect HTML error pages)
- Parse the response carefully to avoid JSON errors

### 2. Backend - Enhanced Debug Logging
**File:** `backend/organization/views.py` - `get_worker_performance` function

Added print statements to track:
- Worker ID being requested
- Requesting user details
- Worker's org admin details
- Authorization check results
- Assignment count
- Success/failure at each step

## Testing Steps

1. **Restart Backend** (if not already running):
   ```powershell
   cd d:\capstone\backend
   .\venv\Scripts\Activate.ps1
   python manage.py runserver 10.125.109.150:8000
   ```

2. **Clear Worker App Cache**:
   ```powershell
   cd d:\capstone\worker\frontend
   npm start -- --clear
   ```

3. **Test Flow**:
   - Login as organization admin: rama@gmail.com / 8446597512
   - Go to Performance tab
   - Click on worker "Son Mon" (ID: 3)
   - Watch console logs in Metro Bundler
   - Watch backend terminal for print statements

## Expected Logs

### Frontend Console (Metro Bundler):
```
LOG 📊 Fetching worker performance: http://10.125.109.150:8000/api/v1/org/performance/worker/3/
LOG 🔑 Token exists: true
LOG 📥 Response status: 200
LOG 📊 Performance data: {success: true, stats: {...}}
```

### Backend Terminal:
```
🔍 get_worker_performance called with worker_id: 3
👤 Requesting user: 8446597512, ID: xxx-xxx-xxx
👷 Found worker: Son Mon, Org: ORG-a4f8269f-9803-433f-b519-7bda4537a3fa
🏢 Worker's org admin: 8446597512, ID: xxx-xxx-xxx
✅ Authorization passed
📋 Found 1 assignments
✅ Returning performance data
```

## Possible Issues & Solutions

### Issue 1: "Unauthorized access" (403)
**Symptom:** Backend logs show "❌ Authorization failed"
**Cause:** Logged-in user is not the organization admin
**Solution:** Verify you're logged in as rama@gmail.com, not an individual worker

### Issue 2: "Worker not found" (404)
**Symptom:** Backend logs show "❌ Worker with ID 3 not found"
**Cause:** Worker ID 3 doesn't exist in database
**Solution:** Check database for correct worker IDs

### Issue 3: HTML response instead of JSON
**Symptom:** Frontend logs show "Response text: <!DOCTYPE html..."
**Cause:** URL routing issue or backend crashed
**Solutions:**
- Check backend is running
- Check URL is correct: `/api/v1/org/performance/worker/3/`
- Check CORS settings
- Check Django URL patterns

### Issue 4: Token invalid
**Symptom:** Backend logs show authentication error
**Cause:** Token expired or invalid
**Solution:** Logout and login again

## API Endpoint Details

**URL:** `GET /api/v1/org/performance/worker/{worker_id}/`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Success Response (200):**
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
    "completed": 0,
    "pending": 1,
    "assignments": [...]
  }
}
```

**Error Response (403):**
```json
{
  "success": false,
  "error": "Unauthorized access."
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Worker not found."
}
```

## Test Credentials

**Organization Admin:**
- Email: rama@gmail.com
- Phone: 8446597512
- Org ID: ORG-a4f8269f-9803-433f-b519-7bda4537a3fa

**Organization Workers:**
- Worker 1: Rajesh Kumar (ID: 1)
- Worker 2: Rama Gari (ID: 2)  
- Worker 3: Son Mon (ID: 3) ← Test with this one

---

**After testing, share the console logs from both frontend and backend!**
