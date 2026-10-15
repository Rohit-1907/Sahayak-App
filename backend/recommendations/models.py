"""Recommendation models."""
from django.db import models
from users.models import WorkerProfile
import uuid


class WorkerRecommendation(models.Model):
    """AI-based worker recommendations."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    worker = models.ForeignKey(WorkerProfile, on_delete=models.CASCADE)
    score = models.FloatField(default=0.0)
    reason = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'worker_recommendations'
