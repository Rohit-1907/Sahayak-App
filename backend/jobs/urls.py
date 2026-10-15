from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    JobRequestViewSet, JobBookingViewSet,
    create_work_request, list_work_requests_for_client,
    list_work_requests_for_worker, worker_action_on_request,
    get_work_request_detail, complete_work_request, create_issue_report,
    rate_work_request, worker_arrived, verify_arrival_otp, get_arrival_otp,
    generate_otp_for_work_request, verify_otp_for_work_request,
    calculate_price, cancel_work_request
)

router = DefaultRouter()
router.register(r'requests', JobRequestViewSet, basename='job-request')
router.register(r'bookings', JobBookingViewSet, basename='job-booking')

urlpatterns = [
    path('', include(router.urls)),
    
    # Work Request endpoints
    path('work-requests/create/', create_work_request, name='create-work-request'),
    path('work-requests/client/', list_work_requests_for_client, name='list-work-requests-client'),
    path('work-requests/worker/', list_work_requests_for_worker, name='list-work-requests-worker'),
    path('work-requests/<uuid:request_id>/', get_work_request_detail, name='work-request-detail'),
    path('work-requests/<uuid:request_id>/action/', worker_action_on_request, name='work-request-action'),
    path('work-requests/<uuid:request_id>/complete/', complete_work_request, name='complete-work-request'),
    path('work-requests/<uuid:request_id>/cancel/', cancel_work_request, name='cancel-work-request'),
    path('work-requests/<uuid:request_id>/rate/', rate_work_request, name='rate-work-request'),
    
    # Pricing endpoint
    path('calculate-price/', calculate_price, name='calculate-price'),
    
    # Issue Report endpoints
    path('issue-reports/create/', create_issue_report, name='create-issue-report'),
    
    # OTP Verification endpoints (NEW)
    path('work-requests/<uuid:request_id>/generate-otp/', generate_otp_for_work_request, name='generate-otp'),
    path('work-requests/<uuid:request_id>/verify-otp/', verify_otp_for_work_request, name='verify-otp'),
    
    # OTP Verification endpoints (OLD - keep for backward compatibility)
    path('work-requests/<uuid:work_request_id>/arrived/', worker_arrived, name='worker-arrived'),
    path('work-requests/<uuid:work_request_id>/verify-otp/', verify_arrival_otp, name='verify-arrival-otp'),
    path('work-requests/<uuid:work_request_id>/get-otp/', get_arrival_otp, name='get-arrival-otp'),
]

