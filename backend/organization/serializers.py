"""
Serializers for Organisation System API.
"""
from rest_framework import serializers
from .models import Organisation, OrgWorker, OrgWorkRequest, OrgWorkAssignment
from authentication.models import SahayakUser


class OrganisationSerializer(serializers.ModelSerializer):
    """Serializer for Organisation model."""
    admin_name = serializers.SerializerMethodField()
    admin_email = serializers.SerializerMethodField()
    worker_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Organisation
        fields = ['org_id', 'org_name', 'admin_user', 'admin_name', 'admin_email', 'worker_count', 'created_at']
        read_only_fields = ['org_id', 'created_at']
    
    def get_admin_name(self, obj):
        return obj.admin_user.get_full_name()
    
    def get_admin_email(self, obj):
        return obj.admin_user.email
    
    def get_worker_count(self, obj):
        return obj.org_workers.count()


class OrgWorkerSerializer(serializers.ModelSerializer):
    """Serializer for OrgWorker model."""
    org_name = serializers.CharField(source='org.org_name', read_only=True)
    org_id = serializers.CharField(source='org.org_id', read_only=True)
    full_name = serializers.SerializerMethodField()
    credentials = serializers.SerializerMethodField()
    
    class Meta:
        model = OrgWorker
        fields = [
            'id', 'org', 'org_id', 'org_name', 'first_name', 'last_name', 
            'full_name', 'dob', 'address', 'experience', 'email', 
            'phone_number', 'username', 'credentials', 'created_at'
        ]
        read_only_fields = ['id', 'username', 'created_at']
        extra_kwargs = {
            'password_hash': {'write_only': True},
            'plain_password_display': {'write_only': True}
        }
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_credentials(self, obj):
        """Return credentials only if admin is viewing."""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            # Only show credentials to org admin
            if obj.org.admin_user == request.user:
                return {
                    'username': obj.username,
                    'password': obj.plain_password_display
                }
        return None
    
    def create(self, validated_data):
        """Create org worker and generate credentials."""
        worker = OrgWorker(**validated_data)
        worker.generate_credentials()
        worker.save()
        return worker


class OrgWorkerCreateSerializer(serializers.Serializer):
    """Serializer for creating org worker with all fields."""
    org_id = serializers.CharField()
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    dob = serializers.DateField(help_text='Format: YYYY-MM-DD')
    address = serializers.CharField()
    experience = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    phone_number = serializers.CharField(max_length=15)
    
    def validate_org_id(self, value):
        """Check if organisation exists."""
        try:
            Organisation.objects.get(org_id=value)
        except Organisation.DoesNotExist:
            raise serializers.ValidationError('Organisation not found.')
        return value
    
    def validate_phone_number(self, value):
        """Check if phone number is unique."""
        if OrgWorker.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError('Phone number already registered.')
        return value
    
    def validate_email(self, value):
        """Check if email is unique."""
        if OrgWorker.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already registered.')
        return value
    
    def create(self, validated_data):
        """Create worker and generate credentials."""
        org = Organisation.objects.get(org_id=validated_data.pop('org_id'))
        worker = OrgWorker(org=org, **validated_data)
        credentials = worker.generate_credentials()
        worker.save()
        
        # Return worker with credentials
        return {
            'worker': worker,
            'credentials': credentials
        }


class OrgWorkRequestSerializer(serializers.ModelSerializer):
    """Serializer for OrgWorkRequest model."""
    org_name = serializers.CharField(source='org.org_name', read_only=True)
    assignment_count = serializers.SerializerMethodField()
    translations = serializers.SerializerMethodField()
    
    class Meta:
        model = OrgWorkRequest
        fields = [
            'id', 'org', 'org_name', 'client_name', 'client_contact', 
            'work_description', 'work_type', 'work_location', 
            'required_date', 'required_time', 'status', 
            'service_charge', 'platform_fee', 'additional_charges',
            'additional_charges_reason', 'total_amount', 'payment_mode',
            'rating', 'feedback', 'completed_at',
            'assignment_count', 'created_at', 'translations'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_assignment_count(self, obj):
        if hasattr(obj, 'annotated_assignment_count'):
            return obj.annotated_assignment_count
        return obj.assignments.count()

    def get_translations(self, obj):
        return {
            translation.language: {
                'work_description': translation.work_description,
            }
            for translation in obj.translations.all()
        }


class OrgWorkRequestCreateSerializer(serializers.Serializer):
    """Serializer for creating work request from client."""
    org_id = serializers.CharField()
    client_name = serializers.CharField(max_length=255)
    client_contact = serializers.CharField(max_length=15)
    work_description = serializers.CharField()
    work_type = serializers.CharField(max_length=100)
    work_location = serializers.CharField(required=False, allow_blank=True)
    work_latitude = serializers.DecimalField(max_digits=10, decimal_places=7, required=False, allow_null=True)
    work_longitude = serializers.DecimalField(max_digits=10, decimal_places=7, required=False, allow_null=True)
    required_date = serializers.DateField(required=False, allow_null=True)
    required_time = serializers.TimeField(required=False, allow_null=True)
    service_charge = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0)
    source_language = serializers.ChoiceField(
        choices=[
            ('en', 'English'),
            ('mr', 'Marathi'),
            ('hi', 'Hindi'),
        ],
        write_only=True,
        required=True,
    )
    
    def validate_org_id(self, value):
        """Check if organisation exists."""
        try:
            Organisation.objects.get(org_id=value)
        except Organisation.DoesNotExist:
            raise serializers.ValidationError('Organisation not found.')
        return value
    
    def create(self, validated_data):
        """Create work request."""
        org = Organisation.objects.get(org_id=validated_data.pop('org_id'))
        source_language = validated_data.pop('source_language', None)
        # Set default service_charge if not provided
        if 'service_charge' not in validated_data:
            validated_data['service_charge'] = 0
        request = OrgWorkRequest.objects.create(org=org, **validated_data)
        return request


class OrgWorkAssignmentSerializer(serializers.ModelSerializer):
    """Serializer for OrgWorkAssignment model."""
    worker_name = serializers.CharField(source='org_worker.get_full_name', read_only=True)
    worker_phone = serializers.CharField(source='org_worker.phone_number', read_only=True)
    work_type = serializers.CharField(source='request.work_type', read_only=True)
    work_description = serializers.CharField(source='request.work_description', read_only=True)
    client_name = serializers.CharField(source='request.client_name', read_only=True)
    assigned_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = OrgWorkAssignment
        fields = [
            'id', 'request', 'org_worker', 'worker_name', 'worker_phone',
            'work_type', 'work_description', 'client_name',
            'assigned_by_admin', 'assigned_by_name', 'status', 
            'assigned_at', 'completed_at'
        ]
        read_only_fields = ['id', 'assigned_at', 'completed_at']
    
    def get_assigned_by_name(self, obj):
        if obj.assigned_by_admin:
            return obj.assigned_by_admin.get_full_name()
        return None


class AssignWorkSerializer(serializers.Serializer):
    """Serializer for assigning work to multiple workers."""
    request_id = serializers.IntegerField()
    worker_ids = serializers.ListField(
        child=serializers.IntegerField(),
        help_text='List of org worker IDs to assign'
    )
    
    def validate_request_id(self, value):
        """Check if work request exists and is accepted."""
        try:
            request = OrgWorkRequest.objects.get(id=value)
            if request.status != 'accepted':
                raise serializers.ValidationError('Work request must be accepted before assignment.')
        except OrgWorkRequest.DoesNotExist:
            raise serializers.ValidationError('Work request not found.')
        return value
    
    def validate_worker_ids(self, value):
        """Check if all workers exist."""
        if not value:
            raise serializers.ValidationError('At least one worker must be selected.')
        
        existing_workers = OrgWorker.objects.filter(id__in=value)
        if existing_workers.count() != len(value):
            raise serializers.ValidationError('One or more workers not found.')
        
        return value


class UpdateAssignmentStatusSerializer(serializers.Serializer):
    """Serializer for updating assignment status by org worker."""
    status = serializers.ChoiceField(choices=['in_progress', 'completed'])


class OrganisationStatsSerializer(serializers.Serializer):
    """Serializer for organisation statistics."""
    total_workers = serializers.IntegerField()
    total_requests = serializers.IntegerField()
    pending_requests = serializers.IntegerField()
    accepted_requests = serializers.IntegerField()
    total_assignments = serializers.IntegerField()
    completed_assignments = serializers.IntegerField()


class OrgWorkerStatsSerializer(serializers.Serializer):
    """Serializer for individual worker performance stats."""
    worker_id = serializers.IntegerField()
    worker_name = serializers.CharField()
    worker_phone = serializers.CharField()
    worker_email = serializers.CharField()
    total_assigned = serializers.IntegerField()
    in_progress = serializers.IntegerField()
    completed = serializers.IntegerField()
    pending = serializers.IntegerField()
    assignments = OrgWorkAssignmentSerializer(many=True)
