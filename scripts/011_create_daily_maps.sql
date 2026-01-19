-- Create daily_visual_maps table for AI-generated day illustrations
CREATE TABLE IF NOT EXISTS public.daily_visual_maps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_id UUID REFERENCES public.days(id) ON DELETE CASCADE NOT NULL,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  prompt_used TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  generated_by_traveler_id UUID REFERENCES public.travelers(id) ON DELETE SET NULL,
  is_fallback BOOLEAN DEFAULT false,
  generation_attempt INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- Ensure one map per day
  UNIQUE(day_id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_daily_maps_trip_id ON public.daily_visual_maps(trip_id);
CREATE INDEX IF NOT EXISTS idx_daily_maps_day_id ON public.daily_visual_maps(day_id);
CREATE INDEX IF NOT EXISTS idx_daily_maps_generated_at ON public.daily_visual_maps(generated_at DESC);

-- Enable Row Level Security
ALTER TABLE public.daily_visual_maps ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read maps
CREATE POLICY "Allow read access to all users" ON public.daily_visual_maps
  FOR SELECT USING (true);

-- Policy: Allow insert for authenticated users
CREATE POLICY "Allow insert for authenticated users" ON public.daily_visual_maps
  FOR INSERT WITH CHECK (true);

-- Policy: Allow update for authenticated users
CREATE POLICY "Allow update for authenticated users" ON public.daily_visual_maps
  FOR UPDATE USING (true);
