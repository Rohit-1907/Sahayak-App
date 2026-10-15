import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sahayak_backend.settings')
django.setup()

from jobs.models import ServicePricing
from users.models import WorkerProfile

print("=" * 70)
print("CHECKING PRICING DATA")
print("=" * 70)

# Check total records
total = ServicePricing.objects.count()
print(f"\n[OK] Total pricing records: {total}")

# Check Pune Cook pricing
pune_cook = ServicePricing.objects.filter(city='Pune', service_category='Cook').first()
if pune_cook:
    print(f"\n[OK] Pune - Cook pricing:")
    print(f"  Base Price: Rs. {pune_cook.base_price}")
    print(f"  Platform Fee: Rs. {pune_cook.platform_fee}")
    print(f"  State: {pune_cook.state}")
    print(f"  Active: {pune_cook.is_active}")
else:
    print("\n[FAIL] Pune - Cook pricing NOT FOUND")

# Check if any workers exist
worker = WorkerProfile.objects.first()
if worker:
    print(f"\n[OK] Sample Worker:")
    print(f"  ID: {worker.id}")
    print(f"  Name: {worker.user.get_full_name()}")
    print(f"  Service: {worker.service_categories}")
    print(f"  Visit Charge: Rs. {worker.hourly_rate}")
else:
    print("\n[FAIL] No workers found")

# Check various cities
print(f"\n[OK] Pricing by city:")
for city in ['Pune', 'Mumbai', 'Delhi', 'Bangalore']:
    count = ServicePricing.objects.filter(city=city).count()
    print(f"  {city}: {count} services")

print("\n" + "=" * 70)
