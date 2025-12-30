-- Add new columns to profiles table for enhanced user management
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS employee_id text,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS designation_code text,
ADD COLUMN IF NOT EXISTS zone text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS last_login_at timestamp with time zone;

-- Add index for employee_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_employee_id ON public.profiles(employee_id);

-- Add description column to roles table if not exists
ALTER TABLE public.roles 
ADD COLUMN IF NOT EXISTS description text;