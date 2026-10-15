# Quick Start Guide - Location-Based Worker Matching System

## Get Started in 5 Minutes! 🚀

This guide will help you quickly test the complete location-based worker matching system.

---

## Prerequisites

- Backend server running (Django)
- PostgreSQL database
- Worker app installed
- Client app installed
- PC IP: 192.168.1.4 (update if different)

---

## Step 1: Create Test Data (2 minutes)

```bash
# Navigate to backend
cd d:\capstone\backend

# Run test data script
python manage.py shell < create_test_workers.py
```

**What it creates:**
- 10 test workers (various services and locations)
- 1 test customer
- All with password: `test1234`

---

## Step 2: Start Backend Server (30 seconds)

```bash
cd d:\capstone\backend
python manage.py runserver 0.0.0.0:8000
```

**Verify:** Open `http://192.168.1.4:8000/admin/` in browser

---

## Step 3: Test Worker App (1 minute)

### Login
```
Email: amit.kumar@test.com
Password: test1234
```

### Test Availability Toggle
1. Find "Availability Toggle" on home screen
2. Toggle switch to **ON**
3. Grant location permission
4. Verify: "You are now available for work" message
5. Verify: Current location displayed
6. Verify: Green "Available" badge shown

**Success:** Worker is now visible to clients! ✅

---

## Step 4: Test Client App (2 minutes)

### Login
```
Email: test.customer@test.com
Password: test1234
```

### Search for Workers
1. Navigate to "Request Service" or Work Request screen
2. Select service: **Construction**
3. Tap "Select Work Location"
4. Choose "Enter Work Location Manually"
5. Enter:
   ```
   Address: Dighi, Pune
   Latitude: 18.6186
   Longitude: 73.9196
   ```
6. Select radius: **20 km**
7. Tap "Find Available Workers"

### Expected Results
You should see **3 workers**:

**Very Close (0-5 km):**
- Amit Kumar (0.2 km) ✅

**Close (5-10 km):**
- Ravi Sharma (8.5 km) ✅

**Moderate Distance (10-15 km):**
- Suresh Patil (12.3 km) ✅

### View Worker Profile
1. Tap "View Profile" on Amit Kumar
2. Verify:
   - Distance shown (e.g., "0.2 km")
   - Privacy notice: "Distance is from work location..."
   - No exact GPS coordinates visible
   - Rating, experience displayed

### Request Worker
1. Tap "Request Worker" button
2. Review booking details
3. Tap "Confirm & Book Worker"
4. Verify: Success message "Booking Confirmed! 🎉"

**Success:** Complete booking flow working! ✅

---

## Quick Test Scenarios

### Test 1: Service Filtering ✅
```
Service: Plumbing
Location: Pimple Saudagar (18.5850, 73.8076)
Radius: 15 km
Expected: 1 worker (Vijay Deshmukh)
```

### Test 2: Availability Filtering ✅
```
1. In Worker app, toggle Rahul Joshi to "Not Available"
2. In Client app, search for Plumbing
3. Expected: Rahul NOT shown (even if within radius)
```

### Test 3: Small Radius ✅
```
Service: Construction
Location: Dighi (18.6186, 73.9196)
Radius: 5 km
Expected: Only Amit Kumar (others too far)
```

### Test 4: No Results ✅
```
Service: Construction
Location: Lonavala (18.7500, 73.4074)
Radius: 10 km
Expected: "No Workers Found" message
```

---

## Verify Privacy Protection

### Check API Response
1. Open browser developer tools
2. Go to Network tab
3. Search for workers
4. Check response JSON

**Should NOT contain:**
```json
{
  "primary_latitude": ...,      // ❌ Should NOT be present
  "primary_longitude": ...,     // ❌ Should NOT be present
  "current_latitude": ...,      // ❌ Should NOT be present
  "current_longitude": ...,     // ❌ Should NOT be present
  "primary_address": ...        // ❌ Should NOT be present
}
```

**Should contain:**
```json
{
  "distance_km": 3.2,           // ✅ Only approximate distance
  "distance_range": "0-5 km",   // ✅ Only range
  "name": "Amit Kumar",         // ✅ Public info
  "rating": 4.8                 // ✅ Public info
}
```

---

## Troubleshooting

### Issue: No workers found
**Solution:**
1. Check backend server running
2. Verify test data created (run create_test_workers.py)
3. Verify at least one worker is available
4. Check worker location within radius

### Issue: Worker not available in search
**Solution:**
1. Login to worker account
2. Toggle availability to ON
3. Verify green "Available" badge
4. Search again from client app

### Issue: "Authentication failed"
**Solution:**
1. Check login credentials
2. Verify backend server running
3. Check API_URL in client/worker apps (should be 192.168.1.4:8000)

### Issue: Location permission denied
**Solution:**
1. Go to phone Settings → Apps → [App Name] → Permissions
2. Enable Location permission
3. Restart app

---

## Test Login Credentials

### Test Customer
```
Email: test.customer@test.com
Password: test1234
```

### Test Workers (all password: test1234)

**Construction Workers:**
- amit.kumar@test.com (Dighi - 0.2 km from Dighi)
- ravi.sharma@test.com (Bhosari - 8.5 km from Dighi)
- suresh.patil@test.com (Kharadi - 12.3 km from Dighi)
- deepak.salve@test.com (Talegaon - 27 km from Dighi)

**Plumbing Workers:**
- vijay.deshmukh@test.com (Pimple Saudagar)
- rahul.joshi@test.com (Wakad - Not Available)

**Electrical Workers:**
- prakash.mehta@test.com (Hinjewadi)
- sanjay.kulkarni@test.com (Aundh)

**Other Services:**
- ganesh.pawar@test.com (Painting - Katraj)
- mahesh.yadav@test.com (Carpentry - Hadapsar)

---

## Success Indicators

### ✅ System Working If:

**Worker App:**
- [x] Login successful
- [x] Availability toggle works
- [x] Location updates when toggled ON
- [x] Green "Available" badge shows when ON
- [x] Location info displays

**Client App:**
- [x] Login successful
- [x] Work location picker opens
- [x] Can enter location manually
- [x] Search returns workers
- [x] Workers grouped by distance
- [x] Distance displayed (not GPS)
- [x] Worker profile opens
- [x] Booking flow completes
- [x] Success message shows

**Privacy:**
- [x] No exact GPS in API response
- [x] Only distance shown to client
- [x] Privacy notice visible in UI
- [x] Worker address hidden

**Backend:**
- [x] Server responds to requests
- [x] Authentication working
- [x] Distance calculations correct
- [x] Database records created

---

## Next Steps

After successful quick test:

1. **Read Full Documentation**
   - `TESTING_GUIDE_COMPLETE.md` - Comprehensive testing
   - `PROJECT_COMPLETE_SUMMARY.md` - Full system overview
   - `SECURITY_PRIVACY_IMPLEMENTATION.md` - Security details

2. **Perform Complete Testing**
   - Run all 6 test scenarios
   - Test edge cases
   - Verify privacy measures
   - Test error handling

3. **Production Preparation**
   - Review security checklist
   - Configure HTTPS
   - Set up monitoring
   - Deploy to production server

---

## Quick Reference

### Important Endpoints
```
POST   /api/v1/users/workers/search/              - Search workers
POST   /api/v1/users/workers/toggle-availability/ - Toggle availability
POST   /api/v1/users/work-requests/create/        - Create booking
```

### Default Test Location
```
Dighi, Pune
Latitude: 18.6186
Longitude: 73.9196
```

### Distance Ranges
```
0-5 km   → Very Close
5-10 km  → Close
10-15 km → Moderate Distance
15-20 km → Far
```

---

## Support

For detailed information, see:
- `TESTING_GUIDE_COMPLETE.md` - Full testing documentation
- `PROJECT_COMPLETE_SUMMARY.md` - Complete implementation details
- Each step's .md file for specific features

---

## Summary

✅ **In 5 minutes, you can:**
1. Create test data (10 workers + 1 customer)
2. Start backend server
3. Test worker availability toggle
4. Test client worker search
5. Test complete booking flow
6. Verify privacy protection

**🎉 System is working if you see workers grouped by distance with privacy protection!**

---

**Happy Testing! 🚀**
