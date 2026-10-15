"""Analytics models."""
from django.db import models
import uuid


class Analytics(models.Model):
    """Platform analytics data."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    metric_name = models.CharField(max_length=255)
    metric_value = models.JSONField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'analytics'
        verbose_name_plural = 'Analytics'
