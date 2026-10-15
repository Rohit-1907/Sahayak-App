import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sahayak_backend.settings')
django.setup()

from organization.models import Organisation
from users.models import OrganizationProfile

print('=== CHECKING CONSTRUCTION ORGANIZATIONS ===')
print('Total Organisations:', Organisation.objects.count())
print('Total OrganizationProfiles:', OrganizationProfile.objects.count())
print('')

print('Checking Construction organizations:')
profiles = OrganizationProfile.objects.filter(industry_type__iexact='Construction')
print(f'Found {profiles.count()} profiles with Construction type')
print('')

for p in profiles:
    print(f'Profile: {p.company_name}')
    print(f'  Admin Email: {p.user.email}')
    print(f'  Industry Type: {p.industry_type}')
    print(f'  City: {p.city}')
    
    org = Organisation.objects.filter(admin_user=p.user).first()
    if org:
        print(f'  [OK] Has Organisation entry: {org.org_id}')
        print(f'     Org Name: {org.org_name}')
        print(f'     Workers: {org.org_workers.count()}')
    else:
        print(f'  [FAIL] NO Organisation entry found!')
    print('')

print('\nAll Organisations in database:')
for org in Organisation.objects.all():
    print(f'  - {org.org_name} (ID: {org.org_id}, Admin: {org.admin_user.email})')
