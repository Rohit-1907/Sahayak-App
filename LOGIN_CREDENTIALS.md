# Test Login Credentials

## Client Account
- **Email:** siya@gmail.com
- **Password:** siya
- **Name:** siya
- **User ID:** 20f2e2cc-8bb5-4076-8fcd-14d79bf9aa4d

## Worker Account  
- **Email:** sam@gmail.com
- **Password:** sam
- **Name:** Sam
- **User ID:** 33e20d20-0779-4147-bf33-7b2749800803
- **Worker Profile ID:** 367cc252-d60c-41cc-9973-3dd699649c3f
- **Service:** Cook
- **Hourly Rate:** ₹100
- **Experience:** 2 years

## Important IDs

### User IDs
- Client (siya): `20f2e2cc-8bb5-4076-8fcd-14d79bf9aa4d`
- Worker (Sam): `33e20d20-0779-4147-bf33-7b2749800803`

### Worker Profile IDs
- Sam's worker_profile_id: `367cc252-d60c-41cc-9973-3dd699649c3f` ← **Use this for work_requests API**

## API Notes

### Work Request Creation
When creating work requests, use **worker_profile_id** NOT user_id:
```json
{
  "worker_id": "367cc252-d60c-41cc-9973-3dd699649c3f"
}
```

### Worker Search Response
The search API returns:
```json
{
  "id": "367cc252-d60c-41cc-9973-3dd699649c3f",  // worker_profile_id ✅
  "user_id": "33e20d20-0779-4147-bf33-7b2749800803"  // user account ID
}
```

**Always use `id` field for booking/work requests!**
