-- Create storage bucket for policy documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('policy-documents', 'policy-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for policy-documents bucket
CREATE POLICY "Authenticated users can view policy documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'policy-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can upload policy documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'policy-documents' AND (public.is_admin(auth.uid()) OR public.get_user_role_level(auth.uid()) <= 3));

CREATE POLICY "Admins can update policy documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'policy-documents' AND (public.is_admin(auth.uid()) OR public.get_user_role_level(auth.uid()) <= 3));

CREATE POLICY "Admins can delete policy documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'policy-documents' AND (public.is_admin(auth.uid()) OR public.get_user_role_level(auth.uid()) <= 3));

-- Create table to track policy documents metadata
CREATE TABLE public.policy_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_type TEXT NOT NULL CHECK (policy_type IN ('expense', 'payment', 'hr', 'return')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.policy_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for policy_documents
CREATE POLICY "Authenticated users can view policy documents"
ON public.policy_documents FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert policy documents"
ON public.policy_documents FOR INSERT
WITH CHECK (public.is_admin(auth.uid()) OR public.get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Admins can update policy documents"
ON public.policy_documents FOR UPDATE
USING (public.is_admin(auth.uid()) OR public.get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Admins can delete policy documents"
ON public.policy_documents FOR DELETE
USING (public.is_admin(auth.uid()) OR public.get_user_role_level(auth.uid()) <= 3);

-- Add trigger for updated_at
CREATE TRIGGER update_policy_documents_updated_at
BEFORE UPDATE ON public.policy_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();