# 🔧 Fix Worker App Connection - RIGHT NOW

## 🚨 Current Problem

```
ERROR: Failed to connect to /192.168.1.4:8000
```

## ✅ Current Status (as of now)

✅ Django server is RUNNING on 0.0.0.0:8000  
✅ Server accepting network connections  
✅ Your IP: 192.168.1.4  
✅ API is responding correctly  
❌ **Windows Firewall is blocking connections from your phone**

## 🎯 THE FIX (Takes 1 minute)

### Step 1: Open PowerShell as Administrator

**Method 1: Search Bar**
1. Click Windows Search (or press Windows key)
2. Type "PowerShell"
3. **Right-click** "Windows PowerShell"
4. Click **"Run as administrator"**

**Method 2: Start Menu**
1. Press Windows key
2. Find "Windows PowerShell"
3. **Right-click** it
4. Select **"Run as administrator"**

### Step 2: Run the Setup Script

In the Administrator PowerShell window, type:

```powershell
cd D:\capstone\backend
.\setup-firewall.ps1
```

Press Enter and follow the prompts.

### Step 3: Verify It Worked

```powershell
.\check-status.ps1
```

Should now show:
```
[OK] Firewall rule exists  ← This should be green now!
Status: ALL CHECKS PASSED
```

### Step 4: Test on Phone

1. Open **Worker app** on your phone
2. Login with:
   - Username: `testworker`
   - Password: `test123456`
3. Should work! 🎉

---

## 🚀 Alternative: Manual Fix (If Script Fails)

If you prefer to do it manually:

```powershell
# In Administrator PowerShell:
netsh advfirewall firewall add rule name="Django Development Server" dir=in action=allow protocol=TCP localport=8000 program="D:\capstone\backend\venv\Scripts\python.exe" enable=yes
```

---

## ✅ After Firewall is Fixed

Your setup will be:

```
Phone (192.168.1.X)
    ↓
    WiFi Network
    ↓
Windows Firewall ✅ (allows port 8000)
    ↓
Django Server (192.168.1.4:8000) ✅
    ↓
Database (Supabase) ✅
```

---

## 📋 Quick Checklist

- [ ] Open PowerShell as **Administrator**
- [ ] Navigate to: `cd D:\capstone\backend`
- [ ] Run: `.\setup-firewall.ps1`
- [ ] Follow prompts
- [ ] Verify with: `.\check-status.ps1`
- [ ] Test on phone

---

## ❓ Still Not Working?

Run diagnostic and share output:

```powershell
cd D:\capstone\backend
.\check-status.ps1
```

Common fixes:
1. **Different WiFi?** Make sure phone and PC on same network
2. **Wrong IP?** Update `worker\frontend\config\api.js` with IP from check-status
3. **Server stopped?** Restart with `python manage.py runserver 0.0.0.0:8000`

---

## 🎯 Expected Result

### Before Fix:
```
LOG  Attempting login for: testworker
ERROR  API Request Error: Failed to connect to /192.168.1.4:8000
```

### After Fix:
```
LOG  Attempting login for: testworker
LOG  Login successful: testworker
LOG  Auth data saved successfully
```

---

**DO THIS NOW:** Open PowerShell as Administrator and run the setup script! 🚀
