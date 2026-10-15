"""
URL routing for Organisation System API.
All routes prefixed with /api/v1/org/
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'organisations', views.OrganisationViewSet, basename='organisation')
router.register(r'workers', views.OrgWorkerViewSet, basename='org-worker')
router.register(r'requests', views.OrgWorkRequestViewSet, basename='org-work-request')

urlpatterns = [
    # Legacy Organization Registration (Backward Compatibility)
    path('register/', views.register_organization, name='register-organization'),
    
    # Organisation Management
    path('create/', views.create_organisation, name='create-organisation'),
    path('list/', views.list_organisations, name='list-organisations'),  # Public
    
    # Worker Management - MUST come before router to avoid conflicts
    path('workers/add/', views.add_org_worker, name='add-org-worker'),
    path('workers/<int:worker_id>/credentials/', views.get_worker_credentials, name='worker-credentials'),
    path('workers/<int:worker_id>/assignments/', views.get_worker_assignments, name='worker-assignments'),
    
    # Org Worker Authentication
    path('auth/login/', views.org_worker_login, name='org-worker-login'),
    
    # Org Worker App Endpoints (Worker-Specific)
    path('worker/assigned-work/', views.get_worker_assigned_work, name='worker-assigned-work'),
    path('worker/in-progress/', views.get_worker_in_progress_work, name='worker-in-progress'),
    path('worker/completed/', views.get_worker_completed_work, name='worker-completed-work'),
    
    # Work Request Management (Public)
    path('requests/create/', views.create_work_request, name='create-work-request'),
    path('requests/client/', views.get_client_org_requests, name='client-org-requests'),
    path('requests/<int:request_id>/complete/', views.complete_org_work_request, name='complete-org-work-request'),
    path('requests/<int:request_id>/rate/', views.rate_org_work_request, name='rate-org-work-request'),
    
    # Work Assignment
    path('assignments/assign/', views.assign_work, name='assign-work'),
    path('assignments/<int:assignment_id>/status/', views.update_assignment_status, name='update-assignment-status'),
    path('work-assignments/<int:assignment_id>/start/', views.start_work_assignment, name='start-work-assignment'),
    path('work-assignments/<int:assignment_id>/complete/', views.complete_work_assignment, name='complete-work-assignment'),
    
    # Performance & Statistics
    path('performance/<str:org_id>/', views.get_organisation_performance, name='organisation-performance'),
    path('performance/worker/<int:worker_id>/', views.get_worker_performance, name='worker-performance'),
    
    # Router URLs - MUST come last to avoid conflicts
    path('', include(router.urls)),
]
