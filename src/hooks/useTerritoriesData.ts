import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Territory {
  id: string;
  name: string;
  type: 'country' | 'state' | 'zone' | 'city' | 'area';
  parent_id: string | null;
  manager_id: string | null;
  country_id: string | null;
  state_id: string | null;
  city_id: string | null;
  zone_id: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  parent?: Territory;
  manager?: { id: string; name: string };
}

export function useTerritories(type?: string) {
  return useQuery({
    queryKey: ['territories', type],
    queryFn: async () => {
      let query = supabase
        .from('territories' as any)
        .select('*, parent:territories!parent_id(*), manager:profiles(id, name)')
        .order('name');
      if (type && type !== 'all') query = query.eq('type', type);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as Territory[];
    },
  });
}

export function useCreateTerritory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (territory: Partial<Territory>) => {
      const { data, error } = await supabase
        .from('territories' as any)
        .insert(territory)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Territory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['territories'] });
      toast.success('Territory created successfully');
    },
    onError: (error: Error) => toast.error(`Failed to create territory: ${error.message}`),
  });
}

export function useUpdateTerritory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Territory> & { id: string }) => {
      const { data, error } = await supabase
        .from('territories' as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Territory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['territories'] });
      toast.success('Territory updated successfully');
    },
    onError: (error: Error) => toast.error(`Failed to update territory: ${error.message}`),
  });
}

export function useDeleteTerritory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('territories' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['territories'] });
      toast.success('Territory deleted successfully');
    },
    onError: (error: Error) => toast.error(`Failed to delete territory: ${error.message}`),
  });
}
