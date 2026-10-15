# 🧪 ORGANIZATION SYSTEM - TESTING GUIDE

## 📱 SERVERS STATUS
- ✅ **Backend Server:** Running on http://192.168.1.5:8000
- ⏳ **Expo Server:** Starting (rebuilding cache)

---

## 🎯 TESTING SCENARIOS

### TEST 1: Organization Registration
**Steps:**
1. Open the Worker App on your device/emulator
2. From Welcome Screen → Click **"Register Organization"**
3. Fill in the registration form:
   - Organization Name: "Test Construction Co"
   - Organization Type: "Construction"
   - Leader Name: "John Doe"
   - Leader Email: "john@test.com"
   - Leader Phone: "9876543210"
   - Password: "password123"
   - (Fill other required fields)
4. Click **"Register"**

**Expected Result:**
- ✅ Success message: "Organization registered successfully!"
- ✅ Navigates to **Organization Admin Home** (not the old home page)
- ✅ Should see:
  - Header with "Hello, John 👋" and organization name
  - Search bar
  - Quick Actions (3 buttons: Add Worker, Performance, Workers)
  - "New Work Requests" section (empty state)
  - "Accepted Work Requests" section (empty state)

**What to Check:**
- [ ] Registration successful
- [ ] Redirected to correct home page
- [ ] Organization name shown in header
- [ ] Quick Actions buttons visible
- [ ] Empty states showing proper messages

---

### TEST 2: Create Test Work Request (via API)
Since the Client App doesn't have organization types yet, we'll create a test request via API.

**Run this command in PowerShell:**
```powershell
$body = @{
    org_id = "ORG001"
    client_name = "Rahul Sharma"
    client_phone = "9876543210"
    client_email = "rahul@test.com"
    work_type = "Plumbing"
    description = "Need plumber for bathroom repair"
    location = "Pune"
    city = "Pune"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://192.168.1.5:8000/api/v1/org/requests/create/" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
```

**Expected Result:**
- Status: 201 Created
- Response shows success message

---

### TEST 3: View New Work Request in App
**Steps:**
1. Go to Organization Admin Home
2. Pull down to refresh
3. Check **"New Work Requests"** section

**Expected Result:**
- ✅ Should see 1 work request card:
  - Client: Rahul Sharma
  - Work Type: Plumbing
  - Location: Pune
  - Two buttons: **Reject** (red) and **Accept** (purple)

**What to Check:**
- [ ] Work request visible
- [ ] Client details showing
- [ ] Accept/Reject buttons working

---

### TEST 4: Accept Work Request
**Steps:**
1. In the work request card, click **"Accept"** button
2. Wait for confirmation

**Expected Result:**
- ✅ Success alert: "Work request accepted successfully!"
- ✅ Request moves from "New Work Requests" to "Accepted Work Requests" section
- ✅ Accepted request shows "Assign" badge

**What to Check:**
- [ ] Accept confirmation shown
- [ ] Request moved to accepted section
- [ ] "Assign" button visible on accepted request

---

### TEST 5: Try to Assign Work (Will need next implementation)
**Steps:**
1. Click on the accepted work request
2. Should navigate to Assign Work screen

**Expected Result:**
- Currently: Will navigate to screen but might not be fully functional yet
- After next update: Will show list of workers to select

---

## 🐛 COMMON ISSUES & FIXES

### Issue 1: "No new requests" even after creating via API
**Fix:**
- Make sure `org_id` in the API call matches your registered organization
- Check backend logs for errors
- Try pulling down to refresh

### Issue 2: Backend not responding
**Fix:**
```powershell
# Check if backend is running
curl http://192.168.1.5:8000/api/v1/org/list/

# If not working, restart backend
cd d:\capstone\backend
.\venv\Scripts\Activate.ps1
python manage.py runserver 0.0.0.0:8000
```

### Issue 3: Expo app not loading
**Fix:**
```powershell
# Restart Expo with cache clear
cd d:\capstone\worker\frontend
npx expo start --clear
```

### Issue 4: Still showing old home page after registration
**Fix:**
- Make sure you registered as "Organization" not "Individual Worker"
- Check console logs for userRole value
- Try logging out and logging back in

---

## 📋 TESTING CHECKLIST

### Registration & Navigation
- [ ] Organization registration form works
- [ ] Success message shows
- [ ] Redirects to Organization Admin Home (not old home)
- [ ] Header shows organization name

### UI Elements
- [ ] Quick Actions buttons visible (Add Worker, Performance, Workers)
- [ ] Search bar present
- [ ] "New Work Requests" section visible
- [ ] "Accepted Work Requests" section visible
- [ ] Empty states show proper messages

### Functionality
- [ ] Pull-to-refresh works
- [ ] Can accept work requests
- [ ] Accepted requests move to correct section
- [ ] Accept/Reject buttons functional
- [ ] Navigation to Assign Work screen works

### Backend API
- [ ] Organization registration API works
- [ ] Work request creation API works
- [ ] Accept/Reject API works
- [ ] Requests fetch API works

---

## 📸 SCREENSHOTS TO TAKE

1. **Organization Registration Success**
2. **Organization Admin Home - Empty State**
3. **Organization Admin Home - With New Request**
4. **Work Request Card (with Accept/Reject buttons)**
5. **Accepted Request Card (with Assign badge)**

---

## 🔍 WHERE TO LOOK FOR LOGS

### Frontend Logs (Expo Terminal):
- Watch for: `📋 Pending Requests:` and `✅ Accepted Requests:`
- These show the API responses

### Backend Logs (Django Terminal):
- Watch for: `POST /api/v1/org/requests/create/`
- Watch for: `GET /api/v1/org/requests/?status=pending`
- Watch for: `POST /api/v1/org/requests/{id}/accept/`

---

## ✅ SUCCESS CRITERIA

The implementation is successful if:
1. ✅ Organization can register
2. ✅ Admin sees Organization Admin Home (not old home)
3. ✅ Work requests appear in "New Work Requests" section
4. ✅ Can accept requests
5. ✅ Accepted requests move to "Accepted Work Requests" section
6. ✅ UI looks clean and professional
7. ✅ No console errors

---

## 📞 WHAT TO REPORT

When testing, please report:
1. ✅ What worked perfectly
2. ⚠️ What showed errors (with error messages)
3. 🤔 What was confusing or unclear
4. 💡 Any suggestions for improvements

**Take screenshots and share:**
- Registration success screen
- Organization Admin Home
- Any error messages you see

---

**Ready to Test!** 🚀

Once Expo finishes building, scan the QR code with Expo Go app and start testing!
