import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface MarketingCollateral {
  id: string;
  code: string;
  name: string;
  type: string;
  description: string | null;
  unit: string | null;
  current_stock: number;
  min_stock_threshold: number | null;
  value_per_unit: number | null;
  warehouse: string | null;
  status: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CollateralIssue {
  id: string;
  issue_number: string;
  collateral_id: string;
  quantity: number;
  in_out_type: string;
  issue_stage: string | null;
  issued_to_type: string;
  issued_to_id: string | null;
  issued_to_name: string | null;
  related_order_id: string | null;
  instructed_by: string | null;
  issued_by: string | null;
  in_notes: string | null;
  out_notes: string | null;
  remarks: string | null;
  issued_at: string | null;
  acknowledged_at: string | null;
  returned_at: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  collateral?: { name: string; code: string; type: string } | null;
  instructed_by_user?: { name: string } | null;
  issued_by_user?: { name: string } | null;
  order?: { order_number: string } | null;
}

export const COLLATERAL_TYPES = [
  { value: 'led_tv', label: 'LED TV' },
  { value: 'banner', label: 'Banner' },
  { value: 'gift', label: 'Gift' },
  { value: 'pos_material', label: 'POS Material' },
  { value: 'sample', label: 'Sample' },
  { value: 'display', label: 'Display Stand' },
  { value: 'signage', label: 'Signage' },
  { value: 'brochure', label: 'Brochure' },
];

export const ISSUE_STAGES = [
  { value: 'requested', label: 'Requested' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'dispatched', label: 'Dispatched' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'returned', label: 'Returned' },
];

export const ISSUE_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'dispatched', label: 'Dispatched' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'returned', label: 'Returned' },
  { value: 'cancelled', label: 'Cancelled' },
];

// Fetch all marketing collaterals
export function useMarketingCollaterals() {
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
  });
}

// Fetch active collaterals only
export function useActiveCollaterals() {
  return useQuery({
    queryKey: ['marketing-collaterals', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_collaterals')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      return data as MarketingCollateral[];
    },
  });
}

// Fetch all collateral issues
export function useCollateralIssues() {
  return useQuery({
    queryKey: ['collateral-issues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collateral_issues')
        .select(`
          *,
          collateral:marketing_collaterals(name, code, type)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as CollateralIssue[];
    },
  });
}

// Fetch issues by order
export function useCollateralIssuesByOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ['collateral-issues', 'order', orderId],
    queryFn: async () => {
      if (!orderId) return [];
      const { data, error } = await supabase
        .from('collateral_issues')
        .select(`
          *,
          collateral:marketing_collaterals(name, code, type)
        `)
        .eq('related_order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CollateralIssue[];
    },
    enabled: !!orderId,
  });
}

// Create marketing collateral
export function useCreateMarketingCollateral() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<MarketingCollateral, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
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
      toast.success('Marketing collateral created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create collateral: ' + error.message);
    },
  });
}

// Update marketing collateral
export function useUpdateMarketingCollateral() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<MarketingCollateral> & { id: string }) => {
      const { error } = await supabase
        .from('marketing_collaterals')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-collaterals'] });
      toast.success('Marketing collateral updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update collateral: ' + error.message);
    },
  });
}

// Delete marketing collateral
export function useDeleteMarketingCollateral() {
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
      toast.success('Marketing collateral deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete collateral: ' + error.message);
    },
  });
}

// Create collateral issue
export function useCreateCollateralIssue() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      collateral_id: string;
      quantity: number;
      issued_to_type: string;
      issued_to_id?: string;
      issued_to_name: string;
      related_order_id?: string;
      instructed_by?: string;
      remarks?: string;
      in_notes?: string;
    }) => {
      const { data: result, error } = await supabase
        .from('collateral_issues')
        .insert({
          collateral_id: data.collateral_id,
          quantity: data.quantity,
          issued_to_type: data.issued_to_type,
          issued_to_id: data.issued_to_id || null,
          issued_to_name: data.issued_to_name,
          related_order_id: data.related_order_id || null,
          instructed_by: data.instructed_by || user?.id,
          issued_by: user?.id,
          remarks: data.remarks || null,
          status: 'pending',
          issue_stage: 'requested',
          in_out_type: 'out',
        } as any)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collateral-issues'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-collaterals'] });
      toast.success('Collateral issue created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create issue: ' + error.message);
    },
  });
}

// Update collateral issue
export function useUpdateCollateralIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<CollateralIssue> & { id: string }) => {
      const { error } = await supabase
        .from('collateral_issues')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collateral-issues'] });
      toast.success('Issue updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update issue: ' + error.message);
    },
  });
}

// Update issue status with notes
export function useUpdateIssueStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      issue_stage,
      in_notes,
      out_notes,
    }: {
      id: string;
      status: string;
      issue_stage: string;
      in_notes?: string;
      out_notes?: string;
    }) => {
      const updateData: Record<string, unknown> = { status, issue_stage };
      
      if (in_notes) updateData.in_notes = in_notes;
      if (out_notes) updateData.out_notes = out_notes;
      
      if (status === 'dispatched') {
        updateData.issued_at = new Date().toISOString();
      } else if (status === 'delivered') {
        updateData.acknowledged_at = new Date().toISOString();
      } else if (status === 'returned') {
        updateData.returned_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('collateral_issues')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collateral-issues'] });
      toast.success('Issue status updated');
    },
    onError: (error) => {
      toast.error('Failed to update status: ' + error.message);
    },
  });
}

// Bulk create collateral issues for order
export function useCreateOrderCollaterals() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      orderId,
      items,
      issuedToType,
      issuedToId,
      issuedToName,
      remarks,
    }: {
      orderId: string;
      items: Array<{ collateralId: string; quantity: number; warehouse?: string }>;
      issuedToType: string;
      issuedToId: string;
      issuedToName: string;
      remarks?: string;
    }) => {
      for (const item of items) {
        const { error } = await supabase
          .from('collateral_issues')
          .insert({
            collateral_id: item.collateralId,
            quantity: item.quantity,
            issued_to_type: issuedToType,
            issued_to_id: issuedToId,
            issued_to_name: issuedToName,
            related_order_id: orderId,
            issued_by: user?.id,
            instructed_by: user?.id,
            status: 'pending',
            issue_stage: 'requested',
            in_out_type: 'out',
            remarks: remarks || null,
          } as any);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collateral-issues'] });
      toast.success('Collaterals added to order');
    },
    onError: (error) => {
      toast.error('Failed to add collaterals: ' + error.message);
    },
  });
}

// Calculate collateral stats
export function useCollateralStats(issues: CollateralIssue[]) {
  const totalIssued = issues.filter(i => i.in_out_type === 'out').length;
  const pending = issues.filter(i => i.status === 'pending').length;
  const dispatched = issues.filter(i => i.status === 'dispatched').length;
  const delivered = issues.filter(i => i.status === 'delivered').length;
  const returned = issues.filter(i => i.status === 'returned').length;

  return { totalIssued, pending, dispatched, delivered, returned };
}
