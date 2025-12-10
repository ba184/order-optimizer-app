import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Product {
  id: string;
  name: string;
  sku: string;
  ptr: number;
  mrp: number;
  gst: number;
  stock: number;
  category: string | null;
  status: string | null;
}

export interface Order {
  id: string;
  order_number: string;
  order_type: string;
  distributor_id: string | null;
  retailer_id: string | null;
  created_by: string;
  items_count: number;
  subtotal: number;
  gst_amount: number;
  discount: number;
  total_amount: number;
  status: string;
  payment_status: string;
  notes: string | null;
  created_at: string;
  distributor?: { firm_name: string } | null;
  retailer?: { shop_name: string } | null;
  creator?: { name: string } | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  gst_percent: number;
  gst_amount: number;
  discount: number;
  free_goods: number;
  total_amount: number;
  product?: Product | null;
}

export interface CartItem {
  productId: string;
  quantity: number;
  freeGoods: number;
  discount: number;
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products' as any)
        .select('*')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return (data || []) as unknown as Product[];
    },
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders' as any)
        .select(`
          *,
          distributor:distributors(firm_name),
          retailer:retailers(shop_name),
          creator:profiles!orders_created_by_fkey(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as unknown as Order[];
    },
  });
}

export function useOrderItems(orderId: string | undefined) {
  return useQuery({
    queryKey: ['order-items', orderId],
    queryFn: async () => {
      if (!orderId) return [];
      const { data, error } = await supabase
        .from('order_items' as any)
        .select(`
          *,
          product:products(*)
        `)
        .eq('order_id', orderId);
      
      if (error) throw error;
      return (data || []) as unknown as OrderItem[];
    },
    enabled: !!orderId,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      orderType,
      distributorId,
      retailerId,
      cartItems,
      products,
      status = 'pending',
      notes,
    }: {
      orderType: 'primary' | 'secondary';
      distributorId: string;
      retailerId?: string;
      cartItems: CartItem[];
      products: Product[];
      status?: string;
      notes?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Calculate totals
      let subtotal = 0;
      let gstAmount = 0;
      let totalDiscount = 0;

      const orderItems = cartItems.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) throw new Error('Product not found');

        const itemSubtotal = product.ptr * item.quantity;
        const itemGst = (itemSubtotal * product.gst) / 100;
        const itemTotal = itemSubtotal + itemGst - item.discount;

        subtotal += itemSubtotal;
        gstAmount += itemGst;
        totalDiscount += item.discount;

        return {
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: product.ptr,
          gst_percent: product.gst,
          gst_amount: itemGst,
          discount: item.discount,
          free_goods: item.freeGoods,
          total_amount: itemTotal,
        };
      });

      const totalAmount = subtotal + gstAmount - totalDiscount;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders' as any)
        .insert({
          order_type: orderType,
          distributor_id: distributorId,
          retailer_id: retailerId || null,
          created_by: user.id,
          items_count: cartItems.length,
          subtotal,
          gst_amount: gstAmount,
          discount: totalDiscount,
          total_amount: totalAmount,
          status,
          notes,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderData = order as unknown as { id: string };

      // Create order items
      const itemsWithOrderId = orderItems.map(item => ({
        ...item,
        order_id: orderData.id,
      }));

      const { error: itemsError } = await supabase
        .from('order_items' as any)
        .insert(itemsWithOrderId);

      if (itemsError) throw itemsError;

      return orderData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create order: ' + error.message);
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('orders' as any)
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order status updated');
    },
    onError: (error) => {
      toast.error('Failed to update order: ' + error.message);
    },
  });
}
