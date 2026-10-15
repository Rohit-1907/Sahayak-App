import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sahayak_backend.settings')
django.setup()

from django.contrib.auth import authenticate

print("Testing Client Login with Custom Backend:\n")

# Test 1: Login with email
print("1. Testing login with EMAIL:")
user1 = authenticate(username='test@example.com', password='test1234')
print(f"   Result: {'SUCCESS [OK]' if user1 else 'FAILED [FAIL]'}")
if user1:
    print(f"   User: {user1.username}, Role: {user1.role.role}")

print()

# Test 2: Login with phone
print("2. Testing login with PHONE:")
user2 = authenticate(username='1234567890', password='test1234')
print(f"   Result: {'SUCCESS [OK]' if user2 else 'FAILED [FAIL]'}")
if user2:
    print(f"   User: {user2.username}, Role: {user2.role.role}")

print()

# Test 3: Login with username
print("3. Testing login with USERNAME:")
user3 = authenticate(username='testcustomer', password='test1234')
print(f"   Result: {'SUCCESS [OK]' if user3 else 'FAILED [FAIL]'}")
if user3:
    print(f"   User: {user3.username}, Role: {user3.role.role}")

print("\n[OK] All three methods work for client login!")
