
-- Salary Structures
CREATE TABLE public.salary_structures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  basic_salary NUMERIC NOT NULL DEFAULT 0,
  hra NUMERIC NOT NULL DEFAULT 0,
  da NUMERIC NOT NULL DEFAULT 0,
  travel_allowance NUMERIC NOT NULL DEFAULT 0,
  medical_allowance NUMERIC NOT NULL DEFAULT 0,
  special_allowance NUMERIC NOT NULL DEFAULT 0,
  pf_deduction NUMERIC NOT NULL DEFAULT 0,
  esi_deduction NUMERIC NOT NULL DEFAULT 0,
  tax_deduction NUMERIC NOT NULL DEFAULT 0,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, effective_from)
);

-- Payroll Runs
CREATE TABLE public.payroll_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  basic_salary NUMERIC NOT NULL DEFAULT 0,
  total_allowances NUMERIC NOT NULL DEFAULT 0,
  incentive_amount NUMERIC NOT NULL DEFAULT 0,
  reimbursement_amount NUMERIC NOT NULL DEFAULT 0,
  gross_salary NUMERIC NOT NULL DEFAULT 0,
  leave_deduction NUMERIC NOT NULL DEFAULT 0,
  late_deduction NUMERIC NOT NULL DEFAULT 0,
  tax_deduction NUMERIC NOT NULL DEFAULT 0,
  pf_deduction NUMERIC NOT NULL DEFAULT 0,
  esi_deduction NUMERIC NOT NULL DEFAULT 0,
  other_deduction NUMERIC NOT NULL DEFAULT 0,
  total_deductions NUMERIC NOT NULL DEFAULT 0,
  net_salary NUMERIC NOT NULL DEFAULT 0,
  present_days INTEGER NOT NULL DEFAULT 0,
  absent_days INTEGER NOT NULL DEFAULT 0,
  leave_days INTEGER NOT NULL DEFAULT 0,
  late_days INTEGER NOT NULL DEFAULT 0,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_order_value NUMERIC NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_date DATE,
  payment_reference TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  generated_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, month, year)
);

-- Travel Allowance Claims
CREATE TABLE public.travel_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  claim_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_location TEXT,
  end_location TEXT,
  distance_km NUMERIC NOT NULL DEFAULT 0,
  travel_type TEXT NOT NULL DEFAULT 'local',
  rate_per_km NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  purpose TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  synced_to_payroll BOOLEAN NOT NULL DEFAULT false,
  payroll_id UUID REFERENCES public.payroll_runs(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shifts
CREATE TABLE public.shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  grace_minutes INTEGER NOT NULL DEFAULT 15,
  weekly_off TEXT NOT NULL DEFAULT 'sunday',
  late_penalty_amount NUMERIC NOT NULL DEFAULT 0,
  late_penalty_after_minutes INTEGER NOT NULL DEFAULT 30,
  overtime_rate_multiplier NUMERIC NOT NULL DEFAULT 1.5,
  overtime_after_hours NUMERIC NOT NULL DEFAULT 9,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shift Assignments
CREATE TABLE public.shift_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shift_id UUID NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, effective_from)
);

-- HR Policies
CREATE TABLE public.hr_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  rules JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.salary_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_policies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage salary_structures" ON public.salary_structures FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Managers can manage salary_structures" ON public.salary_structures FOR ALL USING (get_user_role_level(auth.uid()) <= 3);
CREATE POLICY "Users can view own salary_structure" ON public.salary_structures FOR SELECT USING (auth.uid() = employee_id);

CREATE POLICY "Admins can manage payroll_runs" ON public.payroll_runs FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Managers can manage payroll_runs" ON public.payroll_runs FOR ALL USING (get_user_role_level(auth.uid()) <= 3);
CREATE POLICY "Users can view own payroll" ON public.payroll_runs FOR SELECT USING (auth.uid() = employee_id);

CREATE POLICY "Admins can manage travel_claims" ON public.travel_claims FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Managers can manage travel_claims" ON public.travel_claims FOR ALL USING (get_user_role_level(auth.uid()) <= 3);
CREATE POLICY "Users can create own travel_claims" ON public.travel_claims FOR INSERT WITH CHECK (auth.uid() = employee_id);
CREATE POLICY "Users can view own travel_claims" ON public.travel_claims FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Users can update own pending travel_claims" ON public.travel_claims FOR UPDATE USING (auth.uid() = employee_id AND status = 'pending');

CREATE POLICY "Admins can manage shifts" ON public.shifts FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Managers can manage shifts" ON public.shifts FOR ALL USING (get_user_role_level(auth.uid()) <= 3);
CREATE POLICY "Authenticated can view shifts" ON public.shifts FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage shift_assignments" ON public.shift_assignments FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Managers can manage shift_assignments" ON public.shift_assignments FOR ALL USING (get_user_role_level(auth.uid()) <= 3);
CREATE POLICY "Users can view own shift_assignment" ON public.shift_assignments FOR SELECT USING (auth.uid() = employee_id);

CREATE POLICY "Admins can manage hr_policies" ON public.hr_policies FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Managers can manage hr_policies" ON public.hr_policies FOR ALL USING (get_user_role_level(auth.uid()) <= 3);
CREATE POLICY "Authenticated can view hr_policies" ON public.hr_policies FOR SELECT USING (auth.uid() IS NOT NULL);
