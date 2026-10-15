# JWT Authentication Setup Guide for SAHAYAK Backend

## Overview

This guide explains how to implement JWT (JSON Web Token) authentication for the SAHAYAK platform with support for:

1. **CUSTOMER** - Client app users
2. **INDIVIDUAL_WORKER** - Independent workers
3. **ORGANIZATION_ADMIN** - Organization leaders who manage workers
4. **ORGANIZATION_WORKER** - Workers belonging to an organization

---

## Step 1: Update User Roles

### Update `authentication/models.py`:

```python
class UserRole(models.Model):
    """Define user roles in the platform."""
    ROLE_CHOICES = [
        ('customer', 'Customer'),
        ('individual_worker', 'Individual Worker'),
        ('organization_admin', 'Organization Admin'),
        ('organization_worker', 'Organization Worker'),
        ('admin', 'Platform Administrator'),
    ]
    
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, unique=True)
    description = models.TextField(blank=True)
    permissions = models.JSONField(default=dict, blank=True)  # Store role-specific permissions
    
    class Meta:
        db_table = 'user_roles'
        verbose_name = 'User Role'
        verbose_name_plural = 'User Roles'
    
    def __str__(self):
        return self.get_role_display()
```

---

## Step 2: Configure Django Settings

### Update `sahayak_backend/settings.py`:

```python
from datetime import timedelta

# Add to INSTALLED_APPS
INSTALLED_APPS = [
    # ...existing apps...
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'authentication',
    'organization',
    'users',
    # ...other apps...
]

# REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ],
    'EXCEPTION_HANDLER': 'authentication.utils.custom_exception_handler',
}

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),  # Access token valid for 24 hours
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),   # Refresh token valid for 7 days
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    
    'JTI_CLAIM': 'jti',
    
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(hours=24),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=7),
}

# Custom user model
AUTH_USER_MODEL = 'authentication.SahayakUser'

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8081",
    "http://192.168.1.4:8081",
    "http://localhost:19000",
    "http://localhost:19006",
]
CORS_ALLOW_CREDENTIALS = True
```

---

## Step 3: Create Custom JWT Serializers

### Create `authentication/serializers.py`:

```python
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import SahayakUser, UserRole


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer that includes user role and permissions."""
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add custom claims
        data['user'] = {
            'id': str(self.user.id),
            'username': self.user.username,
            'email': self.user.email,
            'phone_number': self.user.phone_number,
            'full_name': self.user.get_full_name(),
            'role': self.user.role.role if self.user.role else None,
            'role_display': self.user.role.get_role_display() if self.user.role else None,
            'is_verified': self.user.is_verified,
            'profile_picture': self.user.profile_picture.url if self.user.profile_picture else None,
        }
        
        # Add organization info for organization users
        if self.user.role and self.user.role.role in ['organization_admin', 'organization_worker']:
            try:
                from organization.models import Organization, OrganizationMember
                
                if self.user.role.role == 'organization_admin':
                    org = Organization.objects.filter(admin=self.user).first()
                    if org:
                        data['user']['organization'] = {
                            'id': str(org.id),
                            'name': org.name,
                            'role': 'admin'
                        }
                else:  # organization_worker
                    member = OrganizationMember.objects.filter(worker=self.user).first()
                    if member:
                        data['user']['organization'] = {
                            'id': str(member.organization.id),
                            'name': member.organization.name,
                            'role': 'worker'
                        }
            except ImportError:
                pass
        
        return data
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims to token
        token['username'] = user.username
        token['role'] = user.role.role if user.role else None
        token['phone_number'] = user.phone_number
        
        return token


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=['customer', 'individual_worker'])
    
    class Meta:
        model = SahayakUser
        fields = [
            'username', 'email', 'phone_number', 'password', 
            'password_confirm', 'first_name', 'last_name', 'role'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        role_name = validated_data.pop('role')
        password = validated_data.pop('password')
        
        # Get or create role
        role, _ = UserRole.objects.get_or_create(role=role_name)
        
        # Create user
        user = SahayakUser.objects.create_user(
            password=password,
            role=role,
            **validated_data
        )
        
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user details."""
    role = serializers.SerializerMethodField()
    role_display = serializers.SerializerMethodField()
    
    class Meta:
        model = SahayakUser
        fields = [
            'id', 'username', 'email', 'phone_number', 'first_name', 
            'last_name', 'role', 'role_display', 'is_verified', 
            'profile_picture', 'bio', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_role(self, obj):
        return obj.role.role if obj.role else None
    
    def get_role_display(self, obj):
        return obj.role.get_role_display() if obj.role else None
```

---

## Step 4: Create Authentication Views

### Create `authentication/views.py`:

```python
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .serializers import (
    CustomTokenObtainPairSerializer,
    UserRegistrationSerializer,
    UserSerializer
)

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom login view that returns JWT tokens with user info."""
    serializer_class = CustomTokenObtainPairSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user (customer or individual worker)."""
    serializer = UserRegistrationSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'success': True,
            'message': 'User registered successfully',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """Get current authenticated user details."""
    serializer = UserSerializer(request.user)
    return Response({
        'success': True,
        'user': serializer.data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """Logout user by blacklisting refresh token."""
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response({
            'success': True,
            'message': 'Logged out successfully'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change user password."""
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not user.check_password(old_password):
        return Response({
            'success': False,
            'message': 'Old password is incorrect'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user.set_password(new_password)
    user.save()
    
    return Response({
        'success': True,
        'message': 'Password changed successfully'
    }, status=status.HTTP_200_OK)
```

---

## Step 5: Create Permission Classes

### Create `authentication/permissions.py`:

```python
from rest_framework import permissions


class IsCustomer(permissions.BasePermission):
    """Allow access only to customers."""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role and 
            request.user.role.role == 'customer'
        )


class IsIndividualWorker(permissions.BasePermission):
    """Allow access only to individual workers."""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role and 
            request.user.role.role == 'individual_worker'
        )


class IsOrganizationAdmin(permissions.BasePermission):
    """Allow access only to organization admins."""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role and 
            request.user.role.role == 'organization_admin'
        )


class IsOrganizationWorker(permissions.BasePermission):
    """Allow access only to organization workers."""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role and 
            request.user.role.role == 'organization_worker'
        )


class IsAnyWorker(permissions.BasePermission):
    """Allow access to both individual workers and organization workers."""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role and 
            request.user.role.role in ['individual_worker', 'organization_worker']
        )


class IsOrganizationMember(permissions.BasePermission):
    """Allow access to organization admins and workers."""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role and 
            request.user.role.role in ['organization_admin', 'organization_worker']
        )
```

---

## Step 6: Create URL Routes

### Create `authentication/urls.py`:

```python
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication endpoints
    path('login/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.register_user, name='register'),
    path('logout/', views.logout_user, name='logout'),
    
    # User endpoints
    path('me/', views.get_current_user, name='current_user'),
    path('change-password/', views.change_password, name='change_password'),
]
```

### Include in main `sahayak_backend/urls.py`:

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/organization/', include('organization.urls')),
    path('api/users/', include('users.urls')),
    # ...other apps...
]
```

---

## Step 7: Run Migrations

```powershell
cd d:\capstone\backend

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser
```

---

## Step 8: Test JWT Authentication

### 1. Register a new user:

```powershell
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "phone_number": "1234567890",
    "password": "test123456",
    "password_confirm": "test123456",
    "first_name": "Test",
    "last_name": "User",
    "role": "customer"
  }'
```

### 2. Login:

```powershell
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "test123456"
  }'
```

Response:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "uuid",
    "username": "testuser",
    "email": "test@example.com",
    "role": "customer",
    "role_display": "Customer"
  }
}
```

### 3. Access protected endpoint:

```powershell
curl -X GET http://localhost:8000/api/auth/me/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
```

---

## Step 9: Using JWT in React Native

### Store tokens:

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// After login
const storeTokens = async (accessToken, refreshToken) => {
  await AsyncStorage.setItem('accessToken', accessToken);
  await AsyncStorage.setItem('refreshToken', refreshToken);
};

// Get token
const getAccessToken = async () => {
  return await AsyncStorage.getItem('accessToken');
};

// Remove tokens (logout)
const removeTokens = async () => {
  await AsyncStorage.removeItem('accessToken');
  await AsyncStorage.removeItem('refreshToken');
};
```

### Make authenticated requests:

```javascript
const makeAuthenticatedRequest = async (url, method = 'GET', body = null) => {
  const token = await getAccessToken();
  
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
  return response.json();
};
```

---

## Summary

✅ JWT authentication configured
✅ Four user roles supported (customer, individual_worker, organization_admin, organization_worker)
✅ Custom permission classes for role-based access control
✅ Token-based authentication with refresh tokens
✅ Secure password hashing
✅ Ready for React Native integration

---

## Next Steps

1. Run migrations to create database tables
2. Test authentication endpoints
3. Implement organization management system
4. Create API endpoints for worker assignment
5. Add progress tracking
