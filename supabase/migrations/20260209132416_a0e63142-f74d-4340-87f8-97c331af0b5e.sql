
-- Fix 1: Set search_path on generate_lead_code
CREATE OR REPLACE FUNCTION public.generate_lead_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.lead_code := 'LD' || TO_CHAR(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$function$;

-- Fix 2: Set search_path on update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Fix 3: Replace always-true RLS policies on order_collaterals
DROP POLICY IF EXISTS "Users can create order collaterals" ON public.order_collaterals;
DROP POLICY IF EXISTS "Users can update order collaterals" ON public.order_collaterals;
DROP POLICY IF EXISTS "Users can delete order collaterals" ON public.order_collaterals;

CREATE POLICY "Authenticated users can create order collaterals"
ON public.order_collaterals FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update order collaterals"
ON public.order_collaterals FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete order collaterals"
ON public.order_collaterals FOR DELETE
USING (is_admin(auth.uid()) OR get_user_role_level(auth.uid()) <= 3);

-- Fix 4: Restrict expense_claims manager access to reporting hierarchy
DROP POLICY IF EXISTS "Managers can view all expense claims" ON public.expense_claims;
DROP POLICY IF EXISTS "Managers can approve/reject claims" ON public.expense_claims;

CREATE POLICY "Managers can view team expense claims"
ON public.expense_claims FOR SELECT
USING (
  get_user_role_level(auth.uid()) <= 3 AND
  (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = expense_claims.user_id
      AND p.reporting_to = auth.uid()
    ) OR
    is_admin(auth.uid())
  )
);

CREATE POLICY "Managers can approve team expense claims"
ON public.expense_claims FOR UPDATE
USING (
  get_user_role_level(auth.uid()) <= 3 AND
  (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = expense_claims.user_id
      AND p.reporting_to = auth.uid()
    ) OR
    is_admin(auth.uid())
  )
);
