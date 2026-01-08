import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface MarketingCollateral {
  id: string;
  name: string;
  code: string;
  type: 'sample' | 'banner' | 'gift' | 'pos_material' | 'led_display' | 'standee' | 'other';
  description: string | null;
  unit: string;
  current_stock: number;
  min_stock_threshold: number;
  value_per_unit: number;
  warehouse: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CollateralIssue {
  id: string;
  issue_number: string;
  collateral_id: string;
  quantity: number;
  issued_to_type: 'employee' | 'distributor' | 'retailer' | 'warehouse';
  issued_to_id: string | null;
  issued_to_name: string | null;
  issued_by: string | null;
  instructed_by: string | null;
  issue_stage: 'order' | 'dispatch' | 'delivery' | 'direct';
  related_order_id: string | null;
  in_out_type: 'in' | 'out';
  remarks: string | null;
  status: 'pending' | 'issued' | 'acknowledged' | 'returned' | 'cancelled';
  issued_at: string | null;
  acknowledged_at: string | null;
  returned_at: string | null;
  created_at: string;
  updated_at: string;
  collateral?: MarketingCollateral;
  issuer?: { name: string };
  instructor?: { name: string };
}

export interface CreateCollateralData {
  name: string;
  code: string;
  type: MarketingCollateral['type'];
  description?: string;
  unit?: string;
  current_stock?: number;
  min_stock_threshold?: number;
  value_per_unit?: number;
  warehouse?: string;
}

export interface CreateCollateralIssueData {
  collateral_id: string;
  quantity: number;
  issued_to_type: CollateralIssue['issued_to_type'];
  issued_to_id?: string;
  issued_to_name?: string;
  instructed_by?: string;
  issue_stage?: CollateralIssue['issue_stage'];
  related_order_id?: string;
  in_out_type?: 'in' | 'out';
  remarks?: string;
}

// Fetch all marketing collaterals
export function useMarketingCollaterals() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['marketing-collaterals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_collaterals')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as MarketingCollateral[];
    },
    enabled: !!user,
  });
}

// Fetch collateral issues with related data
export function useCollateralIssues(statusFilter?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['collateral-issues', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('collateral_issues')
        .select(`
          *,
          collateral:marketing_collaterals(*),
          issuer:profiles!collateral_issues_issued_by_fkey(name),
          instructor:profiles!collateral_issues_instructed_by_fkey(name)
        `)
        .order('created_at', { ascending: false });
      
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as CollateralIssue[];
    },
    enabled: !!user,
  });
}

// Create a new marketing collateral
export function useCreateCollateral() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateCollateralData) => {
      const { data: result, error } = await supabase
        .from('marketing_collaterals')
        .insert({
          ...data,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-collaterals'] });
      toast.success('Collateral created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create collateral');
    },
  });
}

// Update a marketing collateral
export function useUpdateCollateral() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<MarketingCollateral> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('marketing_collaterals')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-collaterals'] });
      toast.success('Collateral updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update collateral');
    },
  });
}

// Delete a marketing collateral
export function useDeleteCollateral() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('marketing_collaterals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-collaterals'] });
      toast.success('Collateral deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete collateral');
    },
  });
}

// Issue a collateral (create issue record and update stock)
export function useIssueCollateral() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateCollateralIssueData) => {
      // Get current stock first
      const { data: collateral } = await supabase
        .from('marketing_collaterals')
        .select('current_stock')
        .eq('id', data.collateral_id)
        .single();

      const inOutType = data.in_out_type || 'out';
      const stockChange = inOutType === 'out' ? -data.quantity : data.quantity;

      // Update stock
      if (collateral) {
        const newStock = Math.max(0, collateral.current_stock + stockChange);
        await supabase
          .from('marketing_collaterals')
          .update({ current_stock: newStock })
          .eq('id', data.collateral_id);
      }

      // Create the issue record (issue_number is auto-generated by trigger)
      const insertData = {
        collateral_id: data.collateral_id,
        quantity: data.quantity,
        issued_to_type: data.issued_to_type,
        issued_to_id: data.issued_to_id || null,
        issued_to_name: data.issued_to_name || null,
        instructed_by: data.instructed_by || null,
        issue_stage: data.issue_stage || 'direct',
        related_order_id: data.related_order_id || null,
        in_out_type: inOutType,
        remarks: data.remarks || null,
        issued_by: user?.id,
        status: 'pending',
      };

      const { data: issue, error: issueError } = await supabase
        .from('collateral_issues')
        .insert(insertData as any)
        .select()
        .single();

      if (issueError) throw issueError;

      return issue;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collateral-issues'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-collaterals'] });
      toast.success('Collateral issued successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to issue collateral');
    },
  });
}

// Update issue status
export function useUpdateIssueStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: CollateralIssue['status'] }) => {
      const updateData: Record<string, string> = { status };
      
      if (status === 'issued') {
        updateData.issued_at = new Date().toISOString();
      } else if (status === 'acknowledged') {
        updateData.acknowledged_at = new Date().toISOString();
      } else if (status === 'returned') {
        updateData.returned_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('collateral_issues')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // If returned, add stock back
      if (status === 'returned' && data) {
        const { data: collateral } = await supabase
          .from('marketing_collaterals')
          .select('current_stock')
          .eq('id', data.collateral_id)
          .single();

        if (collateral) {
          await supabase
            .from('marketing_collaterals')
            .update({ current_stock: collateral.current_stock + data.quantity })
            .eq('id', data.collateral_id);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collateral-issues'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-collaterals'] });
      toast.success('Status updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update status');
    },
  });
}

// Get collateral type display name
export function getCollateralTypeLabel(type: MarketingCollateral['type']): string {
  const labels: Record<MarketingCollateral['type'], string> = {
    sample: 'Sample',
    banner: 'Banner',
    gift: 'Gift',
    pos_material: 'POS Material',
    led_display: 'LED Display',
    standee: 'Standee',
    other: 'Other',
  };
  return labels[type] || type;
}

// Get issue stage display name
export function getIssueStageLabel(stage: CollateralIssue['issue_stage']): string {
  const labels: Record<CollateralIssue['issue_stage'], string> = {
    order: 'With Order',
    dispatch: 'At Dispatch',
    delivery: 'At Delivery',
    direct: 'Direct Issue',
  };
  return labels[stage] || stage;
}
