"""
Admin configuration for authentication app.
"""
from django.contrib import admin
from .models import SahayakUser, UserRole, OTPVerification, DeviceToken


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ['role', 'description']
    search_fields = ['role']


@admin.register(SahayakUser)
class SahayakUserAdmin(admin.ModelAdmin):
    list_display = ['username', 'phone_number', 'get_role', 'is_verified', 'is_active', 'created_at']
    list_filter = ['role', 'is_verified', 'is_active', 'created_at']
    search_fields = ['username', 'phone_number', 'email']
    readonly_fields = ['id', 'created_at', 'updated_at']
    fieldsets = (
        ('Personal Information', {
            'fields': ('id', 'username', 'email', 'first_name', 'last_name', 'phone_number')
        }),
        ('Profile', {
            'fields': ('role', 'preferred_language', 'profile_picture', 'bio')
        }),
        ('Verification', {
            'fields': ('is_verified', 'is_phone_verified')
        }),
        ('Status', {
            'fields': ('is_active', 'created_at', 'updated_at')
        }),
    )
    
    def get_role(self, obj):
        return obj.role.get_role_display() if obj.role else 'No Role'
    get_role.short_description = 'Role'


@admin.register(OTPVerification)
class OTPVerificationAdmin(admin.ModelAdmin):
    list_display = ['phone_number', 'is_verified', 'attempts', 'created_at', 'expires_at']
    list_filter = ['is_verified', 'created_at']
    search_fields = ['phone_number']
    readonly_fields = ['id', 'created_at']


@admin.register(DeviceToken)
class DeviceTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'device_type', 'device_name', 'is_active', 'created_at']
    list_filter = ['device_type', 'is_active', 'created_at']
    search_fields = ['user__username', 'device_name']
    readonly_fields = ['id', 'created_at', 'last_used']
