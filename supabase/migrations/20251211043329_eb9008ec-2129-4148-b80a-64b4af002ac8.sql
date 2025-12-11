-- Create schemes table
CREATE TABLE public.schemes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'volume',
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  min_quantity INTEGER,
  free_quantity INTEGER,
  discount_percent NUMERIC,
  applicable_products JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view schemes"
ON public.schemes FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage all schemes"
ON public.schemes FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Managers can manage schemes"
ON public.schemes FOR ALL
USING (get_user_role_level(auth.uid()) <= 3);

-- Create indexes
CREATE INDEX idx_schemes_status ON public.schemes(status);
CREATE INDEX idx_schemes_type ON public.schemes(type);
CREATE INDEX idx_schemes_dates ON public.schemes(start_date, end_date);

-- Add trigger for updated_at
CREATE TRIGGER update_schemes_updated_at
BEFORE UPDATE ON public.schemes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();