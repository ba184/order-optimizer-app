import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type TicketStatus = 'pending' | 'accepted' | 'rejected';
export type TicketType = 'general' | 'product_related' | 'complaint';
export type TicketPriority = 'low' | 'medium' | 'high';
export type TicketSource = 'mobile_app' | 'field_visit';

export interface FeedbackTicket {
  id: string;
  ticket_number: string;
  type: TicketType;
  priority: TicketPriority;
  subject: string;
  description: string | null;
  source: TicketSource;
  source_name: string;
  source_id: string | null;
  status: TicketStatus;
  assigned_to: string | null;
  response: string | null;
  rejection_reason: string | null;
  created_by: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
}

// Fetch all feedback tickets
export function useFeedbackTickets() {
  return useQuery({
    queryKey: ['feedback-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedback_tickets' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as FeedbackTicket[];
    },
  });
}

// Create a new feedback ticket
export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticket: {
      type: TicketType;
      priority: TicketPriority;
      subject: string;
      description?: string;
      source: TicketSource;
      source_name: string;
      source_id?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Generate ticket number
      const ticket_number = `TKT-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
      
      const { data, error } = await supabase
        .from('feedback_tickets' as any)
        .insert({
          ...ticket,
          ticket_number,
          status: 'pending',
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as FeedbackTicket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-tickets'] });
      toast.success('Feedback submitted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit feedback: ${error.message}`);
    },
  });
}

// Update a feedback ticket
export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FeedbackTicket> & { id: string }) => {
      const { data, error } = await supabase
        .from('feedback_tickets' as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as FeedbackTicket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-tickets'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update ticket: ${error.message}`);
    },
  });
}

// Accept a ticket
export function useAcceptTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('feedback_tickets' as any)
        .update({
          status: 'accepted',
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as FeedbackTicket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-tickets'] });
      toast.success('Feedback accepted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to accept: ${error.message}`);
    },
  });
}

// Reject a ticket with reason
export function useRejectTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, rejection_reason }: { id: string; rejection_reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('feedback_tickets' as any)
        .update({
          status: 'rejected',
          rejection_reason,
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as FeedbackTicket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-tickets'] });
      toast.success('Feedback rejected');
    },
    onError: (error: Error) => {
      toast.error(`Failed to reject: ${error.message}`);
    },
  });
}

// Legacy: Respond to a ticket (kept for backwards compatibility)
export function useRespondToTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, response }: { id: string; response: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('feedback_tickets' as any)
        .update({
          response,
          status: 'accepted',
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as FeedbackTicket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-tickets'] });
      toast.success('Response submitted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit response: ${error.message}`);
    },
  });
}

// Legacy: Change ticket status
export function useChangeTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TicketStatus }) => {
      const updates: Record<string, any> = { status };
      
      if (status === 'accepted' || status === 'rejected') {
        const { data: { user } } = await supabase.auth.getUser();
        updates.resolved_at = new Date().toISOString();
        updates.resolved_by = user?.id;
      }

      const { data, error } = await supabase
        .from('feedback_tickets' as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as FeedbackTicket;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['feedback-tickets'] });
      toast.success(`Status changed to ${variables.status}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to change status: ${error.message}`);
    },
  });
}
