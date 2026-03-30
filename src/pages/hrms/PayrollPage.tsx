import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Play, CheckCircle, Download, Eye, CreditCard, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePayrollRuns, useRunPayroll, useApprovePayroll, useMarkPayrollPaid, useSalaryStructures, useCreateSalaryStructure } from '@/hooks/usePayrollData';
import { StatCard } from '@/components/ui/StatCard';
import { toast } from 'sonner';

const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function PayrollPage() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [showRunDialog, setShowRunDialog] = useState(false);
  const [showStructureDialog, setShowStructureDialog] = useState(false);
  const [runEmployeeId, setRunEmployeeId] = useState('');
  const [structureForm, setStructureForm] = useState({
    employee_id: '', basic_salary: 0, hra: 0, da: 0, travel_allowance: 0,
    medical_allowance: 0, special_allowance: 0, pf_deduction: 0, esi_deduction: 0, tax_deduction: 0, effective_from: new Date().toISOString().split('T')[0],
  });
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);

  const { data: payrollRuns = [], isLoading } = usePayrollRuns(selectedMonth, selectedYear);
  const { data: structures = [] } = useSalaryStructures();
  const runPayroll = useRunPayroll();
  const approvePayroll = useApprovePayroll();
  const markPaid = useMarkPayrollPaid();
  const createStructure = useCreateSalaryStructure();

  const totalNetSalary = payrollRuns.reduce((sum: number, p: any) => sum + (p.net_salary || 0), 0);
  const totalPaid = payrollRuns.filter((p: any) => p.payment_status === 'paid').reduce((sum: number, p: any) => sum + (p.net_salary || 0), 0);
  const pendingCount = payrollRuns.filter((p: any) => p.status === 'generated').length;

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

  const statusColor = (s: string) => {
    switch (s) {
      case 'approved': return 'default';
      case 'generated': return 'secondary';
      case 'paid': return 'default';
      default: return 'outline';
    }
  };

  // Get unique employees from structures for payroll run
  const employeesWithStructure = structures.map((s: any) => ({
    id: s.employee_id,
    name: s.profiles?.name || 'Unknown',
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payroll Management</h1>
          <p className="text-muted-foreground">Manage salary structures and run monthly payroll</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showStructureDialog} onOpenChange={setShowStructureDialog}>
            <DialogTrigger asChild>
              <Button variant="outline"><Plus className="mr-2 h-4 w-4" />Salary Structure</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Define Salary Structure</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Employee *</Label>
                  <Select value={structureForm.employee_id} onValueChange={v => setStructureForm(p => ({ ...p, employee_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>
                      {structures.length === 0 && <SelectItem value="none" disabled>Load employees first</SelectItem>}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">Paste employee UUID or implement employee selector</p>
                  <Input className="mt-1" placeholder="Employee UUID" value={structureForm.employee_id} onChange={e => setStructureForm(p => ({ ...p, employee_id: e.target.value }))} />
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
                  { key: 'tax_deduction', label: 'Tax Deduction' },
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Payroll" value={`₹${totalNetSalary.toLocaleString()}`} icon={DollarSign} />
        <StatCard title="Total Paid" value={`₹${totalPaid.toLocaleString()}`} icon={CreditCard} />
        <StatCard title="Employees" value={payrollRuns.length} icon={DollarSign} />
        <StatCard title="Pending Approval" value={pendingCount} icon={CheckCircle} />
      </div>

      <Tabs defaultValue="payroll">
        <TabsList>
          <TabsTrigger value="payroll">Payroll Runs</TabsTrigger>
          <TabsTrigger value="structures">Salary Structures</TabsTrigger>
        </TabsList>

        <TabsContent value="payroll">
          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <Select value={String(selectedMonth)} onValueChange={v => setSelectedMonth(Number(v))}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                {months.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="number" className="w-28" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} />
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
                    ) : payrollRuns.length === 0 ? (
                      <tr><td colSpan={9} className="text-center p-8 text-muted-foreground">No payroll runs for this period</td></tr>
                    ) : (
                      payrollRuns.map((p: any) => (
                        <tr key={p.id} className="border-b hover:bg-muted/30">
                          <td className="p-3">
                            <div className="font-medium">{p.profiles?.name || 'Unknown'}</div>
                            <div className="text-xs text-muted-foreground">{p.profiles?.employee_code}</div>
                          </td>
                          <td className="text-right p-3">₹{(p.basic_salary || 0).toLocaleString()}</td>
                          <td className="text-right p-3">₹{(p.total_allowances || 0).toLocaleString()}</td>
                          <td className="text-right p-3">₹{(p.incentive_amount || 0).toLocaleString()}</td>
                          <td className="text-right p-3 text-destructive">-₹{(p.total_deductions || 0).toLocaleString()}</td>
                          <td className="text-right p-3 font-semibold">₹{(p.net_salary || 0).toLocaleString()}</td>
                          <td className="text-center p-3"><Badge variant={statusColor(p.status)}>{p.status}</Badge></td>
                          <td className="text-center p-3"><Badge variant={p.payment_status === 'paid' ? 'default' : 'outline'}>{p.payment_status}</Badge></td>
                          <td className="text-center p-3">
                            <div className="flex gap-1 justify-center">
                              <Button size="sm" variant="ghost" onClick={() => setSelectedPayslip(p)}><Eye className="h-4 w-4" /></Button>
                              {p.status === 'generated' && (
                                <Button size="sm" variant="ghost" onClick={() => approvePayroll.mutate(p.id)}><CheckCircle className="h-4 w-4 text-green-600" /></Button>
                              )}
                              {p.status === 'approved' && p.payment_status !== 'paid' && (
                                <Button size="sm" variant="ghost" onClick={() => markPaid.mutate({ id: p.id })}><CreditCard className="h-4 w-4 text-blue-600" /></Button>
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
                      <th className="text-right p-3">Tax</th>
                      <th className="text-center p-3">Effective From</th>
                      <th className="text-center p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {structures.length === 0 ? (
                      <tr><td colSpan={8} className="text-center p-8 text-muted-foreground">No salary structures defined</td></tr>
                    ) : (
                      structures.map((s: any) => (
                        <tr key={s.id} className="border-b hover:bg-muted/30">
                          <td className="p-3 font-medium">{s.profiles?.name || 'Unknown'}</td>
                          <td className="text-right p-3">₹{(s.basic_salary || 0).toLocaleString()}</td>
                          <td className="text-right p-3">₹{(s.hra || 0).toLocaleString()}</td>
                          <td className="text-right p-3">₹{(s.da || 0).toLocaleString()}</td>
                          <td className="text-right p-3">₹{(s.pf_deduction || 0).toLocaleString()}</td>
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
      </Tabs>

      {/* Payslip Dialog */}
      <Dialog open={!!selectedPayslip} onOpenChange={() => setSelectedPayslip(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Payslip - {months[(selectedPayslip?.month || 1) - 1]} {selectedPayslip?.year}</DialogTitle></DialogHeader>
          {selectedPayslip && (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <p className="font-semibold">{selectedPayslip.profiles?.name}</p>
                <p className="text-sm text-muted-foreground">{selectedPayslip.profiles?.employee_code}</p>
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
                <div className="flex justify-between"><span>Incentives</span><span>₹{(selectedPayslip.incentive_amount || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Reimbursements</span><span>₹{(selectedPayslip.reimbursement_amount || 0).toLocaleString()}</span></div>
                <div className="flex justify-between font-semibold border-t pt-1"><span>Gross Salary</span><span>₹{(selectedPayslip.gross_salary || 0).toLocaleString()}</span></div>
              </div>
              <div className="border-t pt-2 space-y-1 text-sm">
                <h4 className="font-semibold text-red-700">Deductions</h4>
                <div className="flex justify-between"><span>Leave Deduction</span><span>₹{(selectedPayslip.leave_deduction || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>PF</span><span>₹{(selectedPayslip.pf_deduction || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>ESI</span><span>₹{(selectedPayslip.esi_deduction || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>₹{(selectedPayslip.tax_deduction || 0).toLocaleString()}</span></div>
                <div className="flex justify-between font-semibold border-t pt-1"><span>Total Deductions</span><span>₹{(selectedPayslip.total_deductions || 0).toLocaleString()}</span></div>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg font-bold">
                <span>Net Salary</span>
                <span className="text-primary">₹{(selectedPayslip.net_salary || 0).toLocaleString()}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
