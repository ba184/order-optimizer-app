import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useTravelClaims(statusFilter?: string) {
  return useQuery({
    queryKey: ['travel-claims', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('travel_claims' as any)
        .select('*, profiles:employee_id(name, email, employee_code)')
        .order('created_at', { ascending: false });
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateTravelClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');
      const { data: result, error } = await supabase
        .from('travel_claims' as any)
        .insert({ ...data, employee_id: data.employee_id || user.user.id })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['travel-claims'] });
      toast.success('Travel claim submitted');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}

export function useApproveTravelClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('travel_claims' as any)
        .update({ status: 'approved', approved_by: user.user?.id, approved_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['travel-claims'] });
      toast.success('Travel claim approved');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}

export function useRejectTravelClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('travel_claims' as any)
        .update({ status: 'rejected', approved_by: user.user?.id, approved_at: new Date().toISOString(), rejection_reason: reason })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['travel-claims'] });
      toast.success('Travel claim rejected');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}
