-- Create inventory_batches table for tracking stock by batch
CREATE TABLE public.inventory_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  batch_number TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  manufacturing_date DATE,
  expiry_date DATE,
  warehouse TEXT,
  distributor_id UUID REFERENCES public.distributors(id),
  purchase_price NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create stock_transfers table
CREATE TABLE public.stock_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transfer_number TEXT NOT NULL UNIQUE,
  from_location TEXT NOT NULL,
  from_distributor_id UUID REFERENCES public.distributors(id),
  to_location TEXT NOT NULL,
  to_distributor_id UUID REFERENCES public.distributors(id),
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  dispatched_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create stock_transfer_items table
CREATE TABLE public.stock_transfer_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transfer_id UUID REFERENCES public.stock_transfers(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inventory_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transfer_items ENABLE ROW LEVEL SECURITY;

-- Inventory batches policies
CREATE POLICY "Authenticated users can view inventory" ON public.inventory_batches
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create inventory entries" ON public.inventory_batches
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Managers can manage inventory" ON public.inventory_batches
  FOR ALL USING (get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Admins can manage all inventory" ON public.inventory_batches
  FOR ALL USING (is_admin(auth.uid()));

-- Stock transfers policies
CREATE POLICY "Authenticated users can view transfers" ON public.stock_transfers
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create transfers" ON public.stock_transfers
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Managers can manage transfers" ON public.stock_transfers
  FOR ALL USING (get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Admins can manage all transfers" ON public.stock_transfers
  FOR ALL USING (is_admin(auth.uid()));

-- Stock transfer items policies
CREATE POLICY "Authenticated users can view transfer items" ON public.stock_transfer_items
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage own transfer items" ON public.stock_transfer_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM stock_transfers st WHERE st.id = stock_transfer_items.transfer_id AND st.created_by = auth.uid())
  );

CREATE POLICY "Admins can manage all transfer items" ON public.stock_transfer_items
  FOR ALL USING (is_admin(auth.uid()));

-- Create indexes
CREATE INDEX idx_inventory_batches_product ON public.inventory_batches(product_id);
CREATE INDEX idx_inventory_batches_expiry ON public.inventory_batches(expiry_date);
CREATE INDEX idx_inventory_batches_status ON public.inventory_batches(status);
CREATE INDEX idx_stock_transfers_status ON public.stock_transfers(status);
CREATE INDEX idx_stock_transfer_items_transfer ON public.stock_transfer_items(transfer_id);

-- Create sequence for transfer numbers
CREATE SEQUENCE IF NOT EXISTS transfer_number_seq START 1;

-- Create function to generate transfer number
CREATE OR REPLACE FUNCTION public.generate_transfer_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.transfer_number := 'STF-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('public.transfer_number_seq')::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for transfer number generation
CREATE TRIGGER set_transfer_number
  BEFORE INSERT ON public.stock_transfers
  FOR EACH ROW
  WHEN (NEW.transfer_number IS NULL)
  EXECUTE FUNCTION public.generate_transfer_number();