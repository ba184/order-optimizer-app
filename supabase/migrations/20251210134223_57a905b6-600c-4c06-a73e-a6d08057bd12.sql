-- Create enum for role levels
CREATE TYPE public.app_role AS ENUM ('admin', 'rsm', 'asm', 'sales_executive');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  territory TEXT,
  region TEXT,
  reporting_to UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create roles table
CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 10),
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table (links users to roles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create permissions table
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  can_view BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_approve BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, module)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- Security definer function to get user's role level
CREATE OR REPLACE FUNCTION public.get_user_role_level(user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.level
  FROM user_roles ur
  JOIN roles r ON r.id = ur.role_id
  WHERE ur.user_id = user_id
  LIMIT 1;
$$;

-- Security definer function to check if user has a role
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role_code TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = user_id AND r.code = role_code
  );
$$;

-- Security definer function to check module permission
CREATE OR REPLACE FUNCTION public.has_permission(user_id UUID, module_name TEXT, action TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN permissions p ON p.role_id = ur.role_id
    WHERE ur.user_id = user_id 
    AND p.module = module_name
    AND (
      (action = 'view' AND p.can_view = true) OR
      (action = 'create' AND p.can_create = true) OR
      (action = 'edit' AND p.can_edit = true) OR
      (action = 'delete' AND p.can_delete = true) OR
      (action = 'approve' AND p.can_approve = true)
    )
  );
$$;

-- Security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(user_id, 'admin');
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()) OR auth.uid() = id);

CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (public.is_admin(auth.uid()));

-- RLS Policies for roles (everyone can view, only admins can modify)
CREATE POLICY "Everyone can view roles" ON public.roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert roles" ON public.roles
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update roles" ON public.roles
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete non-system roles" ON public.roles
  FOR DELETE USING (public.is_admin(auth.uid()) AND is_system = false);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user_roles" ON public.user_roles
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage user_roles" ON public.user_roles
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for permissions
CREATE POLICY "Everyone can view permissions" ON public.permissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage permissions" ON public.permissions
  FOR ALL USING (public.is_admin(auth.uid()));

-- Insert default system roles
INSERT INTO public.roles (name, code, level, description, is_system, status) VALUES
  ('Administrator', 'admin', 1, 'Full system access with all permissions', true, 'active'),
  ('Regional Sales Manager', 'rsm', 2, 'Manages regional sales operations', true, 'active'),
  ('Area Sales Manager', 'asm', 3, 'Manages area-level sales teams', true, 'active'),
  ('Sales Executive', 'sales_executive', 4, 'Field sales representative', true, 'active');

-- Insert default permissions for Admin role
INSERT INTO public.permissions (role_id, module, can_view, can_create, can_edit, can_delete, can_approve)
SELECT r.id, m.module, true, true, true, true, true
FROM public.roles r
CROSS JOIN (VALUES 
  ('dashboard'), ('users'), ('roles'), ('distributors'), ('retailers'), 
  ('products'), ('inventory'), ('orders'), ('schemes'), ('attendance'),
  ('beat_plans'), ('dsr'), ('leaves'), ('expenses'), ('leads'),
  ('reports'), ('settings'), ('approvals'), ('samples'), ('feedback'),
  ('territories'), ('zones'), ('countries'), ('states'), ('cities')
) AS m(module)
WHERE r.code = 'admin';

-- Insert default permissions for RSM role
INSERT INTO public.permissions (role_id, module, can_view, can_create, can_edit, can_delete, can_approve)
SELECT r.id, m.module, m.can_view, m.can_create, m.can_edit, m.can_delete, m.can_approve
FROM public.roles r
CROSS JOIN (VALUES 
  ('dashboard', true, false, false, false, false),
  ('users', true, false, false, false, false),
  ('distributors', true, true, true, false, true),
  ('retailers', true, true, true, false, true),
  ('products', true, false, false, false, false),
  ('inventory', true, false, false, false, true),
  ('orders', true, true, true, false, true),
  ('schemes', true, false, false, false, false),
  ('attendance', true, false, false, false, true),
  ('beat_plans', true, true, true, false, true),
  ('dsr', true, false, false, false, true),
  ('leaves', true, false, false, false, true),
  ('expenses', true, false, false, false, true),
  ('leads', true, true, true, false, false),
  ('reports', true, false, false, false, false),
  ('approvals', true, false, false, false, true)
) AS m(module, can_view, can_create, can_edit, can_delete, can_approve)
WHERE r.code = 'rsm';

-- Insert default permissions for ASM role
INSERT INTO public.permissions (role_id, module, can_view, can_create, can_edit, can_delete, can_approve)
SELECT r.id, m.module, m.can_view, m.can_create, m.can_edit, m.can_delete, m.can_approve
FROM public.roles r
CROSS JOIN (VALUES 
  ('dashboard', true, false, false, false, false),
  ('distributors', true, true, true, false, false),
  ('retailers', true, true, true, false, false),
  ('products', true, false, false, false, false),
  ('inventory', true, false, false, false, false),
  ('orders', true, true, true, false, false),
  ('attendance', true, false, false, false, false),
  ('beat_plans', true, true, true, false, false),
  ('dsr', true, false, false, false, false),
  ('leaves', true, false, false, false, false),
  ('leads', true, true, true, false, false),
  ('reports', true, false, false, false, false)
) AS m(module, can_view, can_create, can_edit, can_delete, can_approve)
WHERE r.code = 'asm';

-- Insert default permissions for Sales Executive role
INSERT INTO public.permissions (role_id, module, can_view, can_create, can_edit, can_delete, can_approve)
SELECT r.id, m.module, m.can_view, m.can_create, m.can_edit, m.can_delete, m.can_approve
FROM public.roles r
CROSS JOIN (VALUES 
  ('dashboard', true, false, false, false, false),
  ('retailers', true, true, true, false, false),
  ('products', true, false, false, false, false),
  ('orders', true, true, false, false, false),
  ('attendance', true, true, false, false, false),
  ('beat_plans', true, false, false, false, false),
  ('dsr', true, true, false, false, false),
  ('leaves', true, true, false, false, false),
  ('leads', true, true, true, false, false)
) AS m(module, can_view, can_create, can_edit, can_delete, can_approve)
WHERE r.code = 'sales_executive';

-- Create trigger for profile creation on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();