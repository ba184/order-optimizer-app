-- Add new columns to expense_claims table
ALTER TABLE public.expense_claims 
ADD COLUMN IF NOT EXISTS expense_type text NOT NULL DEFAULT 'misc',
ADD COLUMN IF NOT EXISTS expense_date date,
ADD COLUMN IF NOT EXISTS bill_photo text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS created_by_role text DEFAULT 'fse';

-- Add approval workflow columns to sample_issues
ALTER TABLE public.sample_issues 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_by uuid,
ADD COLUMN IF NOT EXISTS approved_at timestamptz,
ADD COLUMN IF NOT EXISTS rejection_reason text,
ADD COLUMN IF NOT EXISTS request_date date DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS created_by_role text DEFAULT 'fse';

-- Add status column to samples table if not exists
ALTER TABLE public.samples 
ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES products(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_expense_claims_expense_type ON expense_claims(expense_type);
CREATE INDEX IF NOT EXISTS idx_expense_claims_expense_date ON expense_claims(expense_date);
CREATE INDEX IF NOT EXISTS idx_sample_issues_status ON sample_issues(status);