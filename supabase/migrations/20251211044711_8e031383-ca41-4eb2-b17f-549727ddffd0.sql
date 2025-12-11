-- Create expense_claims table
CREATE TABLE public.expense_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_number TEXT NOT NULL,
  user_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  city_category TEXT NOT NULL DEFAULT 'B',
  working_days INTEGER NOT NULL DEFAULT 0,
  da_amount NUMERIC NOT NULL DEFAULT 0,
  distance_travelled NUMERIC NOT NULL DEFAULT 0,
  fuel_amount NUMERIC NOT NULL DEFAULT 0,
  hotel_nights INTEGER NOT NULL DEFAULT 0,
  hotel_amount NUMERIC NOT NULL DEFAULT 0,
  other_amount NUMERIC NOT NULL DEFAULT 0,
  other_description TEXT,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sequence for claim numbers
CREATE SEQUENCE IF NOT EXISTS public.expense_claim_number_seq START 1;

-- Create function to generate claim number
CREATE OR REPLACE FUNCTION public.generate_expense_claim_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.claim_number := 'EXP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('public.expense_claim_number_seq')::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto-generating claim numbers
CREATE TRIGGER generate_expense_claim_number_trigger
BEFORE INSERT ON public.expense_claims
FOR EACH ROW
EXECUTE FUNCTION public.generate_expense_claim_number();

-- Create trigger for updating updated_at
CREATE TRIGGER update_expense_claims_updated_at
BEFORE UPDATE ON public.expense_claims
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.expense_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own expense claims"
ON public.expense_claims
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own expense claims"
ON public.expense_claims
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own draft/pending claims"
ON public.expense_claims
FOR UPDATE
USING (auth.uid() = user_id AND status IN ('draft', 'pending'));

CREATE POLICY "Managers can view all expense claims"
ON public.expense_claims
FOR SELECT
USING (get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Managers can approve/reject claims"
ON public.expense_claims
FOR UPDATE
USING (get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Admins can manage all expense claims"
ON public.expense_claims
FOR ALL
USING (is_admin(auth.uid()));

-- Create index for faster queries
CREATE INDEX idx_expense_claims_user_id ON public.expense_claims(user_id);
CREATE INDEX idx_expense_claims_status ON public.expense_claims(status);
CREATE INDEX idx_expense_claims_created_at ON public.expense_claims(created_at DESC);