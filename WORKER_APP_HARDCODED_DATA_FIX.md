# Worker App - Replace Hardcoded Data

## Files to Fix

### 1. `screen/home/OrganizationAdminHome.js`

**Current Issues:**
- Line 59: Hardcoded "Hello, Aditya 👋"
- Lines 149-187: Hardcoded request counts (3 total, 2 client, 1 org)

**Fix:** Add API calls to fetch:
- User name from AsyncStorage
- Work request counts from `/api/v1/jobs/work-requests/worker/?status=REQUESTED`

### 2. `screen/home/OrganizationWorkerHome.js`

**Current Issues:**
- No API integration for assigned work
- Just shows Alert dialogs

**Fix:** Add API calls to fetch assigned work from organization

---

## Solution

Run this command to add September test jobs:
```bash
cd d:\capstone\backend
python manage.py shell < add_september_jobs.py
```

Then update `OrganizationAdminHome.js` to:
1. Fetch user data from AsyncStorage (like `IndividualWorkerHome` does)
2. Fetch request counts from API endpoint

---

## Status
- ✅ IndividualWorkerHome - Already fetches real data
- ✅ Dashboard - Already fetches real data
- ✅ Profile - Already fetches real data
- ✅ Jobs (jobnear) - Already fetches real data
- ❌ OrganizationAdminHome - Needs API integration
- ❌ OrganizationWorkerHome - Needs API integration
