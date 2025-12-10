-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  ptr NUMERIC NOT NULL DEFAULT 0,
  mrp NUMERIC NOT NULL DEFAULT 0,
  gst NUMERIC NOT NULL DEFAULT 18,
  stock INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  order_type TEXT NOT NULL DEFAULT 'primary',
  distributor_id UUID REFERENCES public.distributors(id),
  retailer_id UUID REFERENCES public.retailers(id),
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  items_count INTEGER DEFAULT 0,
  subtotal NUMERIC DEFAULT 0,
  gst_amount NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'draft',
  payment_status TEXT DEFAULT 'pending',
  notes TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  dispatched_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  gst_percent NUMERIC NOT NULL DEFAULT 18,
  gst_amount NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  free_goods INTEGER DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Products policies (viewable by all authenticated users)
CREATE POLICY "Authenticated users can view products" ON public.products
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Managers can manage products" ON public.products
  FOR ALL USING (get_user_role_level(auth.uid()) <= 3);

-- Orders policies
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Managers can view all orders" ON public.orders
  FOR SELECT USING (get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own draft orders" ON public.orders
  FOR UPDATE USING (auth.uid() = created_by AND status = 'draft');

CREATE POLICY "Managers can update all orders" ON public.orders
  FOR UPDATE USING (get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Admins can manage all orders" ON public.orders
  FOR ALL USING (is_admin(auth.uid()));

-- Order items policies
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_items.order_id AND o.created_by = auth.uid())
  );

CREATE POLICY "Managers can view all order items" ON public.order_items
  FOR SELECT USING (get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Users can manage own order items" ON public.order_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_items.order_id AND o.created_by = auth.uid() AND o.status = 'draft')
  );

CREATE POLICY "Admins can manage all order items" ON public.order_items
  FOR ALL USING (is_admin(auth.uid()));

-- Create indexes
CREATE INDEX idx_orders_created_by ON public.orders(created_by);
CREATE INDEX idx_orders_distributor ON public.orders(distributor_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_products_sku ON public.products(sku);

-- Create function to generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Create trigger for order number generation
CREATE TRIGGER set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION public.generate_order_number();