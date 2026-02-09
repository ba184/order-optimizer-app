-- Create storage bucket for return media
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('return-media', 'return-media', true, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to return-media bucket
CREATE POLICY "Authenticated users can upload return media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'return-media');

-- Allow public read access to return media
CREATE POLICY "Public read access for return media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'return-media');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Authenticated users can delete return media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'return-media');