-- Create vendors table for Vendor Management module
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_code TEXT NOT NULL UNIQUE,
  firm_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  alternate_number TEXT,
  email TEXT NOT NULL,
  gstin TEXT UNIQUE,
  pan TEXT,
  business_type TEXT NOT NULL DEFAULT 'supplier',
  credit_limit NUMERIC NOT NULL DEFAULT 0 CHECK (credit_limit >= 0),
  credit_days INTEGER NOT NULL DEFAULT 30,
  outstanding_amount NUMERIC NOT NULL DEFAULT 0,
  address TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  zone TEXT,
  since_date DATE DEFAULT CURRENT_DATE,
  assigned_manager_id UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage vendors" ON public.vendors
FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Managers can manage vendors" ON public.vendors
FOR ALL USING (get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Authenticated users can view vendors" ON public.vendors
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Create updated_at trigger
CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_vendors_status ON public.vendors(status);
CREATE INDEX idx_vendors_business_type ON public.vendors(business_type);
CREATE INDEX idx_vendors_state ON public.vendors(state);
CREATE INDEX idx_vendors_assigned_manager ON public.vendors(assigned_manager_id);

-- Create sequence for vendor code generation
CREATE SEQUENCE IF NOT EXISTS public.vendor_code_seq START WITH 1;

-- Create function to generate vendor code
CREATE OR REPLACE FUNCTION public.generate_vendor_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.vendor_code IS NULL OR NEW.vendor_code = '' THEN
    NEW.vendor_code := 'VND-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('public.vendor_code_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for auto-generating vendor code
CREATE TRIGGER generate_vendor_code_trigger
  BEFORE INSERT ON public.vendors
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_vendor_code();