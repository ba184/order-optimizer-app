
-- Add new employee fields to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pan_number text,
  ADD COLUMN IF NOT EXISTS aadhaar_number text,
  ADD COLUMN IF NOT EXISTS is_probation boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS working_address text,
  ADD COLUMN IF NOT EXISTS working_country text,
  ADD COLUMN IF NOT EXISTS working_state text,
  ADD COLUMN IF NOT EXISTS working_city text,
  ADD COLUMN IF NOT EXISTS working_territory text,
  ADD COLUMN IF NOT EXISTS working_pincode text,
  ADD COLUMN IF NOT EXISTS permanent_address text,
  ADD COLUMN IF NOT EXISTS permanent_country text,
  ADD COLUMN IF NOT EXISTS permanent_state text,
  ADD COLUMN IF NOT EXISTS permanent_city text,
  ADD COLUMN IF NOT EXISTS permanent_territory text,
  ADD COLUMN IF NOT EXISTS permanent_pincode text;
