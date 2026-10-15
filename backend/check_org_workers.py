import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sahayak_backend.settings')
django.setup()

from organization.models import Organisation, OrgWorker

org_id = 'ORG-a4f8269f-9803-433f-b519-7bda4537a3fa'
org = Organisation.objects.filter(org_id=org_id).first()

print('=== WORKERS IN ORGANIZATION ===')
print(f'Organization: {org.org_name}')
print(f'Service Type: Construction')
print('')

for w in org.org_workers.all():
    print(f'Worker {w.id}:')
    print(f'  Name: {w.get_full_name()}')
    print(f'  Username: {w.username}')
    print(f'  Password: {w.plain_password_display}')
    print(f'  Phone: {w.phone_number}')
    print(f'  Email: {w.email}')
    print(f'  Experience: {w.experience}')
    print('')
