from rest_framework import serializers
from .models import Analytics


class AnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Analytics
        fields = ['id', 'metric_name', 'metric_value', 'timestamp']
