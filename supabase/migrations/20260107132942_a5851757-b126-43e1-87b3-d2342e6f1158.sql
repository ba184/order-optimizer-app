-- Storage bucket for distributor files (agreement PDFs, warehouse photos, vehicle photos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('distributor-files', 'distributor-files', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for distributor-files bucket
CREATE POLICY "Authenticated users can upload distributor files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'distributor-files');

CREATE POLICY "Anyone can view distributor files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'distributor-files');

CREATE POLICY "Authenticated users can update their files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'distributor-files');

CREATE POLICY "Authenticated users can delete their files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'distributor-files');

-- Add photos array to distributor_warehouses table
ALTER TABLE public.distributor_warehouses
ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}';

-- Create distributor_vehicles table
CREATE TABLE IF NOT EXISTS public.distributor_vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  distributor_id UUID NOT NULL REFERENCES public.distributors(id) ON DELETE CASCADE,
  vehicle_number TEXT NOT NULL,
  vehicle_type TEXT NOT NULL, -- bike, van, truck, tempo
  capacity TEXT,
  photos text[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create distributor_staff table
CREATE TABLE IF NOT EXISTS public.distributor_staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  distributor_id UUID NOT NULL REFERENCES public.distributors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT, -- salesman, driver, warehouse manager, etc.
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add agreement_file_url column to distributors if not exists
ALTER TABLE public.distributors
ADD COLUMN IF NOT EXISTS agreement_file_url TEXT;

-- Enable RLS
ALTER TABLE public.distributor_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributor_staff ENABLE ROW LEVEL SECURITY;

-- RLS policies for distributor_vehicles
CREATE POLICY "Users can view all distributor vehicles"
ON public.distributor_vehicles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert distributor vehicles"
ON public.distributor_vehicles
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update distributor vehicles"
ON public.distributor_vehicles
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Users can delete distributor vehicles"
ON public.distributor_vehicles
FOR DELETE
TO authenticated
USING (true);

-- RLS policies for distributor_staff
CREATE POLICY "Users can view all distributor staff"
ON public.distributor_staff
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert distributor staff"
ON public.distributor_staff
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update distributor staff"
ON public.distributor_staff
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Users can delete distributor staff"
ON public.distributor_staff
FOR DELETE
TO authenticated
USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_distributor_vehicles_distributor_id ON public.distributor_vehicles(distributor_id);
CREATE INDEX IF NOT EXISTS idx_distributor_staff_distributor_id ON public.distributor_staff(distributor_id);