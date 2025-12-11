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
}

export interface CreateSampleIssueData {
  sample_id: string;
  quantity: number;
  issued_to_id?: string;
  issued_to_name: string;
  issued_to_type: string;
  notes?: string;
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

      // Get this month's issued count and conversions for each sample
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const startOfMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;

      const samplesWithStats = await Promise.all(
        (data || []).map(async (sample) => {
          const { data: issues } = await supabase
            .from('sample_issues')
            .select('quantity, converted_to_order')
            .eq('sample_id', sample.id)
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

export function useSampleIssues() {
  return useQuery({
    queryKey: ['sample-issues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sample_issues')
        .select('*, samples(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user names
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

      // Return default budget if not set
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
        .insert(data)
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
        .update(data)
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

      // Get sample cost
      const { data: sample } = await supabase
        .from('samples')
        .select('cost_price, stock')
        .eq('id', data.sample_id)
        .single();

      if (!sample) throw new Error('Sample not found');
      if (sample.stock < data.quantity) throw new Error('Insufficient stock');

      // Create issue record
      const { data: result, error } = await supabase
        .from('sample_issues')
        .insert({
          ...data,
          issued_by: user.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Update sample stock
      await supabase
        .from('samples')
        .update({ stock: sample.stock - data.quantity })
        .eq('id', data.sample_id);

      // Update budget usage
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const costUsed = sample.cost_price * data.quantity;

      const { data: budget } = await supabase
        .from('sample_budgets')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .maybeSingle();

      if (budget) {
        await supabase
          .from('sample_budgets')
          .update({ used_amount: Number(budget.used_amount) + costUsed })
          .eq('id', budget.id);
      } else {
        await supabase.from('sample_budgets').insert({
          user_id: user.user.id,
          month: currentMonth,
          year: currentYear,
          monthly_budget: 5000,
          used_amount: costUsed,
        });
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['samples'] });
      queryClient.invalidateQueries({ queryKey: ['sample-issues'] });
      queryClient.invalidateQueries({ queryKey: ['sample-budget-current'] });
      toast.success('Sample/Gift issued successfully');
    },
    onError: (error) => {
      toast.error('Failed to issue sample: ' + error.message);
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
