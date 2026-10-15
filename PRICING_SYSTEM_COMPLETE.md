# Pricing System Implementation - COMPLETE ✅

## What Was Done

### 1. Database Schema ✅
- Added `ServicePricing` model to `backend/jobs/models.py`
- Fields: service_category, city, state, base_price, platform_fee, is_active
- Unique constraint: (service_category, city)
- Indexes on: service_category+city, is_active, city

### 2. Migration ✅
- Created migration: `jobs/migrations/0005_alter_workrequest_status_servicepricing.py`
- Applied migration successfully

### 3. Populate Data Script ✅
- Created: `backend/populate_pricing.py`
- **52 cities** across 4 tiers (Tier 1 Metro to Tier 4 Small)
- **21 services** (Construction, Mason, Electrician, Plumber, Carpenter, Painter, Cleaner, AC Technician, Mechanic, Cook, Gardener, Tile Worker, Welder, Maintenance Worker, Driver, Loader, Pest Control, Security Guard, Farm Worker, Packer, Laundry Worker)
- **Total: 1,092 pricing records** (52 cities × 21 services)
- Skill-based pricing multipliers:
  - HIGH_SKILL (1.5x): Electrician, Plumber, AC Technician, Mechanic, Welder
  - MEDIUM_SKILL (1.2x): Carpenter, Painter, Mason, Tile Worker, Pest Control
  - STANDARD_SKILL (1.0x): All others

### 4. API Endpoint ✅
**Endpoint:** `POST /api/v1/jobs/calculate-price/`

**Request:**
```json
{
  "service_category": "Cook",
  "city": "Pune",
  "worker_id": "uuid-string"
}
```

**Response:**
```json
{
  "success": true,
  "pricing": {
    "base_price": 450.00,
    "worker_visit_charge": 200.00,
    "platform_fee": 50.00,
    "total_price": 700.00,
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

### 5. Admin Interface ✅
- Registered `ServicePricing` in Django admin
- List view shows: service_category, city, state, base_price, platform_fee, is_active
- Inline editable: base_price, platform_fee, is_active
- Filters: is_active, state, service_category
- Search: service_category, city, state

---

## Files Modified

1. `backend/jobs/models.py` - Added ServicePricing model
2. `backend/jobs/views.py` - Added calculate_price endpoint
3. `backend/jobs/urls.py` - Added pricing URL route
4. `backend/jobs/admin.py` - Registered ServicePricing in admin
5. `backend/populate_pricing.py` - NEW script to populate data

---

## Pricing Formula

```
Total Price = Base Price + Worker Visit Charge + Platform Fee (₹50)
```

### Example Breakdown (Cook in Pune):
- **Base Price:** ₹450 (Pune Tier 1 × 1.0 standard skill)
- **Worker Visit Charge:** ₹200 (from worker.hourly_rate)
- **Platform Fee:** ₹50 (fixed)
- **Total:** ₹700

---

## City Tiers & Base Prices

### Tier 1 (Metro) - 8 cities
Base range: ₹350-600
- Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad

### Tier 2 (Major) - 20 cities  
Base range: ₹250-520
- Surat, Jaipur, Lucknow, Kanpur, Nagpur, Indore, Thane, Bhopal, Visakhapatnam, Pimpri-Chinchwad, Patna, Vadodara, Ghaziabad, Ludhiana, Agra, Nashik, Faridabad, Meerut, Rajkot, Varanasi

### Tier 3 (Medium) - 12 cities
Base range: ₹220-500
- Amritsar, Allahabad, Ranchi, Howrah, Coimbatore, Jabalpur, Gwalior, Vijayawada, Jodhpur, Madurai, Raipur, Kota, Chandigarh, Guwahati, Solapur, Aurangabad, Dhanbad, Amravati, Navi Mumbai, Kalyan-Dombivli

### Tier 4 (Small) - 12 cities
Base range: ₹190-370
- Vasai-Virar, Bhiwandi, Kolhapur, Akola, Latur, Ahmednagar, Jalgaon, Nanded, Sangli, Satara, Parbhani, Ichalkaranji

---

## How to Run

```powershell
cd d:\capstone\backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Create migration (DONE)
python manage.py makemigrations

# Apply migration (DONE)
python manage.py migrate

# Populate pricing data (DONE)
python populate_pricing.py

# Start server
python manage.py runserver 0.0.0.0:8000
```

---

## Next Steps

### Frontend Integration
Update these files to call the pricing API:

1. **Client App - Booking Summary**
   - File: `client/frontend/screens/Bookingsummary.js`
   - Call `/api/v1/jobs/calculate-price/` before showing final price
   - Display breakdown: Base Price + Visit Charge + Platform Fee = Total

2. **Worker App - Calendar**
   - File: `worker/frontend/screen/WorkerCalendar.js`
   - Show earnings breakdown for scheduled jobs

3. **Worker App - Jobs List**
   - File: `worker/frontend/screen/jobnear.js`
   - Display total price on job cards

---

## Testing the API

```bash
# Example curl request
curl -X POST http://10.119.99.150:8000/api/v1/jobs/calculate-price/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "service_category": "Cook",
    "city": "Pune",
    "worker_id": "worker-uuid-here"
  }'
```

---

## Architecture Diagram

```
┌──────────────────────┐
│   CUSTOMER APP       │
│ Select Location      │
│ Select Work Type     │
│ Select Worker        │
└──────────┬───────────┘
           │
           │ POST /api/v1/jobs/calculate-price/
           ▼
┌──────────────────────┐
│   BACKEND API        │
│ calculate_price()    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  PRICING SERVICE     │
│ 1. Get Base Price    │
│ 2. Get Visit Charge  │
│ 3. Add Platform Fee  │
│ 4. Calculate Total   │
└───────┬───────┬──────┘
        │       │
┌───────┘       └─────────┐
▼                         ▼
┌──────────────────┐  ┌──────────────────┐
│ ServicePricing   │  │ WorkerProfile    │
│ - city           │  │ - hourly_rate    │
│ - service        │  │ (visit charge)   │
│ - base_price     │  └──────────────────┘
│ - platform_fee   │
└──────────────────┘
           │
           ▼
┌──────────────────────┐
│   FINAL PRICE        │
│ Base: ₹450           │
│ Visit: ₹200          │
│ Platform: ₹50        │
│ ─────────────────    │
│ Total: ₹700          │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   CUSTOMER APP       │
│ Display Total Price  │
└──────────────────────┘
```

---

## Status: ✅ COMPLETE

All backend components implemented and tested.
Ready for frontend integration.
