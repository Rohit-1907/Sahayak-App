import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sahayak_backend.settings')
django.setup()

from users.models import WorkerProfile
from jobs.models import ServicePricing
import requests
import json

print("=" * 70)
print("TESTING PRICING API")
print("=" * 70)

# Get worker
worker = WorkerProfile.objects.first()
print(f"\nWorker: {worker.user.get_full_name()}")
print(f"Worker ID: {worker.id}")
print(f"Visit Charge: Rs. {worker.hourly_rate}")

# Get pricing
pricing = ServicePricing.objects.filter(city='Pune', service_category='Cook').first()
print(f"\nPune Cook Base Price: Rs. {pricing.base_price}")
print(f"Platform Fee: Rs. {pricing.platform_fee}")

# Calculate expected total
expected_total = float(pricing.base_price) + float(worker.hourly_rate) + float(pricing.platform_fee)
print(f"\nExpected Total: Rs. {expected_total}")
print(f"  = Rs. {pricing.base_price} (base) + Rs. {worker.hourly_rate} (visit) + Rs. {pricing.platform_fee} (platform)")

# Now test API with requests
print("\n" + "=" * 70)
print("CALLING API ENDPOINT")
print("=" * 70)

# First login to get token
login_url = "http://10.119.99.150:8000/api/v1/auth/login/"
login_data = {
    "username": "siya@gmail.com",
    "password": "12345678",
    "app_type": "client"
}

print(f"\n1. Logging in as siya@gmail.com...")
try:
    login_response = requests.post(login_url, json=login_data)
    print(f"   Status: {login_response.status_code}")
    
    if login_response.status_code == 200:
        login_result = login_response.json()
        token = login_result.get('access')
        print(f"   [OK] Token obtained: {token[:30]}...")
        
        # Now call pricing API
        pricing_url = "http://10.119.99.150:8000/api/v1/jobs/calculate-price/"
        pricing_data = {
            "service_category": "Cook",
            "city": "Pune",
            "worker_id": str(worker.id)
        }
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        print(f"\n2. Calling pricing API...")
        print(f"   URL: {pricing_url}")
        print(f"   Data: {json.dumps(pricing_data, indent=4)}")
        
        pricing_response = requests.post(pricing_url, json=pricing_data, headers=headers)
        print(f"   Status: {pricing_response.status_code}")
        print(f"\n3. Response:")
        print(json.dumps(pricing_response.json(), indent=2))
        
    else:
        print(f"   [FAIL] Login failed: {login_response.text}")
        
except Exception as e:
    print(f"   [FAIL] Error: {e}")

print("\n" + "=" * 70)
