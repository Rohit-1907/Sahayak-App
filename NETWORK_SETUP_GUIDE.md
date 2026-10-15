# 🌐 SAHAYAK Network Setup Guide

Complete guide for setting up network connectivity between Django backend and React Native mobile apps.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Setup Scripts](#setup-scripts)
3. [Manual Setup](#manual-setup)
4. [Troubleshooting](#troubleshooting)
5. [Common Issues](#common-issues)

---

## 🚀 Quick Start

### Step 1: Check Current Status

Run the diagnostic script to see what needs fixing:

```powershell
cd D:\capstone\backend
.\check-status.ps1
```

### Step 2: Fix Firewall (if needed)

If firewall rule is missing, run setup script **as Administrator**:

```powershell
# Right-click PowerShell → "Run as Administrator"
cd D:\capstone\backend
.\setup-firewall.ps1
```

### Step 3: Start Django Server

Always start on `0.0.0.0:8000` (not `127.0.0.1`):

```powershell
cd D:\capstone\backend
.\venv\Scripts\Activate.ps1
python manage.py runserver 0.0.0.0:8000
```

### Step 4: Update Mobile App Config

Use your computer's IP address in the mobile apps:

**File: `d:\capstone\client\frontend\config\api.js`**
**File: `d:\capstone\worker\frontend\config\api.js`**

```javascript
export const API_BASE_URL = 'http://192.168.1.4:8000';  // Your IP here
```

### Step 5: Test Connection

1. Make sure phone and computer are on **same WiFi**
2. Open mobile app and try to login
3. Check server logs for incoming requests

---

## 🛠️ Setup Scripts

### 1. `check-status.ps1` - Diagnostic Tool

**Purpose:** Check server status, network configuration, and firewall rules  
**Requires Admin:** NO  
**Usage:**

```powershell
cd D:\capstone\backend
.\check-status.ps1
```

**Output Example:**
```
[1] Checking Django Server...
    [OK] Server is RUNNING on 0.0.0.0:8000
    [OK] Accepting network connections

[2] Network IP Addresses...
    IP: 192.168.1.4 (Wi-Fi)
    Use this in mobile app: http://192.168.1.4:8000

[3] Checking Firewall...
    [ERROR] Firewall rule NOT found
    Run 'setup-firewall.ps1' as Administrator

[4] Testing API...
    [OK] API responding (Status: 200)
```

### 2. `setup-firewall.ps1` - Firewall Configuration

**Purpose:** Create Windows Firewall rule to allow incoming connections  
**Requires Admin:** YES  
**Usage:**

```powershell
# Right-click PowerShell → "Run as Administrator"
cd D:\capstone\backend
.\setup-firewall.ps1
```

**What it does:**
- Checks for existing firewall rule
- Creates rule for Python (Django) on port 8000
- Allows incoming TCP connections from network
- Shows your IP addresses
- Verifies server status

---

## 🔧 Manual Setup

### Configure Windows Firewall Manually

**Option 1: PowerShell Command (Requires Admin)**

```powershell
netsh advfirewall firewall add rule name="Django Development Server" dir=in action=allow protocol=TCP localport=8000 program="D:\capstone\backend\venv\Scripts\python.exe" enable=yes
```

**Option 2: Windows Defender Firewall GUI**

1. Open **Windows Security**
2. Click **Firewall & network protection**
3. Click **Allow an app through firewall**
4. Click **Change settings** (requires admin)
5. Click **Allow another app**
6. Browse to: `D:\capstone\backend\venv\Scripts\python.exe`
7. Check both **Private** and **Public** networks
8. Click **Add**

### Find Your Computer's IP Address

**Method 1: PowerShell**

```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -like "*Wi-Fi*" } | Select-Object IPAddress
```

**Method 2: Command Prompt**

```cmd
ipconfig
```

Look for "Wireless LAN adapter Wi-Fi" → "IPv4 Address"

**Method 3: Settings**

1. Open **Settings** → **Network & Internet**
2. Click **Wi-Fi** → Your network name
3. Look for **IPv4 address**

---

## 🐛 Troubleshooting

### Issue 1: Mobile App Shows "Connection Failed"

**Symptoms:**
```
ERROR  API Request Error: [Error: fetch failed: java.net.ConnectException: 
Failed to connect to /192.168.1.4:8000]
```

**Possible Causes:**

1. **Server not running**
   ```powershell
   # Check if running
   Get-NetTCPConnection -LocalPort 8000 -State Listen
   
   # If not, start it
   cd D:\capstone\backend
   .\venv\Scripts\Activate.ps1
   python manage.py runserver 0.0.0.0:8000
   ```

2. **Server running on wrong address (127.0.0.1)**
   ```powershell
   # Check bind address
   Get-NetTCPConnection -LocalPort 8000 | Select-Object LocalAddress
   
   # If shows 127.0.0.1, restart with:
   python manage.py runserver 0.0.0.0:8000
   ```

3. **Firewall blocking connections**
   ```powershell
   # Check firewall rule
   netsh advfirewall firewall show rule name="Django Development Server"
   
   # If not found, run setup-firewall.ps1 as Administrator
   ```

4. **Wrong IP address in mobile app**
   - Check your current IP: `ipconfig`
   - Update `config/api.js` in both apps
   - Reload app: Press `r` in Expo terminal

5. **Different WiFi networks**
   - Phone and computer MUST be on same WiFi
   - Check phone WiFi settings
   - Check computer WiFi connection

### Issue 2: Server Starts but No Connections

**Check binding address:**

```powershell
cd D:\capstone\backend
.\check-status.ps1
```

Should show:
```
[OK] Server is RUNNING on 0.0.0.0:8000
[OK] Accepting network connections
```

If shows `127.0.0.1`, stop and restart:

```powershell
# Stop server (Ctrl+C or kill process)
Get-Process python | Where-Object {$_.Path -like "*capstone*"} | Stop-Process

# Restart correctly
.\venv\Scripts\Activate.ps1
python manage.py runserver 0.0.0.0:8000
```

### Issue 3: IP Address Changed

**Symptoms:** App was working, now shows connection error

**Cause:** Your computer's IP address changed (DHCP reassignment)

**Solution:**

1. Find new IP:
   ```powershell
   ipconfig
   ```

2. Update both mobile apps:
   ```javascript
   // d:\capstone\client\frontend\config\api.js
   // d:\capstone\worker\frontend\config\api.js
   export const API_BASE_URL = 'http://NEW_IP_HERE:8000';
   ```

3. Reload apps (press `r` in Expo terminal)

### Issue 4: Firewall Rule Exists but Still Can't Connect

**Verify rule is enabled:**

```powershell
netsh advfirewall firewall show rule name="Django Development Server" verbose
```

Check output for:
```
Enabled: Yes
Action: Allow
```

**Recreate rule:**

```powershell
# Delete old rule (as Administrator)
netsh advfirewall firewall delete rule name="Django Development Server"

# Create new rule
.\setup-firewall.ps1
```

---

## 🔍 Common Issues

### ❌ Error: "Failed to connect to /192.168.1.4:8000"

**Quick Fix Checklist:**

- [ ] Server running? → `Get-NetTCPConnection -LocalPort 8000`
- [ ] Running on 0.0.0.0? → `.\check-status.ps1`
- [ ] Firewall configured? → `.\setup-firewall.ps1` (as Admin)
- [ ] Same WiFi network? → Check phone & PC
- [ ] Correct IP in app? → Update `config/api.js`

### ❌ Error: "The requested operation requires elevation"

**Cause:** Trying to modify firewall without Administrator privileges

**Solution:** Right-click PowerShell → "Run as Administrator"

### ❌ Warning: "SafeAreaView has been deprecated"

**Not Critical:** This is just a warning about a deprecated component. The app will still work. Can be ignored for now.

### ❌ Error: "AsyncStorage Native module is null"

**Cause:** AsyncStorage not properly installed

**Solution:**

```powershell
cd d:\capstone\client\frontend
npm install @react-native-async-storage/async-storage

cd d:\capstone\worker\frontend
npm install @react-native-async-storage/async-storage

# Restart Expo
npx expo start --clear
```

---

## 📱 Mobile App Configuration Files

### Client App Config

**File:** `d:\capstone\client\frontend\config\api.js`

```javascript
export const API_BASE_URL = 'http://192.168.1.4:8000';

export const API_ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/api/v1/auth/register/`,
  LOGIN: `${API_BASE_URL}/api/v1/auth/login/`,
  LOGOUT: `${API_BASE_URL}/api/v1/auth/logout/`,
  REFRESH_TOKEN: `${API_BASE_URL}/api/v1/auth/refresh/`,
  CURRENT_USER: `${API_BASE_URL}/api/v1/auth/me/`,
};
```

### Worker App Config

**File:** `d:\capstone\worker\frontend\config\api.js`

Same configuration as client app.

---

## 🎯 Testing Checklist

### Before Testing on Phone:

1. **Server Status**
   ```powershell
   cd D:\capstone\backend
   .\check-status.ps1
   ```
   All checks should pass ✅

2. **Firewall Configured**
   ```powershell
   netsh advfirewall firewall show rule name="Django Development Server"
   ```
   Should show rule details (not "No rules match")

3. **API Responding**
   ```powershell
   curl http://192.168.1.4:8000/api/v1/auth/login/
   ```
   Should get response (even if 405 Method Not Allowed is okay)

4. **Mobile App Config**
   - Open `config/api.js`
   - Verify IP matches your computer's IP
   - Save file

5. **Same Network**
   - Check computer WiFi: Settings → Network & Internet
   - Check phone WiFi: Same network name?

### Testing on Phone:

1. **Start Apps**
   ```powershell
   # Client app
   cd d:\capstone\client\frontend
   npx expo start
   
   # Worker app (in new terminal)
   cd d:\capstone\worker\frontend
   npx expo start --port 8081
   ```

2. **Open in Expo Go**
   - Scan QR code with Expo Go app
   - Wait for bundle to load

3. **Test Login**
   - Username: `testcustomer` (for client) or `testworker` (for worker)
   - Password: `test123456`
   - Should navigate to dashboard

4. **Check Server Logs**
   - Django terminal should show:
     ```
     "POST /api/v1/auth/login/ HTTP/1.1" 200
     ```

---

## 🎓 Best Practices

### 1. Always Use 0.0.0.0 for Mobile Development

```powershell
# ✅ Correct - Accepts network connections
python manage.py runserver 0.0.0.0:8000

# ❌ Wrong - Only localhost
python manage.py runserver
python manage.py runserver 127.0.0.1:8000
```

### 2. Keep IP Updated

When your IP changes:
1. Update both mobile apps' `config/api.js`
2. Restart Expo dev server
3. Reload app on phone (shake device → Reload)

### 3. Use Static IP (Optional)

To avoid IP changes:

1. Open **Settings** → **Network & Internet**
2. Click **Wi-Fi** → **Your network** → **Edit**
3. Set **IP assignment** to **Manual**
4. Enter:
   - IP: `192.168.1.4` (or your preferred IP)
   - Subnet: `255.255.255.0`
   - Gateway: `192.168.1.1` (your router)
   - DNS: `8.8.8.8`

### 4. Use Environment Variables (Production)

For production, use environment variables instead of hardcoded IPs:

```javascript
// config/api.js
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.4:8000';
```

---

## 📞 Quick Reference

### Start Everything

```powershell
# Terminal 1: Django Server
cd D:\capstone\backend
.\venv\Scripts\Activate.ps1
python manage.py runserver 0.0.0.0:8000

# Terminal 2: Client App
cd D:\capstone\client\frontend
npx expo start

# Terminal 3: Worker App
cd D:\capstone\worker\frontend
npx expo start --port 8081
```

### Check Status

```powershell
cd D:\capstone\backend
.\check-status.ps1
```

### Fix Firewall

```powershell
# Run as Administrator
cd D:\capstone\backend
.\setup-firewall.ps1
```

### Get Your IP

```powershell
ipconfig | Select-String "IPv4"
```

### Test API

```powershell
curl http://192.168.1.4:8000/api/v1/auth/login/
```

---

## 📚 Additional Resources

- **Django Settings:** `d:\capstone\backend\sahayak_backend\settings.py`
- **API Endpoints:** `d:\capstone\backend\TEST_JWT_AUTH.md`
- **How to Run Apps:** `d:\capstone\HOW_TO_RUN_APPS.md`
- **Authentication Guide:** `d:\capstone\backend\AUTHENTICATION_COMPLETE.md`

---

## ✅ Success Indicators

When everything is working:

1. ✅ `check-status.ps1` shows all checks passed
2. ✅ Server logs show: `Starting WSGI development server at http://0.0.0.0:8000/`
3. ✅ Mobile app connects and shows UI (no connection errors)
4. ✅ Login works and navigates to dashboard
5. ✅ Server logs show POST requests from phone's IP

---

**Created:** August 22, 2026  
**Last Updated:** August 22, 2026  
**Project:** SAHAYAK - Service Worker Platform
