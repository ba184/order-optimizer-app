import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, DollarSign, TrendingUp, FileText, Calculator, Eye, Edit, Trash2, Search, Download, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useIncentiveRules, useCreateIncentiveRule, useUpdateIncentiveRule, useDeleteIncentiveRule } from '@/hooks/useIncentiveData';
import { usePayrollRuns } from '@/hooks/usePayrollData';
import { toast } from 'sonner';

const emptyForm = {
  name: '',
  description: '',
  type: 'revenue_based',
  metric: 'total_revenue',
  role_filter: '',
  effective_from: '',
  effective_to: '',
  auto_calculate: true,
  approval_required: true,
  link_to_payroll: true,
  status: 'active',
  slab_config: [{ min: 0, max: 50000, rate_type: 'percentage', rate_value: 2, bonus: 0 }],
};

type SlabItem = { min: number; max: number; rate_type: string; rate_value: number; bonus: number };

export default function IncentiveCommissionPage() {
  const [activeTab, setActiveTab] = useState('rules');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewRule, setViewRule] = useState<any>(null);
  const [payoutMonth, setPayoutMonth] = useState(new Date().getMonth() + 1);
  const [payoutYear, setPayoutYear] = useState(new Date().getFullYear());

  const { data: rules = [], isLoading: rulesLoading } = useIncentiveRules();
  const createRule = useCreateIncentiveRule();
  const updateRule = useUpdateIncentiveRule();
  const deleteRule = useDeleteIncentiveRule();
  const { data: payrollRuns = [] } = usePayrollRuns(payoutMonth, payoutYear);

  const [form, setForm] = useState<typeof emptyForm>(emptyForm);

  const filteredRules = useMemo(() => {
    return (rules as any[]).filter((r: any) => {
      if (searchTerm && !r.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (typeFilter !== 'all' && r.type !== typeFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      return true;
    });
  }, [rules, searchTerm, typeFilter, statusFilter]);

  const activeRulesCount = (rules as any[]).filter((r: any) => r.status === 'active').length;

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (rule: any) => {
    setForm({
      name: rule.name || '',
      description: rule.description || '',
      type: rule.type || 'revenue_based',
      metric: rule.metric || 'total_revenue',
      role_filter: rule.role_filter || '',
      effective_from: rule.effective_from || '',
      effective_to: rule.effective_to || '',
      auto_calculate: rule.auto_calculate ?? true,
      approval_required: rule.approval_required ?? true,
      link_to_payroll: rule.link_to_payroll ?? true,
      status: rule.status || 'active',
      slab_config: rule.slab_config || [{ min: 0, max: 50000, rate_type: 'percentage', rate_value: 2, bonus: 0 }],
    });
    setEditingId(rule.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.effective_from) {
      toast.error('Name and effective date are required');
      return;
    }
    if (editingId) {
      updateRule.mutate({ id: editingId, ...form }, { onSuccess: () => setShowForm(false) });
    } else {
      createRule.mutate(form, { onSuccess: () => setShowForm(false) });
    }
  };

  const handleReset = () => setForm(emptyForm);

  const addSlab = () => {
    const lastSlab = form.slab_config[form.slab_config.length - 1];
    setForm(prev => ({
      ...prev,
      slab_config: [...prev.slab_config, { min: lastSlab?.max || 0, max: 0, rate_type: 'percentage', rate_value: 0, bonus: 0 }]
    }));
  };

  const updateSlab = (index: number, field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      slab_config: prev.slab_config.map((s, i) => i === index ? { ...s, [field]: value } : s)
    }));
  };

  const removeSlab = (index: number) => {
    if (form.slab_config.length <= 1) return;
    setForm(prev => ({
      ...prev,
      slab_config: prev.slab_config.filter((_, i) => i !== index)
    }));
  };

  const exportPayoutCSV = () => {
    const rows = (payrollRuns as any[]).map((p: any) => ({
      Employee: p.profiles?.name || 'N/A',
      'Employee ID': p.profiles?.employee_id || 'N/A',
      Month: p.month,
      Year: p.year,
      'Incentive Amount': p.incentive_amount || 0,
      'Reimbursement': p.reimbursement_amount || 0,
      'Net Salary': p.net_salary || 0,
      Status: p.status,
      'Payment Status': p.payment_status || 'unpaid',
    }));
    const headers = Object.keys(rows[0] || {});
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${(r as any)[h]}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payout_summary_${payoutMonth}_${payoutYear}.csv`;
    a.click();
    toast.success('Payout summary exported');
  };

  // Create form view
  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{editingId ? 'Edit Incentive Rule' : 'Create Incentive Rule'}</h1>
            <p className="text-muted-foreground">Define incentive configuration and slab structure</p>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Rule Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Q1 Revenue Incentive" /></div>
              <div><Label>Incentive Type *</Label>
                <Select value={form.type} onValueChange={v => {
                  const metricMap: Record<string, string> = {
                    revenue_based: 'total_revenue',
                    target_based: 'target_percentage',
                    conversion_based: 'conversion_rate',
                    deal_size_based: 'avg_deal_size',
                    order_based: 'order_count',
                  };
                  setForm(p => ({ ...p, type: v, metric: metricMap[v] || 'total_revenue' }));
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue_based">Revenue Based</SelectItem>
                    <SelectItem value="target_based">Target Achievement Based</SelectItem>
                    <SelectItem value="conversion_based">Conversion Rate Based</SelectItem>
                    <SelectItem value="deal_size_based">Deal Size Based</SelectItem>
                    <SelectItem value="order_based">Order Count Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Metric</Label>
                <Select value={form.metric} onValueChange={v => setForm(p => ({ ...p, metric: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {form.type === 'revenue_based' && <>
                      <SelectItem value="total_revenue">Total Revenue</SelectItem>
                      <SelectItem value="monthly_revenue">Monthly Revenue</SelectItem>
                      <SelectItem value="quarterly_revenue">Quarterly Revenue</SelectItem>
                    </>}
                    {form.type === 'target_based' && <>
                      <SelectItem value="target_percentage">Target Achievement %</SelectItem>
                      <SelectItem value="target_units">Target Units Achieved</SelectItem>
                      <SelectItem value="target_value">Target Value Achieved</SelectItem>
                    </>}
                    {form.type === 'conversion_based' && <>
                      <SelectItem value="conversion_rate">Lead Conversion Rate %</SelectItem>
                      <SelectItem value="leads_converted">Leads Converted Count</SelectItem>
                      <SelectItem value="visit_to_order">Visit to Order Ratio</SelectItem>
                    </>}
                    {form.type === 'deal_size_based' && <>
                      <SelectItem value="avg_deal_size">Avg Deal Size</SelectItem>
                      <SelectItem value="max_deal_value">Max Deal Value</SelectItem>
                      <SelectItem value="total_deal_value">Total Deal Value</SelectItem>
                    </>}
                    {form.type === 'order_based' && <>
                      <SelectItem value="order_count">Total Order Count</SelectItem>
                      <SelectItem value="new_outlets">New Outlets Ordered</SelectItem>
                      <SelectItem value="repeat_orders">Repeat Order Count</SelectItem>
                    </>}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Applicable Role</Label>
                <Select value={form.role_filter} onValueChange={v => setForm(p => ({ ...p, role_filter: v }))}>
                  <SelectTrigger><SelectValue placeholder="All Roles" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="sales_executive">Sales Executive</SelectItem>
                    <SelectItem value="team_lead">Team Lead</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="area_manager">Area Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the incentive rule..." rows={2} /></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><Label>Effective From *</Label><Input type="date" value={form.effective_from} onChange={e => setForm(p => ({ ...p, effective_from: e.target.value }))} /></div>
              <div><Label>Effective To</Label><Input type="date" value={form.effective_to} onChange={e => setForm(p => ({ ...p, effective_to: e.target.value }))} /></div>
              <div><Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Commission Slabs & Bonuses</CardTitle>
              <Button variant="outline" size="sm" onClick={addSlab}><Plus className="h-3 w-3 mr-1" />Add Slab</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-6 gap-2 text-xs font-medium text-muted-foreground px-1">
                <span>Min Value</span><span>Max Value</span><span>Rate Type</span><span>Rate Value</span><span>Bonus Amount</span><span></span>
              </div>
              {form.slab_config.map((slab: SlabItem, i: number) => (
                <div key={i} className="grid grid-cols-6 gap-2 items-end">
                  <Input type="number" value={slab.min} onChange={e => updateSlab(i, 'min', Number(e.target.value))} />
                  <Input type="number" value={slab.max} onChange={e => updateSlab(i, 'max', Number(e.target.value))} />
                  <Select value={slab.rate_type} onValueChange={v => updateSlab(i, 'rate_type', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="number" value={slab.rate_value} onChange={e => updateSlab(i, 'rate_value', Number(e.target.value))} />
                  <Input type="number" value={slab.bonus} onChange={e => updateSlab(i, 'bonus', Number(e.target.value))} placeholder="0" />
                  <Button variant="ghost" size="icon" onClick={() => removeSlab(i)} className="text-destructive" disabled={form.slab_config.length <= 1}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Automation & Integration</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between border rounded-lg p-4">
                <div><Label>Auto-Calculate from Sales</Label><p className="text-xs text-muted-foreground">Link with orders & targets data</p></div>
                <Switch checked={form.auto_calculate} onCheckedChange={v => setForm(p => ({ ...p, auto_calculate: v }))} />
              </div>
              <div className="flex items-center justify-between border rounded-lg p-4">
                <div><Label>Approval Required</Label><p className="text-xs text-muted-foreground">Manager approval before payout</p></div>
                <Switch checked={form.approval_required} onCheckedChange={v => setForm(p => ({ ...p, approval_required: v }))} />
              </div>
              <div className="flex items-center justify-between border rounded-lg p-4">
                <div><Label>Link to Payroll</Label><p className="text-xs text-muted-foreground">Auto-add to monthly salary</p></div>
                <Switch checked={form.link_to_payroll} onCheckedChange={v => setForm(p => ({ ...p, link_to_payroll: v }))} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          <Button variant="outline" onClick={handleReset}>Reset</Button>
          {!editingId && <Button variant="outline" onClick={() => { handleSubmit(); setForm(emptyForm); }}>Create & Add More</Button>}
          <Button onClick={handleSubmit} disabled={createRule.isPending || updateRule.isPending}>
            {(createRule.isPending || updateRule.isPending) ? 'Saving...' : editingId ? 'Update Rule' : 'Create Rule'}
          </Button>
        </div>
      </div>
    );
  }

  // View rule detail
  if (viewRule) {
    const slabs = viewRule.slab_config || [];
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setViewRule(null)}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{viewRule.name}</h1>
            <p className="text-muted-foreground">Incentive Rule Details</p>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={() => { setViewRule(null); openEdit(viewRule); }}><Edit className="h-4 w-4 mr-2" />Edit</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Rule Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-muted-foreground">Type</span><Badge variant="outline">{viewRule.type?.replace(/_/g, ' ')}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Role</span><span>{viewRule.role_filter || 'All Roles'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Effective From</span><span>{viewRule.effective_from}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Effective To</span><span>{viewRule.effective_to || 'Ongoing'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant={viewRule.status === 'active' ? 'default' : 'secondary'}>{viewRule.status}</Badge></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Commission Slabs</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Min</TableHead><TableHead>Max</TableHead><TableHead>Rate</TableHead><TableHead>Bonus</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(slabs as SlabItem[]).map((s: SlabItem, i: number) => (
                    <TableRow key={i}>
                      <TableCell>₹{s.min?.toLocaleString()}</TableCell>
                      <TableCell>₹{s.max?.toLocaleString()}</TableCell>
                      <TableCell>{s.rate_value}{s.rate_type === 'percentage' ? '%' : ' ₹'}</TableCell>
                      <TableCell>₹{s.bonus?.toLocaleString() || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Incentive & Commission Engine</h1>
          <p className="text-muted-foreground">Manage incentive rules, commission slabs, and employee payouts</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Create Rule</Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><DollarSign className="h-5 w-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">Total Rules</p><p className="text-2xl font-bold">{(rules as any[]).length}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-500/10"><TrendingUp className="h-5 w-5 text-green-500" /></div><div><p className="text-sm text-muted-foreground">Active Rules</p><p className="text-2xl font-bold">{activeRulesCount}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-500/10"><Calculator className="h-5 w-5 text-blue-500" /></div><div><p className="text-sm text-muted-foreground">Total Incentive Paid</p><p className="text-2xl font-bold">₹{(payrollRuns as any[]).reduce((s: number, p: any) => s + (p.incentive_amount || 0), 0).toLocaleString()}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-purple-500/10"><FileText className="h-5 w-5 text-purple-500" /></div><div><p className="text-sm text-muted-foreground">Employees Covered</p><p className="text-2xl font-bold">{new Set((payrollRuns as any[]).map((p: any) => p.employee_id)).size}</p></div></div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="rules">Incentive Rules</TabsTrigger>
          <TabsTrigger value="slabs">Slab Configuration</TabsTrigger>
          <TabsTrigger value="payouts">Payout Summary</TabsTrigger>
        </TabsList>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search rules..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="revenue_based">Revenue Based</SelectItem>
                <SelectItem value="target_based">Target Based</SelectItem>
                <SelectItem value="conversion_based">Conversion Based</SelectItem>
                <SelectItem value="deal_size_based">Deal Size Based</SelectItem>
                <SelectItem value="order_based">Order Based</SelectItem>
                <SelectItem value="scheme_based">Scheme Linked</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Slabs</TableHead>
                  <TableHead>Effective Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rulesLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : filteredRules.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No incentive rules found</TableCell></TableRow>
                ) : filteredRules.map((rule: any) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell><Badge variant="outline">{rule.type?.replace(/_/g, ' ')}</Badge></TableCell>
                    <TableCell>{rule.role_filter || 'All'}</TableCell>
                    <TableCell>{(rule.slab_config as any[])?.length || 0} slabs</TableCell>
                    <TableCell className="text-sm">{rule.effective_from} → {rule.effective_to || 'Ongoing'}</TableCell>
                    <TableCell><Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>{rule.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setViewRule(rule)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(rule)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteRule.mutate(rule.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Slabs Tab */}
        <TabsContent value="slabs" className="space-y-4">
          {(rules as any[]).filter((r: any) => r.status === 'active').length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">
              <Calculator className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No active rules with slabs found.</p>
              <p className="text-sm">Create an incentive rule to configure commission slabs.</p>
            </CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {(rules as any[]).filter((r: any) => r.status === 'active').map((rule: any) => (
                <Card key={rule.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{rule.name}</CardTitle>
                      <Badge variant="outline">{rule.type?.replace(/_/g, ' ')}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{rule.role_filter || 'All Roles'} • {rule.effective_from} → {rule.effective_to || 'Ongoing'}</p>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader><TableRow><TableHead className="text-xs">Min</TableHead><TableHead className="text-xs">Max</TableHead><TableHead className="text-xs">Rate</TableHead><TableHead className="text-xs">Bonus</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {((rule.slab_config || []) as SlabItem[]).map((s: SlabItem, i: number) => (
                          <TableRow key={i}>
                            <TableCell className="text-sm">₹{s.min?.toLocaleString()}</TableCell>
                            <TableCell className="text-sm">₹{s.max?.toLocaleString()}</TableCell>
                            <TableCell className="text-sm">{s.rate_value}{s.rate_type === 'percentage' ? '%' : ' ₹'}</TableCell>
                            <TableCell className="text-sm">₹{s.bonus?.toLocaleString() || 0}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Payout Summary Tab */}
        <TabsContent value="payouts" className="space-y-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <Label>Month</Label>
              <Select value={String(payoutMonth)} onValueChange={v => setPayoutMonth(Number(v))}>
                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Year</Label>
              <Select value={String(payoutYear)} onValueChange={v => setPayoutYear(Number(v))}>
                <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={exportPayoutCSV} disabled={(payrollRuns as any[]).length === 0}><Download className="h-4 w-4 mr-2" />Export CSV</Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Total Orders</TableHead>
                  <TableHead>Order Value</TableHead>
                  <TableHead>Incentive Amount</TableHead>
                  <TableHead>Reimbursement</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Payroll Status</TableHead>
                  <TableHead>Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(payrollRuns as any[]).length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No payroll data for selected period. Run payroll from the Payroll module first.</TableCell></TableRow>
                ) : (payrollRuns as any[]).map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.profiles?.name || 'N/A'}</TableCell>
                    <TableCell>{p.profiles?.employee_id || '-'}</TableCell>
                    <TableCell>{p.total_orders || 0}</TableCell>
                    <TableCell>₹{(p.total_order_value || 0).toLocaleString()}</TableCell>
                    <TableCell className="font-semibold text-green-600">₹{(p.incentive_amount || 0).toLocaleString()}</TableCell>
                    <TableCell>₹{(p.reimbursement_amount || 0).toLocaleString()}</TableCell>
                    <TableCell className="font-semibold">₹{(p.net_salary || 0).toLocaleString()}</TableCell>
                    <TableCell><Badge variant={p.status === 'approved' ? 'default' : 'secondary'}>{p.status}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={p.payment_status === 'paid' ? 'default' : 'outline'} className={p.payment_status === 'paid' ? 'bg-green-500' : ''}>
                        {p.payment_status || 'unpaid'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
