import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface PendingApproval {
  id: string;
  type: 'Order' | 'Expense' | 'Leave';
  reference: string;
  description: string;
  amount?: number;
  submittedBy: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
}

function getPriority(amount?: number): 'low' | 'medium' | 'high' {
  if (!amount) return 'low';
  if (amount > 100000) return 'high';
  if (amount > 30000) return 'medium';
  return 'low';
}

export function usePendingApprovals() {
  return useQuery({
    queryKey: ['pending-approvals'],
    queryFn: async () => {
      const approvals: PendingApproval[] = [];

      // Fetch pending orders
      const { data: orders } = await supabase
        .from('orders' as any)
        .select('id, order_number, order_type, total_amount, status, created_at, distributor:distributors(firm_name), creator:profiles!orders_created_by_fkey(name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (orders) {
        (orders as any[]).forEach(o => {
          approvals.push({
            id: o.id,
            type: 'Order',
            reference: o.order_number,
            description: `${o.order_type === 'primary' ? 'Primary' : 'Secondary'} Order: ${o.distributor?.firm_name || 'N/A'}`,
            amount: o.total_amount,
            submittedBy: o.creator?.name || 'Unknown',
            submittedAt: new Date(o.created_at).toLocaleString(),
            status: 'pending',
            priority: getPriority(o.total_amount),
          });
        });
      }

      // Fetch pending expenses
      const { data: expenses } = await supabase
        .from('expense_claims' as any)
        .select('id, claim_number, expense_type, total_amount, created_at, user_id')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (expenses) {
        (expenses as any[]).forEach(e => {
          approvals.push({
            id: e.id,
            type: 'Expense',
            reference: e.claim_number,
            description: `${e.expense_type} Claim`,
            amount: e.total_amount,
            submittedBy: 'Employee',
            submittedAt: new Date(e.created_at).toLocaleString(),
            status: 'pending',
            priority: getPriority(e.total_amount),
          });
        });
      }

      // Fetch pending leaves
      const { data: leaves } = await supabase
        .from('leaves' as any)
        .select('id, leave_type, days, reason, created_at, user:profiles!leaves_user_id_fkey(name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (leaves) {
        (leaves as any[]).forEach(l => {
          approvals.push({
            id: l.id,
            type: 'Leave',
            reference: `LV-${l.id.slice(0, 8).toUpperCase()}`,
            description: `${l.leave_type}: ${l.days} days - ${l.reason}`,
            submittedBy: l.user?.name || 'Employee',
            submittedAt: new Date(l.created_at).toLocaleString(),
            status: 'pending',
            priority: l.days > 3 ? 'medium' : 'low',
          });
        });
      }

      return approvals;
    },
  });
}

export function useApproveItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, type }: { id: string; type: string }) => {
      if (!user) throw new Error('Not authenticated');

      const now = new Date().toISOString();

      if (type === 'Order') {
        const { error } = await supabase
          .from('orders' as any)
          .update({ status: 'approved', approved_by: user.id, approved_at: now, updated_at: now })
          .eq('id', id);
        if (error) throw error;
      } else if (type === 'Expense') {
        const { error } = await supabase
          .from('expense_claims' as any)
          .update({ status: 'approved', approved_by: user.id, approved_at: now, updated_at: now })
          .eq('id', id);
        if (error) throw error;
      } else if (type === 'Leave') {
        const { error } = await supabase
          .from('leaves' as any)
          .update({ status: 'approved', approved_by: user.id, approved_at: now, updated_at: now })
          .eq('id', id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['expense-claims'] });
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      toast.success('Approved successfully');
    },
    onError: (error) => toast.error('Approval failed: ' + error.message),
  });
}

export function useRejectItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, type, reason }: { id: string; type: string; reason?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const now = new Date().toISOString();

      if (type === 'Order') {
        const { error } = await supabase
          .from('orders' as any)
          .update({ status: 'rejected', updated_at: now })
          .eq('id', id);
        if (error) throw error;
      } else if (type === 'Expense') {
        const { error } = await supabase
          .from('expense_claims' as any)
          .update({ status: 'rejected', rejection_reason: reason || 'Rejected', updated_at: now })
          .eq('id', id);
        if (error) throw error;
      } else if (type === 'Leave') {
        const { error } = await supabase
          .from('leaves' as any)
          .update({ status: 'rejected', rejection_reason: reason || 'Rejected', updated_at: now })
          .eq('id', id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['expense-claims'] });
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      toast.success('Rejected successfully');
    },
    onError: (error) => toast.error('Rejection failed: ' + error.message),
  });
}
