import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sahayak_backend.settings')
django.setup()

from organization.models import OrgWorker

print("=" * 60)
print("ORGANIZATION WORKERS - LOGIN CREDENTIALS")
print("=" * 60)

workers = OrgWorker.objects.all()

if workers.count() == 0:
    print("\nNo organization workers found.")
else:
    for worker in workers:
        print(f"\nWorker: {worker.get_full_name()}")
        print(f"Username (Phone): {worker.phone_number}")
        print(f"Email: {worker.email or 'N/A'}")
        print(f"Password: {worker.plain_password_display}")
        print(f"Organization: {worker.org.org_name if worker.org else 'N/A'}")
        print(f"Org ID: {worker.org.org_id if worker.org else 'N/A'}")
        print("-" * 60)

print(f"\nTotal Workers: {workers.count()}")
print("\nUse these credentials in the Organization Login screen!")

