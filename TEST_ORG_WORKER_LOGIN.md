# Test Organization Worker Login

## Test Flow

### Step 1: Add a Test Worker
1. Login as org admin (e.g., `nano@gmail.com` / `12345678`)
2. Go to Home → "Add Worker"
3. Enter number of workers: `1`
4. Fill in test worker details:
   - **First Name:** Test
   - **Last Name:** Worker
   - **DOB:** 01/01/2000
   - **Address:** Test Address
   - **Experience:** 2 years
   - **Email:** testworker@example.com
   - **Phone:** 9876543210
5. Click "Generate Credentials & Save All Workers"
6. **Note down the generated credentials:**
   - Username: `9876543210` (phone number)
   - Password: `5724Test00` (format: last 4 of org_id + first 4 of name + last 2 of year)

### Step 2: Test Worker Login
1. Logout from org admin account
2. Go to Welcome screen
3. Select "Organization Worker Login"
4. Enter the credentials from Step 1:
   - Username: `9876543210`
   - Password: `5724Test00`
5. Click "Login"
6. ✅ Should successfully login and navigate to org worker home

---

## Expected Results

✅ **After Adding Worker:**
- Modal shows generated credentials
- Clicking "Done" goes back to Home (not to organization page)
- Form resets for adding more workers

✅ **Worker Login:**
- Worker can login with generated username and password
- Navigates to organization worker home screen
- Shows worker's assigned tasks and calendar

---

## Troubleshooting

### If Login Fails:
1. **Check password is correct** - Copy/paste from credentials modal
2. **Check username** - Should be the phone number exactly
3. **Check backend logs** - Look for password validation errors
4. **Verify worker exists** - Check database or Workers list screen

### Common Issues:
- ❌ Password too long → Fixed (now max 10 chars)
- ❌ Wrong navigation after adding → Fixed (now goes to home)
- ❌ Password doesn't match → Check if password was hashed correctly

---

## Database Verification (Optional)

If you need to check the database:

```sql
-- Check if worker was created
SELECT id, first_name, last_name, username, org_id 
FROM org_workers 
WHERE phone_number = '9876543210';

-- Check password hash exists
SELECT id, first_name, password_hash, plain_password_display
FROM org_workers
WHERE phone_number = '9876543210';
```

The `plain_password_display` field stores the plain text password for admin reference.
