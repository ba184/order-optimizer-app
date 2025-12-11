import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserRole } from '@/types';

export interface Target {
  id: string;
  user_id: string;
  target_type: 'sales' | 'collection' | 'visits' | 'new_outlets';
  target_value: number;
  achieved_value: number;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date: string;
  zone_id: string | null;
  city_id: string | null;
  status: 'active' | 'completed' | 'expired';
  created_by: string | null;
  created_at: string;
  updated_at: string;
  user?: { id: string; name: string; email: string };
}

export function useTargets(filters?: { targetType?: string; period?: string; zoneId?: string; cityId?: string }) {
  return useQuery({
    queryKey: ['targets', filters],
    queryFn: async () => {
      let query = supabase
        .from('targets' as any)
        .select('*, user:profiles(id, name, email)')
        .order('created_at', { ascending: false });

      if (filters?.targetType && filters.targetType !== 'all') {
        query = query.eq('target_type', filters.targetType);
      }
      if (filters?.period && filters.period !== 'all') {
        query = query.eq('period', filters.period);
      }
      if (filters?.zoneId) {
        query = query.eq('zone_id', filters.zoneId);
      }
      if (filters?.cityId) {
        query = query.eq('city_id', filters.cityId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as Target[];
    },
  });
}

export function useCreateTarget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (target: {
      user_id: string;
      target_type: string;
      target_value: number;
      period: string;
      start_date: string;
      end_date: string;
      zone_id?: string;
      city_id?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('targets' as any)
        .insert({ ...target, created_by: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Target;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['targets'] });
      toast.success('Target created successfully');
    },
    onError: (error: Error) => toast.error(`Failed to create target: ${error.message}`),
  });
}

export function useUpdateTarget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Target> & { id: string }) => {
      const { data, error } = await supabase
        .from('targets' as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Target;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['targets'] });
      toast.success('Target updated successfully');
    },
    onError: (error: Error) => toast.error(`Failed to update target: ${error.message}`),
  });
}

export function useDeleteTarget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('targets' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['targets'] });
      toast.success('Target deleted successfully');
    },
    onError: (error: Error) => toast.error(`Failed to delete target: ${error.message}`),
  });
}

// Get users for target assignment
export function useUsers() {
  return useQuery({
    queryKey: ['users-for-targets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, territory, region')
        .eq('status', 'active')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });
}
