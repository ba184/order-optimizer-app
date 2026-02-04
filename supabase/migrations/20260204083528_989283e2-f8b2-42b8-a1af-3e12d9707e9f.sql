-- Create zone_cities junction table
CREATE TABLE IF NOT EXISTS public.zone_cities (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    zone_id uuid NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
    city_id uuid NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(zone_id, city_id)
);

-- Create zone_territories junction table
CREATE TABLE IF NOT EXISTS public.zone_territories (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    zone_id uuid NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
    territory_id uuid NOT NULL REFERENCES public.territories(id) ON DELETE CASCADE,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(zone_id, territory_id)
);

-- Enable RLS
ALTER TABLE public.zone_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_territories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for zone_cities
CREATE POLICY "Authenticated users can view zone_cities" ON public.zone_cities
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage zone_cities" ON public.zone_cities
    FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Managers can manage zone_cities" ON public.zone_cities
    FOR ALL USING (get_user_role_level(auth.uid()) <= 3);

-- RLS Policies for zone_territories
CREATE POLICY "Authenticated users can view zone_territories" ON public.zone_territories
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage zone_territories" ON public.zone_territories
    FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Managers can manage zone_territories" ON public.zone_territories
    FOR ALL USING (get_user_role_level(auth.uid()) <= 3);