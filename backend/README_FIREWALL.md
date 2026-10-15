# 🔥 Firewall Setup for Mobile Development

## 🚨 Problem

Mobile apps cannot connect to Django server:
```
ERROR: Failed to connect to /192.168.1.4:8000
```

## ✅ Solution

Windows Firewall is blocking incoming connections. You need to create a firewall rule.

---

## 📋 Quick Steps

### 1. Check Current Status

```powershell
cd D:\capstone\backend
.\check-status.ps1
```

### 2. If Firewall Rule is Missing

**Run PowerShell as Administrator:**

1. Right-click **PowerShell**
2. Select **"Run as Administrator"**
3. Run:

```powershell
cd D:\capstone\backend
.\setup-firewall.ps1
```

### 3. Follow the Script Instructions

The script will:
- ✅ Check if Python exists
- ✅ Create firewall rule for port 8000
- ✅ Show your IP addresses
- ✅ Verify server status
- ✅ Test API connectivity

### 4. Done!

Your mobile apps should now be able to connect! 🎉

---

## 🔍 Manual Method (Alternative)

If you prefer to do it manually:

```powershell
# Run as Administrator
netsh advfirewall firewall add rule name="Django Development Server" dir=in action=allow protocol=TCP localport=8000 program="D:\capstone\backend\venv\Scripts\python.exe" enable=yes
```

---

## 📱 Update Mobile Apps

After firewall is configured, make sure your mobile apps use the correct IP:

**Files to check:**
- `d:\capstone\client\frontend\config\api.js`
- `d:\capstone\worker\frontend\config\api.js`

```javascript
export const API_BASE_URL = 'http://192.168.1.4:8000';  // Use your IP here
```

---

## 🎯 Verify Everything Works

```powershell
cd D:\capstone\backend
.\check-status.ps1
```

Should show:
```
✅ Server is RUNNING on 0.0.0.0:8000
✅ Accepting network connections
✅ Firewall rule exists
✅ API responding
```

---

## 📖 Full Documentation

See: `d:\capstone\NETWORK_SETUP_GUIDE.md` for complete troubleshooting guide.

---

**Need Help?**

Run the diagnostic script:
```powershell
.\check-status.ps1
```

It will tell you exactly what's wrong and how to fix it!
