-- Add new columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS product_type text DEFAULT 'product',
ADD COLUMN IF NOT EXISTS product_code text,
ADD COLUMN IF NOT EXISTS variant text,
ADD COLUMN IF NOT EXISTS pack_type text,
ADD COLUMN IF NOT EXISTS sku_size text,
ADD COLUMN IF NOT EXISTS pack_size text,
ADD COLUMN IF NOT EXISTS pts numeric DEFAULT 0;

-- Create sequence for product code
CREATE SEQUENCE IF NOT EXISTS public.product_code_seq START 1;

-- Create function to generate product code
CREATE OR REPLACE FUNCTION public.generate_product_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.product_code IS NULL OR NEW.product_code = '' THEN
    NEW.product_code := 'PROD' || LPAD(NEXTVAL('public.product_code_seq')::TEXT, 3, '0');
  END IF;
  RETURN NEW;
END;
$function$;

-- Create trigger for auto-generating product code
DROP TRIGGER IF EXISTS generate_product_code_trigger ON public.products;
CREATE TRIGGER generate_product_code_trigger
  BEFORE INSERT ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_product_code();