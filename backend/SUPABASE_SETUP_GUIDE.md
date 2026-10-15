# 🗄️ Supabase Database Setup Guide

## Step 1: Get Supabase Credentials

### 1.1 Go to Supabase Dashboard
Visit: https://supabase.com/dashboard

### 1.2 Create/Select Your Project
- If you don't have a project, click **"New Project"**
- Choose a name (e.g., "sahayak")
- Choose a region close to you
- Create a strong database password (save this!)

### 1.3 Get Connection Details

**Option A: Get Database URL (Recommended)**

1. Go to **Project Settings** (gear icon)
2. Click **Database** in the sidebar
3. Scroll to **Connection String** section
4. Copy the **Connection string** (it looks like this):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual database password

**Option B: Get Individual Details**

From the same Database settings page, note down:
- Host: `db.xxxxx.supabase.co`
- Port: `5432`
- Database: `postgres`
- User: `postgres`
- Password: (the one you created)

### 1.4 Get API Keys

1. Go to **Project Settings**
2. Click **API** in the sidebar
3. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** key (for frontend)
   - **service_role** key (for backend - keep this secret!)

---

## Step 2: Configure Django Settings

### 2.1 Create `.env` file

In `d:\capstone\backend\`, create a `.env` file (copy from `.env.example`):

```powershell
cd d:\capstone\backend
Copy-Item .env.example .env
```

### 2.2 Update `.env` with Supabase Credentials

Open `d:\capstone\backend\.env` and update:

```env
# Django Settings
DEBUG=True
SECRET_KEY=your-super-secret-key-change-this-in-production
ALLOWED_HOSTS=localhost,127.0.0.1,192.168.1.4

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres

# Or use individual settings:
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=YOUR_SUPABASE_DB_PASSWORD
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432

# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your_supabase_service_role_key
SUPABASE_AUTH_ENABLED=False

# CORS Configuration (for Expo apps)
CORS_ALLOWED_ORIGINS=http://localhost:8081,http://192.168.1.4:8081,http://localhost:8082,http://192.168.1.4:8082

# Payment Gateway (Razorpay) - Can be added later
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# OpenAI - Can be added later
OPENAI_API_KEY=

# Google Maps - Can be added later
GOOGLE_MAPS_API_KEY=

# Email - Can be configured later
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=

# Redis (optional for now)
REDIS_URL=redis://localhost:6379/0
```

**Important:** Replace these values:
- `YOUR_PASSWORD` - Your Supabase database password
- `db.xxxxx.supabase.co` - Your Supabase database host
- `https://xxxxx.supabase.co` - Your Supabase project URL
- `your_supabase_service_role_key` - Your service role key

---

## Step 3: Update Django Database Settings

The settings are already configured to use environment variables, but let me verify:

### 3.1 Check `sahayak_backend/settings.py`

The database configuration should look like this (already in your settings):

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DB_NAME', default='sahayak'),
        'USER': env('DB_USER', default='postgres'),
        'PASSWORD': env('DB_PASSWORD', default='postgres'),
        'HOST': env('DB_HOST', default='localhost'),
        'PORT': env('DB_PORT', default='5432'),
    }
}
```

This will automatically read from your `.env` file.

---

## Step 4: Install PostgreSQL Adapter (Already Done)

The `psycopg2-binary` package is already in your `requirements.txt`, so you're good!

---

## Step 5: Test Database Connection

### 5.1 Test Connection

```powershell
cd d:\capstone\backend

# Test database connection
python manage.py dbshell
```

If it connects successfully, you'll see:
```
psql (XX.X)
Type "help" for help.

postgres=>
```

Type `\q` to exit.

### 5.2 If Connection Fails

**Common Issues:**

1. **Wrong password**: Double-check your database password in `.env`
2. **Host not found**: Make sure you copied the full host from Supabase
3. **Firewall**: Supabase is cloud-hosted, so no firewall issues usually
4. **SSL required**: Add this to settings if needed (usually not required)

---

## Step 6: Create Database Tables

### 6.1 Check for Pending Migrations

```powershell
python manage.py showmigrations
```

### 6.2 Create Migrations for Authentication

```powershell
python manage.py makemigrations authentication
```

### 6.3 Apply All Migrations

```powershell
python manage.py migrate
```

**Expected Output:**
```
Operations to perform:
  Apply all migrations: admin, auth, authentication, contenttypes, sessions, token_blacklist
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying authentication.0001_initial... OK
  Applying admin.0001_initial... OK
  ...
  Applying token_blacklist.0001_initial... OK
```

---

## Step 7: Create Initial Data

### 7.1 Create User Roles

```powershell
python setup_auth.py
```

**Expected Output:**
```
🚀 Setting up user roles...

✅ Created role: Customer
✅ Created role: Individual Worker
✅ Created role: Organization Admin
✅ Created role: Organization Worker
✅ Created role: Platform Administrator

✅ Setup complete!
   Created: 5 roles
```

### 7.2 Create Superuser (Optional)

```powershell
python manage.py createsuperuser
```

Follow the prompts:
```
Username: admin
Email: admin@sahayak.com
Password: ******** (type your password)
Password (again): ********
Superuser created successfully.
```

---

## Step 8: Verify Tables in Supabase

### 8.1 Go to Supabase Table Editor

1. Open Supabase Dashboard
2. Click **Table Editor** (database icon)
3. You should see these tables:
   - `users` (SahayakUser)
   - `user_roles` (UserRole)
   - `otp_verifications`
   - `device_tokens`
   - Django's default tables (auth, sessions, etc.)

### 8.2 Check User Roles Table

Click on `user_roles` table and verify you have 5 roles:
- customer
- individual_worker
- organization_admin
- organization_worker
- admin

---

## Step 9: Start Django Server

```powershell
python manage.py runserver
```

**Expected Output:**
```
Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
August 21, 2026 - 15:30:45
Django version 4.2.7, using settings 'sahayak_backend.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

---

## Step 10: Test Authentication Endpoints

### 10.1 Test Registration

Open a new PowerShell terminal:

```powershell
curl -X POST http://localhost:8000/api/auth/register/ -H "Content-Type: application/json" -d "{\"username\": \"testcustomer\", \"email\": \"test@example.com\", \"phone_number\": \"1234567890\", \"password\": \"test123456\", \"password_confirm\": \"test123456\", \"first_name\": \"Test\", \"last_name\": \"User\", \"role\": \"customer\"}"
```

Or use **Postman/Insomnia**:

**POST** `http://localhost:8000/api/auth/register/`

**Body (JSON):**
```json
{
  "username": "testcustomer",
  "email": "test@example.com",
  "phone_number": "1234567890",
  "password": "test123456",
  "password_confirm": "test123456",
  "first_name": "Test",
  "last_name": "User",
  "role": "customer"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "uuid-here",
    "username": "testcustomer",
    "email": "test@example.com",
    "phone_number": "1234567890",
    "role_name": "customer",
    "role_display": "Customer"
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1Qi...",
    "access": "eyJ0eXAiOiJKV1Qi..."
  }
}
```

### 10.2 Verify User in Supabase

1. Go to Supabase **Table Editor**
2. Click on `users` table
3. You should see your test user!

### 10.3 Test Login

**POST** `http://localhost:8000/api/auth/login/`

**Body (JSON):**
```json
{
  "username": "testcustomer",
  "password": "test123456"
}
```

**Expected Response:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1Qi...",
  "access": "eyJ0eXAiOiJKV1Qi...",
  "user": {
    "id": "uuid",
    "username": "testcustomer",
    "role": "customer",
    "role_display": "Customer",
    ...
  }
}
```

---

## 🎉 Success Checklist

- [ ] Supabase project created
- [ ] Database credentials obtained
- [ ] `.env` file created and configured
- [ ] Database connection tested
- [ ] Migrations applied successfully
- [ ] User roles created
- [ ] Django server running
- [ ] Registration endpoint tested
- [ ] User visible in Supabase Table Editor
- [ ] Login endpoint tested

---

## 🔧 Troubleshooting

### Error: "connection to server... failed"

**Solution:** Check your database credentials in `.env` file.

### Error: "password authentication failed"

**Solution:** Make sure you're using the correct database password.

### Error: "could not translate host name"

**Solution:** Check your `DB_HOST` - it should be like `db.xxxxx.supabase.co`

### Error: "No module named 'psycopg2'"

**Solution:** 
```powershell
pip install psycopg2-binary
```

### Tables not appearing in Supabase?

**Solution:** Make sure migrations ran successfully:
```powershell
python manage.py migrate --verbosity 2
```

---

## 📱 Configure for React Native Apps

When your Django server is running, use your computer's IP address (not localhost) in React Native:

**Example:**
```javascript
const API_URL = 'http://192.168.1.4:8000/api';
```

Find your IP:
```powershell
ipconfig
```
Look for "IPv4 Address" under your active network adapter.

---

## ✅ Next Steps

After successful setup:

1. ✅ JWT Authentication is working
2. ✅ Database tables are in Supabase
3. ✅ Ready to implement Organization Management
4. ✅ Ready to connect React Native apps

---

**You're now ready to start using Supabase with Django! 🚀**
