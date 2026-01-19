-- Check if any users exist
SELECT * FROM public.users LIMIT 5;

-- If no users exist, create one (uncomment the lines below)
-- INSERT INTO public.users (id, email, name)
-- VALUES ('00000000-0000-0000-0000-000000000001', 'demo@example.com', 'Demo User')
-- ON CONFLICT DO NOTHING;

-- Then insert the trip
-- INSERT INTO public.trips (user_id, name, destination, start_date, end_date)
-- VALUES ('00000000-0000-0000-0000-000000000001', 'Nordic Winter Trip', 'Copenhagen & Reykjavik', '2026-02-07', '2026-02-18')
-- ON CONFLICT DO NOTHING;
