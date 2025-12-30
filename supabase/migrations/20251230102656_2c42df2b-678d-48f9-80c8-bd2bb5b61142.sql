-- Add entry_mode column to inventory_batches
ALTER TABLE public.inventory_batches 
ADD COLUMN IF NOT EXISTS entry_mode text DEFAULT 'manual' CHECK (entry_mode IN ('manual', 'purchase', 'return', 'transfer'));

-- Add low_stock_threshold to products table for stock monitoring
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS low_stock_threshold integer DEFAULT 50;

-- Add requested_by and approved_by columns to stock_transfers if not exists
ALTER TABLE public.stock_transfers 
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS approved_at timestamptz,
ADD COLUMN IF NOT EXISTS requested_by uuid REFERENCES public.profiles(id);

-- Update stock_transfers status check constraint if needed (drop existing and create new)
ALTER TABLE public.stock_transfers DROP CONSTRAINT IF EXISTS stock_transfers_status_check;
ALTER TABLE public.stock_transfers 
ADD CONSTRAINT stock_transfers_status_check CHECK (status IN ('pending', 'approved', 'in_transit', 'completed', 'cancelled'));