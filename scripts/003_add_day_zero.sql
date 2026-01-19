-- Migration: Add Day 0 (Travel Day - Feb 6, 2026)
-- This adds the travel day as Day 0 so that when users select Feb 10
-- it appears on "Day 4" (not "Day 5" in the card position)

-- First, check if Day 0 already exists
DO $$
DECLARE
  trip_uuid UUID;
BEGIN
  -- Get the trip ID
  SELECT id INTO trip_uuid FROM public.trips LIMIT 1;

  -- Insert Day 0 only if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM public.days
    WHERE trip_id = trip_uuid AND date = '2026-02-06'
  ) THEN
    INSERT INTO public.days (
      trip_id,
      date,
      day_number,
      destination,
      title,
      day_of_week
    ) VALUES (
      trip_uuid,
      '2026-02-06',
      0,
      'copenhagen',
      'Day 0: Travel Day',
      'Friday'
    );

    RAISE NOTICE 'Day 0 (Travel Day - Feb 6) added successfully';
  ELSE
    RAISE NOTICE 'Day 0 already exists, skipping';
  END IF;
END $$;
