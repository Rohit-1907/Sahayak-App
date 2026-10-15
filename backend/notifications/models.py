"""Notification models."""
from django.db import models
from django.utils import timezone
from datetime import timedelta
from authentication.models import SahayakUser
import uuid
import random


class Notification(models.Model):
    """User notifications."""
    TYPE_CHOICES = [
        ('job_request', 'Job Request'),
        ('booking_update', 'Booking Update'),
        ('payment', 'Payment'),
        ('message', 'Message'),
        ('announcement', 'Announcement'),
        ('welcome', 'Welcome'),
        ('otp', 'OTP Verification'),
        ('job_update', 'Job Update'),
        ('job_accepted', 'Job Accepted'),
        ('job_rejected', 'Job Rejected'),
        ('job_started', 'Job Started'),
        ('job_completed', 'Job Completed'),
        ('job_cancelled', 'Job Cancelled'),
        ('new_job_request', 'New Job Request'),
        ('login_alert', 'Login Alert'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(SahayakUser, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    related_id = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']


class OTPNotification(models.Model):
    """OTP notifications for worker arrival verification."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(SahayakUser, on_delete=models.CASCADE, related_name='otp_notifications')
    pin = models.CharField(max_length=6)
    title = models.CharField(max_length=255, default='Worker Arrival Verification')
    body = models.TextField(default='Please provide this PIN to verify worker arrival')
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'otp_notifications'
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        """Generate PIN and expiry time if not set."""
        if not self.pin:
            self.pin = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        if not self.expires_at:
            # Ensure timezone-aware datetime using Django's timezone utility
            self.expires_at = timezone.now() + timedelta(minutes=3)
        super().save(*args, **kwargs)
    
    def is_expired(self):
        """Check if OTP has expired."""
        now = timezone.now()
        expires = self.expires_at
        
        # Ensure expires_at is timezone-aware
        if expires.tzinfo is None:
            from django.conf import settings
            import pytz
            tz = pytz.timezone(settings.TIME_ZONE)
            expires = tz.localize(expires)
        
        return now > expires
    
    def is_valid(self):
        """Check if OTP is valid (not used and not expired)."""
        return not self.is_used and not self.is_expired()
    
    def __str__(self):
        return f"OTP {self.pin} for {self.user.email}"
