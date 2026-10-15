# Testing Guide - Location-Based Worker Matching System ✅

## Step 12: Test with Multiple Workers at Different Locations and Services

### Overview

Complete testing guide for the location-based worker matching system with:
1. ✅ Test data setup script
2. ✅ Multiple test scenarios
3. ✅ Manual testing checklist
4. ✅ Expected results for each scenario
5. ✅ Privacy and security verification
6. ✅ Performance testing guidelines

---

## Test Data Setup

### Automatic Test Data Creation

**Script:** `backend/create_test_workers.py`

**Run Script:**
```bash
cd d:\capstone\backend
python manage.py shell < create_test_workers.py
```

**What It Creates:**
- 10 test workers with different:
  - Services (Construction, Plumbing, Electrical, Painting, Carpentry)
  - Locations around Pune
  - Availability status
  - Experience levels
  - Ratings
- 1 test customer account
- All with password: `test1234`

---

## Test Workers Data

### Construction Workers (3)

| Name | Location | Distance from Dighi | Available | Experience | Rating |
|------|----------|-------------------|-----------|------------|--------|
| Amit Kumar | Dighi | 0.2 km | ✅ Yes | 5 years | 4.8 |
| Ravi Sharma | Bhosari | 8.5 km | ✅ Yes | 7 years | 4.6 |
| Suresh Patil | Kharadi | 12.3 km | ✅ Yes | 4 years | 4.5 |
| Deepak Salve | Talegaon | 27 km | ✅ Yes | 5 years | 4.3 |

### Plumbing Workers (2)

| Name | Location | Distance from Dighi | Available | Experience | Rating |
|------|----------|-------------------|-----------|------------|--------|
| Vijay Deshmukh | Pimple Saudagar | 6.2 km | ✅ Yes | 6 years | 4.7 |
| Rahul Joshi | Wakad | 10.5 km | ❌ No | 8 years | 4.9 |

### Electrical Workers (2)

| Name | Location | Distance from Dighi | Available | Experience | Rating |
|------|----------|-------------------|-----------|------------|--------|
| Prakash Mehta | Hinjewadi | 14.8 km | ✅ Yes | 5 years | 4.5 |
| Sanjay Kulkarni | Aundh | 9.3 km | ✅ Yes | 6 years | 4.6 |

### Other Services (2)

| Name | Service | Location | Available |
|------|---------|----------|-----------|
| Ganesh Pawar | Painting | Katraj | ✅ Yes |
| Mahesh Yadav | Carpentry | Hadapsar | ✅ Yes |

---

## Test Scenarios

### Scenario 1: Construction Workers Near Dighi ✅

**Search Parameters:**
```
Work Location: Dighi, Pune
  Latitude: 18.6186
  Longitude: 73.9196
Service: Construction
Search Radius: 20 km
```

**Expected Results:**

✅ **Should Show (3 workers):**

**0-5 km Group:**
- Amit Kumar (0.2 km)
  - Rating: 4.8
  - Experience: 5 years
  - Hourly Rate: ₹500
  - Available: Yes

**5-10 km Group:**
- Ravi Sharma (8.5 km)
  - Rating: 4.6
  - Experience: 7 years
  - Hourly Rate: ₹550
  - Available: Yes

**10-15 km Group:**
- Suresh Patil (12.3 km)
  - Rating: 4.5
  - Experience: 4 years
  - Hourly Rate: ₹450
  - Available: Yes

❌ **Should NOT Show:**
- Deepak Salve (27 km - outside 20 km radius)

**Verification:**
- Workers sorted by distance (closest first)
- Grouped by distance ranges
- Only Construction service workers
- Only available workers
- Exact GPS not shown
- Distance approximately matches Google Maps

---

### Scenario 2: Plumbing Workers Near Pimple Saudagar ✅

**Search Parameters:**
```
Work Location: Pimple Saudagar, Pune
  Latitude: 18.5850
  Longitude: 73.8076
Service: Plumbing
Search Radius: 15 km
```

**Expected Results:**

✅ **Should Show (1 worker):**

**0-5 km Group:**
- Vijay Deshmukh (0.1 km)
  - Rating: 4.7
  - Experience: 6 years
  - Hourly Rate: ₹400
  - Available: Yes

❌ **Should NOT Show:**
- Rahul Joshi (4.5 km but NOT AVAILABLE)
  - Even though within radius, should be filtered out due to `is_available=false`

**Verification:**
- Only available workers shown
- Unavailable workers filtered out
- Distance calculation correct
- Service filtering correct

---

### Scenario 3: Electrical Workers Near Hinjewadi ✅

**Search Parameters:**
```
Work Location: Hinjewadi, Pune
  Latitude: 18.5912
  Longitude: 73.7389
Service: Electrical
Search Radius: 20 km
```

**Expected Results:**

✅ **Should Show (2 workers):**

**0-5 km Group:**
- Prakash Mehta (0.2 km)
  - Rating: 4.5
  - Experience: 5 years
  - Hourly Rate: ₹450
  - Available: Yes

**5-10 km Group:**
- Sanjay Kulkarni (7.8 km)
  - Rating: 4.6
  - Experience: 6 years
  - Hourly Rate: ₹480
  - Available: Yes

**Verification:**
- Both electrical workers shown
- Sorted by distance
- Grouped correctly
- No workers from other services

---

### Scenario 4: Small Radius Test ✅

**Search Parameters:**
```
Work Location: Dighi, Pune
  Latitude: 18.6186
  Longitude: 73.9196
Service: Construction
Search Radius: 5 km
```

**Expected Results:**

✅ **Should Show (1 worker):**

**0-5 km Group:**
- Amit Kumar (0.2 km)

❌ **Should NOT Show:**
- Ravi Sharma (8.5 km - outside 5 km radius)
- Suresh Patil (12.3 km - outside 5 km radius)
- Deepak Salve (27 km - outside 5 km radius)

**Verification:**
- Radius filtering working correctly
- Only workers within 5 km shown
- Workers outside radius excluded

---

### Scenario 5: No Results ✅

**Search Parameters:**
```
Work Location: Lonavala (far from Pune)
  Latitude: 18.7500
  Longitude: 73.4074
Service: Construction
Search Radius: 10 km
```

**Expected Results:**

❌ **No workers found**

**Empty State Should Display:**
- "No Workers Found" message
- "No available workers found within 10 km for Construction"
- "Try increasing the search radius or checking back later"
- "Modify Search" button

**Verification:**
- Empty state displays correctly
- User-friendly message shown
- Option to modify search
- No errors or crashes

---

### Scenario 6: Location Freshness Test ✅

**Test Current vs Primary Location:**

**Setup:**
1. Login as Amit Kumar (worker)
2. Toggle availability ON
3. Current location updated (fresh < 4 hours)
4. System should use current_location for matching

**Then:**
1. Wait 5 hours (or manually set location_updated_at to 5 hours ago in DB)
2. System should fall back to primary_location

**Verification:**
- Fresh location (< 4 hours): Uses current_latitude/longitude
- Stale location (> 4 hours): Uses primary_latitude/longitude
- Distance calculations adjust accordingly

---

## Manual Testing Procedure

### A. Client App Testing

#### 1. Setup
```
□ Install Client app
□ Login: test.customer@test.com / test1234
□ Grant location permissions
□ Ensure backend server running (192.168.1.4:8000)
```

#### 2. Work Request Flow
```
□ Navigate to "Request Service" or WorkRequestScreen
□ Select service: Construction
□ Tap "Select Work Location"
□ Choose "Use Current Location" or "Enter Manually"
□ If manual: Enter "Dighi, Pune" (18.6186, 73.9196)
□ Select search radius: 20 km
□ Enter description: "Build boundary wall"
□ Tap "Find Available Workers"
```

#### 3. Search Results Verification
```
□ Loading spinner shows
□ Results load within 2-3 seconds
□ Workers grouped by distance:
  □ "Very Close (0-5 km)" group shown
  □ "Close (5-10 km)" group shown
  □ "Moderate Distance (10-15 km)" group shown
  □ Empty groups hidden
□ Worker cards display:
  □ Name
  □ Photo
  □ Services
  □ Rating and reviews
  □ Distance (e.g., "3.2 km")
  □ Experience
  □ Hourly rate
□ No exact GPS coordinates visible
□ "View Profile" button visible
□ "Request Worker" button visible
```

#### 4. Worker Profile
```
□ Tap "View Profile" on Amit Kumar
□ Profile screen opens
□ Shows:
  □ Worker photo
  □ Name
  □ Service
  □ Rating
  □ Distance from work location
  □ Experience
  □ Skills
□ Privacy notice displays:
  □ "Distance shown is from work location, not your home"
  □ "Worker's exact address is private"
□ No exact address visible
□ No GPS coordinates visible
□ "Request Worker" button works
□ "Choose Another Worker" button returns to results
```

#### 5. Booking Flow
```
□ Tap "Request Worker"
□ Bookworkerscreen opens
□ Shows:
  □ Worker info
  □ Service category
  □ Work location address
  □ Default date (Tomorrow)
  □ Default time (10:00 AM)
  □ Description
□ Tap "Confirm & Book Worker"
□ Loading state shows
□ Success alert displays
□ Navigates to Homescreen
□ Booking created in database
```

---

### B. Worker App Testing

#### 1. Setup
```
□ Install Worker app
□ Login: amit.kumar@test.com / test1234
□ Grant location permissions
□ Navigate to home screen
```

#### 2. Availability Toggle
```
□ Find "Availability Toggle" component
□ Current status shows (Available/Not Available)
□ Toggle switch to ON:
  □ Location permission requested (if not granted)
  □ Current location fetched
  □ "Updating location..." shows
  □ Success message: "You are now available"
  □ Location info displays
□ Toggle switch to OFF:
  □ Confirmation dialog shows
  □ Confirm
  □ Status updates to "Not Available"
□ Refresh location button works
```

#### 3. Location Update
```
□ With availability ON
□ Move to different location (or simulate)
□ Tap "Refresh Location"
□ New location fetched
□ Location info updates
□ Timestamp updates
```

---

### C. Backend API Testing

#### 1. Search API
```bash
# Test with valid data
curl -X POST http://192.168.1.4:8000/api/v1/users/workers/search/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "service_category": "Construction",
    "work_latitude": 18.6186,
    "work_longitude": 73.9196,
    "search_radius": 20
  }'

# Expected: 200 OK with workers array

# Test without auth
curl -X POST http://192.168.1.4:8000/api/v1/users/workers/search/ \
  -H "Content-Type: application/json" \
  -d '{"service_category": "Construction"}'

# Expected: 401 Unauthorized

# Test with invalid data
curl -X POST http://192.168.1.4:8000/api/v1/users/workers/search/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected: 400 Bad Request
```

#### 2. Create Work Request API
```bash
# Test work request creation
curl -X POST http://192.168.1.4:8000/api/v1/users/work-requests/create/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "worker_id": "WORKER_UUID",
    "service_category": "Construction",
    "work_location": {
      "address": "Dighi, Pune",
      "latitude": 18.6186,
      "longitude": 73.9196
    },
    "description": "Build boundary wall",
    "number_of_workers": 2,
    "estimated_budget": 4000
  }'

# Expected: 201 Created with job_request and job_booking
```

#### 3. Toggle Availability API
```bash
# Test toggle availability
curl -X POST http://192.168.1.4:8000/api/v1/users/workers/toggle-availability/ \
  -H "Authorization: Bearer WORKER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_available": true}'

# Expected: 200 OK with updated status
```

---

### D. Privacy & Security Testing

#### 1. Location Privacy
```
□ Search for workers
□ Check API response (browser dev tools / network tab)
□ Verify response does NOT contain:
  □ primary_latitude
  □ primary_longitude
  □ current_latitude
  □ current_longitude
  □ primary_address
□ Verify response DOES contain:
  □ distance_km
  □ distance_range
  □ name
  □ services
  □ rating
```

#### 2. Authentication Testing
```
□ Try accessing search API without token
  □ Should return 401 Unauthorized
□ Try with invalid token
  □ Should return 401 Unauthorized
□ Try with expired token
  □ Should return 401 Unauthorized
□ Try with valid token
  □ Should return 200 OK
```

#### 3. Authorization Testing
```
□ Worker tries to modify another worker's data
  □ Should be blocked
□ Client tries to access worker's exact location
  □ Should not be exposed in API
□ Worker tries to update own availability
  □ Should succeed
```

---

### E. Performance Testing

#### 1. Load Time
```
□ Search with 10 workers: Should load in < 2 seconds
□ Search with 100 workers: Should load in < 3 seconds
□ Distance calculation for 10 workers: < 100ms
```

#### 2. Database Queries
```
□ Search endpoint: Should use < 5 queries
□ Efficient use of .select_related()
□ Efficient use of .prefetch_related()
□ No N+1 query problems
```

#### 3. Network
```
□ API response size reasonable (< 50 KB for 10 workers)
□ Image loading efficient
□ No excessive API calls
```

---

## Testing Checklist

### ✅ Functional Testing

- [ ] Search returns correct workers
- [ ] Service filtering works
- [ ] Availability filtering works
- [ ] Distance calculation accurate
- [ ] Radius filtering works
- [ ] Distance grouping correct
- [ ] Sorting by distance works
- [ ] Location freshness logic works
- [ ] Worker profile displays correctly
- [ ] Booking creation works
- [ ] Availability toggle works
- [ ] Location update works

### ✅ UI/UX Testing

- [ ] Loading states display
- [ ] Error messages clear
- [ ] Empty states user-friendly
- [ ] Navigation flows smoothly
- [ ] Back buttons work
- [ ] Forms validate input
- [ ] Success feedback clear
- [ ] Buttons disabled during loading
- [ ] Privacy notices visible

### ✅ Privacy Testing

- [ ] Exact GPS not exposed
- [ ] Worker address hidden
- [ ] Contact info protected
- [ ] Distance approximate only
- [ ] Privacy notices displayed

### ✅ Security Testing

- [ ] Authentication required
- [ ] Authorization enforced
- [ ] Input validation works
- [ ] SQL injection prevented
- [ ] XSS prevented
- [ ] CORS configured

### ✅ Edge Case Testing

- [ ] No workers found
- [ ] All workers unavailable
- [ ] Worker outside radius
- [ ] Invalid coordinates
- [ ] Missing required fields
- [ ] Network error
- [ ] Server error
- [ ] Expired token

### ✅ Cross-Platform Testing

- [ ] Works on Android
- [ ] Works on iOS
- [ ] Works on different screen sizes
- [ ] Works on different network speeds

---

## Known Issues & Limitations

### Current Limitations

1. **Location Accuracy**
   - Haversine formula assumes Earth is a perfect sphere
   - Accurate for distances < 100 km
   - May have ~1% error for very long distances

2. **Real-time Updates**
   - Worker location not updated in real-time
   - Client needs to refresh search for latest data
   - Consider WebSocket for real-time updates

3. **Scalability**
   - Distance calculation done in Python
   - May slow down with > 1000 workers
   - Consider PostGIS for large datasets

4. **Notifications**
   - Workers not notified of new bookings yet
   - Push notifications to be implemented
   - Email notifications to be implemented

---

## Future Enhancements

### Phase 2 Features

1. **Real-time Location**
   - WebSocket integration
   - Live worker tracking
   - Real-time availability updates

2. **Advanced Filtering**
   - Filter by price range
   - Filter by rating
   - Filter by experience
   - Filter by availability times

3. **Notifications**
   - Push notifications for workers
   - Email notifications
   - SMS notifications

4. **Reviews & Ratings**
   - Client can rate workers
   - Worker can rate clients
   - Review moderation

5. **Payment Integration**
   - Online payment
   - Payment escrow
   - Invoice generation

6. **Analytics**
   - Worker performance metrics
   - Popular services
   - Busy times/locations
   - Revenue tracking

---

## Test Results Documentation

### Template

```
Test Date: [DATE]
Tester: [NAME]
Environment: [Development/Staging/Production]
Device: [Device Name & OS]

Test Scenario: [Scenario Name]
Expected Result: [What should happen]
Actual Result: [What actually happened]
Status: [PASS/FAIL]
Notes: [Any observations]
Screenshots: [If applicable]
```

### Example

```
Test Date: 2027-01-15
Tester: QA Team
Environment: Development
Device: Android 12, Samsung Galaxy S21

Test Scenario: Construction Workers Near Dighi
Expected Result: 3 workers shown (Amit, Ravi, Suresh)
Actual Result: 3 workers shown correctly
Status: PASS ✅
Notes: Distance calculations match Google Maps within 0.1 km
Screenshots: Attached
```

---

## Status: ✅ READY FOR TESTING

**Test Data:**
- ✅ 10 test workers created
- ✅ Multiple services covered
- ✅ Various locations around Pune
- ✅ Different availability statuses
- ✅ Test customer account ready

**Test Scenarios:**
- ✅ 6 comprehensive scenarios documented
- ✅ Expected results defined
- ✅ Verification points listed

**Test Procedures:**
- ✅ Manual testing checklist
- ✅ API testing commands
- ✅ Privacy verification steps
- ✅ Security testing steps

**Ready for:**
- Manual testing by QA team
- Automated testing setup
- User acceptance testing
- Production deployment

**Key Achievement:**
🎉 **Complete testing framework ready!** The system can now be thoroughly tested with:
1. Realistic test data (10 workers, multiple services, various locations)
2. Comprehensive test scenarios (6 scenarios covering all cases)
3. Detailed verification procedures
4. Privacy and security validation
5. Performance benchmarks
6. Edge case coverage

The location-based worker matching system is now fully implemented, documented, and ready for comprehensive testing before production deployment!
