# Persistence Fixes - Testing Plan

## Changes Made

### 1. Database Schema
- Created migration script: `scripts/002_add_day_metadata.sql`
- Adds `title` and `day_of_week` columns to `days` table
- **ACTION REQUIRED**: Run this migration in Supabase dashboard SQL editor

### 2. Service Layer (lib/services/trip-service.ts)
- `addFlight()`: Now returns Flight with DB-generated UUID
- `saveDayActivities()`: Now returns activities array with DB-generated UUIDs
- `transformActivityToDb()`: Removed `id` field (let DB auto-generate)
- `transformFlightToDb()`: Conditionally includes `id` only for updates
- `transformHotelToDb()`: Added `destination` field

### 3. Frontend Logic (app/page.tsx)
- `handleUploadBooking`: Creates flight without ID, uses DB-returned flight with UUID
- `handleAddActivity`: Strips temporary ID, uses DB-returned activities with UUIDs

### 4. Type Definitions (lib/trip-data.ts)
- Added `id: string` to Hotel interface
- Added `notes?: string` to Hotel interface

## Testing Checklist

### Pre-Test Setup
- [ ] Run migration script in Supabase SQL editor
- [ ] Verify `days` table has `title` and `day_of_week` columns
- [ ] Clear browser cache (Cmd+Shift+Delete)
- [ ] Open browser DevTools Console

### Test 1: Flight Upload & Persistence
**Goal**: Verify flights persist with DB-generated UUIDs

1. [ ] Navigate to http://localhost:3001
2. [ ] Click "Upload Booking" button
3. [ ] Select "Flight" tab
4. [ ] Fill in flight details:
   - Airline: "United"
   - Flight Number: "UA123"
   - From: "San Francisco" / Code: "SFO"
   - To: "New York" / Code: "JFK"
   - Departure Date: (select any date)
   - Departure Time: "10:00 AM"
   - Arrival Time: "6:00 PM"
5. [ ] Click "Save Booking"
6. [ ] **Check Console**: Look for log message:
   ```
   [v0] Flight added to Supabase with ID: <UUID>
   ```
7. [ ] Verify UUID format (e.g., `a1b2c3d4-e5f6-...`) NOT `flight-1234567890`
8. [ ] Verify flight appears in Flights panel
9. [ ] **Hard Refresh**: Press Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
10. [ ] **CRITICAL**: Verify flight still appears after refresh
11. [ ] Check Supabase `flights` table - verify record exists with same UUID

**Expected Results**:
✅ Console shows UUID (not `flight-${timestamp}`)
✅ Flight persists after hard refresh
✅ Supabase table has matching UUID

**Failure Symptoms**:
❌ Console shows `flight-1705700000000` format
❌ Flight disappears after refresh
❌ Error: "Flight not found" in console

### Test 2: Restaurant Booking & Persistence
**Goal**: Verify activities persist with DB-generated UUIDs

1. [ ] Click "Upload Booking" button
2. [ ] Select "Restaurant" tab
3. [ ] Fill in restaurant details:
   - Name: "The French Laundry"
   - Date: (select a date that matches an existing day in itinerary)
   - Time: "7:00 PM"
   - Address: "6640 Washington St, Yountville, CA"
   - Confirmation Number: "RES123"
4. [ ] Click "Save Booking"
5. [ ] **Check Console**: Look for log message:
   ```
   [v0] Activities saved to Supabase, count: <number>
   ```
6. [ ] Verify restaurant appears in the day's itinerary
7. [ ] **Hard Refresh**: Press Cmd+Shift+R
8. [ ] **CRITICAL**: Verify restaurant still appears after refresh
9. [ ] Check Supabase `activities` table - verify record exists

**Expected Results**:
✅ Restaurant appears in correct day
✅ Activity persists after hard refresh
✅ Supabase `activities` table has record with UUID

**Failure Symptoms**:
❌ Activity disappears after refresh
❌ Error: "Cannot add activity: day has no ID"
❌ Restaurant appears with `activity-${timestamp}` ID

### Test 3: Update Existing Flight
**Goal**: Verify flight updates don't lose database connection

1. [ ] Find an existing flight in Flights panel
2. [ ] Note its current details
3. [ ] Upload a new booking with matching flight number and route
4. [ ] Confirm replacement when prompted
5. [ ] **Check Console**: Look for:
   ```
   [v0] Flight updated in Supabase
   ```
6. [ ] Verify updated details appear
7. [ ] **Hard Refresh**: Press Cmd+Shift+R
8. [ ] Verify updates persisted

**Expected Results**:
✅ Flight updates successfully
✅ Changes persist after refresh

### Test 4: Tour Booking & Persistence
**Goal**: Verify tour activities work same as restaurants

1. [ ] Click "Upload Booking"
2. [ ] Select "Tour" tab
3. [ ] Fill in tour details:
   - Name: "Alcatraz Island Tour"
   - Date: (select matching day)
   - Time: "2:00 PM"
   - Duration: "3 hours"
   - Meeting Point: "Pier 33, San Francisco"
   - Confirmation: "TOUR456"
4. [ ] Save and verify appears in itinerary
5. [ ] **Hard Refresh**
6. [ ] Verify tour persists

**Expected Results**:
✅ Tour appears in correct day
✅ Persists after refresh

### Test 5: Database ID Verification
**Goal**: Confirm all IDs in frontend match database IDs

1. [ ] Open browser DevTools Console
2. [ ] Run this command:
   ```javascript
   console.log('Flights:', window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.get(1)?.getFiberRoots()?.values().next().value?.current?.child?.memoizedState?.memoizedState[0]?.flightsList)
   ```
3. [ ] Copy flight IDs from console
4. [ ] Open Supabase dashboard
5. [ ] Query: `SELECT id FROM flights WHERE trip_id = '<your-trip-id>'`
6. [ ] **CRITICAL**: Verify IDs match exactly

**Expected Results**:
✅ All IDs in frontend match Supabase IDs
✅ All IDs are UUIDs (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

**Failure Symptoms**:
❌ Frontend has `flight-${timestamp}` or `activity-${timestamp}` IDs
❌ Database has UUIDs but frontend has different IDs

### Test 6: Edge Cases

#### 6.1 Date Mismatch
1. [ ] Upload restaurant booking with date NOT in trip itinerary
2. [ ] Verify alert: "No day found for {date}"
3. [ ] Verify booking not saved

#### 6.2 Duplicate Flight Detection
1. [ ] Upload same flight twice
2. [ ] Verify prompt to replace
3. [ ] Choose "Cancel" - verify original flight unchanged

#### 6.3 Screenshot Persistence
1. [ ] Upload booking WITH screenshot
2. [ ] Verify screenshot displays
3. [ ] Hard refresh
4. [ ] Verify screenshot still displays

## Known Issues to Watch For

### Issue 1: TypeScript Errors
- Adding `id` to Hotel interface may cause errors in components
- Check FlightsPanel for Hotel-related TypeScript errors

### Issue 2: transformDay() Errors
- If migration not run, `transformDay()` will fail trying to access `dbDay.title`
- Error: "Cannot read property 'title' of undefined"
- **Fix**: Run migration script first

### Issue 3: Activities Replace All
- `saveDayActivities()` deletes ALL activities then re-inserts
- If concurrent edits happen, data loss possible
- Watch for: Activities disappearing unexpectedly

## Rollback Plan

If tests fail:

1. **Revert git changes**:
   ```bash
   git checkout -- app/page.tsx
   git checkout -- lib/services/trip-service.ts
   git checkout -- lib/trip-data.ts
   ```

2. **Rollback database**:
   ```sql
   ALTER TABLE public.days
     DROP COLUMN IF EXISTS title,
     DROP COLUMN IF EXISTS day_of_week;
   ```

## Success Criteria

All tests must pass:
- ✅ Flights persist after hard refresh with correct UUIDs
- ✅ Activities persist after hard refresh with correct UUIDs
- ✅ Frontend IDs match database IDs exactly
- ✅ No console errors during upload/refresh
- ✅ Screenshots persist correctly
- ✅ Updates work without losing database connection

## Next Steps After Testing

If all tests pass, proceed to Phase 2:
- Create unified bookings manager component
- Add conflict detection for AI itinerary
- Improve booking upload flow

If tests fail:
- Document exact failure
- Check browser console for errors
- Check Supabase logs
- Review code changes for bugs
