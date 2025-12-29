-- Add new fields to leads table for enhanced lead management
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS pincode text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS interested_products text[];
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS expected_conversion_date date;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS competitors jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS converted_to text;

-- Add leave balance and duration type fields to leaves table
ALTER TABLE public.leaves ADD COLUMN IF NOT EXISTS duration_type text DEFAULT 'full';
ALTER TABLE public.leaves ADD COLUMN IF NOT EXISTS applied_by uuid REFERENCES auth.users(id);

-- Create leave_balances table for tracking available leave balance
CREATE TABLE IF NOT EXISTS public.leave_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  leave_type text NOT NULL,
  year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  total_balance numeric NOT NULL DEFAULT 0,
  used_balance numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, leave_type, year)
);

-- Enable RLS on leave_balances
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;

-- RLS policies for leave_balances
CREATE POLICY "Users can view own leave balance" ON public.leave_balances
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Managers can view all leave balances" ON public.leave_balances
  FOR SELECT USING (get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Admins can manage all leave balances" ON public.leave_balances
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Managers can manage leave balances" ON public.leave_balances
  FOR ALL USING (get_user_role_level(auth.uid()) <= 3);