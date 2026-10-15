import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sahayak_backend.settings')
django.setup()

from authentication.models import SahayakUser

user = SahayakUser.objects.filter(phone_number='8446597587').first()
if user:
    print(f'Email: {user.email}')
    print(f'Username: {user.username}')
    print(f'Password check sita123456: {user.check_password("sita123456")}')
    print(f'Password check 12345678: {user.check_password("12345678")}')
else:
    print('User not found')
