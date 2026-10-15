"""
Update otp_notifications table schema to match Django model
"""
import os
import django
from django.db import connection

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sahayak_backend.settings')
django.setup()

def update_schema():
    """Update the otp_notifications table schema"""
    print("=== Updating OTP Notifications Table Schema ===\n")
    
    with connection.cursor() as cursor:
        try:
            # Add user_id column
            print("Adding user_id column...")
            cursor.execute("""
                ALTER TABLE otp_notifications 
                ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
            """)
            print("[OK] user_id column added")
            
            # Add title column
            print("Adding title column...")
            cursor.execute("""
                ALTER TABLE otp_notifications 
                ADD COLUMN IF NOT EXISTS title VARCHAR(255) DEFAULT 'Worker Arrival Verification';
            """)
            print("[OK] title column added")
            
            # Add body column
            print("Adding body column...")
            cursor.execute("""
                ALTER TABLE otp_notifications 
                ADD COLUMN IF NOT EXISTS body TEXT DEFAULT 'Please provide this PIN to verify worker arrival';
            """)
            print("[OK] body column added")
            
            # Rename otp to pin if needed
            print("Checking if otp column needs renaming...")
            cursor.execute("""
                SELECT column_name FROM information_schema.columns 
                WHERE table_name='otp_notifications' AND column_name='otp';
            """)
            if cursor.fetchone():
                print("Renaming otp to pin...")
                cursor.execute("ALTER TABLE otp_notifications RENAME COLUMN otp TO pin;")
                print("[OK] otp column renamed to pin")
            else:
                print("[OK] pin column already exists")
            
            # Remove phone column if exists
            print("Removing phone column if exists...")
            cursor.execute("ALTER TABLE otp_notifications DROP COLUMN IF EXISTS phone;")
            print("[OK] phone column removed (if existed)")
            
            # Remove purpose column if exists
            print("Removing purpose column if exists...")
            cursor.execute("ALTER TABLE otp_notifications DROP COLUMN IF EXISTS purpose;")
            print("[OK] purpose column removed (if existed)")
            
            # Remove is_read column if exists
            print("Removing is_read column if exists...")
            cursor.execute("ALTER TABLE otp_notifications DROP COLUMN IF EXISTS is_read;")
            print("[OK] is_read column removed (if existed)")
            
            # Add used_at column
            print("Adding used_at column...")
            cursor.execute("""
                ALTER TABLE otp_notifications 
                ADD COLUMN IF NOT EXISTS used_at TIMESTAMP;
            """)
            print("[OK] used_at column added")
            
            # Clean up old records with null user_id
            print("\nCleaning up old records...")
            cursor.execute("DELETE FROM otp_notifications WHERE user_id IS NULL;")
            deleted = cursor.rowcount
            print(f"[OK] Deleted {deleted} old records with null user_id")
            
            print("\n[OK] OTP table schema updated successfully!")
            
        except Exception as e:
            print(f"\n[FAIL] Error updating schema: {str(e)}")
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    update_schema()
