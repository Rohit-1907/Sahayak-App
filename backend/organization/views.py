"""
API views for Organisation System.
All endpoints prefixed with /api/v1/org/
"""
from rest_framework import viewsets, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db import transaction
from django.contrib.auth.hashers import check_password
from django.db.models import Count, Q
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import datetime
import uuid

from .models import Organisation, OrgWorker, OrgWorkRequest, OrgWorkAssignment
from users.models import OrganizationProfile
from authentication.models import SahayakUser
from .serializers import (
    OrganisationSerializer, OrgWorkerSerializer, OrgWorkerCreateSerializer,
    OrgWorkRequestSerializer, OrgWorkRequestCreateSerializer,
    OrgWorkAssignmentSerializer, AssignWorkSerializer,
    UpdateAssignmentStatusSerializer, OrganisationStatsSerializer,
    OrgWorkerStatsSerializer
)
from .org_work_request_translation_service import synchronize_org_work_request_translations


# =====================================================
# ORGANISATION MANAGEMENT
# =====================================================

class OrganisationViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for Organisations.
    Only admins can manage their own organisations.
    """
    serializer_class = OrganisationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return organisations managed by current user."""
        return Organisation.objects.filter(admin_user=self.request.user)
    
    def perform_create(self, serializer):
        """Create organisation with current user as admin."""
        serializer.save(admin_user=self.request.user)
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Get statistics for an organisation."""
        org = self.get_object()
        
        stats = {
            'total_workers': org.org_workers.count(),
            'total_requests': org.work_requests.count(),
            'pending_requests': org.work_requests.filter(status='pending').count(),
            'accepted_requests': org.work_requests.filter(status='accepted').count(),
            'total_assignments': OrgWorkAssignment.objects.filter(
                request__org=org
            ).count(),
            'completed_assignments': OrgWorkAssignment.objects.filter(
                request__org=org, status='completed'
            ).count(),
        }
        
        serializer = OrganisationStatsSerializer(stats)
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_organisation(request):
    """
    Create a new organisation.
    Current user becomes the admin.
    """
    try:
        org_name = request.data.get('org_name')
        
        if not org_name:
            return Response({
                'success': False,
                'error': 'Organisation name is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already has an organisation
        if Organisation.objects.filter(admin_user=request.user).exists():
            return Response({
                'success': False,
                'error': 'You already have an organisation registered.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create organisation
        org = Organisation.objects.create(
            org_name=org_name,
            admin_user=request.user
        )
        
        serializer = OrganisationSerializer(org)
        return Response({
            'success': True,
            'message': 'Organisation created successfully.',
            'organisation': serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =====================================================
# ORG WORKER MANAGEMENT
# =====================================================

class OrgPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100


class OrgWorkerViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for Organisation Workers.
    Only org admins can manage workers in their organisation.
    """
    serializer_class = OrgWorkerSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = OrgPagination
    
    def get_queryset(self):
        """Return workers from organisations managed by current user."""
        org_id = self.request.query_params.get('org_id')
        
        queryset = OrgWorker.objects.filter(
            org__admin_user=self.request.user
        ).select_related('org')
        
        if org_id:
            queryset = queryset.filter(org__org_id=org_id)
        
        return queryset.order_by('-created_at')
    
    def get_serializer_context(self):
        """Pass request to serializer for credential access control."""
        return {'request': self.request}


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_org_worker(request):
    """
    Add a new worker to organisation with auto-generated credentials.
    """
    try:
        serializer = OrgWorkerCreateSerializer(data=request.data)
        
        if not serializer.is_valid():
            print(f"[FAIL] Validation errors: {serializer.errors}")
            print(f"[RES] Request data: {request.data}")
            return Response({
                'success': False,
                'errors': serializer.errors,
                'error': str(serializer.errors)  # Add string version for frontend
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if requesting user is the org admin
        org_id = request.data.get('org_id')
        try:
            org = Organisation.objects.get(org_id=org_id)
            if org.admin_user != request.user:
                return Response({
                    'success': False,
                    'error': 'You are not authorized to add workers to this organisation.'
                }, status=status.HTTP_403_FORBIDDEN)
        except Organisation.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Organisation not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Create worker
        result = serializer.save()
        worker = result['worker']
        credentials = result['credentials']
        
        return Response({
            'success': True,
            'message': 'Worker added successfully.',
            'worker': {
                'id': worker.id,
                'full_name': worker.get_full_name(),
                'email': worker.email,
                'phone_number': worker.phone_number,
                'experience': worker.experience,
                'org_id': worker.org.org_id,
                'org_name': worker.org.org_name
            },
            'credentials': credentials
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_worker_credentials(request, worker_id):
    """
    Get credentials for a specific worker.
    Only org admin can view credentials.
    """
    try:
        worker = OrgWorker.objects.get(id=worker_id)
        
        # Check if requesting user is the org admin
        if worker.org.admin_user != request.user:
            return Response({
                'success': False,
                'error': 'Unauthorized access.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        return Response({
            'success': True,
            'credentials': {
                'full_name': worker.get_full_name(),
                'username': worker.username,
                'password': worker.plain_password_display
            }
        })
        
    except OrgWorker.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Worker not found.'
        }, status=status.HTTP_404_NOT_FOUND)


# =====================================================
# ORG WORKER AUTHENTICATION
# =====================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def org_worker_login(request):
    """
    Login for organisation workers.
    Separate authentication from regular workers.
    Now generates real JWT tokens for push notification support.
    """
    try:
        username = request.data.get('username')
        password = request.data.get('password')
        
        print(f"[AUTH] Org Worker Login attempt - Username: {username}")
        
        if not username or not password:
            return Response({
                'success': False,
                'error': 'Username and password are required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Find worker by username
        try:
            worker = OrgWorker.objects.get(username=username)
            print(f"[OK] Found worker: {worker.get_full_name()}")
        except OrgWorker.DoesNotExist:
            print(f"[FAIL] Worker not found with username: {username}")
            return Response({
                'success': False,
                'error': 'Invalid credentials.'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check password
        password_valid = check_password(password, worker.password_hash)
        print(f"[AUTH] Password check result: {password_valid}")
        
        if not password_valid:
            print(f"[FAIL] Password mismatch")
            return Response({
                'success': False,
                'error': 'Invalid credentials.'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        print(f"[OK] Login successful for {worker.get_full_name()}")
        
        # Get organization service type from OrganizationProfile
        org_service_type = 'Not specified'
        try:
            from users.models import OrganizationProfile
            org_profile = OrganizationProfile.objects.get(user=worker.org.admin_user)
            org_service_type = org_profile.industry_type or 'Not specified'
        except OrganizationProfile.DoesNotExist:
            print(f"[WARN] No OrganizationProfile found for admin user")
        
        # Generate JWT token using worker's own SahayakUser so device push tokens register directly to worker
        from rest_framework_simplejwt.tokens import RefreshToken
        from authentication.models import SahayakUser, UserRole
        
        role_obj, _ = UserRole.objects.get_or_create(role='organization_worker')
        worker_user = (
            SahayakUser.objects.filter(phone_number=worker.phone_number).first()
            or SahayakUser.objects.filter(username=worker.username).first()
            or (SahayakUser.objects.filter(email=worker.email).first() if worker.email else None)
        )
        if not worker_user:
            worker_user = SahayakUser.objects.create(
                username=worker.username,
                phone_number=worker.phone_number,
                email=worker.email,
                first_name=worker.first_name,
                last_name=worker.last_name,
                role=role_obj,
                is_active=True,
            )
        elif not worker_user.role:
            worker_user.role = role_obj
            worker_user.save()
        
        refresh = RefreshToken.for_user(worker_user)
        
        # Add custom claims to identify this as an org worker
        refresh['role'] = 'organization_worker'
        refresh['org_worker_id'] = worker.id
        refresh['org_id'] = worker.org.org_id
        refresh['org_worker_name'] = worker.get_full_name()
        
        # Also set on access token
        access_token = refresh.access_token
        access_token['role'] = 'organization_worker'
        access_token['org_worker_id'] = worker.id
        access_token['org_id'] = worker.org.org_id
        access_token['org_worker_name'] = worker.get_full_name()
        
        token_data = {
            'worker_id': worker.id,
            'org_id': worker.org.org_id,
            'role': 'org_worker',
            'username': worker.username,
            'full_name': worker.get_full_name()
        }
        
        print(f"[AUTH] Generated JWT for org worker {worker.get_full_name()} via worker user {worker_user.username}")
        
        return Response({
            'success': True,
            'message': 'Login successful.',
            'user': {
                'id': worker.id,
                'username': worker.username,
                'full_name': worker.get_full_name(),
                'email': worker.email,
                'phone_number': worker.phone_number,
                'address': worker.address,
                'experience': worker.experience,
                'role': 'org_worker',
                'org_id': worker.org.org_id,
                'org_name': worker.org.org_name,
                'organization_name': worker.org.org_name,
                'organization_type': org_service_type,
                'service_type': org_service_type,
            },
            'token': token_data,
            'access': str(access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        print(f"[FAIL] Org worker login error: {e}\n{traceback.format_exc()}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =====================================================
# WORK REQUEST MANAGEMENT (CLIENT-FACING)
# =====================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def create_work_request(request):
    """
    Public endpoint for clients to submit work requests to organisations.
    The request goes to the organization admin.
    """
    try:
        print(f"[RES] Organization work request data: {request.data}")
        
        serializer = OrgWorkRequestCreateSerializer(data=request.data)
        
        if not serializer.is_valid():
            print(f"[FAIL] Validation errors: {serializer.errors}")
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        work_request = serializer.save()

        # Synchronize translations into all supported languages
        try:
            synchronize_org_work_request_translations(
                work_request,
                serializer.validated_data['source_language'],
            )
            print(f"[TRANS] Synchronized translations for language: {serializer.validated_data['source_language']}")
        except Exception as translate_error:
            import logging
            logging.getLogger(__name__).error(f"Failed to synchronize translations: {translate_error}")
            # Don't fail the request if translation synchronization fails

        print(f"[OK] Organization work request created:")
        print(f"   Request ID: {work_request.id}")
        print(f"   Org ID: {work_request.org.org_id}")
        print(f"   Org Name: {work_request.org.org_name}")
        print(f"   Admin User: {work_request.org.admin_user.email if work_request.org.admin_user else 'None'}")
        print(f"   Client: {work_request.client_name}")
        print(f"   Status: {work_request.status}")
        
        # Send notification to organization admin
        try:
            from notifications.notification_manager import notification_manager
            import logging
            logger = logging.getLogger(__name__)
            
            admin_user = work_request.org.admin_user
            if admin_user:
                print(f"[REQ] Dispatching new request notification to org admin {admin_user.email} (ID: {admin_user.id})")
                notification_manager.send_org_work_request_notification(admin_user, work_request)
            else:
                logger.warning(f"No admin_user associated with organization {work_request.org.org_id}")
        except Exception as notif_err:
            print(f"[WARN] Failed to send organization work request notification to admin: {notif_err}")
            import traceback
            traceback.print_exc()

        # Also send confirmation notification to the client if client user exists
        try:
            from authentication.models import SahayakUser
            client_user = None
            if hasattr(request, 'user') and request.user and request.user.is_authenticated:
                client_user = request.user
            elif work_request.client_contact:
                client_user = SahayakUser.objects.filter(phone_number=work_request.client_contact).first()
                
            if client_user:
                from notifications.notification_manager import notification_manager, NotificationPayload
                client_payload = NotificationPayload(
                    title="Request Sent! ",
                    body=f"Your request for {work_request.work_type} has been sent to {work_request.org.org_name}.",
                    data={
                        'type': 'job_request',
                        'work_request_id': str(work_request.id),
                        'org_id': str(work_request.org.org_id),
                        'status': 'pending',
                    },
                    priority='high',
                )
                notification_manager.send_to_user(client_user, client_payload)
        except Exception as client_err:
            print(f"[WARN] Failed to send confirmation notification to client: {client_err}")
        
        return Response({
            'success': True,
            'message': 'Work request submitted successfully to organization admin.',
            'request': {
                'id': work_request.id,
                'org_id': work_request.org.org_id,
                'org_name': work_request.org.org_name,
                'work_type': work_request.work_type,
                'status': work_request.status,
                'created_at': work_request.created_at.isoformat()
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_client_org_requests(request):
    """
    Get organization work requests for the logged-in client.
    Returns all requests created by this client to organizations.
    """
    try:
        # Get client's phone number from the authenticated user
        client_phone = request.user.phone_number
        
        print(f"[CALL] Fetching org requests for client: {client_phone}")
        
        # Get all organization work requests from this client with preloaded relations
        org_requests = OrgWorkRequest.objects.filter(
            client_contact=client_phone
        ).select_related('org').annotate(
            annotated_assignment_count=Count('assignments')
        ).order_by('-created_at')
        
        serializer = OrgWorkRequestSerializer(org_requests, many=True)
        data = serializer.data
        
        return Response({
            'success': True,
            'count': len(data),
            'requests': data
        })
        
    except Exception as e:
        print(f"[FAIL] Error fetching client org requests: {e}")
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def list_organisations(request):
    """
    Public endpoint to list all organisations for client selection.
    Can filter by service_type (industry_type from OrganizationProfile).
    """
    try:
        service_type = request.GET.get('service_type')
        
        if service_type:
            # Filter organizations by service type
            from users.models import OrganizationProfile
            
            # Get org profiles matching the service type
            org_profiles = OrganizationProfile.objects.filter(
                industry_type__iexact=service_type
            ).select_related('user')
            
            # Get corresponding Organisation entries
            admin_users = [profile.user for profile in org_profiles]
            orgs = Organisation.objects.filter(admin_user__in=admin_users)
            
            # Build response with service type info
            org_list = []
            for org in orgs:
                try:
                    org_profile = OrganizationProfile.objects.get(user=org.admin_user)
                    org_list.append({
                        'org_id': org.org_id,
                        'org_name': org.org_name,
                        'service_type': org_profile.industry_type,
                        'company_name': org_profile.company_name,
                        'company_phone': org_profile.company_phone,
                        'company_email': org_profile.company_email,
                        'address': org_profile.address,
                        'city': org_profile.city,
                        'state': org_profile.state,
                        'description': org_profile.description,
                        'created_at': org.created_at.isoformat() if org.created_at else None,
                        'worker_count': org.org_workers.count(),
                    })
                except OrganizationProfile.DoesNotExist:
                    continue
            
            return Response({
                'success': True,
                'organisations': org_list,
                'count': len(org_list)
            })
        else:
            # Return all organizations
            orgs = Organisation.objects.all().order_by('org_name')
            serializer = OrganisationSerializer(orgs, many=True)
            return Response({
                'success': True,
                'organisations': serializer.data
            })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =====================================================
# WORK REQUEST MANAGEMENT (ADMIN)
# =====================================================

class OrgWorkRequestPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100


class OrgWorkRequestViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for Work Requests.
    Org admins can view and manage requests for their organisations.
    """
    serializer_class = OrgWorkRequestSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = OrgWorkRequestPagination
    
    def get_queryset(self):
        """Return requests for organisations managed by current user."""
        queryset = OrgWorkRequest.objects.filter(
            org__admin_user=self.request.user
        ).select_related('org').annotate(
            annotated_assignment_count=Count('assignments')
        )
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Accept a work request."""
        work_request = self.get_object()
        
        if work_request.status != 'pending':
            return Response({
                'success': False,
                'error': 'Only pending requests can be accepted.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        work_request.status = 'accepted'
        work_request.save()
        
        # Notify client that organization accepted the request
        try:
            from notifications.notification_manager import notification_manager
            import logging
            logger = logging.getLogger(__name__)
            
            # Get client user (organization work requests have client_contact, need to find user by phone)
            from authentication.models import SahayakUser
            try:
                client_user = SahayakUser.objects.get(phone_number=work_request.client_contact)
                org_name = work_request.org.org_name if hasattr(work_request, 'org') else 'Organization'
                
                # Note: OrgWorkRequest uses work_type instead of service_category
                # Temporarily add service_category for notification compatibility
                work_request.service_category = work_request.work_type
                
                notification_manager.send_job_accepted_notification(client_user, work_request, org_name)
            except SahayakUser.DoesNotExist:
                logger.warning(f"Could not find user with phone number {work_request.client_contact} for notification")
        except Exception as e:
            logger.error(f"Failed to send organization acceptance notification: {e}")
        
        serializer = self.get_serializer(work_request)
        return Response({
            'success': True,
            'message': 'Work request accepted.',
            'request': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a work request."""
        work_request = self.get_object()
        
        if work_request.status != 'pending':
            return Response({
                'success': False,
                'error': 'Only pending requests can be rejected.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        work_request.status = 'rejected'
        work_request.save()
        
        # Notify client that organization rejected the request
        try:
            from notifications.notification_manager import notification_manager
            import logging
            logger = logging.getLogger(__name__)
            
            from authentication.models import SahayakUser
            try:
                client_user = SahayakUser.objects.get(phone_number=work_request.client_contact)
                org_name = work_request.org.org_name if hasattr(work_request, 'org') else 'Organization'
                reason = request.data.get('reason', 'No reason provided')
                
                # Note: OrgWorkRequest uses work_type instead of service_category
                # Temporarily add service_category for notification compatibility
                work_request.service_category = work_request.work_type
                
                notification_manager.send_job_rejected_notification(client_user, work_request, org_name, reason)
            except SahayakUser.DoesNotExist:
                logger.warning(f"Could not find user with phone number {work_request.client_contact} for notification")
        except Exception as e:
            logger.error(f"Failed to send organization rejection notification: {e}")
        
        serializer = self.get_serializer(work_request)
        return Response({
            'success': True,
            'message': 'Work request rejected.',
            'request': serializer.data
        })


# =====================================================
# WORK ASSIGNMENT MANAGEMENT
# =====================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_work(request):
    """
    Assign accepted work request to one or more org workers.
    """
    try:
        serializer = AssignWorkSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        request_id = serializer.validated_data['request_id']
        worker_ids = serializer.validated_data['worker_ids']
        
        # Get work request
        work_request = OrgWorkRequest.objects.select_related('org').get(id=request_id)
        
        # Check if requesting user is the org admin
        if work_request.org.admin_user != request.user:
            return Response({
                'success': False,
                'error': 'Unauthorized access.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Create assignments
        assignments = []
        assigned_workers = []
        with transaction.atomic():
            for worker_id in worker_ids:
                worker = OrgWorker.objects.get(id=worker_id)
                
                # Check if worker belongs to same org
                if worker.org != work_request.org:
                    return Response({
                        'success': False,
                        'error': f'Worker {worker.get_full_name()} does not belong to this organisation.'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Create assignment
                assignment = OrgWorkAssignment.objects.create(
                    request=work_request,
                    org_worker=worker,
                    assigned_by_admin=request.user
                )
                assignments.append(assignment)
                assigned_workers.append(worker)

        # Notify assigned workers and client about assignment
        try:
            from notifications.notification_manager import notification_manager, NotificationPayload
            from authentication.models import SahayakUser, UserRole, DeviceToken
            import logging
            logger = logging.getLogger(__name__)

            role_obj, _ = UserRole.objects.get_or_create(role='organization_worker')
            org_name = work_request.org.org_name if hasattr(work_request, 'org') else 'Organization'

            # 1. Send push notification to each assigned worker
            for worker in assigned_workers:
                try:
                    worker_user = (
                        SahayakUser.objects.filter(phone_number=worker.phone_number).first()
                        or SahayakUser.objects.filter(username=worker.username).first()
                        or (SahayakUser.objects.filter(email=worker.email).first() if worker.email else None)
                    )
                    if not worker_user:
                        worker_user = SahayakUser.objects.create(
                            username=worker.username,
                            phone_number=worker.phone_number,
                            email=worker.email,
                            first_name=worker.first_name,
                            last_name=worker.last_name,
                            role=role_obj,
                            is_active=True,
                        )

                    worker_payload = NotificationPayload(
                        title="New Work Assigned! ",
                        body=f"You have been assigned to '{work_request.work_type}' for {work_request.client_name} by {org_name}.",
                        data={
                            'type': 'work_assigned',
                            'work_request_id': str(work_request.id),
                            'assignment_id': str(assignment.id),
                            'role': 'org_worker',
                        },
                        priority='high',
                    )
                    logger.info(f"[REQ] Dispatching work assigned notification to worker {worker.get_full_name()} (user {worker_user.id})")
                    notification_manager.send_to_user(worker_user, worker_payload)

                    # If worker has no active device tokens on file, also notify current admin user
                    # so push notification is seen during testing
                    if not DeviceToken.objects.filter(user=worker_user, is_active=True).exists():
                        admin_test_payload = NotificationPayload(
                            title=f"Work Assigned: {worker.get_full_name()} ",
                            body=f"{worker.get_full_name()} assigned to '{work_request.work_type}' for {work_request.client_name}.",
                            data={
                                'type': 'work_assigned',
                                'work_request_id': str(work_request.id),
                                'worker_id': str(worker.id),
                            },
                            priority='high',
                        )
                        notification_manager.send_to_user(request.user, admin_test_payload)
                except Exception as w_err:
                    logger.error(f"Failed to send assignment notification to worker {worker.id}: {w_err}")

            # 2. Send push notification to the client
            try:
                client_user = SahayakUser.objects.filter(phone_number=work_request.client_contact).first()
                if client_user:
                    names_str = ", ".join([w.get_full_name() for w in assigned_workers])
                    client_payload = NotificationPayload(
                        title="Worker Assigned! ",
                        body=f"{names_str} from {org_name} has been assigned to your '{work_request.work_type}' request.",
                        data={
                            'type': 'worker_assigned',
                            'work_request_id': str(work_request.id),
                            'org_id': str(work_request.org.org_id),
                        },
                        priority='high',
                    )
                    logger.info(f"[REQ] Dispatching worker assigned notification to client {client_user.id}")
                    notification_manager.send_to_user(client_user, client_payload)
            except Exception as c_err:
                logger.error(f"Failed to send worker assigned notification to client: {c_err}")

        except Exception as notif_outer:
            print(f"[WARN] Notification dispatch error: {notif_outer}")

        return Response({
            'success': True,
            'message': f'Work assigned to {len(assignments)} worker(s).',
            'assignments': OrgWorkAssignmentSerializer(assignments, many=True).data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_worker_assignments(request, worker_id):
    """
    Get all assignments for a specific org worker.
    Used by org worker app to see their jobs.
    """
    try:
        # Get worker
        worker = OrgWorker.objects.get(id=worker_id)
        
        # Get assignments
        status_filter = request.query_params.get('status')
        assignments = OrgWorkAssignment.objects.filter(org_worker=worker)
        
        if status_filter:
            assignments = assignments.filter(status=status_filter)
        
        assignments = assignments.order_by('-assigned_at')
        
        serializer = OrgWorkAssignmentSerializer(assignments, many=True)
        return Response({
            'success': True,
            'assignments': serializer.data
        })
        
    except OrgWorker.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Worker not found.'
        }, status=status.HTTP_404_NOT_FOUND)


def notify_assignment_status_change(assignment, new_status, worker=None):
    """
    Dispatch push notifications when an org worker starts or completes an assignment.
    Notifies:
      1. The worker themselves (confirmation)
      2. The organization admin (status alert)
      3. The client (progress update)
    """
    try:
        from notifications.notification_manager import notification_manager, NotificationPayload
        from authentication.models import SahayakUser, UserRole, DeviceToken
        import logging
        logger = logging.getLogger(__name__)

        if not worker:
            worker = assignment.org_worker

        work_request = assignment.request
        worker_name = worker.get_full_name()
        work_type = work_request.work_type
        client_name = work_request.client_name

        # 1. Worker's SahayakUser
        role_obj, _ = UserRole.objects.get_or_create(role='organization_worker')
        worker_user = (
            SahayakUser.objects.filter(phone_number=worker.phone_number).first()
            or SahayakUser.objects.filter(username=worker.username).first()
            or (SahayakUser.objects.filter(email=worker.email).first() if worker.email else None)
        )
        if not worker_user:
            worker_user = SahayakUser.objects.create(
                username=worker.username,
                phone_number=worker.phone_number,
                email=worker.email,
                first_name=worker.first_name,
                last_name=worker.last_name,
                role=role_obj,
                is_active=True,
            )

        # 2. Admin's SahayakUser
        admin_user = getattr(work_request.org, 'admin_user', None) or assignment.assigned_by_admin

        # 3. Client's SahayakUser
        client_user = SahayakUser.objects.filter(phone_number=work_request.client_contact).first()

        if new_status == 'in_progress':
            worker_payload = NotificationPayload(
                title="Work Started! ",
                body=f"You started work on '{work_type}' for {client_name}.",
                data={
                    'type': 'work_started',
                    'assignment_id': str(assignment.id),
                    'work_request_id': str(work_request.id),
                    'status': 'in_progress',
                },
                priority='high',
            )
            admin_payload = NotificationPayload(
                title=f"Work Started: {worker_name} ",
                body=f"{worker_name} has started work on '{work_type}' for {client_name}.",
                data={
                    'type': 'work_started',
                    'assignment_id': str(assignment.id),
                    'work_request_id': str(work_request.id),
                    'worker_id': str(worker.id),
                    'status': 'in_progress',
                },
                priority='high',
            )
            client_payload = NotificationPayload(
                title="Work Started! ",
                body=f"{worker_name} has started work on your '{work_type}' request.",
                data={
                    'type': 'work_started',
                    'work_request_id': str(work_request.id),
                    'status': 'in_progress',
                },
                priority='high',
            )
        elif new_status == 'completed':
            worker_payload = NotificationPayload(
                title="Work Completed! ",
                body=f"You marked '{work_type}' for {client_name} as completed.",
                data={
                    'type': 'work_completed',
                    'assignment_id': str(assignment.id),
                    'work_request_id': str(work_request.id),
                    'status': 'completed',
                },
                priority='high',
            )
            admin_payload = NotificationPayload(
                title=f"Work Completed: {worker_name} ",
                body=f"{worker_name} has completed work on '{work_type}' for {client_name}.",
                data={
                    'type': 'work_completed',
                    'assignment_id': str(assignment.id),
                    'work_request_id': str(work_request.id),
                    'worker_id': str(worker.id),
                    'status': 'completed',
                },
                priority='high',
            )
            client_payload = NotificationPayload(
                title="Work Completed! ",
                body=f"{worker_name} has completed your '{work_type}' request.",
                data={
                    'type': 'work_completed',
                    'work_request_id': str(work_request.id),
                    'status': 'completed',
                },
                priority='high',
            )
        else:
            return

        # Send to worker
        try:
            logger.info(f"[REQ] Dispatching {new_status} notification to worker {worker_name} ({worker_user.id})")
            notification_manager.send_to_user(worker_user, worker_payload)
            # If worker has no active device token on file, also notify admin so push notification is seen
            if not DeviceToken.objects.filter(user=worker_user, is_active=True).exists() and admin_user:
                notification_manager.send_to_user(admin_user, worker_payload)
        except Exception as err:
            logger.error(f"Failed to notify worker {worker.id} of {new_status}: {err}")

        # Send to admin
        if admin_user:
            try:
                logger.info(f"[REQ] Dispatching {new_status} notification to admin {admin_user.id}")
                notification_manager.send_to_user(admin_user, admin_payload)
            except Exception as err:
                logger.error(f"Failed to notify admin of {new_status}: {err}")

        # Send to client
        if client_user:
            try:
                logger.info(f"[REQ] Dispatching {new_status} notification to client {client_user.id}")
                notification_manager.send_to_user(client_user, client_payload)
            except Exception as err:
                logger.error(f"Failed to notify client of {new_status}: {err}")

    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Error in notify_assignment_status_change: {e}")


@api_view(['PATCH'])
@permission_classes([AllowAny])  # Org workers aren't SahayakUser, so allow any
def update_assignment_status(request, assignment_id):
    """
    Update assignment status (org worker marks as in_progress or completed).
    """
    try:
        assignment = OrgWorkAssignment.objects.select_related('request', 'request__org', 'org_worker').get(id=assignment_id)
        
        serializer = UpdateAssignmentStatusSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        new_status = serializer.validated_data['status']
        assignment.status = new_status
        
        if new_status == 'completed':
            assignment.completed_at = datetime.now()
        elif new_status == 'in_progress' and not assignment.started_at:
            assignment.started_at = datetime.now()
        
        assignment.save()

        # Dispatch notifications
        notify_assignment_status_change(assignment, new_status, assignment.org_worker)
        
        return Response({
            'success': True,
            'message': f'Assignment marked as {new_status}.',
            'assignment': OrgWorkAssignmentSerializer(assignment).data
        })
        
    except OrgWorkAssignment.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Assignment not found.'
        }, status=status.HTTP_404_NOT_FOUND)


# =====================================================
# PERFORMANCE & STATISTICS
# =====================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_organisation_performance(request, org_id):
    """
    Get performance statistics for all workers in an organisation.
    """
    try:
        org = Organisation.objects.get(org_id=org_id)
        
        # Check if requesting user is the org admin
        if org.admin_user != request.user:
            return Response({
                'success': False,
                'error': 'Unauthorized access.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get all workers with their stats
        workers = org.org_workers.all()
        worker_stats = []
        
        for worker in workers:
            assignments = OrgWorkAssignment.objects.filter(org_worker=worker)
            
            stats = {
                'worker_id': worker.id,
                'worker_name': worker.get_full_name(),
                'worker_phone': worker.phone_number,
                'worker_email': worker.email,
                'total_assigned': assignments.count(),
                'in_progress': assignments.filter(status='in_progress').count(),
                'completed': assignments.filter(status='completed').count(),
                'pending': assignments.filter(status='assigned').count(),
                'assignments': OrgWorkAssignmentSerializer(
                    assignments.order_by('-assigned_at'), many=True
                ).data
            }
            worker_stats.append(stats)
        
        return Response({
            'success': True,
            'org_name': org.org_name,
            'workers': worker_stats
        })
        
    except Organisation.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Organisation not found.'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_worker_performance(request, worker_id):
    """
    Get detailed performance statistics for a specific worker.
    """
    try:
        print(f"[SEARCH] get_worker_performance called with worker_id: {worker_id}")
        print(f"[USER] Requesting user: {request.user}, ID: {request.user.id}")
        
        worker = OrgWorker.objects.get(id=worker_id)
        print(f"[WORKER] Found worker: {worker.get_full_name()}, Org: {worker.org.org_id}")
        print(f"[ORG] Worker's org admin: {worker.org.admin_user}, ID: {worker.org.admin_user.id}")
        
        # Check if requesting user is the org admin
        if worker.org.admin_user != request.user:
            print(f"[FAIL] Authorization failed: {worker.org.admin_user} != {request.user}")
            return Response({
                'success': False,
                'error': 'Unauthorized access.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        print(f"[OK] Authorization passed")
        
        assignments = OrgWorkAssignment.objects.filter(org_worker=worker)
        print(f"[TASK] Found {assignments.count()} assignments")
        
        stats = {
            'worker_id': worker.id,
            'worker_name': worker.get_full_name(),
            'worker_phone': worker.phone_number,
            'worker_email': worker.email,
            'total_assigned': assignments.count(),
            'in_progress': assignments.filter(status='in_progress').count(),
            'completed': assignments.filter(status='completed').count(),
            'pending': assignments.filter(status='assigned').count(),
            'assignments': assignments.order_by('-assigned_at')  # Pass objects, not serialized data
        }
        
        serializer = OrgWorkerStatsSerializer(stats)
        print(f"[OK] Returning performance data")
        return Response({
            'success': True,
            'stats': serializer.data
        })
        
    except OrgWorker.DoesNotExist:
        print(f"[FAIL] Worker with ID {worker_id} not found")
        return Response({
            'success': False,
            'error': 'Worker not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"[FAIL] Unexpected error in get_worker_performance: {e}")
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =====================================================
# ORG WORKER APP ENDPOINTS (WORKER-SPECIFIC)
# =====================================================

@api_view(['GET'])
@permission_classes([AllowAny])  # Org workers use token-based auth
def get_worker_assigned_work(request):
    """
    Get assigned work for logged-in org worker.
    Token should contain worker_id.
    """
    try:
        # Extract worker_id from token (passed in headers or query)
        worker_id = request.GET.get('worker_id') or request.headers.get('X-Worker-ID')
        
        if not worker_id:
            return Response({
                'success': False,
                'error': 'Worker ID required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        worker = OrgWorker.objects.get(id=worker_id)
        
        # Get assigned work (status = 'assigned')
        assignments = OrgWorkAssignment.objects.filter(
            org_worker=worker,
            status='assigned'
        ).select_related('request', 'request__org', 'assigned_by_admin').order_by('-assigned_at')
        
        work_list = []
        for assignment in assignments:
            work_list.append({
                'id': assignment.id,
                'title': assignment.request.work_type,
                'location': assignment.request.work_location or 'Location not provided',
                'client': assignment.request.client_name,
                'contact': assignment.request.client_contact,
                'description': assignment.request.work_description,
                'translations': {
                    translation.language: {'work_description': translation.work_description}
                    for translation in assignment.request.translations.all()
                },
                'assigned_at': assignment.assigned_at.isoformat(),
                'status': assignment.status,
                'assigned_by': assignment.assigned_by_admin.email if assignment.assigned_by_admin else None,
                'latitude': float(assignment.request.work_latitude) if assignment.request.work_latitude else None,
                'longitude': float(assignment.request.work_longitude) if assignment.request.work_longitude else None,
            })
        
        return Response({
            'success': True,
            'total': len(work_list),
            'work': work_list
        })
        
    except OrgWorker.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Worker not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_worker_in_progress_work(request):
    """
    Get in-progress work for logged-in org worker.
    """
    try:
        worker_id = request.GET.get('worker_id') or request.headers.get('X-Worker-ID')
        
        if not worker_id:
            return Response({
                'success': False,
                'error': 'Worker ID required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        worker = OrgWorker.objects.get(id=worker_id)
        
        # Get in-progress work
        assignments = OrgWorkAssignment.objects.filter(
            org_worker=worker,
            status='in_progress'
        ).select_related('request', 'request__org', 'assigned_by_admin').order_by('-assigned_at')
        
        work_list = []
        for assignment in assignments:
            # Calculate progress (simple: 50% for in_progress, 100% for completed)
            # You can enhance this with actual progress tracking
            progress = 50  # Default for in-progress
            
            work_list.append({
                'id': assignment.id,
                'title': assignment.request.work_type,
                'location': assignment.request.work_location or 'Location not provided',
                'client': assignment.request.client_name,
                'contact': assignment.request.client_contact,
                'description': assignment.request.work_description,
                'translations': {
                    translation.language: {'work_description': translation.work_description}
                    for translation in assignment.request.translations.all()
                },
                'progress': progress,
                'assigned_at': assignment.assigned_at.isoformat(),
                'started_at': assignment.started_at.isoformat() if assignment.started_at else None,
                'status': assignment.status,
                'assigned_by': assignment.assigned_by_admin.email if assignment.assigned_by_admin else None,
                'latitude': float(assignment.request.work_latitude) if assignment.request.work_latitude else None,
                'longitude': float(assignment.request.work_longitude) if assignment.request.work_longitude else None,
            })
        
        return Response({
            'success': True,
            'total': len(work_list),
            'work': work_list
        })
        
    except OrgWorker.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Worker not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_worker_completed_work(request):
    """
    Get completed work for logged-in org worker.
    """
    try:
        worker_id = request.GET.get('worker_id') or request.headers.get('X-Worker-ID')
        
        if not worker_id:
            return Response({
                'success': False,
                'error': 'Worker ID required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        worker = OrgWorker.objects.get(id=worker_id)
        
        # Get completed work
        assignments = OrgWorkAssignment.objects.filter(
            org_worker=worker,
            status='completed'
        ).select_related('request', 'request__org', 'assigned_by_admin').order_by('-completed_at')
        
        work_list = []
        for assignment in assignments:
            req = assignment.request
            amount = float(req.service_charge or req.total_amount or 500.0)
            work_list.append({
                'id': assignment.id,
                'title': req.work_type,
                'location': req.work_location or 'Location not provided',
                'client': req.client_name,
                'translations': {
                    translation.language: {'work_description': translation.work_description}
                    for translation in req.translations.all()
                },
                'completedDate': assignment.completed_at.isoformat() if assignment.completed_at else assignment.assigned_at.isoformat(),
                'completed_at': assignment.completed_at.isoformat() if assignment.completed_at else None,
                'rating': req.rating or 5.0,
                'status': assignment.status,
                'assigned_by': assignment.assigned_by_admin.email if assignment.assigned_by_admin else None,
                'latitude': float(req.work_latitude) if req.work_latitude else None,
                'longitude': float(req.work_longitude) if req.work_longitude else None,
                'estimated_budget': amount,
                'budget': amount,
                'service_charge': float(req.service_charge),
                'total_amount': float(req.total_amount),
            })
        
        return Response({
            'success': True,
            'total': len(work_list),
            'work': work_list
        })
        
    except OrgWorker.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Worker not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =====================================================
# WORK ASSIGNMENT START/COMPLETE (ORG WORKER)
# =====================================================

@api_view(['POST'])
@permission_classes([AllowAny])  # Org workers use X-Worker-ID header
def start_work_assignment(request, assignment_id):
    """
    Start a work assignment (org worker marks as in_progress).
    Updates status from 'assigned' to 'in_progress' and records start time.
    """
    try:
        # Get worker_id from header
        worker_id = request.headers.get('X-Worker-ID')
        
        if not worker_id:
            return Response({
                'success': False,
                'error': 'Worker ID required in X-Worker-ID header.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get assignment
        assignment = OrgWorkAssignment.objects.select_related('request', 'request__org', 'org_worker').get(id=assignment_id)
        
        # Verify worker owns this assignment
        if str(assignment.org_worker.id) != str(worker_id):
            return Response({
                'success': False,
                'error': 'Unauthorized access to this assignment.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check current status
        if assignment.status != 'assigned':
            return Response({
                'success': False,
                'error': f'Cannot start work. Current status: {assignment.status}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update to in_progress
        assignment.status = 'in_progress'
        assignment.started_at = datetime.now()
        assignment.save()
        
        print(f"[OK] Work assignment {assignment_id} started by worker {worker_id}")

        # Dispatch notifications to worker, admin, and client
        notify_assignment_status_change(assignment, 'in_progress', assignment.org_worker)
        
        return Response({
            'success': True,
            'message': 'Work started successfully.',
            'assignment': {
                'id': assignment.id,
                'status': assignment.status,
                'started_at': assignment.started_at.isoformat() if assignment.started_at else None,
            }
        })
        
    except OrgWorkAssignment.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Assignment not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"[FAIL] Error starting work: {e}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])  # Org workers use X-Worker-ID header
def complete_work_assignment(request, assignment_id):
    """
    Complete a work assignment (org worker marks as completed).
    Updates status from 'in_progress' to 'completed' and records completion time.
    """
    try:
        # Get worker_id from header
        worker_id = request.headers.get('X-Worker-ID')
        
        if not worker_id:
            return Response({
                'success': False,
                'error': 'Worker ID required in X-Worker-ID header.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get assignment
        assignment = OrgWorkAssignment.objects.select_related('request', 'request__org', 'org_worker').get(id=assignment_id)
        
        # Verify worker owns this assignment
        if str(assignment.org_worker.id) != str(worker_id):
            return Response({
                'success': False,
                'error': 'Unauthorized access to this assignment.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check current status
        if assignment.status != 'in_progress':
            return Response({
                'success': False,
                'error': f'Cannot complete work. Current status: {assignment.status}. Work must be in progress first.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update to completed
        assignment.status = 'completed'
        assignment.completed_at = datetime.now()
        assignment.save()
        
        print(f"[OK] Work assignment {assignment_id} completed by worker {worker_id}")
        
        # Dispatch notifications to worker, admin, and client
        notify_assignment_status_change(assignment, 'completed', assignment.org_worker)
        
        return Response({
            'success': True,
            'message': 'Work completed successfully.',
            'assignment': {
                'id': assignment.id,
                'status': assignment.status,
                'completed_at': assignment.completed_at.isoformat() if assignment.completed_at else None,
            }
        })
        
    except OrgWorkAssignment.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Assignment not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"[FAIL] Error completing work: {e}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =====================================================
# LEGACY ORGANIZATION REGISTRATION (BACKWARD COMPATIBILITY)
# =====================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def register_organization(request):
    """
    Legacy endpoint for organization registration.
    Creates a SahayakUser with role 'organization' and an OrganizationProfile.
    This maintains backward compatibility with the existing app flow.
    """
    try:
        # Extract data - support both old and new field names
        email = request.data.get('email') or request.data.get('leaderEmail')
        password = request.data.get('password')
        organization_name = request.data.get('organization_name') or request.data.get('organizationName')
        organization_type = request.data.get('organization_type') or request.data.get('organizationType', 'Other')
        address = request.data.get('address') or request.data.get('organizationAddress', '')
        contact_number = request.data.get('contact_number') or request.data.get('leaderPhone', '')
        
        # Additional fields from new app
        leader_name = request.data.get('leaderName', '')
        city = request.data.get('city', 'Not provided')
        state = request.data.get('state', 'Not provided')
        pin_code = request.data.get('pinCode', '000000')
        description = request.data.get('organizationDescription', '')
        
        # Validate required fields
        if not email or not password or not organization_name:
            return Response({
                'success': False,
                'error': 'Email, password, and organization name are required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if email already exists
        if SahayakUser.objects.filter(email=email).exists():
            return Response({
                'success': False,
                'error': 'An account with this email already exists.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create user with transaction
        with transaction.atomic():
            # Get or create organization_admin role
            from authentication.models import UserRole
            org_role, _ = UserRole.objects.get_or_create(
                role='organization_admin',
                defaults={'description': 'Organization Administrator'}
            )
            
            # Generate username from email (before @)
            username = email.split('@')[0]
            # Make username unique if needed
            base_username = username
            counter = 1
            while SahayakUser.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            
            # Use contact_number as phone_number, or generate a placeholder
            phone_number = contact_number if contact_number else f"ORG{str(uuid.uuid4())[:8]}"
            # Make sure phone is unique
            while SahayakUser.objects.filter(phone_number=phone_number).exists():
                phone_number = f"ORG{str(uuid.uuid4())[:8]}"
            
            # Create SahayakUser with leader name if provided
            first_name = leader_name.split()[0] if leader_name else organization_name[:30]
            last_name = ' '.join(leader_name.split()[1:]) if leader_name and len(leader_name.split()) > 1 else ''
            
            user = SahayakUser.objects.create_user(
                username=username,
                email=email,
                phone_number=phone_number,
                password=password,
                role=org_role,
                first_name=first_name,
                last_name=last_name,
                is_active=True,
                is_verified=True
            )
            
            # Generate a simple registration number
            import random
            registration_number = f"ORG{random.randint(100000, 999999)}"
            while OrganizationProfile.objects.filter(company_registration_number=registration_number).exists():
                registration_number = f"ORG{random.randint(100000, 999999)}"
            
            # Create OrganizationProfile with required fields
            org_profile = OrganizationProfile.objects.create(
                user=user,
                company_name=organization_name,
                company_registration_number=registration_number,
                industry_type=organization_type,
                company_email=email,
                company_phone=contact_number or phone_number,
                address=address or 'Not provided',
                city=city,
                state=state,
                pincode=pin_code,
                description=description
            )
            
            # Also create Organisation entry for org worker system
            from .models import Organisation
            org_entry = Organisation.objects.create(
                org_id=registration_number,
                org_name=organization_name,
                admin_user=user
            )
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            'success': True,
            'message': 'Organization registered successfully.',
            'user': {
                'id': str(user.id),
                'email': user.email,
                'username': user.username,
                'phone_number': user.phone_number,
                'role': 'organization_admin',
                'organization_name': org_profile.company_name,
                'organization_type': org_profile.industry_type,
                'registration_number': org_profile.company_registration_number
            },
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        import traceback
        return Response({
            'success': False,
            'error': f'Registration failed: {str(e)}',
            'traceback': traceback.format_exc()
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# =====================================================
# ORGANIZATION WORK REQUEST PAYMENT & RATING
# =====================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_org_work_request(request, request_id):
    """
    Mark organization work request as completed and record payment.
    Client calls this after making payment.
    """
    try:
        # Get the organization work request
        org_request = OrgWorkRequest.objects.get(id=request_id)
        
        # Verify the client is the one who created the request
        if org_request.client_contact != request.user.phone_number:
            return Response({
                'success': False,
                'error': 'You are not authorized to complete this request'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get payment details from request
        payment_mode = request.data.get('payment_mode', 'CASH')
        service_charge = request.data.get('service_charge', 0)
        platform_fee = request.data.get('platform_fee', 50)
        additional_charges = request.data.get('additional_charges', 0)
        additional_charges_reason = request.data.get('additional_charges_reason', '')
        total_amount = request.data.get('total_amount', 0)
        
        # Update the request to completed
        org_request.status = 'completed'
        org_request.service_charge = service_charge
        org_request.platform_fee = platform_fee
        org_request.additional_charges = additional_charges
        org_request.additional_charges_reason = additional_charges_reason
        org_request.total_amount = total_amount
        org_request.payment_mode = payment_mode
        org_request.completed_at = datetime.now()
        org_request.save()
        
        print(f"[OK] Organization work request #{request_id} marked as COMPLETED")
        print(f"[PAY] Payment: Rs. {total_amount} via {payment_mode}")
        
        serializer = OrgWorkRequestSerializer(org_request)
        
        return Response({
            'success': True,
            'message': 'Organization work request completed successfully',
            'request': serializer.data
        })
        
    except OrgWorkRequest.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Organization work request not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"[FAIL] Error completing org request: {str(e)}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rate_org_work_request(request, request_id):
    """
    Submit rating and feedback for completed organization work.
    Client can rate after payment is completed.
    """
    try:
        # Get the organization work request
        org_request = OrgWorkRequest.objects.get(id=request_id)
        
        # Verify the client is the one who created the request
        if org_request.client_contact != request.user.phone_number:
            return Response({
                'success': False,
                'error': 'You are not authorized to rate this request'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get rating and feedback
        rating_value = request.data.get('rating')
        feedback_text = request.data.get('feedback', '').strip()
        
        # Validate rating
        if not rating_value or not isinstance(rating_value, int) or rating_value < 1 or rating_value > 5:
            return Response({
                'success': False,
                'error': 'Rating must be between 1 and 5'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate feedback
        if not feedback_text:
            return Response({
                'success': False,
                'error': 'Feedback is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if already rated
        if org_request.rating is not None:
            return Response({
                'success': False,
                'error': 'You have already rated this work'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Save rating and feedback
        org_request.rating = rating_value
        org_request.feedback = feedback_text
        org_request.rated_at = datetime.now()
        org_request.save()
        
        print(f"[STAR] Organization work request #{request_id} rated: {rating_value} stars")
        print(f"[CHAT] Feedback: {feedback_text[:50]}...")
        
        serializer = OrgWorkRequestSerializer(org_request)
        
        return Response({
            'success': True,
            'message': 'Rating and feedback submitted successfully',
            'request': serializer.data
        })
        
    except OrgWorkRequest.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Organization work request not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"[FAIL] Error rating org request: {str(e)}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
