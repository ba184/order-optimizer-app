-- Create marketing_collaterals table for collateral stock (banners, gifts, POS materials, samples)
CREATE TABLE public.marketing_collaterals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('sample', 'banner', 'gift', 'pos_material', 'led_display', 'standee', 'other')),
  description TEXT,
  unit TEXT DEFAULT 'pcs',
  current_stock INTEGER NOT NULL DEFAULT 0,
  min_stock_threshold INTEGER DEFAULT 10,
  value_per_unit DECIMAL(10,2) DEFAULT 0,
  warehouse TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Create collateral_issues table for tracking issuance
CREATE TABLE public.collateral_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_number TEXT NOT NULL UNIQUE,
  collateral_id UUID NOT NULL REFERENCES public.marketing_collaterals(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  issued_to_type TEXT NOT NULL CHECK (issued_to_type IN ('employee', 'distributor', 'retailer', 'warehouse')),
  issued_to_id UUID,
  issued_to_name TEXT,
  issued_by UUID REFERENCES public.profiles(id),
  instructed_by UUID REFERENCES public.profiles(id),
  issue_stage TEXT DEFAULT 'direct' CHECK (issue_stage IN ('order', 'dispatch', 'delivery', 'direct')),
  related_order_id UUID,
  in_out_type TEXT NOT NULL DEFAULT 'out' CHECK (in_out_type IN ('in', 'out')),
  remarks TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'issued', 'acknowledged', 'returned', 'cancelled')),
  issued_at TIMESTAMP WITH TIME ZONE,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  returned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sequence for issue numbers
CREATE SEQUENCE IF NOT EXISTS public.collateral_issue_number_seq START 1;

-- Create trigger to generate issue number
CREATE OR REPLACE FUNCTION public.generate_collateral_issue_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.issue_number := 'COL-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('public.collateral_issue_number_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_collateral_issue_number
  BEFORE INSERT ON public.collateral_issues
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_collateral_issue_number();

-- Create trigger for updating timestamps
CREATE TRIGGER update_marketing_collaterals_updated_at
  BEFORE UPDATE ON public.marketing_collaterals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_collateral_issues_updated_at
  BEFORE UPDATE ON public.collateral_issues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.marketing_collaterals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collateral_issues ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for marketing_collaterals
CREATE POLICY "Authenticated users can view marketing collaterals"
  ON public.marketing_collaterals
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create marketing collaterals"
  ON public.marketing_collaterals
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update marketing collaterals"
  ON public.marketing_collaterals
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete marketing collaterals"
  ON public.marketing_collaterals
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Create RLS policies for collateral_issues
CREATE POLICY "Authenticated users can view collateral issues"
  ON public.collateral_issues
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create collateral issues"
  ON public.collateral_issues
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update collateral issues"
  ON public.collateral_issues
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Create indexes for better query performance
CREATE INDEX idx_collateral_issues_collateral_id ON public.collateral_issues(collateral_id);
CREATE INDEX idx_collateral_issues_issued_to ON public.collateral_issues(issued_to_type, issued_to_id);
CREATE INDEX idx_collateral_issues_status ON public.collateral_issues(status);
CREATE INDEX idx_collateral_issues_issued_by ON public.collateral_issues(issued_by);
CREATE INDEX idx_marketing_collaterals_type ON public.marketing_collaterals(type);
CREATE INDEX idx_marketing_collaterals_status ON public.marketing_collaterals(status);