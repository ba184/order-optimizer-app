import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useSalaryStructures() {
  return useQuery({
    queryKey: ['salary-structures'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salary_structures' as any)
        .select('*, profiles:employee_id(name, email, employee_code)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useSalaryStructure(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['salary-structure', employeeId],
    enabled: !!employeeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salary_structures' as any)
        .select('*')
        .eq('employee_id', employeeId)
        .eq('status', 'active')
        .order('effective_from', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSalaryStructure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from('salary_structures' as any)
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['salary-structures'] });
      toast.success('Salary structure created');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}

export function usePayrollRuns(month?: number, year?: number) {
  return useQuery({
    queryKey: ['payroll-runs', month, year],
    queryFn: async () => {
      let query = supabase
        .from('payroll_runs' as any)
        .select('*, profiles:employee_id(name, email, employee_code)')
        .order('created_at', { ascending: false });
      if (month) query = query.eq('month', month);
      if (year) query = query.eq('year', year);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useRunPayroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ employeeId, month, year }: { employeeId: string; month: number; year: number }) => {
      // Get salary structure
      const { data: structure } = await supabase
        .from('salary_structures' as any)
        .select('*')
        .eq('employee_id', employeeId)
        .eq('status', 'active')
        .order('effective_from', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!structure) throw new Error('No salary structure found for this employee');

      // Get attendance for the month
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      
      const { data: attendance } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', employeeId)
        .gte('date', startDate)
        .lte('date', endDate);

      const presentDays = (attendance || []).filter((a: any) => a.status === 'present').length;
      const totalWorkingDays = 26; // standard
      const absentDays = Math.max(0, totalWorkingDays - presentDays);

      // Get leaves
      const { data: leaves } = await supabase
        .from('leaves')
        .select('*')
        .eq('user_id', employeeId)
        .eq('status', 'approved')
        .gte('start_date', startDate)
        .lte('end_date', endDate);

      const leaveDays = (leaves || []).reduce((sum: number, l: any) => sum + (l.days || 0), 0);

      // Get orders for incentives
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('created_by', employeeId)
        .eq('status', 'approved')
        .gte('created_at', startDate)
        .lte('created_at', endDate + 'T23:59:59');

      const totalOrders = (orders || []).length;
      const totalOrderValue = (orders || []).reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);
      const incentiveAmount = totalOrders * 50; // ₹50 per order

      // Get approved expenses
      const { data: expenses } = await supabase
        .from('expense_claims')
        .select('total_amount')
        .eq('user_id', employeeId)
        .eq('status', 'approved')
        .gte('start_date', startDate)
        .lte('end_date', endDate);

      const reimbursementAmount = (expenses || []).reduce((sum: number, e: any) => sum + (e.total_amount || 0), 0);

      // Get approved travel claims
      const { data: travelClaims } = await supabase
        .from('travel_claims' as any)
        .select('total_amount')
        .eq('employee_id', employeeId)
        .eq('status', 'approved')
        .eq('synced_to_payroll', false)
        .gte('claim_date', startDate)
        .lte('claim_date', endDate);

      const travelReimbursement = (travelClaims || []).reduce((sum: number, t: any) => sum + (t.total_amount || 0), 0);

      const s: any = structure;
      const totalAllowances = (s.hra || 0) + (s.da || 0) + (s.travel_allowance || 0) + (s.medical_allowance || 0) + (s.special_allowance || 0);
      const grossSalary = (s.basic_salary || 0) + totalAllowances + incentiveAmount + reimbursementAmount + travelReimbursement;
      const leaveDeduction = leaveDays > 0 ? ((s.basic_salary || 0) / totalWorkingDays) * leaveDays : 0;
      const totalDeductions = leaveDeduction + (s.pf_deduction || 0) + (s.esi_deduction || 0) + (s.tax_deduction || 0);
      const netSalary = grossSalary - totalDeductions;

      const { data: result, error } = await supabase
        .from('payroll_runs' as any)
        .insert({
          employee_id: employeeId,
          month,
          year,
          basic_salary: s.basic_salary,
          total_allowances: totalAllowances,
          incentive_amount: incentiveAmount,
          reimbursement_amount: reimbursementAmount + travelReimbursement,
          gross_salary: grossSalary,
          leave_deduction: leaveDeduction,
          late_deduction: 0,
          tax_deduction: s.tax_deduction || 0,
          pf_deduction: s.pf_deduction || 0,
          esi_deduction: s.esi_deduction || 0,
          other_deduction: 0,
          total_deductions: totalDeductions,
          net_salary: netSalary,
          present_days: presentDays,
          absent_days: absentDays,
          leave_days: leaveDays,
          late_days: 0,
          total_orders: totalOrders,
          total_order_value: totalOrderValue,
          status: 'generated',
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-runs'] });
      toast.success('Payroll generated successfully');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}

export function useApprovePayroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('payroll_runs' as any)
        .update({ status: 'approved', approved_by: user.user?.id, approved_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-runs'] });
      toast.success('Payroll approved');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}

export function useMarkPayrollPaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reference }: { id: string; reference?: string }) => {
      const { error } = await supabase
        .from('payroll_runs' as any)
        .update({ payment_status: 'paid', payment_date: new Date().toISOString().split('T')[0], payment_reference: reference || '' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-runs'] });
      toast.success('Marked as paid');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}
