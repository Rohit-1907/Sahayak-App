# Testing JWT Authentication in React Native App

## ✅ Setup Complete

### **Installed:**
- ✅ `@react-native-async-storage/async-storage` - for token storage

### **Created Files:**
- ✅ `config/api.js` - API configuration with your IP (192.168.1.4)
- ✅ `services/auth.service.js` - Authentication service functions
- ✅ `screens/Loginscreen.js` - Updated with API integration

---

## 🎯 How to Test

### **1. Start Django Server**
Make sure Django is running:
```powershell
cd d:\capstone\backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

Server should be running on: `http://127.0.0.1:8000`

### **2. Start Client App**
The client app is already running on Expo Go!

### **3. Test Login**

#### **Option A: Test with Existing User**
Use the user we created earlier:
- **Username:** `testcustomer2`
- **Password:** `test123456`

#### **Option B: Create New Test User via PowerShell**
```powershell
$body = @{
    username = "mobilecustomer"
    email = "mobile@example.com"
    phone_number = "9876543210"
    password = "test123456"
    password_confirm = "test123456"
    first_name = "Mobile"
    last_name = "Customer"
    role = "customer"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/register/" -Method Post -Headers @{"Content-Type"="application/json"} -Body $body
```

### **4. Login in the App**
1. Open the Sahayak Client app in Expo Go
2. Navigate to Login screen
3. Enter:
   - **Email/Username:** `testcustomer2` (or `mobilecustomer`)
   - **Password:** `test123456`
4. Tap **Login** button
5. You should see a success message!

---

## 🔍 What Happens When You Login

1. App sends username + password to Django
2. Django validates credentials
3. Django returns:
   - Access token (valid for 1 day)
   - Refresh token (valid for 7 days)
   - User profile data
4. App stores tokens in AsyncStorage
5. App displays success message

---

## 📱 Network Requirements

### **IMPORTANT: Both devices must be on the same WiFi network!**

- **Your Computer IP:** 192.168.1.4
- **Django Server:** http://192.168.1.4:8000
- **Mobile Device:** Must be connected to same WiFi

### **If Login Fails:**

1. **Check WiFi Connection**
   - Computer and phone on same network?
   
2. **Check Django Server**
   - Is it running?
   - Try: `http://192.168.1.4:8000/api/v1/auth/login/` in browser

3. **Check IP Address**
   - Run: `ipconfig` in PowerShell
   - Update `config/api.js` if IP changed

4. **Check Firewall**
   - Windows Firewall might block port 8000
   - Allow Python through firewall

---

## 🐛 Debugging

### **View API Calls in App**
Check the console output in your terminal where `npm start` is running.

### **View Server Logs**
Check the Django server terminal for incoming requests:
```
[21/Aug/2026 22:22:42] "POST /api/v1/auth/login/ HTTP/1.1" 200
```

### **Common Errors:**

#### **"Network request failed"**
- Phone not on same WiFi
- Firewall blocking port 8000
- Wrong IP address in config/api.js

#### **"Invalid credentials"**
- Wrong username or password
- User doesn't exist in database

#### **"Request failed"**
- Django server not running
- Wrong API endpoint URL

---

## 📋 Next Steps

Once login works:
1. ✅ Test registration from the app
2. ✅ Test with Worker app
3. ✅ Implement protected routes
4. ✅ Implement organization management

---

## 🎯 Test Credentials

| Username | Password | Role | Status |
|----------|----------|------|--------|
| testcustomer | test123456 | customer | ✅ Created |
| testcustomer2 | test123456 | customer | ✅ Created |
| mobilecustomer | test123456 | customer | Create if needed |

---

## 🔧 Configuration Files

### `config/api.js`
```javascript
export const API_BASE_URL = 'http://192.168.1.4:8000';
```

**Change IP if needed!**

### Check Your IP:
```powershell
ipconfig | Select-String -Pattern "IPv4"
```

---

**Ready to test!** Open the app and try logging in! 🚀
