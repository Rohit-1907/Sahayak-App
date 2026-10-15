# Google OAuth Setup Guide

## ✅ Implementation Complete!

"Continue with Google" authentication is now fully implemented for both **Client** and **Worker** apps.

---

## 🎯 What Was Implemented

### **Frontend (Both Apps)**
- ✅ **expo-auth-session** & **expo-web-browser** installed
- ✅ Google OAuth service created (`google-auth.service.js`)
- ✅ Login screens updated with functional Google button
- ✅ Loading states & error handling
- ✅ User type validation (customer vs worker)
- ✅ Automatic token storage in AsyncStorage

### **Backend**
- ✅ Google OAuth endpoint: `/api/v1/authentication/google-auth/`
- ✅ Google auth libraries installed (google-auth, google-auth-oauthlib)
- ✅ Auto-create user if doesn't exist
- ✅ Create CustomerProfile or WorkerProfile based on user_type
- ✅ JWT token generation
- ✅ Role-based access control

---

## 🔧 Setup Required (Google Cloud Console)

To make Google Sign-In work, you need to configure Google Cloud Console:

### **Step 1: Create Google Cloud Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Name: "Sahayak" or similar

### **Step 2: Enable Google+ API**

1. Go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click **Enable**

### **Step 3: Create OAuth 2.0 Credentials**

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Configure OAuth consent screen if prompted:
   - User Type: **External**
   - App name: **Sahayak**
   - User support email: your email
   - Developer contact: your email

### **Step 4: Create Client IDs**

You need to create **4 different Client IDs**:

#### **A. Web Application**
- Application type: **Web application**
- Name: `Sahayak Web`
- Authorized redirect URIs: `https://localhost:8000/callback`
- Copy the **Client ID** → This is your `WEB_CLIENT_ID`

#### **B. Android**
- Application type: **Android**
- Name: `Sahayak Android`
- Package name: `com.sahayakclient` (for client) and `com.sahayakworker` (for worker)
- SHA-1 certificate fingerprint:
  ```bash
  # Get SHA-1 for development:
  cd d:/capstone/client/frontend/android
  keytool -keystore app/debug.keystore -list -v
  # Password: android
  ```
- Copy the **Client ID** → This is your `ANDROID_CLIENT_ID`

#### **C. iOS**
- Application type: **iOS**
- Name: `Sahayak iOS`
- Bundle ID: `com.sahayakclient` (for client) and `com.sahayakworker` (for worker)
- Copy the **Client ID** → This is your `IOS_CLIENT_ID`

#### **D. Expo**
- Use the **Web Application** Client ID for Expo
- Copy the **Client ID** → This is your `EXPO_CLIENT_ID`

---

## 📝 Configuration Files

### **1. Update Client App** (`client/frontend/services/google-auth.service.js`)

Replace the placeholder values:

```javascript
export const GOOGLE_CONFIG = {
  expoClientId: 'YOUR_ACTUAL_EXPO_CLIENT_ID.apps.googleusercontent.com',
  iosClientId: 'YOUR_ACTUAL_IOS_CLIENT_ID.apps.googleusercontent.com',
  androidClientId: 'YOUR_ACTUAL_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  webClientId: 'YOUR_ACTUAL_WEB_CLIENT_ID.apps.googleusercontent.com',
};
```

### **2. Update Worker App** (`worker/frontend/services/google-auth.service.js`)

Same as above - replace placeholder values.

### **3. Update Backend Environment Variables** (`.env` file)

```bash
# Google OAuth Configuration (Optional - for token verification)
GOOGLE_ANDROID_CLIENT_ID=your_android_client_id.apps.googleusercontent.com
GOOGLE_IOS_CLIENT_ID=your_ios_client_id.apps.googleusercontent.com
GOOGLE_WEB_CLIENT_ID=your_web_client_id.apps.googleusercontent.com
GOOGLE_EXPO_CLIENT_ID=your_expo_client_id.apps.googleusercontent.com
```

**Note:** Backend verification is optional. The backend currently works without it for development.

---

## 🚀 How It Works

### **Complete Flow:**

```
1. User clicks "Continue with Google"
   ↓
2. Google OAuth consent screen opens
   ↓
3. User selects Google account & approves
   ↓
4. Google returns access token to app
   ↓
5. App fetches user info from Google API:
   - Email
   - First Name
   - Last Name
   - Google ID
   - Profile Picture
   ↓
6. App sends data to backend:
   POST /api/v1/authentication/google-auth/
   Body: {
     token, user_type, email, first_name,
     last_name, google_id, picture
   }
   ↓
7. Backend checks if user exists:
   
   IF USER EXISTS:
   - Verify user type matches (customer/worker)
   - Generate JWT tokens
   - Return user data
   
   IF NEW USER:
   - Create User account
   - Create CustomerProfile or WorkerProfile
   - Generate JWT tokens
   - Return user data
   ↓
8. App stores tokens in AsyncStorage
   ↓
9. User logged in! ✅
```

---

## 🧪 Testing (Development Mode)

**Without Google Cloud Setup:**

The implementation will work but show an error. To test:

1. Update `GOOGLE_CONFIG` with dummy values
2. The Google button will be visible
3. Clicking will show "Failed to start Google sign-in"

**With Google Cloud Setup:**

1. Configure Google Cloud Console
2. Update `GOOGLE_CONFIG` with real Client IDs
3. Click "Continue with Google"
4. Select Google account
5. Should successfully log in! ✅

---

## 📱 App-Specific Behavior

### **Client App:**
- Sets `user_type: 'customer'`
- Creates `CustomerProfile` if new user
- Rejects if user is a worker

### **Worker App:**
- Sets `user_type: 'worker'`
- Creates `WorkerProfile` if new user
- Rejects if user is a customer

---

## 🔐 Security Features

- ✅ JWT token-based authentication
- ✅ Google token validation (configurable)
- ✅ Role-based access control
- ✅ Secure token storage (AsyncStorage)
- ✅ Unusable password for OAuth users (password-less)

---

## 📦 API Endpoint

```
POST /api/v1/authentication/google-auth/

Headers:
  Content-Type: application/json

Body:
{
  "token": "google_access_token",
  "user_type": "customer",  // or "worker"
  "email": "user@gmail.com",
  "first_name": "John",
  "last_name": "Doe",
  "google_id": "1234567890",
  "picture": "https://..."
}

Response (200):
{
  "success": true,
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token",
  "user": {
    "id": "uuid",
    "username": "john_google",
    "email": "user@gmail.com",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "profile_picture": "https://...",
    "role": "customer",
    "role_name": "Customer"
  },
  "message": "Google authentication successful"
}
```

---

## 🐛 Troubleshooting

### **Error: "Failed to start Google sign-in"**
- **Cause:** Google Client IDs not configured
- **Fix:** Update `GOOGLE_CONFIG` with real Client IDs from Google Cloud Console

### **Error: "Invalid Google token"**
- **Cause:** Token verification failed
- **Fix:** Ensure Client IDs in backend `.env` match frontend config

### **Error: "This account is not a customer/worker account"**
- **Cause:** User exists with different role
- **Fix:** User should use correct app (customer app vs worker app)

### **Button is disabled**
- **Cause:** OAuth request not initialized
- **Fix:** Check console logs for errors, verify expo-auth-session is installed

---

## ✅ Files Modified/Created

**Client App:**
1. ✅ `services/google-auth.service.js` (NEW)
2. ✅ `screens/Loginscreen.js` (UPDATED)
3. ✅ `package.json` (expo-auth-session added)

**Worker App:**
4. ✅ `services/google-auth.service.js` (NEW)
5. ✅ `screen/login.js` (UPDATED)
6. ✅ `package.json` (expo-auth-session added)

**Backend:**
7. ✅ `authentication/google_auth.py` (NEW)
8. ✅ `authentication/urls.py` (UPDATED)
9. ✅ Google libraries installed (pip)

---

## 🎉 Ready to Use!

Once you configure Google Cloud Console and update the Client IDs, the "Continue with Google" button will be fully functional in both apps!

**Quick Start:**
1. Get Google Cloud credentials
2. Update `GOOGLE_CONFIG` in both apps
3. Test the Google button
4. Users can now sign in with Google! 🚀

---

## 📞 Support

If you encounter issues:
1. Check console logs for detailed error messages
2. Verify Google Cloud Console configuration
3. Ensure redirect URIs match Expo configuration
4. Test with a real Gmail account

---

**Implementation Status:** ✅ **COMPLETE & READY FOR CONFIGURATION**
