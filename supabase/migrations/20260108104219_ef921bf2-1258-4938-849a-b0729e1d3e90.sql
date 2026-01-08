-- Create storage bucket for expense bills
INSERT INTO storage.buckets (id, name, public) 
VALUES ('expense-bills', 'expense-bills', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to expense-bills bucket
CREATE POLICY "Authenticated users can upload expense bills"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'expense-bills' AND auth.role() = 'authenticated');

-- Allow authenticated users to view expense bills
CREATE POLICY "Authenticated users can view expense bills"
ON storage.objects FOR SELECT
USING (bucket_id = 'expense-bills' AND auth.role() = 'authenticated');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their expense bills"
ON storage.objects FOR DELETE
USING (bucket_id = 'expense-bills' AND auth.role() = 'authenticated');