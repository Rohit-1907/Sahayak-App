# SAHAYAK Quick Start Guide

Get the SAHAYAK platform up and running in minutes.

## 🚀 Quick Setup (5 minutes)

### Prerequisites
- Node.js 18+
- Python 3.9+
- npm or yarn
- Git

### Step 1: Clone or Setup Workspace
```bash
cd d:\capstone
```

### Step 2: Frontend - Client App

```bash
cd client/frontend

# Install dependencies
npm install

# Start development
npm start

# Build for Android
npm run android
```

### Step 3: Frontend - Worker App

```bash
cd worker/frontend

# Install dependencies
npm install

# Start development
npm start

# Build for Android
npm run android
```

### Step 4: Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Or (macOS/Linux)
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your settings (especially database URL)

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver 0.0.0.0:8000
```

## 📱 Running the Apps

### Client App
- **Port**: Expo Go (localhost:8081)
- **URL**: Open Expo Go app on phone → scan QR code
- **Features**: Browse services, book workers, make payments

### Worker App
- **Port**: Expo Go (localhost:8082)
- **URL**: Open Expo Go app on phone → scan QR code
- **Features**: Manage jobs, track earnings, update availability

### Backend API
- **URL**: http://localhost:8000
- **Docs**: http://localhost:8000/api/docs/
- **Admin**: http://localhost:8000/admin/

## 🔑 Key Endpoints

### Authentication
```bash
# Register
POST /api/v1/auth/register/register/

# Request OTP
POST /api/v1/auth/otp/request_otp/

# Verify OTP
POST /api/v1/auth/otp/verify_otp/

# Get Token
POST /api/v1/auth/token/

# Refresh Token
POST /api/v1/auth/token/refresh/
```

### User Profiles
```bash
# Get customer profile
GET /api/v1/users/customers/my_profile/

# Get worker profile
GET /api/v1/users/workers/my_profile/

# Search workers
GET /api/v1/users/workers/search/?category=plumbing&city=Pune
```

### Services
```bash
# List all services
GET /api/v1/services/categories/
```

### Jobs
```bash
# List job requests
GET /api/v1/jobs/requests/

# Create job request
POST /api/v1/jobs/requests/

# List bookings
GET /api/v1/jobs/bookings/

# Create booking
POST /api/v1/jobs/bookings/
```

## 🛠️ Common Commands

### Frontend

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear cache and rebuild
expo prebuild --clean

# Start with specific port
npm start -- --port 8081
```

### Backend

```bash
# Create new Django app
python manage.py startapp my_app

# Make migrations
python manage.py makemigrations

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Access Django shell
python manage.py shell

# Run tests
python manage.py test

# Collect static files
python manage.py collectstatic
```

## 📊 Admin Dashboard

Access Django admin:
1. Go to http://localhost:8000/admin/
2. Login with superuser credentials
3. Manage users, jobs, payments, etc.

## 🔐 User Registration Flow

1. **Register**
   ```bash
   POST /api/v1/auth/register/register/
   Body: {
     "phone_number": "+919876543210",
     "email": "user@example.com",
     "first_name": "John",
     "last_name": "Doe",
     "password": "secure_password",
     "password_confirm": "secure_password",
     "role": "customer"
   }
   ```

2. **Request OTP**
   ```bash
   POST /api/v1/auth/otp/request_otp/
   Body: {
     "phone_number": "+919876543210"
   }
   # Check server console for OTP (in development)
   ```

3. **Verify OTP**
   ```bash
   POST /api/v1/auth/otp/verify_otp/
   Body: {
     "phone_number": "+919876543210",
     "otp_code": "123456"
   }
   ```

4. **Get Token**
   ```bash
   POST /api/v1/auth/token/
   Body: {
     "username": "john_doe",
     "password": "secure_password"
   }
   Response: {
     "access": "eyJ...",
     "refresh": "eyJ..."
   }
   ```

5. **Use Token**
   ```bash
   Header: Authorization: Bearer <access_token>
   ```

## 🧪 Testing the API

### Using cURL
```bash
# Get current user profile
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/auth/profile/me/

# List workers
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/users/workers/
```

### Using Postman
1. Import API collection
2. Set Bearer token in Auth tab
3. Test endpoints

### Using Python
```python
import requests

headers = {"Authorization": "Bearer YOUR_TOKEN"}
response = requests.get(
    "http://localhost:8000/api/v1/auth/profile/me/",
    headers=headers
)
print(response.json())
```

## 📁 Project Structure

```
capstone/
├── client/frontend/          # Customer app
├── worker/frontend/          # Worker app
├── backend/                  # Django API server
├── UPGRADE_GUIDE.md         # SDK upgrade details
├── PROJECT_STRUCTURE.md     # Full project structure
└── QUICK_START.md          # This file
```

## 🐛 Troubleshooting

### "npm: command not found"
- Install Node.js from nodejs.org
- Restart terminal

### "Python: command not found"
- Install Python 3.9+ from python.org
- Add to PATH environment variable

### "Port already in use"
```bash
# Change backend port
python manage.py runserver 0.0.0.0:8001

# Or kill the process using the port
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8000
kill -9 <PID>
```

### Database connection error
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Run migrations: `python manage.py migrate`

### Static files not loading
```bash
python manage.py collectstatic --noinput
```

## 📚 Documentation

- **Detailed Guide**: See `UPGRADE_GUIDE.md`
- **Project Architecture**: See `PROJECT_STRUCTURE.md`
- **Backend Docs**: See `backend/README.md`
- **API Docs**: Visit http://localhost:8000/api/docs/

## 🌐 Environment Variables

**Backend (.env)**
```
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgresql://user:password@localhost/sahayak
CORS_ALLOWED_ORIGINS=http://localhost:8000,exp://localhost:8081
```

**Frontend (optional .env)**
```
BACKEND_URL=http://localhost:8000
API_VERSION=v1
```

## 🚢 Deployment Preparation

### Frontend
- [ ] Update API URL to production
- [ ] Build signed APK/IPA
- [ ] Test on multiple devices
- [ ] Upload to app stores

### Backend
- [ ] Set DEBUG=False
- [ ] Use production SECRET_KEY
- [ ] Configure HTTPS
- [ ] Setup database backups
- [ ] Configure monitoring
- [ ] Deploy to Render/AWS/DigitalOcean

## 💡 Tips

1. **Use Expo Go for quick testing** - No need to rebuild native modules
2. **Check API docs** - Swagger UI shows all endpoints
3. **Use Django admin** - Manage data easily without API calls
4. **Monitor logs** - Check both frontend and backend logs for issues
5. **Test with real device** - Better for testing location and camera features

## ❓ Common Questions

**Q: Can I run everything on Windows?**
A: Yes, all tools support Windows. Use `venv\Scripts\activate` instead of `source venv/bin/activate`.

**Q: Do I need a real phone?**
A: No, you can use Android emulator. Use `npm run android` with emulator running.

**Q: How do I reset the database?**
A: Delete and recreate migrations (carefully in development only).

**Q: How do I add a new feature?**
A: Create a branch, make changes, test locally, then merge.

## 📞 Support

- Check project documentation
- Review code comments
- Consult the team

## ✅ Success Checklist

- [ ] All three servers running (Client, Worker, Backend)
- [ ] API docs accessible
- [ ] Can register user
- [ ] Can login and get token
- [ ] Can make authenticated API calls
- [ ] Frontend apps loading on device

---

**Ready to code!** 🎉

For detailed setup, see `UPGRADE_GUIDE.md` and `PROJECT_STRUCTURE.md`
