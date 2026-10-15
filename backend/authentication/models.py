"""
Authentication models for SAHAYAK platform.
Handles user roles, OTP verification, and authentication tokens.
"""
from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid


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


class SahayakUser(AbstractUser):
    """Extended user model for SAHAYAK platform."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone_number = models.CharField(max_length=15, unique=True)
    role = models.ForeignKey(UserRole, on_delete=models.SET_NULL, null=True)
    is_verified = models.BooleanField(default=False)
    is_phone_verified = models.BooleanField(default=False)
    preferred_language = models.CharField(max_length=10, default='en')
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    bio = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        verbose_name = 'SAHAYAK User'
        verbose_name_plural = 'SAHAYAK Users'
        indexes = [
            models.Index(fields=['phone_number']),
            models.Index(fields=['role']),
            models.Index(fields=['is_verified']),
        ]
    
    def __str__(self):
        role_display = str(self.role) if self.role else 'No Role'
        return f"{self.get_full_name() or self.username} ({role_display})"


class OTPVerification(models.Model):
    """Store OTP for phone number verification."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone_number = models.CharField(max_length=15)
    otp_code = models.CharField(max_length=6)
    is_verified = models.BooleanField(default=False)
    attempts = models.IntegerField(default=0)
    max_attempts = models.IntegerField(default=5)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        db_table = 'otp_verifications'
        verbose_name = 'OTP Verification'
        verbose_name_plural = 'OTP Verifications'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"OTP for {self.phone_number}"


class DeviceToken(models.Model):
    """Store device tokens for push notifications."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(SahayakUser, on_delete=models.CASCADE, related_name='device_tokens')
    token = models.TextField(unique=True)
    device_type = models.CharField(max_length=20, choices=[('ios', 'iOS'), ('android', 'Android'), ('web', 'Web')])
    device_name = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    last_used = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'device_tokens'
        verbose_name = 'Device Token'
        verbose_name_plural = 'Device Tokens'
        unique_together = ['user', 'token']
    
    def __str__(self):
        return f"{self.user.username} - {self.device_type}"


class UserProfile(models.Model):
    """Extended profile information for users."""
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(SahayakUser, on_delete=models.CASCADE, related_name='profile')
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, null=True, blank=True)
    aadhaar_number = models.CharField(max_length=12, null=True, blank=True)
    
    # Address fields
    street_address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pin_code = models.CharField(max_length=6, blank=True)
    country = models.CharField(max_length=100, default='India')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f"Profile of {self.user.username}"
    
    @property
    def full_address(self):
        """Return formatted full address."""
        parts = [
            self.street_address,
            self.city,
            self.state,
            self.pin_code,
            self.country
        ]
        return ', '.join(filter(None, parts))
