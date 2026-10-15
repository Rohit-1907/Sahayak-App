# ✅ Setup Checklist - Do This in Order

## 🎯 Phase 1: Supabase Setup (Do First!)

### Step 1: Get Supabase Credentials
- [ ] Go to https://supabase.com/dashboard
- [ ] Create/Open your project
- [ ] Go to **Project Settings** → **Database**
- [ ] Copy the connection string (looks like: `postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres`)
- [ ] Save this somewhere safe!

### Step 2: Configure `.env` File
```powershell
# In d:\capstone\backend\
Copy-Item .env.example .env
notepad .env
```

**Update these lines in `.env`:**
```env
# Your Supabase database connection
DB_NAME=postgres
DB_USER=postgres  
DB_PASSWORD=YOUR_SUPABASE_PASSWORD_HERE
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432

# Your Supabase URL and key
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your_service_role_key_here
```

---

## 🎯 Phase 2: Database Setup

### Step 3: Test Connection
```powershell
cd d:\capstone\backend
python manage.py dbshell
```
- [ ] Connection works? Type `\q` to exit

### Step 4: Create Database Tables
```powershell
# Create migrations
python manage.py makemigrations

# Apply migrations (creates tables in Supabase)
python manage.py migrate
```
- [ ] All migrations applied successfully?

### Step 5: Create User Roles
```powershell
python setup_auth.py
```
- [ ] 5 roles created?

---

## 🎯 Phase 3: Test the API

### Step 6: Start Server
```powershell
python manage.py runserver
```
- [ ] Server running on http://127.0.0.1:8000/ ?

### Step 7: Test Registration (Use Postman/Insomnia)

**POST** `http://localhost:8000/api/auth/register/`

**Body:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "phone_number": "1234567890",
  "password": "test123456",
  "password_confirm": "test123456",
  "first_name": "Test",
  "last_name": "User",
  "role": "customer"
}
```

- [ ] Registration successful?
- [ ] Got access and refresh tokens?

### Step 8: Verify in Supabase
- [ ] Go to Supabase **Table Editor**
- [ ] Click `users` table
- [ ] See your test user?

### Step 9: Test Login

**POST** `http://localhost:8000/api/auth/login/`

**Body:**
```json
{
  "username": "testuser",
  "password": "test123456"
}
```

- [ ] Login successful?
- [ ] Got tokens and user info?

---

## 🎯 Phase 4: Connect React Native Apps

### Step 10: Get Your Computer's IP
```powershell
ipconfig
```
Look for IPv4 Address (e.g., 192.168.1.4)

### Step 11: Update API URLs in React Native

In your React Native apps, use:
```javascript
const API_URL = 'http://192.168.1.4:8000/api';
```

- [ ] Client app can register users?
- [ ] Worker app can register users?

---

## 📋 Quick Reference

| What | Where | Command |
|------|-------|---------|
| Supabase Dashboard | Browser | https://supabase.com/dashboard |
| Start Django Server | Terminal | `python manage.py runserver` |
| View Tables | Supabase → Table Editor | Click `users` table |
| Test API | Postman/Insomnia | POST to endpoints |

---

## 🆘 Having Issues?

### Can't connect to database?
→ Check your `.env` file, make sure password is correct

### Migrations failing?
→ Make sure Supabase connection works: `python manage.py dbshell`

### Registration failing?
→ Check Django server logs in the terminal

### Can't see tables in Supabase?
→ Run: `python manage.py migrate --verbosity 2`

---

## ✅ When Everything Works

You should have:
- ✅ Django server running
- ✅ Tables visible in Supabase
- ✅ Registration working
- ✅ Login working
- ✅ Users stored in Supabase

---

**Ready to implement Organization Management next! 🚀**
