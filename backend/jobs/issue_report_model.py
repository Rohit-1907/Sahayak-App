"""
Issue Report model for customer support.
Stores customer-reported issues for tracking and resolution.
"""
from django.db import models
from users.models import CustomerProfile
import uuid


class IssueReport(models.Model):
    """
    Customer issue reports for support tracking.
    """
    ISSUE_TYPE_CHOICES = [
        ('payment', 'Payment Issue'),
        ('worker', 'Worker Issue'),
        ('booking', 'Booking Issue'),
        ('service', 'Service Issue'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('SUBMITTED', 'Submitted'),
        ('IN_PROGRESS', 'In Progress'),
        ('RESOLVED', 'Resolved'),
        ('CLOSED', 'Closed'),
    ]
    
    # Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Reporter
    client = models.ForeignKey(
        CustomerProfile, 
        on_delete=models.CASCADE, 
        related_name='issue_reports'
    )
    
    # Issue Details
    issue_type = models.CharField(max_length=20, choices=ISSUE_TYPE_CHOICES)
    booking_id = models.CharField(max_length=100, blank=True)
    description = models.TextField()
    
    # Status and Response
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='SUBMITTED'
    )
    admin_response = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'issue_reports'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['client', 'status']),
            models.Index(fields=['issue_type']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"IssueReport #{self.id} - {self.issue_type} ({self.status})"
    
    def mark_in_progress(self):
        """Mark issue as being worked on"""
        self.status = 'IN_PROGRESS'
        self.save(update_fields=['status', 'updated_at'])
    
    def resolve(self, response=''):
        """Mark issue as resolved"""
        from django.utils import timezone
        self.status = 'RESOLVED'
        self.admin_response = response
        self.resolved_at = timezone.now()
        self.save(update_fields=['status', 'admin_response', 'resolved_at', 'updated_at'])
    
    def close(self):
        """Close the issue"""
        self.status = 'CLOSED'
        self.save(update_fields=['status', 'updated_at'])
