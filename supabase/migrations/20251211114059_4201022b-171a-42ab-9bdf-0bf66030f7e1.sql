-- Create returns table
CREATE TABLE public.returns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  return_number TEXT NOT NULL UNIQUE,
  return_type TEXT NOT NULL DEFAULT 'return',
  source TEXT NOT NULL DEFAULT 'retailer',
  source_name TEXT NOT NULL,
  source_id UUID,
  order_id UUID REFERENCES public.orders(id),
  total_value NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  reason TEXT,
  images JSONB DEFAULT '[]',
  approved_by UUID REFERENCES public.profiles(id),
  rejection_reason TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create return items table
CREATE TABLE public.return_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  return_id UUID NOT NULL REFERENCES public.returns(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  sku TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for returns
CREATE POLICY "Admins can manage all returns" ON public.returns FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Managers can manage returns" ON public.returns FOR ALL USING (get_user_role_level(auth.uid()) <= 3);
CREATE POLICY "Users can view returns" ON public.returns FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can create returns" ON public.returns FOR INSERT WITH CHECK (auth.uid() = created_by);

-- RLS Policies for return_items
CREATE POLICY "Admins can manage all return items" ON public.return_items FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Managers can manage return items" ON public.return_items FOR ALL USING (get_user_role_level(auth.uid()) <= 3);
CREATE POLICY "Users can view return items" ON public.return_items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can create return items" ON public.return_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.returns r WHERE r.id = return_id AND r.created_by = auth.uid())
);