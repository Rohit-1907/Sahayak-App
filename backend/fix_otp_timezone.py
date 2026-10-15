"""
Fix OTP notifications table to use timezone-aware timestamps
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sahayak_backend.settings')
django.setup()

from django.db import connection

def fix_timezone():
    """Update expires_at column to use TIMESTAMPTZ"""
    print("=== Fixing OTP Timezone Issue ===\n")
    
    with connection.cursor() as cursor:
        try:
            # Check current column type
            cursor.execute("""
                SELECT data_type 
                FROM information_schema.columns 
                WHERE table_name = 'otp_notifications' 
                AND column_name = 'expires_at'
            """)
            
            result = cursor.fetchone()
            current_type = result[0] if result else 'unknown'
            print(f"Current expires_at type: {current_type}")
            
            if current_type == 'timestamp without time zone':
                print("\n[WARN] Column is timezone-naive, converting to timezone-aware...")
                
                # Convert to TIMESTAMPTZ
                cursor.execute("""
                    ALTER TABLE otp_notifications 
                    ALTER COLUMN expires_at TYPE TIMESTAMPTZ 
                    USING expires_at AT TIME ZONE 'UTC'
                """)
                
                print("[OK] expires_at converted to TIMESTAMPTZ")
            else:
                print("[OK] Column already timezone-aware")
            
            # Also fix created_at if needed
            cursor.execute("""
                SELECT data_type 
                FROM information_schema.columns 
                WHERE table_name = 'otp_notifications' 
                AND column_name = 'created_at'
            """)
            
            result = cursor.fetchone()
            current_type = result[0] if result else 'unknown'
            
            if current_type == 'timestamp without time zone':
                print("\nConverting created_at to TIMESTAMPTZ...")
                cursor.execute("""
                    ALTER TABLE otp_notifications 
                    ALTER COLUMN created_at TYPE TIMESTAMPTZ 
                    USING created_at AT TIME ZONE 'UTC'
                """)
                print("[OK] created_at converted to TIMESTAMPTZ")
            
            # Delete old OTPs to start fresh
            cursor.execute("DELETE FROM otp_notifications WHERE is_used = FALSE")
            deleted = cursor.rowcount
            print(f"\n[DEL] Deleted {deleted} old unused OTPs")
            
            print("\n[OK] Timezone fix complete!")
            
        except Exception as e:
            print(f"\n[FAIL] Error: {str(e)}")
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    fix_timezone()
