from django.contrib import admin
from .models import WorkerRecommendation


@admin.register(WorkerRecommendation)
class WorkerRecommendationAdmin(admin.ModelAdmin):
    list_display = ['worker', 'score', 'reason', 'created_at']
    list_filter = ['created_at']
    search_fields = ['worker__user__username', 'reason']
