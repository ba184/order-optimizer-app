-- Create pre-order schemes table
CREATE TABLE public.pre_order_schemes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  launch_date DATE NOT NULL,
  pre_order_start DATE,
  pre_order_end DATE,
  pre_order_target INTEGER DEFAULT 0,
  pre_order_achieved INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create pre-orders table
CREATE TABLE public.pre_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  scheme_id UUID REFERENCES public.pre_order_schemes(id),
  distributor_id UUID REFERENCES public.distributors(id),
  total_value NUMERIC DEFAULT 0,
  advance_collected NUMERIC DEFAULT 0,
  expected_delivery DATE,
  actual_delivery DATE,
  status TEXT DEFAULT 'booked',
  remarks TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create pre-order items table
CREATE TABLE public.pre_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pre_order_id UUID NOT NULL REFERENCES public.pre_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create sequence for pre-order numbers
CREATE SEQUENCE IF NOT EXISTS public.pre_order_number_seq START 1;

-- Create function to generate pre-order number
CREATE OR REPLACE FUNCTION public.generate_pre_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.order_number := 'PRE-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('public.pre_order_number_seq')::TEXT, 3, '0');
  RETURN NEW;
END;
$$;

-- Create trigger for auto-generating pre-order number
CREATE TRIGGER set_pre_order_number
  BEFORE INSERT ON public.pre_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_pre_order_number();

-- Enable RLS
ALTER TABLE public.pre_order_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_order_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for pre_order_schemes
CREATE POLICY "Authenticated users can view schemes" ON public.pre_order_schemes
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage schemes" ON public.pre_order_schemes
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Managers can manage schemes" ON public.pre_order_schemes
  FOR ALL USING (get_user_role_level(auth.uid()) <= 3);

-- RLS policies for pre_orders
CREATE POLICY "Users can view own pre-orders" ON public.pre_orders
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create pre-orders" ON public.pre_orders
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Managers can view all pre-orders" ON public.pre_orders
  FOR SELECT USING (get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Managers can update pre-orders" ON public.pre_orders
  FOR UPDATE USING (get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Admins can manage all pre-orders" ON public.pre_orders
  FOR ALL USING (is_admin(auth.uid()));

-- RLS policies for pre_order_items
CREATE POLICY "Authenticated users can view pre-order items" ON public.pre_order_items
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage own pre-order items" ON public.pre_order_items
  FOR ALL USING (EXISTS (
    SELECT 1 FROM pre_orders po WHERE po.id = pre_order_items.pre_order_id AND po.created_by = auth.uid()
  ));

CREATE POLICY "Admins can manage all pre-order items" ON public.pre_order_items
  FOR ALL USING (is_admin(auth.uid()));

-- Create indexes
CREATE INDEX idx_pre_orders_scheme ON public.pre_orders(scheme_id);
CREATE INDEX idx_pre_orders_distributor ON public.pre_orders(distributor_id);
CREATE INDEX idx_pre_orders_status ON public.pre_orders(status);
CREATE INDEX idx_pre_order_items_order ON public.pre_order_items(pre_order_id);