from rest_framework import serializers
from .models import Notification, OTPNotification
from authentication.models import DeviceToken


class DeviceTokenSerializer(serializers.ModelSerializer):
    """Serializer for device token registration"""
    
    class Meta:
        model = DeviceToken
        fields = ['token', 'device_type', 'device_name']
    
    def create(self, validated_data):
        """Update existing token if present, otherwise create new"""
        user = self.context['request'].user
        token = validated_data['token']
        
        # Update or create token (supports multiple devices per user)
        device_token, created = DeviceToken.objects.update_or_create(
            user=user,
            token=token,
            defaults={
                'device_type': validated_data['device_type'],
                'device_name': validated_data.get('device_name', ''),
                'is_active': True,
            }
        )
        
        return device_token


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'type', 'title', 'message', 'is_read', 'related_id', 'created_at']
        read_only_fields = ['id', 'created_at']


class OTPNotificationSerializer(serializers.ModelSerializer):
    is_expired = serializers.SerializerMethodField()
    is_valid = serializers.SerializerMethodField()
    
    class Meta:
        model = OTPNotification
        fields = ['id', 'pin', 'title', 'body', 'expires_at', 'is_used', 'is_expired', 'is_valid', 'created_at', 'used_at']
        read_only_fields = ['id', 'pin', 'expires_at', 'created_at', 'used_at']
    
    def get_is_expired(self, obj):
        return obj.is_expired()
    
    def get_is_valid(self, obj):
        return obj.is_valid()
