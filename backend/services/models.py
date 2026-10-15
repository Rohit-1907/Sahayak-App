"""
Service category models for SAHAYAK.
"""
from django.db import models
import uuid


class ServiceCategory(models.Model):
    """Service categories available on the platform."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'service_categories'
        verbose_name = 'Service Category'
        verbose_name_plural = 'Service Categories'
    
    def __str__(self):
        return self.name


class ServiceSubcategory(models.Model):
    """Sub-categories under main services."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(ServiceCategory, on_delete=models.CASCADE, related_name='subcategories')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'service_subcategories'
        verbose_name = 'Service Subcategory'
        verbose_name_plural = 'Service Subcategories'
        unique_together = ['category', 'name']
    
    def __str__(self):
        return f"{self.category.name} - {self.name}"
