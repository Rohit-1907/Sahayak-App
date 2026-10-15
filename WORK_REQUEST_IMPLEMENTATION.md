# Work Request System Implementation Guide

## Overview

This document describes the complete implementation of the client-to-worker request flow as specified in the requirements.

## Database Schema

### Table: `work_requests`

The core table for direct client-to-worker requests with simplified status flow.

#### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `client_id` | UUID | Foreign key to users (customer profile) |
| `worker_id` | UUID | Foreign key to users (worker profile) |
| `service_category` | VARCHAR(100) | Service type (Cook, Mason, etc.) |
| `title` | VARCHAR(200) | Optional request title |
| `description` | TEXT | Work description |
| `work_address` | TEXT | Full address where work will be done |
| `work_latitude` | DOUBLE | Latitude of work location |
| `work_longitude` | DOUBLE | Longitude of work location |
| `required_date` | DATE | Date work is needed |
| `required_time` | TIME | Time work is needed |
| `number_of_workers` | INTEGER | Number of workers needed (default: 1) |
| `estimated_budget` | DECIMAL(10,2) | Optional budget estimate |
| `status` | VARCHAR(20) | Current status (see below) |
| `created_at` | TIMESTAMPTZ | When request was created |
| `updated_at` | TIMESTAMPTZ | When request was last updated |
| `accepted_at` | TIMESTAMPTZ | When worker accepted |
| `rejected_at` | TIMESTAMPTZ | When worker rejected |
| `cancelled_at` | TIMESTAMPTZ | When client cancelled |
| `completed_at` | TIMESTAMPTZ | When work was completed |
| `rejection_reason` | TEXT | Why worker rejected |
| `cancellation_reason` | TEXT | Why client cancelled |

#### Status Flow

```
REQUESTED (initial)
    │
    ├──────→ SCHEDULED (worker accepts)
    │
    ├──────→ REJECTED (worker rejects)
    │
    └──────→ CANCELLED (client cancels)

SCHEDULED
    │
    ├──────→ COMPLETED (work done)
    │
    └──────→ CANCELLED (client cancels)
```

**Status Values:**
- `REQUESTED` - Initial state when client creates request
- `SCHEDULED` - Worker has accepted the request
- `REJECTED` - Worker has rejected the request
- `CANCELLED` - Client has cancelled the request
- `COMPLETED` - Work has been completed

**Invalid Transitions (prevented):**
- `REJECTED` → `SCHEDULED`
- `SCHEDULED` → `REQUESTED`
- `COMPLETED` → `REQUESTED`
- `COMPLETED` → `SCHEDULED`

## Backend API Endpoints

### Base URL
```
http://192.168.1.4:8000/api/v1/jobs/
```

### 1. Create Work Request

**Endpoint:** `POST /work-requests/create/`

**Authentication:** Required (Client)

**Request Body:**
```json
{
  "worker_id": "uuid",
  "service_category": "Cook",
  "title": "Need cook for party",
  "description": "Need an experienced cook for a family gathering",
  "work_address": "123 Main St, Pune, Maharashtra",
  "work_latitude": 18.5204,
  "work_longitude": 73.8567,
  "required_date": "2026-08-25",
  "required_time": "10:00",
  "number_of_workers": 1,
  "estimated_budget": 1000.00
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Work request created successfully",
  "work_request": {
    "id": "uuid",
    "client": "uuid",
    "worker": "uuid",
    "service_category": "Cook",
    "status": "REQUESTED",
    "created_at": "2026-08-21T10:00:00Z",
    ...
  }
}
```

### 2. List Client's Requests

**Endpoint:** `GET /work-requests/client/?status=REQUESTED`

**Authentication:** Required (Client)

**Query Parameters:**
- `status` (optional): Filter by status (REQUESTED, SCHEDULED, REJECTED, etc.)

**Response (200 OK):**
```json
{
  "success": true,
  "total": 5,
  "work_requests": [
    {
      "id": "uuid",
      "worker_name": "Sam",
      "service_category": "Cook",
      "status": "REQUESTED",
      "required_date": "2026-08-25",
      ...
    }
  ]
}
```

### 3. List Worker's Requests

**Endpoint:** `GET /work-requests/worker/?status=REQUESTED`

**Authentication:** Required (Worker)

**Query Parameters:**
- `status` (optional): Filter by status

**Response (200 OK):**
```json
{
  "success": true,
  "total": 3,
  "work_requests": [
    {
      "id": "uuid",
      "client_name": "Siya",
      "service_category": "Cook",
      "status": "REQUESTED",
      "work_address": "123 Main St, Pune",
      "required_date": "2026-08-25",
      "required_time": "10:00",
      ...
    }
  ]
}
```

### 4. Get Request Details

**Endpoint:** `GET /work-requests/<uuid>/`

**Authentication:** Required (Client or Worker)

**Response (200 OK):**
```json
{
  "success": true,
  "work_request": {
    "id": "uuid",
    "client": "uuid",
    "client_name": "Siya",
    "worker": "uuid",
    "worker_name": "Sam",
    "service_category": "Cook",
    "description": "...",
    "work_address": "...",
    "status": "REQUESTED",
    ...
  }
}
```

### 5. Worker Accept/Reject Request

**Endpoint:** `POST /work-requests/<uuid>/action/`

**Authentication:** Required (Worker)

**Request Body (Accept):**
```json
{
  "action": "accept"
}
```

**Request Body (Reject):**
```json
{
  "action": "reject",
  "reason": "Not available on that date"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Work request accepted successfully",
  "work_request": {
    "id": "uuid",
    "status": "SCHEDULED",
    "accepted_at": "2026-08-21T10:05:00Z",
    ...
  }
}
```

## Row Level Security (RLS)

The following RLS policies are implemented:

### Clients
- **View**: Can view their own requests only
- **Create**: Can create requests (must set themselves as client)
- **Update**: Can update (cancel) their own requests in REQUESTED or SCHEDULED status

### Workers
- **View**: Can view requests assigned to them only
- **Update**: Can update (accept/reject) requests assigned to them in REQUESTED status only

## Setup Instructions

### 1. Database Setup

Run the SQL script to create the table:

```bash
# Open Supabase SQL Editor
# Run: d:\capstone\CREATE_WORK_REQUESTS_TABLE.sql
```

This will:
- Create `work_requests` table
- Add indexes for performance
- Set up RLS policies
- Create updated_at trigger

### 2. Backend Migration

```bash
cd d:\capstone\backend
python manage.py makemigrations
python manage.py migrate
```

### 3. Verify Setup

Check Django admin at: `http://192.168.1.4:8000/admin/jobs/workrequest/`

## Integration with Frontend

### Client App

#### 1. Update Bookworkerscreen.js

The booking screen already has API integration. Update the endpoint:

```javascript
// Change from:
`${API_URL}/api/v1/users/work-requests/create/`

// To:
`${API_URL}/api/v1/jobs/work-requests/create/`
```

Also update the payload format to match the new API.

#### 2. Add Request Status Screen

Create a new screen to show client's requests with status updates.

#### 3. Implement Status Sync

Use polling or Supabase realtime to keep status in sync.

### Worker App

#### 1. Create Requests Screen

Display incoming requests with:
- Service details
- Client information
- Work location & schedule
- Accept/Reject buttons

#### 2. Implement Accept/Reject Actions

Call the `/action/` endpoint when worker clicks buttons.

#### 3. Show Request Status

Display color-coded status badges:
- 🟡 REQUESTED (yellow/pending)
- 🟢 SCHEDULED (green/accepted)
- 🔴 REJECTED (red)
- ⚪ CANCELLED (gray)

## Security Considerations

### Authentication
- All endpoints require valid JWT token
- Token must be sent in Authorization header

### Authorization
- Clients can only create requests with themselves as client
- Workers can only accept/reject requests assigned to them
- Users cannot view other users' requests

### Data Validation
- Required fields are enforced
- Status transitions are validated
- Latitude/longitude format is validated
- Dates are validated (not in past)

## Testing

### Test Accounts

Create two test accounts:

**Client:**
- Email: client@test.com
- Password: Test@123

**Worker:**
- Email: worker@test.com
- Password: Test@123
- Service: Cook

### Test Scenarios

#### Scenario 1: Complete Flow
1. Client creates request for worker
2. Verify status = REQUESTED in both apps
3. Worker accepts request
4. Verify status = SCHEDULED in both apps

#### Scenario 2: Rejection
1. Client creates request
2. Worker rejects with reason
3. Verify status = REJECTED in both apps

#### Scenario 3: Cancellation
1. Client creates request
2. Client cancels before worker responds
3. Verify status = CANCELLED

## Next Steps

1. ✅ Database table created
2. ✅ Backend API implemented
3. ⏳ Update client app booking screen
4. ⏳ Create worker request list screen
5. ⏳ Implement accept/reject UI
6. ⏳ Add status synchronization
7. ⏳ Remove hardcoded data
8. ⏳ Add push notifications (optional)

## Files Created/Modified

### Backend
- ✅ `jobs/models.py` - Added WorkRequest model
- ✅ `jobs/serializers.py` - Added WorkRequest serializers
- ✅ `jobs/views.py` - Added API endpoints
- ✅ `jobs/urls.py` - Added URL patterns
- ✅ `jobs/admin.py` - Added admin interface
- ✅ `jobs/migrations/0002_workrequest.py` - Database migration

### SQL
- ✅ `CREATE_WORK_REQUESTS_TABLE.sql` - Direct Supabase setup

### Documentation
- ✅ `WORK_REQUEST_IMPLEMENTATION.md` - This file

## Support

For issues or questions, check:
1. Django logs: `python manage.py runserver`
2. Supabase logs in dashboard
3. Frontend console logs
4. Network tab for API responses

