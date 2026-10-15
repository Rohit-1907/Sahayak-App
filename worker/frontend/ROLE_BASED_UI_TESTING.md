# Worker App - Role-Based UI Testing Guide

## Overview

This document provides comprehensive testing instructions for the three user roles in the Worker App:
1. **Individual Worker** - Independent workers (no organization)
2. **Organization Admin** - Organization leaders who manage workers
3. **Organization Worker** - Workers employed by organizations

---

## Test Environment Setup

### Prerequisites

1. **Django Server Running:**
   ```powershell
   cd d:\capstone\backend
   .\venv\Scripts\Activate.ps1
   python manage.py runserver 0.0.0.0:8000
   ```

2. **Worker App Running:**
   ```powershell
   cd d:\capstone\worker\frontend
   npx expo start --port 8081
   ```

3. **Test Accounts Available:**
   - Individual Worker: `testworker` / `test123456`
   - (Organization accounts to be created during testing)

---

## Journey 1: Individual Worker

### Test Case 1.1: Individual Worker Registration

**Steps:**

1. **Launch Worker App**
   - Open Expo Go on your phone
   - Scan QR code for Worker app (port 8081)

2. **Language Selection**
   - Select your preferred language
   - Click "Continue"

3. **Welcome Screen**
   - Verify you see two sections:
     - ✅ "Individual Worker" section with "Sign In as Worker" button
     - ✅ "Organization" section with "Register Organization" and "Organization Login" buttons
   - Click **"Sign In as Worker"**

4. **Login Screen → Registration**
   - Click **"Register"** or **"Create Account"** link
   - Should navigate to Individual Worker Registration screen

5. **Fill Registration Form:**

   **Personal Details:**
   - Full Name: `John Smith`
   - Date of Birth: Select a date (e.g., `15/05/1990`)
   - Gender: Select `Male`
   - Type of Work: `Electrician`
   - Phone Number: `9876543210`

   **Identity Verification:**
   - Aadhaar Number: `123456789012` (12 digits)
   - Optionally upload Aadhaar photo

   **Address Details:**
   - Address: `123 Main Street`
   - City: Select `Pune`
   - State: Select `Maharashtra`
   - PIN Code: `411001`
   - Country: `India`

   **Professional Details:**
   - Experience: `5 years`
   - Visit Charge: `500`
   - Email: `john.smith@example.com`

   **Account Security:**
   - Password: `password123`
   - Confirm Password: `password123`

6. **Complete Registration**
   - Click **"Complete Registration"**
   - ✅ Should show success alert
   - ✅ Should navigate to Home screen
   - ✅ App should set `userRole = "individual_worker"`

### Test Case 1.2: Individual Worker Home Screen

**After Registration/Login, verify Individual Worker Home shows:**

✅ **Should Display:**
- Header with greeting ("Hello, [Name]")
- Search bar for jobs
- **Work Requests section** - Client requests ONLY (no organization requests)
- Client Requests card showing "2 New"
- **Performance card** - Track work performance
- **My Calendar section** - Upcoming work schedule
- **Recommended Jobs section** - Job listings
- Floating chatbot button

❌ **Should NOT Display:**
- Quick Actions section
- Add Worker button
- Worker Login button
- Organization Request cards
- Any organization management features

**Navigation Test:**
1. Open side menu (hamburger icon)
2. Verify menu items available
3. Test navigation to different screens
4. ✅ All screens should work correctly

### Test Case 1.3: Individual Worker Login

**Steps:**

1. Logout from app (if logged in)
2. Return to Welcome screen
3. Click **"Sign In as Worker"**
4. Enter credentials:
   - Username: `testworker`
   - Password: `test123456`
5. Click **"Login"**
6. ✅ Should navigate to Individual Worker Home
7. ✅ Should see clean home without organization features

---

## Journey 2: Organization Admin

### Test Case 2.1: Organization Registration

**Steps:**

1. **Launch Worker App**
   - Start from Welcome screen

2. **Navigate to Organization Registration**
   - Locate "Organization" section on Welcome screen
   - Click **"Register Organization"** button
   - ✅ Should navigate to Organization Registration Screen

3. **Fill Organization Details:**

   **Organization Details:**
   - Organization Name: `ABC Construction Services`
   - Type of Organization: Select `Construction`
   - Number of Workers: `25`
   - Description (Optional): `Professional construction and electrical services`

   **Organization Address:**
   - Address: `456 Business Park, Kothrud`
   - City: Select `Pune`
   - State: Select `Maharashtra`
   - PIN Code: `411038`
   - Country: `India`

   **Admin/Leader Details:**
   - Full Name: `Rajesh Kumar`
   - Phone Number: `9988776655`
   - Email: `rajesh.kumar@abc-construction.com`
   - Date of Birth: Select a date (e.g., `20/08/1985`)
   - Gender: Select `Male`
   - Aadhaar Number: `987654321098`

   **Account Security:**
   - Password: `admin12345`
   - Confirm Password: `admin12345`

4. **Complete Registration**
   - Click **"Complete Registration"**
   - ✅ Should show success alert
   - ✅ Should navigate to Home screen
   - ✅ App should set `userRole = "organization_admin"`

### Test Case 2.2: Organization Admin Home Screen

**After Registration/Login, verify Organization Admin Home shows:**

✅ **Should Display (Full Features):**
- Header with greeting
- Search bar
- **Work Requests section** - BOTH Client AND Organization requests
  - Client Requests card (2 New)
  - Organization Requests card (1 New)
- **Quick Actions section** with:
  - **Add Worker** button
  - **Worker Login** button
  - **Performance** button
- **My Calendar section**
- **Recommended Jobs section**
- Floating chatbot button

**This is the EXISTING home design - should be identical to current dashboard.**

**Feature Tests:**

1. **Click "Add Worker"**
   - ✅ Should navigate to Add Worker screen
   - Verify form for adding new workers to organization

2. **Click "Worker Login"**
   - ✅ Should navigate to Worker Login screen
   - Allows workers to login to organization

3. **Click "Performance"**
   - ✅ Should navigate to Organization Performance screen
   - Shows organization and worker metrics

4. **Work Requests**
   - ✅ Should show both client and organization request types
   - Verify can view and manage all request types

### Test Case 2.3: Organization Admin Login

**Steps:**

1. Logout from app
2. Return to Welcome screen
3. Locate "Organization" section
4. Click **"Organization Login"** button
5. Enter organization credentials:
   - Organization Name: `ABC Construction Services`
   - Email: `rajesh.kumar@abc-construction.com`
   - Password: `admin12345`
6. Click **"Login"**
7. ✅ Should navigate to Organization Admin Home
8. ✅ Should see full features including Quick Actions

---

## Journey 3: Organization Worker

### Test Case 3.1: Organization Worker Creation (By Admin)

**Prerequisites:** Must have Organization Admin account logged in

**Steps:**

1. **Login as Organization Admin**
   - Use credentials from Journey 2

2. **Navigate to Add Worker**
   - From Organization Admin Home
   - Click **"Add Worker"** in Quick Actions section

3. **Create Worker Account:**
   - Fill in worker details
   - Create login credentials for the worker
   - Worker type: `organization_worker`
   - ✅ Should create worker account successfully

### Test Case 3.2: Organization Worker Login

**Steps:**

1. **Logout from Admin Account**

2. **Return to Welcome Screen**
   - Should see "Individual Worker" and "Organization" sections

3. **Navigate to Worker Login**
   - Scroll to "Organization" section
   - Click **"Organization Login"**
   - Or click "Sign In as Worker" (if worker uses that flow)

4. **Enter Organization Worker Credentials**
   - Username: [Created by admin]
   - Password: [Created by admin]

5. **Login**
   - Click "Login"
   - ✅ Backend should return `role = "organization_worker"`
   - ✅ App should set `userRole = "organization_worker"`
   - ✅ Should navigate to Organization Worker Home

### Test Case 3.3: Organization Worker Home Screen

**After Login, verify Organization Worker Home shows:**

✅ **Should Display:**
- Header with greeting
- Location showing organization name (e.g., "📍 ABC Construction Services")
- Search bar (for assigned work)
- **Your Assigned Work** summary card with stats:
  - Active work count
  - In Progress count
  - Completed count
- **Current Assignments section** with work cards showing:
  - Work title and location
  - Status badge (IN PROGRESS, ASSIGNED)
  - Progress bar (0%, 25%, 50%, 75%, 100%)
  - **"Update Progress"** button
  - **"Mark Complete"** button (green)
  - **"View Details"** button (for assigned work)
- **My Schedule section** - Calendar with upcoming assignments
- **Your Performance** card - View performance metrics

❌ **Should NOT Display:**
- Quick Actions section
- Add Worker button
- Worker Login button
- Organization management features
- Client/Organization request management
- Ability to accept/reject work requests

**Feature Tests:**

1. **Update Progress Test:**
   - Click **"Update Progress"** on a work card
   - ✅ Should show options: 25%, 50%, 75%
   - Select a percentage
   - ✅ Should update progress bar
   - ✅ Should show confirmation

2. **Mark Complete Test:**
   - Click **"Mark Complete"** on a work card
   - ✅ Should show confirmation dialog
   - Confirm completion
   - ✅ Should mark work as completed
   - ✅ Should notify admin for review

3. **View Details Test:**
   - Click **"View Details"** on assigned work
   - ✅ Should navigate to work detail screen
   - ✅ Should show full work information

4. **Calendar Test:**
   - Click on calendar days
   - ✅ Should show scheduled work for that day
   - ✅ Should navigate to calendar view

5. **Performance Test:**
   - Click on **"View Performance"** card
   - ✅ Should navigate to performance screen
   - ✅ Should show worker's individual performance metrics

---

## Cross-Role Testing

### Test Case 4.1: Role Switching Test

**Steps:**

1. **Login as Individual Worker**
   - ✅ Verify Individual Worker Home (no organization features)
   
2. **Logout**
   
3. **Login as Organization Admin**
   - ✅ Verify Organization Admin Home (full features with Quick Actions)
   
4. **Logout**
   
5. **Login as Organization Worker**
   - ✅ Verify Organization Worker Home (simplified with assigned work)

**Verification:**
- ✅ Each role should show correct home screen
- ✅ No feature leakage between roles
- ✅ Navigation should be role-appropriate

### Test Case 4.2: Navigation Consistency Test

**For Each Role, Test:**

1. **Side Menu Navigation**
   - Open side menu (hamburger icon)
   - Verify menu items
   - Test each menu item:
     - Home
     - Voice Assistance
     - Jobs Near You
     - My Calendar
     - Profile
     - Buy Subscription
     - Earnings & Progress
     - Settings
     - Help & Support
     - AI Help Assistant
     - Logout

2. **Bottom Navigation** (if applicable)
   - Home
   - Voice
   - Calendar
   - Profile

3. **Header Actions**
   - Notifications
   - Search
   - Voice search
   - Menu

### Test Case 4.3: Welcome Screen Flow Test

**Test All Entry Points:**

1. **Individual Worker Path:**
   ```
   Welcome Screen
     → "Sign In as Worker"
       → Login Screen
         → Individual Worker Home
   ```

2. **Individual Worker Registration Path:**
   ```
   Welcome Screen
     → "Sign In as Worker"
       → Login Screen
         → "Register" link
           → Individual Worker Registration
             → Individual Worker Home
   ```

3. **Organization Registration Path:**
   ```
   Welcome Screen
     → "Register Organization"
       → Organization Registration Screen
         → Organization Admin Home
   ```

4. **Organization Login Path:**
   ```
   Welcome Screen
     → "Organization Login"
       → Organization Login Screen
         → Organization Admin Home
   ```

---

## Error Handling Tests

### Test Case 5.1: Validation Tests

**Individual Worker Registration:**
- ✅ Empty fields should show error
- ✅ Invalid phone (not 10 digits) should show error
- ✅ Invalid Aadhaar (not 12 digits) should show error
- ✅ Invalid PIN (not 6 digits) should show error
- ✅ Invalid email format should show error
- ✅ Password < 8 characters should show error
- ✅ Password mismatch should show error

**Organization Registration:**
- ✅ Empty organization name should show error
- ✅ Non-numeric worker count should show error
- ✅ Invalid leader phone should show error
- ✅ Invalid leader Aadhaar should show error
- ✅ Invalid leader email should show error
- ✅ Password validations (same as above)

### Test Case 5.2: Login Error Tests

**Test Invalid Credentials:**
1. Enter wrong username → Should show "Invalid credentials" error
2. Enter wrong password → Should show "Invalid credentials" error
3. Enter worker credentials in organization login → Should handle appropriately
4. Enter customer credentials in worker app → Should show "Access Denied" error

---

## Visual Consistency Tests

### Test Case 6.1: Design Pattern Consistency

**Verify Across All Screens:**

✅ **Colors:**
- Purple: `#49769F` (primary actions, icons)
- Light Purple: `#EEF4F8` (backgrounds)
- Text: `#111827` (headings)
- Muted: `#6B7280` (secondary text)
- Green: `#24935D` (success, earnings)

✅ **Components:**
- Input boxes: Same style across all forms
- Buttons: Same height (54px), border radius (12-14px)
- Cards: Same border radius (13-16px), border color
- Icons: MaterialCommunityIcons, size 22-28
- Spacing: Consistent padding (13-18px)

✅ **Typography:**
- Headings: Bold, size 21-28
- Body: Regular, size 13-15
- Labels: Semi-bold, size 14
- Captions: Size 10-11

### Test Case 6.2: Responsive Design Test

**Test on Different Devices:**
1. Small phone (iPhone SE)
2. Medium phone (iPhone 12, Pixel 5)
3. Large phone (iPhone 14 Pro Max, Pixel 7 Pro)
4. Tablet (optional)

**Verify:**
- ✅ All content visible without horizontal scroll
- ✅ Touch targets >= 44x44 points
- ✅ Text readable at all sizes
- ✅ Cards stack properly on narrow screens

---

## Performance Tests

### Test Case 7.1: Navigation Speed

**Measure:**
1. Time from Welcome → Login screen
2. Time from Login → Home screen (after successful login)
3. Time from Home → Other screens (Jobs, Calendar, Profile)

**Expected:**
- ✅ All transitions < 1 second
- ✅ No visible lag or stutter

### Test Case 7.2: Data Loading

**Test:**
1. Login with network delay
2. Load home screen with work requests
3. Load calendar with events
4. Load jobs list

**Expected:**
- ✅ Loading indicators shown where appropriate
- ✅ Graceful handling of network errors
- ✅ No app crashes

---

## Backend Integration Tests

### Test Case 8.1: API Integration (Future)

**When Backend is Integrated:**

1. **Registration APIs:**
   - ✅ Individual worker registration → `/api/v1/auth/register/` with `role=individual_worker`
   - ✅ Organization registration → `/api/v1/organizations/register/` with admin details

2. **Login APIs:**
   - ✅ Worker login → `/api/v1/auth/login/` returning user with role
   - ✅ Role-based redirect based on `role_name` from response

3. **Profile APIs:**
   - ✅ Get current user → `/api/v1/auth/me/` with role information
   - ✅ Update profile → `/api/v1/auth/my-profile/`

4. **Role-Specific APIs:**
   - ✅ Organization Admin: Access to `/api/v1/organizations/workers/`
   - ✅ Organization Worker: Access to `/api/v1/organizations/assigned-work/`
   - ✅ Individual Worker: Standard worker endpoints only

---

## Test Results Template

Use this template to document test results:

```
Test Date: [DATE]
Tester: [NAME]
Device: [DEVICE MODEL & OS]
App Version: [VERSION]

Journey 1: Individual Worker
- [ ] Registration: PASS / FAIL - Notes:
- [ ] Home Screen: PASS / FAIL - Notes:
- [ ] Login: PASS / FAIL - Notes:

Journey 2: Organization Admin
- [ ] Registration: PASS / FAIL - Notes:
- [ ] Home Screen: PASS / FAIL - Notes:
- [ ] Login: PASS / FAIL - Notes:

Journey 3: Organization Worker
- [ ] Creation: PASS / FAIL - Notes:
- [ ] Login: PASS / FAIL - Notes:
- [ ] Home Screen: PASS / FAIL - Notes:

Cross-Role Tests
- [ ] Role Switching: PASS / FAIL - Notes:
- [ ] Navigation Consistency: PASS / FAIL - Notes:
- [ ] Welcome Screen Flow: PASS / FAIL - Notes:

Error Handling
- [ ] Validation Tests: PASS / FAIL - Notes:
- [ ] Login Errors: PASS / FAIL - Notes:

Visual Consistency
- [ ] Design Patterns: PASS / FAIL - Notes:
- [ ] Responsive Design: PASS / FAIL - Notes:

Overall Result: PASS / FAIL
```

---

## Known Limitations (Frontend Only)

Currently, the role-based UI is implemented on the **frontend only**. Backend integration pending:

1. **Registration:**
   - Individual worker registration → Will need backend endpoint
   - Organization registration → Will need backend endpoint
   - Data currently logged to console only

2. **Authentication:**
   - Role detection works via login API
   - Role switching requires logout/login
   - No persistent role storage yet (will add AsyncStorage later)

3. **Data:**
   - Work assignments are placeholder data
   - Progress updates are simulated
   - Organization data not persisted

**Next Steps:**
- Integrate with Django backend APIs
- Add AsyncStorage for role persistence
- Connect organization and worker management
- Implement actual work assignment system

---

## Quick Test Checklist

**Before Demo/Release:**

- [ ] All three roles navigate correctly from Welcome screen
- [ ] Individual Worker Home: No organization features visible
- [ ] Organization Admin Home: Full features with Quick Actions visible
- [ ] Organization Worker Home: Simplified with assigned work only
- [ ] Registration forms work for both Individual and Organization
- [ ] Login correctly identifies and routes based on role
- [ ] Side menu works for all roles
- [ ] No UI crashes or errors in console
- [ ] All buttons and links functional
- [ ] Styling consistent across all screens
- [ ] Forms validate correctly
- [ ] Error messages clear and helpful

---

**Testing Complete!** ✅

Once all tests pass, the Worker App role-based UI implementation is ready for backend integration.
