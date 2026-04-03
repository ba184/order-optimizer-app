import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAppraisalCycles() {
  return useQuery({
    queryKey: ['appraisal-cycles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appraisal_cycles' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateAppraisalCycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cycle: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('appraisal_cycles' as any)
        .insert({ ...cycle, created_by: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appraisal-cycles'] });
      toast.success('Appraisal cycle created');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}

export function useUpdateAppraisalCycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { error } = await supabase
        .from('appraisal_cycles' as any)
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appraisal-cycles'] });
      toast.success('Cycle updated');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}

export function usePerformanceReviews(cycleId?: string) {
  return useQuery({
    queryKey: ['performance-reviews', cycleId],
    queryFn: async () => {
      let query = supabase
        .from('performance_reviews' as any)
        .select('*, employee:profiles!performance_reviews_employee_id_fkey(name, email, employee_code, designation), reviewer:profiles!performance_reviews_reviewer_id_fkey(name)')
        .order('created_at', { ascending: false });
      if (cycleId) query = query.eq('cycle_id', cycleId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreatePerformanceReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (review: any) => {
      const { data, error } = await supabase
        .from('performance_reviews' as any)
        .insert(review)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['performance-reviews'] });
      toast.success('Performance review created');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}

export function useUpdatePerformanceReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { error } = await supabase
        .from('performance_reviews' as any)
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['performance-reviews'] });
      toast.success('Review updated');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}

// KPI data fetchers for an employee
export function useEmployeeKPIs(employeeId?: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['employee-kpis', employeeId, startDate, endDate],
    enabled: !!employeeId,
    queryFn: async () => {
      // Targets
      const { data: targets } = await supabase
        .from('targets')
        .select('*')
        .eq('user_id', employeeId!);

      // Orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('created_by', employeeId!);

      // Leads
      const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .eq('created_by', employeeId!);

      // Outlets (distributors + retailers)
      const { data: distributors } = await supabase
        .from('distributors')
        .select('id')
        .eq('assigned_se', employeeId!);

      const { data: retailers } = await supabase
        .from('retailers')
        .select('id')
        .eq('assigned_se', employeeId!);

      // Calculate KPI scores
      const targetAchievement = calculateTargetScore(targets || []);
      const orderScore = calculateOrderScore(orders || []);
      const leadScore = calculateLeadScore(leads || []);
      const outletScore = ((distributors?.length || 0) + (retailers?.length || 0));

      return {
        targets: { data: targets || [], score: targetAchievement },
        orders: { data: orders || [], score: orderScore, count: (orders || []).length, value: (orders || []).reduce((s: number, o: any) => s + (o.total_amount || 0), 0) },
        leads: { data: leads || [], score: leadScore, total: (leads || []).length, converted: (leads || []).filter((l: any) => l.status === 'converted').length },
        outlets: { distributors: distributors?.length || 0, retailers: retailers?.length || 0, score: outletScore },
      };
    },
  });
}

function calculateTargetScore(targets: any[]): number {
  if (!targets.length) return 0;
  const totalAchieved = targets.reduce((sum, t) => {
    const pct = t.target_value > 0 ? (t.achieved_value / t.target_value) * 100 : 0;
    return sum + Math.min(pct, 100);
  }, 0);
  return Math.round(totalAchieved / targets.length);
}

function calculateOrderScore(orders: any[]): number {
  if (!orders.length) return 0;
  const totalValue = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
  // Score based on order count and value (normalized to 100)
  return Math.min(Math.round((orders.length / 10) * 50 + (totalValue / 100000) * 50), 100);
}

function calculateLeadScore(leads: any[]): number {
  if (!leads.length) return 0;
  const converted = leads.filter(l => l.status === 'converted').length;
  return Math.round((converted / leads.length) * 100);
}

export function useEmployeesList() {
  return useQuery({
    queryKey: ['employees-for-review'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, employee_code, designation, department')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });
}
