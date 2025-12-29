import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ============= DISTRIBUTORS =============
export function useDistributors() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['distributors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('distributors')
        .select('*')
        .order('firm_name');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useDistributor(id: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['distributors', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('distributors')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateDistributor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const { data: result, error } = await supabase
        .from('distributors')
        .insert(data as any)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributors'] });
      toast.success('Distributor created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create distributor');
    },
  });
}

export function useUpdateDistributor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const { data: result, error } = await supabase
        .from('distributors')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributors'] });
      toast.success('Distributor updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update distributor');
    },
  });
}

export function useDeleteDistributor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('distributors').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributors'] });
      toast.success('Distributor deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete distributor');
    },
  });
}

// ============= RETAILERS =============
export function useRetailers() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['retailers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('retailers')
        .select(`
          *,
          distributors:distributor_id (id, firm_name, code)
        `)
        .order('shop_name');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useRetailer(id: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['retailers', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('retailers')
        .select(`
          *,
          distributors:distributor_id (id, firm_name, code)
        `)
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateRetailer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      code: string;
      shop_name: string;
      owner_name: string;
      address?: string;
      city?: string;
      state?: string;
      phone?: string;
      email?: string;
      category?: string;
      distributor_id?: string;
      status?: string;
    }) => {
      const { data: result, error } = await supabase
        .from('retailers')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retailers'] });
      toast.success('Retailer created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create retailer');
    },
  });
}

export function useUpdateRetailer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const { data: result, error } = await supabase
        .from('retailers')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retailers'] });
      toast.success('Retailer updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update retailer');
    },
  });
}

export function useDeleteRetailer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('retailers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retailers'] });
      toast.success('Retailer deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete retailer');
    },
  });
}
