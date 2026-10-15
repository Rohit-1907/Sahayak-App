"""
Add test jobs for September 2026 to test calendar functionality
Run this: python manage.py shell < add_september_jobs.py
"""

import os
import django
from datetime import date, time

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sahayak_backend.settings')
django.setup()

from authentication.models import SahayakUser
from users.models import WorkerProfile
from jobs.models import WorkRequest, ServiceCategory

# Get or create Cook service category
cook_category, _ = ServiceCategory.objects.get_or_create(
    name='Cook',
    defaults={
        'description': 'Professional cooking services',
        'is_active': True
    }
)

# Get worker (Sam)
try:
    worker_user = SahayakUser.objects.get(email='sam@gmail.com')
    worker_profile = WorkerProfile.objects.get(user=worker_user)
except:
    print("Worker sam@gmail.com not found!")
    exit()

# Get client (Siya)
try:
    client_user = SahayakUser.objects.get(email='siya@gmail.com')
except:
    print("Client siya@gmail.com not found!")
    exit()

# Create multiple jobs for September 2026
jobs_data = [
    {
        'title': 'Breakfast Cooking',
        'date': date(2026, 9, 2),
        'time': time(8, 0),
        'budget': 300,
        'address': 'Koregaon Park, Pune'
    },
    {
        'title': 'Lunch Preparation',
        'date': date(2026, 9, 5),
        'time': time(12, 0),
        'budget': 400,
        'address': 'Hinjewadi, Pune'
    },
    {
        'title': 'Dinner Cooking',
        'date': date(2026, 9, 8),
        'time': time(19, 0),
        'budget': 500,
        'address': 'Baner, Pune'
    },
    {
        'title': 'Party Catering',
        'date': date(2026, 9, 12),
        'time': time(18, 0),
        'budget': 1500,
        'address': 'Viman Nagar, Pune'
    },
    {
        'title': 'Weekly Meal Prep',
        'date': date(2026, 9, 15),
        'time': time(10, 0),
        'budget': 800,
        'address': 'Kharadi, Pune'
    },
]

created_count = 0
for job_data in jobs_data:
    work_request = WorkRequest.objects.create(
        client=client_user,
        worker=worker_profile,
        service_category=cook_category,
        title=job_data['title'],
        description=f"Need professional cook for {job_data['title'].lower()}",
        required_date=job_data['date'],
        required_time=job_data['time'],
        estimated_budget=job_data['budget'],
        work_address=job_data['address'],
        work_latitude=18.5204,
        work_longitude=73.8567,
        status='SCHEDULED'
    )
    created_count += 1
    print(f"[OK] Created: {job_data['title']} on {job_data['date']}")

print(f"\n[DONE] Successfully created {created_count} jobs for September 2026!")
