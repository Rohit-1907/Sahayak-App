from rest_framework import serializers
from .models import JobRequest, JobBooking, JobStatus, WorkRequest, IssueReport


class WorkRequestSerializer(serializers.ModelSerializer):
    """Serializer for WorkRequest model"""
    
    translations = serializers.SerializerMethodField()
    
    # Read-only fields for related data
    client_name = serializers.CharField(source='client.user.get_full_name', read_only=True)
    client_email = serializers.EmailField(source='client.user.email', read_only=True)
    client_phone = serializers.CharField(source='client.user.phone_number', read_only=True)
    
    worker_name = serializers.CharField(source='worker.user.get_full_name', read_only=True)
    worker_phone = serializers.CharField(source='worker.user.phone_number', read_only=True)
    worker_photo = serializers.SerializerMethodField(read_only=True)
    worker_rating = serializers.FloatField(source='worker.average_rating', read_only=True)
    worker_voice_resume_url = serializers.SerializerMethodField(read_only=True)
    
    # Worker location coordinates (prioritize current location, fallback to primary)
    worker_latitude = serializers.SerializerMethodField(read_only=True)
    worker_longitude = serializers.SerializerMethodField(read_only=True)
    
    # Add aliases for client location for consistency
    latitude = serializers.FloatField(source='work_latitude', read_only=True)
    longitude = serializers.FloatField(source='work_longitude', read_only=True)
    
    class Meta:
        model = WorkRequest
        fields = [
            'id', 'client', 'worker', 'service_category', 'title', 'description',
            'work_address', 'work_latitude', 'work_longitude',
            'latitude', 'longitude',  # Aliases for client location
            'required_date', 'required_time', 'number_of_workers',
            'estimated_budget', 'status',
            'created_at', 'updated_at',
            'accepted_at', 'rejected_at', 'cancelled_at', 'completed_at',
            'rejection_reason', 'cancellation_reason',
            # Read-only related fields
            'client_name', 'client_email', 'client_phone',
            'worker_name', 'worker_phone', 'worker_photo', 'worker_rating',
            'worker_voice_resume_url',
            'worker_latitude', 'worker_longitude',  # Worker coordinates
            'translations',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_worker_photo(self, obj):
        """Safely get worker profile picture URL without throwing exceptions"""
        try:
            if obj.worker and hasattr(obj.worker, 'user') and obj.worker.user:
                photo = getattr(obj.worker.user, 'profile_picture', None)
                if photo and hasattr(photo, 'url'):
                    return photo.url
        except Exception:
            pass
        return None

    def get_worker_voice_resume_url(self, obj):
        """Safely get worker voice resume URL with absolute URL resolution"""
        try:
            if obj.worker and obj.worker.voice_resume_url:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.worker.voice_resume_url)
                return obj.worker.voice_resume_url
        except Exception:
            pass
        return None


    def get_worker_latitude(self, obj):
        """Get worker latitude - prioritize current location, fallback to primary"""
        if obj.worker.current_latitude is not None:
            return obj.worker.current_latitude
        elif obj.worker.primary_latitude is not None:
            return obj.worker.primary_latitude
        elif obj.worker.latitude is not None:  # Legacy field
            return obj.worker.latitude
        return None
    
    def get_worker_longitude(self, obj):
        """Get worker longitude - prioritize current location, fallback to primary"""
        if obj.worker.current_longitude is not None:
            return obj.worker.current_longitude
        elif obj.worker.primary_longitude is not None:
            return obj.worker.primary_longitude
        elif obj.worker.longitude is not None:  # Legacy field
            return obj.worker.longitude
        return None

    def get_translations(self, obj):
        return {
            translation.language: {
                'title': translation.title,
                'description': translation.description,
                'feedback': translation.feedback,
                'rejection_reason': translation.rejection_reason,
                'cancellation_reason': translation.cancellation_reason,
            }
            for translation in obj.translations.all()
        }
    
    def validate_status(self, value):
        """Validate status transitions"""
        instance = self.instance
        if instance:
            current_status = instance.status
            # Only allow certain transitions
            invalid_transitions = [
                ('REJECTED', 'SCHEDULED'),
                ('SCHEDULED', 'REQUESTED'),
                ('COMPLETED', 'REQUESTED'),
                ('COMPLETED', 'SCHEDULED'),
            ]
            if (current_status, value) in invalid_transitions:
                raise serializers.ValidationError(
                    f"Cannot change status from {current_status} to {value}"
                )
        return value


class WorkRequestCreateSerializer(serializers.Serializer):
    """Serializer for creating work requests"""
    worker_id = serializers.UUIDField(required=True)
    service_category = serializers.CharField(max_length=100, required=True)
    title = serializers.CharField(max_length=200, required=False, allow_blank=True)
    description = serializers.CharField(required=True)
    work_address = serializers.CharField(required=True)
    work_latitude = serializers.FloatField(required=True)
    work_longitude = serializers.FloatField(required=True)
    required_date = serializers.DateField(required=True)
    required_time = serializers.TimeField(required=True)
    number_of_workers = serializers.IntegerField(default=1, min_value=1)
    estimated_budget = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        required=False,
        allow_null=True
    )
    source_language = serializers.ChoiceField(
        choices=['en', 'mr', 'hi'],
        required=True
    )


class WorkRequestActionSerializer(serializers.Serializer):
    """Serializer for worker actions (accept/reject)"""
    action = serializers.ChoiceField(choices=['accept', 'reject'], required=True)
    reason = serializers.CharField(required=False, allow_blank=True)


class JobStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobStatus
        fields = ['id', 'status', 'description', 'latitude', 'longitude', 'created_at']


class JobBookingSerializer(serializers.ModelSerializer):
    status_updates = JobStatusSerializer(many=True, read_only=True)
    
    class Meta:
        model = JobBooking
        fields = [
            'id', 'job_request', 'worker', 'quoted_price', 'status',
            'accepted_at', 'completed_at', 'status_updates', 'created_at', 'updated_at'
        ]


class JobRequestSerializer(serializers.ModelSerializer):
    bookings = JobBookingSerializer(many=True, read_only=True)
    
    class Meta:
        model = JobRequest
        fields = [
            'id', 'customer', 'service_category', 'description',
            'location_address', 'latitude', 'longitude', 'estimated_budget',
            'preferred_date', 'preferred_time', 'status', 'bookings',
            'created_at', 'updated_at'
        ]



class IssueReportSerializer(serializers.ModelSerializer):
    """Serializer for IssueReport model"""
    client_name = serializers.SerializerMethodField()
    client_email = serializers.SerializerMethodField()
    
    class Meta:
        model = IssueReport
        fields = [
            'id', 'client', 'client_name', 'client_email',
            'issue_type', 'booking_id', 'description',
            'status', 'admin_response',
            'created_at', 'updated_at', 'resolved_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'resolved_at']
    
    def get_client_name(self, obj):
        return f"{obj.client.user.first_name} {obj.client.user.last_name}".strip()
    
    def get_client_email(self, obj):
        return obj.client.user.email


class IssueReportCreateSerializer(serializers.Serializer):
    """Serializer for creating issue reports"""
    issue_type = serializers.ChoiceField(choices=['payment', 'worker', 'booking', 'service', 'other'])
    booking_id = serializers.CharField(max_length=100, required=True)
    description = serializers.CharField(max_length=2000)
