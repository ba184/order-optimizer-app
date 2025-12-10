import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ============= ATTENDANCE =============
export function useAttendance(date?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['attendance', date],
    queryFn: async () => {
      let query = supabase
        .from('attendance')
        .select(`
          *,
          profiles:user_id (id, name, email, region, territory)
        `)
        .order('created_at', { ascending: false });
      
      if (date) {
        query = query.eq('date', date);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateAttendance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      user_id: string;
      login_time?: string;
      login_location?: any;
      login_selfie?: string;
    }) => {
      const { data: result, error } = await supabase
        .from('attendance')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Attendance marked successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to mark attendance');
    },
  });
}

// ============= BEAT PLANS =============
export function useBeatPlans(month?: number, year?: number) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['beat_plans', month, year],
    queryFn: async () => {
      let query = supabase
        .from('beat_plans')
        .select(`
          *,
          profiles:user_id (id, name, email, region, territory),
          beat_routes (*)
        `)
        .order('created_at', { ascending: false });
      
      if (month) query = query.eq('month', month);
      if (year) query = query.eq('year', year);
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateBeatPlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      user_id: string;
      month: number;
      year: number;
      status?: string;
      plan_type?: string;
    }) => {
      const { data: result, error } = await supabase
        .from('beat_plans')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beat_plans'] });
      toast.success('Beat plan created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create beat plan');
    },
  });
}

export function useUpdateBeatPlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; approved_by?: string; rejection_reason?: string }) => {
      const { data: result, error } = await supabase
        .from('beat_plans')
        .update({ ...data, ...(data.status === 'approved' ? { approved_at: new Date().toISOString() } : {}) })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beat_plans'] });
      toast.success('Beat plan updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update beat plan');
    },
  });
}

export function useDeleteBeatPlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('beat_plans').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beat_plans'] });
      toast.success('Beat plan deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete beat plan');
    },
  });
}

// ============= BEAT ROUTES =============
export function useCreateBeatRoute() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      beat_plan_id: string;
      day_of_week?: number;
      route_date?: string;
      zone?: string;
      area?: string;
      planned_visits?: number;
      retailers?: any;
    }) => {
      const { data: result, error } = await supabase
        .from('beat_routes')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beat_plans'] });
      toast.success('Beat route created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create beat route');
    },
  });
}

// ============= DAILY SALES REPORTS =============
export function useDailySalesReports(filters?: { date?: string; userId?: string }) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['daily_sales_reports', filters],
    queryFn: async () => {
      let query = supabase
        .from('daily_sales_reports')
        .select(`
          *,
          profiles:user_id (id, name, email, region, territory)
        `)
        .order('date', { ascending: false });
      
      if (filters?.date) query = query.eq('date', filters.date);
      if (filters?.userId) query = query.eq('user_id', filters.userId);
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateDSR() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      user_id: string;
      date?: string;
      visit_type?: string;
      distributor_id?: string;
      distributor_name?: string;
      retailer_id?: string;
      retailer_name?: string;
      zone?: string;
      city?: string;
      area?: string;
      total_calls?: number;
      productive_calls?: number;
      orders_count?: number;
      order_value?: number;
      collection_amount?: number;
      market_intelligence?: string;
      remarks?: string;
      status?: string;
    }) => {
      const { data: result, error } = await supabase
        .from('daily_sales_reports')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily_sales_reports'] });
      toast.success('DSR created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create DSR');
    },
  });
}

export function useUpdateDSR() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const { data: result, error } = await supabase
        .from('daily_sales_reports')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily_sales_reports'] });
      toast.success('DSR updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update DSR');
    },
  });
}

// ============= LEADS =============
export function useLeads() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      name: string;
      shop_name?: string;
      phone?: string;
      email?: string;
      address?: string;
      city?: string;
      state?: string;
      zone?: string;
      area?: string;
      lead_type?: string;
      source?: string;
      notes?: string;
      potential_value?: number;
      follow_up_date?: string;
    }) => {
      const { data: result, error } = await supabase
        .from('leads')
        .insert({ ...data, created_by: user?.id, assigned_to: user?.id })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create lead');
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const { data: result, error } = await supabase
        .from('leads')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update lead');
    },
  });
}

// ============= LEAVES =============
export function useLeaves() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['leaves'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaves')
        .select(`
          *,
          profiles:user_id (id, name, email),
          approved_by_profile:approved_by (id, name, email)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateLeave() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      leave_type: string;
      start_date: string;
      end_date: string;
      days: number;
      reason: string;
    }) => {
      const { data: result, error } = await supabase
        .from('leaves')
        .insert({ ...data, user_id: user?.id })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      toast.success('Leave application submitted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit leave application');
    },
  });
}

export function useUpdateLeave() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; rejection_reason?: string }) => {
      const updateData: any = { ...data };
      if (data.status === 'approved' || data.status === 'rejected') {
        updateData.approved_by = user?.id;
        updateData.approved_at = new Date().toISOString();
      }
      const { data: result, error } = await supabase
        .from('leaves')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      toast.success('Leave status updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update leave');
    },
  });
}

// ============= EMPLOYEE LOCATIONS =============
export function useEmployeeLocations() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['employee_locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_locations')
        .select(`
          *,
          profiles:user_id (id, name, email, region, territory)
        `)
        .order('recorded_at', { ascending: false });
      if (error) throw error;
      
      // Group by user_id to get latest location per user
      const latestLocations = data?.reduce((acc: any[], loc: any) => {
        const existing = acc.find(l => l.user_id === loc.user_id);
        if (!existing) {
          acc.push(loc);
        }
        return acc;
      }, []);
      
      return latestLocations;
    },
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useCreateEmployeeLocation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      latitude: number;
      longitude: number;
      address?: string;
      accuracy?: number;
      battery_level?: number;
      is_moving?: boolean;
    }) => {
      const { data: result, error } = await supabase
        .from('employee_locations')
        .insert({ ...data, user_id: user?.id })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee_locations'] });
    },
    onError: (error: any) => {
      console.error('Failed to record location:', error);
    },
  });
}

// ============= PROFILES =============
export function useProfiles() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'active')
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
