# Pricing Not Showing - Debug Steps

## Issue
Pricing calculation not showing in mobile apps even though API is working.

## Root Causes (Most Likely)

### 1. **Metro Bundler Cache** (90% likely)
The mobile app is using cached old JavaScript code.

**Solution:**
```powershell
cd d:\capstone\client\frontend
Remove-Item -Recurse -Force .expo
Remove-Item -Recurse -Force node_modules\.cache
npx expo start --clear
```

Then:
- Press `r` in terminal to reload
- Or shake device → Reload

---

### 2. **Backend Not Running**
Backend server stopped or not accessible.

**Check:**
```powershell
# Test if backend is running
curl http://10.119.99.150:8000/api/v1/jobs/calculate-price/
```

**Solution:**
```powershell
cd d:\capstone\backend
.\venv\Scripts\Activate.ps1
python manage.py runserver 0.0.0.0:8000
```

---

### 3. **Network Issue**
Mobile device not on same network as backend server.

**Check:**
- Backend IP: `10.119.99.150`
- Mobile device must be on same WiFi network
- Try pinging from mobile device browser: `http://10.119.99.150:8000/admin/`

---

### 4. **City Not Matching**
City extracted from address doesn't match database city names.

**Check Console Logs:**
Look for:
```
📍 Extracted city from location: { 
  address: "BOYS HOSTEL, पुणे, महाराष्ट्र",
  extractedCity: "Pune"  ← Should be exact match
}
```

**Fix:** Ensure work location address contains city name exactly as in database:
- "Pune" ✓
- "pune" ✗ (wrong case)
- "Poona" ✗ (wrong name)

---

## Debug Steps

### Step 1: Check Console Logs in Expo

When you open Available Workers screen, you should see:

```
📍 Extracted city from location: { address: "...", extractedCity: "Pune" }
💰 Fetching pricing: { serviceCategory: "Cook", userCity: "Pune", workerId: "..." }
📡 Pricing API response status: 200
📦 Pricing API response data: { success: true, pricing: {...} }
✅ Pricing set: { base_price: 450, ... }
```

**If you see:**
```
❌ Pricing fetch skipped: { hasToken: false, ... }
```
→ Login again

```
❌ Pricing API error: Service 'Cook' not available in InvalidCity
```
→ City name mismatch

```
❌ Error fetching pricing: Network request failed
```
→ Backend not running or network issue

---

### Step 2: Test API Manually

```powershell
cd d:\capstone\backend
.\venv\Scripts\Activate.ps1
python test_pricing_api.py
```

Should show:
```
✓ Token obtained
✓ Pricing API called
✓ Response: { success: true, pricing: {...} }
```

---

### Step 3: Clear All Caches

```powershell
# Client app
cd d:\capstone\client\frontend
Remove-Item -Recurse -Force .expo
Remove-Item -Recurse -Force node_modules\.cache
npx expo start --clear

# Worker app (if testing)
cd d:\capstone\worker\frontend
Remove-Item -Recurse -Force .expo
Remove-Item -Recurse -Force node_modules\.cache
npx expo start --clear
```

---

### Step 4: Verify Data

```powershell
cd d:\capstone\backend
.\venv\Scripts\Activate.ps1
python check_pricing.py
```

Should show:
```
✓ Total pricing records: 1260
✓ Pune - Cook pricing: Base Price: ₹450.00
✓ Sample Worker: Visit Charge: ₹100.00
```

---

## Quick Fix (Most Common)

**99% of the time, this fixes it:**

1. **Kill all Expo processes**
   ```powershell
   # Close Expo Metro Bundler terminal (Ctrl+C)
   taskkill /F /IM node.exe /T
   ```

2. **Delete .expo folder**
   ```powershell
   cd d:\capstone\client\frontend
   Remove-Item -Recurse -Force .expo
   ```

3. **Start fresh**
   ```powershell
   npx expo start --clear
   ```

4. **Reload app on phone**
   - Shake device
   - Tap "Reload"

---

## Still Not Working?

### Check These:

1. **Is backend actually running?**
   ```powershell
   # Should see: "Starting development server at http://..."
   cd d:\capstone\backend
   .\venv\Scripts\Activate.ps1
   python manage.py runserver 0.0.0.0:8000
   ```

2. **Is phone on same network?**
   - PC WiFi IP: `10.119.99.150`
   - Phone must be on SAME WiFi network
   - Test: Open `http://10.119.99.150:8000/admin/` in phone browser

3. **Check Expo logs**
   ```
   Look for red errors in Expo Metro Bundler terminal
   ```

4. **Try different worker/city combination**
   - Try: Mumbai + Plumber
   - Try: Bangalore + Electrician

---

## Expected Behavior

### When Working Correctly:

**Client App - Available Workers:**
```
┌────────────────────────────┐
│ Sita Worker    📍 2.3 km   │
│ Cook                       │
│ ⭐ 4.5 (23)                │
│                            │
│ 💵 Total Price             │
│ Base:     ₹450             │
│ Visit:    ₹100             │
│ Platform: ₹50              │
│ ─────────────────          │
│ Total:    ₹600 ✓           │  ← SHOULD SEE THIS
│                            │
│ [View Profile] [Request]   │
└────────────────────────────┘
```

**Console logs:**
```
📍 Extracted city: Pune
💰 Fetching pricing: Cook, Pune, worker-id
📡 Response: 200
✅ Pricing set: {base_price: 450, total_price: 600}
```

---

## Files to Check

1. **Backend running:** `d:\capstone\backend\` - `python manage.py runserver 0.0.0.0:8000`
2. **Client app code:** `d:\capstone\client\frontend\screens\AvailableWorkersScreen.js`
3. **API URL:** `http://10.119.99.150:8000/api/v1/jobs/calculate-price/`

---

## Contact Debug Info

If still not working, provide:

1. **Expo console logs** (everything)
2. **Backend terminal output**
3. **Screenshot of Available Workers screen**
4. **Phone WiFi IP** (Settings → WiFi → Details)
5. **PC WiFi IP** (`ipconfig` in PowerShell)

---

**TL;DR: Run this, then reload app:**

```powershell
cd d:\capstone\client\frontend
Remove-Item -Recurse -Force .expo
npx expo start --clear
```

Then shake phone → Reload
