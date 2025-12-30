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
  entry_mode: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
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
  requested_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  from_distributor?: { firm_name: string } | null;
  to_distributor?: { firm_name: string } | null;
  requester?: { name: string } | null;
  approver?: { name: string } | null;
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
          to_distributor:distributors!stock_transfers_to_distributor_id_fkey(firm_name),
          requester:profiles!stock_transfers_requested_by_fkey(name),
          approver:profiles!stock_transfers_approved_by_fkey(name)
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
      entry_mode?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('inventory_batches' as any)
        .insert({
          ...batch,
          entry_mode: batch.entry_mode || 'manual',
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

export function useUpdateInventoryBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      quantity?: number;
      manufacturing_date?: string;
      expiry_date?: string;
      warehouse?: string;
      distributor_id?: string;
      purchase_price?: number;
    }) => {
      const { error } = await supabase
        .from('inventory_batches' as any)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-batches'] });
      toast.success('Stock entry updated');
    },
    onError: (error) => {
      toast.error('Failed to update stock entry: ' + error.message);
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

export function useDeleteInventoryBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Soft delete - just update status
      const { error } = await supabase
        .from('inventory_batches' as any)
        .update({ status: 'deleted', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-batches'] });
      toast.success('Stock entry deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete stock entry: ' + error.message);
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
      items: { product_id: string; quantity: number; batch_number?: string }[];
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
          requested_by: user.id,
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
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updateData: any = { status, updated_at: new Date().toISOString() };
      if (status === 'approved' && user) {
        updateData.approved_by = user.id;
        updateData.approved_at = new Date().toISOString();
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
export function calculateInventorySummary(batches: InventoryBatch[], products: Product[] = []) {
  const productMap = new Map<string, {
    product: Product | null;
    warehouseStock: number;
    distributorStock: Record<string, number>;
    totalStock: number;
    expiryAlerts: number;
    lowStockThreshold: number;
  }>();

  const approvedBatches = batches.filter(b => b.status === 'approved');
  const today = new Date();
  const alertThreshold = 90; // days

  approvedBatches.forEach(batch => {
    const productId = batch.product_id;
    const product = batch.product || products.find(p => p.id === productId) || null;
    const existing = productMap.get(productId) || {
      product,
      warehouseStock: 0,
      distributorStock: {},
      totalStock: 0,
      expiryAlerts: 0,
      lowStockThreshold: (product as any)?.low_stock_threshold || 50,
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
    isLowStock: data.totalStock < data.lowStockThreshold,
  }));
}

// Helper function to get expiry alerts with status
export type ExpiryStatus = 'safe' | 'warning' | 'expired';

export interface ExpiryAlert extends InventoryBatch {
  daysToExpiry: number;
  location: string;
  expiryStatus: ExpiryStatus;
}

export function getExpiryAlerts(batches: InventoryBatch[], alertThreshold = 90): ExpiryAlert[] {
  const today = new Date();
  
  return batches
    .filter(b => b.status === 'approved' && b.expiry_date)
    .map(batch => {
      const expiryDate = new Date(batch.expiry_date!);
      const daysToExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let expiryStatus: ExpiryStatus = 'safe';
      if (daysToExpiry <= 0) {
        expiryStatus = 'expired';
      } else if (daysToExpiry <= 30) {
        expiryStatus = 'warning';
      } else if (daysToExpiry <= alertThreshold) {
        expiryStatus = 'warning';
      }
      
      return {
        ...batch,
        daysToExpiry,
        location: batch.distributor?.firm_name || batch.warehouse || 'Warehouse',
        expiryStatus,
      };
    })
    .filter(b => b.daysToExpiry <= alertThreshold)
    .sort((a, b) => a.daysToExpiry - b.daysToExpiry);
}

// Get all expiry items including expired ones
export function getAllExpiryItems(batches: InventoryBatch[]): ExpiryAlert[] {
  const today = new Date();
  
  return batches
    .filter(b => b.status === 'approved' && b.expiry_date)
    .map(batch => {
      const expiryDate = new Date(batch.expiry_date!);
      const daysToExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let expiryStatus: ExpiryStatus = 'safe';
      if (daysToExpiry <= 0) {
        expiryStatus = 'expired';
      } else if (daysToExpiry <= 30) {
        expiryStatus = 'warning';
      }
      
      return {
        ...batch,
        daysToExpiry,
        location: batch.distributor?.firm_name || batch.warehouse || 'Warehouse',
        expiryStatus,
      };
    })
    .sort((a, b) => a.daysToExpiry - b.daysToExpiry);
}