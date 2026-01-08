-- Fix 1: Drop overly permissive policies on distributor_staff table
DROP POLICY IF EXISTS "Users can insert distributor staff" ON public.distributor_staff;
DROP POLICY IF EXISTS "Users can update distributor staff" ON public.distributor_staff;
DROP POLICY IF EXISTS "Users can delete distributor staff" ON public.distributor_staff;

-- Fix 2: Drop overly permissive policies on distributor_vehicles table
DROP POLICY IF EXISTS "Users can insert distributor vehicles" ON public.distributor_vehicles;
DROP POLICY IF EXISTS "Users can update distributor vehicles" ON public.distributor_vehicles;
DROP POLICY IF EXISTS "Users can delete distributor vehicles" ON public.distributor_vehicles;

-- Fix 3: Add admin/manager-only policies for distributor_staff write operations
CREATE POLICY "Admins and managers can insert distributor staff"
ON public.distributor_staff FOR INSERT
WITH CHECK (public.is_admin(auth.uid()) OR public.get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Admins and managers can update distributor staff"
ON public.distributor_staff FOR UPDATE
USING (public.is_admin(auth.uid()) OR public.get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Admins and managers can delete distributor staff"
ON public.distributor_staff FOR DELETE
USING (public.is_admin(auth.uid()) OR public.get_user_role_level(auth.uid()) <= 3);

-- Fix 4: Add admin/manager-only policies for distributor_vehicles write operations
CREATE POLICY "Admins and managers can insert distributor vehicles"
ON public.distributor_vehicles FOR INSERT
WITH CHECK (public.is_admin(auth.uid()) OR public.get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Admins and managers can update distributor vehicles"
ON public.distributor_vehicles FOR UPDATE
USING (public.is_admin(auth.uid()) OR public.get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Admins and managers can delete distributor vehicles"
ON public.distributor_vehicles FOR DELETE
USING (public.is_admin(auth.uid()) OR public.get_user_role_level(auth.uid()) <= 3);

-- Fix 5: Make storage buckets private
UPDATE storage.buckets 
SET public = false 
WHERE id IN ('distributor-files', 'expense-bills');

-- Fix 6: Drop public access policy for distributor-files
DROP POLICY IF EXISTS "Anyone can view distributor files" ON storage.objects;

-- Fix 7: Add authenticated-only access policies for distributor-files
CREATE POLICY "Authenticated users can view distributor files"
ON storage.objects FOR SELECT
USING (bucket_id = 'distributor-files' AND auth.role() = 'authenticated');

-- Fix 8: Add authenticated-only access policies for expense-bills
DROP POLICY IF EXISTS "Authenticated users can view expense bills" ON storage.objects;
CREATE POLICY "Authenticated users can view expense bills"
ON storage.objects FOR SELECT
USING (bucket_id = 'expense-bills' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can upload expense bills" ON storage.objects;
CREATE POLICY "Authenticated users can upload expense bills"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'expense-bills' AND auth.role() = 'authenticated');