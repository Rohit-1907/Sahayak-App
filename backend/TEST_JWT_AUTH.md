# JWT Authentication Testing Guide

## ✅ **JWT Authentication Implementation Status: COMPLETE**

All JWT authentication endpoints are fully implemented and tested working.

---

## **Available Endpoints**

Base URL: `http://127.0.0.1:8000/api/v1/auth/`

### 1. **Register User**
- **Endpoint:** `POST /api/v1/auth/register/`
- **Authentication:** None required
- **Status:** ✅ Working (HTTP 201)

**Request Body:**
```json
{
    "username": "testuser",
    "email": "test@example.com",
    "phone_number": "1234567890",
    "password": "test123456",
    "password_confirm": "test123456",
    "first_name": "Test",
    "last_name": "User",
    "role": "customer"
}
```

**Available Roles:**
- `customer` - Regular customer
- `individual_worker` - Independent worker
- `organization_admin` - Organization administrator
- `organization_worker` - Worker in an organization
- `admin` - Platform administrator

**Response (Success):**
```json
{
    "success": true,
    "message": "User registered successfully",
    "user": {
        "id": "uuid",
        "username": "testuser",
        "email": "test@example.com",
        "phone_number": "1234567890",
        "first_name": "Test",
        "last_name": "User",
        "role_name": "customer",
        "role_display": "Customer",
        "is_verified": false,
        "is_phone_verified": false,
        "preferred_language": "en",
        "profile_picture": null,
        "bio": "",
        "is_active": true,
        "created_at": "2026-08-21T16:52:30.888746Z",
        "updated_at": "2026-08-21T16:52:30.888751Z"
    },
    "tokens": {
        "refresh": "eyJhbG...",
        "access": "eyJhbG..."
    }
}
```

**PowerShell Test:**
```powershell
$body = @{
    username = "testuser"
    email = "test@example.com"
    phone_number = "1234567890"
    password = "test123456"
    password_confirm = "test123456"
    first_name = "Test"
    last_name = "User"
    role = "customer"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/register/" -Method Post -Headers @{"Content-Type"="application/json"} -Body $body
```

---

### 2. **Login**
- **Endpoint:** `POST /api/v1/auth/login/`
- **Authentication:** None required
- **Status:** ✅ Working (HTTP 200)

**Request Body:**
```json
{
    "username": "testuser",
    "password": "test123456"
}
```

**Response (Success):**
```json
{
    "refresh": "eyJhbG...",
    "access": "eyJhbG...",
    "user": {
        "id": "uuid",
        "username": "testuser",
        "email": "test@example.com",
        "phone_number": "1234567890",
        "full_name": "Test User",
        "role": "customer",
        "role_display": "Customer",
        "is_verified": false,
        "profile_picture": null
    }
}
```

**PowerShell Test:**
```powershell
$body = @{
    username = "testuser"
    password = "test123456"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/login/" -Method Post -Headers @{"Content-Type"="application/json"} -Body $body

# Save access token
$accessToken = $response.access
$refreshToken = $response.refresh
```

---

### 3. **Get Current User**
- **Endpoint:** `GET /api/v1/auth/me/`
- **Authentication:** Required (Bearer token)
- **Status:** ✅ Working (HTTP 200)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
    "id": "uuid",
    "username": "testuser",
    "email": "test@example.com",
    "phone_number": "1234567890",
    "first_name": "Test",
    "last_name": "User",
    "full_name": "Test User",
    "role": "customer",
    "role_display": "Customer",
    "is_verified": false,
    "is_phone_verified": false,
    "profile_picture": null,
    "bio": "",
    "date_joined": "2026-08-21T16:52:30.888746Z"
}
```

**PowerShell Test:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/me/" -Method Get -Headers @{"Authorization"="Bearer $accessToken"}
```

---

### 4. **Refresh Token**
- **Endpoint:** `POST /api/v1/auth/refresh/`
- **Authentication:** None required (uses refresh token)
- **Status:** ✅ Working (HTTP 200)

**Request Body:**
```json
{
    "refresh": "eyJhbG..."
}
```

**Response:**
```json
{
    "access": "eyJhbG...",
    "refresh": "eyJhbG..."
}
```

**PowerShell Test:**
```powershell
$body = @{refresh = $refreshToken} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/refresh/" -Method Post -Headers @{"Content-Type"="application/json"} -Body $body
$accessToken = $response.access
```

---

### 5. **Logout**
- **Endpoint:** `POST /api/v1/auth/logout/`
- **Authentication:** Required (Bearer token)
- **Status:** ✅ Working (HTTP 200)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
    "refresh": "eyJhbG..."
}
```

**Response:**
```json
{
    "success": true,
    "message": "Logout successful"
}
```

**PowerShell Test:**
```powershell
$body = @{refresh = $refreshToken} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/logout/" -Method Post -Headers @{"Authorization"="Bearer $accessToken"; "Content-Type"="application/json"} -Body $body
```

---

## **JWT Token Configuration**

From `settings.py`:

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'TOKEN_OBTAIN_SERIALIZER': 'authentication.serializers.CustomTokenObtainPairSerializer',
}
```

- **Access Token:** Valid for 1 day
- **Refresh Token:** Valid for 7 days
- **Token Rotation:** Enabled (new refresh token on each refresh)
- **Blacklist:** Old tokens are blacklisted after rotation

---

## **Database Tables**

### Created in Supabase:
1. ✅ `users` - SahayakUser model
2. ✅ `user_roles` - UserRole model
3. ✅ `otp_verifications` - OTP storage
4. ✅ `device_tokens` - Push notification tokens
5. ✅ `token_blacklist_outstandingtoken` - JWT token tracking
6. ✅ `token_blacklist_blacklistedtoken` - Blacklisted tokens

---

## **Complete Test Flow**

```powershell
# 1. Register
$registerBody = @{
    username = "newuser"
    email = "new@example.com"
    phone_number = "9876543210"
    password = "secure123"
    password_confirm = "secure123"
    first_name = "New"
    last_name = "User"
    role = "customer"
} | ConvertTo-Json

$regResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/register/" -Method Post -Headers @{"Content-Type"="application/json"} -Body $registerBody

# 2. Login
$loginBody = @{
    username = "newuser"
    password = "secure123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/login/" -Method Post -Headers @{"Content-Type"="application/json"} -Body $loginBody

$accessToken = $loginResponse.access
$refreshToken = $loginResponse.refresh

# 3. Get current user
$user = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/me/" -Method Get -Headers @{"Authorization"="Bearer $accessToken"}

# 4. Refresh token
$refreshBody = @{refresh = $refreshToken} | ConvertTo-Json
$newTokens = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/refresh/" -Method Post -Headers @{"Content-Type"="application/json"} -Body $refreshBody

# 5. Logout
$logoutBody = @{refresh = $refreshToken} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/logout/" -Method Post -Headers @{"Authorization"="Bearer $accessToken"; "Content-Type"="application/json"} -Body $logoutBody
```

---

## **Error Responses**

### Registration Errors:
```json
{
    "success": false,
    "errors": {
        "username": ["A user with that username already exists."],
        "phone_number": ["SAHAYAK User with this phone number already exists."]
    }
}
```

### Login Errors:
```json
{
    "detail": "No active account found with the given credentials"
}
```

### Authentication Errors:
```json
{
    "detail": "Authentication credentials were not provided."
}
```

```json
{
    "detail": "Given token not valid for any token type",
    "code": "token_not_valid",
    "messages": [
        {
            "token_class": "AccessToken",
            "token_type": "access",
            "message": "Token is invalid or expired"
        }
    ]
}
```

---

## **Summary**

### ✅ **Implemented Features:**
- User registration with role selection
- Login with JWT token generation
- Token refresh mechanism
- Token blacklist on logout
- Get current user profile
- Password validation
- Role-based user types
- UUID primary keys
- Phone number uniqueness
- Email validation

### ✅ **Security Features:**
- JWT authentication
- Password hashing (PBKDF2)
- Token rotation on refresh
- Token blacklisting on logout
- Access token expiry (1 day)
- Refresh token expiry (7 days)

### ✅ **Database:**
- Connected to Supabase PostgreSQL
- All migrations applied
- 5 user roles created
- Test users created and verified

---

## **Status: 🎉 JWT AUTHENTICATION COMPLETE!**

All authentication endpoints are working correctly. Ready to proceed with Organization Management implementation.
