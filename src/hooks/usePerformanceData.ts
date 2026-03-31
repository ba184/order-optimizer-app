import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAppraisalCycles() {
  return useQuery({
    queryKey: ['appraisal-cycles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appraisal_cycles' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateAppraisalCycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cycle: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('appraisal_cycles' as any)
        .insert({ ...cycle, created_by: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appraisal-cycles'] });
      toast.success('Appraisal cycle created');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}

export function usePerformanceReviews(cycleId?: string) {
  return useQuery({
    queryKey: ['performance-reviews', cycleId],
    queryFn: async () => {
      let query = supabase
        .from('performance_reviews' as any)
        .select('*, employee:profiles!performance_reviews_employee_id_fkey(name, email, employee_code), reviewer:profiles!performance_reviews_reviewer_id_fkey(name)')
        .order('created_at', { ascending: false });
      if (cycleId) query = query.eq('cycle_id', cycleId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreatePerformanceReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (review: any) => {
      const { data, error } = await supabase
        .from('performance_reviews' as any)
        .insert(review)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['performance-reviews'] });
      toast.success('Performance review created');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}

export function useUpdatePerformanceReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { error } = await supabase
        .from('performance_reviews' as any)
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['performance-reviews'] });
      toast.success('Review updated');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}
