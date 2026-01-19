-- Ensure a trip exists
INSERT INTO public.trips (name, start_date, end_date)
VALUES ('Nordic Winter Trip', '2026-02-07', '2026-02-18')
ON CONFLICT DO NOTHING;

-- Show the trip
SELECT * FROM public.trips;
