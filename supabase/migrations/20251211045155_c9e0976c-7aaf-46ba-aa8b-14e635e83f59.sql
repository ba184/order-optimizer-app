-- Create samples table (for sample/gift master)
CREATE TABLE public.samples (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'sample', -- 'sample' or 'gift'
  cost_price NUMERIC NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sample_issues table (for tracking issued samples/gifts)
CREATE TABLE public.sample_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sample_id UUID NOT NULL REFERENCES public.samples(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  issued_to_id UUID,
  issued_to_name TEXT NOT NULL,
  issued_to_type TEXT NOT NULL DEFAULT 'retailer', -- 'retailer' or 'distributor'
  issued_by UUID NOT NULL,
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledgement_photo TEXT,
  converted_to_order BOOLEAN NOT NULL DEFAULT false,
  order_id UUID,
  order_value NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sample_budgets table (for executive budgets)
CREATE TABLE public.sample_budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  monthly_budget NUMERIC NOT NULL DEFAULT 5000,
  used_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month, year)
);

-- Triggers for updated_at
CREATE TRIGGER update_samples_updated_at
BEFORE UPDATE ON public.samples
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sample_issues_updated_at
BEFORE UPDATE ON public.sample_issues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sample_budgets_updated_at
BEFORE UPDATE ON public.sample_budgets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sample_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sample_budgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for samples
CREATE POLICY "Authenticated users can view samples"
ON public.samples FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Managers can manage samples"
ON public.samples FOR ALL
USING (get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Admins can manage all samples"
ON public.samples FOR ALL
USING (is_admin(auth.uid()));

-- RLS Policies for sample_issues
CREATE POLICY "Users can view own issued samples"
ON public.sample_issues FOR SELECT
USING (auth.uid() = issued_by);

CREATE POLICY "Users can create sample issues"
ON public.sample_issues FOR INSERT
WITH CHECK (auth.uid() = issued_by);

CREATE POLICY "Users can update own sample issues"
ON public.sample_issues FOR UPDATE
USING (auth.uid() = issued_by);

CREATE POLICY "Managers can view all sample issues"
ON public.sample_issues FOR SELECT
USING (get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Managers can manage sample issues"
ON public.sample_issues FOR ALL
USING (get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Admins can manage all sample issues"
ON public.sample_issues FOR ALL
USING (is_admin(auth.uid()));

-- RLS Policies for sample_budgets
CREATE POLICY "Users can view own budget"
ON public.sample_budgets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Managers can view all budgets"
ON public.sample_budgets FOR SELECT
USING (get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Managers can manage budgets"
ON public.sample_budgets FOR ALL
USING (get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Admins can manage all budgets"
ON public.sample_budgets FOR ALL
USING (is_admin(auth.uid()));

-- Indexes
CREATE INDEX idx_samples_type ON public.samples(type);
CREATE INDEX idx_samples_status ON public.samples(status);
CREATE INDEX idx_sample_issues_sample_id ON public.sample_issues(sample_id);
CREATE INDEX idx_sample_issues_issued_by ON public.sample_issues(issued_by);
CREATE INDEX idx_sample_issues_created_at ON public.sample_issues(created_at DESC);
CREATE INDEX idx_sample_budgets_user_month ON public.sample_budgets(user_id, month, year);