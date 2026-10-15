# Fix Client App Calendar & Jobs Fetch Error

## Error
```
LOG Error fetching scheduled requests: [Error: fetch failed: Fetch request has been canceled]
LOG ❌ Error fetching calendar work requests: [Error: fetch failed: Fetch request has been canceled]
```

## Root Cause
The fetch request is being canceled/aborted before it completes. This can happen due to:
1. **Network timeout** - 15 second timeout is too short for slow connections
2. **Component unmounting** - Component unmounts before fetch completes
3. **AbortController** being triggered prematurely
4. **Backend taking too long** to respond

---

## ✅ Solution 1: Increase Timeout (Quick Fix)

### File: `client/frontend/App.js`

Find line ~1043 and change timeout from 15 to 30 seconds:

**Before:**
```javascript
const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
```

**After:**
```javascript
const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
```

---

## ✅ Solution 2: Add Better Error Handling

Update the fetch error handling to show more details:

**Find this code (around line 1070):**
```javascript
} catch (fetchError) {
  clearTimeout(timeoutId);
  if (fetchError.name === 'AbortError') {
    console.log('⚠️ Request timeout - slow connection');
    Alert.alert('Slow Connection', 'Request is taking longer than expected. Please check your internet connection.');
  } else {
    throw fetchError;
  }
}
```

**Replace with:**
```javascript
} catch (fetchError) {
  clearTimeout(timeoutId);
  console.log('❌ Fetch error name:', fetchError.name);
  console.log('❌ Fetch error message:', fetchError.message);
  console.log('❌ Full error:', fetchError);
  
  if (fetchError.name === 'AbortError') {
    console.log('⚠️ Request timeout - slow connection');
    // Don't show alert, just log it
  } else if (fetchError.message && fetchError.message.includes('canceled')) {
    console.log('⚠️ Fetch was canceled');
    // Retry automatically
    setTimeout(() => {
      console.log('🔄 Retrying fetch...');
      fetchCalendarWorkRequests();
    }, 2000);
  } else {
    console.log('❌ Other fetch error:', fetchError.toString());
  }
}
```

---

## ✅ Solution 3: Check Backend Performance

The backend might be slow. Let's verify:

```powershell
# Measure response time
Measure-Command { 
  curl.exe http://10.125.109.150:8000/api/v1/jobs/work-requests/client/ `
    -H "Authorization: Bearer YOUR_TOKEN" `
    -H "Content-Type: application/json"
}
```

If it takes more than 5 seconds, the backend needs optimization.

---

## ✅ Solution 4: Add Retry Logic

Add automatic retry for failed requests:

```javascript
const fetchCalendarWorkRequests = async (retryCount = 0) => {
  const MAX_RETRIES = 3;
  
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const token = await AsyncStorage.getItem('access_token');
    
    console.log(`📅 Client Calendar: Fetching all work requests... (Attempt ${retryCount + 1})`);
    
    if (token) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      try {
        const response = await fetch(
          'http://10.125.109.150:8000/api/v1/jobs/work-requests/client/',
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
          }
        );
        
        clearTimeout(timeoutId);
        
        const data = await response.json();
        console.log('📅 Client Calendar API Response:', data);
        
        if (data.success) {
          // ... existing code to process data ...
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (retryCount < MAX_RETRIES && 
            (fetchError.name === 'AbortError' || 
             fetchError.message?.includes('canceled'))) {
          console.log(`🔄 Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
          return fetchCalendarWorkRequests(retryCount + 1);
        }
        
        throw fetchError;
      }
    }
  } catch (error) {
    console.log('❌ Error fetching calendar work requests:', error);
  }
};
```

---

## ✅ Solution 5: Check Network Connection

The phone might have connection issues. Add network check:

```javascript
import NetInfo from '@react-native-community/netinfo';

const fetchCalendarWorkRequests = async () => {
  try {
    // Check network first
    const netInfo = await NetInfo.fetch();
    
    if (!netInfo.isConnected) {
      console.log('❌ No network connection');
      Alert.alert('No Connection', 'Please check your internet connection');
      return;
    }
    
    console.log('📡 Network:', netInfo.type, netInfo.isConnected);
    
    // ... rest of fetch code ...
  } catch (error) {
    console.log('❌ Error:', error);
  }
};
```

---

## 🧪 Testing Steps

### Step 1: Clear Cache
```powershell
cd d:\capstone\client\frontend
npm start -- --clear
```

### Step 2: Check Backend Logs
In backend terminal, watch for incoming requests:
```
GET /api/v1/jobs/work-requests/client/
```

### Step 3: Test with Postman/curl
Get a valid token and test:
```bash
# Get user's token (check AsyncStorage or login response)
curl -X GET http://10.125.109.150:8000/api/v1/jobs/work-requests/client/ \
  -H "Authorization: Bearer YOUR_ACTUAL_TOKEN" \
  -H "Content-Type: application/json"
```

### Step 4: Check Phone Network
- Ensure phone and computer are on same WiFi
- Check if `10.125.109.150:8000` is accessible from phone
- Try opening `http://10.125.109.150:8000/admin` in phone browser

---

## 🐛 Common Causes

### 1. Backend Not Running
```powershell
cd d:\capstone\backend
.\venv\Scripts\Activate.ps1
python manage.py runserver 10.125.109.150:8000
```

### 2. Firewall Blocking
Windows Firewall might block port 8000:
- Add exception for Python
- Or temporarily disable firewall for testing

### 3. IP Address Changed
Computer's IP might have changed from `10.125.109.150`:
```powershell
ipconfig | findstr IPv4
```

Update IP in client app's API configuration.

### 4. Token Expired
The access token might be expired. Check token expiry:
```javascript
// Add logging in App.js
const token = await AsyncStorage.getItem('access_token');
console.log('🔑 Token:', token ? token.substring(0, 20) + '...' : 'null');
```

Re-login if token is expired.

---

## 📊 Quick Diagnosis

Run this in client to see what's happening:

```javascript
// Add more detailed logging
console.log('📡 Attempting fetch to:', 'http://10.125.109.150:8000/api/v1/jobs/work-requests/client/');
console.log('🔑 Token exists:', !!token);
console.log('📱 Starting fetch...');

const startTime = Date.now();
const response = await fetch(...);
console.log(`⏱️ Fetch took: ${Date.now() - startTime}ms`);
```

---

## ✅ Expected Behavior

After fixing:
```
LOG 📅 Client Calendar: Fetching all work requests...
LOG 📅 Client Calendar API Response: {success: true, total: X, work_requests: [...]}
LOG 📅 Work requests found: X
LOG 📅 Converted to calendar bookings: X bookings
```

---

## 🚀 Recommended Fix

1. **Increase timeout to 30 seconds**
2. **Add retry logic** (3 attempts)
3. **Remove Alert** for timeout (just retry silently)
4. **Add better logging** to see exact error

This should fix the "Fetch request has been canceled" error!
