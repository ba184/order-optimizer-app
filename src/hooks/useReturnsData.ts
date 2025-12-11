import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'refunded';
export type ReturnType = 'return' | 'damage' | 'expiry' | 'wrong_product';

export interface ReturnItem {
  id: string;
  return_id: string;
  product_id: string | null;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  reason: string | null;
  created_at: string;
}

export interface Return {
  id: string;
  return_number: string;
  return_type: ReturnType;
  source: string;
  source_name: string;
  source_id: string | null;
  order_id: string | null;
  total_value: number;
  status: ReturnStatus;
  reason: string | null;
  images: string[];
  approved_by: string | null;
  rejection_reason: string | null;
  processed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  items?: ReturnItem[];
  order?: { order_number: string } | null;
}

export function useReturns() {
  return useQuery({
    queryKey: ['returns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('returns' as any)
        .select(`
          *,
          order:orders(order_number)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Return[];
    },
  });
}

export function useReturnItems(returnId: string | undefined) {
  return useQuery({
    queryKey: ['return-items', returnId],
    queryFn: async () => {
      if (!returnId) return [];
      const { data, error } = await supabase
        .from('return_items' as any)
        .select('*')
        .eq('return_id', returnId);

      if (error) throw error;
      return (data || []) as unknown as ReturnItem[];
    },
    enabled: !!returnId,
  });
}

export function useCreateReturn() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      return_type,
      source,
      source_name,
      source_id,
      order_id,
      reason,
      items,
    }: {
      return_type: ReturnType;
      source: string;
      source_name: string;
      source_id?: string;
      order_id?: string;
      reason: string;
      items: { product_id?: string; product_name: string; sku: string; quantity: number; unit_price: number; reason?: string }[];
    }) => {
      if (!user) throw new Error('User not authenticated');

      const total_value = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
      const return_number = `RET-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;

      const { data: returnData, error: returnError } = await supabase
        .from('returns' as any)
        .insert({
          return_number,
          return_type,
          source,
          source_name,
          source_id: source_id || null,
          order_id: order_id || null,
          total_value,
          reason,
          created_by: user.id,
        })
        .select()
        .single();

      if (returnError) throw returnError;

      const returnRecord = returnData as unknown as { id: string };

      const returnItems = items.map(item => ({
        return_id: returnRecord.id,
        product_id: item.product_id || null,
        product_name: item.product_name,
        sku: item.sku,
        quantity: item.quantity,
        unit_price: item.unit_price,
        reason: item.reason || null,
      }));

      const { error: itemsError } = await supabase
        .from('return_items' as any)
        .insert(returnItems);

      if (itemsError) throw itemsError;

      return returnRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      toast.success('Return request created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create return: ' + error.message);
    },
  });
}

export function useUpdateReturnStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      rejection_reason,
    }: {
      id: string;
      status: ReturnStatus;
      rejection_reason?: string;
    }) => {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'rejected' && rejection_reason) {
        updateData.rejection_reason = rejection_reason;
      }

      if (status === 'processing' || status === 'completed') {
        updateData.processed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('returns' as any)
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      toast.success('Return status updated');
    },
    onError: (error) => {
      toast.error('Failed to update return: ' + error.message);
    },
  });
}

export function useDeleteReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('returns' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      toast.success('Return deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete return: ' + error.message);
    },
  });
}
