"""
Serializers for user profiles.
"""
from rest_framework import serializers
from authentication.models import SahayakUser
from .models import CustomerProfile, WorkerProfile, OrganizationProfile, OrganizationWorker


class CustomerProfileSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = CustomerProfile
        fields = [
            'id', 'user', 'address', 'city', 'state', 'pincode',
            'latitude', 'longitude', 'preferred_worker_skills',
            'total_bookings', 'average_rating', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'total_bookings', 'average_rating', 'created_at', 'updated_at']


class WorkerProfileSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = WorkerProfile
        fields = [
            'id', 'user', 'bio', 'skills', 'years_of_experience',
            'certifications', 'service_categories', 'hourly_rate',
            'is_available', 'availability_schedule', 'address', 'city',
            'state', 'pincode', 'latitude', 'longitude', 'voice_resume_url',
            'total_jobs_completed', 'average_rating', 'total_earnings', 'pending_platform_fees',
            'is_verified', 'verification_documents', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'total_jobs_completed', 'average_rating',
            'total_earnings', 'pending_platform_fees', 'created_at', 'updated_at'
        ]


class OrganizationWorkerSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationWorker
        fields = [
            'id', 'organization', 'worker', 'job_title',
            'employment_type', 'is_active', 'joined_at', 'updated_at'
        ]
        read_only_fields = ['id', 'joined_at', 'updated_at']


class OrganizationProfileSerializer(serializers.ModelSerializer):
    workers = OrganizationWorkerSerializer(many=True, read_only=True)
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = OrganizationProfile
        fields = [
            'id', 'user', 'company_name', 'company_registration_number',
            'industry_type', 'company_website', 'company_email', 'company_phone',
            'address', 'city', 'state', 'pincode', 'latitude', 'longitude',
            'description', 'company_logo', 'total_workers', 'total_jobs_posted',
            'is_verified', 'workers', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'total_workers', 'total_jobs_posted',
            'created_at', 'updated_at'
        ]
