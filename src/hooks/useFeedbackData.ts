import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketType = 'complaint' | 'feedback' | 'suggestion' | 'query';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketSource = 'retailer' | 'distributor' | 'employee';

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
        .from('feedback_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FeedbackTicket[];
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
      assigned_to?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('feedback_tickets')
        .insert({
          ...ticket,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-tickets'] });
      toast.success('Ticket created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create ticket: ${error.message}`);
    },
  });
}

// Update a feedback ticket
export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FeedbackTicket> & { id: string }) => {
      const { data, error } = await supabase
        .from('feedback_tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-tickets'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update ticket: ${error.message}`);
    },
  });
}

// Respond to a ticket and resolve it
export function useRespondToTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, response }: { id: string; response: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('feedback_tickets')
        .update({
          response,
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
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

// Change ticket status
export function useChangeTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TicketStatus }) => {
      const updates: Partial<FeedbackTicket> = { status };
      
      if (status === 'resolved' || status === 'closed') {
        const { data: { user } } = await supabase.auth.getUser();
        updates.resolved_at = new Date().toISOString();
        updates.resolved_by = user?.id;
      }

      const { data, error } = await supabase
        .from('feedback_tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['feedback-tickets'] });
      toast.success(`Status changed to ${variables.status.replace('_', ' ')}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to change status: ${error.message}`);
    },
  });
}
