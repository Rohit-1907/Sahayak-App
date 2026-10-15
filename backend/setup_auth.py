"""
Setup script to create initial user roles after migration.
Run this after: python manage.py migrate
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sahayak_backend.settings')
django.setup()

from authentication.models import UserRole

def create_roles():
    """Create initial user roles."""
    roles = [
        {
            'role': 'customer',
            'description': 'Customer who requests services through the client app',
            'permissions': {
                'can_request_service': True,
                'can_view_workers': True,
                'can_book_service': True,
                'can_rate_workers': True,
            }
        },
        {
            'role': 'individual_worker',
            'description': 'Independent worker providing services',
            'permissions': {
                'can_accept_jobs': True,
                'can_update_availability': True,
                'can_view_job_requests': True,
                'can_update_profile': True,
            }
        },
        {
            'role': 'organization_admin',
            'description': 'Organization leader who manages workers and assigns work',
            'permissions': {
                'can_add_workers': True,
                'can_remove_workers': True,
                'can_accept_work_requests': True,
                'can_reject_work_requests': True,
                'can_assign_work': True,
                'can_view_worker_progress': True,
                'can_manage_organization': True,
            }
        },
        {
            'role': 'organization_worker',
            'description': 'Worker belonging to an organization',
            'permissions': {
                'can_view_assigned_work': True,
                'can_update_work_progress': True,
                'can_mark_work_complete': True,
                'can_view_work_details': True,
            }
        },
        {
            'role': 'admin',
            'description': 'Platform administrator with full access',
            'permissions': {
                'can_manage_all_users': True,
                'can_manage_all_organizations': True,
                'can_view_analytics': True,
                'can_manage_platform_settings': True,
            }
        },
    ]
    
    created_count = 0
    updated_count = 0
    
    for role_data in roles:
        role_obj, created = UserRole.objects.get_or_create(
            role=role_data['role'],
            defaults={
                'description': role_data['description'],
                'permissions': role_data['permissions']
            }
        )
        
        if created:
            print(f"[OK] Created role: {role_obj.get_role_display()}")
            created_count += 1
        else:
            # Update description and permissions if role already exists
            role_obj.description = role_data['description']
            role_obj.permissions = role_data['permissions']
            role_obj.save()
            print(f"[NOTE] Updated role: {role_obj.get_role_display()}")
            updated_count += 1
    
    print(f"\n[OK] Setup complete!")
    print(f"   Created: {created_count} roles")
    print(f"   Updated: {updated_count} roles")
    print(f"   Total: {UserRole.objects.count()} roles")

if __name__ == '__main__':
    print("[START] Setting up user roles...\n")
    create_roles()
