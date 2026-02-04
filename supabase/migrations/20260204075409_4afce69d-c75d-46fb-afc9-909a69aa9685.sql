-- Add new columns to warehouses table
ALTER TABLE public.warehouses 
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India',
ADD COLUMN IF NOT EXISTS territory TEXT,
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC,
ADD COLUMN IF NOT EXISTS capacity TEXT;

-- Drop the old check constraint on location_type
ALTER TABLE public.warehouses DROP CONSTRAINT IF EXISTS warehouses_location_type_check;

-- Update existing values to new location types
UPDATE public.warehouses SET location_type = 'depot' WHERE location_type IN ('regional', 'distributor');

-- Add new check constraint for 'central' and 'depot' only
ALTER TABLE public.warehouses ADD CONSTRAINT warehouses_location_type_check CHECK (location_type IN ('central', 'depot'));

-- Create sequence for warehouse code if not exists
CREATE SEQUENCE IF NOT EXISTS public.warehouse_code_seq START WITH 1;

-- Create function to generate warehouse code
CREATE OR REPLACE FUNCTION public.generate_warehouse_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := 'WH-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('public.warehouse_code_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS generate_warehouse_code_trigger ON public.warehouses;
CREATE TRIGGER generate_warehouse_code_trigger
BEFORE INSERT ON public.warehouses
FOR EACH ROW
EXECUTE FUNCTION public.generate_warehouse_code();