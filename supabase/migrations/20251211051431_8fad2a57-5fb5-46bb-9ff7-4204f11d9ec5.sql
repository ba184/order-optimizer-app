-- Countries table
CREATE TABLE public.countries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- States table
CREATE TABLE public.states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(code, country_id)
);

-- Cities table
CREATE TABLE public.cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  state_id UUID NOT NULL REFERENCES public.states(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(code, state_id)
);

-- Zones table
CREATE TABLE public.zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  manager_id UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(code, country_id)
);

-- Zone states mapping (many-to-many)
CREATE TABLE public.zone_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id UUID NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  state_id UUID NOT NULL REFERENCES public.states(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(zone_id, state_id)
);

-- Territories table (hierarchical)
CREATE TABLE public.territories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'area',
  parent_id UUID REFERENCES public.territories(id) ON DELETE CASCADE,
  manager_id UUID REFERENCES public.profiles(id),
  country_id UUID REFERENCES public.countries(id),
  state_id UUID REFERENCES public.states(id),
  city_id UUID REFERENCES public.cities(id),
  zone_id UUID REFERENCES public.zones(id),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Targets table
CREATE TABLE public.targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL DEFAULT 'sales',
  target_value NUMERIC NOT NULL DEFAULT 0,
  achieved_value NUMERIC NOT NULL DEFAULT 0,
  period TEXT NOT NULL DEFAULT 'monthly',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  zone_id UUID REFERENCES public.zones(id),
  city_id UUID REFERENCES public.cities(id),
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Presentations table
CREATE TABLE public.presentations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id),
  type TEXT NOT NULL DEFAULT 'ppt',
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 0,
  file_url TEXT,
  has_quiz BOOLEAN NOT NULL DEFAULT false,
  quiz_questions JSONB DEFAULT '[]'::jsonb,
  view_count INTEGER NOT NULL DEFAULT 0,
  completion_rate NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentations ENABLE ROW LEVEL SECURITY;

-- Countries RLS
CREATE POLICY "Authenticated users can view countries" ON public.countries FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage countries" ON public.countries FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Managers can manage countries" ON public.countries FOR ALL USING (get_user_role_level(auth.uid()) <= 3);

-- States RLS
CREATE POLICY "Authenticated users can view states" ON public.states FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage states" ON public.states FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Managers can manage states" ON public.states FOR ALL USING (get_user_role_level(auth.uid()) <= 3);

-- Cities RLS
CREATE POLICY "Authenticated users can view cities" ON public.cities FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage cities" ON public.cities FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Managers can manage cities" ON public.cities FOR ALL USING (get_user_role_level(auth.uid()) <= 3);

-- Zones RLS
CREATE POLICY "Authenticated users can view zones" ON public.zones FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage zones" ON public.zones FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Managers can manage zones" ON public.zones FOR ALL USING (get_user_role_level(auth.uid()) <= 3);

-- Zone States RLS
CREATE POLICY "Authenticated users can view zone_states" ON public.zone_states FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage zone_states" ON public.zone_states FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Managers can manage zone_states" ON public.zone_states FOR ALL USING (get_user_role_level(auth.uid()) <= 3);

-- Territories RLS
CREATE POLICY "Authenticated users can view territories" ON public.territories FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage territories" ON public.territories FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Managers can manage territories" ON public.territories FOR ALL USING (get_user_role_level(auth.uid()) <= 3);

-- Targets RLS
CREATE POLICY "Admins can manage all targets" ON public.targets FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Managers can manage targets" ON public.targets FOR ALL USING (get_user_role_level(auth.uid()) <= 3);
CREATE POLICY "Users can view own targets" ON public.targets FOR SELECT USING (auth.uid() = user_id);

-- Presentations RLS
CREATE POLICY "Authenticated users can view presentations" ON public.presentations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage presentations" ON public.presentations FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Managers can manage presentations" ON public.presentations FOR ALL USING (get_user_role_level(auth.uid()) <= 3);

-- Add updated_at triggers
CREATE TRIGGER update_countries_updated_at BEFORE UPDATE ON public.countries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_states_updated_at BEFORE UPDATE ON public.states FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON public.cities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_zones_updated_at BEFORE UPDATE ON public.zones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_territories_updated_at BEFORE UPDATE ON public.territories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_targets_updated_at BEFORE UPDATE ON public.targets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_presentations_updated_at BEFORE UPDATE ON public.presentations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_states_country_id ON public.states(country_id);
CREATE INDEX idx_cities_state_id ON public.cities(state_id);
CREATE INDEX idx_zones_country_id ON public.zones(country_id);
CREATE INDEX idx_zones_manager_id ON public.zones(manager_id);
CREATE INDEX idx_zone_states_zone_id ON public.zone_states(zone_id);
CREATE INDEX idx_zone_states_state_id ON public.zone_states(state_id);
CREATE INDEX idx_territories_parent_id ON public.territories(parent_id);
CREATE INDEX idx_territories_type ON public.territories(type);
CREATE INDEX idx_targets_user_id ON public.targets(user_id);
CREATE INDEX idx_targets_status ON public.targets(status);
CREATE INDEX idx_presentations_product_id ON public.presentations(product_id);
CREATE INDEX idx_presentations_status ON public.presentations(status);