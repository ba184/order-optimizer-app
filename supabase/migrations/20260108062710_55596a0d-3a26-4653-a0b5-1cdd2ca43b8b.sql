-- Create distributor_images table (similar to retailer_images)
CREATE TABLE public.distributor_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  distributor_id UUID NOT NULL REFERENCES public.distributors(id) ON DELETE CASCADE,
  image_type TEXT NOT NULL,
  image_url TEXT NOT NULL,
  gps_latitude NUMERIC,
  gps_longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.distributor_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view distributor_images"
  ON public.distributor_images FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage distributor_images"
  ON public.distributor_images FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Managers can manage distributor_images"
  ON public.distributor_images FOR ALL
  USING (get_user_role_level(auth.uid()) <= 3);

-- Create index for performance
CREATE INDEX idx_distributor_images_distributor ON public.distributor_images(distributor_id);

-- Add GPS location column to distributors table
ALTER TABLE public.distributors ADD COLUMN IF NOT EXISTS gps_location JSONB;

-- Add driver_name and driver_contact to distributor_vehicles
ALTER TABLE public.distributor_vehicles 
  ADD COLUMN IF NOT EXISTS driver_name TEXT,
  ADD COLUMN IF NOT EXISTS driver_contact TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Add status to distributor_staff
ALTER TABLE public.distributor_staff 
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';