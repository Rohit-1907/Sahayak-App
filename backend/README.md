# SAHAYAK Backend - API Server

Multilingual Voice-Assisted Job Connection Platform for Blue-Collar Services - Shared Backend API

## Project Structure

```
backend/
├── sahayak_backend/          # Main Django project settings
│   ├── settings.py          # Django configuration
│   ├── urls.py              # API route configuration
│   └── wsgi.py              # WSGI application
├── authentication/           # User auth & registration
├── users/                    # User profiles (Customer, Worker, Organization)
├── services/                 # Service categories management
├── jobs/                     # Job requests & bookings
├── payments/                 # Payment transactions
├── notifications/            # Push notifications
├── recommendations/          # AI-based recommendations
├── analytics/                # Platform analytics
├── organization/             # Organization management
├── requirements.txt          # Python dependencies
└── manage.py                # Django management CLI
```

## Setup Instructions

### Prerequisites
- Python 3.9+
- PostgreSQL 12+
- Redis (optional, for caching)
- pip or conda

### 1. Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Configuration

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- Database credentials (Supabase PostgreSQL)
- Secret key for production
- API keys (Razorpay, OpenAI, Google Maps, etc.)
- Email credentials
- Redis URL (if using caching)

### 4. Database Setup

```bash
# Run migrations
python manage.py migrate

# Create superuser for admin
python manage.py createsuperuser

# (Optional) Load initial data
python manage.py loaddata fixtures/initial_data.json
```

### 5. Create Initial Data

```bash
# Create user roles
python manage.py shell
>>> from authentication.models import UserRole
>>> UserRole.objects.create(role='customer', description='Customer user')
>>> UserRole.objects.create(role='worker', description='Service worker')
>>> UserRole.objects.create(role='organization', description='Organization/Company')
>>> UserRole.objects.create(role='admin', description='Platform administrator')
>>> exit()
```

### 6. Run Development Server

```bash
python manage.py runserver 0.0.0.0:8000
```

Server will be available at: `http://localhost:8000`

## API Documentation

### API Endpoints

#### Authentication
- `POST /api/v1/auth/register/register/` - Register new user
- `POST /api/v1/auth/otp/request_otp/` - Request OTP
- `POST /api/v1/auth/otp/verify_otp/` - Verify OTP and activate account
- `POST /api/v1/auth/token/` - Obtain JWT token
- `POST /api/v1/auth/token/refresh/` - Refresh JWT token
- `GET /api/v1/auth/profile/me/` - Get current user profile
- `PUT /api/v1/auth/profile/update_profile/` - Update profile
- `POST /api/v1/auth/profile/change_password/` - Change password

#### User Profiles
- `GET /api/v1/users/customers/my_profile/` - Get customer profile
- `PUT /api/v1/users/customers/my_profile/` - Update customer profile
- `GET /api/v1/users/workers/` - List all workers
- `GET /api/v1/users/workers/my_profile/` - Get worker profile
- `GET /api/v1/users/workers/search/` - Search workers by category, location, etc.
- `PUT /api/v1/users/workers/my_profile/` - Update worker profile
- `GET /api/v1/users/organizations/my_profile/` - Get organization profile
- `PUT /api/v1/users/organizations/my_profile/` - Update organization profile

#### Services
- `GET /api/v1/services/categories/` - List all service categories

#### Jobs & Bookings
- `GET /api/v1/jobs/requests/` - List job requests
- `POST /api/v1/jobs/requests/` - Create new job request
- `GET /api/v1/jobs/bookings/` - List bookings
- `POST /api/v1/jobs/bookings/` - Create booking
- `PUT /api/v1/jobs/bookings/{id}/` - Update booking status

#### Payments
- `GET /api/v1/payments/` - List payments
- `POST /api/v1/payments/` - Create payment transaction
- `GET /api/v1/payments/{id}/` - Get payment details

#### Notifications
- `GET /api/v1/notifications/` - List user notifications
- `PUT /api/v1/notifications/{id}/` - Mark as read

#### Recommendations
- `GET /api/v1/recommendations/workers/` - Get AI-recommended workers

#### Organization
- `GET /api/v1/organizations/` - List organizations
- `GET /api/v1/organizations/my_profile/` - Get organization profile

#### Analytics
- `GET /api/v1/analytics/` - Get platform analytics

### API Documentation UI

- Swagger UI: `http://localhost:8000/api/docs/`
- ReDoc: (available via Swagger UI)
- Schema: `http://localhost:8000/api/schema/`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. Register user: `POST /api/v1/auth/register/`
2. Request OTP: `POST /api/v1/auth/otp/request_otp/`
3. Verify OTP: `POST /api/v1/auth/otp/verify_otp/`
4. Obtain token: `POST /api/v1/auth/token/`
5. Include token in headers: `Authorization: Bearer <token>`

### Example Request

```bash
# Get current user profile
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/auth/profile/me/
```

## Deployment

### Using Gunicorn

```bash
pip install gunicorn
gunicorn sahayak_backend.wsgi -w 4 -b 0.0.0.0:8000
```

### Using Docker

(Docker configuration coming soon)

### Production Checklist

- [ ] Set `DEBUG = False` in settings
- [ ] Update `SECRET_KEY` with secure random value
- [ ] Set `ALLOWED_HOSTS` to your domain
- [ ] Use PostgreSQL in production
- [ ] Configure SSL/HTTPS
- [ ] Set up error tracking (Sentry)
- [ ] Enable monitoring and logging
- [ ] Configure CORS appropriately
- [ ] Set up automated backups

## Testing

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test authentication

# Run with coverage
pip install coverage
coverage run --source='.' manage.py test
coverage report
```

## Database Models

### Core Models

#### SahayakUser
Extended Django User model with phone number, role, and verification status.

#### UserRole
Defines user types: Customer, Worker, Organization, Admin

#### CustomerProfile
Customer-specific information: address, preferences, booking history

#### WorkerProfile
Worker-specific information: skills, experience, ratings, availability, earnings

#### OrganizationProfile
Organization-specific information: company details, worker management

#### ServiceCategory
Available service types: Plumbing, Electrical, Carpentry, etc.

#### JobRequest
Service requests posted by customers with location and budget

#### JobBooking
Booking of worker for a specific job request

#### Payment
Payment transaction records with Razorpay integration

#### Notification
User notifications for jobs, updates, announcements

### External Integration Models

- **Authentication**: Supabase Auth (Phone OTP)
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Realtime
- **Payments**: Razorpay
- **Voice Services**: OpenAI Whisper (STT), Expo Speech (TTS)
- **Translation**: IndicTrans2 (AI4Bharat)
- **Maps**: Google Maps API
- **Notifications**: Firebase Cloud Messaging

## Common Issues & Solutions

### Database Connection Error
```bash
# Check PostgreSQL is running
# Verify DATABASE_URL in .env
# Run migrations
python manage.py migrate
```

### Module Not Found
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

### Port Already in Use
```bash
# Use different port
python manage.py runserver 0.0.0.0:8001
```

## Development Workflow

1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and test: `python manage.py test`
3. Commit changes: `git commit -am "Add new feature"`
4. Push to remote: `git push origin feature/new-feature`
5. Create pull request for code review

## API Response Format

All API responses follow this format:

### Success Response
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "value"
  },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "status": "error",
  "error": "error_code",
  "message": "Detailed error message",
  "details": {}
}
```

## Rate Limiting

API rate limits (to be configured):
- Unauthenticated: 100 requests/hour
- Authenticated: 1000 requests/hour
- Admin: Unlimited

## Support & Documentation

- GitHub Issues: Report bugs here
- Documentation: Check `/docs` folder
- Wiki: Project guidelines and best practices

## License

This project is part of Government Polytechnic, Pune Capstone Project

## Team

- Hansini Jadhav - 2406074
- Rohit Jadhav - 2406075
- Sayee Kashid - 2406099
- Shreya Kikale - 2406109
