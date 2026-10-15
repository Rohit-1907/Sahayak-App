# 🚀 Quick Start - JWT Authentication

## Run These Commands Now:

```powershell
# 1. Navigate to backend directory
cd d:\capstone\backend

# 2. Create migrations
python manage.py makemigrations

# 3. Apply migrations
python manage.py migrate

# 4. Create user roles
python setup_auth.py

# 5. (Optional) Create superuser
python manage.py createsuperuser

# 6. Start development server
python manage.py runserver
```

---

## ✅ That's It!

Your JWT authentication is now running on: **http://localhost:8000**

---

## 🧪 Quick Test

Open another terminal and test the registration endpoint:

```powershell
curl -X POST http://localhost:8000/api/auth/register/ -H "Content-Type: application/json" -d "{\"username\": \"testcustomer\", \"email\": \"test@example.com\", \"phone_number\": \"1234567890\", \"password\": \"test123456\", \"password_confirm\": \"test123456\", \"first_name\": \"Test\", \"last_name\": \"User\", \"role\": \"customer\"}"
```

Or use Postman/Insomnia to test:

**Endpoint:** `POST http://localhost:8000/api/auth/register/`

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

---

## 📱 Connect to React Native Apps

Make sure to use your computer's IP address (not localhost) in your React Native apps:

Example: `http://192.168.1.4:8000/api/auth/login/`

---

## 📚 Full Documentation

See `AUTHENTICATION_SETUP_COMPLETE.md` for:
- All API endpoints
- Permission classes usage
- React Native integration examples
- Testing examples

---

## ❓ Troubleshooting

### Migration Error?
```powershell
# Reset migrations (if needed)
python manage.py migrate authentication zero
python manage.py migrate
```

### Port already in use?
```powershell
# Run on different port
python manage.py runserver 8001
```

### Database connection error?
Check `sahayak_backend/settings.py` and your `.env` file for database credentials.

---

**Ready to test! 🎉**
