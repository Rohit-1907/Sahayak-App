"""
Quick test script to verify the worker performance endpoint logic.
Run this to see if there are any errors before testing via API.
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sahayak_backend.settings')
django.setup()

from organization.models import OrgWorker, OrgWorkAssignment
from organization.serializers import OrgWorkAssignmentSerializer, OrgWorkerStatsSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

def test_worker_performance(worker_id):
    """Test the performance endpoint logic"""
    print(f"\n{'='*60}")
    print(f"Testing Worker Performance for ID: {worker_id}")
    print(f"{'='*60}\n")
    
    try:
        # Get worker
        worker = OrgWorker.objects.get(id=worker_id)
        print(f"[OK] Worker found: {worker.get_full_name()}")
        print(f"   Phone: {worker.phone_number}")
        print(f"   Email: {worker.email}")
        print(f"   Org: {worker.org.org_id}")
        print(f"   Org Admin: {worker.org.admin_user}")
        
        # Get assignments
        assignments = OrgWorkAssignment.objects.filter(org_worker=worker)
        print(f"\n[OK] Found {assignments.count()} assignments")
        
        # Build stats
        stats = {
            'worker_id': worker.id,
            'worker_name': worker.get_full_name(),
            'worker_phone': worker.phone_number,
            'worker_email': worker.email,
            'total_assigned': assignments.count(),
            'in_progress': assignments.filter(status='in_progress').count(),
            'completed': assignments.filter(status='completed').count(),
            'pending': assignments.filter(status='assigned').count(),
            'assignments': assignments.order_by('-assigned_at')  # Pass QuerySet, not .data
        }
        
        print(f"\n[STATS] Stats before serialization:")
        print(f"   Total Assigned: {stats['total_assigned']}")
        print(f"   In Progress: {stats['in_progress']}")
        print(f"   Completed: {stats['completed']}")
        print(f"   Pending: {stats['pending']}")
        print(f"   Assignments: {len(stats['assignments'])} items")
        
        # Serialize
        serializer = OrgWorkerStatsSerializer(stats)
        print(f"\n[OK] Serialization successful!")
        print(f"\n[STATS] Final serialized data:")
        print(serializer.data)
        
        return True
        
    except OrgWorker.DoesNotExist:
        print(f"[FAIL] Worker with ID {worker_id} not found")
        return False
        
    except Exception as e:
        print(f"[FAIL] Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    # Test with worker ID 3 (Son Mon)
    success = test_worker_performance(3)
    
    if success:
        print(f"\n{'='*60}")
        print("[OK] TEST PASSED - Endpoint logic works correctly!")
        print("='*60}\n")
    else:
        print(f"\n{'='*60}")
        print("[FAIL] TEST FAILED - Check errors above")
        print(f"{'='*60}\n")
