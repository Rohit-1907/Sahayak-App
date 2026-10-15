"""
Create a test Cook worker in the database.
"""
import os
import django
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sahayak_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from users.models import WorkerProfile

User = get_user_model()

def create_cook_worker():
    """Create a Cook worker near Pune."""
    
    print("Creating Cook worker...")
    
    # Worker data
    email = 'cook.test@test.com'
    password = 'cook123'
    phone = '9876543220'
    
    try:
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            print(f"[OK] User {email} already exists, updating...")
            user = User.objects.get(email=email)
            user.set_password(password)
            user.save()
        else:
            # Create user with phone number
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                first_name='Rajesh',
                last_name='Kumar',
            )
            # Set phone number separately
            user.phone_number = phone
            user.save()
            print(f"[OK] Created user: {email}")
        
        # Check if worker profile exists
        if hasattr(user, 'worker_profile') and user.worker_profile:
            print("[OK] Worker profile exists, updating...")
            worker = user.worker_profile
        else:
            # Create worker profile
            worker = WorkerProfile.objects.create(
                user=user,
                service_categories=['Cook'],
                
                # Primary location - Pune (near city center)
                primary_address='Shivajinagar, Pune',
                primary_city='Pune',
                primary_state='Maharashtra',
                primary_latitude=18.5314,
                primary_longitude=73.8446,
                
                # Current location (same as primary)
                current_latitude=18.5314,
                current_longitude=73.8446,
                location_updated_at=datetime.now() - timedelta(minutes=10),
                
                # Status
                is_available=True,
                is_verified=True,
                
                # Details
                years_of_experience=5,
                average_rating=4.7,
                hourly_rate=300,
                total_jobs_completed=85,
                bio='Professional cook with 5 years of experience in Indian, Chinese, and Continental cuisine. Available for home cooking, party catering, and meal preparation.',
            )
            print(f"[OK] Created Cook worker profile")
        
        # Update worker to ensure they're available
        worker.is_available = True
        worker.service_categories = ['Cook']
        worker.current_latitude = 18.5314
        worker.current_longitude = 73.8446
        worker.location_updated_at = datetime.now()
        worker.save()
        
        print("\n" + "="*70)
        print("[OK] COOK WORKER CREATED SUCCESSFULLY!")
        print("="*70)
        print(f"\nLogin Credentials:")
        print(f"  Email: {email}")
        print(f"  Password: {password}")
        print(f"\nWorker Details:")
        print(f"  Name: {user.first_name} {user.last_name}")
        print(f"  Service: Cook")
        print(f"  Location: Shivajinagar, Pune")
        print(f"  Coordinates: {worker.primary_latitude}, {worker.primary_longitude}")
        print(f"  Phone: {phone}")
        print(f"  Available: {worker.is_available}")
        print(f"  Experience: {worker.years_of_experience} years")
        print(f"  Rating: {worker.average_rating}/5")
        print(f"  Jobs Completed: {worker.total_jobs_completed}")
        print(f"\nDistance from search location (18.5204, 73.8567):")
        print(f"  Approximately 2.7 km")
        print("\n" + "="*70)
        print("You can now search for Cook in the client app!")
        print("="*70)
        
    except Exception as e:
        print(f"[FAIL] Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    create_cook_worker()
