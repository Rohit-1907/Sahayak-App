# Work Request System - Setup & Test Guide

## Quick Start

This guide will help you set up and test the complete client-to-worker request flow.

---

## Part 1: Database Setup

### Step 1: Run SQL Script in Supabase

1. Open Supabase SQL Editor
   - Go to: https://supabase.com/dashboard/project/lefsctqcgrgrsumkxyhz
   - Click **SQL Editor** in the left sidebar

2. Run the migration script
   ```bash
   # Open and copy: d:\capstone\CREATE_WORK_REQUESTS_TABLE.sql
   # Paste into SQL Editor
   # Click "Run"
   ```

3. Verify table creation
   ```sql
   SELECT * FROM work_requests LIMIT 5;
   ```

### Step 2: Run Django Migrations

```bash
cd d:\capstone\backend
python manage.py makemigrations jobs
python manage.py migrate
```

### Step 3: Restart Backend Server

```bash
python manage.py runserver 0.0.0.0:8000
```

Verify at: http://192.168.1.4:8000/admin/jobs/workrequest/

---

## Part 2: Test the Complete Flow

### Prerequisites

You need two test accounts:
- **Client Account** (already exists): siya@gmail.com
- **Worker Account** (Sam - Cook)

### Test Scenario 1: Create Request (Client App)

1. **Open Client App** on Android device

2. **Login** as client:
   - Email: siya@gmail.com
   - Password: [your password]

3. **Search for Worker**:
   - Tap on "Cook" service
   - Or use search bar → Type "Cook"

4. **Enter Work Details**:
   - Service: Cook
   - Description: "Need cook for family party"
   - Location: Select your location
   - Date: Tomorrow
   - Time: 10:00 AM

5. **Select Worker**:
   - Tap on Sam's profile
   - Review worker details
   - Tap "Request Worker"

6. **Confirm Booking**:
   - Review details on booking screen
   - Tap "Confirm & Book Worker"
   
7. **Expected Result**:
   - ✅ Alert: "Request Sent! ✅"
   - ✅ Message: "Status: REQUESTED"
   - ✅ Database: New record in `work_requests` table

### Test Scenario 2: View Request (Client App)

1. **Navigate to My Requests**:
   ```javascript
   // Manually navigate (temp)
   go('myRequests')
   ```

2. **View Request List**:
   - Should see the request you just created
   - Status badge: 🟠 REQUESTED (orange)
   - Worker name: Sam
   - Service: Cook
   - Date & time displayed

3. **Filter Requests**:
   - Tap "Requested" → See pending requests
   - Tap "All" → See all requests

4. **Pull to Refresh**:
   - Pull down to reload
   - Status updates automatically

### Test Scenario 3: Worker Receives Request (Worker App)

1. **Open Worker App** on Android device

2. **Login** as worker:
   - Email/Phone: [Sam's credentials]
   - Password: [worker password]

3. **Navigate to Work Requests**:
   ```javascript
   // From home screen
   go('workRequests')
   // OR
   go('requests')
   ```

4. **View Incoming Request**:
   - ✅ Should see request from Siya
   - ✅ Status: 🟠 REQUESTED
   - ✅ Client name: Siya
   - ✅ Service: Cook
   - ✅ Work details, location, date, time
   - ✅ Accept & Reject buttons visible

### Test Scenario 4: Worker Accepts Request

1. **In Worker App** (Work Requests screen):
   - Tap **"Accept"** button
   - Confirm dialog: "Do you want to accept?"
   - Tap "Accept"

2. **Expected Result**:
   - ✅ Alert: "Success - Request accepted successfully"
   - ✅ Status changes to: 🟢 SCHEDULED (green)
   - ✅ Accept/Reject buttons disappear
   - ✅ Database: status = 'SCHEDULED', accepted_at = NOW()

3. **Check Client App**:
   - Pull to refresh in "My Requests"
   - ✅ Status should now show: 🟢 SCHEDULED
   - ✅ Real-time status sync!

### Test Scenario 5: Worker Rejects Request

1. **Create Another Request** (Client App):
   - Follow Test Scenario 1 again
   - Create new request for Sam

2. **In Worker App**:
   - Go to Work Requests
   - Find the new request
   - Tap **"Reject"** button
   - Confirm dialog: "Do you want to reject?"
   - Tap "Reject"

3. **Expected Result**:
   - ✅ Alert: "Request rejected"
   - ✅ Status changes to: 🔴 REJECTED (red)
   - ✅ Database: status = 'REJECTED', rejected_at = NOW()

4. **Check Client App**:
   - Pull to refresh
   - ✅ Status: 🔴 REJECTED
   - ✅ May show rejection reason (if implemented)

---

## Part 3: Verify Database

### Check Created Requests

```sql
SELECT 
  id,
  service_category,
  status,
  client_id,
  worker_id,
  work_address,
  required_date,
  required_time,
  created_at,
  accepted_at,
  rejected_at
FROM work_requests
ORDER BY created_at DESC
LIMIT 10;
```

### Check Status Transitions

```sql
-- Count by status
SELECT status, COUNT(*) as count
FROM work_requests
GROUP BY status;

-- Recently updated
SELECT 
  id,
  service_category,
  status,
  created_at,
  updated_at,
  accepted_at,
  rejected_at
FROM work_requests
WHERE updated_at > NOW() - INTERVAL '1 hour'
ORDER BY updated_at DESC;
```

---

## Part 4: API Testing (Optional)

### Test with curl or Postman

#### 1. Create Work Request

```bash
curl -X POST http://192.168.1.4:8000/api/v1/jobs/work-requests/create/ \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "worker_id": "33e20d20-0779-4147-bf33-7b2749800803",
    "service_category": "Cook",
    "title": "Need cook for party",
    "description": "Family gathering, need experienced cook",
    "work_address": "123 Main St, Pune",
    "work_latitude": 18.5204,
    "work_longitude": 73.8567,
    "required_date": "2026-08-25",
    "required_time": "10:00",
    "number_of_workers": 1,
    "estimated_budget": 1000.00
  }'
```

#### 2. List Client Requests

```bash
curl -X GET "http://192.168.1.4:8000/api/v1/jobs/work-requests/client/?status=REQUESTED" \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN"
```

#### 3. List Worker Requests

```bash
curl -X GET "http://192.168.1.4:8000/api/v1/jobs/work-requests/worker/" \
  -H "Authorization: Bearer YOUR_WORKER_TOKEN"
```

#### 4. Accept Request

```bash
curl -X POST http://192.168.1.4:8000/api/v1/jobs/work-requests/REQUEST_ID/action/ \
  -H "Authorization: Bearer YOUR_WORKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "accept"
  }'
```

#### 5. Reject Request

```bash
curl -X POST http://192.168.1.4:8000/api/v1/jobs/work-requests/REQUEST_ID/action/ \
  -H "Authorization: Bearer YOUR_WORKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "reject",
    "reason": "Not available on that date"
  }'
```

---

## Part 5: Troubleshooting

### Issue: Worker not appearing in search

**Solution:**
- Check worker has GPS coordinates in database
- Run: `d:\capstone\UPDATE_WORKER_COORDINATES.sql`

### Issue: Request creation fails

**Possible causes:**
1. Auth token expired → Re-login
2. Worker ID invalid → Check UUID format
3. Location missing → Ensure lat/long provided
4. Network error → Check backend is running

**Debug:**
```javascript
console.log('📤 Creating work request:', payload);
console.log('📥 Response:', data);
```

### Issue: Status not updating in client app

**Solution:**
1. Pull to refresh manually
2. Check network connectivity
3. Verify worker actually accepted/rejected
4. Check database directly:
   ```sql
   SELECT status, updated_at 
   FROM work_requests 
   WHERE id = 'REQUEST_ID';
   ```

### Issue: Worker can't see requests

**Possible causes:**
1. Not logged in as worker
2. No requests assigned to that worker
3. Filter hiding requests (change filter to "ALL")

**Debug:**
```javascript
console.log('📡 Fetching from:', url);
console.log('📦 Response:', data);
console.log('🔑 Token:', token ? 'Found' : 'Not found');
```

### Issue: Accept/Reject button does nothing

**Check:**
1. Network request in console logs
2. Backend error response
3. RLS policies (worker can only update their own requests)
4. Request status (can only accept REQUESTED status)

---

## Part 6: Status Reference

### Status Flow Diagram

```
CLIENT CREATES REQUEST
        ↓
   REQUESTED (🟠)
        ↓
    ┌───┴───┐
    ↓       ↓
ACCEPT   REJECT
    ↓       ↓
SCHEDULED REJECTED
  (🟢)    (🔴)
```

### Status Colors

| Status | Color | Icon | Description |
|--------|-------|------|-------------|
| REQUESTED | 🟠 Orange | time-outline | Pending worker response |
| SCHEDULED | 🟢 Green | checkmark-circle | Worker accepted |
| REJECTED | 🔴 Red | close-circle | Worker rejected |
| CANCELLED | ⚪ Gray | ban | Client cancelled |
| COMPLETED | 🔵 Blue | checkmark-done | Work completed |

### Valid Transitions

✅ **Allowed:**
- REQUESTED → SCHEDULED (worker accepts)
- REQUESTED → REJECTED (worker rejects)
- REQUESTED → CANCELLED (client cancels)
- SCHEDULED → CANCELLED (client cancels)
- SCHEDULED → COMPLETED (work done)

❌ **Not Allowed:**
- REJECTED → SCHEDULED
- SCHEDULED → REQUESTED
- COMPLETED → anything

---

## Part 7: Navigation Quick Reference

### Client App Navigation

```javascript
// Go to My Requests screen
go('myRequests')

// Go to Home
go('home')

// Go to Worker Profile
go('workerProfile')

// Go to Booking Screen
go('bookScreen')
```

### Worker App Navigation

```javascript
// Go to Work Requests
go('workRequests')
// OR
go('requests')

// Go to Home
go('home')

// Go to Jobs
go('jobs')
```

---

## Part 8: Next Steps

After testing the basic flow:

1. ✅ Add navigation button to My Requests from home screen
2. ✅ Add badge showing pending request count
3. ✅ Implement push notifications
4. ✅ Add request detail screen
5. ✅ Implement cancellation feature
6. ✅ Add rating after completion
7. ✅ Remove all hardcoded data

---

## Support

### Check Logs

**Backend:**
```bash
cd d:\capstone\backend
python manage.py runserver
# Watch console for errors
```

**Client App:**
```bash
npx expo start
# Check Android device logs
```

**Worker App:**
```bash
npx expo start
# Check Android device logs
```

### Common Log Messages

```
📤 Creating work request: {...}     # Request payload
📥 Work request response: {...}    # API response
📡 Fetching requests from: [url]   # API call
📦 Requests response: {...}        # Data received
🔑 Auth token: Found/Not found     # Auth check
✅ Found X workers                 # Worker search
❌ Error: [message]                # Error occurred
```

---

## Success Criteria

The implementation is complete when:

- ✅ Client can create work request for specific worker
- ✅ Request saved in database with status REQUESTED
- ✅ Worker sees request in their app
- ✅ Worker can accept → status changes to SCHEDULED
- ✅ Worker can reject → status changes to REJECTED
- ✅ Client sees updated status in real-time
- ✅ Both apps show same status from database
- ✅ No hardcoded data in request flow
- ✅ RLS policies enforce security
- ✅ All status transitions validated

