import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useShifts() {
  return useQuery({
    queryKey: ['shifts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shifts' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from('shifts' as any)
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shifts'] });
      toast.success('Shift created');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}

export function useUpdateShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase
        .from('shifts' as any)
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shifts'] });
      toast.success('Shift updated');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}

export function useShiftAssignments() {
  return useQuery({
    queryKey: ['shift-assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shift_assignments' as any)
        .select('*, profiles:employee_id(name, email, employee_id), shifts:shift_id(name, start_time, end_time)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useAssignShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from('shift_assignments' as any)
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shift-assignments'] });
      toast.success('Shift assigned');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}

export function useHrPolicies() {
  return useQuery({
    queryKey: ['hr-policies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hr_policies' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateHrPolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from('hr_policies' as any)
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hr-policies'] });
      toast.success('Policy created');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}

export function useUpdateHrPolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase
        .from('hr_policies' as any)
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hr-policies'] });
      toast.success('Policy updated');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}
