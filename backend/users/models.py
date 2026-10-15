"""
User models for different roles (Customer, Worker, Organization).
"""
from django.db import models
from authentication.models import SahayakUser
import uuid


class CustomerProfile(models.Model):
    """Profile for customer users."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(SahayakUser, on_delete=models.CASCADE, related_name='customer_profile')
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=10, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    preferred_worker_skills = models.JSONField(default=list, blank=True)
    total_bookings = models.IntegerField(default=0)
    average_rating = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'customer_profiles'
        verbose_name = 'Customer Profile'
        verbose_name_plural = 'Customer Profiles'
    
    def __str__(self):
        return f"Customer: {self.user.get_full_name()}"


class WorkerProfile(models.Model):
    """Profile for worker users."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(SahayakUser, on_delete=models.CASCADE, related_name='worker_profile')
    bio = models.TextField(blank=True)
    skills = models.JSONField(default=list)  # List of skills with ratings
    years_of_experience = models.IntegerField(default=0)
    certifications = models.JSONField(default=list, blank=True)  # List of certification documents
    service_categories = models.JSONField(default=list)  # Service categories they offer
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, default=0.0)
    is_available = models.BooleanField(default=False)
    availability_schedule = models.JSONField(default=dict, blank=True)  # Work schedule
    
    # Primary/Service Location (registered/base location)
    primary_address = models.TextField(blank=True)
    primary_city = models.CharField(max_length=100, blank=True)
    primary_state = models.CharField(max_length=100, blank=True)
    primary_pincode = models.CharField(max_length=10, blank=True)
    primary_latitude = models.FloatField(null=True, blank=True)
    primary_longitude = models.FloatField(null=True, blank=True)
    
    # Current Location (updated when available for work)
    current_latitude = models.FloatField(null=True, blank=True)
    current_longitude = models.FloatField(null=True, blank=True)
    location_updated_at = models.DateTimeField(null=True, blank=True)
    
    # Legacy fields (kept for backward compatibility, can be removed later)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=10, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    voice_resume_url = models.URLField(blank=True)  # URL to voice resume
    total_jobs_completed = models.IntegerField(default=0)
    average_rating = models.FloatField(default=0.0)
    total_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    pending_platform_fees = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0.0,
        help_text="Accumulated platform fees from cash jobs to be deducted from future online payouts"
    )
    is_verified = models.BooleanField(default=False)
    verification_documents = models.JSONField(default=list, blank=True)  # Identity proofs
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'worker_profiles'
        verbose_name = 'Worker Profile'
        verbose_name_plural = 'Worker Profiles'
        indexes = [
            models.Index(fields=['service_categories']),
            models.Index(fields=['is_available']),
            models.Index(fields=['primary_latitude', 'primary_longitude']),
            models.Index(fields=['current_latitude', 'current_longitude']),
            models.Index(fields=['location_updated_at']),
        ]
    
    def __str__(self):
        return f"Worker: {self.user.get_full_name()}"


class OrganizationProfile(models.Model):
    """Profile for organization users."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(SahayakUser, on_delete=models.CASCADE, related_name='organization_profile')
    company_name = models.CharField(max_length=255)
    company_registration_number = models.CharField(max_length=100, unique=True)
    industry_type = models.CharField(max_length=100)
    company_website = models.URLField(blank=True)
    company_email = models.EmailField()
    company_phone = models.CharField(max_length=15)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    description = models.TextField(blank=True)
    company_logo = models.ImageField(upload_to='organization_logos/', null=True, blank=True)
    total_workers = models.IntegerField(default=0)
    total_jobs_posted = models.IntegerField(default=0)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'organization_profiles'
        verbose_name = 'Organization Profile'
        verbose_name_plural = 'Organization Profiles'
    
    def __str__(self):
        return self.company_name


class OrganizationWorker(models.Model):
    """Link workers to organizations."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(OrganizationProfile, on_delete=models.CASCADE, related_name='workers')
    worker = models.ForeignKey(WorkerProfile, on_delete=models.CASCADE, related_name='organizations')
    job_title = models.CharField(max_length=255)
    employment_type = models.CharField(max_length=50, choices=[
        ('full-time', 'Full-time'),
        ('part-time', 'Part-time'),
        ('contract', 'Contract'),
        ('temporary', 'Temporary')
    ])
    is_active = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'organization_workers'
        verbose_name = 'Organization Worker'
        verbose_name_plural = 'Organization Workers'
        unique_together = ['organization', 'worker']
    
    def __str__(self):
        return f"{self.worker.user.get_full_name()} at {self.organization.company_name}"


class WorkerService(models.Model):
    """Junction table linking workers to services they provide."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    worker = models.ForeignKey(WorkerProfile, on_delete=models.CASCADE, related_name='worker_services')
    service = models.ForeignKey('services.ServiceCategory', on_delete=models.CASCADE, related_name='service_workers')
    experience_years = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'worker_services'
        verbose_name = 'Worker Service'
        verbose_name_plural = 'Worker Services'
        unique_together = ['worker', 'service']
        indexes = [
            models.Index(fields=['worker', 'service']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.worker.user.get_full_name()} - {self.service.name}"
