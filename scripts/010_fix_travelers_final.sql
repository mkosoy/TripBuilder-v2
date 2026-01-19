-- Step 1: Get your trip ID
DO $$
DECLARE
    v_trip_id uuid;
BEGIN
    -- Get the first trip ID
    SELECT id INTO v_trip_id FROM public.trips LIMIT 1;

    -- Delete old travelers
    DELETE FROM public.travelers WHERE trip_id = v_trip_id;

    -- Insert travelers with proper UUIDs (Supabase will auto-generate them)
    INSERT INTO public.travelers (trip_id, name, avatar, color) VALUES
        (v_trip_id, 'Mark', '/images/image.png', 'oklch(0.45 0.15 250)'),
        (v_trip_id, 'Kylie', '/images/image.png', 'oklch(0.55 0.18 180)'),
        (v_trip_id, 'Derek', '/images/image.png', 'oklch(0.65 0.12 50)'),
        (v_trip_id, 'Julia', '/images/image.png', 'oklch(0.60 0.15 320)');

    RAISE NOTICE 'Travelers inserted successfully for trip %', v_trip_id;
END $$;

-- Verify the travelers were created with UUIDs
SELECT id, name, color FROM public.travelers;
