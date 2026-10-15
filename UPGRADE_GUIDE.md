# SAHAYAK Project Upgrade Guide: Expo SDK 53 → 57

## Overview

This document describes the upgrade process from Expo SDK 53 to SDK 57 for the SAHAYAK project (Client and Worker frontend applications).

## Changes Made

### 1. Frontend SDK Upgrades

#### Client Frontend (`d:\capstone\client\frontend`)
**Changes:**
- Expo: `~53.0.0` → `~57.0.0`
- `expo-asset`: `~11.1.7` → `~11.3.0`
- `expo-image-picker`: `~16.1.4` → `~16.3.0`
- `expo-location`: `~18.1.6` → `~18.2.0`
- `expo-status-bar`: `~2.2.3` → `~2.3.1`
- `@react-navigation/*`: Updated to compatible versions
- `react-native-gesture-handler`: `~2.24.0` → `~2.25.0`
- `react-native-reanimated`: `~3.17.4` → `~3.18.0`
- `react-native-safe-area-context`: `5.4.0` → `4.12.1`
- `react-native-screens`: `~4.11.1` → `~4.12.0`
- App name: `MyServiceApp53` → `sahayak-client`
- Package: `com.anonymous.MyServiceApp53` → `com.sahayak.client`
- `newArchEnabled`: `true` → `false` (for stability)

**Files Modified:**
- `package.json` - Updated all dependencies
- `app.json` - Updated naming and configuration

#### Worker Frontend (`d:\capstone\worker\frontend`)
**Changes:**
- Expo: `^53.0.27` → `~57.0.0`
- `expo-audio`: `~0.4.9` → `~0.4.13`
- `expo-camera`: `~16.1.11` → `~16.3.0`
- `expo-image-picker`: `~16.1.4` → `~16.3.0`
- `expo-speech-recognition`: `^2.1.5` → `^2.2.1`
- Added missing navigation dependencies for consistency
- App name: `worker` → `sahayak-worker`
- Package: `com.anonymous.worker` → `com.sahayak.worker`
- `newArchEnabled`: `false` (not set, now explicit)
- Added complete `expo` configuration section with all required fields

**Files Modified:**
- `package.json` - Updated all dependencies
- `app.json` - Added complete Expo configuration

### 2. Backend Architecture

Created comprehensive Django REST Framework backend at `d:\capstone\backend`:

**Project Structure:**
```
backend/
├── sahayak_backend/              # Main Django project
├── authentication/               # Auth & registration
├── users/                        # User profiles
├── services/                     # Service management
├── jobs/                         # Job & booking management
├── payments/                     # Payment handling
├── notifications/                # Push notifications
├── recommendations/              # AI recommendations
├── analytics/                    # Analytics & reports
├── organization/                 # Organization management
├── requirements.txt              # Dependencies
└── manage.py                     # Django CLI
```

## Migration Steps

### For Frontend Development

#### Step 1: Clean Installation

For both `client/frontend` and `worker/frontend`:

```bash
cd path/to/frontend

# Remove old node_modules and lock files
rm -rf node_modules
rm package-lock.json (or yarn.lock)

# Clear Expo cache
rm -rf .expo

# Install fresh dependencies
npm install
```

#### Step 2: Update Prebuild Cache

```bash
# Clear Expo prebuild cache
expo prebuild --clean

# For Android specifically
npm run prebuild
```

#### Step 3: Test Local Development

```bash
# Start development server
npm start

# Test on physical device or emulator
npm run android
npm run ios
```

#### Step 4: Build APK/IPA (if needed)

```bash
# Build Android APK
npm run android

# Build iOS app
npm run ios
```

### For Backend Setup

#### Step 1: Create Virtual Environment

```bash
cd backend

# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

#### Step 3: Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your configuration
# - Database credentials (Supabase PostgreSQL)
# - API keys
# - CORS settings
```

#### Step 4: Run Migrations

```bash
python manage.py migrate
```

#### Step 5: Create Initial Data

```bash
# Create superuser
python manage.py createsuperuser

# Create user roles
python manage.py shell
>>> from authentication.models import UserRole
>>> UserRole.objects.create(role='customer')
>>> UserRole.objects.create(role='worker')
>>> UserRole.objects.create(role='organization')
>>> UserRole.objects.create(role='admin')
>>> exit()
```

#### Step 6: Start Development Server

```bash
python manage.py runserver 0.0.0.0:8000
```

## Breaking Changes & Compatibility

### New Architecture Components

1. **Shared Backend**: Single Django backend serves both Client and Worker frontends
2. **Unified Database**: PostgreSQL via Supabase (shared by both apps)
3. **Role-Based Access**: Authentication models support multiple user types
4. **API Versioning**: All endpoints under `/api/v1/`

### Frontend Compatibility

- Both apps now use consistent SDK (57)
- Navigation libraries updated to compatible versions
- React Native compatible with SDK 57 features
- New Architecture disabled for stability

### Database Changes

None required if migrating fresh. For existing data:
1. Backup existing database
2. Run Django migrations
3. Manually migrate data using management commands (if needed)

## Configuration Checklist

### Frontend

- [ ] Client: `app.json` updated with new package identifier
- [ ] Worker: `app.json` updated with new package identifier
- [ ] Both: `package.json` dependencies installed
- [ ] Both: Native modules rebuild (`expo prebuild`)
- [ ] Client: CORS configured for backend (localhost:8000)
- [ ] Worker: CORS configured for backend (localhost:8000)

### Backend

- [ ] `.env` file created with proper configuration
- [ ] Database connection verified
- [ ] Migrations applied
- [ ] User roles created
- [ ] CORS origin includes frontend URLs
- [ ] Superuser created
- [ ] Static files configured

## Testing the Setup

### Frontend Testing

```bash
# Test Client
cd client/frontend
npm start
# Open app in Expo Go

# Test Worker
cd worker/frontend
npm start
# Open app in Expo Go
```

### Backend Testing

```bash
cd backend
python manage.py test

# Specific app
python manage.py test authentication

# With coverage
coverage run --source='.' manage.py test
coverage report
```

### Integration Testing

1. **Register User**
   - POST `/api/v1/auth/register/`
   - Verify user created in database

2. **Request OTP**
   - POST `/api/v1/auth/otp/request_otp/`
   - Check console for OTP code

3. **Verify OTP**
   - POST `/api/v1/auth/otp/verify_otp/`
   - Verify user activated

4. **Obtain Token**
   - POST `/api/v1/auth/token/`
   - Use credentials to get JWT token

5. **Access Protected Endpoint**
   - GET `/api/v1/auth/profile/me/`
   - Include token in Authorization header

## Troubleshooting

### Frontend Issues

**Issue**: `npm install` fails with Expo SDK 57
```bash
# Solution: Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Issue**: Expo Go app crashes on startup
```bash
# Solution: Rebuild native modules
expo prebuild --clean
npm start
```

**Issue**: Android build fails
```bash
# Solution: Clear build cache
rm -rf android/.gradle
npm run android
```

### Backend Issues

**Issue**: Module 'django_redis' not found
```bash
# Solution: Install missing dependency
pip install django-redis
```

**Issue**: Database connection error
```bash
# Solution: Verify DATABASE_URL in .env
# Check PostgreSQL is running
# Verify credentials
```

**Issue**: Static files not loading
```bash
# Solution: Collect static files
python manage.py collectstatic
```

## API Compatibility

### Endpoints Affected by SDK 57

- **Voice Recognition**: Still uses OpenAI Whisper (STT)
- **Text-to-Speech**: Expo Speech continues to work
- **Language Support**: IndicTrans2 integration unchanged
- **Notifications**: Firebase Cloud Messaging compatible
- **Maps**: Google Maps API compatible

### Expected Breaking Changes (None)

SDK 57 maintains backward compatibility with SDK 53 features used in this project.

## Performance Improvements in SDK 57

1. **Faster Build Times**: Improved Expo build system
2. **Better Memory Management**: React 19 improvements
3. **Updated Dependencies**: Security patches and bug fixes
4. **Stability**: Removed experimental features (New Architecture disabled)

## Future Considerations

1. **Monitor Expo Releases**: Plan SDK 58+ upgrade for Q4 2026
2. **React Native Updates**: Keep React Native at compatible version
3. **Backend Scaling**: Monitor API performance and optimize queries
4. **Database**: Consider connection pooling for production
5. **Caching**: Implement Redis caching for frequently accessed data

## Support & Documentation

- **Expo Docs**: https://docs.expo.dev/
- **React Native**: https://reactnative.dev/
- **Django REST Framework**: https://www.django-rest-framework.org/
- **Project Wiki**: Check `/docs` folder for architectural docs

## Rollback Plan

If issues occur after upgrade:

1. **Revert Frontend**: `git checkout main -- client/frontend worker/frontend`
2. **Revert Backend**: `git checkout main -- backend`
3. **Clear Caches**: `npm cache clean --force`, `expo prebuild --clean`
4. **Reinstall**: `npm install`, `pip install -r requirements.txt`

## Validation Checklist

After completing the upgrade:

- [ ] Both frontends build successfully
- [ ] Backend server starts without errors
- [ ] Database migrations applied
- [ ] API documentation accessible at `/api/docs/`
- [ ] Authentication flow works end-to-end
- [ ] Push notifications functional
- [ ] Maps integration working
- [ ] Voice features tested
- [ ] All tests passing
- [ ] No console errors or warnings (development build)

## Questions or Issues?

Contact the development team or check the project documentation.

**Last Updated**: August 21, 2026
**Upgrade Version**: SDK 53 → 57
