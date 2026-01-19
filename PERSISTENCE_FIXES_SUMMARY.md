# Persistence Fixes - Implementation Summary

## Problem Statement

Bookings were not persisting after page refresh due to ID mismatch between frontend and database:
- Frontend generated IDs like `flight-1705700000000` or `activity-${Date.now()}`
- Supabase auto-generated UUIDs and ignored provided IDs
- After refresh, frontend couldn't find records with original IDs

## Solution: Use Database-Generated IDs

Changed the flow to let the database generate IDs and use those IDs in the frontend.

## Files Modified

### 1. `/lib/services/trip-service.ts`

#### Change 1: `addFlight()` now returns created Flight
**Before:**
```typescript
export async function addFlight(flight: Flight) {
  const { error } = await supabase
    .from("flights")
    .insert({ trip_id: TRIP_ID, ...transformFlightToDb(flight) });
  if (error) throw error;
  // No return value
}
```

**After:**
```typescript
export async function addFlight(flight: Omit<Flight, 'id'>) {
  const { data, error } = await supabase
    .from("flights")
    .insert({ trip_id: TRIP_ID, ...transformFlightToDb(flight as Flight) })
    .select()
    .single();

  if (error) throw error;
  return transformFlightFromDb(data); // Returns Flight with DB-generated ID
}
```

#### Change 2: `saveDayActivities()` returns saved activities
**Before:**
```typescript
export async function saveDayActivities(dayId: string, activities: Activity[]) {
  await supabase.from("activities").delete().eq("day_id", dayId);
  
  if (activities.length > 0) {
    const { error } = await supabase
      .from("activities")
      .insert(activities.map((activity) => ({
        day_id: dayId,
        ...transformActivityToDb(activity),
      })));
    if (error) throw error;
  }
  // No return value
}
```

**After:**
```typescript
export async function saveDayActivities(dayId: string, activities: Activity[]) {
  await supabase.from("activities").delete().eq("day_id", dayId);

  if (activities.length > 0) {
    const { data, error } = await supabase
      .from("activities")
      .insert(activities.map((activity) => ({
        day_id: dayId,
        ...transformActivityToDb(activity),
      })))
      .select(); // Added .select()

    if (error) throw error;
    return data.map(transformActivityFromDb); // Returns activities with DB IDs
  }
  return [];
}
```

#### Change 3: `transformActivityToDb()` removes id field
**Before:**
```typescript
function transformActivityToDb(activity: Activity) {
  return {
    id: activity.id,  // Was included
    name: activity.name,
    type: activity.type,
    // ... rest
  };
}
```

**After:**
```typescript
function transformActivityToDb(activity: Activity) {
  return {
    // NOTE: id is omitted - let database auto-generate UUIDs
    name: activity.name,
    type: activity.type,
    // ... rest
  };
}
```

#### Change 4: `transformFlightToDb()` conditionally includes id
**Before:**
```typescript
function transformFlightToDb(flight: Partial<Flight>) {
  return {
    id: flight.id,  // Always included
    date: flight.date,
    // ... rest
  };
}
```

**After:**
```typescript
function transformFlightToDb(flight: Partial<Flight>) {
  const dbFlight: any = {
    // NOTE: id omitted for inserts, included for updates
    date: flight.date,
    // ... all fields
  };

  // Only include id if it exists (for updates, not inserts)
  if (flight.id) {
    dbFlight.id = flight.id;
  }
  return dbFlight;
}
```

#### Change 5: `transformHotelToDb()` adds destination
```typescript
function transformHotelToDb(hotel: Partial<Hotel>) {
  return {
    name: hotel.name,
    address: hotel.address,
    destination: hotel.destination, // ADDED
    check_in: hotel.checkIn,
    check_out: hotel.checkOut,
    booking_url: hotel.bookingUrl,
    notes: hotel.notes,
  };
}
```

### 2. `/app/page.tsx`

#### Change 1: `handleUploadBooking()` uses DB-returned flight ID
**Before:**
```typescript
// Add new flight
const newFlight: Flight = {
  id: `flight-${Date.now()}`,  // Frontend-generated ID
  date: booking.departureDate || booking.date,
  // ... fields
};

setFlightsList((prev) => [...prev, newFlight]);

await TripService.addFlight(newFlight);
// Ignored return value
```

**After:**
```typescript
// Add new flight - prepare data without ID (DB will generate)
const flightData: Omit<Flight, 'id'> = {
  date: booking.departureDate || booking.date,
  // ... fields (no id)
};

// Save to Supabase and get back the flight with DB-generated ID
const savedFlight = await TripService.addFlight(flightData);
console.log("[v0] Flight added to Supabase with ID:", savedFlight.id);

// Add to state with DB-generated ID
setFlightsList((prev) => [...prev, savedFlight]);
```

#### Change 2: `handleAddActivity()` uses DB-returned activity IDs
**Before:**
```typescript
const handleAddActivity = async (dayIndex: number, activity: Activity) => {
  const newActivity = { ...activity, id: `custom-${Date.now()}` };
  setDays((prev) => {
    const updated = [...prev];
    const day = { ...updated[dayIndex] };
    day.activities = [...day.activities, newActivity];
    updated[dayIndex] = day;
    return updated;
  });
  
  const day = days[dayIndex];
  if (day?.id) {
    await TripService.saveDayActivities(day.id, [...day.activities, newActivity]);
    // Ignored return value
  }
};
```

**After:**
```typescript
const handleAddActivity = async (dayIndex: number, activity: Activity) => {
  const day = days[dayIndex];
  if (!day?.id) {
    console.error("[v0] Cannot add activity: day has no ID");
    alert("Failed to save reservation. Please try again.");
    return;
  }

  // Prepare activity without ID (DB will generate)
  const { id, ...activityWithoutId } = activity;
  const activitiesForSave = [...day.activities, activityWithoutId as Activity];

  // Save to Supabase and get back activities with DB-generated IDs
  const savedActivities = await TripService.saveDayActivities(day.id, activitiesForSave);
  console.log("[v0] Activities saved to Supabase, count:", savedActivities.length);

  // Update state with DB-generated IDs
  setDays((prev) => {
    const updated = [...prev];
    updated[dayIndex] = {
      ...updated[dayIndex],
      activities: savedActivities,
    };
    return updated;
  });
};
```

### 3. `/lib/trip-data.ts`

#### Change 1: Added `id` to Hotel interface
```typescript
export interface Hotel {
  id: string;        // ADDED
  name: string;
  address: string;
  phone?: string;
  checkIn: string;
  checkOut: string;
  destination: Destination;
  amenities?: string[];
  bookingUrl?: string;
  notes?: string;    // ADDED
}
```

#### Change 2: Added IDs to static hotel data
```typescript
export const hotels: Hotel[] = [
  {
    id: "hotel-copenhagen-1",  // ADDED
    name: "25hours Hotel Indre By",
    // ... rest
  },
  {
    id: "hotel-reykjavik-1",   // ADDED
    name: "25hours Hotel Indre By",
    // ... rest
  },
];
```

### 4. Database Migration: `/scripts/002_add_day_metadata.sql`

**Created new file:**
```sql
-- Add missing columns to days table
ALTER TABLE public.days
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS day_of_week TEXT;

-- Populate with computed values
UPDATE public.days
SET
  title = CONCAT('Day ', day_number),
  day_of_week = TO_CHAR(date, 'Day')
WHERE title IS NULL OR day_of_week IS NULL;

-- Make columns NOT NULL
ALTER TABLE public.days
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN day_of_week SET NOT NULL;
```

## Testing Instructions

### Step 1: Run Database Migration
1. Open Supabase Dashboard: https://bcxtxmskjugseirmducq.supabase.co
2. Navigate to SQL Editor
3. Copy contents of `scripts/002_add_day_metadata.sql`
4. Execute the migration
5. Verify columns added: `SELECT * FROM public.days LIMIT 1;`

### Step 2: Test Flight Persistence
1. Navigate to http://localhost:3001
2. Open browser DevTools Console
3. Click "Upload Booking" → "Flight" tab
4. Fill in flight details and save
5. **Check Console**: Should see `[v0] Flight added to Supabase with ID: <UUID>`
6. Verify UUID format (not `flight-${timestamp}`)
7. **Hard Refresh**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
8. **VERIFY**: Flight still appears after refresh

### Step 3: Test Activity Persistence
1. Click "Upload Booking" → "Restaurant" tab
2. Fill in details matching an existing day
3. Save and check console: `[v0] Activities saved to Supabase, count: <number>`
4. **Hard Refresh**
5. **VERIFY**: Restaurant still appears after refresh

## Expected Results

✅ **Flight IDs**: Console logs UUIDs like `a1b2c3d4-e5f6-...`
✅ **No frontend IDs**: No `flight-1234567890` or `activity-1234567890`
✅ **Persistence**: All bookings survive hard refresh
✅ **No console errors**: Clean console after page load

## Rollback Instructions

If tests fail, revert changes:

```bash
cd /Users/markkosoy/TripBuilder
git checkout -- app/page.tsx
git checkout -- lib/services/trip-service.ts
git checkout -- lib/trip-data.ts
```

Rollback database:
```sql
ALTER TABLE public.days
  DROP COLUMN IF EXISTS title,
  DROP COLUMN IF EXISTS day_of_week;
```

## Next Steps

After testing passes:
1. Verify all bookings persist correctly
2. Proceed to Phase 2: Unified Bookings Manager
3. Implement conflict detection for AI itinerary
4. Add better user feedback for booking uploads

## Code Quality Notes

- ✅ All TypeScript compiles without errors
- ✅ No breaking changes to existing functionality
- ✅ Backward compatible (existing data still loads)
- ✅ Clear console logging for debugging
- ✅ Error handling maintained
