# Worker App Registration Updates

## ✅ Changes Made

### 1. Network Configuration Fixed
**File:** `d:\capstone\worker\frontend\config\api.js`

**Changed IP Address:**
- ❌ Old: `http://192.168.1.6:8000/api/v1`
- ✅ New: `http://192.168.1.4:8000/api/v1`

**Your PC's IP:** 192.168.1.4 (Wi-Fi)

---

### 2. City, State, Country - Changed to Text Input

#### RegisterScreen.js (Individual Worker)
**Changed from SelectBox to InputBox:**
- ✅ City: Users can now type their city name
- ✅ State: Users can now type their state name
- ✅ Country: Users can now type their country name

**Before:**
```javascript
<SelectBox
  placeholder="Select city"
  onPress={selectCity}
/>
```

**After:**
```javascript
<InputBox
  placeholder="Enter your city"
  value={city}
  onChangeText={setCity}
/>
```

#### OrganizationRegistrationScreen.js (Organization)
**Changed from SelectBox to InputBox:**
- ✅ City: Users can now type city name
- ✅ State: Users can now type state name
- ✅ Country: Users can now type country name

---

### 3. Validation Messages Updated
**Changed:**
- "Please select your city" → "Please enter your city"
- "Please select your state" → "Please enter your state"
- "Please select your country" → "Please enter your country"

---

## 📱 How to Test

### 1. Make Sure Backend is Running
```powershell
cd d:\capstone\backend
.\venv\Scripts\Activate.ps1
python manage.py runserver 0.0.0.0:8000
```

### 2. Make Sure Your Phone is on Same WiFi
- PC WiFi: Connected to same network as phone
- PC IP: 192.168.1.4
- Backend URL: http://192.168.1.4:8000

### 3. Test Individual Worker Registration
1. Open Worker App on your phone
2. Click "Sign In as Worker"
3. Click "Register"
4. Fill the form:
   - Name: Sita
   - DOB: Select date
   - Gender: Female
   - Work Type: Cook
   - Phone: 8446597587
   - Aadhaar: 963258741012
   - Address: Pune
   - **City: Type "Pune"** (no dropdown!)
   - **State: Type "Maharashtra"** (no dropdown!)
   - PIN Code: 123456
   - **Country: Type "India"** (no dropdown!)
   - Experience: 2
   - Visit Charge: 100
   - Email: sita@gmail.com
   - Password: sita123456
5. Click "Complete Registration"
6. Should see success and navigate to home

### 4. Test Organization Registration
1. Open Worker App
2. Click "Register Organization"
3. Fill organization details
4. Fill address - **type city, state, country** (no dropdowns!)
5. Fill leader details
6. Click "Complete Registration"
7. Should see success and navigate to home

---

## 🔧 Troubleshooting

### Network Error "Host unreachable"
**Solution:**
1. Check PC and phone are on same WiFi network
2. Check backend server is running: `http://192.168.1.4:8000/admin/`
3. Check Windows Firewall allows port 8000
4. Try accessing from phone browser: `http://192.168.1.4:8000/api/v1/auth/login/`

### If IP Changes
1. Find new IP:
   ```powershell
   Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "127.*"}
   ```
2. Update `config/api.js`:
   ```javascript
   const API_BASE_URL = 'http://YOUR_NEW_IP:8000/api/v1';
   ```

### Dropdown Still Showing
- Restart Expo app (Ctrl+C and restart)
- Shake phone and reload app
- Clear cache: `npx expo start -c`

---

## ✅ Status: Ready to Test

Both registration screens now:
- ✅ Have text inputs for city, state, country (no dropdowns)
- ✅ Connect to correct backend IP (192.168.1.4)
- ✅ Validate all fields properly
- ✅ Create users in database
- ✅ Return JWT tokens
- ✅ Navigate to role-based home screens

**Try registering now!** 🚀
