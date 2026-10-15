"""
Simplified Work Request model for direct client-to-worker requests.
This model follows the specification requirements with REQUESTED/SCHEDULED/REJECTED flow.
"""
from django.db import models
from users.models import User, CustomerProfile, WorkerProfile
import uuid


class WorkRequest(models.Model):
    """
    Direct work request from client to specific worker.
    Simpler than JobRequest/JobBooking - one table, one status flow.
    
    Status flow: REQUESTED → SCHEDULED (accept) or REJECTED (reject)
    """
    STATUS_CHOICES = [
        ('REQUESTED', 'Requested'),
        ('SCHEDULED', 'Scheduled'),
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
    
    def reject(self, reason=''):
        """Worker rejects the request"""
        from django.utils import timezone
        if self.status != 'REQUESTED':
            raise ValueError(f"Cannot reject request with status {self.status}")
        self.status = 'REJECTED'
        self.rejected_at = timezone.now()
        self.rejection_reason = reason
        self.save(update_fields=['status', 'rejected_at', 'rejection_reason', 'updated_at'])
    
    def cancel(self, reason=''):
        """Client cancels the request"""
        from django.utils import timezone
        if self.status not in ['REQUESTED', 'SCHEDULED']:
            raise ValueError(f"Cannot cancel request with status {self.status}")
        self.status = 'CANCELLED'
        self.cancelled_at = timezone.now()
        self.cancellation_reason = reason
        self.save(update_fields=['status', 'cancelled_at', 'cancellation_reason', 'updated_at'])
    
    def complete(self):
        """Mark request as completed"""
        from django.utils import timezone
        if self.status not in ['SCHEDULED', 'IN_PROGRESS']:
            raise ValueError(f"Cannot complete request with status {self.status}")
        self.status = 'COMPLETED'
        self.completed_at = timezone.now()
        self.save(update_fields=['status', 'completed_at', 'updated_at'])

