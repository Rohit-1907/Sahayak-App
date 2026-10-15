from django.contrib import admin
from .models import Analytics


@admin.register(Analytics)
class AnalyticsAdmin(admin.ModelAdmin):
    list_display = ['metric_name', 'metric_value', 'timestamp']
    list_filter = ['metric_name', 'timestamp']
    search_fields = ['metric_name']
