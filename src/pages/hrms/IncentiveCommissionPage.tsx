import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, DollarSign, TrendingUp, FileText, Calculator, Eye, Edit, Trash2 } from 'lucide-react';
import { useIncentiveRules, useCreateIncentiveRule, useDeleteIncentiveRule } from '@/hooks/useIncentiveData';
import { useSalaryStructures, useCreateSalaryStructure, usePayrollRuns, useRunPayroll, useApprovePayroll, useMarkPayrollPaid } from '@/hooks/usePayrollData';
import { toast } from 'sonner';

export default function IncentiveCommissionPage() {
  const [activeTab, setActiveTab] = useState('rules');
  const [showCreateRule, setShowCreateRule] = useState(false);
  const { data: rules = [], isLoading: rulesLoading } = useIncentiveRules();
  const createRule = useCreateIncentiveRule();
  const deleteRule = useDeleteIncentiveRule();

  const [ruleForm, setRuleForm] = useState({
    name: '', type: 'order_based', role_filter: '', effective_from: '',
    effective_to: '', slab_config: [{ min: 0, max: 50000, rate_type: 'percentage', rate_value: 2 }],
  });

  const handleCreateRule = () => {
    if (!ruleForm.name || !ruleForm.effective_from) {
      toast.error('Name and effective date are required');
      return;
    }
    createRule.mutate(ruleForm, {
      onSuccess: () => { setShowCreateRule(false); setRuleForm({ name: '', type: 'order_based', role_filter: '', effective_from: '', effective_to: '', slab_config: [{ min: 0, max: 50000, rate_type: 'percentage', rate_value: 2 }] }); }
    });
  };

  const addSlab = () => {
    setRuleForm(prev => ({
      ...prev,
      slab_config: [...prev.slab_config, { min: 0, max: 0, rate_type: 'percentage', rate_value: 0 }]
    }));
  };

  const updateSlab = (index: number, field: string, value: any) => {
    setRuleForm(prev => ({
      ...prev,
      slab_config: prev.slab_config.map((s, i) => i === index ? { ...s, [field]: value } : s)
    }));
  };

  const removeSlab = (index: number) => {
    setRuleForm(prev => ({
      ...prev,
      slab_config: prev.slab_config.filter((_, i) => i !== index)
    }));
  };

  const activeRules = (rules as any[]).filter((r: any) => r.status === 'active').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Incentive & Commission Engine</h1>
          <p className="text-muted-foreground">Manage incentive rules, commission slabs, and payouts</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><DollarSign className="h-5 w-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">Total Rules</p><p className="text-2xl font-bold">{(rules as any[]).length}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-500/10"><TrendingUp className="h-5 w-5 text-green-500" /></div><div><p className="text-sm text-muted-foreground">Active Rules</p><p className="text-2xl font-bold">{activeRules}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-500/10"><Calculator className="h-5 w-5 text-blue-500" /></div><div><p className="text-sm text-muted-foreground">Order Based</p><p className="text-2xl font-bold">{(rules as any[]).filter((r: any) => r.type === 'order_based').length}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-purple-500/10"><FileText className="h-5 w-5 text-purple-500" /></div><div><p className="text-sm text-muted-foreground">Scheme Based</p><p className="text-2xl font-bold">{(rules as any[]).filter((r: any) => r.type === 'scheme_based').length}</p></div></div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="rules">Incentive Rules</TabsTrigger>
          <TabsTrigger value="slabs">Commission Slabs</TabsTrigger>
          <TabsTrigger value="payouts">Payout Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={showCreateRule} onOpenChange={setShowCreateRule}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Create Rule</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Create Incentive Rule</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Rule Name *</Label><Input value={ruleForm.name} onChange={e => setRuleForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Q1 Sales Incentive" /></div>
                    <div><Label>Type *</Label>
                      <Select value={ruleForm.type} onValueChange={v => setRuleForm(p => ({ ...p, type: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="order_based">Order Based</SelectItem>
                          <SelectItem value="scheme_based">Scheme Based</SelectItem>
                          <SelectItem value="product_based">Product Based</SelectItem>
                          <SelectItem value="category_based">Category Based</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Role Filter</Label>
                      <Select value={ruleForm.role_filter} onValueChange={v => setRuleForm(p => ({ ...p, role_filter: v }))}>
                        <SelectTrigger><SelectValue placeholder="All Roles" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="sales_executive">Sales Executive</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label>From *</Label><Input type="date" value={ruleForm.effective_from} onChange={e => setRuleForm(p => ({ ...p, effective_from: e.target.value }))} /></div>
                      <div><Label>To</Label><Input type="date" value={ruleForm.effective_to} onChange={e => setRuleForm(p => ({ ...p, effective_to: e.target.value }))} /></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Commission Slabs</Label>
                      <Button variant="outline" size="sm" onClick={addSlab}><Plus className="h-3 w-3 mr-1" />Add Slab</Button>
                    </div>
                    {ruleForm.slab_config.map((slab, i) => (
                      <div key={i} className="grid grid-cols-5 gap-2 mb-2 items-end">
                        <div><Label className="text-xs">Min Value</Label><Input type="number" value={slab.min} onChange={e => updateSlab(i, 'min', Number(e.target.value))} /></div>
                        <div><Label className="text-xs">Max Value</Label><Input type="number" value={slab.max} onChange={e => updateSlab(i, 'max', Number(e.target.value))} /></div>
                        <div><Label className="text-xs">Rate Type</Label>
                          <Select value={slab.rate_type} onValueChange={v => updateSlab(i, 'rate_type', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">Percentage</SelectItem>
                              <SelectItem value="fixed">Fixed Amount</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div><Label className="text-xs">Rate Value</Label><Input type="number" value={slab.rate_value} onChange={e => updateSlab(i, 'rate_value', Number(e.target.value))} /></div>
                        <Button variant="ghost" size="sm" onClick={() => removeSlab(i)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCreateRule(false)}>Cancel</Button>
                    <Button onClick={handleCreateRule} disabled={createRule.isPending}>{createRule.isPending ? 'Creating...' : 'Create Rule'}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Effective From</TableHead>
                  <TableHead>Effective To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rulesLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : (rules as any[]).length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No incentive rules found</TableCell></TableRow>
                ) : (rules as any[]).map((rule: any) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell><Badge variant="outline">{rule.type?.replace('_', ' ')}</Badge></TableCell>
                    <TableCell>{rule.role_filter || 'All'}</TableCell>
                    <TableCell>{rule.effective_from}</TableCell>
                    <TableCell>{rule.effective_to || '-'}</TableCell>
                    <TableCell><Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>{rule.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteRule.mutate(rule.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="slabs">
          <Card><CardContent className="py-12 text-center text-muted-foreground">
            <Calculator className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Commission slabs are configured within each incentive rule.</p>
            <p className="text-sm">Create or edit an incentive rule to manage its commission slabs.</p>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card><CardContent className="py-12 text-center text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Payout summaries will be generated from payroll runs.</p>
            <p className="text-sm">Run payroll to see incentive payouts calculated from active rules.</p>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
