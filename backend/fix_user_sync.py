"""
Fix user sync issue: Create missing user records in custom users table.
Run this when JWT contains a user ID that doesn't exist in the users table.
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sahayak_backend.settings')
django.setup()

from authentication.models import SahayakUser
from supabase import create_client, Client
from django.conf import settings

# Initialize Supabase client
SUPABASE_URL = "https://lefsctqcgrgrsumkxyhz.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlZnNjdHFjZ3JncnN1bWt4eWh6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzMyMDQxNCwiZXhwIjoyMTAyODk2NDE0fQ.28CTaNr8C9xEhhhgJZzQkwwM4Gr7gnvAoQ_W7j1IEiE"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def sync_auth_users_to_custom_table():
    """
    Fetch all users from Supabase auth and ensure they exist in custom users table.
    """
    print("[REFRESH] Starting user sync...")
    
    try:
        # Get all users from Supabase auth
        response = supabase.auth.admin.list_users()
        auth_users = response
        
        if not hasattr(auth_users, '__iter__'):
            print("[FAIL] Failed to fetch auth users")
            return
        
        created_count = 0
        existing_count = 0
        
        for auth_user in auth_users:
            user_id = auth_user.id
            email = auth_user.email
            
            # Check if user exists in custom table
            if SahayakUser.objects.filter(id=user_id).exists():
                print(f"[OK] User already exists: {email} ({user_id})")
                existing_count += 1
                continue
            
            # Create user in custom table
            user_metadata = auth_user.user_metadata or {}
            
            user = SahayakUser.objects.create(
                id=user_id,
                email=email,
                full_name=user_metadata.get('full_name', email.split('@')[0]),
                phone_number=user_metadata.get('phone_number', ''),
                user_role=user_metadata.get('user_role', 'client'),
                is_active=True,
            )
            
            print(f"[OK] Created user: {email} ({user_id})")
            created_count += 1
        
        print(f"\n[OK] Sync complete!")
        print(f"   Created: {created_count}")
        print(f"   Existing: {existing_count}")
        print(f"   Total: {created_count + existing_count}")
        
    except Exception as e:
        print(f"[FAIL] Error during sync: {e}")
        import traceback
        traceback.print_exc()

def check_specific_user(user_id):
    """Check if a specific user exists."""
    print(f"\n[SEARCH] Checking user: {user_id}")
    
    # Check in custom table
    if SahayakUser.objects.filter(id=user_id).exists():
        user = SahayakUser.objects.get(id=user_id)
        print(f"[OK] Found in custom table:")
        print(f"   Email: {user.email}")
        print(f"   Name: {user.full_name}")
        print(f"   Role: {user.user_role}")
    else:
        print(f"[FAIL] NOT found in custom users table")
    
    # Check in Supabase auth
    try:
        response = supabase.auth.admin.get_user_by_id(user_id)
        if response:
            print(f"[OK] Found in Supabase auth:")
            print(f"   Email: {response.email}")
    except Exception as e:
        print(f"[FAIL] NOT found in Supabase auth: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("USER SYNC FIX TOOL")
    print("=" * 60)
    
    # Check the problematic user ID from the error
    problematic_user_id = "5770d550-eab6-4e53-a575-c601e41c4a4a"
    check_specific_user(problematic_user_id)
    
    # Sync all auth users
    sync_auth_users_to_custom_table()
    
    # Check again
    check_specific_user(problematic_user_id)
    
    print("\n" + "=" * 60)
    print("Done! User should now be synced.")
    print("=" * 60)
