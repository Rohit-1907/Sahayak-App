# Testing JWT Authentication - Quick Guide

## 🎯 **Current Status**

✅ Django Backend Running on: `http://192.168.1.4:8000`  
✅ Client App Running in Expo Go  
✅ API Integration Complete  
✅ Login Screen Updated  

---

## 📱 **Test Now!**

### **Step 1: Open the App**
The Sahayak Client app should be open in your Expo Go app on your phone.

### **Step 2: Navigate to Login**
Go to the Login screen in the app.

### **Step 3: Enter Credentials**
Use these test credentials:

**Username:** `testcustomer2`  
**Password:** `test123456`

### **Step 4: Tap Login**
The app will:
1. Show a loading indicator
2. Send request to Django server
3. Display success message if login works
4. Show error message if something fails

---

## ✅ **What Should Happen**

### **Success:**
- You'll see an alert: "Success! Welcome back, Test User!"
- JWT tokens will be saved to device storage
- User data will be stored locally

### **Failure:**
Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| "Network request failed" | Phone not on same WiFi | Connect to same network as computer |
| "Invalid credentials" | Wrong username/password | Use `testcustomer2` / `test123456` |
| "Request failed" | Django not running | Check Django server is running |
| Timeout | Firewall blocking | Allow Python in Windows Firewall |

---

## 🔍 **How to Check if it Worked**

### **1. Check Django Server Logs**
Look at the Django terminal. You should see:
```
[21/Aug/2026 HH:MM:SS] "POST /api/v1/auth/login/ HTTP/1.1" 200
```

The `200` means success!

### **2. Check Expo Logs**
Look at the terminal where `npm start` is running. You'll see console logs from the app.

### **3. Check the App**
- Success alert appears
- No error messages

---

## 🚨 **Troubleshooting**

### **"Network request failed"**

**Check 1: WiFi Connection**
```powershell
# On computer, check IP
ipconfig | Select-String -Pattern "IPv4"
# Should show: 192.168.1.4
```

Your phone must be on the SAME WiFi network!

**Check 2: Django Server**
Open browser and go to:
```
http://192.168.1.4:8000/api/v1/auth/login/
```

Should show: "Method GET not allowed" (that's OK, means it's working!)

**Check 3: Firewall**
1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Find "Python" and allow both Private and Public networks

### **"Invalid credentials"**

Create a new user via PowerShell:
```powershell
$body = @{
    username = "testphone"
    email = "phone@example.com"
    phone_number = "5555555555"
    password = "test123456"
    password_confirm = "test123456"
    first_name = "Phone"
    last_name = "User"
    role = "customer"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/register/" -Method Post -Headers @{"Content-Type"="application/json"} -Body $body
```

Then use:
- **Username:** `testphone`
- **Password:** `test123456`

---

## 📊 **Expected Flow**

```
[Phone App] 
    ↓
  Login Button Pressed
    ↓
  username: "testcustomer2"
  password: "test123456"
    ↓
[API Request to 192.168.1.4:8000]
    ↓
[Django Backend]
    ↓
  Validates credentials
    ↓
  Generates JWT tokens
    ↓
[Response to Phone]
    ↓
  {
    "access": "eyJhbG...",
    "refresh": "eyJhbG...",
    "user": {...}
  }
    ↓
[Phone App]
    ↓
  Stores tokens in AsyncStorage
    ↓
  Shows success alert
    ↓
✅ LOGIN COMPLETE!
```

---

## 🎉 **When It Works**

You're ready to:
1. ✅ Test Registration from app
2. ✅ Test Worker app login
3. ✅ Implement protected screens
4. ✅ Build organization features

---

## 📱 **Quick Test Commands**

### Test from PowerShell (to verify Django is working):
```powershell
# Test Login
$body = @{username="testcustomer2"; password="test123456"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/login/" -Method Post -Headers @{"Content-Type"="application/json"} -Body $body
```

Should return tokens and user data!

---

## 💡 **Tips**

1. **Shake your phone** to open Expo developer menu
2. Select "Reload" if app doesn't update
3. Check "Debug Remote JS" to see console logs on computer
4. Use **testcustomer2** for testing (we know it exists!)

---

**Ready! Try logging in now!** 🚀

Your test credentials:
- Username: `testcustomer2`
- Password: `test123456`
