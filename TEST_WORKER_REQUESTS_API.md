# Test Worker Requests API

## Quick Test

### Step 1: Get Sam's Access Token

In the worker app after logging in as sam@gmail.com, check AsyncStorage for the token or check the login response.

### Step 2: Test API Manually

Use curl or Postman:

```bash
curl -X GET "http://192.168.1.4:8000/api/v1/jobs/work-requests/worker/" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "success": true,
  "total": 1,
  "work_requests": [
    {
      "id": "49bc9944-9e97-4022-884f-604aa4819851",
      "service_category": "Cook",
      "status": "REQUESTED",
      "client_name": "siya",
      ...
    }
  ]
}
```

### Step 3: Check Worker App Logs

When you click "Work Requests" or "Client Requests" button in the worker app, you should see:

```
📡 Fetching worker requests from: http://192.168.1.4:8000/api/v1/jobs/work-requests/worker/?status=REQUESTED
📦 Worker requests response: {...}
```

If you DON'T see these logs, the screen is not being rendered or the useEffect is not running.

### Step 4: Verify Navigation

1. **Login as Sam** in worker app
2. **Go to Home Screen**
3. **Click "Work Requests"** button (should say "2 Client" or similar)
4. **Should navigate to** `WorkRequestsScreen`
5. **Should see** the request from siya

### Troubleshooting

#### If no logs appear:
- The navigation to "requests" screen might not be working
- Check if `screen === "requests"` condition is met in App.js

#### If API returns empty:
- Sam's worker_profile_id might not match
- Check Sam's worker profile: `367cc252-d60c-41cc-9973-3dd699649c3f`
- Check work_request worker_id in database

#### If API returns error:
- Token might be expired
- Worker profile doesn't exist
- Check backend logs for the GET request

### Debug Steps

Add this to WorkRequestsScreen.js fetchRequests function (line ~50):

```javascript
console.log('🔑 Token:', token ? 'EXISTS' : 'MISSING');
console.log('📡 Request URL:', url);
console.log('🆔 Worker ID from backend:', '<check backend logs>');
```

Then check:
1. Worker app console logs
2. Backend terminal logs
3. Database work_requests table

### Expected Backend Log

When worker app calls the API, you should see in backend:

```
[22/Aug/2026 23:XX:XX] "GET /api/v1/jobs/work-requests/worker/?status=REQUESTED HTTP/1.1" 200 XXX
```

If you see a 403 or 404, there's an auth/permission issue.
If you don't see this log at all, the app isn't making the request.

### Quick Database Check

```sql
SELECT 
    wr.id,
    wr.service_category,
    wr.status,
    wr.worker_id,
    wp.user_id as worker_user_id,
    u.email as worker_email
FROM work_requests wr
JOIN worker_profiles wp ON wr.worker_id = wp.id
JOIN users u ON wp.user_id = u.id
WHERE u.email = 'sam@gmail.com';
```

This should return the request sent to Sam.
