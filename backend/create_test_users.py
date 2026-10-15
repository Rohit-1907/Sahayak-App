"""
Create test users for the app
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sahayak_backend.settings')
django.setup()

from authentication.models import SahayakUser, UserRole
from users.models import CustomerProfile

def create_users():
    print("=== Creating Test Users ===\n")
    
    # Get or create customer role
    customer_role, _ = UserRole.objects.get_or_create(
        role='customer',
        defaults={'description': 'Customer who requests services'}
    )
    
    # Create siya190807@gmail.com
    try:
        user = SahayakUser.objects.create_user(
            username='siya190807',
            email='siya190807@gmail.com',
            phone_number='9876543210',
            password='password123',  # Change this!
            first_name='Siya',
            last_name='Sharma',
            role=customer_role,
            is_verified=True,
            is_phone_verified=True
        )
        
        # Create customer profile
        CustomerProfile.objects.create(
            user=user,
            address='Pune, Maharashtra'
        )
        
        print(f"[OK] Created user: {user.email}")
        print(f"   Password: password123")
        print(f"   Phone: {user.phone_number}")
        
    except Exception as e:
        print(f"[WARN] User might already exist or error: {str(e)}")
    
    print("\n=== Done! ===")

if __name__ == '__main__':
    create_users()
