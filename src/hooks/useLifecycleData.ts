import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useLifecycleEvents(employeeId?: string) {
  return useQuery({
    queryKey: ['lifecycle-events', employeeId],
    queryFn: async () => {
      let query = supabase
        .from('employee_lifecycle' as any)
        .select('*, employee:profiles!employee_lifecycle_employee_id_fkey(name, email, employee_id)')
        .order('event_date', { ascending: false });
      if (employeeId) query = query.eq('employee_id', employeeId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateLifecycleEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (event: any) => {
      const { data, error } = await supabase
        .from('employee_lifecycle' as any)
        .insert(event)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lifecycle-events'] });
      toast.success('Lifecycle event recorded');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}

export function useUpdateLifecycleEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { error } = await supabase.from('employee_lifecycle' as any).update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lifecycle-events'] });
      toast.success('Event updated');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}

// Onboarding
export function useOnboardingChecklists(employeeId?: string) {
  return useQuery({
    queryKey: ['onboarding-checklists', employeeId],
    queryFn: async () => {
      let query = supabase
        .from('onboarding_checklists' as any)
        .select('*, employee:profiles!onboarding_checklists_employee_id_fkey(name, email)')
        .order('created_at', { ascending: false });
      if (employeeId) query = query.eq('employee_id', employeeId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateOnboardingTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (task: any) => {
      const { data, error } = await supabase
        .from('onboarding_checklists' as any)
        .insert(task)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['onboarding-checklists'] });
      toast.success('Onboarding task created');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}

export function useUpdateOnboardingTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { error } = await supabase.from('onboarding_checklists' as any).update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['onboarding-checklists'] });
      toast.success('Task updated');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}

export function useHolidayCalendar(year?: number) {
  return useQuery({
    queryKey: ['holiday-calendar', year],
    queryFn: async () => {
      let query = supabase
        .from('holiday_calendar' as any)
        .select('*')
        .order('date', { ascending: true });
      if (year) query = query.eq('year', year);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateHoliday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (holiday: any) => {
      const { data, error } = await supabase
        .from('holiday_calendar' as any)
        .insert(holiday)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['holiday-calendar'] });
      toast.success('Holiday added');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}

export function useDeleteHoliday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('holiday_calendar' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['holiday-calendar'] });
      toast.success('Holiday deleted');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}
