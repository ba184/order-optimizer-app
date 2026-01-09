-- Create order_collaterals table to store marketing collateral linked to orders
CREATE TABLE public.order_collaterals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  tracking_id VARCHAR(100),
  tracking_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_collaterals ENABLE ROW LEVEL SECURITY;

-- Create policies for order_collaterals
CREATE POLICY "Users can view order collaterals"
ON public.order_collaterals
FOR SELECT
USING (true);

CREATE POLICY "Users can create order collaterals"
ON public.order_collaterals
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update order collaterals"
ON public.order_collaterals
FOR UPDATE
USING (true);

CREATE POLICY "Users can delete order collaterals"
ON public.order_collaterals
FOR DELETE
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_order_collaterals_order_id ON public.order_collaterals(order_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_order_collaterals_updated_at
BEFORE UPDATE ON public.order_collaterals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();