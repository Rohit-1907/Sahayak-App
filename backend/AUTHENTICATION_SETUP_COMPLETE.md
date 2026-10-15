# ✅ JWT Authentication Setup Complete

All authentication files have been updated and configured!

## 📝 Files Updated

### 1. **authentication/models.py**
- ✅ Updated `UserRole.ROLE_CHOICES` to support organization workflow
- ✅ Added `permissions` JSONField to UserRole
- ✅ Updated role field max_length from 20 to 30

### 2. **authentication/serializers.py**
- ✅ Enhanced `CustomTokenObtainPairSerializer` with organization info
- ✅ Updated `RegisterSerializer` for customer/individual_worker registration
- ✅ Added user info in token response

### 3. **authentication/permissions.py** (NEW)
- ✅ Created `IsCustomer` permission
- ✅ Created `IsIndividualWorker` permission
- ✅ Created `IsOrganizationAdmin` permission
- ✅ Created `IsOrganizationWorker` permission
- ✅ Created `IsAnyWorker` permission
- ✅ Created `IsOrganizationMember` permission

### 4. **authentication/views.py**
- ✅ Enhanced views with `success` response wrapper
- ✅ Added `register_user` function-based view
- ✅ Added `get_current_user` endpoint
- ✅ Added `logout_user` with token blacklist
- ✅ Updated all responses to include `success` field

### 5. **authentication/urls.py**
- ✅ Added `/login/` endpoint
- ✅ Added `/register/` endpoint
- ✅ Added `/me/` endpoint
- ✅ Added `/logout/` endpoint
- ✅ Added `/refresh/` alternate endpoint

### 6. **sahayak_backend/settings.py**
- ✅ Added `AUTH_USER_MODEL = 'authentication.SahayakUser'`
- ✅ Added `rest_framework_simplejwt.token_blacklist` to INSTALLED_APPS
- ✅ Updated CORS to include Expo dev servers (8081, 8082, 19000, 19006)
- ✅ Enhanced JWT configuration with all required settings
- ✅ Added JSON renderer and parser classes

---

## 🚀 Next Steps

### Step 1: Run Migrations

```powershell
cd d:\capstone\backend

# Create migrations for updated models
python manage.py makemigrations

# Apply migrations
python manage.py migrate
```

### Step 2: Create Initial Roles (Optional)

```powershell
# Start Django shell
python manage.py shell

# Create roles
from authentication.models import UserRole

roles = [
    ('customer', 'Customer who requests services'),
    ('individual_worker', 'Independent worker providing services'),
    ('organization_admin', 'Organization leader who manages workers'),
    ('organization_worker', 'Worker belonging to an organization'),
    ('admin', 'Platform administrator'),
]

for role_name, description in roles:
    UserRole.objects.get_or_create(
        role=role_name,
        defaults={'description': description}
    )

print("Roles created successfully!")
```

### Step 3: Create Superuser (Optional)

```powershell
python manage.py createsuperuser
```

### Step 4: Start Development Server

```powershell
python manage.py runserver
```

---

## 🧪 Testing the API

### 1. Register a Customer

```powershell
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "phone_number": "1234567890",
    "password": "securepass123",
    "password_confirm": "securepass123",
    "first_name": "John",
    "last_name": "Doe",
    "role": "customer"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "uuid-here",
    "username": "johndoe",
    "email": "john@example.com",
    "phone_number": "1234567890",
    "role_name": "customer",
    "role_display": "Customer",
    "is_verified": false
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

### 2. Login

```powershell
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securepass123"
  }'
```

**Expected Response:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "uuid-here",
    "username": "johndoe",
    "email": "john@example.com",
    "phone_number": "1234567890",
    "full_name": "John Doe",
    "role": "customer",
    "role_display": "Customer",
    "is_verified": false,
    "profile_picture": null
  }
}
```

### 3. Get Current User

```powershell
curl -X GET http://localhost:8000/api/auth/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "username": "johndoe",
    "email": "john@example.com",
    "phone_number": "1234567890",
    "role_name": "customer",
    "role_display": "Customer",
    ...
  }
}
```

### 4. Refresh Token

```powershell
curl -X POST http://localhost:8000/api/auth/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "YOUR_REFRESH_TOKEN"
  }'
```

### 5. Logout

```powershell
curl -X POST http://localhost:8000/api/auth/logout/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'
```

---

## 📋 API Endpoints Summary

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/auth/register/` | POST | No | Register new user |
| `/api/auth/login/` | POST | No | Login and get tokens |
| `/api/auth/refresh/` | POST | No | Refresh access token |
| `/api/auth/me/` | GET | Yes | Get current user |
| `/api/auth/logout/` | POST | Yes | Logout and blacklist token |
| `/api/auth/profile/me/` | GET | Yes | Get detailed profile |
| `/api/auth/profile/update_profile/` | PUT/PATCH | Yes | Update profile |
| `/api/auth/profile/change_password/` | POST | Yes | Change password |
| `/api/auth/otp/request_otp/` | POST | No | Request OTP |
| `/api/auth/otp/verify_otp/` | POST | No | Verify OTP |

---

## 🔐 Using Permissions in Views

### Example 1: Customer-only endpoint

```python
from rest_framework.decorators import api_view, permission_classes
from authentication.permissions import IsCustomer

@api_view(['GET'])
@permission_classes([IsCustomer])
def customer_dashboard(request):
    return Response({'message': 'Welcome, customer!'})
```

### Example 2: Organization Admin-only endpoint

```python
from authentication.permissions import IsOrganizationAdmin

@api_view(['POST'])
@permission_classes([IsOrganizationAdmin])
def add_worker(request):
    # Only organization admins can add workers
    return Response({'message': 'Worker added'})
```

### Example 3: Any worker (individual or organization)

```python
from authentication.permissions import IsAnyWorker

@api_view(['GET'])
@permission_classes([IsAnyWorker])
def worker_jobs(request):
    # Both individual workers and organization workers can access
    return Response({'jobs': []})
```

---

## 📱 React Native Integration

### Store Tokens

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const storeTokens = async (accessToken, refreshToken, user) => {
  await AsyncStorage.setItem('accessToken', accessToken);
  await AsyncStorage.setItem('refreshToken', refreshToken);
  await AsyncStorage.setItem('user', JSON.stringify(user));
};
```

### Make Authenticated Request

```javascript
const apiRequest = async (url, method = 'GET', body = null) => {
  const token = await AsyncStorage.getItem('accessToken');
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  const data = await response.json();
  
  return data;
};
```

### Login Example

```javascript
const login = async (username, password) => {
  try {
    const response = await fetch('http://YOUR_IP:8000/api/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (data.access) {
      await storeTokens(data.access, data.refresh, data.user);
      return { success: true, user: data.user };
    }
    
    return { success: false, error: 'Login failed' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

---

## ✅ Checklist

- [x] Updated UserRole model with new role choices
- [x] Enhanced JWT serializers with organization info
- [x] Created role-based permission classes
- [x] Updated authentication views
- [x] Updated URL patterns
- [x] Configured Django settings for JWT
- [x] Added token blacklist support
- [x] Updated CORS for Expo apps
- [ ] Run migrations
- [ ] Create initial user roles
- [ ] Test registration endpoint
- [ ] Test login endpoint
- [ ] Test protected endpoints
- [ ] Integrate with React Native apps

---

## 🎯 What's Next

After completing migrations and testing, you can:

1. **Implement Organization Management** - Create organization registration, worker management
2. **Implement Work Request System** - Handle work requests from customers
3. **Implement Worker Assignment** - Allow organization admins to assign workers
4. **Implement Progress Tracking** - Track worker progress on assigned work

---

**Authentication is now ready! Run the migrations and start testing! 🚀**
