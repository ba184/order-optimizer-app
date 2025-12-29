import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Sample {
  id: string;
  sku: string;
  name: string;
  type: string;
  cost_price: number;
  stock: number;
  description: string | null;
  status: string;
  product_id: string | null;
  created_at: string;
  updated_at: string;
  issued_this_month?: number;
  conversions?: number;
}

export interface SampleIssue {
  id: string;
  sample_id: string;
  quantity: number;
  issued_to_id: string | null;
  issued_to_name: string;
  issued_to_type: string;
  issued_by: string;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  request_date: string;
  created_by_role: string;
  acknowledged: boolean;
  acknowledged_at: string | null;
  acknowledgement_photo: string | null;
  converted_to_order: boolean;
  order_id: string | null;
  order_value: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  sample_name?: string;
  issued_by_name?: string;
}

export interface SampleBudget {
  id: string;
  user_id: string;
  month: number;
  year: number;
  monthly_budget: number;
  used_amount: number;
}

export interface CreateSampleData {
  sku: string;
  name: string;
  type: string;
  cost_price: number;
  stock: number;
  description?: string;
  product_id?: string;
}

export interface CreateSampleIssueData {
  employee_id: string;
  items: { sample_id: string; quantity: number }[];
  remarks?: string;
  isAdmin?: boolean;
}

export function useSamples() {
  return useQuery({
    queryKey: ['samples'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('samples')
        .select('*')
        .order('name');

      if (error) throw error;

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const startOfMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;

      const samplesWithStats = await Promise.all(
        (data || []).map(async (sample) => {
          const { data: issues } = await supabase
            .from('sample_issues')
            .select('quantity, converted_to_order, status')
            .eq('sample_id', sample.id)
            .eq('status', 'approved')
            .gte('created_at', startOfMonth);

          const issuedThisMonth = (issues || []).reduce((sum, i) => sum + i.quantity, 0);
          const conversions = (issues || []).filter((i) => i.converted_to_order).length;

          return {
            ...sample,
            issued_this_month: issuedThisMonth,
            conversions,
          };
        })
      );

      return samplesWithStats as Sample[];
    },
  });
}

export function useSampleIssues(statusFilter?: string) {
  return useQuery({
    queryKey: ['sample-issues', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('sample_issues')
        .select('*, samples(name, type)')
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      const issuesWithNames = await Promise.all(
        (data || []).map(async (issue) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', issue.issued_by)
            .maybeSingle();

          return {
            ...issue,
            sample_name: (issue.samples as any)?.name || 'Unknown Sample',
            sample_type: (issue.samples as any)?.type || 'sample',
            issued_by_name: profile?.name || 'Unknown User',
          };
        })
      );

      return issuesWithNames as SampleIssue[];
    },
  });
}

export function useCurrentBudget() {
  return useQuery({
    queryKey: ['sample-budget-current'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const { data, error } = await supabase
        .from('sample_budgets')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return {
          id: '',
          user_id: user.user.id,
          month: currentMonth,
          year: currentYear,
          monthly_budget: 5000,
          used_amount: 0,
        } as SampleBudget;
      }

      return data as SampleBudget;
    },
  });
}

export function useCreateSample() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSampleData) => {
      const { data: result, error } = await supabase
        .from('samples')
        .insert(data as any)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['samples'] });
      toast.success('Sample/Gift created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create sample: ' + error.message);
    },
  });
}

export function useUpdateSample() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Sample> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('samples')
        .update(data as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['samples'] });
      toast.success('Sample/Gift updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update sample: ' + error.message);
    },
  });
}

export function useIssueSample() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSampleIssueData) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const isAdmin = data.isAdmin || false;
      const results = [];

      for (const item of data.items) {
        const { data: sample } = await supabase
          .from('samples')
          .select('cost_price, stock, name')
          .eq('id', item.sample_id)
          .single();

        if (!sample) throw new Error('Sample not found');
        
        // Only check stock if auto-approved (admin)
        if (isAdmin && sample.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${sample.name}`);
        }

        const issueData = {
          sample_id: item.sample_id,
          quantity: item.quantity,
          issued_to_id: data.employee_id,
          issued_to_name: '',
          issued_to_type: 'employee',
          issued_by: user.user.id,
          status: isAdmin ? 'approved' : 'pending',
          created_by_role: isAdmin ? 'admin' : 'fse',
          approved_by: isAdmin ? user.user.id : null,
          approved_at: isAdmin ? new Date().toISOString() : null,
          request_date: new Date().toISOString().split('T')[0],
          notes: data.remarks,
        };

        // Get employee name
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', data.employee_id)
          .maybeSingle();

        issueData.issued_to_name = profile?.name || 'Unknown';

        const { data: result, error } = await supabase
          .from('sample_issues')
          .insert(issueData as any)
          .select()
          .single();

        if (error) throw error;

        // Deduct stock only if approved
        if (isAdmin) {
          await supabase
            .from('samples')
            .update({ stock: sample.stock - item.quantity })
            .eq('id', item.sample_id);
        }

        results.push(result);
      }

      return results;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['samples'] });
      queryClient.invalidateQueries({ queryKey: ['sample-issues'] });
      queryClient.invalidateQueries({ queryKey: ['sample-budget-current'] });
      toast.success(variables.isAdmin ? 'Sample/Gift issued successfully' : 'Issue request submitted for approval');
    },
    onError: (error) => {
      toast.error('Failed to issue sample: ' + error.message);
    },
  });
}

export function useApproveSampleIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Get the issue details
      const { data: issue } = await supabase
        .from('sample_issues')
        .select('sample_id, quantity')
        .eq('id', id)
        .single();

      if (!issue) throw new Error('Issue not found');

      // Get sample stock
      const { data: sample } = await supabase
        .from('samples')
        .select('stock, name')
        .eq('id', issue.sample_id)
        .single();

      if (!sample) throw new Error('Sample not found');
      if (sample.stock < issue.quantity) {
        throw new Error(`Insufficient stock for ${sample.name}`);
      }

      // Update issue status
      const { data: result, error } = await supabase
        .from('sample_issues')
        .update({
          status: 'approved',
          approved_by: user.user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Deduct stock
      await supabase
        .from('samples')
        .update({ stock: sample.stock - issue.quantity })
        .eq('id', issue.sample_id);

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sample-issues'] });
      queryClient.invalidateQueries({ queryKey: ['samples'] });
      toast.success('Issue request approved');
    },
    onError: (error) => {
      toast.error('Failed to approve: ' + error.message);
    },
  });
}

export function useRejectSampleIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data: result, error } = await supabase
        .from('sample_issues')
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
      queryClient.invalidateQueries({ queryKey: ['sample-issues'] });
      toast.success('Issue request rejected');
    },
    onError: (error) => {
      toast.error('Failed to reject: ' + error.message);
    },
  });
}

export function useAcknowledgeIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: result, error } = await supabase
        .from('sample_issues')
        .update({
          acknowledged: true,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sample-issues'] });
      toast.success('Issue acknowledged');
    },
    onError: (error) => {
      toast.error('Failed to acknowledge: ' + error.message);
    },
  });
}

export function useMarkConversion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, orderValue }: { id: string; orderValue: number }) => {
      const { data: result, error } = await supabase
        .from('sample_issues')
        .update({
          converted_to_order: true,
          order_value: orderValue,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sample-issues'] });
      queryClient.invalidateQueries({ queryKey: ['samples'] });
      toast.success('Conversion recorded');
    },
    onError: (error) => {
      toast.error('Failed to record conversion: ' + error.message);
    },
  });
}

export function useEmployeesForSamples() {
  return useQuery({
    queryKey: ['employees-for-samples'],
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
