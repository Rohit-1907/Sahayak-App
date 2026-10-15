"""
Django admin configuration for Organisation System models.
"""
from django.contrib import admin
from .models import Organisation, OrgWorker, OrgWorkRequest, OrgWorkAssignment


@admin.register(Organisation)
class OrganisationAdmin(admin.ModelAdmin):
    """Admin interface for Organisations."""
    list_display = ['org_id', 'org_name', 'admin_user', 'created_at']
    list_filter = ['created_at']
    search_fields = ['org_id', 'org_name', 'admin_user__email']
    readonly_fields = ['org_id', 'created_at']
    
    fieldsets = (
        ('Organisation Information', {
            'fields': ('org_id', 'org_name', 'admin_user')
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )


@admin.register(OrgWorker)
class OrgWorkerAdmin(admin.ModelAdmin):
    """Admin interface for Organisation Workers."""
    list_display = ['get_full_name', 'username', 'org', 'phone_number', 'email', 'created_at']
    list_filter = ['org', 'created_at']
    search_fields = ['first_name', 'last_name', 'username', 'email', 'phone_number']
    readonly_fields = ['created_at', 'password_hash']
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('first_name', 'last_name', 'dob', 'address', 'experience')
        }),
        ('Contact Information', {
            'fields': ('email', 'phone_number')
        }),
        ('Organisation', {
            'fields': ('org',)
        }),
        ('Authentication', {
            'fields': ('username', 'password_hash', 'plain_password_display'),
            'description': 'Credentials generated automatically. plain_password_display shows the unhashed password.'
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    get_full_name.short_description = 'Full Name'


@admin.register(OrgWorkRequest)
class OrgWorkRequestAdmin(admin.ModelAdmin):
    """Admin interface for Organisation Work Requests."""
    list_display = ['id', 'org', 'client_name', 'work_type', 'status', 'created_at']
    list_filter = ['status', 'org', 'created_at']
    search_fields = ['client_name', 'client_contact', 'work_type', 'work_description']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Client Information', {
            'fields': ('client_name', 'client_contact')
        }),
        ('Work Details', {
            'fields': ('org', 'work_type', 'work_description', 'status')
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )


@admin.register(OrgWorkAssignment)
class OrgWorkAssignmentAdmin(admin.ModelAdmin):
    """Admin interface for Organisation Work Assignments."""
    list_display = ['id', 'request', 'org_worker', 'assigned_by_admin', 'status', 'assigned_at', 'completed_at']
    list_filter = ['status', 'assigned_at', 'completed_at']
    search_fields = ['request__work_type', 'org_worker__first_name', 'org_worker__last_name']
    readonly_fields = ['assigned_at']
    
    fieldsets = (
        ('Assignment Details', {
            'fields': ('request', 'org_worker', 'assigned_by_admin', 'status')
        }),
        ('Timestamps', {
            'fields': ('assigned_at', 'completed_at')
        }),
    )
