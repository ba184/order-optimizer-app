
-- Add geo_level and zone_type columns to roles table
ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS geo_level text DEFAULT 'territory';
ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS zone_type text DEFAULT NULL;

-- Set existing roles geo_level based on their known configuration
UPDATE public.roles SET geo_level = 'country' WHERE code = 'admin';
UPDATE public.roles SET geo_level = 'zone', zone_type = 'state' WHERE code = 'rsm';
UPDATE public.roles SET geo_level = 'city' WHERE code = 'asm';
UPDATE public.roles SET geo_level = 'territory' WHERE code = 'sales_executive';
UPDATE public.roles SET geo_level = 'territory' WHERE code = 'warehouse_manager';
