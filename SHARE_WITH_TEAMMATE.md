# Sahayak Project - Setup Instructions for Teammate

## 📦 Repository Link
**GitHub:** https://github.com/Rohit-1907/Sahayak

---

## 🚀 How to Download and Run

### Step 1: Clone the Repository
```bash
git clone https://github.com/Rohit-1907/Sahayak.git
cd Sahayak
```

### Step 2: Backend Setup

1. **Install Python 3.11+ and PostgreSQL**

2. **Create virtual environment:**
```bash
cd backend
python -m venv venv

# Windows:
.\venv\Scripts\Activate.ps1

# Mac/Linux:
source venv/bin/activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Create PostgreSQL database:**
```sql
CREATE DATABASE sahayak;
```

5. **Update database credentials:**
- Edit `backend/sahayak_backend/settings.py`
- Update `DATABASES` section with your PostgreSQL credentials

6. **Run migrations:**
```bash
python manage.py migrate
```

7. **Create superuser (optional):**
```bash
python manage.py createsuperuser
```

8. **Start backend server:**
```bash
python manage.py runserver 0.0.0.0:8000
```

Backend will run on: `http://YOUR_IP:8000`

---

### Step 3: Client App Setup

1. **Install Node.js and Expo CLI**

2. **Navigate to client app:**
```bash
cd client/frontend
```

3. **Install dependencies:**
```bash
npm install
```

4. **Update API URL:**
- Edit `config/api.js`
- Change `API_BASE_URL` to your computer's IP address:
```javascript
export const API_BASE_URL = 'http://YOUR_IP_HERE:8000';
```

5. **Find your IP address:**
   - Windows: `ipconfig` (look for IPv4)
   - Mac/Linux: `ifconfig` or `ip addr`

6. **Start the app:**
```bash
npx expo start
```

7. **Scan QR code** with Expo Go app on your phone

---

### Step 4: Worker App Setup

1. **Navigate to worker app:**
```bash
cd worker/frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the app:**
```bash
npx expo start
```

---

## 📱 Test Credentials

**Client:**
- Email: siya@gmail.com
- Password: (ask Rohit)

**Worker:**
- Email: sam@gmail.com
- Password: (ask Rohit)

---

## 🔑 Key Features Implemented

### ✅ OTP Verification System
- Worker generates OTP when arriving at job location
- Client sees 6-digit PIN in notification screen
- PIN expires in 3 minutes
- Real-time countdown timer
- Beautiful green-themed UI

### Flow:
1. Worker: Jobs Near You → View Details → "I Arrived at Job Location"
2. Client: Notifications → See PIN
3. Client provides PIN to worker verbally
4. Worker enters PIN → Job status changes to IN_PROGRESS

---

## 📂 Project Structure

```
Sahayak/
├── backend/              # Django REST API
│   ├── authentication/   # User auth & JWT
│   ├── jobs/            # Job management
│   ├── notifications/   # OTP system
│   └── users/           # User profiles
├── client/frontend/     # Client React Native app
└── worker/frontend/     # Worker React Native app
```

---

## 🐛 Troubleshooting

**Backend won't start:**
- Check PostgreSQL is running
- Verify database credentials in settings.py
- Run migrations: `python manage.py migrate`

**App won't connect:**
- Update IP address in both apps' config files
- Ensure all devices on same WiFi network
- Check firewall allows port 8000

**Can't see jobs:**
- Make sure backend is running
- Check API URL is correct
- Login with correct credentials

---

## 📞 Need Help?

Contact Rohit for:
- Database credentials
- Test account passwords
- API configuration help
- Any issues during setup

---

## 📚 Documentation

Read these files for more details:
- `README.md` - Full project documentation
- `HOW_TO_RUN_APPS.md` - Detailed running instructions
- `OTP_FLOW_COMPLETE.md` - OTP system details
- `IMPLEMENTATION_COMPLETE.md` - All implemented features

---

**Good luck with the project! 🚀**
