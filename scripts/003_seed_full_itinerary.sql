-- Seed full itinerary data (days, activities, flights)

DO $$
DECLARE
  trip_uuid UUID;
  day1_id UUID;
  day2_id UUID;
  day3_id UUID;
BEGIN
  -- Get the trip ID
  SELECT id INTO trip_uuid FROM trips WHERE name = 'Copenhagen & Reykjavik Adventure' LIMIT 1;
  
  IF trip_uuid IS NULL THEN
    RAISE EXCEPTION 'Trip not found. Run 002_seed_trip_data.sql first.';
  END IF;

  -- Insert days
  INSERT INTO days (id, trip_id, date, day_number, destination) VALUES
  (gen_random_uuid(), trip_uuid, '2026-02-07', 1, 'copenhagen'),
  (gen_random_uuid(), trip_uuid, '2026-02-08', 2, 'copenhagen'),
  (gen_random_uuid(), trip_uuid, '2026-02-09', 3, 'copenhagen')
  ON CONFLICT DO NOTHING;

  -- Insert flights
  INSERT INTO flights (id, trip_id, date, departure_time, arrival_time, from_city, from_code, to_city, to_code, airline, flight_number) VALUES
  (gen_random_uuid(), trip_uuid, '2026-02-07', '00:00', '12:00', 'San Francisco', 'SFO', 'Copenhagen', 'CPH', 'SAS', 'SK936'),
  (gen_random_uuid(), trip_uuid, '2026-02-10', '08:00', '10:15', 'Copenhagen', 'CPH', 'Reykjavik', 'KEF', 'Icelandair', 'FI204'),
  (gen_random_uuid(), trip_uuid, '2026-02-18', '17:00', '19:00', 'Reykjavik', 'KEF', 'Seattle', 'SEA', 'Icelandair', 'FI688'),
  (gen_random_uuid(), trip_uuid, '2026-02-18', '19:41', '22:00', 'Seattle', 'SEA', 'San Francisco', 'SFO', 'Alaska', 'AS562')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Full itinerary seeded successfully for trip %', trip_uuid;
END $$;
