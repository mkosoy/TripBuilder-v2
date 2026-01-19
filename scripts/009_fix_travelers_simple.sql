-- Get the existing trip ID
SELECT id, name FROM public.trips LIMIT 1;

-- Delete old travelers with bad IDs
DELETE FROM public.travelers;

-- Insert travelers with proper UUIDs (replace 'YOUR_TRIP_ID_HERE' with the ID from above)
-- Run the SELECT above first, then replace the trip_id below
/*
INSERT INTO public.travelers (trip_id, name, avatar, color) VALUES
  ('YOUR_TRIP_ID_HERE', 'Mark', '/images/image.png', 'oklch(0.45 0.15 250)'),
  ('YOUR_TRIP_ID_HERE', 'Kylie', '/images/image.png', 'oklch(0.55 0.18 180)'),
  ('YOUR_TRIP_ID_HERE', 'Derek', '/images/image.png', 'oklch(0.65 0.12 50)'),
  ('YOUR_TRIP_ID_HERE', 'Julia', '/images/image.png', 'oklch(0.60 0.15 320)');
*/

-- Verify travelers were created with UUIDs
SELECT id, name FROM public.travelers;
