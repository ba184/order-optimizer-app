import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string | null;
  mrp: number;
  ptr: number;
  gst: number;
  stock: number;
  status: string | null;
}

export function useProducts() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!user,
  });
}
