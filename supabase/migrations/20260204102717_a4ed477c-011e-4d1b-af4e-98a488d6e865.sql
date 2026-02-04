-- Add new columns to profiles table for employee details
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS doj date,
ADD COLUMN IF NOT EXISTS dob date,
ADD COLUMN IF NOT EXISTS blood_group text,
ADD COLUMN IF NOT EXISTS emergency_contact_name text,
ADD COLUMN IF NOT EXISTS emergency_contact_phone text;