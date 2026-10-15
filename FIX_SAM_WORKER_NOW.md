# Fix Sam's Worker Profile - Quick Guide

## Problem
Sam's Cook profile doesn't show in client app searches because GPS coordinates are NULL in database.

## Solution - 2 Steps

### Step 1: Run SQL in Supabase (5 minutes)

1. Go to: https://supabase.com/dashboard/project/lefsctqcgrgrsumkxyhz
2. Login with your Supabase account
3. Click **SQL Editor** in left sidebar
4. Open `d:\capstone\UPDATE_WORKER_COORDINATES.sql` in VS Code
5. Copy ALL the SQL
6. Paste into Supabase SQL Editor
7. Click **Run** button
8. You should see 4 query results:
   - Sam's credentials (username, email, phone)
   - Update confirmation
   - Verification showing coordinates saved
   - Search test showing Sam appears in results

### Step 2: Test in Client App (2 minutes)

1. Open client app on your Android device
2. Login as: siya@gmail.com
3. Search for service: **Cook**
4. **Sam's profile should now appear!** ✅

## What the SQL Does

1. **Gets login info** for Sam (username, email, phone)
2. **Updates coordinates** to Alandi, Pune (18.6771, 73.8978)
3. **Verifies** coordinates are saved
4. **Tests search** to confirm Sam appears in Cook search

## Code Fix Applied

Also fixed worker registration code so **future workers will save GPS coordinates automatically**.

**File changed:** `d:\capstone\worker\frontend\App.js`
- Added `primaryLocation` to registration API payload

## Sam's Location
- **Area:** Alandi, Pune, Maharashtra
- **Coordinates:** 18.6771, 73.8978
- **Distance from Pune center:** ~17.4 km (within 20km search radius)

## If Sam's Login Doesn't Work

The SQL will show Sam's username/email/phone. Password is hashed and can't be retrieved.

**Option 1:** Remember the password you used during registration
**Option 2:** Reset password via Django admin or backend API

## After SQL Update

Sam's profile will appear when searching for "Cook" in:
- Client app service search
- Within 20km of Pune
- Shows as available worker

## Need Help?

If Sam still doesn't appear after SQL update:
1. Check SQL output - did coordinates save?
2. Check `is_available = true` in database
3. Check `service_categories` includes "Cook"
4. Check client app search location (should be ~18.5204, 73.8567)
