"""
URL configuration for users app.
"""
from django.urls import path
from .views import (
    toggle_availability, 
    update_location, 
    get_worker_status, 
    search_workers, 
    create_work_request,
    get_worker_profile,
    update_worker_profile
)

app_name = 'users'

urlpatterns = [
    # Worker availability and location endpoints
    path('workers/toggle-availability/', toggle_availability, name='toggle_availability'),
    path('workers/update-location/', update_location, name='update_location'),
    path('workers/status/', get_worker_status, name='get_worker_status'),
    
    # Worker profile endpoints
    path('worker/profile/', get_worker_profile, name='get_worker_profile'),
    path('workers/<str:worker_id>/profile/', get_worker_profile, name='get_worker_profile_by_id'),
    path('worker/profile/update/', update_worker_profile, name='update_worker_profile'),
    
    # Worker search endpoint
    path('workers/search/', search_workers, name='search_workers'),
    
    # Work request endpoint
    path('work-requests/create/', create_work_request, name='create_work_request'),
]
