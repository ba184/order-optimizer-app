import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ExpenseClaim {
  id: string;
  claim_number: string;
  user_id: string;
  expense_type: string;
  expense_date: string | null;
  total_amount: number;
  bill_photo: string | null;
  description: string | null;
  status: string;
  rejection_reason: string | null;
  created_by_role: string;
  submitted_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  user_name?: string;
}

export interface CreateExpenseData {
  user_id?: string;
  expense_type: string;
  expense_date: string;
  total_amount: number;
  bill_photo?: string;
  description?: string;
}

export function useExpenseClaims(statusFilter?: string) {
  return useQuery({
    queryKey: ['expense-claims', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('expense_claims')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch user names for each claim
      const claimsWithNames = await Promise.all(
        (data || []).map(async (claim) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', claim.user_id)
            .maybeSingle();
          return {
            ...claim,
            user_name: profile?.name || 'Unknown User',
          };
        })
      );

      return claimsWithNames as ExpenseClaim[];
    },
  });
}

export function useCreateExpenseClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateExpenseData & { isAdmin?: boolean }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const isAdmin = data.isAdmin || false;
      const userId = data.user_id || user.user.id;

      // Check for duplicate: same date + type + amount
      const { data: existing } = await supabase
        .from('expense_claims')
        .select('id')
        .eq('user_id', userId)
        .eq('expense_type', data.expense_type)
        .eq('expense_date', data.expense_date)
        .eq('total_amount', data.total_amount)
        .maybeSingle();

      if (existing) {
        throw new Error('Duplicate expense: Same date, type and amount already exists');
      }

      const insertData = {
        user_id: userId,
        expense_type: data.expense_type,
        expense_date: data.expense_date,
        total_amount: data.total_amount,
        bill_photo: data.bill_photo,
        description: data.description,
        status: isAdmin ? 'approved' : 'pending',
        created_by_role: isAdmin ? 'admin' : 'fse',
        submitted_at: new Date().toISOString(),
        approved_by: isAdmin ? user.user.id : null,
        approved_at: isAdmin ? new Date().toISOString() : null,
        claim_number: '',
        start_date: data.expense_date,
        end_date: data.expense_date,
      };

      const { data: result, error } = await supabase
        .from('expense_claims')
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expense-claims'] });
      toast.success(variables.isAdmin ? 'Expense created and auto-approved' : 'Expense submitted for approval');
    },
    onError: (error) => {
      toast.error('Failed to submit expense: ' + error.message);
    },
  });
}

export function useUpdateExpenseClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ExpenseClaim> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('expense_claims')
        .update(data as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-claims'] });
      toast.success('Expense claim updated');
    },
    onError: (error) => {
      toast.error('Failed to update expense claim: ' + error.message);
    },
  });
}

export function useApproveExpenseClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data: result, error } = await supabase
        .from('expense_claims')
        .update({
          status: 'approved',
          approved_by: user.user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-claims'] });
      toast.success('Expense claim approved');
    },
    onError: (error) => {
      toast.error('Failed to approve claim: ' + error.message);
    },
  });
}

export function useRejectExpenseClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data: result, error } = await supabase
        .from('expense_claims')
        .update({
          status: 'rejected',
          approved_by: user.user.id,
          approved_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-claims'] });
      toast.success('Expense claim rejected');
    },
    onError: (error) => {
      toast.error('Failed to reject claim: ' + error.message);
    },
  });
}

export function useEmployees() {
  return useQuery({
    queryKey: ['employees-for-expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      return data || [];
    },
  });
}
