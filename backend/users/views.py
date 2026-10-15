"""
User views for worker-related operations.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import WorkerProfile


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_availability(request):
    """
    Toggle worker availability and update current location when turning ON.
    
    Expected data:
    {
        "is_available": boolean,
        "current_latitude": float (required if is_available=true),
        "current_longitude": float (required if is_available=true)
    }
    
    Returns:
    {
        "success": true,
        "is_available": boolean,
        "location_updated": boolean,
        "location_updated_at": timestamp
    }
    """
    try:
        # Check if user is a worker
        if not hasattr(request.user, 'worker_profile'):
            return Response({
                'success': False,
                'error': 'Only workers can toggle availability.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        worker = request.user.worker_profile
        
        # Get data from request
        is_available = request.data.get('is_available')
        current_latitude = request.data.get('current_latitude')
        current_longitude = request.data.get('current_longitude')
        
        # Validate is_available parameter
        if is_available is None:
            return Response({
                'success': False,
                'error': 'is_available parameter is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # If turning availability ON, require location
        if is_available:
            if current_latitude is None or current_longitude is None:
                return Response({
                    'success': False,
                    'error': 'Location (latitude and longitude) is required when turning availability ON.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update availability and current location
            worker.is_available = True
            worker.current_latitude = current_latitude
            worker.current_longitude = current_longitude
            worker.location_updated_at = timezone.now()
            worker.save(update_fields=[
                'is_available', 
                'current_latitude', 
                'current_longitude', 
                'location_updated_at',
                'updated_at'
            ])
            
            return Response({
                'success': True,
                'message': 'Availability turned ON. Location updated.',
                'is_available': True,
                'location_updated': True,
                'location_updated_at': worker.location_updated_at.isoformat(),
                'current_location': {
                    'latitude': worker.current_latitude,
                    'longitude': worker.current_longitude
                }
            }, status=status.HTTP_200_OK)
        
        else:
            # Turning availability OFF - no location update needed
            worker.is_available = False
            worker.save(update_fields=['is_available', 'updated_at'])
            
            return Response({
                'success': True,
                'message': 'Availability turned OFF.',
                'is_available': False,
                'location_updated': False
            }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Failed to toggle availability: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_location(request):
    """
    Update worker's current location (without changing availability status).
    
    Expected data:
    {
        "current_latitude": float,
        "current_longitude": float
    }
    
    Returns:
    {
        "success": true,
        "location_updated_at": timestamp
    }
    """
    try:
        # Check if user is a worker
        if not hasattr(request.user, 'worker_profile'):
            return Response({
                'success': False,
                'error': 'Only workers can update location.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        worker = request.user.worker_profile
        
        # Get location data
        current_latitude = request.data.get('current_latitude')
        current_longitude = request.data.get('current_longitude')
        
        # Validate location data
        if current_latitude is None or current_longitude is None:
            return Response({
                'success': False,
                'error': 'Both latitude and longitude are required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update current location
        worker.current_latitude = current_latitude
        worker.current_longitude = current_longitude
        worker.location_updated_at = timezone.now()
        worker.save(update_fields=[
            'current_latitude',
            'current_longitude',
            'location_updated_at',
            'updated_at'
        ])
        
        return Response({
            'success': True,
            'message': 'Location updated successfully.',
            'location_updated_at': worker.location_updated_at.isoformat(),
            'current_location': {
                'latitude': worker.current_latitude,
                'longitude': worker.current_longitude
            }
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Failed to update location: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_worker_status(request):
    """
    Get current worker availability and location status.
    
    Returns:
    {
        "success": true,
        "is_available": boolean,
        "current_location": {
            "latitude": float,
            "longitude": float,
            "updated_at": timestamp
        },
        "primary_location": {
            "address": string,
            "city": string,
            "latitude": float,
            "longitude": float
        }
    }
    """
    try:
        # Check if user is a worker
        if not hasattr(request.user, 'worker_profile'):
            return Response({
                'success': False,
                'error': 'Only workers can access this endpoint.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        worker = request.user.worker_profile
        
        response_data = {
            'success': True,
            'is_available': worker.is_available,
            'current_location': None,
            'primary_location': {
                'address': worker.primary_address or worker.address,
                'city': worker.primary_city or worker.city,
                'state': worker.primary_state or worker.state,
                'latitude': worker.primary_latitude or worker.latitude,
                'longitude': worker.primary_longitude or worker.longitude
            }
        }
        
        # Add current location if available
        if worker.current_latitude and worker.current_longitude:
            response_data['current_location'] = {
                'latitude': worker.current_latitude,
                'longitude': worker.current_longitude,
                'updated_at': worker.location_updated_at.isoformat() if worker.location_updated_at else None
            }
        
        return Response(response_data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Failed to get worker status: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def search_workers(request):
    """
    Search for available workers based on service, location, and availability.
    
    Expected data:
    {
        "service_category": str (e.g., "Construction"),
        "work_latitude": float,
        "work_longitude": float,
        "search_radius": int (in km, default 20),
        "number_of_workers": int (optional, default 1)
    }
    
    Returns:
    {
        "success": true,
        "workers": [
            {
                "id": uuid,
                "name": str,
                "distance_km": float,
                "distance_range": str (e.g., "0-5 km"),
                "rating": float,
                "experience": int,
                "services": [str],
                "is_available": bool
            }
        ],
        "grouped_by_distance": {
            "0-5 km": [...],
            "5-10 km": [...],
            "10-15 km": [...],
            "15-20 km": [...]
        }
    }
    """
    from math import radians, cos, sin, asin, sqrt
    from datetime import datetime, timedelta
    from django.db.models import Q
    
    try:
        # Extract search parameters
        service_category = request.data.get('service_category')
        work_latitude = request.data.get('work_latitude')
        work_longitude = request.data.get('work_longitude')
        search_radius = request.data.get('search_radius', 20)  # Default 20km
        number_of_workers = request.data.get('number_of_workers', 1)
        
        # Validate required parameters
        if not service_category:
            return Response({
                'success': False,
                'error': 'service_category is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if work_latitude is None or work_longitude is None:
            return Response({
                'success': False,
                'error': 'Work location (work_latitude and work_longitude) is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Convert to float
        try:
            work_lat = float(work_latitude)
            work_lon = float(work_longitude)
            radius = int(search_radius)
        except (ValueError, TypeError):
            return Response({
                'success': False,
                'error': 'Invalid location or radius format.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Haversine formula for distance calculation
        def calculate_distance(lat1, lon1, lat2, lon2):
            """
            Calculate the great circle distance between two points 
            on the earth (specified in decimal degrees).
            Returns distance in kilometers.
            """
            if lat2 is None or lon2 is None:
                return None
            
            # Convert decimal degrees to radians
            lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
            
            # Haversine formula
            dlon = lon2 - lon1
            dlat = lat2 - lat1
            a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
            c = 2 * asin(sqrt(a))
            r = 6371  # Radius of earth in kilometers
            return c * r
        
        # Check if location is fresh (updated within last 4 hours)
        def is_location_fresh(location_updated_at):
            if not location_updated_at:
                return False
            
            age = datetime.now(location_updated_at.tzinfo) - location_updated_at
            return age < timedelta(hours=4)
        
        # Get worker location for matching
        def get_worker_location(worker):
            """
            Returns (latitude, longitude) tuple for worker.
            Uses current location if fresh and available, otherwise primary location.
            """
            # If available and current location is fresh, use current location
            if (worker.is_available and 
                worker.current_latitude and 
                worker.current_longitude and 
                is_location_fresh(worker.location_updated_at)):
                return (worker.current_latitude, worker.current_longitude)
            
            # Fall back to primary location
            if worker.primary_latitude and worker.primary_longitude:
                return (worker.primary_latitude, worker.primary_longitude)
            
            # Last resort: legacy location fields
            if worker.latitude and worker.longitude:
                return (worker.latitude, worker.longitude)
            
            return (None, None)
        
        # Step 1: Filter by service category
        # Workers can have services in service_categories JSONField or via worker_services
        workers_query = WorkerProfile.objects.filter(
            Q(service_categories__contains=[service_category]) |
            Q(worker_services__service__name=service_category, worker_services__is_active=True)
        ).distinct()
        
        # Step 2: Filter by availability
        workers_query = workers_query.filter(is_available=True)
        
        # Step 3: Select related for efficiency
        workers_query = workers_query.select_related('user').prefetch_related('worker_services__service')
        
        # Step 4: Calculate distances and filter by radius
        matching_workers = []
        
        for worker in workers_query:
            worker_lat, worker_lon = get_worker_location(worker)
            
            if worker_lat is None or worker_lon is None:
                continue  # Skip workers without valid location
            
            # Calculate distance
            distance = calculate_distance(work_lat, work_lon, worker_lat, worker_lon)
            
            if distance is None or distance > radius:
                continue  # Skip workers outside search radius
            
            # Determine distance range
            if distance <= 5:
                distance_range = "0-5 km"
            elif distance <= 10:
                distance_range = "5-10 km"
            elif distance <= 15:
                distance_range = "10-15 km"
            else:
                distance_range = "15-20 km"
            
            # Get worker services
            services = []
            if worker.service_categories:
                services.extend(worker.service_categories)
            
            # Add services from worker_services table
            for ws in worker.worker_services.filter(is_active=True):
                if ws.service.name not in services:
                    services.append(ws.service.name)
            
            # Build worker data
            worker_data = {
                'id': str(worker.id),
                'user_id': str(worker.user.id),
                'name': worker.user.get_full_name(),
                'photo': worker.user.profile_picture.url if worker.user.profile_picture and hasattr(worker.user.profile_picture, 'url') else None,
                'profile_picture': worker.user.profile_picture.url if worker.user.profile_picture and hasattr(worker.user.profile_picture, 'url') else None,
                'distance_km': round(distance, 2),
                'distance_range': distance_range,
                'rating': float(worker.average_rating) if worker.average_rating else 0.0,
                'experience': worker.years_of_experience,
                'services': services,
                'is_available': worker.is_available,
                'hourly_rate': float(worker.hourly_rate) if worker.hourly_rate else 0.0,
                'total_jobs': worker.total_jobs_completed,
                'voice_resume_url': request.build_absolute_uri(worker.voice_resume_url) if worker.voice_resume_url else None,
                'location_updated_at': worker.location_updated_at.isoformat() if worker.location_updated_at else None,
            }
            
            matching_workers.append(worker_data)
        
        # Step 5: Sort by distance (closest first)
        matching_workers.sort(key=lambda x: x['distance_km'])
        
        # Step 6: Group by distance range
        grouped_workers = {
            "0-5 km": [],
            "5-10 km": [],
            "10-15 km": [],
            "15-20 km": []
        }
        
        for worker in matching_workers:
            distance_range = worker['distance_range']
            grouped_workers[distance_range].append(worker)
        
        return Response({
            'success': True,
            'message': f'Found {len(matching_workers)} available workers.',
            'search_params': {
                'service_category': service_category,
                'work_location': {
                    'latitude': work_lat,
                    'longitude': work_lon
                },
                'search_radius': radius,
                'number_of_workers': number_of_workers
            },
            'total_found': len(matching_workers),
            'workers': matching_workers,
            'grouped_by_distance': grouped_workers
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'error': f'Search failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_work_request(request):
    """
    Create a work request for a specific worker.
    
    Expected data:
    {
        "worker_id": str (UUID),
        "service_category": str,
        "work_location": {
            "address": str,
            "latitude": float,
            "longitude": float
        },
        "description": str,
        "number_of_workers": int (default 1),
        "required_date": str (ISO format, optional),
        "estimated_budget": float (optional)
    }
    
    Returns:
    {
        "success": true,
        "job_request": {...},
        "job_booking": {...}
    }
    """
    from jobs.models import JobRequest, JobBooking
    from datetime import datetime, timedelta
    
    try:
        # Get requesting user
        user = request.user
        
        # Get or create customer profile
        customer_profile = None
        if hasattr(user, 'customer_profile'):
            customer_profile = user.customer_profile
        else:
            # Create customer profile if doesn't exist
            from users.models import CustomerProfile
            customer_profile = CustomerProfile.objects.create(user=user)
        
        # Extract request data
        worker_id = request.data.get('worker_id')
        service_category = request.data.get('service_category')
        work_location = request.data.get('work_location', {})
        description = request.data.get('description', '')
        number_of_workers = request.data.get('number_of_workers', 1)
        required_date_str = request.data.get('required_date')
        estimated_budget = request.data.get('estimated_budget', 1000.0)
        
        # Validate required fields
        if not worker_id:
            return Response({
                'success': False,
                'error': 'worker_id is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not service_category:
            return Response({
                'success': False,
                'error': 'service_category is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not work_location or not work_location.get('latitude') or not work_location.get('longitude'):
            return Response({
                'success': False,
                'error': 'work_location with latitude and longitude is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get worker
        try:
            worker = WorkerProfile.objects.get(id=worker_id)
        except WorkerProfile.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Worker not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Parse required date (default to tomorrow if not provided)
        if required_date_str:
            try:
                required_date = datetime.fromisoformat(required_date_str.replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                required_date = datetime.now() + timedelta(days=1)
        else:
            required_date = datetime.now() + timedelta(days=1)
        
        # Create JobRequest
        job_request = JobRequest.objects.create(
            customer=customer_profile,
            service_category=service_category,
            description=description,
            work_address=work_location.get('address', 'Work location'),
            work_latitude=float(work_location['latitude']),
            work_longitude=float(work_location['longitude']),
            # Legacy fields for backward compatibility
            location_address=work_location.get('address', ''),
            latitude=float(work_location['latitude']),
            longitude=float(work_location['longitude']),
            estimated_budget=float(estimated_budget),
            required_date=required_date,
            number_of_workers=int(number_of_workers),
            status='assigned'  # Directly assigned to worker
        )
        
        # Create JobBooking for the specific worker
        job_booking = JobBooking.objects.create(
            job_request=job_request,
            worker=worker,
            quoted_price=float(estimated_budget),
            status='pending'  # Worker needs to accept
        )
        
        # Prepare response data
        response_data = {
            'success': True,
            'message': 'Work request created successfully.',
            'job_request': {
                'id': str(job_request.id),
                'service_category': job_request.service_category,
                'description': job_request.description,
                'work_address': job_request.work_address,
                'work_latitude': job_request.work_latitude,
                'work_longitude': job_request.work_longitude,
                'estimated_budget': float(job_request.estimated_budget),
                'required_date': job_request.required_date.isoformat(),
                'number_of_workers': job_request.number_of_workers,
                'status': job_request.status,
                'created_at': job_request.created_at.isoformat(),
            },
            'job_booking': {
                'id': str(job_booking.id),
                'worker_id': str(worker.id),
                'worker_name': worker.user.get_full_name(),
                'quoted_price': float(job_booking.quoted_price),
                'status': job_booking.status,
                'created_at': job_booking.created_at.isoformat(),
            }
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'error': f'Failed to create work request: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_worker_profile(request, worker_id=None):
    """
    Get worker's profile information. If worker_id is provided, returns that worker's profile.
    Otherwise returns the authenticated worker's own profile.
    
    Returns:
    {
        "success": true,
        "worker_profile": {
            "id": uuid,
            "name": str,
            "bio": str,
            "voice_resume_url": str,
            "skills": list,
            "experience": int,
            ...
        }
    }
    """
    try:
        target_worker_id = worker_id or request.GET.get('worker_id')
        if target_worker_id:
            try:
                worker = WorkerProfile.objects.select_related('user').get(id=target_worker_id)
            except (WorkerProfile.DoesNotExist, ValueError):
                return Response({
                    'success': False,
                    'error': 'Worker profile not found.'
                }, status=status.HTTP_404_NOT_FOUND)
        else:
            # Check if user is a worker
            if not hasattr(request.user, 'worker_profile'):
                return Response({
                    'success': False,
                    'error': 'Only workers can access this endpoint without worker_id.'
                }, status=status.HTTP_403_FORBIDDEN)
            worker = request.user.worker_profile
        
        voice_url = request.build_absolute_uri(worker.voice_resume_url) if worker.voice_resume_url else None
        
        profile_data = {
            'id': str(worker.id),
            'user_id': str(worker.user.id),
            'name': worker.user.get_full_name(),
            'email': worker.user.email,
            'phone': worker.user.phone_number,
            'bio': worker.bio,
            'skills': worker.skills,
            'years_of_experience': worker.years_of_experience,
            'service_categories': worker.service_categories,
            'hourly_rate': float(worker.hourly_rate) if worker.hourly_rate else 0.0,
            'is_available': worker.is_available,
            'voice_resume_url': voice_url,
            'total_jobs_completed': worker.total_jobs_completed,
            'average_rating': float(worker.average_rating) if worker.average_rating else 0.0,
            'total_earnings': float(worker.total_earnings) if worker.total_earnings else 0.0,
            'is_verified': worker.is_verified,
            'primary_location': {
                'address': worker.primary_address or worker.address,
                'city': worker.primary_city or worker.city,
                'state': worker.primary_state or worker.state,
                'pincode': worker.primary_pincode or worker.pincode,
            },
            'created_at': worker.created_at.isoformat(),
            'updated_at': worker.updated_at.isoformat(),
        }
        
        return Response({
            'success': True,
            'worker_profile': profile_data
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Failed to get worker profile: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PATCH', 'PUT'])
@permission_classes([IsAuthenticated])
def update_worker_profile(request):
    """
    Update worker profile information including voice resume.
    
    Expected data (form-data for file upload):
    {
        "bio": str (optional),
        "hourly_rate": float (optional),
        "voice_introduction": file (optional) - audio file
        "remove_voice_resume": bool (optional) - remove existing voice resume
        ... other fields
    }
    
    Returns:
    {
        "success": true,
        "message": str,
        "worker_profile": {...}
    }
    """
    try:
        # Check if user is a worker
        if not hasattr(request.user, 'worker_profile'):
            return Response({
                'success': False,
                'error': 'Only workers can update profile.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        worker = request.user.worker_profile
        
        # Handle remove voice introduction request
        remove_voice = request.data.get('remove_voice_resume')
        if remove_voice in [True, 'true', 'True', 1, '1']:
            if worker.voice_resume_url:
                try:
                    from django.core.files.storage import default_storage
                    from django.conf import settings
                    rel_path = worker.voice_resume_url.replace(settings.MEDIA_URL, '', 1)
                    if default_storage.exists(rel_path):
                        default_storage.delete(rel_path)
                except Exception as del_err:
                    print(f"[WARN] Failed to delete audio file: {del_err}")
                worker.voice_resume_url = None
                print('[OK] Voice resume removed from worker profile')
        
        # Handle voice introduction file upload
        voice_file = request.FILES.get('voice_introduction')
        if voice_file:
            # Save file to media storage
            from django.core.files.storage import default_storage
            from django.core.files.base import ContentFile
            import os
            from datetime import datetime
            
            # Generate unique filename
            ext = os.path.splitext(voice_file.name)[1]
            filename = f'voice_resumes/{worker.id}_{datetime.now().timestamp()}{ext}'
            
            # Save file
            path = default_storage.save(filename, ContentFile(voice_file.read()))
            
            # Get full URL
            from django.conf import settings
            voice_url = f'{settings.MEDIA_URL}{path}'
            worker.voice_resume_url = voice_url
            
            print(f'[OK] Voice resume uploaded: {voice_url}')
        
        # Update other fields if provided
        if 'bio' in request.data:
            worker.bio = request.data['bio']
        
        if 'hourly_rate' in request.data:
            worker.hourly_rate = float(request.data['hourly_rate'])
        
        if 'skills' in request.data:
            import json
            if isinstance(request.data['skills'], str):
                worker.skills = json.loads(request.data['skills'])
            else:
                worker.skills = request.data['skills']
        
        if 'service_categories' in request.data:
            import json
            if isinstance(request.data['service_categories'], str):
                worker.service_categories = json.loads(request.data['service_categories'])
            else:
                worker.service_categories = request.data['service_categories']
        
        # Save changes
        worker.save()
        
        voice_url = request.build_absolute_uri(worker.voice_resume_url) if worker.voice_resume_url else None
        
        return Response({
            'success': True,
            'message': 'Profile updated successfully.',
            'worker_profile': {
                'id': str(worker.id),
                'bio': worker.bio,
                'voice_resume_url': voice_url,
                'hourly_rate': float(worker.hourly_rate) if worker.hourly_rate else 0.0,
                'updated_at': worker.updated_at.isoformat(),
            }
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'error': f'Failed to update profile: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
