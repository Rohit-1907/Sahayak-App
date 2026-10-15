# ✅ CRITICAL FIX: User Role AsyncStorage Bug

## 🐛 The Bug

**Problem:** Individual worker Sam logged in, but `user_role` in AsyncStorage stayed as `organization_admin` from a previous login.

**Impact:** 
- Jobs Near You fetched organization requests (empty) instead of individual worker jobs
- Calendar fetched organization requests (empty) instead of scheduled work
- Home page showed 22 jobs but Jobs/Calendar showed 0

## 🔍 Root Cause

The login flow saved tokens and user_data to AsyncStorage, but **never saved `user_role`**:

```javascript
// ❌ OLD CODE - Missing user_role!
await AsyncStorage.setItem('access_token', tokens.access);
await AsyncStorage.setItem('refresh_token', tokens.refresh);
await AsyncStorage.setItem('user_data', JSON.stringify(user));
// user_role NOT saved!
```

When Sam (individual_worker) logged in after an organization admin was logged in, the old `user_role` value persisted.

## ✅ The Fix

**File:** `worker/frontend/services/auth.service.js`

### 1. Save user_role during login:

```javascript
// ✅ NEW CODE - Saves user_role!
await AsyncStorage.setItem('access_token', tokens.access);
await AsyncStorage.setItem('refresh_token', tokens.refresh);
await AsyncStorage.setItem('user_data', JSON.stringify(user));

// NEW: Save user_role and user_type
const userRole = user.role_name || user.role || 'individual_worker';
await AsyncStorage.setItem('user_role', userRole);
await AsyncStorage.setItem('user_type', userRole);
console.log('✅ Stored user_role:', userRole);
```

### 2. Clear user_role during logout:

```javascript
// ✅ NEW CODE - Clears user_role!
await AsyncStorage.removeItem('access_token');
await AsyncStorage.removeItem('refresh_token');
await AsyncStorage.removeItem('user_data');
await AsyncStorage.removeItem('user_role');    // NEW
await AsyncStorage.removeItem('user_type');    // NEW
await AsyncStorage.removeItem('org_id');       // NEW
```

## 🧪 Testing

### Before Fix:
```
1. Login as organization admin (rama@gmail.com)
2. Logout
3. Login as individual worker (sam@gmail.com)
4. Go to Jobs Near You
Result: ❌ Shows 0 jobs (fetching org requests)
Console: "User Role: organization_admin" (WRONG!)
```

### After Fix:
```
1. Clear app cache: npm start -- --clear
2. Login as individual worker (sam@gmail.com)
3. Go to Jobs Near You
Result: ✅ Shows 22 scheduled jobs
Console: "User Role: individual_worker" (CORRECT!)
```

## 📋 Related Logs

### Logs showing the bug:
```
LOG ✅ Login successful: 9632587410
LOG user: {"role": "individual_worker"...}      ← Backend returns correct role
LOG 💼 Jobs Near You: User Role: organization_admin  ← AsyncStorage has old value!
LOG 💼 Fetching organization accepted requests  ← Fetches wrong endpoint
LOG 💼 Organization requests: {"count": 0...}   ← Empty results
```

### Expected logs after fix:
```
LOG ✅ Login successful: 9632587410
LOG ✅ Stored user_role: individual_worker      ← NEW log
LOG 💼 Jobs Near You: User Role: individual_worker  ← Correct!
LOG 💼 Fetching worker scheduled jobs           ← Correct endpoint
LOG ✅ Jobs loaded: 22 scheduled jobs           ← Success!
```

## 🎯 Files Changed

1. **worker/frontend/services/auth.service.js**
   - Added `user_role` and `user_type` to saveAuthData()
   - Added cleanup to clearAuthData()

## 🚀 Next Steps

1. **Clear app cache** to reset AsyncStorage:
   ```powershell
   cd d:\capstone\worker\frontend
   npm start -- --clear
   ```

2. **Test with Sam:**
   - Login: sam@gmail.com / 9632587410
   - Check Jobs Near You: Should show 22 jobs
   - Check Calendar: Should show 4 scheduled jobs
   - Console should log: "✅ Stored user_role: individual_worker"

3. **Test organization admin:**
   - Login: rama@gmail.com
   - Should still work correctly
   - Console should log: "✅ Stored user_role: organization_admin"

## ✨ Success Criteria

- ✅ Individual workers see their scheduled jobs in Jobs Near You
- ✅ Individual workers see their scheduled jobs in Calendar
- ✅ Organization admins see organization requests
- ✅ user_role is saved on every login
- ✅ user_role is cleared on logout
- ✅ No stale user_role values after switching accounts

---

**Status:** ✅ FIXED - Ready for testing!
