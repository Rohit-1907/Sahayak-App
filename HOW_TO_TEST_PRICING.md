# How to Test Pricing System on Mobile

## Method 1: Using Test Screen (Easiest)

### Step 1: Add Test Screen to App
Add the PricingTest screen to your client app navigation.

**File:** `client/frontend/App.js`

Import at the top:
```javascript
import PricingTest from './screens/PricingTest';
```

Add a navigation option (temporary for testing):
```javascript
// In your navigation logic, add:
if (screen === 'pricingTest') {
  return <PricingTest onBack={() => setScreen('home')} />;
}
```

### Step 2: Get a Worker ID
You need a valid worker UUID to test. Get it from:

**Option A: From Database**
```powershell
cd d:\capstone\backend
.\venv\Scripts\Activate.ps1
python manage.py shell

# In Django shell:
from users.models import WorkerProfile
worker = WorkerProfile.objects.first()
print(f"Worker ID: {worker.id}")
print(f"Worker Name: {worker.user.get_full_name()}")
print(f"Service: {worker.service_categories}")
```

**Option B: From Admin Panel**
1. Go to `http://10.119.99.150:8000/admin/`
2. Login with: `admin` / `admin123`
3. Click "Worker Profiles"
4. Click on any worker
5. Copy the UUID from the URL or ID field

**Option C: From Worker App**
Login to worker app and check the profile screen for the worker's ID.

### Step 3: Run the Apps

**Terminal 1 - Backend:**
```powershell
cd d:\capstone\backend
.\venv\Scripts\Activate.ps1
python manage.py runserver 0.0.0.0:8000
```

**Terminal 2 - Client App:**
```powershell
cd d:\capstone\client\frontend
npx expo start --clear
```

### Step 4: Test in Mobile App
1. Login to client app
2. Navigate to PricingTest screen (add temp button in dashboard)
3. Select Service (e.g., "Cook")
4. Select City (e.g., "Pune")
5. Enter Worker ID (UUID from Step 2)
6. Click "Calculate Price"

### Expected Result:
You should see:
```
Pricing Calculated ✓

Price Breakdown:
- Service: Cook
- City: Pune, Maharashtra
- Worker: Sam Worker

Base Price: ₹450
Worker Visit Charge: ₹200
Platform Fee: ₹50
──────────────────
Total Price: ₹700
```

---

## Method 2: Test Using API Directly (Postman/Thunder Client)

### Step 1: Get Access Token
Login via API to get token:

**Request:**
```
POST http://10.119.99.150:8000/api/v1/auth/login/
Content-Type: application/json

{
  "username": "siya@gmail.com",
  "password": "12345678",
  "app_type": "client"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLC...",
  ...
}
```

Copy the `access` token.

### Step 2: Call Pricing API

**Request:**
```
POST http://10.119.99.150:8000/api/v1/jobs/calculate-price/
Authorization: Bearer <YOUR_ACCESS_TOKEN>
Content-Type: application/json

{
  "service_category": "Cook",
  "city": "Pune",
  "worker_id": "<WORKER_UUID_HERE>"
}
```

**Response:**
```json
{
  "success": true,
  "pricing": {
    "base_price": 450.0,
    "worker_visit_charge": 200.0,
    "platform_fee": 50.0,
    "total_price": 700.0,
    "currency": "INR"
  },
  "breakdown": {
    "service_category": "Cook",
    "city": "Pune",
    "state": "Maharashtra",
    "worker_name": "Sam Worker"
  }
}
```

---

## Method 3: Integration in Existing Booking Flow

### Update AvailableWorkersScreen
When user selects a worker, fetch pricing before showing booking summary.

**File:** `client/frontend/screens/AvailableWorkersScreen.js`

Add before navigation to booking:
```javascript
const fetchPricing = async (workerId) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const response = await fetch(
      'http://10.119.99.150:8000/api/v1/jobs/calculate-price/',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_category: serviceCategory,
          city: userCity, // Get from user's location
          worker_id: workerId,
        }),
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      console.log('💰 Pricing:', data.pricing);
      return data.pricing;
    }
  } catch (error) {
    console.error('Error fetching pricing:', error);
  }
  return null;
};
```

---

## Testing Different Scenarios

### Test Case 1: Different Cities (Tier Pricing)
```javascript
// Mumbai (Tier 1 - Higher prices)
{ service_category: "Cook", city: "Mumbai", worker_id: "..." }
// Expected Base Price: ₹500

// Pune (Tier 1 - Medium)  
{ service_category: "Cook", city: "Pune", worker_id: "..." }
// Expected Base Price: ₹450

// Nashik (Tier 2 - Lower)
{ service_category: "Cook", city: "Nashik", worker_id: "..." }
// Expected Base Price: ₹380
```

### Test Case 2: Different Services (Skill-based Pricing)
```javascript
// High Skill Service
{ service_category: "Electrician", city: "Pune", worker_id: "..." }
// Expected Base Price: ₹700 (1.5x multiplier)

// Medium Skill Service
{ service_category: "Carpenter", city: "Pune", worker_id: "..." }
// Expected Base Price: ₹550 (1.2x multiplier)

// Standard Service
{ service_category: "Cook", city: "Pune", worker_id: "..." }
// Expected Base Price: ₹450 (1.0x multiplier)
```

### Test Case 3: Error Handling
```javascript
// Invalid City
{ service_category: "Cook", city: "InvalidCity", worker_id: "..." }
// Expected Error: "Service 'Cook' not available in InvalidCity"

// Invalid Worker ID
{ service_category: "Cook", city: "Pune", worker_id: "invalid-uuid" }
// Expected Error: "Worker not found"
```

---

## Troubleshooting

### Issue 1: "Service not available in city"
**Cause:** City name doesn't match database exactly.
**Solution:** Use exact city names from the list:
- Pune, Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata, Ahmedabad, etc.
- Check `backend/populate_pricing.py` for full list of 52 cities.

### Issue 2: "Worker not found"
**Cause:** Invalid worker UUID or worker doesn't exist.
**Solution:** 
```powershell
# Get valid worker IDs:
cd d:\capstone\backend
.\venv\Scripts\Activate.ps1
python manage.py shell -c "from users.models import WorkerProfile; [print(f'{w.id} - {w.user.get_full_name()}') for w in WorkerProfile.objects.all()[:5]]"
```

### Issue 3: Pricing data not populated
**Cause:** `populate_pricing.py` script not run or incomplete.
**Solution:**
```powershell
cd d:\capstone\backend
.\venv\Scripts\Activate.ps1
python populate_pricing.py
```

### Issue 4: Authentication error
**Cause:** Invalid or expired JWT token.
**Solution:** Login again to get fresh token.

---

## Verify Pricing Data in Admin

1. Go to: `http://10.119.99.150:8000/admin/`
2. Login: `admin` / `admin123`
3. Click "Service Pricing"
4. You should see **1,092 records** (21 services × 52 cities)
5. Filter by city "Pune" to see all service prices
6. Filter by service "Cook" to see prices across cities

---

## Quick Test Script

Create `test_pricing.py` in backend:

```python
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sahayak_backend.settings')
django.setup()

from jobs.models import ServicePricing
from users.models import WorkerProfile

# Get sample data
worker = WorkerProfile.objects.first()
pricing = ServicePricing.objects.filter(
    service_category='Cook',
    city='Pune'
).first()

print(f"Worker: {worker.user.get_full_name()}")
print(f"Worker ID: {worker.id}")
print(f"Visit Charge: ₹{worker.hourly_rate}")
print(f"\nPune - Cook Pricing:")
print(f"Base Price: ₹{pricing.base_price}")
print(f"Platform Fee: ₹{pricing.platform_fee}")
print(f"\nTotal: ₹{pricing.base_price + worker.hourly_rate + pricing.platform_fee}")
```

Run:
```powershell
cd d:\capstone\backend
.\venv\Scripts\Activate.ps1
python test_pricing.py
```

---

## Success Checklist

- [ ] Backend server running on 10.119.99.150:8000
- [ ] Pricing data populated (1,092 records)
- [ ] Valid worker ID obtained
- [ ] Client app connected to backend
- [ ] User logged in (JWT token available)
- [ ] PricingTest screen added to app
- [ ] Test pricing API call successful
- [ ] Price breakdown displays correctly

---

**You're ready to test! Start with Method 1 for the easiest testing experience.**
