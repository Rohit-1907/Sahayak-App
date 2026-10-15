# Database Schema Fix - Foreign Key Constraints

## Problem
The `work_requests` table was created with **incorrect foreign key constraints**:

```sql
-- ❌ WRONG (current state)
client_id UUID REFERENCES users(id)        -- Should reference customer_profiles
worker_id UUID REFERENCES users(id)        -- Should reference worker_profiles
```

This causes errors like:
```
Key (worker_id)=(367cc252...) is not present in table "users"
```

## Why This is Wrong
- Django models use `CustomerProfile` and `WorkerProfile` models
- `worker_id` should reference `worker_profiles.id` (UUID of worker profile)
- `client_id` should reference `customer_profiles.id` (UUID of customer profile)
- Both profile tables have their own UUIDs separate from `users.id`

## Database Schema
```
users (SahayakUser)
  ↓ (one-to-one)
customer_profiles
  ├─ id (UUID) ← work_requests.client_id should reference THIS
  └─ user_id (FK to users)

users (SahayakUser)
  ↓ (one-to-one)
worker_profiles
  ├─ id (UUID) ← work_requests.worker_id should reference THIS
  └─ user_id (FK to users)
```

## Solution

### Step 1: Connect to Supabase Database

**Option A: Using Supabase Dashboard**
1. Go to: https://supabase.com/dashboard/project/lefsctqcgrgrsumkxyhz
2. Click "SQL Editor" in left sidebar
3. Copy and paste the fix script (next step)
4. Click "Run"

**Option B: Using psql Command Line**
```powershell
# Connection string from database.txt
psql "postgresql://postgres:rscapstone2027@db.lefsctqcgrgrsumkxyhz.supabase.co:5432/postgres"
```

### Step 2: Run Fix Script

Copy and paste this into SQL Editor:

```sql
-- ========================================
-- FIX: Correct foreign key constraints
-- ========================================

BEGIN;

-- Drop incorrect constraints
ALTER TABLE work_requests DROP CONSTRAINT IF EXISTS work_requests_worker_id_fkey;
ALTER TABLE work_requests DROP CONSTRAINT IF EXISTS work_requests_client_id_fkey;

-- Add correct constraints
ALTER TABLE work_requests 
    ADD CONSTRAINT work_requests_client_id_fkey 
    FOREIGN KEY (client_id) 
    REFERENCES customer_profiles(id) 
    ON DELETE CASCADE;

ALTER TABLE work_requests 
    ADD CONSTRAINT work_requests_worker_id_fkey 
    FOREIGN KEY (worker_id) 
    REFERENCES worker_profiles(id) 
    ON DELETE CASCADE;

COMMIT;

-- Verify
SELECT 
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS references_table
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='work_requests';
```

### Step 3: Verify Fix

Expected output after running verification query:
```
constraint_name                    | column_name | references_table
-----------------------------------+-------------+------------------
work_requests_client_id_fkey       | client_id   | customer_profiles
work_requests_worker_id_fkey       | worker_id   | worker_profiles
```

✅ Both should reference profile tables, NOT users table!

### Step 4: Test the Application

1. **Clear app cache** (logout/login or clear AsyncStorage)
2. **Login as:** siya@gmail.com / siya
3. **Search for:** Cook service
4. **Click on:** Sam
5. **Request Worker → Confirm & Book**
6. **Expected:** Success! ✅

## What Was Fixed

| Item | Before | After |
|------|--------|-------|
| `client_id` FK | `users(id)` ❌ | `customer_profiles(id)` ✅ |
| `worker_id` FK | `users(id)` ❌ | `worker_profiles(id)` ✅ |
| Error | Foreign key violation | Success! |

## Files Updated

1. ✅ `FIX_WORK_REQUESTS_FOREIGN_KEYS.sql` - Fix script
2. ✅ `CREATE_WORK_REQUESTS_TABLE.sql` - Updated for future deployments
3. ✅ `DATABASE_SCHEMA_FIX_INSTRUCTIONS.md` - This document

## Why This Happened

The original SQL file (`CREATE_WORK_REQUESTS_TABLE.sql`) was created before the profile architecture was fully understood. It referenced `users` table directly, but Django uses separate profile tables for customers and workers.

## Impact

**Before Fix:**
- ❌ Work requests fail to create
- ❌ Foreign key errors
- ❌ Database constraints violated

**After Fix:**
- ✅ Work requests create successfully
- ✅ Correct references to profile tables
- ✅ Matches Django model structure
- ✅ Full booking flow works end-to-end

## Related Tables

```sql
-- Customer flow
users (SahayakUser)
  ↓
customer_profiles
  ↓
work_requests (as client_id)

-- Worker flow  
users (SahayakUser)
  ↓
worker_profiles
  ↓
work_requests (as worker_id)
```

## Next Steps After Fix

1. ✅ Run the fix script in Supabase
2. ✅ Clear app cache
3. ✅ Login fresh
4. ✅ Test booking flow
5. ✅ Verify data in database

All booking operations should now work correctly!
