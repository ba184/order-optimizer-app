import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PreOrderScheme {
  id: string;
  name: string;
  description: string | null;
  launch_date: string;
  pre_order_start: string | null;
  pre_order_end: string | null;
  pre_order_target: number;
  pre_order_achieved: number;
  status: string | null;
}

export interface PreOrder {
  id: string;
  order_number: string;
  scheme_id: string | null;
  distributor_id: string | null;
  total_value: number;
  advance_collected: number;
  expected_delivery: string | null;
  actual_delivery: string | null;
  status: string | null;
  remarks: string | null;
  created_by: string;
  created_at: string;
  scheme?: { name: string } | null;
  distributor?: { firm_name: string } | null;
  creator?: { name: string } | null;
  items?: PreOrderItem[];
}

export interface PreOrderItem {
  id: string;
  pre_order_id: string;
  product_id: string | null;
  quantity: number;
  unit_price: number;
  total_amount: number;
  product?: { name: string; sku: string } | null;
}

export function usePreOrderSchemes() {
  return useQuery({
    queryKey: ['pre-order-schemes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schemes')
        .select('*')
        .eq('status', 'active')
        .order('start_date');
      
      if (error) throw error;
      
      // Map schemes to PreOrderScheme format
      return (data || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        launch_date: s.start_date,
        pre_order_start: s.start_date,
        pre_order_end: s.end_date,
        pre_order_target: s.min_quantity || 0,
        pre_order_achieved: 0,
        status: s.status,
      })) as PreOrderScheme[];
    },
  });
}

export function usePreOrders() {
  return useQuery({
    queryKey: ['pre-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pre_orders' as any)
        .select(`
          *,
          scheme:schemes(name),
          distributor:distributors(firm_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as unknown as PreOrder[];
    },
  });
}

export function usePreOrderItems(preOrderId: string | undefined) {
  return useQuery({
    queryKey: ['pre-order-items', preOrderId],
    queryFn: async () => {
      if (!preOrderId) return [];
      const { data, error } = await supabase
        .from('pre_order_items' as any)
        .select(`
          *,
          product:products(name, sku)
        `)
        .eq('pre_order_id', preOrderId);
      
      if (error) throw error;
      return (data || []) as unknown as PreOrderItem[];
    },
    enabled: !!preOrderId,
  });
}

export function useCreatePreOrder() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      schemeId,
      distributorId,
      items,
      advanceCollected,
      expectedDelivery,
      remarks,
    }: {
      schemeId: string;
      distributorId: string;
      items: { productId: string; quantity: number; unitPrice: number }[];
      advanceCollected: number;
      expectedDelivery?: string;
      remarks?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const totalValue = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

      // Create pre-order
      const { data: preOrder, error: preOrderError } = await supabase
        .from('pre_orders' as any)
        .insert({
          scheme_id: schemeId,
          distributor_id: distributorId,
          total_value: totalValue,
          advance_collected: advanceCollected,
          expected_delivery: expectedDelivery,
          remarks,
          created_by: user.id,
        })
        .select()
        .single();

      if (preOrderError) throw preOrderError;

      const preOrderData = preOrder as unknown as { id: string };

      // Create pre-order items
      if (items.length > 0) {
        const preOrderItems = items.map(item => ({
          pre_order_id: preOrderData.id,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_amount: item.quantity * item.unitPrice,
        }));

        const { error: itemsError } = await supabase
          .from('pre_order_items' as any)
          .insert(preOrderItems);

        if (itemsError) throw itemsError;
      }

      return preOrderData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pre-orders'] });
      queryClient.invalidateQueries({ queryKey: ['pre-order-schemes'] });
      toast.success('Pre-order booked successfully');
    },
    onError: (error) => {
      toast.error('Failed to book pre-order: ' + error.message);
    },
  });
}

export function useUpdatePreOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, actualDelivery }: { id: string; status: string; actualDelivery?: string }) => {
      const updateData: any = { status, updated_at: new Date().toISOString() };
      if (actualDelivery) {
        updateData.actual_delivery = actualDelivery;
      }

      const { error } = await supabase
        .from('pre_orders' as any)
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pre-orders'] });
      toast.success('Pre-order status updated');
    },
    onError: (error) => {
      toast.error('Failed to update pre-order: ' + error.message);
    },
  });
}
