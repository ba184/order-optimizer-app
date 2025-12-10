-- Create distributors table
CREATE TABLE public.distributors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  firm_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  gstin TEXT,
  city TEXT,
  state TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  credit_limit NUMERIC DEFAULT 0,
  outstanding_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  last_order_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create retailers table
CREATE TABLE public.retailers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  shop_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  phone TEXT,
  email TEXT,
  category TEXT DEFAULT 'C',
  distributor_id UUID REFERENCES public.distributors(id),
  last_visit DATE,
  last_order_value NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retailers ENABLE ROW LEVEL SECURITY;

-- RLS policies for distributors
CREATE POLICY "Authenticated users can view distributors"
ON public.distributors FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage distributors"
ON public.distributors FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Managers can manage distributors"
ON public.distributors FOR ALL
USING (get_user_role_level(auth.uid()) <= 3);

-- RLS policies for retailers
CREATE POLICY "Authenticated users can view retailers"
ON public.retailers FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage retailers"
ON public.retailers FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Managers can manage retailers"
ON public.retailers FOR ALL
USING (get_user_role_level(auth.uid()) <= 3);

-- Create indexes
CREATE INDEX idx_distributors_status ON public.distributors(status);
CREATE INDEX idx_distributors_city ON public.distributors(city);
CREATE INDEX idx_retailers_status ON public.retailers(status);
CREATE INDEX idx_retailers_category ON public.retailers(category);
CREATE INDEX idx_retailers_distributor ON public.retailers(distributor_id);

-- Triggers for updated_at
CREATE TRIGGER update_distributors_updated_at
BEFORE UPDATE ON public.distributors
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_retailers_updated_at
BEFORE UPDATE ON public.retailers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();