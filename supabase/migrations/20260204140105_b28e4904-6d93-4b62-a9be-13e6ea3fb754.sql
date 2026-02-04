-- Create storage bucket for presentation files
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('presentation-files', 'presentation-files', true, 104857600)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload presentation files
CREATE POLICY "Authenticated users can upload presentation files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'presentation-files');

-- Allow public read access to presentation files
CREATE POLICY "Public can view presentation files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'presentation-files');

-- Allow authenticated users to delete their presentation files
CREATE POLICY "Authenticated users can delete presentation files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'presentation-files');