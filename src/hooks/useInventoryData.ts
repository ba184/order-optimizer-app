import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Product } from './useOrdersData';

export interface InventoryBatch {
  id: string;
  product_id: string;
  batch_number: string;
  quantity: number;
  manufacturing_date: string | null;
  expiry_date: string | null;
  warehouse: string | null;
  distributor_id: string | null;
  purchase_price: number;
  status: string;
  created_by: string | null;
  created_at: string;
  product?: Product | null;
  distributor?: { firm_name: string } | null;
  creator?: { name: string } | null;
}

export interface StockTransfer {
  id: string;
  transfer_number: string;
  from_location: string;
  from_distributor_id: string | null;
  to_location: string;
  to_distributor_id: string | null;
  status: string;
  notes: string | null;
  created_by: string;
  created_at: string;
  from_distributor?: { firm_name: string } | null;
  to_distributor?: { firm_name: string } | null;
  items?: StockTransferItem[];
}

export interface StockTransferItem {
  id: string;
  transfer_id: string;
  product_id: string;
  quantity: number;
  product?: Product | null;
}

export function useInventoryBatches() {
  return useQuery({
    queryKey: ['inventory-batches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_batches' as any)
        .select(`
          *,
          product:products(*),
          distributor:distributors(firm_name),
          creator:profiles!inventory_batches_created_by_fkey(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as unknown as InventoryBatch[];
    },
  });
}

export function useStockTransfers() {
  return useQuery({
    queryKey: ['stock-transfers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_transfers' as any)
        .select(`
          *,
          from_distributor:distributors!stock_transfers_from_distributor_id_fkey(firm_name),
          to_distributor:distributors!stock_transfers_to_distributor_id_fkey(firm_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as unknown as StockTransfer[];
    },
  });
}

export function useStockTransferItems(transferId: string | undefined) {
  return useQuery({
    queryKey: ['stock-transfer-items', transferId],
    queryFn: async () => {
      if (!transferId) return [];
      const { data, error } = await supabase
        .from('stock_transfer_items' as any)
        .select(`
          *,
          product:products(*)
        `)
        .eq('transfer_id', transferId);
      
      if (error) throw error;
      return (data || []) as unknown as StockTransferItem[];
    },
    enabled: !!transferId,
  });
}

export function useCreateInventoryBatch() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (batch: {
      product_id: string;
      batch_number: string;
      quantity: number;
      manufacturing_date?: string;
      expiry_date?: string;
      warehouse?: string;
      distributor_id?: string;
      purchase_price?: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('inventory_batches' as any)
        .insert({
          ...batch,
          created_by: user.id,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-batches'] });
      toast.success('Stock entry created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create stock entry: ' + error.message);
    },
  });
}

export function useUpdateInventoryBatchStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updateData: any = { status, updated_at: new Date().toISOString() };
      if (status === 'approved' && user) {
        updateData.approved_by = user.id;
        updateData.approved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('inventory_batches' as any)
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['inventory-batches'] });
      toast.success(`Stock entry ${status}`);
    },
    onError: (error) => {
      toast.error('Failed to update stock entry: ' + error.message);
    },
  });
}

export function useCreateStockTransfer() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      from_location,
      from_distributor_id,
      to_location,
      to_distributor_id,
      items,
      notes,
    }: {
      from_location: string;
      from_distributor_id?: string;
      to_location: string;
      to_distributor_id?: string;
      items: { product_id: string; quantity: number }[];
      notes?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Create transfer
      const { data: transfer, error: transferError } = await supabase
        .from('stock_transfers' as any)
        .insert({
          from_location,
          from_distributor_id: from_distributor_id || null,
          to_location,
          to_distributor_id: to_distributor_id || null,
          notes,
          created_by: user.id,
          status: 'pending',
        })
        .select()
        .single();

      if (transferError) throw transferError;

      const transferData = transfer as unknown as { id: string };

      // Create transfer items
      const transferItems = items.map(item => ({
        transfer_id: transferData.id,
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('stock_transfer_items' as any)
        .insert(transferItems);

      if (itemsError) throw itemsError;

      return transferData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-transfers'] });
      toast.success('Stock transfer created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create transfer: ' + error.message);
    },
  });
}

export function useUpdateStockTransferStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updateData: any = { status, updated_at: new Date().toISOString() };
      if (status === 'dispatched') {
        updateData.dispatched_at = new Date().toISOString();
      } else if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('stock_transfers' as any)
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-transfers'] });
      toast.success('Transfer status updated');
    },
    onError: (error) => {
      toast.error('Failed to update transfer: ' + error.message);
    },
  });
}

// Helper function to calculate inventory summary from batches
export function calculateInventorySummary(batches: InventoryBatch[]) {
  const productMap = new Map<string, {
    product: Product | null;
    warehouseStock: number;
    distributorStock: Record<string, number>;
    totalStock: number;
    expiryAlerts: number;
  }>();

  const approvedBatches = batches.filter(b => b.status === 'approved');
  const today = new Date();
  const alertThreshold = 90; // days

  approvedBatches.forEach(batch => {
    const productId = batch.product_id;
    const existing = productMap.get(productId) || {
      product: batch.product || null,
      warehouseStock: 0,
      distributorStock: {},
      totalStock: 0,
      expiryAlerts: 0,
    };

    if (batch.distributor_id && batch.distributor) {
      const distName = batch.distributor.firm_name;
      existing.distributorStock[distName] = (existing.distributorStock[distName] || 0) + batch.quantity;
    } else {
      existing.warehouseStock += batch.quantity;
    }
    existing.totalStock += batch.quantity;

    // Check expiry
    if (batch.expiry_date) {
      const expiryDate = new Date(batch.expiry_date);
      const daysToExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysToExpiry <= alertThreshold && daysToExpiry > 0) {
        existing.expiryAlerts += 1;
      }
    }

    productMap.set(productId, existing);
  });

  return Array.from(productMap.entries()).map(([id, data]) => ({
    id,
    ...data,
  }));
}

// Helper function to get expiry alerts
export function getExpiryAlerts(batches: InventoryBatch[], alertThreshold = 90) {
  const today = new Date();
  
  return batches
    .filter(b => b.status === 'approved' && b.expiry_date)
    .map(batch => {
      const expiryDate = new Date(batch.expiry_date!);
      const daysToExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return {
        ...batch,
        daysToExpiry,
        location: batch.distributor?.firm_name || batch.warehouse || 'Warehouse',
      };
    })
    .filter(b => b.daysToExpiry <= alertThreshold && b.daysToExpiry > 0)
    .sort((a, b) => a.daysToExpiry - b.daysToExpiry);
}
