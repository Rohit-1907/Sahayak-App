"""
Populate ServiceCategory table with basic services for testing.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sahayak_backend.settings')
django.setup()

from services.models import ServiceCategory

# Basic services as per requirements
services_data = [
    {
        'name': 'Construction',
        'description': 'General construction work including building, renovation, and repair',
        'icon_url': 'https://example.com/icons/construction.png',
        'is_active': True
    },
    {
        'name': 'Mason',
        'description': 'Masonry work including bricklaying, stone work, and concrete work',
        'icon_url': 'https://example.com/icons/mason.png',
        'is_active': True
    },
    {
        'name': 'Electrician',
        'description': 'Electrical work including wiring, installation, and repair',
        'icon_url': 'https://example.com/icons/electrician.png',
        'is_active': True
    },
    {
        'name': 'Plumber',
        'description': 'Plumbing services including pipe fitting, leak repair, and installation',
        'icon_url': 'https://example.com/icons/plumber.png',
        'is_active': True
    },
    {
        'name': 'Carpenter',
        'description': 'Woodwork, furniture making, and repair',
        'icon_url': 'https://example.com/icons/carpenter.png',
        'is_active': True
    },
    {
        'name': 'Painter',
        'description': 'Interior and exterior painting services',
        'icon_url': 'https://example.com/icons/painter.png',
        'is_active': True
    },
    {
        'name': 'Cleaner',
        'description': 'Residential and commercial cleaning services',
        'icon_url': 'https://example.com/icons/cleaner.png',
        'is_active': True
    },
    {
        'name': 'AC Technician',
        'description': 'Air conditioning installation, repair, and maintenance',
        'icon_url': 'https://example.com/icons/ac-technician.png',
        'is_active': True
    },
    {
        'name': 'Mechanic',
        'description': 'Vehicle and machinery repair and maintenance',
        'icon_url': 'https://example.com/icons/mechanic.png',
        'is_active': True
    },
    {
        'name': 'Cook',
        'description': 'Professional cooking services for homes and events',
        'icon_url': 'https://example.com/icons/cook.png',
        'is_active': True
    },
    {
        'name': 'Gardener',
        'description': 'Garden maintenance, landscaping, and plant care',
        'icon_url': 'https://example.com/icons/gardener.png',
        'is_active': True
    },
    {
        'name': 'Tile Worker',
        'description': 'Tile installation and repair for floors and walls',
        'icon_url': 'https://example.com/icons/tile-worker.png',
        'is_active': True
    },
    {
        'name': 'Welder',
        'description': 'Metal welding and fabrication services',
        'icon_url': 'https://example.com/icons/welder.png',
        'is_active': True
    },
    {
        'name': 'Maintenance Worker',
        'description': 'General maintenance and repair work',
        'icon_url': 'https://example.com/icons/maintenance.png',
        'is_active': True
    },
    {
        'name': 'Driver',
        'description': 'Professional driving services',
        'icon_url': 'https://example.com/icons/driver.png',
        'is_active': True
    },
    {
        'name': 'Loader',
        'description': 'Loading and unloading services for goods and materials',
        'icon_url': 'https://example.com/icons/loader.png',
        'is_active': True
    },
    {
        'name': 'Pest Control',
        'description': 'Pest control and fumigation services',
        'icon_url': 'https://example.com/icons/pest-control.png',
        'is_active': True
    },
    {
        'name': 'Security Guard',
        'description': 'Security and guard services',
        'icon_url': 'https://example.com/icons/security.png',
        'is_active': True
    },
    {
        'name': 'Farm Worker',
        'description': 'Agricultural and farm labor services',
        'icon_url': 'https://example.com/icons/farm-worker.png',
        'is_active': True
    },
    {
        'name': 'Packer',
        'description': 'Packing services for moving and shipping',
        'icon_url': 'https://example.com/icons/packer.png',
        'is_active': True
    },
    {
        'name': 'Laundry Worker',
        'description': 'Laundry and dry cleaning services',
        'icon_url': 'https://example.com/icons/laundry.png',
        'is_active': True
    },
]

def populate_services():
    """Populate or update service categories."""
    print("Populating ServiceCategory table...")
    
    created_count = 0
    updated_count = 0
    
    for service_data in services_data:
        service, created = ServiceCategory.objects.get_or_create(
            name=service_data['name'],
            defaults={
                'description': service_data['description'],
                'icon_url': service_data['icon_url'],
                'is_active': service_data['is_active']
            }
        )
        
        if created:
            created_count += 1
            print(f"[OK] Created: {service.name}")
        else:
            # Update existing service
            service.description = service_data['description']
            service.icon_url = service_data['icon_url']
            service.is_active = service_data['is_active']
            service.save()
            updated_count += 1
            print(f"• Updated: {service.name}")
    
    print(f"\nSummary:")
    print(f"  Created: {created_count}")
    print(f"  Updated: {updated_count}")
    print(f"  Total services: {ServiceCategory.objects.count()}")

if __name__ == '__main__':
    populate_services()
