from django.contrib import admin
from .models import JobRequest, JobBooking, JobStatus, WorkRequest, ServicePricing


@admin.register(ServicePricing)
class ServicePricingAdmin(admin.ModelAdmin):
    list_display = ['service_category', 'city', 'state', 'base_price', 'platform_fee', 'is_active']
    list_filter = ['is_active', 'state', 'service_category']
    search_fields = ['service_category', 'city', 'state']
    list_editable = ['base_price', 'platform_fee', 'is_active']
    
    fieldsets = (
        ('Location', {
            'fields': ('city', 'state')
        }),
        ('Service', {
            'fields': ('service_category',)
        }),
        ('Pricing', {
            'fields': ('base_price', 'platform_fee')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )


@admin.register(WorkRequest)
class WorkRequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'client', 'worker', 'service_category', 'status', 'required_date', 'created_at']
    list_filter = ['status', 'service_category', 'required_date', 'created_at']
    search_fields = ['description', 'service_category', 'work_address', 'client__user__username', 'worker__full_name']
    readonly_fields = ['id', 'created_at', 'updated_at', 'accepted_at', 'rejected_at', 'cancelled_at', 'completed_at']
    
    fieldsets = (
        ('Request Info', {
            'fields': ('id', 'client', 'worker', 'status')
        }),
        ('Service Details', {
            'fields': ('service_category', 'title', 'description', 'number_of_workers', 'estimated_budget')
        }),
        ('Work Location', {
            'fields': ('work_address', 'work_latitude', 'work_longitude')
        }),
        ('Schedule', {
            'fields': ('required_date', 'required_time')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'accepted_at', 'rejected_at', 'cancelled_at', 'completed_at')
        }),
        ('Additional Info', {
            'fields': ('rejection_reason', 'cancellation_reason'),
            'classes': ('collapse',)
        }),
    )


@admin.register(JobRequest)
class JobRequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'service_category', 'status', 'created_at']
    list_filter = ['status', 'service_category', 'created_at']
    search_fields = ['description', 'service_category']


@admin.register(JobBooking)
class JobBookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'job_request', 'worker', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['job_request__id', 'worker__user__username']


@admin.register(JobStatus)
class JobStatusAdmin(admin.ModelAdmin):
    list_display = ['booking', 'status', 'created_at']
    list_filter = ['status', 'created_at']

