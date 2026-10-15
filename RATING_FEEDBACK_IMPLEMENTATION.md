# Rating & Feedback System Implementation

## ✅ Complete Implementation Summary

### Frontend (Client App)

**File:** `client/frontend/screens/Bookingsummary.js`

**New Features:**
1. **Rating Card** - Appears only when booking status is "COMPLETED"
   - 5-star rating system (tap to select)
   - Required feedback text area
   - Submit button with loading state
   - Thank you message after successful submission

2. **State Management:**
   - `rating` - Selected star rating (1-5)
   - `feedback` - Customer feedback text
   - `submittingRating` - Loading state during submission
   - `hasRated` - Tracks if rating already submitted

3. **Validation:**
   - Rating must be 1-5 stars
   - Feedback text is required
   - Button disabled until both provided

4. **UI Components:**
   - Interactive star buttons (filled/outline based on selection)
   - Rating quality label (Poor, Fair, Good, Very Good, Excellent)
   - Multi-line feedback input
   - Styled submit button with activity indicator
   - Success card with checkmark icon

### Backend API

**File:** `backend/jobs/views.py`

**New Endpoint:** `POST /api/v1/jobs/work-requests/{request_id}/rate/`

**Functionality:**
1. **Authentication & Authorization:**
   - Only authenticated clients can rate
   - Clients can only rate their own work requests
   - Work request must be "COMPLETED" status

2. **Validation:**
   - Rating: integer 1-5
   - Feedback: non-empty string
   - Request must belong to the client

3. **Database Updates:**
   - Stores rating, feedback, and rated_at timestamp in WorkRequest
   - Calculates worker's new average rating
   - Updates WorkerProfile.average_rating automatically

4. **Rating Calculation:**
   - Fetches all completed work requests with ratings for the worker
   - Calculates average rating
   - Rounds to 2 decimal places
   - Updates worker profile instantly

**Request Format:**
```json
{
  "rating": 5,
  "feedback": "Excellent service! Very professional and completed the work on time."
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Rating submitted successfully",
  "work_request": { ... },
  "worker_average_rating": 4.75
}
```

### Database Changes

**File:** `backend/jobs/models.py`

**WorkRequest Model - New Fields:**
```python
rating = models.IntegerField(null=True, blank=True, choices=[(i, i) for i in range(1, 6)])
feedback = models.TextField(blank=True)
rated_at = models.DateTimeField(null=True, blank=True)
```

**Migration:** `jobs/migrations/0004_rename_work_reques_client__idx_work_reques_client__60cd86_idx_and_more.py`

**SQL Script:** `backend/add_rating_fields.sql`
```sql
ALTER TABLE work_requests 
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS feedback TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS rated_at TIMESTAMP WITH TIME ZONE;
```

### URL Configuration

**File:** `backend/jobs/urls.py`

**New Route:**
```python
path('work-requests/<uuid:request_id>/rate/', rate_work_request, name='rate-work-request'),
```

## How It Works

### User Flow:
1. **Customer completes a booking** → Status changes to "COMPLETED"
2. **Rating card appears** on booking details page
3. **Customer taps stars** to select rating (1-5)
4. **Customer writes feedback** in text area
5. **Customer taps "Submit Rating"** button
6. **Frontend validates** and sends POST request to backend
7. **Backend validates** permissions and data
8. **Backend stores** rating/feedback in work_request
9. **Backend calculates** worker's new average rating
10. **Backend updates** worker_profile.average_rating
11. **Success message** shows to customer
12. **Thank you card** replaces rating card

### Worker Profile Impact:
- Worker's average rating updates immediately
- Rating visible in worker profile (`worker/frontend/screen/profile.js`)
- Shows "N/A" if no ratings yet
- Shows actual average (e.g., "4.5") once rated
- Displayed in format: `rating.toFixed(1)` for consistency

## To Run:

### 1. Apply Database Migration:
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python manage.py migrate jobs
```

Or manually run SQL:
```bash
psql -U postgres -d sahayak_db -f add_rating_fields.sql
```

### 2. Restart Backend:
```bash
python manage.py runserver
```

### 3. Test Frontend:
```bash
cd client/frontend
npm start
```

## Testing Checklist:

- [ ] Complete a booking (mark as COMPLETED)
- [ ] Rating card appears on booking details page
- [ ] Tap stars to select rating
- [ ] Enter feedback text
- [ ] Submit button enables when both filled
- [ ] Rating submits successfully
- [ ] Thank you message appears
- [ ] Worker's average rating updates
- [ ] Worker profile shows correct rating
- [ ] Cannot rate same booking twice
- [ ] Cannot rate without feedback
- [ ] Cannot rate if not completed

## Future Enhancements:

1. **Rating History:**
   - View all ratings given by customer
   - View all ratings received by worker

2. **Reply to Feedback:**
   - Allow workers to respond to customer feedback

3. **Rating Filters:**
   - Filter workers by minimum rating
   - Sort by highest rated

4. **Rating Analytics:**
   - Rating trends over time
   - Category-specific ratings (quality, punctuality, professionalism)

5. **Moderation:**
   - Flag inappropriate feedback
   - Admin review system

## Database Schema:

```
work_requests:
  - id (UUID, PK)
  - client_id (FK → customer_profiles)
  - worker_id (FK → worker_profiles)
  - service_category (VARCHAR)
  - status (VARCHAR)
  - ... (other fields)
  ✨ rating (INTEGER, 1-5, nullable)
  ✨ feedback (TEXT, nullable)
  ✨ rated_at (TIMESTAMP, nullable)

worker_profiles:
  - id (UUID, PK)
  - user_id (FK → sahayak_users)
  - average_rating (DECIMAL, default 0.0) ← Updates automatically
  - total_jobs_completed (INTEGER)
  - ... (other fields)
```

## API Endpoints:

### Rate Work Request
```
POST /api/v1/jobs/work-requests/{request_id}/rate/
Authorization: Bearer {access_token}
Content-Type: application/json

Body:
{
  "rating": 5,
  "feedback": "Great work!"
}

Response:
{
  "success": true,
  "message": "Rating submitted successfully",
  "work_request": {...},
  "worker_average_rating": 4.75
}
```

## Notes:

- Rating is optional until submitted
- Once submitted, cannot be changed (in current implementation)
- Worker sees updated average rating immediately
- Ratings affect worker visibility/ranking in search results
- Feedback is visible to worker (future feature to display)
- System prevents rating REQUESTED/SCHEDULED/REJECTED bookings
- Only COMPLETED bookings can be rated

---

**Implementation Date:** 2026-08-22
**Status:** ✅ Complete and Ready for Testing
