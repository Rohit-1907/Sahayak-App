"""
Populate ServicePricing table with base prices for 50+ cities and 21 services.
Total records: 21 services × 52 cities = 1092 pricing entries
"""
import os
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sahayak_backend.settings')
django.setup()

from jobs.models import ServicePricing

# Service categories
SERVICES = [
    'Construction', 'Mason', 'Electrician', 'Plumber', 'Carpenter', 
    'Painter', 'Cleaner', 'AC Technician', 'Mechanic', 'Cook', 
    'Gardener', 'Tile Worker', 'Welder', 'Maintenance Worker', 
    'Driver', 'Loader', 'Pest Control', 'Security Guard', 
    'Farm Worker', 'Packer', 'Laundry Worker'
]

# Skill-based multipliers
HIGH_SKILL = ['Electrician', 'Plumber', 'AC Technician', 'Mechanic', 'Welder']
MEDIUM_SKILL = ['Carpenter', 'Painter', 'Mason', 'Tile Worker', 'Pest Control']
# Rest are STANDARD_SKILL

# City data: (city, state, tier, base_price_range)
CITIES_DATA = [
    # TIER 1 - Metro Cities
    ('Mumbai', 'Maharashtra', 1, (400, 600)),
    ('Delhi', 'Delhi', 1, (400, 600)),
    ('Bangalore', 'Karnataka', 1, (400, 600)),
    ('Hyderabad', 'Telangana', 1, (400, 600)),
    ('Chennai', 'Tamil Nadu', 1, (400, 600)),
    ('Kolkata', 'West Bengal', 1, (350, 550)),
    ('Pune', 'Maharashtra', 1, (350, 550)),
    ('Ahmedabad', 'Gujarat', 1, (350, 550)),
    
    # TIER 2 - Major Cities
    ('Surat', 'Gujarat', 2, (300, 500)),
    ('Jaipur', 'Rajasthan', 2, (300, 500)),
    ('Lucknow', 'Uttar Pradesh', 2, (300, 500)),
    ('Kanpur', 'Uttar Pradesh', 2, (280, 480)),
    ('Nagpur', 'Maharashtra', 2, (280, 480)),
    ('Indore', 'Madhya Pradesh', 2, (280, 480)),
    ('Thane', 'Maharashtra', 2, (320, 520)),
    ('Bhopal', 'Madhya Pradesh', 2, (280, 480)),
    ('Visakhapatnam', 'Andhra Pradesh', 2, (280, 480)),
    ('Pimpri-Chinchwad', 'Maharashtra', 2, (300, 500)),
    ('Patna', 'Bihar', 2, (250, 450)),
    ('Vadodara', 'Gujarat', 2, (280, 480)),
    ('Ghaziabad', 'Uttar Pradesh', 2, (280, 480)),
    ('Ludhiana', 'Punjab', 2, (280, 480)),
    ('Agra', 'Uttar Pradesh', 2, (260, 460)),
    ('Nashik', 'Maharashtra', 2, (280, 480)),
    ('Faridabad', 'Haryana', 2, (280, 480)),
    ('Meerut', 'Uttar Pradesh', 2, (260, 460)),
    ('Rajkot', 'Gujarat', 2, (280, 480)),
    ('Varanasi', 'Uttar Pradesh', 2, (260, 460)),
    
    # TIER 3 - Medium Cities
    ('Amritsar', 'Punjab', 3, (250, 400)),
    ('Allahabad', 'Uttar Pradesh', 3, (240, 390)),
    ('Ranchi', 'Jharkhand', 3, (240, 390)),
    ('Howrah', 'West Bengal', 3, (250, 400)),
    ('Coimbatore', 'Tamil Nadu', 3, (250, 400)),
    ('Jabalpur', 'Madhya Pradesh', 3, (230, 380)),
    ('Gwalior', 'Madhya Pradesh', 3, (230, 380)),
    ('Vijayawada', 'Andhra Pradesh', 3, (240, 390)),
    ('Jodhpur', 'Rajasthan', 3, (240, 390)),
    ('Madurai', 'Tamil Nadu', 3, (240, 390)),
    ('Raipur', 'Chhattisgarh', 3, (230, 380)),
    ('Kota', 'Rajasthan', 3, (230, 380)),
    ('Chandigarh', 'Chandigarh', 3, (280, 450)),
    ('Guwahati', 'Assam', 3, (240, 390)),
    ('Solapur', 'Maharashtra', 3, (230, 380)),
    ('Aurangabad', 'Maharashtra', 3, (240, 390)),
    ('Dhanbad', 'Jharkhand', 3, (220, 370)),
    ('Amravati', 'Maharashtra', 3, (230, 380)),
    ('Navi Mumbai', 'Maharashtra', 3, (320, 500)),
    ('Kalyan-Dombivli', 'Maharashtra', 3, (280, 450)),
    
    # TIER 4 - Small Cities
    ('Vasai-Virar', 'Maharashtra', 4, (220, 370)),
    ('Bhiwandi', 'Maharashtra', 4, (210, 360)),
    ('Kolhapur', 'Maharashtra', 4, (220, 370)),
    ('Akola', 'Maharashtra', 4, (200, 350)),
    ('Latur', 'Maharashtra', 4, (200, 350)),
    ('Ahmednagar', 'Maharashtra', 4, (210, 360)),
    ('Jalgaon', 'Maharashtra', 4, (200, 350)),
    ('Nanded', 'Maharashtra', 4, (200, 350)),
    ('Sangli', 'Maharashtra', 4, (210, 360)),
    ('Satara', 'Maharashtra', 4, (200, 350)),
    ('Parbhani', 'Maharashtra', 4, (190, 340)),
    ('Ichalkaranji', 'Maharashtra', 4, (200, 350)),
]

def get_service_multiplier(service):
    """Get price multiplier based on skill level"""
    if service in HIGH_SKILL:
        return 1.5
    elif service in MEDIUM_SKILL:
        return 1.2
    else:
        return 1.0

def calculate_base_price(city_base_min, city_base_max, service):
    """Calculate base price for service in city"""
    multiplier = get_service_multiplier(service)
    
    # Get mid-point of city range
    city_mid = (city_base_min + city_base_max) / 2
    
    # Apply skill multiplier
    base = city_mid * multiplier
    
    # Round to nearest 50
    return round(base / 50) * 50

def populate_pricing():
    """Populate pricing data"""
    print("=" * 70)
    print("POPULATING SERVICE PRICING DATA")
    print("=" * 70)
    
    created_count = 0
    updated_count = 0
    
    for city, state, tier, (base_min, base_max) in CITIES_DATA:
        print(f"\n[LOC] Processing {city}, {state} (Tier {tier})...")
        
        for service in SERVICES:
            base_price = calculate_base_price(base_min, base_max, service)
            
            pricing, created = ServicePricing.objects.get_or_create(
                service_category=service,
                city=city,
                defaults={
                    'state': state,
                    'base_price': Decimal(str(base_price)),
                    'platform_fee': Decimal('50.00'),
                    'is_active': True
                }
            )
            
            if created:
                created_count += 1
                print(f"   [OK] {service}: Rs. {base_price}")
            else:
                # Update existing
                pricing.state = state
                pricing.base_price = Decimal(str(base_price))
                pricing.platform_fee = Decimal('50.00')
                pricing.save()
                updated_count += 1
    
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"[OK] Cities processed: {len(CITIES_DATA)}")
    print(f"[OK] Services: {len(SERVICES)}")
    print(f"[OK] Created: {created_count} pricing entries")
    print(f"[OK] Updated: {updated_count} pricing entries")
    print(f"[OK] Total in DB: {ServicePricing.objects.count()}")
    print("=" * 70)

if __name__ == '__main__':
    populate_pricing()
