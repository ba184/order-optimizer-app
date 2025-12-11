-- Create advanced_schemes table
CREATE TABLE public.advanced_schemes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'slab',
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  applicability TEXT DEFAULT 'All Outlets',
  benefit TEXT,
  min_value NUMERIC,
  max_benefit NUMERIC,
  claims_generated INTEGER DEFAULT 0,
  claims_approved INTEGER DEFAULT 0,
  total_payout NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create scheme_claims table for tracking claims/applicants
CREATE TABLE public.scheme_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scheme_id UUID NOT NULL REFERENCES public.advanced_schemes(id) ON DELETE CASCADE,
  applicant_type TEXT NOT NULL DEFAULT 'retailer',
  retailer_id UUID REFERENCES public.retailers(id),
  distributor_id UUID REFERENCES public.distributors(id),
  claim_amount NUMERIC DEFAULT 0,
  claim_status TEXT DEFAULT 'pending',
  remarks TEXT,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.advanced_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies for advanced_schemes
CREATE POLICY "Authenticated users can view advanced schemes"
ON public.advanced_schemes FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage all advanced schemes"
ON public.advanced_schemes FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Managers can manage advanced schemes"
ON public.advanced_schemes FOR ALL
USING (get_user_role_level(auth.uid()) <= 3);

-- RLS Policies for scheme_claims
CREATE POLICY "Authenticated users can view scheme claims"
ON public.scheme_claims FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage all scheme claims"
ON public.scheme_claims FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Managers can manage scheme claims"
ON public.scheme_claims FOR ALL
USING (get_user_role_level(auth.uid()) <= 3);

-- Create indexes
CREATE INDEX idx_advanced_schemes_status ON public.advanced_schemes(status);
CREATE INDEX idx_advanced_schemes_type ON public.advanced_schemes(type);
CREATE INDEX idx_scheme_claims_scheme_id ON public.scheme_claims(scheme_id);
CREATE INDEX idx_scheme_claims_status ON public.scheme_claims(claim_status);

-- Add triggers for updated_at
CREATE TRIGGER update_advanced_schemes_updated_at
BEFORE UPDATE ON public.advanced_schemes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scheme_claims_updated_at
BEFORE UPDATE ON public.scheme_claims
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();