# SAHAYAK Project Structure

## Overview

SAHAYAK is a multilingual voice-assisted job connection platform for blue-collar services. The project follows a modular architecture with separate client and worker frontends connected through a shared backend.

```
CAPSTONE
  ├── CLIENT (Customer Mobile App)
  ├── WORKER (Service Worker Mobile App)
  ├── BACKEND (Shared API Server)
  └── Documentation
```

## Directory Structure

```
d:\capstone\
├── client/
│   └── frontend/
│       ├── app.json                    # Expo config (SDK 57)
│       ├── package.json                # Dependencies (updated)
│       ├── App.js                      # Main entry
│       ├── index.js                    # Index file
│       ├── screens/                    # React components
│       ├── assets/                     # Icons, images, splash
│       ├── android/                    # Android build files
│       ├── .expo/                      # Expo cache
│       └── node_modules/               # Dependencies
│
├── worker/
│   └── frontend/
│       ├── app.json                    # Expo config (SDK 57)
│       ├── package.json                # Dependencies (updated)
│       ├── App.js                      # Main entry
│       ├── screen/                     # React components
│       ├── android/                    # Android build files
│       ├── .expo/                      # Expo cache
│       └── node_modules/               # Dependencies
│
├── backend/                            # NEW: Shared Backend
│   ├── sahayak_backend/               # Django project config
│   │   ├── __init__.py
│   │   ├── settings.py                # Django settings
│   │   ├── urls.py                    # URL routing
│   │   └── wsgi.py                    # WSGI app
│   │
│   ├── authentication/                # Auth & registration
│   │   ├── models.py                  # User, OTP, DeviceToken
│   │   ├── views.py                   # Auth endpoints
│   │   ├── serializers.py             # Data validation
│   │   ├── urls.py                    # Auth routes
│   │   └── admin.py                   # Admin interface
│   │
│   ├── users/                         # User profiles
│   │   ├── models.py                  # CustomerProfile, WorkerProfile, OrganizationProfile
│   │   ├── views.py                   # Profile endpoints
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── admin.py
│   │
│   ├── services/                      # Service categories
│   │   ├── models.py                  # ServiceCategory, ServiceSubcategory
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── admin.py
│   │
│   ├── jobs/                          # Job management
│   │   ├── models.py                  # JobRequest, JobBooking, JobStatus
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── admin.py
│   │
│   ├── payments/                      # Payment handling
│   │   ├── models.py                  # Payment transactions
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── admin.py
│   │
│   ├── notifications/                 # Push notifications
│   │   ├── models.py                  # Notification
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── admin.py
│   │
│   ├── recommendations/               # AI recommendations
│   │   ├── models.py                  # WorkerRecommendation
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── admin.py
│   │
│   ├── analytics/                     # Analytics & reports
│   │   ├── models.py                  # Analytics data
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── admin.py
│   │
│   ├── organization/                  # Organization mgmt
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── apps.py
│   │
│   ├── manage.py                      # Django CLI
│   ├── requirements.txt               # Python dependencies
│   ├── .env.example                   # Environment template
│   └── README.md                      # Backend documentation
│
├── UPGRADE_GUIDE.md                   # SDK 53→57 upgrade guide
├── PROJECT_STRUCTURE.md               # This file
└── README.md                          # (Project root README)
```

## Key Architecture Points

### 1. Frontend Architecture

**Client App** (`d:\capstone\client\frontend`)
- Purpose: Customer-facing application
- Stack: React Native (Expo SDK 57)
- Package: `com.sahayak.client`
- Entry: `App.js`
- Navigation: React Navigation
- State: Redux Toolkit / Context API

**Worker App** (`d:\capstone\worker\frontend`)
- Purpose: Service worker application
- Stack: React Native (Expo SDK 57)
- Package: `com.sahayak.worker`
- Entry: `App.js`
- Navigation: React Navigation
- Audio: Expo Audio, Expo Speech Recognition
- Payments: Razorpay integration

### 2. Backend Architecture

**Django REST Framework Server**
- Port: 8000
- Version: Django 4.2
- Database: PostgreSQL (via Supabase)
- Authentication: JWT + Supabase Auth (Phone OTP)
- API Style: RESTful
- Documentation: Swagger/ReDoc at `/api/docs/`

**API Modules:**
1. **Authentication**: Register, OTP, Login, Tokens
2. **Users**: Customer, Worker, Organization profiles
3. **Services**: Category management
4. **Jobs**: Job requests and bookings
5. **Payments**: Transaction handling (Razorpay)
6. **Notifications**: Push notifications
7. **Recommendations**: AI-based worker suggestions
8. **Analytics**: Platform analytics
9. **Organization**: Company management

### 3. Data Flow

```
Frontend Request
    ↓
HTTPS/HTTP
    ↓
Django REST API
    ↓
Authentication (JWT)
    ↓
Business Logic (Views)
    ↓
Data Layer (Models)
    ↓
PostgreSQL Database
    ↓
Response (JSON)
    ↓
Frontend
```

### 4. User Roles

- **Customer**: Posts service requests, books workers, makes payments
- **Worker**: Offers services, accepts jobs, provides ratings
- **Organization**: Manages multiple workers, assigns jobs
- **Administrator**: Verifies users, manages complaints, system admin

## Technology Stack

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React Native (Expo) |
| SDK | Expo SDK 57 |
| Navigation | React Navigation 7.4 |
| State Management | Redux Toolkit / Context API |
| UI Components | Expo Vector Icons |
| Maps | React Native Maps |
| Forms | React Native (custom) |
| Storage | AsyncStorage / Supabase |
| Audio | Expo Audio, Expo Speech |

### Backend
| Layer | Technology |
|-------|-----------|
| Framework | Django 4.2 |
| API | Django REST Framework 3.14 |
| Database | PostgreSQL (Supabase) |
| Auth | JWT + Supabase Auth |
| Caching | Redis |
| Async Tasks | Celery |
| Hosting | Render/AWS/Digital Ocean |

### External Services
| Service | Purpose |
|---------|---------|
| Supabase | Database, Auth, Storage, Realtime |
| Razorpay | Payment Gateway |
| OpenAI Whisper | Speech-to-Text |
| IndicTrans2 | Language Translation |
| Google Maps | Location Services |
| Firebase FCM | Push Notifications |
| Expo Speech | Text-to-Speech |

## Environment Configuration

### Frontend .env (if using)
```
BACKEND_URL=http://localhost:8000
API_VERSION=v1
```

### Backend .env
```
DEBUG=True
SECRET_KEY=your-secret-key
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
DATABASE_URL=postgresql://...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
OPENAI_API_KEY=...
GOOGLE_MAPS_API_KEY=...
```

## Setup Workflow

### 1. Client Frontend Setup
```bash
cd client/frontend
npm install
npm start  # or: npm run android
```

### 2. Worker Frontend Setup
```bash
cd worker/frontend
npm install
npm start  # or: npm run android
```

### 3. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

## API Endpoints Summary

### Authentication
- `POST /api/v1/auth/register/register/`
- `POST /api/v1/auth/otp/request_otp/`
- `POST /api/v1/auth/otp/verify_otp/`
- `POST /api/v1/auth/token/`
- `POST /api/v1/auth/token/refresh/`

### User Management
- `GET /api/v1/users/customers/my_profile/`
- `GET /api/v1/users/workers/`
- `GET /api/v1/users/workers/search/`
- `GET /api/v1/users/organizations/my_profile/`

### Services
- `GET /api/v1/services/categories/`

### Jobs & Bookings
- `GET,POST /api/v1/jobs/requests/`
- `GET,POST /api/v1/jobs/bookings/`

### Payments
- `GET,POST /api/v1/payments/`

### Notifications
- `GET /api/v1/notifications/`

### Other
- `GET /api/v1/recommendations/workers/`
- `GET /api/v1/analytics/`
- `GET /api/v1/organizations/`

## Database Schema (Key Tables)

```sql
-- Authentication
users (id, phone_number, email, role, is_verified)
user_roles (role, description)
otp_verifications (phone_number, otp_code, is_verified)
device_tokens (user_id, token, device_type)

-- User Profiles
customer_profiles (user_id, address, city, latitude, longitude)
worker_profiles (user_id, skills, hourly_rate, is_available)
organization_profiles (user_id, company_name, total_workers)
organization_workers (organization_id, worker_id, job_title)

-- Services & Jobs
service_categories (name, description)
service_subcategories (category_id, name)
job_requests (customer_id, service_category, location, status)
job_bookings (job_id, worker_id, quoted_price, status)
job_status_updates (booking_id, status, latitude, longitude)

-- Transactions
payments (booking_id, amount, status, payment_method)

-- Notifications & Recommendations
notifications (user_id, type, title, message, is_read)
worker_recommendations (worker_id, score, reason)

-- Analytics
analytics (metric_name, metric_value, timestamp)
```

## File Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.js`)
- **Utilities**: camelCase (e.g., `apiClient.js`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.js`)
- **Django Apps**: lowercase (e.g., `authentication/`)
- **Django Models**: PascalCase (e.g., `SahayakUser`)
- **Django Serializers**: PascalCase + "Serializer" (e.g., `UserSerializer`)

## Development Guidelines

### Frontend
1. Use functional components with hooks
2. Manage state with Context API or Redux
3. Follow React Native best practices
4. Test on physical devices
5. Use async/await for API calls

### Backend
1. Use Django ORM for database access
2. Implement proper error handling
3. Use serializers for validation
4. Add permissions and authentication
5. Write comprehensive docstrings
6. Use Django shell for testing queries

## Deployment Checklist

### Frontend
- [ ] Build APK/IPA
- [ ] Test on multiple devices
- [ ] Configure production backend URL
- [ ] Sign release build
- [ ] Upload to app stores

### Backend
- [ ] Set DEBUG=False
- [ ] Use secure SECRET_KEY
- [ ] Configure ALLOWED_HOSTS
- [ ] Set up HTTPS/SSL
- [ ] Configure database backups
- [ ] Set up monitoring
- [ ] Configure logging
- [ ] Test all endpoints

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Expo module not found | `npm install` + `expo prebuild --clean` |
| Database connection error | Verify PostgreSQL running + check .env |
| API CORS error | Update CORS_ALLOWED_ORIGINS in settings |
| Token not working | Check JWT expiry + refresh token |
| Payment gateway error | Verify Razorpay credentials in .env |

## Performance Optimization Tips

### Frontend
- Lazy load screens
- Optimize images
- Use React.memo for components
- Implement virtual lists for long lists
- Debounce search queries

### Backend
- Add database indexes
- Implement caching (Redis)
- Use async tasks (Celery)
- Paginate large queries
- Optimize API responses

## Testing

### Frontend Testing
```bash
# Install test dependencies
npm install --save-dev jest @testing-library/react-native

# Run tests
npm test
```

### Backend Testing
```bash
# Run all tests
python manage.py test

# Run specific app
python manage.py test authentication

# With coverage
coverage run --source='.' manage.py test
coverage report
```

## Documentation Links

- **Expo Docs**: https://docs.expo.dev/
- **React Native**: https://reactnative.dev/
- **Django**: https://docs.djangoproject.com/
- **DRF**: https://www.django-rest-framework.org/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Razorpay**: https://razorpay.com/docs/
- **Firebase**: https://firebase.google.com/docs/

## Team Responsibilities

- **Hansini Jadhav (2406074)**: [Role]
- **Rohit Jadhav (2406075)**: [Role]
- **Sayee Kashid (2406099)**: [Role]
- **Shreya Kikale (2406109)**: [Role]

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Aug 21, 2026 | Initial setup, SDK 53→57 upgrade, Backend creation |
| - | - | - |

---

**Last Updated**: August 21, 2026
**SDK Version**: Expo SDK 57
**Django Version**: 4.2
**React Native**: 0.79.6
