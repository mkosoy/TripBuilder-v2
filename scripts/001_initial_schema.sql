-- Initial Database Schema for TripBuilder
-- This creates all the necessary tables

-- Days table
CREATE TABLE IF NOT EXISTS public.days (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day_number INTEGER NOT NULL,
  destination TEXT NOT NULL,
  title TEXT NOT NULL,
  day_of_week TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Flights table  
CREATE TABLE IF NOT EXISTS public.flights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  departure_time TEXT,
  arrival_time TEXT,
  from_city TEXT,
  from_code TEXT,
  to_city TEXT,
  to_code TEXT,
  airline TEXT,
  flight_number TEXT,
  notes TEXT,
  confirmation_number TEXT,
  travelers TEXT[],
  screenshot_url TEXT,
  is_personal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_id UUID REFERENCES public.days(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  time TEXT,
  duration TEXT,
  description TEXT,
  address TEXT,
  booking_url TEXT,
  price_range TEXT,
  notes TEXT,
  is_booked BOOLEAN DEFAULT false,
  is_must_do BOOLEAN DEFAULT false,
  avg_entree_price TEXT,
  popular_items TEXT[],
  cuisine TEXT,
  reservation_required BOOLEAN,
  availability_status TEXT,
  image_url TEXT,
  confirmation_number TEXT,
  attendees TEXT[],
  screenshot_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Hotels table
CREATE TABLE IF NOT EXISTS public.hotels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  destination TEXT NOT NULL,
  check_in DATE,
  check_out DATE,
  booking_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Travelers table
CREATE TABLE IF NOT EXISTS public.travelers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Must-dos table
CREATE TABLE IF NOT EXISTS public.must_dos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  traveler_id UUID REFERENCES public.travelers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  destination TEXT,
  description TEXT,
  address TEXT,
  booking_url TEXT,
  price_range TEXT,
  notes TEXT,
  votes TEXT[],
  added_to_itinerary BOOLEAN DEFAULT false,
  added_to_day UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Must-do comments table
CREATE TABLE IF NOT EXISTS public.must_do_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  must_do_id UUID REFERENCES public.must_dos(id) ON DELETE CASCADE,
  traveler_id UUID REFERENCES public.travelers(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Saved places table
CREATE TABLE IF NOT EXISTS public.saved_places (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  destination TEXT,
  description TEXT,
  address TEXT,
  booking_url TEXT,
  price_range TEXT,
  notes TEXT,
  category TEXT,
  avg_entree_price TEXT,
  popular_items TEXT[],
  cuisine TEXT,
  reservation_required BOOLEAN,
  availability_status TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_days_trip_id ON public.days(trip_id);
CREATE INDEX IF NOT EXISTS idx_days_date ON public.days(date);
CREATE INDEX IF NOT EXISTS idx_flights_trip_id ON public.flights(trip_id);
CREATE INDEX IF NOT EXISTS idx_flights_date ON public.flights(date);
CREATE INDEX IF NOT EXISTS idx_activities_day_id ON public.activities(day_id);
CREATE INDEX IF NOT EXISTS idx_hotels_trip_id ON public.hotels(trip_id);
CREATE INDEX IF NOT EXISTS idx_travelers_trip_id ON public.travelers(trip_id);
CREATE INDEX IF NOT EXISTS idx_must_dos_trip_id ON public.must_dos(trip_id);
CREATE INDEX IF NOT EXISTS idx_saved_places_trip_id ON public.saved_places(trip_id);

-- Verify tables created
SELECT 
  table_name, 
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
