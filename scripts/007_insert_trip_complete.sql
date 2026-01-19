-- Insert a trip with all required fields
INSERT INTO public.trips (user_id, name, destination, start_date, end_date)
VALUES ('00000000-0000-0000-0000-000000000001', 'Nordic Winter Trip', 'Copenhagen & Reykjavik', '2026-02-07', '2026-02-18')
ON CONFLICT DO NOTHING;

-- Show the trip
SELECT * FROM public.trips;
