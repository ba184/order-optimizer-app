-- Add new columns for distributor preorders
ALTER TABLE distributor_preorders
ADD COLUMN IF NOT EXISTS advance_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS remarks text;

-- Drop expected_delivery column from distributor_preorders (if not needed)
-- We'll keep it for backward compatibility but mark as deprecated in code

-- Add territory column to distributors (replacing zone usage)
ALTER TABLE distributors
ADD COLUMN IF NOT EXISTS territory text;

-- Add assigned_se (Sales Executive) to distributors
ALTER TABLE distributors
ADD COLUMN IF NOT EXISTS assigned_se uuid REFERENCES profiles(id);

-- Add KYC documents array for storing multiple document uploads
ALTER TABLE distributors
ADD COLUMN IF NOT EXISTS kyc_documents jsonb DEFAULT '[]'::jsonb;