# 📝 User Profile API - Complete Guide

## ✅ **User Profile System Implemented!**

I've added a complete User Profile system to store additional registration data like Date of Birth, Gender, Aadhaar, and Address.

---

## 🗄️ **Database Schema**

### **UserProfile Table:**
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) UNIQUE,
    date_of_birth DATE,
    gender VARCHAR(10),
    aadhaar_number VARCHAR(12),
    street_address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pin_code VARCHAR(6),
    country VARCHAR(100) DEFAULT 'India',
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(15),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## 🎯 **New API Endpoints**

### **1. Create/Update User Profile**

**Endpoint:** `POST/PUT/PATCH /api/v1/auth/profile/`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "date_of_birth": "1995-05-15",
  "gender": "male",
  "aadhaar_number": "123456789012",
  "street_address": "123 Main Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pin_code": "400001",
  "country": "India",
  "emergency_contact_name": "John Doe",
  "emergency_contact_phone": "9876543210"
}
```

**Methods:**
- `POST` - Create new profile
- `PUT` - Update entire profile (all fields required)
- `PATCH` - Partial update (only send fields to update)

**Response (Success):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "profile": {
    "id": "profile-uuid",
    "user_id": "user-uuid",
    "username": "ram",
    "date_of_birth": "1995-05-15",
    "gender": "male",
    "aadhaar_number": "123456789012",
    "street_address": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pin_code": "400001",
    "country": "India",
    "emergency_contact_name": "John Doe",
    "emergency_contact_phone": "9876543210",
    "full_address": "123 Main Street, Mumbai, Maharashtra, 400001, India",
    "created_at": "2026-08-21T17:50:00Z",
    "updated_at": "2026-08-21T17:50:00Z"
  }
}
```

---

### **2. Get User Profile**

**Endpoint:** `GET /api/v1/auth/profile/`

**Authentication:** Required (Bearer token)

**Response (Success):**
```json
{
  "success": true,
  "profile": {
    "id": "profile-uuid",
    "user_id": "user-uuid",
    "username": "ram",
    "date_of_birth": "1995-05-15",
    "gender": "male",
    "aadhaar_number": "123456789012",
    "street_address": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pin_code": "400001",
    "country": "India",
    "emergency_contact_name": "John Doe",
    "emergency_contact_phone": "9876543210",
    "full_address": "123 Main Street, Mumbai, Maharashtra, 400001, India",
    "created_at": "2026-08-21T17:50:00Z",
    "updated_at": "2026-08-21T17:50:00Z"
  }
}
```

**Response (Not Found):**
```json
{
  "success": false,
  "message": "Profile not found. Please create your profile."
}
```

---

### **3. Get Complete User Data**

**Endpoint:** `GET /api/v1/auth/me/complete/`

**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "username": "ram",
    "email": "ram@gmail.com",
    "phone_number": "0987654321",
    "first_name": "Ram",
    "last_name": "Jadhav",
    "role_name": "customer",
    "role_display": "Customer",
    "is_verified": false,
    "is_phone_verified": false,
    "preferred_language": "en",
    "profile_picture": null,
    "bio": "",
    "is_active": true,
    "profile": {
      "id": "profile-uuid",
      "user_id": "user-uuid",
      "username": "ram",
      "date_of_birth": "1995-05-15",
      "gender": "male",
      "aadhaar_number": "123456789012",
      "street_address": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pin_code": "400001",
      "country": "India",
      "emergency_contact_name": "John Doe",
      "emergency_contact_phone": "9876543210",
      "full_address": "123 Main Street, Mumbai, Maharashtra, 400001, India",
      "created_at": "2026-08-21T17:50:00Z",
      "updated_at": "2026-08-21T17:50:00Z"
    },
    "created_at": "2026-08-21T17:37:03Z",
    "updated_at": "2026-08-21T17:37:03Z"
  }
}
```

---

## 🧪 **Testing with PowerShell**

### **Test 1: Create Profile (After Registration)**

```powershell
# Login first to get access token
$loginBody = @{
    username = "ram"
    password = "test123456"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/login/" -Method Post -Headers @{"Content-Type"="application/json"} -Body $loginBody

$accessToken = $loginResponse.access

# Create profile
$profileBody = @{
    date_of_birth = "1995-05-15"
    gender = "male"
    aadhaar_number = "123456789012"
    street_address = "123 Main Street"
    city = "Mumbai"
    state = "Maharashtra"
    pin_code = "400001"
    country = "India"
    emergency_contact_name = "Sarah Jadhav"
    emergency_contact_phone = "9876543210"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/profile/" -Method Post -Headers @{"Authorization"="Bearer $accessToken"; "Content-Type"="application/json"} -Body $profileBody
```

### **Test 2: Get Profile**

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/profile/" -Method Get -Headers @{"Authorization"="Bearer $accessToken"}
```

### **Test 3: Update Profile (Partial)**

```powershell
$updateBody = @{
    city = "Pune"
    state = "Maharashtra"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/profile/" -Method Patch -Headers @{"Authorization"="Bearer $accessToken"; "Content-Type"="application/json"} -Body $updateBody
```

### **Test 4: Get Complete User Data**

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/me/complete/" -Method Get -Headers @{"Authorization"="Bearer $accessToken"}
```

---

## 📱 **Integration with React Native App**

### **Update Registration Flow:**

After successful registration, immediately save profile data:

```javascript
// In Registerscreen.js, after registration succeeds:

const saveUserProfile = async (accessToken) => {
  try {
    const profileData = {
      date_of_birth: dob, // Format: YYYY-MM-DD
      gender: gender.toLowerCase(),
      aadhaar_number: aadhaar,
      street_address: street,
      city: city,
      state: state,
      pin_code: pinCode,
      country: country
    };
    
    const response = await fetch('http://192.168.1.4:8000/api/v1/auth/profile/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Profile saved successfully');
    }
  } catch (error) {
    console.error('Profile save error:', error);
  }
};

// Call after registration
const response = await register(registrationData);
if (response.tokens) {
  await saveUserProfile(response.tokens.access);
}
```

---

## ✅ **Validation Rules**

### **Aadhaar Number:**
- Must be exactly 12 digits
- Only numeric characters allowed

### **PIN Code:**
- Must be exactly 6 digits
- Only numeric characters allowed

### **Emergency Contact Phone:**
- Must be exactly 10 digits
- Only numeric characters allowed

### **Date of Birth:**
- Format: YYYY-MM-DD
- Example: 1995-05-15

### **Gender:**
- Options: 'male', 'female', 'other'

---

## 🔍 **Field Descriptions**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| date_of_birth | Date | No | User's date of birth |
| gender | String | No | User's gender (male/female/other) |
| aadhaar_number | String(12) | No | 12-digit Aadhaar number |
| street_address | String | No | Street address |
| city | String | No | City name |
| state | String | No | State name |
| pin_code | String(6) | No | 6-digit PIN code |
| country | String | No | Country (default: India) |
| emergency_contact_name | String | No | Emergency contact person name |
| emergency_contact_phone | String(10) | No | Emergency contact phone |

---

## 🎯 **Use Cases**

### **1. Complete Registration Flow:**
```
User Registers
    ↓
Account Created (Basic Info)
    ↓
Profile Created (Additional Info)
    ↓
Complete User Profile
```

### **2. Profile Update Flow:**
```
User Logs In
    ↓
Goes to Profile Settings
    ↓
Updates Address/Details
    ↓
Profile Saved
```

### **3. View Profile Flow:**
```
User Logs In
    ↓
Request Complete User Data
    ↓
Display User Info + Profile
```

---

## 🚀 **Benefits**

1. **Separation of Concerns:**
   - Core user data (username, email, phone) in `users` table
   - Extended data (DOB, address) in `user_profiles` table

2. **Flexible Updates:**
   - Update basic info without touching profile
   - Update profile without touching core data

3. **Optional Fields:**
   - Profile can be created later
   - Users can skip profile during registration
   - Profile can be updated anytime

4. **Full Address Support:**
   - Complete address stored
   - `full_address` computed property for display

---

## 📊 **API Summary**

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/v1/auth/profile/` | GET | ✅ | Get user profile |
| `/api/v1/auth/profile/` | POST | ✅ | Create profile |
| `/api/v1/auth/profile/` | PUT | ✅ | Update profile (full) |
| `/api/v1/auth/profile/` | PATCH | ✅ | Update profile (partial) |
| `/api/v1/auth/me/complete/` | GET | ✅ | Get user + profile |

---

## ✅ **Status**

- ✅ UserProfile model created
- ✅ Migration applied to database
- ✅ Serializers implemented
- ✅ Views created
- ✅ URLs configured
- ✅ Validation added
- ✅ Ready to use!

---

**The User Profile system is production-ready!** 🎉
