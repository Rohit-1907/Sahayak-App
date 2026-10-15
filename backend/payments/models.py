"""Payment transaction models."""
from django.db import models
from jobs.models import WorkRequest, JobBooking
from users.models import CustomerProfile, WorkerProfile
import uuid


class Payment(models.Model):
    """Payment transactions for work requests."""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash After Service'),
        ('razorpay', 'Razorpay'),
        ('upi', 'UPI'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    work_request = models.ForeignKey(
        WorkRequest, 
        on_delete=models.CASCADE, 
        related_name='payments',
        null=True,
        blank=True
    )
    # Legacy booking reference
    booking = models.ForeignKey(
        JobBooking, 
        on_delete=models.SET_NULL, 
        related_name='payments', 
        null=True, 
        blank=True
    )
    client = models.ForeignKey(
        CustomerProfile, 
        on_delete=models.CASCADE, 
        related_name='payments',
        null=True,
        blank=True
    )
    worker = models.ForeignKey(
        WorkerProfile, 
        on_delete=models.CASCADE, 
        related_name='payments_received',
        null=True,
        blank=True
    )
    
    # Financial breakdown
    base_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    visiting_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    platform_fee = models.DecimalField(max_digits=6, decimal_places=2, default=50.00)
    additional_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    additional_charges_reason = models.TextField(blank=True, default='')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # Legacy alias for total_amount
    
    # Worker Settlement Ledger
    worker_gross_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    deducted_platform_dues = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    worker_net_payout = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    cash_platform_fee_settled = models.BooleanField(default=False)
    
    # Payment Method & Status
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES, default='cash')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Gateway Tracking
    razorpay_order_id = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    razorpay_payment_id = models.CharField(max_length=255, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)
    transaction_id = models.CharField(max_length=255, blank=True, default='')
    
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payments'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['work_request', 'status']),
            models.Index(fields=['worker', 'status']),
            models.Index(fields=['client', 'status']),
            models.Index(fields=['razorpay_order_id']),
        ]

    def save(self, *args, **kwargs):
        if not self.amount and self.total_amount:
            self.amount = self.total_amount
        if not self.total_amount and self.amount:
            self.total_amount = self.amount
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Payment #{self.id} - Rs. {self.total_amount} ({self.status})"
