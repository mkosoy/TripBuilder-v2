# Automated Persistence Testing

This document explains how to run the automated tests for the persistence fixes.

## Prerequisites

1. **Add Supabase Service Role Key** to `.env.local`:

```bash
# Get this from: https://bcxtxmskjugseirmducq.supabase.co/project/_/settings/api
# Look for "service_role" key (secret) - NOT the anon key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Where to find it:**
- Go to Supabase Dashboard
- Click on your project
- Settings → API
- Copy the `service_role` key (NOT the `anon` key)

2. **Install dependencies** (if not already done):

```bash
npm install
```

## Running the Tests

### Option 1: Run Full Test Suite (Recommended)

This runs all automated tests including migration, inserts, and verification:

```bash
npm run test:persistence
```

### Option 2: Run Migration Only

If you just need to run the database migration:

```bash
npx tsx scripts/run-migration.ts
```

## What Gets Tested

The automated test suite verifies:

1. ✅ **Database Migration**
   - Adds `title` and `day_of_week` columns to `days` table
   - Populates existing rows with computed values
   - Verifies migration succeeded

2. ✅ **Flight Persistence**
   - Inserts test flight
   - Verifies flight gets UUID (not `flight-${timestamp}`)
   - Retrieves flight and confirms ID matches

3. ✅ **Activity Persistence**
   - Inserts test activity
   - Verifies activity gets UUID (not `activity-${timestamp}`)
   - Retrieves activity and confirms ID matches

4. ✅ **Old-Style ID Detection**
   - Scans database for any `flight-*` or `activity-*` IDs
   - Reports if any old-style IDs found (indicates persistence bug)

5. ✅ **Transform Function Compatibility**
   - Queries day with activities using nested select
   - Verifies `title` and `day_of_week` fields populated
   - Confirms transform functions work with new schema

## Expected Output

### Success:

```
════════════════════════════════════════════════════════════
  Persistence Fixes - Automated Test Suite
════════════════════════════════════════════════════════════

Connected to Supabase

▶ Test 1: Database Migration
  ✓ Migration completed successfully
  ✓ Sample day: Day 1 (Friday)

▶ Test 2: Get Trip ID
  ✓ Using existing trip: <uuid>

▶ Test 3: Flight Insert Returns UUID
  ✓ Flight created with UUID: <uuid>

▶ Test 4: Flight Persistence
  ✓ Flight persisted with correct UUID

▶ Test 5: Get Day for Activity Test
  ✓ Using existing day: <uuid> (Day 1)

▶ Test 6: Activity Insert Returns UUID
  ✓ Activity created with UUID: <uuid>

▶ Test 7: Activity Persistence
  ✓ Activity persisted with correct UUID

▶ Test 8: Check for Old-Style IDs in Database
  ✓ No old-style flight IDs found
  ✓ No old-style activity IDs found

▶ Test 9: Transform Function Compatibility
  ✓ Transform functions compatible with DB schema
  ✓ Day has title: "Day 1"
  ✓ Day has day_of_week: "Friday"

▶ Cleanup: Remove Test Data
  ✓ Removed test flight
  ✓ Removed test activity

════════════════════════════════════════════════════════════
  Test Results Summary
════════════════════════════════════════════════════════════

✓ migration: Migration completed successfully
✓ flight_insert: Flight created with UUID: <uuid>
✓ flight_persist: Flight persisted with correct UUID
✓ activity_insert: Activity created with UUID: <uuid>
✓ activity_persist: Activity persisted with correct UUID
✓ old_ids_flights: No old-style flight IDs found
✓ old_ids_activities: No old-style activity IDs found
✓ transform_compat: Transform functions compatible with DB schema

8/8 tests passed

✓ All persistence fixes verified successfully!

Next steps:
  1. Test in browser: Upload a booking and hard refresh
  2. Proceed to Phase 2: Create unified bookings manager
```

### Failure Example:

```
✗ flight_insert: Flight ID is not a UUID: flight-1705700000000

6/8 tests failed. Please review the errors above.
```

## Manual Browser Testing (After Automated Tests Pass)

Even after automated tests pass, you should verify in the browser:

1. Navigate to http://localhost:3001
2. Open DevTools Console
3. Upload a flight booking
4. Look for console log: `[v0] Flight added to Supabase with ID: <uuid>`
5. **Hard refresh:** Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
6. **Verify:** Flight still appears
7. Repeat for restaurant booking

## Troubleshooting

### Error: "Missing SUPABASE_SERVICE_ROLE_KEY"

Add the service role key to `.env.local`:

```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Error: "No trip found in database"

The test script will automatically create a test trip if none exists.

### Error: "Migration verification failed"

The migration may need to be run manually in Supabase Dashboard:

1. Go to SQL Editor
2. Run the contents of `scripts/002_add_day_metadata.sql`
3. Re-run tests

### Tests pass but browser still shows old IDs

1. Clear browser cache completely
2. Hard refresh (Cmd+Shift+R)
3. Check if you're looking at cached data
4. Verify `.env.local` is loaded correctly

## Cleanup

Test data is automatically cleaned up after tests complete. If tests crash, you may need to manually delete test records:

```sql
-- Delete test flights
DELETE FROM flights WHERE notes = 'Automated test flight';

-- Delete test activities
DELETE FROM activities WHERE description = 'Automated test restaurant';
```

## Next Steps

After all automated tests pass:

1. ✅ Database migration complete
2. ✅ ID synchronization verified
3. ✅ Persistence confirmed
4. ➡️ Move to Phase 2: Create unified bookings manager
5. ➡️ Implement conflict detection
6. ➡️ Add better user feedback

## Support

If tests fail repeatedly:

1. Check the error messages in the test output
2. Review `PERSISTENCE_FIXES_SUMMARY.md` for details on changes
3. Check `EDGE_CASES_TEST.md` for additional scenarios
4. Verify all code changes from Phase 1 are applied

## Files Created

- `scripts/test-persistence.ts` - Main test suite
- `scripts/run-migration.ts` - Migration runner
- `scripts/002_add_day_metadata.sql` - Database migration
- `AUTOMATED_TESTING.md` - This file
- `PERSISTENCE_TEST_PLAN.md` - Manual test plan (backup)
- `EDGE_CASES_TEST.md` - Edge case scenarios
