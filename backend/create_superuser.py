"""
Create Django superuser for admin access
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sahayak_backend.settings')
django.setup()

from authentication.models import SahayakUser, UserRole

def create_superuser():
    """Create admin superuser"""
    
    email = 'admin@sahayak.com'
    username = 'admin'
    password = 'admin123'  # Change this after first login!
    
    # Check if superuser already exists
    if SahayakUser.objects.filter(email=email).exists():
        print(f"[WARN]  Superuser already exists: {email}")
        admin = SahayakUser.objects.get(email=email)
        print(f"   Username: {admin.username}")
        print(f"   Email: {admin.email}")
        print(f"   Is Superuser: {admin.is_superuser}")
        return
    
    # Get or create admin role
    admin_role, created = UserRole.objects.get_or_create(
        role='admin',
        defaults={'description': 'Administrator with full access'}
    )
    
    print("=" * 70)
    print("CREATING DJANGO SUPERUSER")
    print("=" * 70)
    
    # Create superuser
    admin = SahayakUser.objects.create_superuser(
        username=username,
        email=email,
        password=password,
        first_name='Admin',
        last_name='User',
        phone_number='9999999999',
        role=admin_role
    )
    
    print(f"\n[OK] Superuser created successfully!")
    print("\n" + "=" * 70)
    print("ADMIN CREDENTIALS")
    print("=" * 70)
    print(f"Username: {username}")
    print(f"Email: {email}")
    print(f"Password: {password}")
    print("=" * 70)
    print(f"\n[LINK] Admin URL: http://10.119.99.150:8000/admin/")
    print(f"[WARN]  IMPORTANT: Change the password after first login!")
    print("=" * 70)

if __name__ == '__main__':
    create_superuser()
