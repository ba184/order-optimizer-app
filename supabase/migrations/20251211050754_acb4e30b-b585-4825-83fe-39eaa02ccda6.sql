-- Create sequence for ticket numbers
CREATE SEQUENCE IF NOT EXISTS public.feedback_ticket_number_seq START 1;

-- Create feedback_tickets table
CREATE TABLE public.feedback_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'query',
  priority TEXT NOT NULL DEFAULT 'medium',
  subject TEXT NOT NULL,
  description TEXT,
  source TEXT NOT NULL DEFAULT 'retailer',
  source_name TEXT NOT NULL,
  source_id UUID,
  status TEXT NOT NULL DEFAULT 'open',
  assigned_to TEXT,
  response TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedback_tickets ENABLE ROW LEVEL SECURITY;

-- Create function to generate ticket number
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_number := 'TKT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('public.feedback_ticket_number_seq')::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto-generating ticket numbers
CREATE TRIGGER generate_ticket_number_trigger
BEFORE INSERT ON public.feedback_tickets
FOR EACH ROW
WHEN (NEW.ticket_number IS NULL OR NEW.ticket_number = '')
EXECUTE FUNCTION public.generate_ticket_number();

-- Create trigger for updating updated_at
CREATE TRIGGER update_feedback_tickets_updated_at
BEFORE UPDATE ON public.feedback_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
CREATE POLICY "Admins can manage all feedback tickets"
ON public.feedback_tickets FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Managers can manage all feedback tickets"
ON public.feedback_tickets FOR ALL
USING (get_user_role_level(auth.uid()) <= 3);

CREATE POLICY "Users can create feedback tickets"
ON public.feedback_tickets FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view assigned tickets"
ON public.feedback_tickets FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update assigned tickets"
ON public.feedback_tickets FOR UPDATE
USING (auth.uid() = created_by OR auth.uid() = resolved_by);

-- Create indexes
CREATE INDEX idx_feedback_tickets_status ON public.feedback_tickets(status);
CREATE INDEX idx_feedback_tickets_type ON public.feedback_tickets(type);
CREATE INDEX idx_feedback_tickets_priority ON public.feedback_tickets(priority);
CREATE INDEX idx_feedback_tickets_source_id ON public.feedback_tickets(source_id);
CREATE INDEX idx_feedback_tickets_created_by ON public.feedback_tickets(created_by);