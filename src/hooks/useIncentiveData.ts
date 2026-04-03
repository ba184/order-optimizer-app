import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useIncentiveRules() {
  return useQuery({
    queryKey: ['incentive-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incentive_rules' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateIncentiveRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rule: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      const payload: any = {
        name: rule.name,
        type: rule.type,
        role_filter: rule.role_filter || null,
        effective_from: rule.effective_from,
        effective_to: rule.effective_to || null,
        slab_config: rule.slab_config,
        status: rule.status || 'active',
        created_by: user?.id,
      };
      const { data, error } = await supabase
        .from('incentive_rules' as any)
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incentive-rules'] });
      toast.success('Incentive rule created');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}

export function useUpdateIncentiveRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const payload: any = {
        name: updates.name,
        type: updates.type,
        role_filter: updates.role_filter || null,
        effective_from: updates.effective_from,
        effective_to: updates.effective_to || null,
        slab_config: updates.slab_config,
        status: updates.status || 'active',
      };
      const { error } = await supabase
        .from('incentive_rules' as any)
        .update(payload)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incentive-rules'] });
      toast.success('Incentive rule updated');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}

export function useDeleteIncentiveRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('incentive_rules' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incentive-rules'] });
      toast.success('Incentive rule deleted');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}
