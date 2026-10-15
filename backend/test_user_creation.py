"""
Test user creation manually to diagnose the issue.
"""
import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sahayak_backend.settings')
django.setup()

from authentication.models import SahayakUser, UserRole
from users.models import CustomerProfile
import time

def test_user_creation():
    """Test creating a user with the problematic ID"""
    
    # The problematic user ID from the error
    user_id = "5770d550-eab6-4e53-a575-c601e41c4a4a"
    email = "test_user@example.com"
    
    print("=" * 60)
    print("USER CREATION TEST")
    print("=" * 60)
    
    # Check if user already exists
    print(f"\n1. Checking if user {user_id} exists...")
    try:
        existing_user = SahayakUser.objects.get(id=user_id)
        print(f"   [OK] User EXISTS: {existing_user.email}")
        print(f"      Phone: {existing_user.phone_number}")
        print(f"      Role: {existing_user.role}")
        
        # Check customer profile
        try:
            profile = CustomerProfile.objects.get(user=existing_user)
            print(f"   [OK] Customer profile EXISTS: {profile.id}")
        except CustomerProfile.DoesNotExist:
            print(f"   [FAIL] Customer profile DOES NOT EXIST")
        
        return existing_user
    except SahayakUser.DoesNotExist:
        print(f"   [FAIL] User DOES NOT EXIST in database")
    
    # Create the user
    print(f"\n2. Creating user {user_id}...")
    try:
        # Get or create role
        client_role, created = UserRole.objects.get_or_create(
            role='customer',
            defaults={'description': 'Customer who requests services'}
        )
        print(f"   Role: {client_role.role} (created={created})")
        
        # Generate unique phone
        phone = f'TEMP{int(time.time() * 1000) % 10000000000}'
        print(f"   Phone: {phone}")
        
        # Create user
        user = SahayakUser.objects.create(
            id=user_id,
            username=email.split('@')[0],
            email=email,
            phone_number=phone,
            role=client_role,
            is_verified=True,
            is_active=True
        )
        print(f"   [OK] User CREATED: {user.email} (ID: {user.id})")
        
        # Create customer profile
        print(f"\n3. Creating customer profile...")
        profile = CustomerProfile.objects.create(user=user)
        print(f"   [OK] Customer profile CREATED: {profile.id}")
        
        return user
        
    except Exception as e:
        print(f"   [FAIL] ERROR: {e}")
        import traceback
        traceback.print_exc()
        return None

def verify_database():
    """Verify database connection and tables"""
    print("\n" + "=" * 60)
    print("DATABASE VERIFICATION")
    print("=" * 60)
    
    # Count users
    user_count = SahayakUser.objects.count()
    print(f"\n[STATS] Total users in database: {user_count}")
    
    # List recent users
    print(f"\n[TASK] Recent users:")
    for user in SahayakUser.objects.order_by('-created_at')[:5]:
        print(f"   - {user.email} (ID: {user.id}, Phone: {user.phone_number})")
    
    # Count customer profiles
    profile_count = CustomerProfile.objects.count()
    print(f"\n[STATS] Total customer profiles: {profile_count}")
    
    # Count user roles
    role_count = UserRole.objects.count()
    print(f"\n[STATS] Total user roles: {role_count}")
    for role in UserRole.objects.all():
        print(f"   - {role.role}: {role.description}")

if __name__ == "__main__":
    verify_database()
    print("\n")
    test_user_creation()
    print("\n")
    verify_database()
    print("\n" + "=" * 60)
    print("DONE!")
    print("=" * 60)
