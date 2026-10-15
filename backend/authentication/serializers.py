"""
Serializers for authentication endpoints.
"""
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import SahayakUser, OTPVerification, UserRole, UserProfile


class UserRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRole
        fields = ['role', 'description']


class SahayakUserSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='role.get_role_display', read_only=True)
    role_name = serializers.CharField(source='role.role', read_only=True)
    
    class Meta:
        model = SahayakUser
        fields = [
            'id', 'username', 'email', 'phone_number', 'first_name',
            'last_name', 'role_name', 'role_display', 'is_verified',
            'is_phone_verified', 'preferred_language', 'profile_picture',
            'bio', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=['customer', 'individual_worker'])
    
    class Meta:
        model = SahayakUser
        fields = [
            'username', 'phone_number', 'email', 'first_name', 
            'last_name', 'password', 'password_confirm', 'role'
        ]
    
    def validate(self, data):
        if data['password'] != data.pop('password_confirm'):
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return data
    
    def create(self, validated_data):
        role_name = validated_data.pop('role')
        password = validated_data.pop('password')
        
        # Get or create role
        role, _ = UserRole.objects.get_or_create(role=role_name)
        
        # Create username if not provided
        if 'username' not in validated_data or not validated_data['username']:
            validated_data['username'] = validated_data['phone_number']
        
        user = SahayakUser.objects.create_user(
            password=password,
            role=role,
            is_active=True,  # Can be changed to False if phone verification is required
            **validated_data
        )
        return user


class OTPVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = OTPVerification
        fields = ['phone_number', 'is_verified']
        read_only_fields = ['is_verified']


class OTPRequestSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)


class OTPVerifySerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)
    otp_code = serializers.CharField(max_length=6)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer that includes user role and permissions."""
    
    # Add app_type field to validate against user role
    app_type = serializers.ChoiceField(
        choices=['client', 'worker'],
        required=False,
        write_only=True,
        help_text="Specify 'client' for client app or 'worker' for worker app"
    )
    
    def validate(self, attrs):
        # Get app_type before parent validation
        app_type = attrs.pop('app_type', None)
        
        data = super().validate(attrs)
        
        # Validate user role matches app type
        if app_type:
            user_role = self.user.role.role if self.user.role else None
            
            if app_type == 'client' and user_role != 'customer':
                raise serializers.ValidationError({
                    'error': 'Access denied. Only customers can login to the client app. Please use the worker app instead.'
                })
            
            if app_type == 'worker' and user_role not in ['individual_worker', 'organization_worker', 'organization_admin']:
                raise serializers.ValidationError({
                    'error': 'Access denied. Only workers can login to the worker app. Please use the client app instead.'
                })
        
        # Add custom user information
        data['user'] = {
            'id': str(self.user.id),
            'username': self.user.username,
            'email': self.user.email,
            'phone_number': self.user.phone_number,
            'full_name': self.user.get_full_name(),
            'role': self.user.role.role if self.user.role else None,
            'role_name': self.user.role.role if self.user.role else None,  # Add role_name for frontend consistency
            'role_display': self.user.role.get_role_display() if self.user.role else None,
            'is_verified': self.user.is_verified,
            'profile_picture': self.user.profile_picture.url if self.user.profile_picture else None,
        }
        
        # Add organization info for organization users
        if self.user.role and self.user.role.role in ['organization_admin', 'organization_worker']:
            try:
                from organization.models import Organisation, OrgWorker
                from users.models import OrganizationProfile
                
                if self.user.role.role == 'organization_admin':
                    # Check OrganizationProfile first (for registration_number)
                    org_profile = OrganizationProfile.objects.filter(user=self.user).first()
                    if org_profile:
                        # Use company_registration_number as org_id
                        reg_num = org_profile.company_registration_number
                        data['user']['organization'] = {
                            'id': str(org_profile.id),
                            'name': org_profile.company_name,
                            'role': 'admin',
                            'registration_number': reg_num
                        }
                        data['user']['registration_number'] = reg_num
                        data['user']['org_id'] = reg_num  # Also add as org_id for consistency
                        print(f"[OK] Added org info for {self.user.username}: {reg_num}")
                    else:
                        # Fallback to Organisation model
                        org = Organisation.objects.filter(admin_user=self.user).first()
                        if org:
                            data['user']['organization'] = {
                                'id': str(org.org_id),
                                'name': org.org_name,
                                'role': 'admin'
                            }
                            data['user']['registration_number'] = org.org_id
                            data['user']['org_id'] = org.org_id
                else:  # organization_worker
                    worker = OrgWorker.objects.filter(user=self.user).first()
                    if worker:
                        data['user']['organization'] = {
                            'id': str(worker.org_id),
                            'name': f'Organisation {worker.org_id}',
                            'role': 'worker'
                        }
                        data['user']['org_id'] = worker.org_id
            except Exception as e:
                print(f"[WARN] Error adding org info: {e}")
                pass
        
        return data
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims to token
        token['username'] = user.username
        token['role'] = user.role.role if user.role else None
        token['phone_number'] = user.phone_number
        token['is_verified'] = user.is_verified
        
        return token


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True, min_length=8)
    
    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({'new_password': 'Passwords do not match.'})
        return data



class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile information."""
    full_address = serializers.ReadOnlyField()
    user_id = serializers.UUIDField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user_id', 'username',
            'date_of_birth', 'gender', 'aadhaar_number',
            'street_address', 'city', 'state', 'pin_code', 'country',
            'full_address', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserProfileCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating user profile."""
    
    class Meta:
        model = UserProfile
        fields = [
            'date_of_birth', 'gender', 'aadhaar_number',
            'street_address', 'city', 'state', 'pin_code', 'country'
        ]
    
    def validate_aadhaar_number(self, value):
        """Validate Aadhaar number format."""
        if value and len(value) != 12:
            raise serializers.ValidationError('Aadhaar number must be exactly 12 digits.')
        if value and not value.isdigit():
            raise serializers.ValidationError('Aadhaar number must contain only digits.')
        return value
    
    def validate_pin_code(self, value):
        """Validate PIN code format."""
        if value and len(value) != 6:
            raise serializers.ValidationError('PIN code must be exactly 6 digits.')
        if value and not value.isdigit():
            raise serializers.ValidationError('PIN code must contain only digits.')
        return value


class SahayakUserWithProfileSerializer(serializers.ModelSerializer):
    """Complete user serializer with profile information."""
    role_display = serializers.CharField(source='role.get_role_display', read_only=True)
    role_name = serializers.CharField(source='role.role', read_only=True)
    profile = UserProfileSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    worker_profile = serializers.SerializerMethodField()
    customer_profile = serializers.SerializerMethodField()
    
    class Meta:
        model = SahayakUser
        fields = [
            'id', 'username', 'email', 'phone_number', 'first_name',
            'last_name', 'full_name', 'role_name', 'role_display', 'is_verified',
            'is_phone_verified', 'preferred_language', 'profile_picture',
            'bio', 'is_active', 'profile', 'worker_profile', 'customer_profile',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_worker_profile(self, obj):
        """Include worker profile if user is a worker."""
        if hasattr(obj, 'worker_profile'):
            from users.models import WorkerProfile
            try:
                profile = obj.worker_profile
                return {
                    'id': str(profile.id),
                    'service_categories': profile.service_categories,
                    'years_of_experience': profile.years_of_experience,
                    'hourly_rate': float(profile.hourly_rate) if profile.hourly_rate else 0.0,
                    'is_available': profile.is_available,
                    'primary_address': profile.primary_address,
                    'primary_city': profile.primary_city,
                    'primary_state': profile.primary_state,
                    'primary_latitude': profile.primary_latitude,
                    'primary_longitude': profile.primary_longitude,
                    'current_latitude': profile.current_latitude,
                    'current_longitude': profile.current_longitude,
                    'total_jobs_completed': profile.total_jobs_completed,
                    'average_rating': float(profile.average_rating) if profile.average_rating else 0.0,
                    'total_earnings': float(profile.total_earnings) if profile.total_earnings else 0.0,
                    'is_verified': profile.is_verified,
                    'voice_resume_url': (self.context.get('request').build_absolute_uri(profile.voice_resume_url) if self.context.get('request') else profile.voice_resume_url) if profile.voice_resume_url else None,
                }
            except WorkerProfile.DoesNotExist:
                return None
        return None
    
    def get_customer_profile(self, obj):
        """Include customer profile if user is a customer."""
        if hasattr(obj, 'customer_profile'):
            from users.models import CustomerProfile
            try:
                profile = obj.customer_profile
                return {
                    'id': str(profile.id),
                    'address': profile.address,
                    'city': profile.city,
                    'state': profile.state,
                    'pincode': profile.pincode,
                    'latitude': profile.latitude,
                    'longitude': profile.longitude,
                    'total_bookings': profile.total_bookings,
                    'average_rating': float(profile.average_rating) if profile.average_rating else 0.0,
                }
            except CustomerProfile.DoesNotExist:
                return None
        return None
