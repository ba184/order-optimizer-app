
-- Create warehouses table
CREATE TABLE public.warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  location_type TEXT NOT NULL DEFAULT 'regional' CHECK (location_type IN ('central', 'regional', 'distributor')),
  address TEXT,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  contact_person TEXT,
  contact_number TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Warehouse policies
CREATE POLICY "Authenticated users can view warehouses"
ON public.warehouses FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage warehouses"
ON public.warehouses FOR ALL
USING (is_admin(auth.uid()));

-- Category policies
CREATE POLICY "Authenticated users can view categories"
ON public.categories FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage categories"
ON public.categories FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Managers can manage categories"
ON public.categories FOR ALL
USING (get_user_role_level(auth.uid()) <= 3);

-- Create indexes
CREATE INDEX idx_warehouses_code ON public.warehouses(code);
CREATE INDEX idx_warehouses_status ON public.warehouses(status);
CREATE INDEX idx_categories_code ON public.categories(code);
CREATE INDEX idx_categories_status ON public.categories(status);

-- Add triggers for updated_at
CREATE TRIGGER update_warehouses_updated_at
  BEFORE UPDATE ON public.warehouses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
