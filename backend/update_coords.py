from organization.models import OrgWorkRequest
from decimal import Decimal

# Update BOYS HOSTEL location with coordinates
OrgWorkRequest.objects.filter(work_location__icontains='BOYS HOSTEL').update(
    work_latitude=Decimal('18.5368048'),
    work_longitude=Decimal('73.8319807')
)
print('Updated coordinates for BOYS HOSTEL work requests')
