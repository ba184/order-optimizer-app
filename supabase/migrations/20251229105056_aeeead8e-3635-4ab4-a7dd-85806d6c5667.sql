-- Add new columns to retailers table for approval workflow and business details
ALTER TABLE public.retailers 
ADD COLUMN IF NOT EXISTS firm_type text DEFAULT 'proprietorship',
ADD COLUMN IF NOT EXISTS country text DEFAULT 'India',
ADD COLUMN IF NOT EXISTS zone text,
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS rejection_reason text,
ADD COLUMN IF NOT EXISTS gps_location jsonb;

-- Create retailer_preorders table for pre-order details
CREATE TABLE IF NOT EXISTS public.retailer_preorders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  retailer_id uuid NOT NULL REFERENCES public.retailers(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id),
  quantity integer NOT NULL DEFAULT 1,
  expected_delivery date,
  preorder_value numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on retailer_preorders
ALTER TABLE public.retailer_preorders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for retailer_preorders
CREATE POLICY "Admins can manage retailer_preorders" 
ON public.retailer_preorders 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Managers can manage retailer_preorders" 
ON public.retailer_preorders 
FOR ALL 
USING (get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Authenticated users can view retailer_preorders" 
ON public.retailer_preorders 
FOR SELECT 
USING (auth.uid() IS NOT NULL);