-- Add alternate contact and images columns to warehouses table
ALTER TABLE public.warehouses 
ADD COLUMN IF NOT EXISTS alt_contact_person text,
ADD COLUMN IF NOT EXISTS alt_contact_number text,
ADD COLUMN IF NOT EXISTS contact_person_id uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- Create storage bucket for warehouse images
INSERT INTO storage.buckets (id, name, public)
VALUES ('warehouse-images', 'warehouse-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for warehouse images
CREATE POLICY "Authenticated users can view warehouse images"
ON storage.objects FOR SELECT
USING (bucket_id = 'warehouse-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can upload warehouse images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'warehouse-images' AND (is_admin(auth.uid()) OR get_user_role_level(auth.uid()) <= 3));

CREATE POLICY "Admins can update warehouse images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'warehouse-images' AND (is_admin(auth.uid()) OR get_user_role_level(auth.uid()) <= 3));

CREATE POLICY "Admins can delete warehouse images"
ON storage.objects FOR DELETE
USING (bucket_id = 'warehouse-images' AND (is_admin(auth.uid()) OR get_user_role_level(auth.uid()) <= 3));