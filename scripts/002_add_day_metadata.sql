-- Migration: Add missing day metadata columns
-- Date: 2026-01-18
-- Purpose: Add title and day_of_week columns to days table for proper transform function support

-- Add columns if they don't exist
ALTER TABLE public.days
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS day_of_week TEXT;

-- Populate existing rows with computed values
UPDATE public.days
SET
  title = CONCAT('Day ', day_number),
  day_of_week = TO_CHAR(date, 'Day')
WHERE title IS NULL OR day_of_week IS NULL;

-- Make columns NOT NULL after populating
ALTER TABLE public.days
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN day_of_week SET NOT NULL;

-- Verification query
SELECT id, day_number, date, title, day_of_week FROM public.days ORDER BY day_number;
