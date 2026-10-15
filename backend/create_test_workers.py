"""
Create test workers with different locations and services for testing the location-based matching system.

Usage:
    python manage.py shell < create_test_workers.py

Or:
    python create_test_workers.py
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sahayak_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from users.models import WorkerProfile, CustomerProfile
# ServiceCategory is not needed for this script
from datetime import datetime, timedelta

User = get_user_model()  # This will get the custom SahayakUser model


def create_test_workers():
    """Create test workers with various locations and services around Pune."""
    
    print("Creating test workers...")
    
    # Test worker data: (name, email, phone, service, primary_location, current_location, available, experience, rating)
    test_workers = [
        # Construction workers
        {
            'name': 'Amit Kumar',
            'email': 'amit.kumar@test.com',
            'phone': '9876543210',
            'service': 'Construction',
            'primary': {
                'address': 'Dighi, Pune',
                'city': 'Pune',
                'state': 'Maharashtra',
                'latitude': 18.6186,
                'longitude': 73.9196,
            },
            'current': {
                'latitude': 18.6200,  # Currently in Dighi area
                'longitude': 73.9210,
            },
            'available': True,
            'experience': 5,
            'rating': 4.8,
            'hourly_rate': 500,
        },
        {
            'name': 'Ravi Sharma',
            'email': 'ravi.sharma@test.com',
            'phone': '9876543211',
            'service': 'Construction',
            'primary': {
                'address': 'Bhosari, Pune',
                'city': 'Pune',
                'state': 'Maharashtra',
                'latitude': 18.6498,
                'longitude': 73.8345,
            },
            'current': {
                'latitude': 18.6298,  # Currently at work site in Pimpri
                'longitude': 73.8099,
            },
            'available': True,
            'experience': 7,
            'rating': 4.6,
            'hourly_rate': 550,
        },
        {
            'name': 'Suresh Patil',
            'email': 'suresh.patil@test.com',
            'phone': '9876543212',
            'service': 'Construction',
            'primary': {
                'address': 'Kharadi, Pune',
                'city': 'Pune',
                'state': 'Maharashtra',
                'latitude': 18.5515,
                'longitude': 73.9493,
            },
            'current': {
                'latitude': 18.5515,
                'longitude': 73.9493,
            },
            'available': True,
            'experience': 4,
            'rating': 4.5,
            'hourly_rate': 450,
        },
        
        # Plumbing workers
        {
            'name': 'Vijay Deshmukh',
            'email': 'vijay.deshmukh@test.com',
            'phone': '9876543213',
            'service': 'Plumbing',
            'primary': {
                'address': 'Pimple Saudagar, Pune',
                'city': 'Pune',
                'state': 'Maharashtra',
                'latitude': 18.5850,
                'longitude': 73.8076,
            },
            'current': {
                'latitude': 18.5850,
                'longitude': 73.8076,
            },
            'available': True,
            'experience': 6,
            'rating': 4.7,
            'hourly_rate': 400,
        },
        {
            'name': 'Rahul Joshi',
            'email': 'rahul.joshi@test.com',
            'phone': '9876543214',
            'service': 'Plumbing',
            'primary': {
                'address': 'Wakad, Pune',
                'city': 'Pune',
                'state': 'Maharashtra',
                'latitude': 18.5998,
                'longitude': 73.7647,
            },
            'current': {
                'latitude': 18.5998,
                'longitude': 73.7647,
            },
            'available': False,  # Not available
            'experience': 8,
            'rating': 4.9,
            'hourly_rate': 600,
        },
        
        # Electrical workers
        {
            'name': 'Prakash Mehta',
            'email': 'prakash.mehta@test.com',
            'phone': '9876543215',
            'service': 'Electrical',
            'primary': {
                'address': 'Hinjewadi, Pune',
                'city': 'Pune',
                'state': 'Maharashtra',
                'latitude': 18.5912,
                'longitude': 73.7389,
            },
            'current': {
                'latitude': 18.5912,
                'longitude': 73.7389,
            },
            'available': True,
            'experience': 5,
            'rating': 4.5,
            'hourly_rate': 450,
        },
        {
            'name': 'Sanjay Kulkarni',
            'email': 'sanjay.kulkarni@test.com',
            'phone': '9876543216',
            'service': 'Electrical',
            'primary': {
                'address': 'Aundh, Pune',
                'city': 'Pune',
                'state': 'Maharashtra',
                'latitude': 18.5585,
                'longitude': 73.8085,
            },
            'current': {
                'latitude': 18.5585,
                'longitude': 73.8085,
            },
            'available': True,
            'experience': 6,
            'rating': 4.6,
            'hourly_rate': 480,
        },
        
        # Painting workers
        {
            'name': 'Ganesh Pawar',
            'email': 'ganesh.pawar@test.com',
            'phone': '9876543217',
            'service': 'Painting',
            'primary': {
                'address': 'Katraj, Pune',
                'city': 'Pune',
                'state': 'Maharashtra',
                'latitude': 18.4489,
                'longitude': 73.8673,
            },
            'current': {
                'latitude': 18.4489,
                'longitude': 73.8673,
            },
            'available': True,
            'experience': 4,
            'rating': 4.4,
            'hourly_rate': 380,
        },
        
        # Carpentry workers
        {
            'name': 'Mahesh Yadav',
            'email': 'mahesh.yadav@test.com',
            'phone': '9876543218',
            'service': 'Carpentry',
            'primary': {
                'address': 'Hadapsar, Pune',
                'city': 'Pune',
                'state': 'Maharashtra',
                'latitude': 18.5089,
                'longitude': 73.9260,
            },
            'current': {
                'latitude': 18.5089,
                'longitude': 73.9260,
            },
            'available': True,
            'experience': 7,
            'rating': 4.7,
            'hourly_rate': 520,
        },
        
        # Far away worker (for testing radius filtering)
        {
            'name': 'Deepak Salve',
            'email': 'deepak.salve@test.com',
            'phone': '9876543219',
            'service': 'Construction',
            'primary': {
                'address': 'Talegaon, Pune',
                'city': 'Pune',
                'state': 'Maharashtra',
                'latitude': 18.7351,
                'longitude': 73.6763,
            },
            'current': {
                'latitude': 18.7351,
                'longitude': 73.6763,
            },
            'available': True,
            'experience': 5,
            'rating': 4.3,
            'hourly_rate': 420,
        },
    ]
    
    created_count = 0
    
    for worker_data in test_workers:
        try:
            # Check if user already exists
            if User.objects.filter(email=worker_data['email']).exists():
                print(f"[FAIL] User {worker_data['email']} already exists, skipping...")
                continue
            
            # Create user
            user = User.objects.create_user(
                username=worker_data['email'],
                email=worker_data['email'],
                password='test1234',  # Default password for all test users
                first_name=worker_data['name'].split()[0],
                last_name=' '.join(worker_data['name'].split()[1:]),
            )
            
            # Create worker profile
            worker_profile = WorkerProfile.objects.create(
                user=user,
                phone=worker_data['phone'],
                service_categories=[worker_data['service']],
                
                # Primary location
                primary_address=worker_data['primary']['address'],
                primary_city=worker_data['primary']['city'],
                primary_state=worker_data['primary']['state'],
                primary_latitude=worker_data['primary']['latitude'],
                primary_longitude=worker_data['primary']['longitude'],
                
                # Current location
                current_latitude=worker_data['current']['latitude'],
                current_longitude=worker_data['current']['longitude'],
                location_updated_at=datetime.now() - timedelta(minutes=30),  # Updated 30 min ago
                
                # Status
                is_available=worker_data['available'],
                is_verified=True,
                
                # Details
                years_of_experience=worker_data['experience'],
                average_rating=worker_data['rating'],
                hourly_rate=worker_data['hourly_rate'],
                total_jobs_completed=worker_data['rating'] * 10,  # Estimate
            )
            
            print(f"[OK] Created worker: {worker_data['name']} ({worker_data['service']}) at {worker_data['primary']['address']}")
            created_count += 1
            
        except Exception as e:
            print(f"[FAIL] Error creating worker {worker_data['name']}: {str(e)}")
    
    print(f"\n[OK] Created {created_count} test workers successfully!")
    print(f"[LOC] All workers are located around Pune")
    print(f"[AUTH] Default password for all test users: test1234")
    
    return created_count


def create_test_customer():
    """Create a test customer account."""
    
    print("\n\nCreating test customer...")
    
    try:
        # Check if customer exists
        if User.objects.filter(email='test.customer@test.com').exists():
            print("[FAIL] Test customer already exists")
            return False
        
        # Create user
        user = User.objects.create_user(
            username='test.customer@test.com',
            email='test.customer@test.com',
            password='test1234',
            first_name='Test',
            last_name='Customer',
        )
        
        # Create customer profile
        customer_profile = CustomerProfile.objects.create(
            user=user,
            phone='9999999999',
            address='Test Address, Pune',
        )
        
        print("[OK] Created test customer: test.customer@test.com")
        print("[AUTH] Password: test1234")
        return True
        
    except Exception as e:
        print(f"[FAIL] Error creating customer: {str(e)}")
        return False


def print_test_scenarios():
    """Print test scenarios for manual testing."""
    
    print("\n\n" + "="*70)
    print("TEST SCENARIOS")
    print("="*70)
    
    print("""
### Test Scenario 1: Construction Workers Near Dighi
Work Location: Dighi, Pune (18.6186, 73.9196)
Service: Construction
Radius: 20 km

Expected Results:
 Amit Kumar - 0.2 km (0-5 km group) - Available
 Ravi Sharma - 8.5 km (5-10 km group) - Available  
 Suresh Patil - 12.3 km (10-15 km group) - Available
 Deepak Salve - 27 km (outside radius) - Not shown

---

### Test Scenario 2: Plumbing Workers Near Pimple Saudagar
Work Location: Pimple Saudagar (18.5850, 73.8076)
Service: Plumbing
Radius: 15 km

Expected Results:
 Vijay Deshmukh - 0.1 km (0-5 km group) - Available
 Rahul Joshi - 4.5 km but NOT AVAILABLE - Not shown

---

### Test Scenario 3: Electrical Workers Near Hinjewadi
Work Location: Hinjewadi (18.5912, 73.7389)
Service: Electrical
Radius: 20 km

Expected Results:
 Prakash Mehta - 0.2 km (0-5 km group) - Available
 Sanjay Kulkarni - 7.8 km (5-10 km group) - Available

---

### Test Scenario 4: Small Radius Test
Work Location: Dighi (18.6186, 73.9196)
Service: Construction
Radius: 5 km

Expected Results:
 Amit Kumar - 0.2 km (0-5 km group) - Available
 Ravi Sharma - 8.5 km (outside radius) - Not shown
 Suresh Patil - 12.3 km (outside radius) - Not shown

---

### Test Scenario 5: No Results
Work Location: Lonavala (18.7500, 73.4074) - Far from Pune
Service: Construction
Radius: 10 km

Expected Results:
 No workers found (all too far)

---

### Login Credentials:

Test Customer:
Email: test.customer@test.com
Password: test1234

Test Workers (all have password: test1234):
- amit.kumar@test.com
- ravi.sharma@test.com
- suresh.patil@test.com
- vijay.deshmukh@test.com
- rahul.joshi@test.com
- prakash.mehta@test.com
- sanjay.kulkarni@test.com
- ganesh.pawar@test.com
- mahesh.yadav@test.com
- deepak.salve@test.com

---

### Testing Checklist:

Client App Testing:
□ Login as test.customer@test.com
□ Navigate to WorkRequestScreen
□ Select service category
□ Set work location (use GPS or manual)
□ Set search radius
□ Tap "Find Available Workers"
□ Verify results grouped by distance
□ Verify only available workers shown
□ Verify correct service workers shown
□ Tap "View Profile" on a worker
□ Verify distance shown (not exact GPS)
□ Tap "Request Worker"
□ Complete booking
□ Verify success message

Worker App Testing:
□ Login as amit.kumar@test.com
□ Toggle availability ON
□ Verify current location updated
□ Verify "Available" status shown
□ Toggle availability OFF
□ Verify "Not Available" status
□ Login as different worker
□ Repeat availability tests

Backend API Testing:
□ Test search endpoint with various parameters
□ Test with invalid auth token (should fail)
□ Test with missing parameters (should fail)
□ Test with worker outside radius
□ Test with unavailable worker
□ Test distance calculations accuracy
□ Test location freshness logic

Privacy Testing:
□ Verify exact GPS not in API response
□ Verify only distance_km shown
□ Verify distance_range shown
□ Verify worker address not exposed
□ Verify contact info hidden before booking

---

### Distance Calculation Formula:

Haversine formula is used to calculate great circle distance:
- Earth radius: 6371 km
- Input: Two GPS coordinates
- Output: Distance in kilometers
- Accurate for distances up to 100 km

Example:
Dighi (18.6186, 73.9196) to Bhosari (18.6498, 73.8345)
Distance ≈ 8.5 km

""")
    
    print("="*70)
    print("Ready for testing!")
    print("="*70)


if __name__ == "__main__":
    print("="*70)
    print("TEST DATA SETUP - Location-Based Worker Matching System")
    print("="*70)
    print()
    
    # Create test workers
    worker_count = create_test_workers()
    
    # Create test customer
    create_test_customer()
    
    # Print test scenarios
    print_test_scenarios()
    
    print("\n[OK] Test data setup complete!")
    print("[DEV] You can now test the apps with realistic data")
    print("[SEARCH] Search for workers and verify location-based matching")
