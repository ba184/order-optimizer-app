-- =============================================
-- ATTENDANCE TABLE
-- =============================================
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  login_time TIMESTAMPTZ,
  logout_time TIMESTAMPTZ,
  login_location JSONB,
  logout_location JSONB,
  login_selfie TEXT,
  logout_selfie TEXT,
  total_distance DECIMAL(10,2) DEFAULT 0,
  visit_count INTEGER DEFAULT 0,
  orders_placed INTEGER DEFAULT 0,
  dsr_submitted BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'half_day', 'on_leave')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attendance" ON public.attendance
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Managers can view team attendance" ON public.attendance
  FOR SELECT USING (
    public.get_user_role_level(auth.uid()) <= 3
  );

CREATE POLICY "Users can insert own attendance" ON public.attendance
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attendance" ON public.attendance
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all attendance" ON public.attendance
  FOR ALL USING (public.is_admin(auth.uid()));

-- =============================================
-- BEAT PLANS TABLE
-- =============================================
CREATE TABLE public.beat_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  plan_type TEXT DEFAULT 'monthly' CHECK (plan_type IN ('journey', 'monthly')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

ALTER TABLE public.beat_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own beat plans" ON public.beat_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Managers can view team beat plans" ON public.beat_plans
  FOR SELECT USING (public.get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Users can manage own beat plans" ON public.beat_plans
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Managers can approve beat plans" ON public.beat_plans
  FOR UPDATE USING (public.get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Admins can manage all beat plans" ON public.beat_plans
  FOR ALL USING (public.is_admin(auth.uid()));

-- =============================================
-- BEAT ROUTES TABLE (child of beat_plans)
-- =============================================
CREATE TABLE public.beat_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_plan_id UUID NOT NULL REFERENCES public.beat_plans(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  route_date DATE,
  area TEXT,
  zone TEXT,
  planned_visits INTEGER DEFAULT 0,
  retailers JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.beat_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own beat routes" ON public.beat_routes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.beat_plans bp WHERE bp.id = beat_plan_id AND bp.user_id = auth.uid())
  );

CREATE POLICY "Managers can view team beat routes" ON public.beat_routes
  FOR SELECT USING (public.get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Users can manage own beat routes" ON public.beat_routes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.beat_plans bp WHERE bp.id = beat_plan_id AND bp.user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all beat routes" ON public.beat_routes
  FOR ALL USING (public.is_admin(auth.uid()));

-- =============================================
-- DAILY SALES REPORTS (DSR) TABLE
-- =============================================
CREATE TABLE public.daily_sales_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  visit_type TEXT DEFAULT 'visit' CHECK (visit_type IN ('call', 'visit')),
  distributor_id UUID,
  distributor_name TEXT,
  retailer_id UUID,
  retailer_name TEXT,
  total_calls INTEGER DEFAULT 0,
  productive_calls INTEGER DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  order_value DECIMAL(12,2) DEFAULT 0,
  collection_amount DECIMAL(12,2) DEFAULT 0,
  new_retailers INTEGER DEFAULT 0,
  complaints INTEGER DEFAULT 0,
  remarks TEXT,
  market_intelligence TEXT,
  zone TEXT,
  city TEXT,
  area TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.daily_sales_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own DSR" ON public.daily_sales_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Managers can view team DSR" ON public.daily_sales_reports
  FOR SELECT USING (public.get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Users can manage own DSR" ON public.daily_sales_reports
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all DSR" ON public.daily_sales_reports
  FOR ALL USING (public.is_admin(auth.uid()));

-- =============================================
-- LEADS TABLE
-- =============================================
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  shop_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zone TEXT,
  area TEXT,
  lead_type TEXT DEFAULT 'retailer' CHECK (lead_type IN ('retailer', 'distributor')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interested', 'converted', 'lost', 'pending_approval')),
  notes TEXT,
  potential_value DECIMAL(12,2),
  source TEXT,
  follow_up_date DATE,
  approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  approval_reason TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  assigned_to UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assigned leads" ON public.leads
  FOR SELECT USING (auth.uid() = assigned_to OR auth.uid() = created_by);

CREATE POLICY "Managers can view all leads" ON public.leads
  FOR SELECT USING (public.get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Users can create leads" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update assigned leads" ON public.leads
  FOR UPDATE USING (auth.uid() = assigned_to OR auth.uid() = created_by);

CREATE POLICY "Managers can manage leads" ON public.leads
  FOR ALL USING (public.get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Admins can manage all leads" ON public.leads
  FOR ALL USING (public.is_admin(auth.uid()));

-- =============================================
-- LEAVES TABLE
-- =============================================
CREATE TABLE public.leaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('casual', 'sick', 'earned', 'compensatory')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own leaves" ON public.leaves
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Managers can view team leaves" ON public.leaves
  FOR SELECT USING (public.get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Users can create own leaves" ON public.leaves
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending leaves" ON public.leaves
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Managers can approve leaves" ON public.leaves
  FOR UPDATE USING (public.get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Admins can manage all leaves" ON public.leaves
  FOR ALL USING (public.is_admin(auth.uid()));

-- =============================================
-- LIVE TRACKING (Employee Locations) TABLE
-- =============================================
CREATE TABLE public.employee_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  address TEXT,
  accuracy DECIMAL(10,2),
  battery_level INTEGER,
  is_moving BOOLEAN DEFAULT FALSE,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.employee_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own locations" ON public.employee_locations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Managers can view team locations" ON public.employee_locations
  FOR SELECT USING (public.get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Users can insert own locations" ON public.employee_locations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all locations" ON public.employee_locations
  FOR SELECT USING (public.is_admin(auth.uid()));

-- =============================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_attendance_user_date ON public.attendance(user_id, date);
CREATE INDEX idx_beat_plans_user ON public.beat_plans(user_id);
CREATE INDEX idx_beat_plans_status ON public.beat_plans(status);
CREATE INDEX idx_dsr_user_date ON public.daily_sales_reports(user_id, date);
CREATE INDEX idx_leads_assigned ON public.leads(assigned_to);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leaves_user ON public.leaves(user_id);
CREATE INDEX idx_leaves_status ON public.leaves(status);
CREATE INDEX idx_locations_user ON public.employee_locations(user_id);
CREATE INDEX idx_locations_recorded ON public.employee_locations(recorded_at);

-- =============================================
-- ADD UPDATED_AT TRIGGERS
-- =============================================
CREATE TRIGGER update_attendance_updated_at
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_beat_plans_updated_at
  BEFORE UPDATE ON public.beat_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dsr_updated_at
  BEFORE UPDATE ON public.daily_sales_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leaves_updated_at
  BEFORE UPDATE ON public.leaves
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();