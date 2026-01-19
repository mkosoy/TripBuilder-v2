-- This script will delete old travelers with string IDs and let the migration recreate them with proper UUIDs

-- First, check what we have
SELECT 'Current travelers:' as info;
SELECT id, name FROM public.travelers;

-- Delete all travelers (this will cascade delete related records)
DELETE FROM public.travelers;

SELECT 'Travelers deleted. Refresh your app to trigger migration.' as info;
