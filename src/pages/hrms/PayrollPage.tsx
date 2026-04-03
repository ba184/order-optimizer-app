import { useState, useMemo } from 'react';
import { DollarSign, Play, CheckCircle, Download, Eye, CreditCard, Plus, FileSpreadsheet, FileText, Printer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePayrollRuns, useRunPayroll, useApprovePayroll, useMarkPayrollPaid, useSalaryStructures, useCreateSalaryStructure, useEmployeesForPayroll } from '@/hooks/usePayrollData';
import { StatCard } from '@/components/ui/StatCard';
import { toast } from 'sonner';

const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function PayrollPage() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [showRunDialog, setShowRunDialog] = useState(false);
  const [showStructureDialog, setShowStructureDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<any>(null);
  const [paymentMode, setPaymentMode] = useState('bank');
  const [paymentRef, setPaymentRef] = useState('');
  const [runEmployeeId, setRunEmployeeId] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [structureForm, setStructureForm] = useState({
    employee_id: '', basic_salary: 0, hra: 0, da: 0, travel_allowance: 0,
    medical_allowance: 0, special_allowance: 0, pf_deduction: 0, esi_deduction: 0, tax_deduction: 0, effective_from: new Date().toISOString().split('T')[0],
  });
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);

  const { data: payrollRuns = [], isLoading } = usePayrollRuns(selectedMonth, selectedYear);
  const { data: structures = [] } = useSalaryStructures();
  const { data: allEmployees = [] } = useEmployeesForPayroll();
  const runPayroll = useRunPayroll();
  const approvePayroll = useApprovePayroll();
  const markPaid = useMarkPayrollPaid();
  const createStructure = useCreateSalaryStructure();

  // Derived filter options
  const locations = useMemo(() => {
    const locs = new Set<string>();
    payrollRuns.forEach((p: any) => {
      const loc = p.profiles?.working_city || p.profiles?.working_state;
      if (loc) locs.add(loc);
    });
    return Array.from(locs);
  }, [payrollRuns]);

  const filteredRuns = useMemo(() => {
    return payrollRuns.filter((p: any) => {
      if (filterEmployee !== 'all' && p.employee_id !== filterEmployee) return false;
      if (filterStatus === 'paid' && p.payment_status !== 'paid') return false;
      if (filterStatus === 'pending' && p.payment_status === 'paid') return false;
      if (filterStatus === 'generated' && p.status !== 'generated') return false;
      if (filterStatus === 'approved' && p.status !== 'approved') return false;
      if (filterLocation !== 'all') {
        const loc = p.profiles?.working_city || p.profiles?.working_state || '';
        if (loc !== filterLocation) return false;
      }
      return true;
    });
  }, [payrollRuns, filterEmployee, filterStatus, filterLocation]);

  const totalNetSalary = filteredRuns.reduce((sum: number, p: any) => sum + (p.net_salary || 0), 0);
  const totalPaid = filteredRuns.filter((p: any) => p.payment_status === 'paid').reduce((sum: number, p: any) => sum + (p.net_salary || 0), 0);
  const pendingCount = filteredRuns.filter((p: any) => p.status === 'generated').length;
  const totalPF = filteredRuns.reduce((sum: number, p: any) => sum + (p.pf_deduction || 0), 0);
  const totalESI = filteredRuns.reduce((sum: number, p: any) => sum + (p.esi_deduction || 0), 0);
  const totalTDS = filteredRuns.reduce((sum: number, p: any) => sum + (p.tax_deduction || 0), 0);

  const handleRunPayroll = () => {
    if (!runEmployeeId) { toast.error('Select an employee'); return; }
    runPayroll.mutate({ employeeId: runEmployeeId, month: selectedMonth, year: selectedYear }, {
      onSuccess: () => setShowRunDialog(false),
    });
  };

  const handleCreateStructure = () => {
    if (!structureForm.employee_id) { toast.error('Select an employee'); return; }
    createStructure.mutate(structureForm, { onSuccess: () => setShowStructureDialog(false) });
  };

  const handleMarkPaid = () => {
    if (!paymentTarget) return;
    markPaid.mutate({ id: paymentTarget.id, reference: paymentRef, paymentMode }, {
      onSuccess: () => { setShowPaymentDialog(false); setPaymentTarget(null); setPaymentRef(''); },
    });
  };

  const openPaymentDialog = (p: any) => {
    setPaymentTarget(p);
    setPaymentMode('bank');
    setPaymentRef('');
    setShowPaymentDialog(true);
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'approved': return 'default' as const;
      case 'generated': return 'secondary' as const;
      default: return 'outline' as const;
    }
  };

  const employeesWithStructure = structures.map((s: any) => ({
    id: s.employee_id,
    name: s.profiles?.name || 'Unknown',
  }));

  // Export functions
  const exportToCSV = () => {
    const headers = ['Employee', 'Employee ID', 'Basic', 'Allowances', 'Incentives', 'Deductions', 'Net Salary', 'Status', 'Payment Status', 'Payment Mode', 'Payment Date', 'Txn Ref'];
    const rows = filteredRuns.map((p: any) => [
      p.profiles?.name || '', p.profiles?.employee_id || '', p.basic_salary || 0, p.total_allowances || 0,
      p.incentive_amount || 0, p.total_deductions || 0, p.net_salary || 0, p.status, p.payment_status,
      p.payment_mode || '', p.payment_date || '', p.payment_reference || '',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `payroll_${months[selectedMonth - 1]}_${selectedYear}.csv`; a.click();
    toast.success('Payroll exported as CSV');
  };

  const exportBankFile = () => {
    const bankRows = filteredRuns.filter((p: any) => p.status === 'approved' && p.payment_status !== 'paid');
    if (bankRows.length === 0) { toast.error('No approved unpaid records to export'); return; }
    const headers = ['Employee Name', 'Employee ID', 'Net Salary', 'Payment Mode'];
    const rows = bankRows.map((p: any) => [p.profiles?.name || '', p.profiles?.employee_id || '', p.net_salary || 0, 'NEFT']);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `bank_transfer_${months[selectedMonth - 1]}_${selectedYear}.csv`; a.click();
    toast.success('Bank transfer file generated');
  };

  const exportComplianceReport = (type: 'pf' | 'esi' | 'tds') => {
    const headers = ['Employee', 'Employee ID', 'Gross Salary', `${type.toUpperCase()} Deduction`];
    const key = type === 'pf' ? 'pf_deduction' : type === 'esi' ? 'esi_deduction' : 'tax_deduction';
    const rows = filteredRuns.filter((p: any) => (p[key] || 0) > 0).map((p: any) => [
      p.profiles?.name || '', p.profiles?.employee_id || '', p.gross_salary || 0, p[key] || 0,
    ]);
    const total = rows.reduce((s, r) => s + Number(r[3]), 0);
    rows.push(['', '', 'TOTAL', total]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${type}_report_${months[selectedMonth - 1]}_${selectedYear}.csv`; a.click();
    toast.success(`${type.toUpperCase()} compliance report exported`);
  };

  const downloadPayslip = (p: any) => {
    const lines = [
      `PAYSLIP - ${months[(p.month || 1) - 1]} ${p.year}`,
      `Employee: ${p.profiles?.name || 'Unknown'}`,
      `Employee ID: ${p.profiles?.employee_id || '-'}`,
      ``,
      `--- ATTENDANCE ---`,
      `Present Days: ${p.present_days}`,
      `Leave Days: ${p.leave_days}`,
      `Absent Days: ${p.absent_days}`,
      ``,
      `--- EARNINGS ---`,
      `Basic Salary: ${p.basic_salary}`,
      `Allowances: ${p.total_allowances}`,
      `Incentives: ${p.incentive_amount}`,
      `Reimbursements: ${p.reimbursement_amount}`,
      `Gross Salary: ${p.gross_salary}`,
      ``,
      `--- DEDUCTIONS ---`,
      `Leave Deduction: ${p.leave_deduction}`,
      `PF: ${p.pf_deduction}`,
      `ESI: ${p.esi_deduction}`,
      `Tax/TDS: ${p.tax_deduction}`,
      `Total Deductions: ${p.total_deductions}`,
      ``,
      `--- NET SALARY: ₹${(p.net_salary || 0).toLocaleString()} ---`,
      ``,
      `Payment Status: ${p.payment_status}`,
      `Payment Mode: ${p.payment_mode || '-'}`,
      `Payment Date: ${p.payment_date || '-'}`,
      `Txn Reference: ${p.payment_reference || '-'}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `payslip_${p.profiles?.name || 'emp'}_${months[(p.month || 1) - 1]}_${p.year}.txt`; a.click();
    toast.success('Payslip downloaded');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payroll Management</h1>
          <p className="text-muted-foreground">Manage salary structures and run monthly payroll</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Dialog open={showStructureDialog} onOpenChange={setShowStructureDialog}>
            <DialogTrigger asChild>
              <Button variant="outline"><Plus className="mr-2 h-4 w-4" />Salary Structure</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Define Salary Structure</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Employee *</Label>
                  <Select value={structureForm.employee_id} onValueChange={v => setStructureForm(p => ({ ...p, employee_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>
                      {allEmployees.map((e: any) => (
                        <SelectItem key={e.id} value={e.id}>{e.name} ({e.employee_id || e.email})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {[
                  { key: 'basic_salary', label: 'Basic Salary' },
                  { key: 'hra', label: 'HRA' },
                  { key: 'da', label: 'DA' },
                  { key: 'travel_allowance', label: 'Travel Allowance' },
                  { key: 'medical_allowance', label: 'Medical Allowance' },
                  { key: 'special_allowance', label: 'Special Allowance' },
                  { key: 'pf_deduction', label: 'PF Deduction' },
                  { key: 'esi_deduction', label: 'ESI Deduction' },
                  { key: 'tax_deduction', label: 'Tax/TDS Deduction' },
                ].map(f => (
                  <div key={f.key}>
                    <Label>{f.label}</Label>
                    <Input type="number" value={(structureForm as any)[f.key]} onChange={e => setStructureForm(p => ({ ...p, [f.key]: Number(e.target.value) }))} />
                  </div>
                ))}
                <div>
                  <Label>Effective From</Label>
                  <Input type="date" value={structureForm.effective_from} onChange={e => setStructureForm(p => ({ ...p, effective_from: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowStructureDialog(false)}>Cancel</Button>
                <Button onClick={handleCreateStructure} disabled={createStructure.isPending}>Create</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={showRunDialog} onOpenChange={setShowRunDialog}>
            <DialogTrigger asChild>
              <Button><Play className="mr-2 h-4 w-4" />Run Payroll</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Run Payroll</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Employee</Label>
                  <Select value={runEmployeeId} onValueChange={setRunEmployeeId}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>
                      {employeesWithStructure.map((e: any) => (
                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Month</Label>
                    <Select value={String(selectedMonth)} onValueChange={v => setSelectedMonth(Number(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {months.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Input type="number" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowRunDialog(false)}>Cancel</Button>
                <Button onClick={handleRunPayroll} disabled={runPayroll.isPending}>
                  {runPayroll.isPending ? 'Processing...' : 'Generate Payroll'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Payroll" value={`₹${totalNetSalary.toLocaleString()}`} icon={DollarSign} />
        <StatCard title="Total Paid" value={`₹${totalPaid.toLocaleString()}`} icon={CreditCard} />
        <StatCard title="Employees" value={filteredRuns.length} icon={DollarSign} />
        <StatCard title="Pending Approval" value={pendingCount} icon={CheckCircle} />
      </div>

      <Tabs defaultValue="payroll">
        <TabsList>
          <TabsTrigger value="payroll">Payroll Runs</TabsTrigger>
          <TabsTrigger value="structures">Salary Structures</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="payroll">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <Select value={String(selectedMonth)} onValueChange={v => setSelectedMonth(Number(v))}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {months.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="number" className="w-24" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} />
            <Select value={filterEmployee} onValueChange={setFilterEmployee}>
              <SelectTrigger className="w-44"><SelectValue placeholder="All Employees" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {payrollRuns.map((p: any) => (
                  <SelectItem key={p.employee_id} value={p.employee_id}>{p.profiles?.name || 'Unknown'}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-36"><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="generated">Generated</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Unpaid</SelectItem>
              </SelectContent>
            </Select>
            {locations.length > 0 && (
              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger className="w-40"><SelectValue placeholder="All Locations" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={exportToCSV}><FileSpreadsheet className="h-4 w-4 mr-1" />Excel</Button>
              <Button variant="outline" size="sm" onClick={exportBankFile}><CreditCard className="h-4 w-4 mr-1" />Bank File</Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3">Employee</th>
                      <th className="text-right p-3">Basic</th>
                      <th className="text-right p-3">Allowances</th>
                      <th className="text-right p-3">Incentives</th>
                      <th className="text-right p-3">Deductions</th>
                      <th className="text-right p-3">Net Salary</th>
                      <th className="text-center p-3">Status</th>
                      <th className="text-center p-3">Payment</th>
                      <th className="text-center p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan={9} className="text-center p-8 text-muted-foreground">Loading...</td></tr>
                    ) : filteredRuns.length === 0 ? (
                      <tr><td colSpan={9} className="text-center p-8 text-muted-foreground">No payroll runs for this period</td></tr>
                    ) : (
                      filteredRuns.map((p: any) => (
                        <tr key={p.id} className="border-b hover:bg-muted/30">
                          <td className="p-3">
                            <div className="font-medium">{p.profiles?.name || 'Unknown'}</div>
                            <div className="text-xs text-muted-foreground">{p.profiles?.employee_id || '-'}</div>
                          </td>
                          <td className="text-right p-3">₹{(p.basic_salary || 0).toLocaleString()}</td>
                          <td className="text-right p-3">₹{(p.total_allowances || 0).toLocaleString()}</td>
                          <td className="text-right p-3">₹{(p.incentive_amount || 0).toLocaleString()}</td>
                          <td className="text-right p-3 text-destructive">-₹{(p.total_deductions || 0).toLocaleString()}</td>
                          <td className="text-right p-3 font-semibold">₹{(p.net_salary || 0).toLocaleString()}</td>
                          <td className="text-center p-3"><Badge variant={statusColor(p.status)}>{p.status}</Badge></td>
                          <td className="text-center p-3">
                            <div>
                              <Badge variant={p.payment_status === 'paid' ? 'default' : 'outline'}>{p.payment_status}</Badge>
                              {p.payment_status === 'paid' && p.payment_mode && (
                                <div className="text-xs text-muted-foreground mt-0.5">{p.payment_mode.toUpperCase()}</div>
                              )}
                            </div>
                          </td>
                          <td className="text-center p-3">
                            <div className="flex gap-1 justify-center">
                              <Button size="sm" variant="ghost" title="View Payslip" onClick={() => setSelectedPayslip(p)}><Eye className="h-4 w-4" /></Button>
                              <Button size="sm" variant="ghost" title="Download Payslip" onClick={() => downloadPayslip(p)}><Download className="h-4 w-4" /></Button>
                              {p.status === 'generated' && (
                                <Button size="sm" variant="ghost" title="Approve" onClick={() => approvePayroll.mutate(p.id)}><CheckCircle className="h-4 w-4 text-green-600" /></Button>
                              )}
                              {p.status === 'approved' && p.payment_status !== 'paid' && (
                                <Button size="sm" variant="ghost" title="Mark Paid" onClick={() => openPaymentDialog(p)}><CreditCard className="h-4 w-4 text-blue-600" /></Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structures">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3">Employee</th>
                      <th className="text-right p-3">Basic</th>
                      <th className="text-right p-3">HRA</th>
                      <th className="text-right p-3">DA</th>
                      <th className="text-right p-3">PF</th>
                      <th className="text-right p-3">ESI</th>
                      <th className="text-right p-3">Tax</th>
                      <th className="text-center p-3">Effective From</th>
                      <th className="text-center p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {structures.length === 0 ? (
                      <tr><td colSpan={9} className="text-center p-8 text-muted-foreground">No salary structures defined</td></tr>
                    ) : (
                      structures.map((s: any) => (
                        <tr key={s.id} className="border-b hover:bg-muted/30">
                          <td className="p-3">
                            <div className="font-medium">{s.profiles?.name || 'Unknown'}</div>
                            <div className="text-xs text-muted-foreground">{s.profiles?.employee_id || '-'}</div>
                          </td>
                          <td className="text-right p-3">₹{(s.basic_salary || 0).toLocaleString()}</td>
                          <td className="text-right p-3">₹{(s.hra || 0).toLocaleString()}</td>
                          <td className="text-right p-3">₹{(s.da || 0).toLocaleString()}</td>
                          <td className="text-right p-3">₹{(s.pf_deduction || 0).toLocaleString()}</td>
                          <td className="text-right p-3">₹{(s.esi_deduction || 0).toLocaleString()}</td>
                          <td className="text-right p-3">₹{(s.tax_deduction || 0).toLocaleString()}</td>
                          <td className="text-center p-3">{s.effective_from}</td>
                          <td className="text-center p-3"><Badge variant={s.status === 'active' ? 'default' : 'secondary'}>{s.status}</Badge></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Total PF</p>
                <p className="text-2xl font-bold">₹{totalPF.toLocaleString()}</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => exportComplianceReport('pf')}>
                  <Download className="h-4 w-4 mr-1" />PF Report
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Total ESI</p>
                <p className="text-2xl font-bold">₹{totalESI.toLocaleString()}</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => exportComplianceReport('esi')}>
                  <Download className="h-4 w-4 mr-1" />ESI Report
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Total TDS</p>
                <p className="text-2xl font-bold">₹{totalTDS.toLocaleString()}</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => exportComplianceReport('tds')}>
                  <Download className="h-4 w-4 mr-1" />TDS Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Mark as Paid</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Employee</Label>
              <p className="font-medium">{paymentTarget?.profiles?.name} — ₹{(paymentTarget?.net_salary || 0).toLocaleString()}</p>
            </div>
            <div>
              <Label>Payment Mode *</Label>
              <Select value={paymentMode} onValueChange={setPaymentMode}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank (NEFT/RTGS)</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Transaction Reference</Label>
              <Input placeholder="Txn ID / UTR / Cheque No." value={paymentRef} onChange={e => setPaymentRef(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
            <Button onClick={handleMarkPaid} disabled={markPaid.isPending}>Confirm Payment</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payslip Dialog */}
      <Dialog open={!!selectedPayslip} onOpenChange={() => setSelectedPayslip(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Payslip - {months[(selectedPayslip?.month || 1) - 1]} {selectedPayslip?.year}</DialogTitle></DialogHeader>
          {selectedPayslip && (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <p className="font-semibold">{selectedPayslip.profiles?.name}</p>
                <p className="text-sm text-muted-foreground">ID: {selectedPayslip.profiles?.employee_id || '-'}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Present Days</div><div className="text-right">{selectedPayslip.present_days}</div>
                <div>Leave Days</div><div className="text-right">{selectedPayslip.leave_days}</div>
                <div>Absent Days</div><div className="text-right">{selectedPayslip.absent_days}</div>
                <div>Orders Placed</div><div className="text-right">{selectedPayslip.total_orders}</div>
              </div>
              <div className="border-t pt-2 space-y-1 text-sm">
                <h4 className="font-semibold text-green-700">Earnings</h4>
                <div className="flex justify-between"><span>Basic Salary</span><span>₹{(selectedPayslip.basic_salary || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Allowances</span><span>₹{(selectedPayslip.total_allowances || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Incentives (Orders)</span><span>₹{(selectedPayslip.incentive_amount || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Reimbursements (Expenses + Travel)</span><span>₹{(selectedPayslip.reimbursement_amount || 0).toLocaleString()}</span></div>
                <div className="flex justify-between font-semibold border-t pt-1"><span>Gross Salary</span><span>₹{(selectedPayslip.gross_salary || 0).toLocaleString()}</span></div>
              </div>
              <div className="border-t pt-2 space-y-1 text-sm">
                <h4 className="font-semibold text-destructive">Deductions</h4>
                <div className="flex justify-between"><span>Leave Deduction</span><span>₹{(selectedPayslip.leave_deduction || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>PF</span><span>₹{(selectedPayslip.pf_deduction || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>ESI</span><span>₹{(selectedPayslip.esi_deduction || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>TDS</span><span>₹{(selectedPayslip.tax_deduction || 0).toLocaleString()}</span></div>
                <div className="flex justify-between font-semibold border-t pt-1"><span>Total Deductions</span><span>₹{(selectedPayslip.total_deductions || 0).toLocaleString()}</span></div>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg font-bold">
                <span>Net Salary</span>
                <span className="text-primary">₹{(selectedPayslip.net_salary || 0).toLocaleString()}</span>
              </div>
              {selectedPayslip.payment_status === 'paid' && (
                <div className="border-t pt-2 text-sm space-y-1">
                  <h4 className="font-semibold">Payment Details</h4>
                  <div className="flex justify-between"><span>Mode</span><span>{(selectedPayslip.payment_mode || '-').toUpperCase()}</span></div>
                  <div className="flex justify-between"><span>Date</span><span>{selectedPayslip.payment_date || '-'}</span></div>
                  <div className="flex justify-between"><span>Reference</span><span>{selectedPayslip.payment_reference || '-'}</span></div>
                </div>
              )}
              <Button variant="outline" className="w-full" onClick={() => downloadPayslip(selectedPayslip)}>
                <Download className="h-4 w-4 mr-2" />Download Payslip
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
