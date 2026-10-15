"""Job and booking models."""
from django.db import models
from users.models import CustomerProfile, WorkerProfile
import uuid


class ServicePricing(models.Model):
    """Location-based base pricing for services"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service_category = models.CharField(max_length=100, db_index=True)
    city = models.CharField(max_length=100, db_index=True)
    state = models.CharField(max_length=100)
    base_price = models.DecimalField(
        max_digits=8, 
        decimal_places=2,
        help_text="Base price for this service in this city"
    )
    platform_fee = models.DecimalField(
        max_digits=6, 
        decimal_places=2, 
        default=50.00,
        help_text="Platform fee (default Rs. 50)"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'service_pricing'
        unique_together = ['service_category', 'city']
        indexes = [
            models.Index(fields=['service_category', 'city']),
            models.Index(fields=['is_active']),
            models.Index(fields=['city']),
        ]
        verbose_name = 'Service Pricing'
        verbose_name_plural = 'Service Pricing'
    
    def __str__(self):
        return f"{self.service_category} - {self.city} (Rs. {self.base_price})"


class WorkRequest(models.Model):
    """
    Direct work request from client to specific worker.
    Simpler than JobRequest/JobBooking - one table, one status flow.
    
    Status flow: REQUESTED → SCHEDULED (accept) or REJECTED (reject)
    """
    STATUS_CHOICES = [
        ('REQUESTED', 'Requested'),
        ('SCHEDULED', 'Scheduled'),
        ('IN_PROGRESS', 'In Progress'),
        ('REJECTED', 'Rejected'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
    ]
    
    # Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationships
    client = models.ForeignKey(
        CustomerProfile, 
        on_delete=models.CASCADE, 
        related_name='work_requests_sent'
    )
    worker = models.ForeignKey(
        WorkerProfile, 
        on_delete=models.CASCADE, 
        related_name='work_requests_received'
    )
    
    # Service Details
    service_category = models.CharField(max_length=100, db_index=True)
    title = models.CharField(max_length=200, blank=True)
    description = models.TextField()
    
    # Work Location (where the work will be done)
    work_address = models.TextField()
    work_latitude = models.FloatField()
    work_longitude = models.FloatField()
    
    # Schedule
    required_date = models.DateField()
    required_time = models.TimeField()
    number_of_workers = models.IntegerField(default=1)
    
    # Budget
    estimated_budget = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Status and Timestamps
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='REQUESTED',
        db_index=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Action timestamps
    accepted_at = models.DateTimeField(null=True, blank=True)
    rejected_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Optional fields
    rejection_reason = models.TextField(blank=True)
    cancellation_reason = models.TextField(blank=True)
    
    # Rating and Feedback (added by client after completion)
    rating = models.IntegerField(null=True, blank=True, choices=[(i, i) for i in range(1, 6)])  # 1-5 stars
    feedback = models.TextField(blank=True)
    rated_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'work_requests'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['client', 'status']),
            models.Index(fields=['worker', 'status']),
            models.Index(fields=['service_category']),
            models.Index(fields=['required_date']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"WorkRequest #{self.id} - {self.service_category} ({self.status})"
    
    def accept(self):
        """Worker accepts the request"""
        from django.utils import timezone
        if self.status != 'REQUESTED':
            raise ValueError(f"Cannot accept request with status {self.status}")
        self.status = 'SCHEDULED'
        self.accepted_at = timezone.now()
        self.save(update_fields=['status', 'accepted_at', 'updated_at'])
        
        # Notify both client and worker that worker accepted
        try:
            from notifications.notification_manager import notification_manager
            import logging
            logger = logging.getLogger(__name__)
            
            client_user = self.client.user
            worker_user = self.worker.user
            worker_name = worker_user.get_full_name() if hasattr(worker_user, 'get_full_name') and worker_user.get_full_name() else (worker_user.first_name or 'Worker')
            notification_manager.send_job_accepted_notification(
                client_user=client_user,
                work_request=self,
                worker_name=worker_name,
                worker_user=worker_user
            )
        except Exception as e:
            logger.error(f"Failed to send job accepted notification: {e}")
    
    def reject(self, reason=''):
        """Worker rejects the request"""
        from django.utils import timezone
        if self.status != 'REQUESTED':
            raise ValueError(f"Cannot reject request with status {self.status}")
        self.status = 'REJECTED'
        self.rejected_at = timezone.now()
        self.rejection_reason = reason
        self.save(update_fields=['status', 'rejected_at', 'rejection_reason', 'updated_at'])
        
        # Notify both client and worker that worker rejected
        try:
            from notifications.notification_manager import notification_manager
            import logging
            logger = logging.getLogger(__name__)
            
            client_user = self.client.user
            worker_user = self.worker.user
            worker_name = worker_user.get_full_name() if hasattr(worker_user, 'get_full_name') and worker_user.get_full_name() else (worker_user.first_name or 'Worker')
            notification_manager.send_job_rejected_notification(
                client_user=client_user,
                work_request=self,
                worker_name=worker_name,
                reason=reason,
                worker_user=worker_user
            )
        except Exception as e:
            logger.error(f"Failed to send job rejected notification: {e}")
    
    def cancel(self, reason='', cancelled_by='client'):
        """Client or Worker cancels the request"""
        from django.utils import timezone
        if self.status not in ['REQUESTED', 'SCHEDULED']:
            raise ValueError(f"Cannot cancel request with status {self.status}")
        self.status = 'CANCELLED'
        self.cancelled_at = timezone.now()
        self.cancellation_reason = reason
        self.save(update_fields=['status', 'cancelled_at', 'cancellation_reason', 'updated_at'])
        
        # Notify both worker and client that request was cancelled
        try:
            from notifications.notification_manager import notification_manager
            import logging
            logger = logging.getLogger(__name__)
            
            client_user = self.client.user
            worker_user = self.worker.user
            notification_manager.send_job_cancelled_notification(
                work_request=self,
                cancelled_by=cancelled_by,
                reason=reason,
                client_user=client_user,
                worker_user=worker_user
            )
        except Exception as e:
            logger.error(f"Failed to send job cancelled notification: {e}")
    
    def start(self):
        """Mark request as in progress"""
        from django.utils import timezone
        if self.status not in ['SCHEDULED', 'WORKER_ARRIVED']:
            raise ValueError(f"Cannot start request with status {self.status}")
        self.status = 'IN_PROGRESS'
        self.save(update_fields=['status', 'updated_at'])
        
        # Notify both client and worker that work has started
        try:
            from notifications.notification_manager import notification_manager
            import logging
            logger = logging.getLogger(__name__)
            
            client_user = self.client.user
            worker_user = self.worker.user
            notification_manager.send_job_started_notification(
                client_user=client_user,
                work_request=self,
                worker_user=worker_user
            )
        except Exception as e:
            logger.error(f"Failed to send job started notification: {e}")

    def complete(self):
        """Mark request as completed"""
        from django.utils import timezone
        if self.status not in ['SCHEDULED', 'IN_PROGRESS', 'WORKER_ARRIVED']:
            raise ValueError(f"Cannot complete request with status {self.status}")
        self.status = 'COMPLETED'
        self.completed_at = timezone.now()
        self.save(update_fields=['status', 'completed_at', 'updated_at'])
        
        # Notify both client and worker that job is completed
        try:
            from notifications.notification_manager import notification_manager
            import logging
            logger = logging.getLogger(__name__)
            
            client_user = self.client.user
            worker_user = self.worker.user
            notification_manager.send_job_completed_notification(
                work_request=self,
                client_user=client_user,
                worker_user=worker_user
            )
        except Exception as e:
            logger.error(f"Failed to send job completed notification: {e}")


class JobRequest(models.Model):
    """Service requests posted by customers."""
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('assigned', 'Assigned'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name='job_requests')
    service_category = models.CharField(max_length=100)
    description = models.TextField()
    
    # Work location (where the work will actually happen)
    work_address = models.TextField()
    work_latitude = models.FloatField()
    work_longitude = models.FloatField()
    
    # Legacy fields (kept for backward compatibility)
    location_address = models.TextField(blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    estimated_budget = models.DecimalField(max_digits=10, decimal_places=2)
    required_date = models.DateTimeField()
    required_time = models.TimeField(null=True, blank=True)
    number_of_workers = models.IntegerField(default=1)
    
    # Legacy field
    preferred_date = models.DateTimeField(null=True, blank=True)
    preferred_time = models.TimeField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'job_requests'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['work_latitude', 'work_longitude']),
            models.Index(fields=['status']),
            models.Index(fields=['required_date']),
        ]
    
    def __str__(self):
        return f"Job #{self.id} - {self.service_category}"


class JobBooking(models.Model):
    """Booking of a worker for a job request."""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job_request = models.ForeignKey(JobRequest, on_delete=models.CASCADE, related_name='bookings')
    worker = models.ForeignKey(WorkerProfile, on_delete=models.CASCADE, related_name='bookings')
    quoted_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    accepted_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'job_bookings'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Booking #{self.id}"


class JobStatus(models.Model):
    """Track job status updates."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.ForeignKey(JobBooking, on_delete=models.CASCADE, related_name='status_updates')
    status = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'job_status_updates'
        ordering = ['-created_at']


# Multilingual translation support (IndicTrans2)
class WorkRequestTranslation(models.Model):
    """
    Translated fields for work requests in multiple languages.
    Used by IndicTrans2 translation engine.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    work_request = models.ForeignKey(
        WorkRequest,
        on_delete=models.CASCADE,
        db_column='work_request_id',
        related_name='translations'
    )
    language = models.CharField(max_length=10)
    title = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    rejection_reason = models.TextField(blank=True)
    cancellation_reason = models.TextField(blank=True)
    feedback = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'work_request_translations'

    def __str__(self):
        return f"Translation for {self.work_request.id} - {self.language}"


# Import IssueReport model
from .issue_report_model import IssueReport
