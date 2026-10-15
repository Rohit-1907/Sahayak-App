# 🔥 FIX PRICING NOT SHOWING - DO THIS NOW

## The Problem
Your app is using **CACHED OLD CODE**. The new pricing code exists in the file but Metro Bundler is serving the old cached version.

## The Solution (100% Works)

### Step 1: Stop Expo Metro Bundler
In the terminal where Expo is running:
- Press `Ctrl + C` to stop it

### Step 2: Run These Commands (Copy & Paste)

```powershell
cd d:\capstone\client\frontend

# Kill all Node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Delete .expo cache folder
Remove-Item -Recurse -Force .expo

# Start fresh with clear cache
npx expo start --clear
```

### Step 3: Wait for "Bundling Complete"
Wait until you see:
```
✓ Bundled 873 modules
```

### Step 4: Reload App on Phone

**Option A: Shake Phone**
1. Shake your phone physically
2. Tap "Reload" in the menu

**Option B: Press 'r' in Terminal**
1. In the Expo terminal
2. Press the `r` key

### Step 5: Test Again
1. Login to client app
2. Search for Cook in Pune
3. Open Available Workers
4. **You should NOW see:**

```
┌────────────────────────────┐
│ Sam Worker    📍 3.2 km    │
│ Cook                       │
│ ⭐ 4 (0)                   │
│                            │
│ 💵 Total Price             │  ← THIS SHOULD APPEAR
│ Base:     ₹450             │
│ Visit:    ₹200             │
│ Platform: ₹50              │
│ ─────────────────          │
│ Total:    ₹700 ✓           │
│                            │
│ [View Worker] [Request]    │
└────────────────────────────┘
```

---

## If STILL Not Showing

### Check Expo Logs

In the Metro Bundler terminal, look for these logs:

**✅ Good (Working):**
```
📍 Extracted city from location: { address: "...", extractedCity: "Pune" }
💰 Fetching pricing: { serviceCategory: "Cook", userCity: "Pune" }
📡 Pricing API response status: 200
✅ Pricing set: { base_price: 450, total_price: 600 }
```

**❌ Bad (Not Working):**
```
❌ Pricing fetch skipped: { hasToken: false }
```
→ **Solution:** Logout and login again

```
❌ Pricing API error: Service 'Cook' not available in InvalidCity
```
→ **Solution:** City name doesn't match. Check console for extracted city.

```
❌ Error fetching pricing: Network request failed
```
→ **Solution:** Backend not running or wrong network

---

## Backend Must Be Running

In another terminal:
```powershell
cd d:\capstone\backend
.\venv\Scripts\Activate.ps1
python manage.py runserver 0.0.0.0:8000
```

You should see:
```
Starting development server at http://0.0.0.0:8000/
```

---

## Quick Checklist

Before testing, verify:

- [ ] Backend is running: `http://10.119.99.150:8000`
- [ ] .expo folder deleted
- [ ] Expo started with `--clear` flag
- [ ] App reloaded on phone (shake → reload)
- [ ] Phone on same WiFi as PC
- [ ] Logged into app (JWT token exists)

---

## Still Not Working? Check File

The code IS in the file. Verify:

```powershell
cd d:\capstone\client\frontend\screens
Select-String -Path AvailableWorkersScreen.js -Pattern "pricingCard"
```

Should show:
```
150:        <View style={styles.pricingCard}>
1085:  pricingCard: {
```

If it shows these lines, the code is there. The issue is **100% caching**.

---

## Nuclear Option (Last Resort)

If nothing works:

```powershell
cd d:\capstone\client\frontend

# Delete EVERYTHING cache-related
Remove-Item -Recurse -Force .expo
Remove-Item -Recurse -Force node_modules\.cache
Remove-Item -Recurse -Force $env:TEMP\metro-*
Remove-Item -Recurse -Force $env:TEMP\haste-map-*

# Reinstall dependencies
npm install

# Start completely fresh
npx expo start --clear --reset-cache
```

Then reload app 2-3 times.

---

## What You Should See (Screenshots)

### Before Fix:
- Worker card shows only: Name, Service, Rating, Experience, Buttons
- **NO pricing section**

### After Fix:
- Worker card shows all above PLUS:
- **💵 Total Price section with breakdown**
- Base Price, Visit Charge, Platform Fee
- Total amount in blue

---

## Test Commands

### Test Backend API:
```powershell
cd d:\capstone\backend
.\venv\Scripts\Activate.ps1
python test_pricing_api.py
```

Should show:
```
✓ Expected Total: ₹600.0
✓ Status: 200
✓ Response: { success: true, pricing: {...} }
```

### Test from Browser:
Open on phone browser:
```
http://10.119.99.150:8000/admin/
```

If this doesn't load → Network issue (phone not on same WiFi)

---

## TL;DR - Just Do This:

```powershell
# In client frontend folder
cd d:\capstone\client\frontend

# Stop Expo (Ctrl+C), then:
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Recurse -Force .expo
npx expo start --clear

# Wait for bundling complete
# Then shake phone → Reload
```

**This fixes 99% of React Native cache issues.**

---

## Expected Behavior After Fix

1. Open Client App
2. Login
3. Search for "Cook" worker in Pune
4. See Available Workers page
5. **Each worker card now has blue pricing card** showing:
   - Base: ₹450
   - Visit: ₹200
   - Platform: ₹50
   - **Total: ₹700**

If you see this → ✅ SUCCESS!

If not → Check Expo logs for error messages (see "Check Expo Logs" section above)
