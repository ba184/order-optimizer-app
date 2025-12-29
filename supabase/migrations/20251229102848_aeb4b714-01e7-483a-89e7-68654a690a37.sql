-- Add new columns to distributors table for enhanced form
ALTER TABLE public.distributors 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS contact_name text,
ADD COLUMN IF NOT EXISTS alt_phone text,
ADD COLUMN IF NOT EXISTS country text DEFAULT 'India',
ADD COLUMN IF NOT EXISTS zone text,
ADD COLUMN IF NOT EXISTS pincode text,
ADD COLUMN IF NOT EXISTS interested_products text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS pan_number text,
ADD COLUMN IF NOT EXISTS tan_number text,
ADD COLUMN IF NOT EXISTS msme_registered boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS msme_type text,
ADD COLUMN IF NOT EXISTS msme_number text,
ADD COLUMN IF NOT EXISTS registered_address text,
ADD COLUMN IF NOT EXISTS bank_name text,
ADD COLUMN IF NOT EXISTS account_number text,
ADD COLUMN IF NOT EXISTS ifsc_code text,
ADD COLUMN IF NOT EXISTS agreement_signed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS kyc_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Create distributor_warehouses table
CREATE TABLE IF NOT EXISTS public.distributor_warehouses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  distributor_id uuid NOT NULL REFERENCES public.distributors(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  contact_person text,
  phone text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on distributor_warehouses
ALTER TABLE public.distributor_warehouses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for distributor_warehouses
CREATE POLICY "Admins can manage distributor_warehouses" 
ON public.distributor_warehouses 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Managers can manage distributor_warehouses" 
ON public.distributor_warehouses 
FOR ALL 
USING (get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Authenticated users can view distributor_warehouses" 
ON public.distributor_warehouses 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create distributor_preorders table
CREATE TABLE IF NOT EXISTS public.distributor_preorders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  distributor_id uuid NOT NULL REFERENCES public.distributors(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id),
  quantity integer NOT NULL DEFAULT 0,
  expected_delivery date,
  preorder_value numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on distributor_preorders
ALTER TABLE public.distributor_preorders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for distributor_preorders
CREATE POLICY "Admins can manage distributor_preorders" 
ON public.distributor_preorders 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Managers can manage distributor_preorders" 
ON public.distributor_preorders 
FOR ALL 
USING (get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Authenticated users can view distributor_preorders" 
ON public.distributor_preorders 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Update secondary counters table to add contact_person field
ALTER TABLE public.distributor_secondary_counters 
ADD COLUMN IF NOT EXISTS contact_person text;