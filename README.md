# Sahayak - On-Demand Service Platform

A full-stack mobile application connecting clients with service workers (Cook, Plumber, Electrician, etc.) with real-time OTP-based arrival verification.

## 🚀 Features

- **Client App**: Book services, view workers, OTP-based verification
- **Worker App**: View jobs, navigate to locations, verify arrival with OTP
- **Real-time OTP System**: 6-digit PIN with 3-minute expiry
- **Job Management**: Request, schedule, track, and complete jobs
- **Live Location**: Real-time worker tracking and navigation

## 📁 Project Structure

```
capstone/
├── backend/              # Django REST API
│   ├── authentication/   # User auth & JWT
│   ├── users/           # User profiles
│   ├── jobs/            # Job & work requests
│   ├── notifications/   # OTP system
│   └── manage.py
├── client/frontend/     # Client React Native app
└── worker/frontend/     # Worker React Native app
```

## 🛠️ Tech Stack

### Backend
- Django 6.1
- Django REST Framework
- PostgreSQL
- JWT Authentication

### Frontend
- React Native (Expo)
- AsyncStorage
- Expo Location & Maps

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL
- Expo CLI

### Backend Setup

1. **Create virtual environment**
```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate     # Mac/Linux
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Database setup**
- Create PostgreSQL database named `sahayak`
- Update `backend/sahayak_backend/settings.py` with your DB credentials

4. **Run migrations**
```bash
python manage.py migrate
```

5. **Create superuser**
```bash
python manage.py createsuperuser
```

6. **Start server**
```bash
python manage.py runserver 0.0.0.0:8000
```

### Client App Setup

1. **Install dependencies**
```bash
cd client/frontend
npm install
```

2. **Update API URL**
- Edit `config/api.js`
- Change `API_BASE_URL` to your computer's IP address

3. **Start app**
```bash
npx expo start
```

### Worker App Setup

1. **Install dependencies**
```bash
cd worker/frontend
npm install
```

2. **Start app**
```bash
npx expo start
```

## 🔑 API Endpoints

### Authentication
- `POST /api/v1/auth/register/` - Register user
- `POST /api/v1/auth/login/` - Login
- `POST /api/v1/auth/logout/` - Logout

### Jobs
- `POST /api/v1/jobs/work-requests/create/` - Create work request
- `GET /api/v1/jobs/work-requests/worker/` - Get worker's jobs
- `GET /api/v1/jobs/work-requests/client/` - Get client's jobs

### OTP System
- `POST /api/v1/jobs/work-requests/{id}/generate-otp/` - Generate OTP
- `POST /api/v1/jobs/work-requests/{id}/verify-otp/` - Verify OTP
- `GET /api/v1/notifications/otps/` - Get active OTPs

## 📱 OTP Verification Flow

1. Worker arrives at job location
2. Worker clicks "I Arrived at Job Location"
3. System generates 6-digit PIN (expires in 3 min)
4. Client sees PIN in notification screen
5. Client provides PIN to worker verbally
6. Worker enters PIN
7. Job status updates to IN_PROGRESS

## 🧪 Testing

**Generate test OTP:**
```bash
cd backend
python test_otp_generation.py
```

**Test credentials:**
- Client: siya@gmail.com / password
- Worker: sam@gmail.com / password

## 📝 Important Notes

- **IP Address**: Update API URLs in both apps with your computer's IP
- **Network**: Ensure all devices are on the same network
- **Database**: PostgreSQL must be running
- **Expo Go**: Install Expo Go app on your phone for testing

## 🐛 Troubleshooting

**Backend not connecting:**
- Check if Django server is running on `0.0.0.0:8000`
- Verify firewall allows connections on port 8000
- Update IP address in app config files

**OTP not appearing:**
- Check backend logs for errors
- Ensure client is logged in
- Pull down to refresh notification screen

**Database errors:**
- Run `python manage.py migrate`
- Check PostgreSQL is running
- Verify database credentials in settings.py

## 👥 Team Collaboration

When cloning this repo:
1. Run backend and frontend setup steps above
2. Create your own `.env` file (don't commit it!)
3. Update IP addresses for your network
4. Run migrations before starting

## 📄 License

This project is for educational purposes.

## 🤝 Contributing

This is a capstone project. For contributions, please create a branch and submit a pull request.

---

**Developed as part of Final Year Capstone Project**
