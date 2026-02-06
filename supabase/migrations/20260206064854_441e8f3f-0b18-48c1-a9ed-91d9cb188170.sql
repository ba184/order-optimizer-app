-- Add lead_code column to leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS lead_code TEXT;

-- Create a function to generate lead code
CREATE OR REPLACE FUNCTION public.generate_lead_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.lead_code := 'LD' || TO_CHAR(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate lead_code on insert
DROP TRIGGER IF EXISTS set_lead_code ON public.leads;
CREATE TRIGGER set_lead_code
  BEFORE INSERT ON public.leads
  FOR EACH ROW
  WHEN (NEW.lead_code IS NULL)
  EXECUTE FUNCTION public.generate_lead_code();

-- Update existing leads without lead_code
UPDATE public.leads 
SET lead_code = 'LD' || TO_CHAR(created_at, 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')
WHERE lead_code IS NULL;