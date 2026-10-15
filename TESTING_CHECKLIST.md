# Work Request System - Testing Checklist

## Pre-Testing Setup

### ✅ Database Setup
- [ ] Run `CREATE_WORK_REQUESTS_TABLE.sql` in Supabase SQL Editor
- [ ] Verify table exists: `SELECT * FROM work_requests LIMIT 1;`
- [ ] Check RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'work_requests';`
- [ ] Verify Sam (Cook worker) has GPS coordinates: `SELECT primary_latitude, primary_longitude FROM worker_profiles WHERE user_id = '33e20d20-0779-4147-bf33-7b2749800803';`

### ✅ Backend Setup
- [ ] Run migrations: `python manage.py migrate`
- [ ] Start server: `python manage.py runserver 0.0.0.0:8000`
- [ ] Verify admin access: http://192.168.1.4:8000/admin/jobs/workrequest/
- [ ] Check API endpoint: `curl http://192.168.1.4:8000/api/v1/jobs/work-requests/client/`

### ✅ Frontend Setup
- [ ] Client app running: `npx expo start` in `client/frontend`
- [ ] Worker app running: `npx expo start` in `worker/frontend`
- [ ] Android device connected and apps installed

---

## Test Scenario 1: Create Work Request (Client Side)

### Prerequisites
- Client logged in as: **siya@gmail.com**
- Sam (Cook) worker exists with coordinates

### Steps
1. **Search for Cook Worker**
   - [ ] Open client app
   - [ ] Tap on "Cook" service OR use search
   - [ ] Enter work details screen
   
2. **Enter Work Details**
   - [ ] Service: Cook ✓
   - [ ] Description: "Need cook for family party"
   - [ ] Location: Select current location
   - [ ] Date: Tomorrow's date
   - [ ] Time: 10:00 AM
   - [ ] Tap "Search Workers" or continue

3. **Select Worker**
   - [ ] See Sam in worker list
   - [ ] Verify: Name, rating, distance shown
   - [ ] Tap on Sam's profile card
   - [ ] Review worker details
   - [ ] Tap "Request Worker"

4. **Confirm Booking**
   - [ ] Review all details on confirmation screen
   - [ ] Worker name: Sam ✓
   - [ ] Service: Cook ✓
   - [ ] Date and time correct ✓
   - [ ] Location shown ✓
   - [ ] Tap "Confirm & Book Worker"

### Expected Results
- [ ] ✅ Alert appears: "Request Sent! ✅"
- [ ] ✅ Message shows: "Status: REQUESTED"
- [ ] ✅ Navigates to home or requests screen
- [ ] ✅ Console log: `📤 Creating work request: {...}`
- [ ] ✅ Console log: `📥 Work request response: {"success": true}`

### Verify in Database
```sql
SELECT 
  id, service_category, status, 
  client_id, worker_id, 
  work_address, required_date, required_time,
  created_at
FROM work_requests
ORDER BY created_at DESC
LIMIT 1;
```
- [ ] ✅ New record exists
- [ ] ✅ status = 'REQUESTED'
- [ ] ✅ client_id matches logged-in user
- [ ] ✅ worker_id = Sam's ID
- [ ] ✅ All fields populated correctly

---

## Test Scenario 2: View Request (Client Side)

### Steps
1. **Navigate to My Requests**
   - [ ] From home screen, navigate to `myRequests`
   - [ ] Or manually call: `go('myRequests')`

2. **View Request List**
   - [ ] Screen loads successfully
   - [ ] Request appears in list
   - [ ] Status badge shows: 🟠 REQUESTED (orange)
   - [ ] Worker name: Sam ✓
   - [ ] Service: Cook ✓
   - [ ] Date & time displayed correctly
   - [ ] Description shown

3. **Test Filters**
   - [ ] Tap "Requested" filter → Request visible
   - [ ] Tap "Scheduled" filter → Request not visible (correct)
   - [ ] Tap "All" filter → Request visible

4. **Test Refresh**
   - [ ] Pull down to refresh
   - [ ] Loading indicator appears
   - [ ] Data reloads successfully
   - [ ] Console log: `📡 Fetching requests from: ...`
   - [ ] Console log: `📦 Requests response: {...}`

### Expected Results
- [ ] ✅ Request appears immediately (if already created)
- [ ] ✅ OR appears after refresh
- [ ] ✅ All details correct
- [ ] ✅ Status color-coded properly
- [ ] ✅ No errors in console

---

## Test Scenario 3: Worker Views Request

### Prerequisites
- Worker logged in as: **Sam** (Cook)
- Request created in Scenario 1

### Steps
1. **Navigate to Work Requests**
   - [ ] Open worker app
   - [ ] Login as Sam
   - [ ] Navigate to: `go('workRequests')` or `go('requests')`

2. **View Request**
   - [ ] Screen loads successfully
   - [ ] Request from Siya appears in list
   - [ ] Status badge: 🟠 REQUESTED (orange)
   - [ ] Client name: Siya (or client's name)
   - [ ] Service: Cook ✓
   - [ ] Work details displayed
   - [ ] Location shown
   - [ ] Date & time correct
   - [ ] Budget shown (if provided)
   - [ ] **Accept** and **Reject** buttons visible

3. **Test Filters**
   - [ ] Default filter shows "Requested" requests
   - [ ] Request is visible
   - [ ] Tap "Scheduled" → Request not visible (correct)
   - [ ] Tap "All" → Request visible

### Expected Results
- [ ] ✅ Request appears in worker's list
- [ ] ✅ All client details visible
- [ ] ✅ Work information complete
- [ ] ✅ Action buttons enabled
- [ ] ✅ No errors in console

### Verify in Database
```sql
SELECT 
  id, service_category, status,
  client_name, worker_name,
  description, work_address
FROM work_requests
WHERE status = 'REQUESTED'
AND worker_id = '33e20d20-0779-4147-bf33-7b2749800803';
```
- [ ] ✅ Request visible to Sam
- [ ] ✅ Status still REQUESTED

---

## Test Scenario 4: Worker Accepts Request

### Steps
1. **Accept Request**
   - [ ] In WorkRequestsScreen, tap **"Accept"** button
   - [ ] Confirmation dialog appears: "Do you want to accept this work request?"
   - [ ] Tap **"Accept"**

2. **Verify Success**
   - [ ] Alert appears: "Success"
   - [ ] Message: "Request accepted successfully"
   - [ ] Tap "OK"
   - [ ] Screen refreshes automatically
   - [ ] Request card updates immediately
   - [ ] Status badge changes to: 🟢 SCHEDULED (green)
   - [ ] Accept/Reject buttons disappear
   - [ ] Console log: `📤 accept request [id]: {...}`
   - [ ] Console log: `📥 Action response: {"success": true}`

### Expected Results
- [ ] ✅ Status changed to SCHEDULED
- [ ] ✅ UI updated immediately
- [ ] ✅ Buttons removed from card
- [ ] ✅ No errors

### Verify in Database
```sql
SELECT 
  id, status, accepted_at, rejected_at,
  updated_at
FROM work_requests
WHERE id = '[REQUEST_ID]';
```
- [ ] ✅ status = 'SCHEDULED'
- [ ] ✅ accepted_at = current timestamp
- [ ] ✅ rejected_at = NULL
- [ ] ✅ updated_at = current timestamp

---

## Test Scenario 5: Client Sees Updated Status

### Steps
1. **Switch to Client App**
   - [ ] Open client app (keep worker app running)
   - [ ] Navigate to "My Requests"
   - [ ] Request should show old status initially

2. **Refresh to Sync**
   - [ ] Pull down to refresh
   - [ ] Wait for refresh to complete

3. **Verify Status Update**
   - [ ] Status badge changes to: 🟢 SCHEDULED (green)
   - [ ] Status text: "SCHEDULED"
   - [ ] Same color as worker app
   - [ ] Timestamp updated

### Expected Results
- [ ] ✅ Status synced from database
- [ ] ✅ Shows SCHEDULED (green)
- [ ] ✅ Consistent with worker app
- [ ] ✅ Single source of truth confirmed

### Verify Both Apps Match
```sql
SELECT status, updated_at 
FROM work_requests 
WHERE id = '[REQUEST_ID]';
```
- [ ] ✅ Client app shows same status as database
- [ ] ✅ Worker app shows same status as database
- [ ] ✅ Both apps display consistently

---

## Test Scenario 6: Worker Rejects Request

### Prerequisites
- Create a NEW request (repeat Scenario 1)

### Steps
1. **Reject Request**
   - [ ] In worker app, go to Work Requests
   - [ ] Find the new request (status: REQUESTED)
   - [ ] Tap **"Reject"** button
   - [ ] Confirmation dialog: "Do you want to reject this work request?"
   - [ ] Tap **"Reject"** (destructive style)

2. **Verify Rejection**
   - [ ] Alert: "Request rejected"
   - [ ] Tap "OK"
   - [ ] Screen refreshes
   - [ ] Status badge: 🔴 REJECTED (red)
   - [ ] Accept/Reject buttons removed
   - [ ] Console shows rejection action

### Expected Results
- [ ] ✅ Status changed to REJECTED
- [ ] ✅ Red color displayed
- [ ] ✅ No action buttons
- [ ] ✅ No errors

### Verify in Database
```sql
SELECT 
  id, status, rejected_at, rejection_reason,
  updated_at
FROM work_requests
WHERE id = '[NEW_REQUEST_ID]';
```
- [ ] ✅ status = 'REJECTED'
- [ ] ✅ rejected_at = current timestamp
- [ ] ✅ accepted_at = NULL

---

## Test Scenario 7: Client Sees Rejection

### Steps
1. **Refresh Client App**
   - [ ] Go to My Requests screen
   - [ ] Pull to refresh

2. **Verify Rejection Visible**
   - [ ] Rejected request appears
   - [ ] Status badge: 🔴 REJECTED (red)
   - [ ] Status text: "REJECTED"
   - [ ] May show rejection reason (if implemented)

### Expected Results
- [ ] ✅ Rejection visible to client
- [ ] ✅ Status synced correctly
- [ ] ✅ Color-coded properly

---

## Test Scenario 8: Filter & Search

### Client App Filters
- [ ] "All" filter shows all requests (REQUESTED, SCHEDULED, REJECTED)
- [ ] "Requested" filter shows only pending
- [ ] "Scheduled" filter shows only accepted
- [ ] "Rejected" filter shows only rejected
- [ ] Count updates correctly

### Worker App Filters
- [ ] "Requested" filter shows pending (default)
- [ ] "Scheduled" filter shows accepted
- [ ] "All" filter shows everything
- [ ] No requests from other workers visible

---

## Test Scenario 9: Security Tests

### Test: Client Cannot See Other Clients' Requests
- [ ] Login as different client
- [ ] Navigate to My Requests
- [ ] Should NOT see Siya's requests
- [ ] Only own requests visible

### Test: Worker Cannot See Other Workers' Requests
- [ ] Login as different worker (not Sam)
- [ ] Navigate to Work Requests
- [ ] Should NOT see Sam's assigned requests
- [ ] Only own requests visible

### Test: Cannot Accept/Reject Other Worker's Request
- [ ] Try to call action API with different worker's token
- [ ] Should return 403 Forbidden error
- [ ] Status should NOT change

### Test: Invalid Status Transitions
```bash
# Try to reject already scheduled request
curl -X POST http://192.168.1.4:8000/api/v1/jobs/work-requests/[SCHEDULED_REQUEST_ID]/action/ \
  -H "Authorization: Bearer [WORKER_TOKEN]" \
  -d '{"action": "reject"}'
```
- [ ] Should return error
- [ ] Status should remain SCHEDULED

---

## Test Scenario 10: Error Handling

### Network Error
- [ ] Turn off WiFi
- [ ] Try to create request
- [ ] Should show: "Network error. Please check your connection."
- [ ] No crash

### Invalid Worker ID
- [ ] Modify code to send invalid worker_id
- [ ] Should show error message
- [ ] No crash

### Missing Required Fields
- [ ] Try to create request without location
- [ ] Should show: "Work location is required"
- [ ] Validation works

### Token Expired
- [ ] Clear access_token from AsyncStorage
- [ ] Try to fetch requests
- [ ] Should redirect to login or show error
- [ ] No crash

---

## Performance Tests

### Load Time
- [ ] My Requests screen loads < 2 seconds
- [ ] Work Requests screen loads < 2 seconds
- [ ] Pull-to-refresh completes < 3 seconds

### Large Data
- [ ] Create 10+ requests
- [ ] All requests load properly
- [ ] Scrolling is smooth
- [ ] No lag

---

## Final Verification Checklist

### Database
- [ ] ✅ work_requests table exists
- [ ] ✅ RLS policies active
- [ ] ✅ Indexes created
- [ ] ✅ Triggers working (updated_at)

### Backend
- [ ] ✅ All 5 API endpoints working
- [ ] ✅ Authentication required
- [ ] ✅ Authorization enforced
- [ ] ✅ Status validation works
- [ ] ✅ Django admin accessible

### Client App
- [ ] ✅ Can create requests
- [ ] ✅ Can view own requests
- [ ] ✅ Status updates visible
- [ ] ✅ Filters work
- [ ] ✅ Pull-to-refresh works
- [ ] ✅ No hardcoded data

### Worker App
- [ ] ✅ Can view assigned requests
- [ ] ✅ Can accept requests
- [ ] ✅ Can reject requests
- [ ] ✅ Status updates work
- [ ] ✅ Filters work
- [ ] ✅ No hardcoded data

### Status Flow
- [ ] ✅ REQUESTED → SCHEDULED (accept) ✓
- [ ] ✅ REQUESTED → REJECTED (reject) ✓
- [ ] ✅ Invalid transitions blocked ✓
- [ ] ✅ Both apps show same status ✓

### Security
- [ ] ✅ RLS policies enforce isolation
- [ ] ✅ Cannot view others' data
- [ ] ✅ Cannot modify others' data
- [ ] ✅ Status transitions validated

---

## Success Criteria

All tests must pass:
- ✅ Client can create request
- ✅ Database stores request with REQUESTED status
- ✅ Worker sees request in their app
- ✅ Worker can accept → status = SCHEDULED
- ✅ Worker can reject → status = REJECTED
- ✅ Client sees updated status after refresh
- ✅ Both apps show same status from database
- ✅ Security policies prevent unauthorized access
- ✅ No hardcoded data used
- ✅ Error handling works properly

---

## Troubleshooting

### Request not appearing in worker app
- Check: worker_id matches in database
- Check: worker is logged in
- Check: filter is set to "Requested" or "All"
- Check: Request status is REQUESTED
- Try: Pull to refresh

### Status not updating
- Check: Pull to refresh
- Check: Network connection
- Check: Backend server running
- Verify: Database status changed
- Check: Console logs for errors

### Cannot accept/reject
- Check: Request status is REQUESTED
- Check: Worker owns the request
- Check: Auth token valid
- Check: Backend API responding
- Check: RLS policies not blocking

### Security test fails
- Check: RLS enabled on table
- Check: Policies created correctly
- Check: Auth token contains correct user_id
- Verify: Supabase auth.uid() matches user

---

## Test Report Template

```
Date: ___________
Tester: ___________
Environment: Development / Production

PASSED: _____ / 10 scenarios
FAILED: _____ / 10 scenarios

Failed Tests:
1. ___________________________
2. ___________________________

Issues Found:
1. ___________________________
2. ___________________________

Notes:
_________________________________
_________________________________
```

---

## Sign-off

- [ ] All tests passed
- [ ] No critical issues
- [ ] Documentation reviewed
- [ ] Ready for production

**Tested by:** _________________
**Date:** _________________
**Signature:** _________________

