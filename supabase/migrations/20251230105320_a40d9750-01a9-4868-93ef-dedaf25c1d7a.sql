-- Add new fields to schemes table for enhanced scheme management
ALTER TABLE public.schemes 
ADD COLUMN IF NOT EXISTS code text,
ADD COLUMN IF NOT EXISTS benefit_type text DEFAULT 'discount',
ADD COLUMN IF NOT EXISTS applicability text DEFAULT 'all_outlets',
ADD COLUMN IF NOT EXISTS eligible_skus uuid[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS slab_config jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS min_order_value numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_benefit numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS outlet_claim_limit integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS claims_generated integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS claims_approved integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_payout numeric DEFAULT 0;

-- Add unique constraint on code
CREATE UNIQUE INDEX IF NOT EXISTS schemes_code_unique ON public.schemes(code) WHERE code IS NOT NULL;

-- Add check constraint for benefit_type
ALTER TABLE public.schemes DROP CONSTRAINT IF EXISTS schemes_benefit_type_check;
ALTER TABLE public.schemes ADD CONSTRAINT schemes_benefit_type_check 
  CHECK (benefit_type IN ('discount', 'free_qty', 'cashback', 'points', 'coupon'));

-- Add check constraint for applicability
ALTER TABLE public.schemes DROP CONSTRAINT IF EXISTS schemes_applicability_check;
ALTER TABLE public.schemes ADD CONSTRAINT schemes_applicability_check 
  CHECK (applicability IN ('all_outlets', 'distributor', 'retailer', 'segment', 'area', 'zone'));

-- Update status check to include new statuses
ALTER TABLE public.schemes DROP CONSTRAINT IF EXISTS schemes_status_check;
ALTER TABLE public.schemes ADD CONSTRAINT schemes_status_check 
  CHECK (status IN ('draft', 'pending', 'active', 'expired', 'closed', 'cancelled'));

-- Update type check to include new types
ALTER TABLE public.schemes DROP CONSTRAINT IF EXISTS schemes_type_check;
ALTER TABLE public.schemes ADD CONSTRAINT schemes_type_check 
  CHECK (type IN ('slab', 'buy_x_get_y', 'combo', 'value_wise', 'bill_wise', 'display', 'volume', 'product', 'opening'));