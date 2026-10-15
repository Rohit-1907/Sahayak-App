"""
Admin configuration for users app.
"""
from django.contrib import admin
from .models import CustomerProfile, WorkerProfile, OrganizationProfile, OrganizationWorker


@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'city', 'average_rating', 'total_bookings', 'created_at']
    list_filter = ['city', 'created_at']
    search_fields = ['user__username', 'user__email', 'city']
    readonly_fields = ['total_bookings', 'average_rating']


@admin.register(WorkerProfile)
class WorkerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'service_categories', 'is_available', 'is_verified', 'average_rating', 'created_at']
    list_filter = ['is_available', 'is_verified', 'created_at', 'city']
    search_fields = ['user__username', 'user__email', 'skills']
    readonly_fields = ['total_jobs_completed', 'average_rating', 'total_earnings']


@admin.register(OrganizationProfile)
class OrganizationProfileAdmin(admin.ModelAdmin):
    list_display = ['company_name', 'city', 'is_verified', 'total_workers', 'created_at']
    list_filter = ['is_verified', 'created_at', 'city']
    search_fields = ['company_name', 'user__email', 'company_registration_number']
    readonly_fields = ['total_workers', 'total_jobs_posted']


@admin.register(OrganizationWorker)
class OrganizationWorkerAdmin(admin.ModelAdmin):
    list_display = ['organization', 'worker', 'job_title', 'employment_type', 'is_active', 'joined_at']
    list_filter = ['employment_type', 'is_active', 'joined_at']
    search_fields = ['organization__company_name', 'worker__user__username']
