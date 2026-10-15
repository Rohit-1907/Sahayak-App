"""
Add IN_PROGRESS status to work_requests status check constraint
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sahayak_backend.settings')
django.setup()

from django.db import connection

def update_status_constraint():
    print("=== Adding IN_PROGRESS Status ===\n")
    
    with connection.cursor() as cursor:
        try:
            # Drop old constraint
            print("Dropping old constraint...")
            cursor.execute("""
                ALTER TABLE work_requests 
                DROP CONSTRAINT IF EXISTS work_requests_status_check
            """)
            
            # Add new constraint with IN_PROGRESS
            print("Adding new constraint with IN_PROGRESS...")
            cursor.execute("""
                ALTER TABLE work_requests 
                ADD CONSTRAINT work_requests_status_check 
                CHECK (status IN ('REQUESTED', 'SCHEDULED', 'IN_PROGRESS', 'REJECTED', 'CANCELLED', 'COMPLETED'))
            """)
            
            print("[OK] Constraint updated successfully!")
            
        except Exception as e:
            print(f"[FAIL] Error: {str(e)}")
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    update_status_constraint()
