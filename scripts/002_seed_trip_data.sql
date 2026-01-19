-- Seed initial trip data for Copenhagen & Reykjavik trip

-- First, check if trip already exists
DO $$
DECLARE
  trip_uuid UUID;
BEGIN
  -- Try to get existing trip or create new one
  SELECT id INTO trip_uuid FROM trips WHERE name = 'Copenhagen & Reykjavik Adventure' LIMIT 1;
  
  IF trip_uuid IS NULL THEN
    trip_uuid := gen_random_uuid();
    INSERT INTO trips (id, name, start_date, end_date) 
    VALUES (trip_uuid, 'Copenhagen & Reykjavik Adventure', '2026-02-07', '2026-02-18');
    
    -- Insert travelers
    INSERT INTO travelers (id, trip_id, name, avatar, color) VALUES
    (gen_random_uuid(), trip_uuid, 'Mark', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Z3lqn3FdcfhwztEl2pENYGc5lOSxZY.png', 'oklch(0.45 0.15 250)'),
    (gen_random_uuid(), trip_uuid, 'Kylie', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-qtfgD3oIAdOaBXdbnPvjQkEVDxcxl9.png', 'oklch(0.55 0.18 180)'),
    (gen_random_uuid(), trip_uuid, 'Derek', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-n5AAT9hGmNT6s2AVqFw4CItx2j9KO6.png', 'oklch(0.65 0.12 50)'),
    (gen_random_uuid(), trip_uuid, 'Julia', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3gyuCRqVdFtkVTdtJZaVAXOXzrb49U.png', 'oklch(0.60 0.15 320)');
    
    -- Insert hotels
    INSERT INTO hotels (id, trip_id, destination, name, address, check_in, check_out) VALUES
    (gen_random_uuid(), trip_uuid, 'copenhagen', '25hours Hotel Indre By', 'Lavendelstræde 11, Copenhagen', '2026-02-07', '2026-02-10'),
    (gen_random_uuid(), trip_uuid, 'reykjavik', '25hours Hotel Indre By', 'TBD Reykjavik', '2026-02-10', '2026-02-18');
  END IF;
END $$;

-- Note: Days and activities will be populated by the app since the schema is complex
-- Flights will be added via upload feature
-- Must-dos and saved places will be user-generated

COMMIT;
