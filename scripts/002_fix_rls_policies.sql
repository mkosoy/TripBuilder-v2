-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow all authenticated users full access to travelers" ON public.travelers;

-- Create new policy that allows anonymous access (for development)
-- In production, you'd want to restrict this to authenticated users only
CREATE POLICY "Allow anonymous access to travelers"
  ON public.travelers FOR ALL
  USING (true)
  WITH CHECK (true);
