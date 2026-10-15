from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import JobRequest, JobBooking, WorkRequest
from .serializers import (
    JobRequestSerializer, JobBookingSerializer,
    WorkRequestSerializer, WorkRequestCreateSerializer, WorkRequestActionSerializer
)
from .work_request_translation_service import synchronize_work_request_translations
from users.models import WorkerProfile, CustomerProfile
import logging

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_work_request(request):
    """
    Create a direct work request to a specific worker.
    
    Expected data:
    {
        "worker_id": "uuid",
        "service_category": "Cook",
        "title": "Need cook for party",
        "description": "...",
        "work_address": "...",
        "work_latitude": 18.xxx,
        "work_longitude": 73.xxx,
        "required_date": "2026-08-25",
        "required_time": "10:00",
        "number_of_workers": 1,
        "estimated_budget": 1000.00
    }
    """
    try:
        # Log incoming request safely
        try:
            print(f"[RES] Received work request creation from user: {request.user.username}")
            print(f"[RES] User ID: {request.user.id}")
            print(f"[DATA] Request data: {request.data}")
        except Exception:
            pass
        
        # Validate input
        serializer = WorkRequestCreateSerializer(data=request.data)
        if not serializer.is_valid():
            try:
                print(f"[FAIL] Validation errors: {serializer.errors}")
            except Exception:
                pass
            return Response({
                'success': False,
                'error': 'Invalid data',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        try:
            print(f"[OK] Validated data: {data}")
            print(f"[SEARCH] Looking for worker with ID: {data['worker_id']}")
        except Exception:
            pass
        
        # IMPORTANT: Ensure user exists in database
        # Sometimes JWT auth creates the user object but it's not in the DB
        from authentication.models import SahayakUser, UserRole
        from django.db import transaction
        
        db_user = None
        try:
            db_user = SahayakUser.objects.get(id=request.user.id)
            print(f"[OK] User exists in database: {db_user.email}")
        except SahayakUser.DoesNotExist:
            print(f"[WARN] User not in database, creating: {request.user.id}")
            print(f"   Email: {request.user.email}")
            print(f"   Username: {request.user.username}")
            
            try:
                with transaction.atomic():
                    # Get or create client role
                    client_role, created = UserRole.objects.get_or_create(
                        role='customer',
                        defaults={'description': 'Customer who requests services'}
                    )
                    print(f"   Role: {client_role} (created={created})")
                    
                    # Generate unique phone number if not available
                    # Use UUID to ensure uniqueness
                    import time
                    phone = getattr(request.user, 'phone_number', '')
                    if not phone:
                        # Create unique temp phone using timestamp + part of UUID
                        phone = f'TEMP{int(time.time() * 1000) % 10000000000}'
                    print(f"   Phone: {phone}")
                    
                    # Create user record from authenticated user
                    db_user = SahayakUser.objects.create(
                        id=request.user.id,
                        username=request.user.username or request.user.email.split('@')[0],
                        email=request.user.email,
                        first_name=getattr(request.user, 'first_name', ''),
                        last_name=getattr(request.user, 'last_name', ''),
                        phone_number=phone,
                        role=client_role,
                        is_verified=True,
                        is_phone_verified=False,
                        is_active=True
                    )
                    print(f"[OK] Created user in database: {db_user.email} (ID: {db_user.id})")
            except Exception as create_error:
                print(f"[FAIL] Failed to create user: {create_error}")
                import traceback
                traceback.print_exc()
                return Response({
                    'success': False,
                    'error': f'Failed to create user account: {str(create_error)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        if db_user is None:
            print(f"[FAIL] db_user is None after creation attempt!")
            return Response({
                'success': False,
                'error': 'Failed to get or create user account'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Get or create customer profile using the db_user
        customer_profile = None
        try:
            customer_profile = CustomerProfile.objects.get(user=db_user)
            print(f"[OK] Found customer profile: {customer_profile.id}")
        except CustomerProfile.DoesNotExist:
            print(f"   Creating customer profile for user: {db_user.id}")
            try:
                with transaction.atomic():
                    customer_profile = CustomerProfile.objects.create(user=db_user)
                    print(f"[OK] Created customer profile: {customer_profile.id}")
            except Exception as profile_error:
                print(f"[FAIL] Failed to create customer profile: {profile_error}")
                import traceback
                traceback.print_exc()
                return Response({
                    'success': False,
                    'error': f'Failed to create customer profile: {str(profile_error)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Get worker
        try:
            worker = WorkerProfile.objects.get(id=data['worker_id'])
            print(f"[OK] Found worker profile: {worker.id} (user: {worker.user.username})")
        except WorkerProfile.DoesNotExist:
            print(f"[FAIL] Worker profile not found with ID: {data['worker_id']}")
            return Response({
                'success': False,
                'error': f'Worker not found with ID: {data["worker_id"]}'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Create work request
        print(f"[NOTE] Creating work request...")
        work_request = WorkRequest.objects.create(
            client=customer_profile,
            worker=worker,
            service_category=data['service_category'],
            title=data.get('title', ''),
            description=data['description'],
            work_address=data['work_address'],
            work_latitude=data['work_latitude'],
            work_longitude=data['work_longitude'],
            required_date=data['required_date'],
            required_time=data['required_time'],
            number_of_workers=data['number_of_workers'],
            estimated_budget=data.get('estimated_budget'),
            status='REQUESTED'
        )
        print(f"[OK] Work request created: {work_request.id}")

        # Synchronize translations into all supported languages
        try:
            synchronize_work_request_translations(
                work_request,
                data['source_language'],
            )
            print(f"[TRANS] Synchronized translations for language: {data['source_language']}")
        except Exception as translate_error:
            logger.error(f"Failed to synchronize translations: {translate_error}")
            # Don't fail the request if translation synchronization fails

        # Notify worker AND client about new job request
        try:
            from notifications.notification_manager import notification_manager
            worker_user = worker.user
            client_user = request.user
            notification_manager.send_new_job_request_notification(
                worker_user=worker_user,
                work_request=work_request,
                client_user=client_user
            )
            print(f"[REQ] Sent new job notification to worker {worker_user.username} and client {client_user.username}")
        except Exception as e:
            logger.error(f"Failed to send new job notification: {e}")
            # Don't fail the request if notification fails
        
        # Serialize response
        response_serializer = WorkRequestSerializer(work_request)
        
        return Response({
            'success': True,
            'message': 'Work request created successfully',
            'work_request': response_serializer.data
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        print(f"[FAIL] Error creating work request: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'error': f'Failed to create work request: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_work_requests_for_client(request):
    """
    List all work requests created by the current client.
    Filterable by status.
    """
    try:
        # Check if user is a client
        if not hasattr(request.user, 'customer_profile'):
            return Response({
                'success': False,
                'error': 'Only clients can access this endpoint'
            }, status=status.HTTP_403_FORBIDDEN)
        
        customer_profile = request.user.customer_profile
        
        # Get status filter
        status_filter = request.query_params.get('status')
        
        # Query work requests with preloaded relations
        work_requests = WorkRequest.objects.filter(client=customer_profile)\
            .select_related('client__user', 'worker__user')\
            .prefetch_related('translations')\
            .order_by('-created_at')
        
        if status_filter:
            work_requests = work_requests.filter(status=status_filter.upper())
        
        # Serialize
        serializer = WorkRequestSerializer(work_requests, many=True)
        data = serializer.data
        
        return Response({
            'success': True,
            'total': len(data),
            'work_requests': data
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Failed to list work requests: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_work_requests_for_worker(request):
    """
    List all work requests assigned to the current worker.
    Filterable by status.
    """
    try:
        # Check if user is a worker
        if not hasattr(request.user, 'worker_profile'):
            return Response({
                'success': False,
                'error': 'Only workers can access this endpoint'
            }, status=status.HTTP_403_FORBIDDEN)
        
        worker_profile = request.user.worker_profile
        
        # Get status filter
        status_filter = request.query_params.get('status')
        
        # Query work requests with preloaded relations
        work_requests = WorkRequest.objects.filter(worker=worker_profile)\
            .select_related('client__user', 'worker__user')\
            .prefetch_related('translations')\
            .order_by('-created_at')
        
        if status_filter:
            work_requests = work_requests.filter(status=status_filter.upper())
        
        # Serialize
        serializer = WorkRequestSerializer(work_requests, many=True)
        data = serializer.data
        
        return Response({
            'success': True,
            'total': len(data),
            'work_requests': data
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Failed to list work requests: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def worker_action_on_request(request, request_id):
    """
    Worker accepts or rejects a work request.
    
    Expected data:
    {
        "action": "accept" | "reject",
        "reason": "..." (optional, for reject)
    }
    """
    try:
        # Check if user is a worker
        if not hasattr(request.user, 'worker_profile'):
            return Response({
                'success': False,
                'error': 'Only workers can perform this action'
            }, status=status.HTTP_403_FORBIDDEN)
        
        worker_profile = request.user.worker_profile
        
        # Get work request
        work_request = get_object_or_404(WorkRequest, id=request_id)
        
        # Verify this request is for this worker
        if work_request.worker.id != worker_profile.id:
            return Response({
                'success': False,
                'error': 'You can only act on requests assigned to you'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Validate action
        action_serializer = WorkRequestActionSerializer(data=request.data)
        if not action_serializer.is_valid():
            return Response({
                'success': False,
                'error': 'Invalid action data',
                'details': action_serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        action_data = action_serializer.validated_data
        action_type = action_data['action']
        
        # Perform action
        if action_type == 'accept':
            work_request.accept()
            message = 'Work request accepted successfully'
        elif action_type == 'reject':
            reason = action_data.get('reason', '')
            work_request.reject(reason)
            message = 'Work request rejected'
        
        # Serialize response
        response_serializer = WorkRequestSerializer(work_request)
        
        return Response({
            'success': True,
            'message': message,
            'work_request': response_serializer.data
        }, status=status.HTTP_200_OK)
    
    except ValueError as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Failed to process action: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_work_request_detail(request, request_id):
    """
    Get details of a specific work request.
    Client can view their own requests, worker can view requests assigned to them.
    """
    try:
        work_request = get_object_or_404(
            WorkRequest.objects.select_related('client__user', 'worker__user').prefetch_related('translations'),
            id=request_id
        )
        
        # Check permissions
        is_client = hasattr(request.user, 'customer_profile') and \
                    work_request.client.id == request.user.customer_profile.id
        is_worker = hasattr(request.user, 'worker_profile') and \
                    work_request.worker.id == request.user.worker_profile.id
        
        if not (is_client or is_worker):
            return Response({
                'success': False,
                'error': 'You do not have permission to view this request'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Serialize
        serializer = WorkRequestSerializer(work_request)
        
        return Response({
            'success': True,
            'work_request': serializer.data
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Failed to get work request: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class JobRequestViewSet(viewsets.ModelViewSet):
    """Job request management."""
    queryset = JobRequest.objects.all()
    serializer_class = JobRequestSerializer
    permission_classes = [IsAuthenticated]


class JobBookingViewSet(viewsets.ModelViewSet):
    """Job booking management."""
    queryset = JobBooking.objects.all()
    serializer_class = JobBookingSerializer
    permission_classes = [IsAuthenticated]


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_work_request(request, request_id):
    """
    Mark a work request as completed after payment.
    Only the client can complete their own work requests.
    
    Expected data:
    {
        "payment_mode": "CASH" | "UPI",
        "total_amount": 850.00,
        "additional_charges": 50.00 (optional),
        "additional_charges_reason": "Extra materials" (optional)
    }
    """
    try:
        # Check if user is a client
        if not hasattr(request.user, 'customer_profile'):
            return Response({
                'success': False,
                'error': 'Only clients can complete work requests'
            }, status=status.HTTP_403_FORBIDDEN)
        
        customer_profile = request.user.customer_profile
        
        # Get work request
        work_request = get_object_or_404(
            WorkRequest.objects.select_related('client__user', 'worker__user'),
            id=request_id
        )
        
        # Verify this request belongs to this client
        if work_request.client.id != customer_profile.id:
            return Response({
                'success': False,
                'error': 'You can only complete your own work requests'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Verify status is SCHEDULED or IN_PROGRESS
        if work_request.status not in ['SCHEDULED', 'IN_PROGRESS']:
            return Response({
                'success': False,
                'error': f'Work request must be SCHEDULED or IN_PROGRESS to complete. Current status: {work_request.status}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get payment details
        payment_mode = request.data.get('payment_mode', 'CASH')
        total_amount = request.data.get('total_amount', 0)
        additional_charges = request.data.get('additional_charges', 0)
        additional_charges_reason = request.data.get('additional_charges_reason', '')
        
        print(f"[PAY] Completing work request: {request_id}")
        print(f"   Payment Mode: {payment_mode}")
        print(f"   Total Amount: Rs. {total_amount}")
        print(f"   Additional Charges: Rs. {additional_charges}")
        
        # Mark as completed automatically
        work_request.complete()
        
        # Financial breakdown & Payment record
        from decimal import Decimal
        from payments.models import Payment
        
        visiting_charges = Decimal(str(work_request.worker.hourly_rate or '100.00'))
        platform_fee = Decimal('50.00')
        add_charges = Decimal(str(additional_charges or 0.00))
        
        # Derive base price
        if total_amount and Decimal(str(total_amount)) > (visiting_charges + platform_fee + add_charges):
            base_price = Decimal(str(total_amount)) - visiting_charges - platform_fee - add_charges
        else:
            base_price = Decimal('400.00')
        
        calc_total = base_price + visiting_charges + platform_fee + add_charges
        final_total = Decimal(str(total_amount)) if total_amount else calc_total
        worker_gross = base_price + visiting_charges + add_charges
        
        # Record Payment
        payment = Payment.objects.create(
            work_request=work_request,
            client=work_request.client,
            worker=work_request.worker,
            base_price=base_price,
            visiting_charges=visiting_charges,
            platform_fee=platform_fee,
            additional_charges=add_charges,
            additional_charges_reason=additional_charges_reason,
            total_amount=final_total,
            worker_gross_amount=worker_gross,
            worker_net_payout=worker_gross,
            payment_method='cash',
            status='completed',
            cash_platform_fee_settled=False,
            paid_at=timezone.now()
        )
        
        # Accumulate Rs. 50 platform fee due onto worker profile to be deducted on next online job
        worker = work_request.worker
        worker.pending_platform_fees = (worker.pending_platform_fees or Decimal('0.00')) + platform_fee
        worker.total_earnings = (worker.total_earnings or Decimal('0.00')) + worker_gross
        worker.total_jobs_completed = (worker.total_jobs_completed or 0) + 1
        worker.save(update_fields=['pending_platform_fees', 'total_earnings', 'total_jobs_completed'])
        
        print(f"[OK] Work request completed: {work_request.id}")
        print(f"     Cash payment #{payment.id} logged. Worker pending platform dues: Rs. {worker.pending_platform_fees}")
        
        # Serialize response
        serializer = WorkRequestSerializer(work_request)
        
        return Response({
            'success': True,
            'message': 'Work request completed successfully with cash payment',
            'work_request': serializer.data,
            'payment': {
                'id': str(payment.id),
                'mode': payment_mode,
                'total_amount': float(final_total),
                'platform_fee': 50.0,
                'additional_charges': float(add_charges),
                'additional_charges_reason': additional_charges_reason,
                'worker_pending_platform_fees': float(worker.pending_platform_fees)
            }
        }, status=status.HTTP_200_OK)
    
    except ValueError as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        print(f"[FAIL] Error completing work request: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'error': f'Failed to complete work request: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_issue_report(request):
    """
    Create a new issue report from client.
    
    Expected data:
    {
        "issue_type": "payment" | "worker" | "booking" | "service" | "other",
        "booking_id": "uuid-string" (required),
        "description": "Issue description"
    }
    """
    try:
        from .models import IssueReport
        from .serializers import IssueReportCreateSerializer, IssueReportSerializer
        
        # Check if user is a client
        if not hasattr(request.user, 'customer_profile'):
            return Response({
                'success': False,
                'error': 'Only clients can submit issue reports'
            }, status=status.HTTP_403_FORBIDDEN)
        
        customer_profile = request.user.customer_profile
        
        # Validate input
        serializer = IssueReportCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'error': 'Invalid data',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        print(f"[NOTE] Creating issue report from: {request.user.email}")
        print(f"   Issue Type: {data['issue_type']}")
        print(f"   Booking ID: {data.get('booking_id', 'N/A')}")
        
        # Create issue report
        issue_report = IssueReport.objects.create(
            client=customer_profile,
            issue_type=data['issue_type'],
            booking_id=data['booking_id'],
            description=data['description'],
            status='SUBMITTED'
        )
        
        print(f"[OK] Issue report created: {issue_report.id}")
        
        # Serialize response
        response_serializer = IssueReportSerializer(issue_report)
        
        return Response({
            'success': True,
            'message': 'Issue report submitted successfully',
            'issue_report': response_serializer.data
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        print(f"[FAIL] Error creating issue report: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'error': f'Failed to create issue report: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rate_work_request(request, request_id):
    """
    Submit rating and feedback for a completed work request.
    Only the client can rate their own completed work requests.
    
    Expected data:
    {
        "rating": 1-5 (integer),
        "feedback": "Great service!" (string)
    }
    """
    try:
        # Check if user is a client
        if not hasattr(request.user, 'customer_profile'):
            return Response({
                'success': False,
                'error': 'Only clients can rate work requests'
            }, status=status.HTTP_403_FORBIDDEN)
        
        customer_profile = request.user.customer_profile
        
        # Get work request
        work_request = get_object_or_404(
            WorkRequest.objects.select_related('client__user', 'worker__user'),
            id=request_id
        )
        
        # Verify this request belongs to this client
        if work_request.client.id != customer_profile.id:
            return Response({
                'success': False,
                'error': 'You can only rate your own work requests'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Verify status is SCHEDULED, IN_PROGRESS, or COMPLETED
        if work_request.status not in ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED']:
            return Response({
                'success': False,
                'error': f'Work request must be SCHEDULED, IN_PROGRESS, or COMPLETED to rate. Current status: {work_request.status}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get rating data
        rating = request.data.get('rating')
        feedback = request.data.get('feedback', '').strip()
        
        # Validate rating
        if not rating or not isinstance(rating, int) or rating < 1 or rating > 5:
            return Response({
                'success': False,
                'error': 'Rating must be an integer between 1 and 5'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not feedback:
            return Response({
                'success': False,
                'error': 'Feedback is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"[STAR] Rating work request: {request_id}")
        print(f"   Rating: {rating}/5")
        print(f"   Feedback: {feedback[:50]}...")
        
        # Store rating in work request
        work_request.rating = rating
        work_request.feedback = feedback
        work_request.rated_at = timezone.now()
        work_request.save()
        
        # Update worker's average rating
        worker = work_request.worker
        
        # Calculate new average rating from SCHEDULED, IN_PROGRESS and COMPLETED requests
        rated_requests = WorkRequest.objects.filter(
            worker=worker,
            status__in=['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'],
            rating__isnull=False
        )
        
        if rated_requests.exists():
            total_ratings = sum(r.rating for r in rated_requests)
            count = rated_requests.count()
            new_average = total_ratings / count
            
            worker.average_rating = round(new_average, 2)
            worker.save()
            
            print(f"[OK] Updated worker average rating: {worker.average_rating} (from {count} ratings)")
        
        # Serialize response
        serializer = WorkRequestSerializer(work_request)
        
        return Response({
            'success': True,
            'message': 'Rating submitted successfully',
            'work_request': serializer.data,
            'worker_average_rating': float(worker.average_rating)
        }, status=status.HTTP_200_OK)
    
    except ValueError as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        print(f"[FAIL] Error submitting rating: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'error': f'Failed to submit rating: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# ============================================
# OTP VERIFICATION FOR WORKER ARRIVAL
# ============================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def worker_arrived(request, work_request_id):
    """
    Worker marks arrival at client location.
    Generates OTP and sends to client.
    
    POST /api/v1/jobs/work-requests/{id}/arrived/
    """
    try:
        # Get work request
        work_request = get_object_or_404(WorkRequest, id=work_request_id)
        
        # Verify worker is authorized
        if str(work_request.worker_id) != str(request.user.id):
            return Response({
                'success': False,
                'error': 'You are not assigned to this job'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check status
        if work_request.status != 'ACCEPTED':
            return Response({
                'success': False,
                'error': f'Job status must be ACCEPTED. Current status: {work_request.status}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate 4-digit OTP
        import random
        otp = str(random.randint(1000, 9999))
        
        # Save OTP and update status
        work_request.arrival_otp = otp
        work_request.arrival_otp_generated_at = timezone.now()
        work_request.arrival_verified = False
        work_request.status = 'WORKER_ARRIVED'
        work_request.save()
        
        print(f'[OK] Worker arrived - OTP generated: {otp} for job {work_request_id}')
        
        # Send arrival notification to client AND worker
        try:
            from notifications.notification_manager import notification_manager
            client_user = work_request.client.user
            worker_user = request.user
            notification_manager.send_worker_arrived_notification(
                work_request=work_request,
                otp_pin=otp,
                client_user=client_user,
                worker_user=worker_user
            )
        except Exception as e:
            logger.error(f"Failed to send arrival notification: {e}")
        
        return Response({
            'success': True,
            'message': 'Arrival marked successfully. OTP sent to client.',
            'otp_generated': True,
            'status': 'WORKER_ARRIVED'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f'[FAIL] Error in worker_arrived: {str(e)}')
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'error': f'Failed to mark arrival: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_arrival_otp(request, work_request_id):
    """
    Worker verifies arrival by entering OTP from client.
    
    POST /api/v1/jobs/work-requests/{id}/verify-otp/
    {
        "otp": "1234"
    }
    """
    try:
        # Get work request
        work_request = get_object_or_404(WorkRequest, id=work_request_id)
        
        # Verify worker is authorized
        if str(work_request.worker_id) != str(request.user.id):
            return Response({
                'success': False,
                'error': 'You are not assigned to this job'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check status
        if work_request.status != 'WORKER_ARRIVED':
            return Response({
                'success': False,
                'error': f'Worker must mark arrival first. Current status: {work_request.status}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if already verified
        if work_request.arrival_verified:
            return Response({
                'success': False,
                'error': 'Arrival already verified'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get OTP from request
        otp_entered = request.data.get('otp', '').strip()
        
        if not otp_entered:
            return Response({
                'success': False,
                'error': 'OTP is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify OTP
        if work_request.arrival_otp != otp_entered:
            print(f'[FAIL] OTP mismatch - Expected: {work_request.arrival_otp}, Got: {otp_entered}')
            return Response({
                'success': False,
                'error': 'Invalid OTP. Please try again.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check OTP expiry (15 minutes)
        from datetime import timedelta
        otp_age = timezone.now() - work_request.arrival_otp_generated_at
        if otp_age > timedelta(minutes=15):
            return Response({
                'success': False,
                'error': 'OTP has expired. Please request a new one.',
                'expired': True
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # OTP is valid - mark as verified
        work_request.arrival_verified = True
        work_request.arrival_verified_at = timezone.now()
        work_request.status = 'IN_PROGRESS'
        work_request.save()
        
        # Send notification to client AND worker that work has started
        try:
            from notifications.notification_manager import notification_manager
            client_user = work_request.client.user
            worker_user = request.user
            notification_manager.send_job_started_notification(
                client_user=client_user,
                work_request=work_request,
                worker_user=worker_user
            )
        except Exception as e:
            logger.error(f"Failed to send job started notification: {e}")
        
        print(f'[OK] OTP verified successfully for job {work_request_id}')
        
        serializer = WorkRequestSerializer(work_request)
        
        return Response({
            'success': True,
            'message': 'Arrival verified successfully! You can now start work.',
            'verified': True,
            'status': 'IN_PROGRESS',
            'work_request': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f'[FAIL] Error in verify_arrival_otp: {str(e)}')
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'error': f'Failed to verify OTP: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_arrival_otp(request, work_request_id):
    """
    Client gets the OTP to share with worker.
    
    GET /api/v1/jobs/work-requests/{id}/get-otp/
    """
    try:
        # Get work request
        work_request = get_object_or_404(WorkRequest, id=work_request_id)
        
        # Verify client is authorized
        if str(work_request.client_id) != str(request.user.id):
            return Response({
                'success': False,
                'error': 'You are not the client for this job'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if OTP exists
        if not work_request.arrival_otp:
            return Response({
                'success': False,
                'error': 'Worker has not arrived yet',
                'otp_available': False
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if already verified
        if work_request.arrival_verified:
            return Response({
                'success': True,
                'message': 'Worker arrival already verified',
                'verified': True,
                'otp_available': False
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': True,
            'otp': work_request.arrival_otp,
            'otp_available': True,
            'verified': False,
            'worker_name': work_request.worker_name,
            'generated_at': work_request.arrival_otp_generated_at
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f'[FAIL] Error in get_arrival_otp: {str(e)}')
        return Response({
            'success': False,
            'error': f'Failed to get OTP: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_otp_for_work_request(request, request_id):
    """
    Worker generates OTP to verify arrival at job location.
    This sends OTP to the client's notification screen.
    """
    print(f"[NOTIF] OTP Generation Request - Request ID: {request_id}")
    print(f"   User: {request.user.email}")
    
    try:
        # Check if user is a worker
        if not hasattr(request.user, 'worker_profile'):
            print(f"[FAIL] User is not a worker")
            return Response({
                'success': False,
                'error': 'Only workers can generate OTP'
            }, status=status.HTTP_403_FORBIDDEN)
        
        worker_profile = request.user.worker_profile
        print(f"[OK] Worker profile found: {worker_profile.id}")
        
        # Get work request
        work_request = get_object_or_404(WorkRequest, id=request_id)
        print(f"[OK] Work request found: {work_request.service_category}")
        
        # Verify this request is for this worker
        if work_request.worker.id != worker_profile.id:
            print(f"[FAIL] Worker mismatch: {work_request.worker.id} != {worker_profile.id}")
            return Response({
                'success': False,
                'error': 'You can only generate OTP for your own work requests'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Verify status is SCHEDULED
        if work_request.status != 'SCHEDULED':
            print(f"[FAIL] Invalid status: {work_request.status}")
            return Response({
                'success': False,
                'error': f'Can only generate OTP for scheduled work requests. Current status: {work_request.status}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get client user
        client_user = work_request.client.user
        print(f"[OK] Client user: {client_user.email}")
        
        # Generate OTP
        from notifications.otp_service import generate_otp
        
        otp = generate_otp(
            user=client_user,
            title=f"Worker Arrived - {work_request.service_category}",
            body=f"Your worker has arrived for {work_request.service_category} service. Please provide this PIN to verify their arrival."
        )
        
        print(f"[OK] OTP Generated: {otp.pin} (expires: {otp.expires_at})")
        
        # Also notify worker that arrival has been registered and OTP sent
        try:
            from notifications.notification_manager import notification_manager
            worker_user = request.user
            notification_manager.send_worker_arrived_notification(
                work_request=work_request,
                otp_pin=otp.pin,
                client_user=client_user,
                worker_user=worker_user
            )
        except Exception as e:
            logger.error(f"Failed to send arrival notification to worker: {e}")
        
        return Response({
            'success': True,
            'message': 'OTP generated and sent to client',
            'otp_id': str(otp.id),
            'expires_at': otp.expires_at
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        print(f"[FAIL] Error generating OTP: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'error': f'Failed to generate OTP: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_otp_for_work_request(request, request_id):
    """
    Worker verifies OTP to confirm arrival at job location.
    
    Expected data:
    {
        "pin": "123456"
    }
    """
    try:
        # Check if user is a worker
        if not hasattr(request.user, 'worker_profile'):
            return Response({
                'success': False,
                'error': 'Only workers can verify OTP'
            }, status=status.HTTP_403_FORBIDDEN)
        
        worker_profile = request.user.worker_profile
        
        # Get work request
        work_request = get_object_or_404(WorkRequest, id=request_id)
        
        # Verify this request is for this worker
        if work_request.worker.id != worker_profile.id:
            return Response({
                'success': False,
                'error': 'You can only verify OTP for your own work requests'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get PIN from request
        pin = request.data.get('pin', '').strip()
        
        if not pin or len(pin) != 6:
            return Response({
                'success': False,
                'error': 'Please provide a valid 6-digit PIN'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get client user
        client_user = work_request.client.user
        
        # Verify OTP
        from notifications.otp_service import verify_otp
        
        success, message = verify_otp(user=client_user, pin=pin)
        
        if success:
            # Update work request status to IN_PROGRESS
            work_request.status = 'IN_PROGRESS'
            work_request.save()
            
            # Send notification to client AND worker that work has started
            try:
                from notifications.notification_manager import notification_manager
                client_user = work_request.client.user
                worker_user = request.user
                notification_manager.send_job_started_notification(
                    client_user=client_user,
                    work_request=work_request,
                    worker_user=worker_user
                )
            except Exception as e:
                logger.error(f"Failed to send job started notification: {e}")
            
            return Response({
                'success': True,
                'message': 'Arrival verified successfully. You can now start the work.',
                'work_request': WorkRequestSerializer(work_request).data
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'error': message
            }, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        print(f"[FAIL] Error verifying OTP: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'error': f'Failed to verify OTP: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_price(request):
    """
    Calculate total price for a work request.
    
    POST /api/v1/jobs/calculate-price/
    {
        "service_category": "Cook",
        "city": "Pune",
        "worker_id": "uuid-string"
    }
    """
    from .models import ServicePricing
    
    service_category = request.data.get('service_category')
    city = request.data.get('city')
    worker_id = request.data.get('worker_id')
    
    if not all([service_category, city, worker_id]):
        return Response({
            'success': False,
            'error': 'Missing required fields: service_category, city, worker_id'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Get worker
        worker = WorkerProfile.objects.select_related('user').get(id=worker_id)
        
        # Get base price from ServicePricing
        pricing = ServicePricing.objects.get(
            service_category=service_category,
            city=city,
            is_active=True
        )
        
        # Calculate total
        base_price = pricing.base_price
        visit_charge = worker.hourly_rate
        platform_fee = pricing.platform_fee
        total_price = base_price + visit_charge + platform_fee
        
        return Response({
            'success': True,
            'pricing': {
                'base_price': float(base_price),
                'worker_visit_charge': float(visit_charge),
                'platform_fee': float(platform_fee),
                'total_price': float(total_price),
                'currency': 'INR'
            },
            'breakdown': {
                'service_category': service_category,
                'city': city,
                'state': pricing.state,
                'worker_name': worker.user.get_full_name()
            }
        }, status=status.HTTP_200_OK)
        
    except WorkerProfile.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Worker not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    except ServicePricing.DoesNotExist:
        return Response({
            'success': False,
            'error': f'Service "{service_category}" not available in {city}'
        }, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        print(f"[FAIL] Error calculating price: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_work_request(request, request_id):
    """
    Client or Worker cancels a work request.
    POST /api/v1/jobs/work-requests/<id>/cancel/
    """
    try:
        work_request = get_object_or_404(WorkRequest, id=request_id)
        
        is_client = hasattr(request.user, 'customer_profile') and work_request.client.id == request.user.customer_profile.id
        is_worker = hasattr(request.user, 'worker_profile') and work_request.worker.id == request.user.worker_profile.id
        
        if not is_client and not is_worker:
            return Response({
                'success': False,
                'error': 'You are not authorized to cancel this work request'
            }, status=status.HTTP_403_FORBIDDEN)
        
        reason = request.data.get('reason', '')
        cancelled_by = 'client' if is_client else 'worker'
        
        work_request.cancel(reason=reason, cancelled_by=cancelled_by)
        
        return Response({
            'success': True,
            'message': 'Work request cancelled successfully',
            'work_request': WorkRequestSerializer(work_request).data
        }, status=status.HTTP_200_OK)
    except ValueError as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'success': False, 'error': f'Failed to cancel request: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

