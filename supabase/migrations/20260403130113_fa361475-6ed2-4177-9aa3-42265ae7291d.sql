
-- Enhance performance_reviews with weighted ratings, approval workflow, payroll integration
ALTER TABLE public.performance_reviews 
ADD COLUMN IF NOT EXISTS weighted_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS kpi_weights JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS increment_percent NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS increment_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS payroll_linked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS linked_payroll_id UUID REFERENCES public.payroll_runs(id);

-- Enhance appraisal_cycles with KPI config
ALTER TABLE public.appraisal_cycles
ADD COLUMN IF NOT EXISTS kpi_config JSONB DEFAULT '[{"category":"targets","label":"Target Achievement","weight":30},{"category":"orders","label":"Order Performance","weight":25},{"category":"leads","label":"Lead Conversion","weight":20},{"category":"outlets","label":"Outlet Coverage","weight":15},{"category":"manual","label":"Manager Assessment","weight":10}]',
ADD COLUMN IF NOT EXISTS approval_required BOOLEAN DEFAULT true;
