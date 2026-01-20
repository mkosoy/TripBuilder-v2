-- Fix RLS policy on trips table to allow anonymous access
-- This is needed for the client-side query to return data

-- First, drop any existing restrictive policies
DROP POLICY IF EXISTS "Allow anonymous read access to trips" ON public.trips;
DROP POLICY IF EXISTS "Allow anonymous all access to trips" ON public.trips;
DROP POLICY IF EXISTS "Users can view their own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can create their own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can update their own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can delete their own trips" ON public.trips;

-- Ensure RLS is enabled
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Create permissive policy for all operations (development mode)
-- In production, you'd want to restrict this to authenticated users
CREATE POLICY "Allow anonymous access to trips"
  ON public.trips FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'trips';
