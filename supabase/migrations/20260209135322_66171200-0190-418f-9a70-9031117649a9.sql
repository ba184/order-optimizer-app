
-- Update app_role enum: remove rsm/asm, add manager and warehouse_manager
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'warehouse_manager';
