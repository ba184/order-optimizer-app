import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Scheme {
  id: string;
  name: string;
  type: string;
  description: string | null;
  start_date: string;
  end_date: string;
  min_quantity: number | null;
  free_quantity: number | null;
  discount_percent: number | null;
  applicable_products: string[];
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useSchemes() {
  return useQuery({
    queryKey: ['schemes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schemes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Scheme[];
    },
  });
}

export function useCreateScheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scheme: Omit<Scheme, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('schemes')
        .insert({
          ...scheme,
          created_by: userData.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemes'] });
    },
  });
}

export function useUpdateScheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Scheme> & { id: string }) => {
      const { data, error } = await supabase
        .from('schemes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemes'] });
    },
  });
}

export function useDeleteScheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('schemes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemes'] });
    },
  });
}
