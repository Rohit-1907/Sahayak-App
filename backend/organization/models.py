"""
Organization System Models - New tables for org worker management.
These are SEPARATE from existing OrganizationProfile in users app.
"""
from django.db import models
from django.contrib.auth.hashers import make_password
from authentication.models import SahayakUser
import uuid
from datetime import datetime


class Organisation(models.Model):
    """
    New Organisation table for the org worker system.
    Separate from existing OrganizationProfile.
    """
    org_id = models.CharField(max_length=50, primary_key=True, unique=True, editable=False)
    org_name = models.CharField(max_length=255)
    admin_user = models.ForeignKey(
        SahayakUser, 
        on_delete=models.CASCADE, 
        related_name='managed_organisations'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'organisations'
        verbose_name = 'Organisation'
        verbose_name_plural = 'Organisations'
    
    def save(self, *args, **kwargs):
        if not self.org_id:
            # Generate org_id: ORG001, ORG002, etc.
            last_org = Organisation.objects.order_by('-created_at').first()
            if last_org:
                try:
                    last_num = int(last_org.org_id.replace('ORG', ''))
                    new_num = last_num + 1
                except:
                    new_num = 1
            else:
                new_num = 1
            self.org_id = f'ORG{new_num:03d}'
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.org_id} - {self.org_name}"


class OrgWorker(models.Model):
    """
    Organisation Worker - workers belonging to an organisation.
    Separate authentication from regular workers.
    """
    id = models.AutoField(primary_key=True)
    org = models.ForeignKey(
        Organisation, 
        on_delete=models.CASCADE, 
        related_name='org_workers'
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    dob = models.DateField(help_text='Date of birth - used in password generation')
    address = models.TextField()
    experience = models.CharField(max_length=100, help_text='Years or description of experience')
    email = models.EmailField()
    phone_number = models.CharField(max_length=15)
    username = models.CharField(max_length=100, unique=True, help_text='Phone number or email')
    password_hash = models.CharField(max_length=255)
    plain_password_display = models.CharField(
        max_length=255, 
        blank=True,
        help_text='Plain text password for admin to view - clear after worker receives it'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'org_workers'
        verbose_name = 'Organisation Worker'
        verbose_name_plural = 'Organisation Workers'
        indexes = [
            models.Index(fields=['username']),
            models.Index(fields=['org']),
        ]
    
    def generate_credentials(self):
        """
        Generate username and password based on the formula.
        Username: phone_number (primary) or email (fallback)
        Password: Last 4 digits of org_id + first_name (first 4 chars) + birth_year (last 2 digits)
        Max 10 characters total
        """
        # Username is phone number
        self.username = self.phone_number if self.phone_number else self.email
        
        # Password formula: Last 4 of org_id + First 4 of name + Last 2 of birth_year
        # Example: ORG615724 + Toma + 2000 = 5724Toma00 (10 chars)
        birth_year_short = str(self.dob.year)[-2:]  # Last 2 digits: 2000 -> 00
        org_id_short = self.org.org_id[-4:] if len(self.org.org_id) >= 4 else self.org.org_id  # Last 4 chars
        name_short = self.first_name[:4]  # First 4 chars
        
        plain_password = f"{org_id_short}{name_short}{birth_year_short}"
        
        # Ensure max 10 characters
        plain_password = plain_password[:10]
        
        # Store plain password for admin to view
        self.plain_password_display = plain_password
        
        # Hash the password for authentication
        self.password_hash = make_password(plain_password)
        
        return {
            'username': self.username,
            'password': plain_password
        }
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.org.org_id})"


class OrgWorkRequest(models.Model):
    """
    Work requests submitted by clients to organisations.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    ]
    
    id = models.AutoField(primary_key=True)
    org = models.ForeignKey(
        Organisation, 
        on_delete=models.CASCADE, 
        related_name='work_requests'
    )
    client_name = models.CharField(max_length=255)
    client_contact = models.CharField(max_length=15)
    work_description = models.TextField()
    work_type = models.CharField(max_length=100)
    work_location = models.TextField(null=True, blank=True)
    work_latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    work_longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    required_date = models.DateField(null=True, blank=True)
    required_time = models.TimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending'
    )
    
    # Payment fields
    service_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    additional_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    additional_charges_reason = models.TextField(blank=True, default='')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_mode = models.CharField(max_length=20, default='CASH')
    
    # Completion fields
    rating = models.IntegerField(null=True, blank=True)
    feedback = models.TextField(blank=True, default='')
    completed_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'org_work_requests'
        verbose_name = 'Organisation Work Request'
        verbose_name_plural = 'Organisation Work Requests'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['org', 'status']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.client_name} - {self.work_type} ({self.status})"


class OrgWorkRequestTranslation(models.Model):
    """
    Translations of org work request dynamic content per language.
    """
    work_request = models.ForeignKey(
        OrgWorkRequest,
        on_delete=models.CASCADE,
        related_name='translations',
    )
    language = models.CharField(
        max_length=2,
        choices=[
            ('en', 'English'),
            ('mr', 'Marathi'),
            ('hi', 'Hindi'),
        ],
    )
    work_description = models.TextField()

    class Meta:
        db_table = 'org_work_request_translations'
        unique_together = ('work_request', 'language')

    def __str__(self):
        return f"{self.work_request.client_name} - {self.language}"


class OrgWorkAssignment(models.Model):
    """
    Work assignments - linking accepted work requests to org workers.
    """
    STATUS_CHOICES = [
        ('assigned', 'Assigned'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]
    
    id = models.AutoField(primary_key=True)
    request = models.ForeignKey(
        OrgWorkRequest, 
        on_delete=models.CASCADE, 
        related_name='assignments'
    )
    org_worker = models.ForeignKey(
        OrgWorker, 
        on_delete=models.CASCADE, 
        related_name='assignments'
    )
    assigned_by_admin = models.ForeignKey(
        SahayakUser, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='assigned_org_work'
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='assigned'
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'org_work_assignments'
        verbose_name = 'Organisation Work Assignment'
        verbose_name_plural = 'Organisation Work Assignments'
        ordering = ['-assigned_at']
        indexes = [
            models.Index(fields=['org_worker', 'status']),
            models.Index(fields=['request']),
            models.Index(fields=['status']),
        ]
    
    def mark_completed(self):
        """Mark assignment as completed with timestamp."""
        self.status = 'completed'
        self.completed_at = datetime.now()
        self.save()
    
    def __str__(self):
        return f"{self.request.work_type} → {self.org_worker.get_full_name()} ({self.status})"
