from rest_framework import serializers
from .models import WorkerRecommendation


class WorkerRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkerRecommendation
        fields = ['id', 'worker', 'score', 'reason']
