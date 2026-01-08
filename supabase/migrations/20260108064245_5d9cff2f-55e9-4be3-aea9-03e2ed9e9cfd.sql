-- Create scheme_overrides table for logging manual overrides
CREATE TABLE IF NOT EXISTS public.scheme_overrides (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    pre_order_id UUID REFERENCES public.pre_orders(id) ON DELETE CASCADE,
    scheme_id UUID REFERENCES public.schemes(id) ON DELETE SET NULL,
    original_benefit JSONB NOT NULL,
    override_benefit JSONB NOT NULL,
    override_reason TEXT NOT NULL,
    overridden_by UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT order_or_preorder_check CHECK (
        (order_id IS NOT NULL AND pre_order_id IS NULL) OR
        (order_id IS NULL AND pre_order_id IS NOT NULL)
    )
);

-- Add indexes
CREATE INDEX idx_scheme_overrides_order ON public.scheme_overrides(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX idx_scheme_overrides_preorder ON public.scheme_overrides(pre_order_id) WHERE pre_order_id IS NOT NULL;
CREATE INDEX idx_scheme_overrides_scheme ON public.scheme_overrides(scheme_id);
CREATE INDEX idx_scheme_overrides_user ON public.scheme_overrides(overridden_by);

-- Enable RLS
ALTER TABLE public.scheme_overrides ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage all scheme overrides"
    ON public.scheme_overrides
    FOR ALL
    USING (is_admin(auth.uid()));

CREATE POLICY "Managers can manage scheme overrides"
    ON public.scheme_overrides
    FOR ALL
    USING (get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Authenticated users can view scheme overrides"
    ON public.scheme_overrides
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Add applied_schemes column to orders for tracking applied schemes
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS applied_schemes JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS scheme_discount NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS scheme_free_goods JSONB DEFAULT '[]'::jsonb;

-- Add applied_schemes column to pre_orders for tracking applied schemes  
ALTER TABLE public.pre_orders ADD COLUMN IF NOT EXISTS applied_schemes JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.pre_orders ADD COLUMN IF NOT EXISTS scheme_discount NUMERIC DEFAULT 0;
ALTER TABLE public.pre_orders ADD COLUMN IF NOT EXISTS scheme_free_goods JSONB DEFAULT '[]'::jsonb;