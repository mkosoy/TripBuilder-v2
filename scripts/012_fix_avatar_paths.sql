-- Fix avatar paths that point to non-existent files
-- This updates any avatar that is '/images/image.png' to empty string
-- so the colored initials fallback will show instead of 404 errors

UPDATE public.travelers
SET avatar = ''
WHERE avatar = '/images/image.png';

-- Verify the update
SELECT id, name, avatar, color FROM public.travelers;
