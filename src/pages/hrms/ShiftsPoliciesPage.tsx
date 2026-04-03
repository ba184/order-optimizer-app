import { useState } from 'react';
import { Clock, Plus, Users, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard } from '@/components/ui/StatCard';
import { useShifts, useCreateShift, useShiftAssignments, useAssignShift, useHrPolicies, useCreateHrPolicy } from '@/hooks/useShiftsData';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

const weekDays = [
  { value: 'sunday', label: 'Sun' },
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
];

function useEmployees() {
  return useQuery({
    queryKey: ['employees-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, employee_id, department, designation')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });
}

export default function ShiftsPoliciesPage() {
  const [showShiftDialog, setShowShiftDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);
  const [shiftForm, setShiftForm] = useState({
    name: '', start_time: '09:00', end_time: '18:00', grace_minutes: 15,
    weekly_off: ['sunday'] as string[],
    weekly_off_type: 'fixed',
  });
  const [assignForm, setAssignForm] = useState({ employee_id: '', shift_id: '', effective_from: new Date().toISOString().split('T')[0] });
  const [policyForm, setPolicyForm] = useState({ name: '', category: 'attendance', description: '', rules: '{}' });

  const { data: shifts = [] } = useShifts();
  const { data: assignments = [] } = useShiftAssignments();
  const { data: policies = [] } = useHrPolicies();
  const { data: employees = [] } = useEmployees();
  const createShift = useCreateShift();
  const assignShift = useAssignShift();
  const createPolicy = useCreateHrPolicy();

  const toggleWeeklyOff = (day: string) => {
    setShiftForm(p => ({
      ...p,
      weekly_off: p.weekly_off.includes(day)
        ? p.weekly_off.filter(d => d !== day)
        : [...p.weekly_off, day],
    }));
  };

  const handleCreateShift = () => {
    if (!shiftForm.name) { toast.error('Enter shift name'); return; }
    if (shiftForm.weekly_off.length === 0) { toast.error('Select at least one weekly off day'); return; }
    createShift.mutate({
      name: shiftForm.name,
      start_time: shiftForm.start_time,
      end_time: shiftForm.end_time,
      grace_minutes: shiftForm.grace_minutes,
      weekly_off: shiftForm.weekly_off.join(','),
      weekly_off_type: shiftForm.weekly_off_type,
    }, {
      onSuccess: () => {
        setShowShiftDialog(false);
        setShiftForm({ name: '', start_time: '09:00', end_time: '18:00', grace_minutes: 15, weekly_off: ['sunday'], weekly_off_type: 'fixed' });
      }
    });
  };

  const handleAssignShift = () => {
    if (!assignForm.employee_id || !assignForm.shift_id) { toast.error('Fill all fields'); return; }
    assignShift.mutate(assignForm, { onSuccess: () => {
      setShowAssignDialog(false);
      setAssignForm({ employee_id: '', shift_id: '', effective_from: new Date().toISOString().split('T')[0] });
    }});
  };

  const handleCreatePolicy = () => {
    if (!policyForm.name) { toast.error('Enter policy name'); return; }
    let rules = {};
    try { rules = JSON.parse(policyForm.rules); } catch { toast.error('Invalid JSON in rules'); return; }
    createPolicy.mutate({ ...policyForm, rules }, { onSuccess: () => {
      setShowPolicyDialog(false);
      setPolicyForm({ name: '', category: 'attendance', description: '', rules: '{}' });
    }});
  };

  const formatWeeklyOff = (off: string) => {
    if (!off) return '-';
    return off.split(',').map(d => d.trim().charAt(0).toUpperCase() + d.trim().slice(1)).join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Shifts & Policies</h1>
          <p className="text-muted-foreground">Manage working hours, shifts, and company policies</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Shifts" value={shifts.length} icon={Clock} />
        <StatCard title="Assigned Employees" value={assignments.length} icon={Users} />
        <StatCard title="Active Policies" value={policies.filter((p: any) => p.status === 'active').length} icon={Shield} />
        <StatCard title="Policy Categories" value={[...new Set(policies.map((p: any) => p.category))].length} icon={Shield} />
      </div>

      <Tabs defaultValue="shifts">
        <TabsList>
          <TabsTrigger value="shifts">Shifts</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>

        {/* SHIFTS TAB */}
        <TabsContent value="shifts">
          <div className="flex justify-end mb-4">
            <Dialog open={showShiftDialog} onOpenChange={setShowShiftDialog}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" />Create Shift</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Create Shift</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Shift Name *</Label>
                    <Input value={shiftForm.name} onChange={e => setShiftForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Morning Shift" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Start Time</Label><Input type="time" value={shiftForm.start_time} onChange={e => setShiftForm(p => ({ ...p, start_time: e.target.value }))} /></div>
                    <div><Label>End Time</Label><Input type="time" value={shiftForm.end_time} onChange={e => setShiftForm(p => ({ ...p, end_time: e.target.value }))} /></div>
                  </div>
                  <div>
                    <Label>Grace Time (min)</Label>
                    <Input type="number" value={shiftForm.grace_minutes} onChange={e => setShiftForm(p => ({ ...p, grace_minutes: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <Label>Weekly Off Type</Label>
                    <Select value={shiftForm.weekly_off_type} onValueChange={v => setShiftForm(p => ({ ...p, weekly_off_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed</SelectItem>
                        <SelectItem value="rotational">Rotational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Weekly Off Days *</Label>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {weekDays.map(d => (
                        <label key={d.value} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={shiftForm.weekly_off.includes(d.value)}
                            onCheckedChange={() => toggleWeeklyOff(d.value)}
                          />
                          <span className="text-sm">{d.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowShiftDialog(false)}>Cancel</Button>
                  <Button onClick={handleCreateShift} disabled={createShift.isPending}>Create</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shifts.length === 0 ? (
              <Card className="col-span-full"><CardContent className="p-8 text-center text-muted-foreground">No shifts created yet</CardContent></Card>
            ) : (
              shifts.map((s: any) => (
                <Card key={s.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                      {s.name}
                      <Badge variant={s.status === 'active' ? 'default' : 'secondary'}>{s.status}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Timing</span><span>{s.start_time} - {s.end_time}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Grace Time</span><span>{s.grace_minutes} min</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Weekly Off Type</span><span className="capitalize">{s.weekly_off_type || 'fixed'}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Weekly Off</span><span className="capitalize">{formatWeeklyOff(s.weekly_off)}</span></div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* ASSIGNMENTS TAB */}
        <TabsContent value="assignments">
          <div className="flex justify-end mb-4">
            <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" />Assign Shift</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Assign Shift to Employee</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Employee *</Label>
                    <Select value={assignForm.employee_id} onValueChange={v => setAssignForm(p => ({ ...p, employee_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                      <SelectContent>
                        {employees.map((e: any) => (
                          <SelectItem key={e.id} value={e.id}>
                            {e.name} {e.employee_id ? `(${e.employee_id})` : ''} {e.designation ? `- ${e.designation}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Shift *</Label>
                    <Select value={assignForm.shift_id} onValueChange={v => setAssignForm(p => ({ ...p, shift_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
                      <SelectContent>
                        {shifts.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name} ({s.start_time} - {s.end_time})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Effective From</Label>
                    <Input type="date" value={assignForm.effective_from} onChange={e => setAssignForm(p => ({ ...p, effective_from: e.target.value }))} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancel</Button>
                  <Button onClick={handleAssignShift} disabled={assignShift.isPending}>Assign</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3">Employee</th>
                      <th className="text-left p-3">Employee ID</th>
                      <th className="text-left p-3">Shift</th>
                      <th className="text-left p-3">Timing</th>
                      <th className="text-left p-3">Effective From</th>
                      <th className="text-center p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.length === 0 ? (
                      <tr><td colSpan={6} className="text-center p-8 text-muted-foreground">No shift assignments</td></tr>
                    ) : (
                      assignments.map((a: any) => (
                        <tr key={a.id} className="border-b hover:bg-muted/30">
                          <td className="p-3 font-medium">{a.profiles?.name || 'Unknown'}</td>
                          <td className="p-3">{a.profiles?.employee_id || '-'}</td>
                          <td className="p-3">{a.shifts?.name || '-'}</td>
                          <td className="p-3">{a.shifts?.start_time} - {a.shifts?.end_time}</td>
                          <td className="p-3">{a.effective_from}</td>
                          <td className="text-center p-3"><Badge variant={a.status === 'active' ? 'default' : 'secondary'}>{a.status}</Badge></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* POLICIES TAB */}
        <TabsContent value="policies">
          <div className="flex justify-end mb-4">
            <Dialog open={showPolicyDialog} onOpenChange={setShowPolicyDialog}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" />Create Policy</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create HR Policy</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Policy Name *</Label>
                    <Input value={policyForm.name} onChange={e => setPolicyForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Late Coming Policy" />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select value={policyForm.category} onValueChange={v => setPolicyForm(p => ({ ...p, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="attendance">Attendance</SelectItem>
                        <SelectItem value="leave">Leave</SelectItem>
                        <SelectItem value="overtime">Overtime</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea value={policyForm.description} onChange={e => setPolicyForm(p => ({ ...p, description: e.target.value }))} placeholder="Policy description" />
                  </div>
                  <div>
                    <Label>Rules (JSON)</Label>
                    <Textarea value={policyForm.rules} onChange={e => setPolicyForm(p => ({ ...p, rules: e.target.value }))} placeholder='{"max_late_days": 3, "penalty_per_day": 100}' rows={4} className="font-mono text-xs" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowPolicyDialog(false)}>Cancel</Button>
                  <Button onClick={handleCreatePolicy} disabled={createPolicy.isPending}>Create</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {policies.length === 0 ? (
              <Card className="col-span-full"><CardContent className="p-8 text-center text-muted-foreground">No policies defined</CardContent></Card>
            ) : (
              policies.map((p: any) => (
                <Card key={p.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                      {p.name}
                      <div className="flex gap-2">
                        <Badge variant="outline" className="capitalize">{p.category}</Badge>
                        <Badge variant={p.status === 'active' ? 'default' : 'secondary'}>{p.status}</Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{p.description || 'No description'}</p>
                    {p.rules && Object.keys(p.rules).length > 0 && (
                      <div className="bg-muted/50 rounded p-2 text-xs font-mono">
                        {Object.entries(p.rules).map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span className="text-muted-foreground">{k.replace(/_/g, ' ')}</span>
                            <span>{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
