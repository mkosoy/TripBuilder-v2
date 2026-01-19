# Edge Cases - Testing Checklist

## Critical ID Persistence Edge Cases

### Test Case 1: Multiple Rapid Uploads
**Scenario**: User uploads multiple bookings in quick succession
**Steps**:
1. Upload flight A
2. Immediately upload flight B (before page updates)
3. Immediately upload restaurant C
**Expected**: All 3 bookings appear with unique UUIDs
**Failure Mode**: IDs collide if timestamps used instead of UUIDs

### Test Case 2: Upload During Network Lag
**Scenario**: Slow network causes delayed DB response
**Steps**:
1. Throttle network to "Slow 3G" in DevTools
2. Upload a flight
3. **Do NOT refresh** until console shows success
4. Then hard refresh
**Expected**: Flight persists with correct UUID
**Failure Mode**: Frontend uses temporary ID before DB response arrives

### Test Case 3: Concurrent Edits to Same Day
**Scenario**: Two users edit same day's activities simultaneously
**Steps**:
1. Open app in two browser windows
2. In Window 1: Add restaurant to Day 3
3. In Window 2: Add tour to Day 3 (before refreshing)
4. Refresh both windows
**Expected**: Both activities appear (last write wins)
**Failure Mode**: One activity lost due to race condition
**NOTE**: This is a known limitation - `saveDayActivities` deletes ALL then re-inserts

### Test Case 4: Upload While Offline
**Scenario**: User uploads booking with no internet
**Steps**:
1. Disable network in DevTools
2. Try to upload a flight
3. Re-enable network
**Expected**: Clear error message, booking not saved
**Failure Mode**: Frontend shows success but DB never got data

## Data Integrity Edge Cases

### Test Case 5: Duplicate Flight Detection
**Scenario**: User uploads exact same flight twice
**Steps**:
1. Upload flight: UA123, SFO→JFK, 2026-02-07
2. Upload same flight again
**Expected**: Prompt asks to replace existing flight
**Failure Mode**: Creates duplicate flights with different IDs

### Test Case 6: Update Flight Mid-Upload
**Scenario**: User starts upload while another flight is being added
**Steps**:
1. Start uploading flight A (slow network)
2. Before it completes, upload matching flight B
**Expected**: Second upload detects first flight and prompts to replace
**Failure Mode**: Both flights created, or update fails with "not found"

### Test Case 7: Screenshot Upload Fails
**Scenario**: Image too large or invalid format
**Steps**:
1. Upload booking with 20MB PNG file
2. Check if booking saves without screenshot
**Expected**: Error message about file size, booking not saved
**Failure Mode**: Booking saves but screenshot is broken/missing

### Test Case 8: Invalid Date Format
**Scenario**: AI extraction returns malformed date
**Steps**:
1. Upload screenshot with ambiguous date (e.g., "2/3/26")
2. Check if date gets parsed correctly
**Expected**: Date defaults to empty or shows validation error
**Failure Mode**: Booking saves with wrong date (Feb 3 vs Mar 2)

## Database Schema Edge Cases

### Test Case 9: Missing Day ID
**Scenario**: Day loaded from DB without ID
**Steps**:
1. Manually remove ID from a day in Supabase
2. Try to add activity to that day
**Expected**: Clear error: "Cannot add activity: day has no ID"
**Failure Mode**: Silent failure or crash

### Test Case 10: Missing Trip ID
**Scenario**: No trip exists in database
**Steps**:
1. Clear all trips from Supabase
2. Try to upload a flight
**Expected**: Error or creates new trip
**Failure Mode**: Crash or flight saved to null trip

### Test Case 11: Malformed Activity Data
**Scenario**: Activity missing required fields
**Steps**:
1. Upload restaurant with NO name
2. Upload tour with NO time
**Expected**: Validation error prevents save
**Failure Mode**: Activity saves with empty fields, breaks UI

## Transform Function Edge Cases

### Test Case 12: Hotel Without ID
**Scenario**: Legacy hotel data loaded before ID field added
**Steps**:
1. Check if existing hotels in DB have IDs
2. Load page and view hotels
**Expected**: Hotels display correctly (even if ID is missing)
**Failure Mode**: TypeScript error or hotels don't render

### Test Case 13: Flight With Extra Fields
**Scenario**: DB has fields not in TypeScript interface
**Steps**:
1. Add custom field to flight in Supabase (e.g., `seat_number`)
2. Load flights
**Expected**: Extra fields ignored, flights load normally
**Failure Mode**: Transform error or field displayed incorrectly

### Test Case 14: Activity With Null Fields
**Scenario**: Optional fields are null in DB
**Steps**:
1. Create activity with null `description`, `address`, `notes`
2. Load activities
**Expected**: Empty strings or undefined, no errors
**Failure Mode**: "Cannot read property of null" errors

## UI/UX Edge Cases

### Test Case 15: Upload Modal Closed Before Save
**Scenario**: User closes modal during API call
**Steps**:
1. Start uploading flight (slow network)
2. Close modal before response arrives
3. Check if flight still saves
**Expected**: Flight saves in background, appears after refresh
**Failure Mode**: Save cancelled, data lost

### Test Case 16: Browser Tab Closed During Upload
**Scenario**: User closes tab mid-upload
**Steps**:
1. Start uploading booking
2. Close tab before completion
3. Reopen app
**Expected**: Either booking fully saved or not saved (no partial data)
**Failure Mode**: Partial save (flight exists but no confirmation number)

### Test Case 17: Multiple Tabs Open
**Scenario**: User has app open in multiple tabs
**Steps**:
1. Open app in Tab A and Tab B
2. Upload flight in Tab A
3. Check if Tab B shows new flight
**Expected**: Tab B does NOT auto-update (requires refresh)
**Failure Mode**: Stale data in Tab B, user confused
**NOTE**: No real-time sync implemented

## API/Backend Edge Cases

### Test Case 18: Groq API Unavailable
**Scenario**: AI extraction service is down
**Steps**:
1. Remove GROQ_API_KEY from .env.local
2. Upload booking screenshot
**Expected**: Falls back to manual entry, clear message
**Failure Mode**: Hard error, upload fails completely

### Test Case 19: Supabase Rate Limit
**Scenario**: Too many requests in short time
**Steps**:
1. Upload 50 bookings rapidly
2. Check for rate limit errors
**Expected**: Graceful error handling after limit hit
**Failure Mode**: App crashes or data corruption

### Test Case 20: Database Connection Lost
**Scenario**: Network drops during save
**Steps**:
1. Start uploading booking
2. Disable network mid-request
3. Re-enable network
**Expected**: Clear error message, retry option
**Failure Mode**: Silent failure, user thinks data saved

## Verification Queries

After each test, verify data integrity:

```sql
-- Check for frontend-generated IDs (should be NONE)
SELECT id, date, flight_number FROM public.flights 
WHERE id LIKE 'flight-%' OR id LIKE 'custom-%';

-- Check for duplicate flights
SELECT flight_number, date, from_code, to_code, COUNT(*) 
FROM public.flights 
GROUP BY flight_number, date, from_code, to_code 
HAVING COUNT(*) > 1;

-- Check for activities without day_id
SELECT id, name FROM public.activities WHERE day_id IS NULL;

-- Check for null required fields
SELECT id, name FROM public.activities 
WHERE name IS NULL OR type IS NULL OR time IS NULL;
```

## Success Criteria

All edge cases must:
- ✅ Not crash the application
- ✅ Show clear error messages
- ✅ Not corrupt database data
- ✅ Maintain data integrity
- ✅ Provide clear user feedback

## Known Limitations

1. **No optimistic locking**: Last write wins in concurrent edits
2. **No real-time sync**: Multiple tabs don't auto-update
3. **No retry logic**: Failed uploads require manual retry
4. **Delete-then-insert**: Activities saved by deleting ALL then re-inserting (potential data loss)

## Recommended Improvements (Future)

1. Add optimistic locking with version numbers
2. Implement real-time subscriptions (Supabase Realtime)
3. Add retry logic with exponential backoff
4. Use upsert instead of delete-then-insert for activities
5. Add client-side validation before API calls
