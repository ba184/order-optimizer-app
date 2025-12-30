import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  location_type: 'central' | 'regional' | 'distributor';
  address: string | null;
  state: string;
  city: string;
  contact_person: string | null;
  contact_number: string | null;
  status: 'active' | 'inactive';
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateWarehouseData {
  name: string;
  code: string;
  location_type: 'central' | 'regional' | 'distributor';
  address?: string;
  state: string;
  city: string;
  contact_person?: string;
  contact_number?: string;
  status?: 'active' | 'inactive';
}

export const useWarehouses = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Warehouse[];
    },
    enabled: !!user,
  });
};

export const useCreateWarehouse = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (warehouse: CreateWarehouseData) => {
      const { data, error } = await supabase
        .from('warehouses')
        .insert([{ ...warehouse, created_by: user?.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success('Warehouse created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create warehouse: ${error.message}`);
    },
  });
};

export const useUpdateWarehouse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Warehouse> & { id: string }) => {
      const { data, error } = await supabase
        .from('warehouses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success('Warehouse updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update warehouse: ${error.message}`);
    },
  });
};

export const useDeleteWarehouse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('warehouses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success('Warehouse deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete warehouse: ${error.message}`);
    },
  });
};
