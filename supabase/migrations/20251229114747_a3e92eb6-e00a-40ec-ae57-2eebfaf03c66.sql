-- =============================================
-- Feedback Management Schema Updates
-- =============================================

-- Add rejection_reason column to feedback_tickets if not exists
ALTER TABLE public.feedback_tickets 
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Note: source and type already exist, we'll handle the value mapping in code
-- Status values will be: pending, accepted, rejected (mapped from existing)

-- =============================================
-- Returns Management Schema Updates
-- =============================================

-- Add new columns to returns table
ALTER TABLE public.returns
ADD COLUMN IF NOT EXISTS party_type text DEFAULT 'primary',
ADD COLUMN IF NOT EXISTS batch_no text,
ADD COLUMN IF NOT EXISTS settlement_type text,
ADD COLUMN IF NOT EXISTS media_urls jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_locked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS unlock_requested_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS unlock_approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS unlock_approved_by uuid,
ADD COLUMN IF NOT EXISTS se_name text,
ADD COLUMN IF NOT EXISTS claim_date date;

-- Add foreign key for unlock_approved_by
ALTER TABLE public.returns
ADD CONSTRAINT returns_unlock_approved_by_fkey 
FOREIGN KEY (unlock_approved_by) REFERENCES public.profiles(id)
ON DELETE SET NULL;

-- Add batch_no to return_items
ALTER TABLE public.return_items
ADD COLUMN IF NOT EXISTS batch_no text;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_returns_party_type ON public.returns(party_type);
CREATE INDEX IF NOT EXISTS idx_returns_settlement_type ON public.returns(settlement_type);
CREATE INDEX IF NOT EXISTS idx_returns_is_locked ON public.returns(is_locked);
CREATE INDEX IF NOT EXISTS idx_feedback_tickets_status ON public.feedback_tickets(status);