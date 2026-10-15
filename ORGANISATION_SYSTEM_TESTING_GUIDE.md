# Organisation System - Testing Guide

## ✅ Implementation Status: 14/15 Tasks Complete (93%)

**Core Functionality: 100% Complete**  
**Remaining: End-to-end testing & verification**

---

## Prerequisites

### Backend Setup
1. Start Django server:
```powershell
cd d:\capstone\backend
.\venv\Scripts\Activate.ps1
python manage.py runserver 0.0.0.0:8000
```

2. Verify migrations applied:
```powershell
python manage.py showmigrations organization
```
Should show:
```
organization
 [X] 0001_initial
```

### Frontend Setup
1. Update API base URL in `worker/frontend/config/api.js`:
```javascript
const API_BASE_URL = 'http://YOUR_IP:8000/api/v1';
```

2. Start worker app:
```powershell
cd d:\capstone\worker\frontend
npx expo start
```

---

## Test Flow 1: Organisation Admin Complete Flow

### Step 1: Create Organisation (Using Django Admin or API)

**Option A: Django Admin**
1. Go to `http://localhost:8000/admin/`
2. Login as superuser
3. Navigate to "Organisations"
4. Click "Add Organisation"
5. Fill in:
   - Org Name: "Tech Services Ltd"
   - Admin User: Select existing user
6. Save
7. **Note the auto-generated org_id** (e.g., ORG001)

**Option B: API Call**
```bash
curl -X POST http://localhost:8000/api/v1/org/create/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "org_name": "Tech Services Ltd"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Organisation created successfully.",
  "organisation": {
    "org_id": "ORG001",
    "org_name": "Tech Services Ltd",
    "admin_name": "Admin User",
    "worker_count": 0
  }
}
```

### Step 2: Access Organisation Dashboard

1. Login as organisation admin in worker app
2. Navigate to Organisation Dashboard
3. **Verify:** Three tabs visible:
   - Work Requests
   - Workers
   - Performance
4. **Verify:** Empty states show for all tabs

### Step 3: Add Worker

1. Go to Workers tab
2. Click "Add Worker" button
3. Fill in form:
   - First Name: John
   - Last Name: Doe
   - DOB: 01/01/1995
   - Address: 123 Main Street
   - Experience: 5 years
   - Email: john@example.com
   - Phone: 9876543210
4. Click "Generate Credentials & Save"

**Expected Result:**
- Success message
- Modal displays credentials:
  - Username: 9876543210
  - Password: ORG001John1995
- Worker appears in Workers list

**Verify Backend:**
```bash
curl http://localhost:8000/api/v1/org/workers/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 4: View Worker Credentials

1. Go to Workers tab
2. Tap on the worker card
3. **Verify:** Worker details displayed
4. Navigate to credentials view
5. **Verify:** Username and password visible

**Manual DB Check:**
```sql
SELECT username, plain_password_display, first_name, last_name 
FROM org_workers 
WHERE org_id = 'ORG001';
```

### Step 5: Client Submits Work Request

**From Client App or API:**
```bash
curl -X POST http://localhost:8000/api/v1/org/requests/create/ \
  -H "Content-Type: application/json" \
  -d '{
    "org_id": "ORG001",
    "client_name": "Jane Smith",
    "client_contact": "9123456789",
    "work_type": "Plumbing",
    "work_description": "Fix kitchen sink leak"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Work request submitted successfully.",
  "request": {
    "id": 1,
    "org_name": "Tech Services Ltd",
    "work_type": "Plumbing",
    "status": "pending"
  }
}
```

### Step 6: Accept Work Request

1. Go to Dashboard → Work Requests tab
2. **Verify:** Request card shows:
   - Client: Jane Smith
   - Work Type: Plumbing
   - Status: Pending
   - Description visible
3. Click "Accept" button
4. **Verify:** Success message
5. **Verify:** Request status changes to "accepted"

**Verify Backend:**
```bash
curl http://localhost:8000/api/v1/org/requests/?status=accepted \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 7: Assign Work to Worker

1. From accepted request, navigate to assignment screen
2. **Verify:** Work details displayed:
   - Client name, contact
   - Work type, description
3. **Verify:** Worker list shows all org workers
4. Select John Doe (checkbox)
5. Click "Assign to 1 Worker"

**Expected Result:**
- Success message: "Work assigned to 1 worker(s)"
- Returns to dashboard

**Verify Backend:**
```bash
curl http://localhost:8000/api/v1/org/workers/1/assignments/
```

### Step 8: Check Performance

1. Go to Dashboard → Performance tab
2. **Verify:** John Doe card shows:
   - Total Assigned: 1
   - In Progress: 0
   - Completed: 0
   - Pending: 1
3. Tap John Doe card
4. **Verify:** Assignment details visible

---

## Test Flow 2: Organisation Worker Complete Flow

### Step 1: Worker Login

1. Open worker app
2. Select "Organisation Worker Login"
3. Enter credentials:
   - Username: 9876543210
   - Password: ORG001John1995
4. Click "Login"

**Expected Result:**
- Success message
- Navigate to Jobs screen

**Verify Backend:**
```bash
curl -X POST http://localhost:8000/api/v1/org/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "9876543210",
    "password": "ORG001John1995"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "user": {
    "id": 1,
    "username": "9876543210",
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone_number": "9876543210",
    "role": "org_worker",
    "org_id": "ORG001",
    "org_name": "Tech Services Ltd"
  }
}
```

### Step 2: View Jobs

1. **Verify Stats Dashboard:**
   - Total: 1
   - Assigned: 1
   - In Progress: 0
   - Completed: 0

2. **Verify Job Card Shows:**
   - Work type: Plumbing
   - Client: Jane Smith
   - Status badge: "assigned"

3. Tap job card to expand
4. **Verify Expanded Details:**
   - Full description visible
   - Assigned date shown
   - "Start Work" button visible

### Step 3: Start Work

1. Click "Start Work" button
2. **Verify:** Status changes to "in_progress"
3. **Verify:** Button changes to "Mark as Completed"
4. **Verify Stats Update:**
   - Assigned: 0
   - In Progress: 1

**Verify Backend:**
```bash
curl http://localhost:8000/api/v1/org/assignments/1/
```
Should show `"status": "in_progress"`

### Step 4: Complete Work

1. Click "Mark as Completed" button
2. **Verify:** Status changes to "completed"
3. **Verify:** "Job Completed!" banner shows
4. **Verify Stats Update:**
   - In Progress: 0
   - Completed: 1

**Verify Backend:**
```bash
curl http://localhost:8000/api/v1/org/assignments/1/
```
Should show:
```json
{
  "status": "completed",
  "completed_at": "2026-09-04T19:30:00Z"
}
```

### Step 5: Filter Jobs

1. Test filter buttons:
   - Click "All" → Shows all jobs
   - Click "Assigned" → Shows only assigned jobs (should be 0)
   - Click "In Progress" → Shows only in-progress jobs (should be 0)

2. **Verify:** Counters update correctly

### Step 6: Logout

1. Click logout button (top right)
2. **Verify:** Returns to login screen

---

## Test Flow 3: Client Work Request Flow

### Step 1: Access Request Form

**Option A: Direct Navigation**
```javascript
go('clientRequestForm')
```

**Option B: Public URL (if implemented)**
Navigate to request form screen

### Step 2: Submit Request

1. **Verify:** Organisation dropdown loaded
2. Select: "Tech Services Ltd"
3. Fill in:
   - Your Name: Mike Johnson
   - Contact Number: 9111222333
   - Work Type: Electrical
   - Work Description: Install ceiling fan
4. Click "Submit Request"

**Expected Result:**
- Success message
- Form resets

**Verify Backend:**
```bash
curl http://localhost:8000/api/v1/org/requests/?status=pending \
  -H "Authorization: Bearer ADMIN_TOKEN"
```
Should show new request from Mike Johnson

### Step 3: Admin Receives Request

1. Login as org admin
2. Go to Dashboard → Work Requests
3. **Verify:** New request visible with:
   - Client: Mike Johnson
   - Work Type: Electrical
   - Status: Pending

---

## Test Flow 4: Multi-Worker Assignment

### Step 1: Add Second Worker

1. Add another worker (repeat Test Flow 1, Step 3):
   - Name: Sarah Lee
   - DOB: 15/05/1993
   - Phone: 9876543211
   - Password will be: ORG001Sarah1993

### Step 2: Accept New Request

1. Accept Mike Johnson's electrical request

### Step 3: Assign to Multiple Workers

1. Navigate to assignment screen
2. Select both John Doe and Sarah Lee
3. Click "Assign to 2 Workers"

**Expected Result:**
- Success message
- Both workers see the job

**Verify:**
- Login as John (9876543210)
- Should see electrical job
- Login as Sarah (9876543211)
- Should see same electrical job

### Step 4: Check Performance

1. Login as admin
2. Go to Performance tab
3. **Verify:** Both workers show updated stats

---

## Database Verification Queries

### Check Organisations
```sql
SELECT * FROM organisations;
```

### Check Org Workers
```sql
SELECT 
    id, 
    org_id, 
    first_name || ' ' || last_name as name,
    username, 
    plain_password_display,
    phone_number
FROM org_workers;
```

### Check Work Requests
```sql
SELECT 
    id, 
    org_id, 
    client_name, 
    work_type, 
    status, 
    created_at
FROM org_work_requests
ORDER BY created_at DESC;
```

### Check Assignments
```sql
SELECT 
    owa.id,
    owr.work_type,
    owr.client_name,
    ow.first_name || ' ' || ow.last_name as worker_name,
    owa.status,
    owa.assigned_at,
    owa.completed_at
FROM org_work_assignments owa
JOIN org_work_requests owr ON owa.request_id = owr.id
JOIN org_workers ow ON owa.org_worker_id = ow.id
ORDER BY owa.assigned_at DESC;
```

---

## Error Testing

### Test 1: Invalid Credentials
1. Try login with wrong password
2. **Expected:** "Invalid credentials" error

### Test 2: Duplicate Phone Number
1. Try adding worker with existing phone
2. **Expected:** "Phone number already registered" error

### Test 3: Accept Already Accepted Request
1. Try accepting same request twice
2. **Expected:** "Only pending requests can be accepted" error

### Test 4: Assign Without Selecting Workers
1. Navigate to assignment
2. Click assign without selecting any worker
3. **Expected:** "Please select at least one worker" error

### Test 5: Empty Form Submission
1. Try submitting forms with empty fields
2. **Expected:** Validation errors for each required field

---

## Performance Testing

### Load Test: Multiple Workers
1. Add 10 workers
2. **Verify:** Workers tab loads smoothly
3. **Verify:** Performance tab shows all workers
4. Time loading: Should be < 2 seconds

### Load Test: Multiple Requests
1. Submit 20 work requests
2. **Verify:** Requests tab loads smoothly
3. **Verify:** Pagination/scrolling works
4. Time loading: Should be < 3 seconds

### Load Test: Multiple Assignments
1. Assign 1 request to 5 workers
2. Each worker logs in
3. **Verify:** Each sees the job
4. **Verify:** Status updates don't conflict

---

## API Endpoint Testing Checklist

### ✅ Organisation Endpoints
- [ ] `POST /org/create/` - Create organisation
- [ ] `GET /org/list/` - List organisations (public)
- [ ] `GET /org/organisations/{id}/stats/` - Get stats

### ✅ Worker Management
- [ ] `POST /org/workers/add/` - Add worker
- [ ] `GET /org/workers/` - List workers
- [ ] `GET /org/workers/{id}/credentials/` - View credentials
- [ ] `GET /org/workers/{id}/assignments/` - Worker assignments

### ✅ Authentication
- [ ] `POST /org/auth/login/` - Org worker login

### ✅ Work Requests
- [ ] `POST /org/requests/create/` - Client submit (public)
- [ ] `GET /org/requests/?status=pending` - List requests
- [ ] `POST /org/requests/{id}/accept/` - Accept request
- [ ] `POST /org/requests/{id}/reject/` - Reject request

### ✅ Assignments
- [ ] `POST /org/assignments/assign/` - Assign work
- [ ] `PATCH /org/assignments/{id}/status/` - Update status

### ✅ Performance
- [ ] `GET /org/performance/{org_id}/` - Org performance
- [ ] `GET /org/performance/worker/{worker_id}/` - Worker performance

---

## Navigation Testing Checklist

### ✅ App.js Routes
- [ ] `orgAdminDashboard` - Admin dashboard
- [ ] `orgAddWorker` - Add worker form
- [ ] `orgAssignWork` - Work assignment screen
- [ ] `orgWorkerLogin` - Org worker login
- [ ] `orgWorkerHome` - Org worker jobs screen
- [ ] `clientRequestForm` - Client request form

### ✅ Navigation Flows
- [ ] Welcome → Org Worker Login → Jobs
- [ ] Admin Login → Dashboard → Add Worker
- [ ] Dashboard → Accept Request → Assign Work
- [ ] Worker Login → View Jobs → Update Status
- [ ] Client Form → Submit Request → Success

---

## Success Criteria

### ✅ Functional Requirements
- [x] Organisation can be created with auto-generated ID
- [x] Admin can add workers with auto-generated credentials
- [x] Credentials follow formula: org_id + first_name + birth_year
- [x] Clients can submit work requests
- [x] Admin can accept/reject requests
- [x] Admin can assign work to multiple workers
- [x] Workers can login with generated credentials
- [x] Workers can view assigned jobs
- [x] Workers can update job status (assigned → in_progress → completed)
- [x] Admin can view performance stats

### ✅ Technical Requirements
- [x] New tables added without modifying existing schema
- [x] Separate authentication for org workers
- [x] API endpoints follow REST conventions
- [x] All routes prefixed with /org/
- [x] Proper error handling and validation
- [x] Loading states and empty states in UI
- [x] Pull-to-refresh functionality
- [x] Navigation integrated into main app

---

## Known Limitations

1. **Worker credentials viewing:** Currently shown in modal after creation. Optional dedicated screen can be added.

2. **Notification system:** Workers don't receive notifications when assigned. Can be added as enhancement.

3. **Performance charts:** Basic stats shown. Charts/graphs can be added for better visualization.

4. **Search/filter:** Basic filtering implemented. Advanced search can be added.

5. **Bulk operations:** Accept/reject individual requests. Bulk actions can be added.

---

## Next Steps (Optional Enhancements)

1. **Worker Profile Management**
   - Edit worker details
   - Deactivate/reactivate workers
   - View complete assignment history

2. **Advanced Performance Dashboard**
   - Charts and graphs
   - Time-based filtering (daily/weekly/monthly)
   - Export reports as PDF

3. **Notification System**
   - Push notifications for new assignments
   - SMS notifications for important updates
   - Email notifications for admins

4. **Advanced Request Management**
   - Bulk accept/reject
   - Request priority levels
   - Scheduled assignments

5. **Worker App Enhancements**
   - In-app messaging with admin
   - Photo upload for completed work
   - Earning tracking

---

## Testing Completion Checklist

When all tests pass, mark Task #15 complete:

- [ ] All API endpoints tested and working
- [ ] All navigation flows tested
- [ ] Admin flow: Create org → Add worker → Accept request → Assign work
- [ ] Worker flow: Login → View jobs → Update status
- [ ] Client flow: Submit request → Admin receives
- [ ] Error handling verified
- [ ] Database tables populated correctly
- [ ] No console errors in frontend
- [ ] No server errors in backend
- [ ] Performance acceptable (< 3s page loads)

---

**Implementation Complete! 🎉**

Total: 14/15 tasks (93%)  
Remaining: Final testing and verification
