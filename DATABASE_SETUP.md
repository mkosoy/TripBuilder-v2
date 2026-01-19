# Database Setup Required

## Current Status

Your Supabase database currently only has the `trips` table. The persistence fixes need the full schema to work properly.

## Quick Setup (5 minutes)

### Step 1: Run Schema Creation

1. **Go to Supabase Dashboard**  
   https://supabase.com/dashboard/project/bcxtxmskjugseirmducq

2. **Navigate to SQL Editor**  
   Click "SQL Editor" in the left sidebar

3. **Create New Query**  
   Click "+ New Query"

4. **Copy and Run Schema Script**  
   Open `scripts/001_initial_schema.sql` and copy all the SQL  
   Paste into the SQL Editor and click "Run"

This will create all necessary tables:
- `days` - Itinerary days
- `flights` - Flight bookings
- `activities` - Restaurant/tour bookings per day
- `hotels` - Hotel accommodations
- `travelers` - Trip participants
- `must_dos` - Suggested activities
- `must_do_comments` - Comments on suggestions
- `saved_places` - Bookmarked places

### Step 2: Verify Schema

Run this in SQL Editor to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

You should see 8 tables (trips + 7 new ones).

### Step 3: Run Automated Tests

```bash
npm run test:persistence
```

Expected output:
```
✓ All persistence fixes verified successfully!
```

## Alternative: Manual Browser Test

If you prefer to skip automated tests:

1. Navigate to http://localhost:3001
2. Open DevTools Console (F12)
3. Upload a flight booking
4. Look for: `[v0] Flight added to Supabase with ID: <uuid>`
5. **Hard refresh**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
6. **Verify**: Flight still appears ✅

## What This Fixes

Once the schema is set up, the persistence fixes will:

✅ Generate proper UUIDs instead of `flight-1234567890` IDs  
✅ Bookings persist after page refresh  
✅ Database IDs match frontend IDs  
✅ Screenshots save and display correctly  
✅ All booking data (notes, confirmations, attendees) persists

## Troubleshooting

### "Table already exists" errors
That's fine - the script uses `CREATE TABLE IF NOT EXISTS`

### "Permission denied"
Make sure you're logged into the correct Supabase project

### Tests still fail after schema creation
1. Hard refresh your browser (Cmd+Shift+R)
2. Check that all 8 tables exist in Supabase
3. Verify `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`

## Next Steps

After schema is set up and tests pass:

1. ✅ Database fully configured
2. ✅ Persistence verified
3. ➡️ **Phase 2**: Create unified bookings manager
4. ➡️ Add conflict detection for AI itinerary
5. ➡️ Better user feedback on uploads

## Files Reference

- `scripts/001_initial_schema.sql` - Creates all tables
- `scripts/002_add_day_metadata.sql` - Migration (not needed if running 001)
- `scripts/test-persistence.ts` - Automated test suite
- `AUTOMATED_TESTING.md` - Full testing guide
