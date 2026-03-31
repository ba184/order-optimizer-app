
-- Incentive Rules
CREATE TABLE public.incentive_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'order_based', -- order_based, scheme_based, product_based, category_based
  role_filter TEXT, -- specific role or null for all
  slab_config JSONB DEFAULT '[]'::jsonb, -- [{min, max, rate_type, rate_value}]
  product_ids UUID[],
  category_ids UUID[],
  scheme_id UUID,
  status TEXT DEFAULT 'active',
  effective_from DATE NOT NULL,
  effective_to DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.incentive_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view incentive rules" ON public.incentive_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage incentive rules" ON public.incentive_rules FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Holiday Calendar
CREATE TABLE public.holiday_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT DEFAULT 'public', -- public, optional, restricted
  applicable_to TEXT DEFAULT 'all', -- all, zone-specific
  zone_id UUID,
  year INTEGER NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.holiday_calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view holidays" ON public.holiday_calendar FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage holidays" ON public.holiday_calendar FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Appraisal Cycles
CREATE TABLE public.appraisal_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cycle_type TEXT DEFAULT 'quarterly', -- monthly, quarterly, half_yearly, yearly
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'draft', -- draft, active, completed
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.appraisal_cycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view cycles" ON public.appraisal_cycles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage cycles" ON public.appraisal_cycles FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Performance Reviews
CREATE TABLE public.performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES auth.users(id),
  reviewer_id UUID REFERENCES auth.users(id),
  cycle_id UUID REFERENCES public.appraisal_cycles(id),
  review_period TEXT, -- e.g. 'Q1 2026'
  kpi_score NUMERIC(5,2),
  manager_rating NUMERIC(3,1), -- 1-5
  self_rating NUMERIC(3,1),
  final_rating NUMERIC(3,1),
  strengths TEXT,
  improvements TEXT,
  manager_feedback TEXT,
  employee_feedback TEXT,
  goals_next_period TEXT,
  status TEXT DEFAULT 'pending', -- pending, self_review, manager_review, completed
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reviews" ON public.performance_reviews FOR SELECT TO authenticated USING (employee_id = auth.uid() OR reviewer_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Admins and reviewers can manage" ON public.performance_reviews FOR ALL TO authenticated USING (reviewer_id = auth.uid() OR public.is_admin(auth.uid()));

-- Job Openings
CREATE TABLE public.job_openings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department TEXT,
  role_id UUID,
  location TEXT,
  job_type TEXT DEFAULT 'full_time', -- full_time, part_time, contract
  description TEXT,
  requirements TEXT,
  salary_range_min NUMERIC,
  salary_range_max NUMERIC,
  positions INTEGER DEFAULT 1,
  filled_positions INTEGER DEFAULT 0,
  status TEXT DEFAULT 'open', -- open, on_hold, closed, filled
  posted_by UUID REFERENCES auth.users(id),
  posted_at TIMESTAMPTZ DEFAULT now(),
  closing_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.job_openings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view jobs" ON public.job_openings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage jobs" ON public.job_openings FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Candidates
CREATE TABLE public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_opening_id UUID REFERENCES public.job_openings(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  resume_url TEXT,
  source TEXT DEFAULT 'direct', -- direct, referral, portal, agency
  referred_by UUID REFERENCES auth.users(id),
  experience_years NUMERIC(4,1),
  current_ctc NUMERIC,
  expected_ctc NUMERIC,
  notice_period INTEGER, -- days
  skills TEXT[],
  status TEXT DEFAULT 'applied', -- applied, screening, shortlisted, interview, offered, hired, rejected
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view candidates" ON public.candidates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage candidates" ON public.candidates FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Interviews
CREATE TABLE public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  interviewer_id UUID REFERENCES auth.users(id),
  round INTEGER DEFAULT 1,
  round_name TEXT, -- HR, Technical, Final
  scheduled_at TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 30,
  mode TEXT DEFAULT 'in_person', -- in_person, phone, video
  rating NUMERIC(3,1),
  feedback TEXT,
  result TEXT DEFAULT 'pending', -- pending, passed, failed, on_hold
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view interviews" ON public.interviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and interviewers can manage" ON public.interviews FOR ALL TO authenticated USING (interviewer_id = auth.uid() OR public.is_admin(auth.uid()));

-- Onboarding Checklists
CREATE TABLE public.onboarding_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES auth.users(id),
  task_name TEXT NOT NULL,
  category TEXT DEFAULT 'general', -- general, documents, training, system_access, assets
  assigned_to UUID REFERENCES auth.users(id),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.onboarding_checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own onboarding" ON public.onboarding_checklists FOR SELECT TO authenticated USING (employee_id = auth.uid() OR assigned_to = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage onboarding" ON public.onboarding_checklists FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Employee Lifecycle Events
CREATE TABLE public.employee_lifecycle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES auth.users(id),
  event_type TEXT NOT NULL, -- probation_start, probation_end, confirmation, promotion, transfer, resignation, termination, fnf
  event_date DATE NOT NULL,
  from_role TEXT,
  to_role TEXT,
  from_location TEXT,
  to_location TEXT,
  reason TEXT,
  remarks TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending', -- pending, approved, completed, rejected
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.employee_lifecycle ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own lifecycle" ON public.employee_lifecycle FOR SELECT TO authenticated USING (employee_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage lifecycle" ON public.employee_lifecycle FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
