import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Plus, ArrowRightLeft, UserCheck, UserX, TrendingUp, Eye } from 'lucide-react';
import { useLifecycleEvents, useCreateLifecycleEvent, useUpdateLifecycleEvent, useOnboardingChecklists } from '@/hooks/useLifecycleData';
import { toast } from 'sonner';

export default function EmployeeLifecyclePage() {
  const [activeTab, setActiveTab] = useState('events');
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const { data: events = [], isLoading } = useLifecycleEvents();
  const createEvent = useCreateLifecycleEvent();
  const updateEvent = useUpdateLifecycleEvent();

  const [eventForm, setEventForm] = useState({
    employee_id: '', event_type: 'probation_start', event_date: '', from_role: '', to_role: '', from_location: '', to_location: '', reason: '', remarks: '',
  });

  const handleCreateEvent = () => {
    if (!eventForm.employee_id || !eventForm.event_date) { toast.error('Employee and date are required'); return; }
    createEvent.mutate(eventForm, {
      onSuccess: () => { setShowCreateEvent(false); setEventForm({ employee_id: '', event_type: 'probation_start', event_date: '', from_role: '', to_role: '', from_location: '', to_location: '', reason: '', remarks: '' }); }
    });
  };

  const eventTypeLabels: Record<string, string> = {
    probation_start: 'Probation Start', probation_end: 'Probation End', confirmation: 'Confirmation',
    promotion: 'Promotion', transfer: 'Transfer', resignation: 'Resignation', termination: 'Termination', fnf: 'Full & Final',
  };

  const eventTypeColors: Record<string, string> = {
    probation_start: 'outline', probation_end: 'secondary', confirmation: 'default',
    promotion: 'default', transfer: 'secondary', resignation: 'destructive', termination: 'destructive', fnf: 'outline',
  };

  const pendingEvents = (events as any[]).filter((e: any) => e.status === 'pending').length;
  const promotions = (events as any[]).filter((e: any) => e.event_type === 'promotion').length;
  const exits = (events as any[]).filter((e: any) => ['resignation', 'termination'].includes(e.event_type)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Employee Lifecycle</h1>
          <p className="text-muted-foreground">Track probation, confirmations, promotions, transfers, and exits</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><ArrowRightLeft className="h-5 w-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">Total Events</p><p className="text-2xl font-bold">{(events as any[]).length}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-yellow-500/10"><UserCheck className="h-5 w-5 text-yellow-500" /></div><div><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold">{pendingEvents}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-500/10"><TrendingUp className="h-5 w-5 text-green-500" /></div><div><p className="text-sm text-muted-foreground">Promotions</p><p className="text-2xl font-bold">{promotions}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-red-500/10"><UserX className="h-5 w-5 text-red-500" /></div><div><p className="text-sm text-muted-foreground">Exits</p><p className="text-2xl font-bold">{exits}</p></div></div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="events">Lifecycle Events</TabsTrigger>
          <TabsTrigger value="probation">Probation Tracker</TabsTrigger>
          <TabsTrigger value="exits">Exit Management</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={showCreateEvent} onOpenChange={setShowCreateEvent}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Record Event</Button></DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Record Lifecycle Event</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><Label>Employee ID *</Label><Input value={eventForm.employee_id} onChange={e => setEventForm(p => ({ ...p, employee_id: e.target.value }))} placeholder="Employee UUID" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Event Type *</Label>
                      <Select value={eventForm.event_type} onValueChange={v => setEventForm(p => ({ ...p, event_type: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(eventTypeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>Event Date *</Label><Input type="date" value={eventForm.event_date} onChange={e => setEventForm(p => ({ ...p, event_date: e.target.value }))} /></div>
                  </div>
                  {(eventForm.event_type === 'promotion' || eventForm.event_type === 'transfer') && (
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>From {eventForm.event_type === 'promotion' ? 'Role' : 'Location'}</Label><Input value={eventForm.event_type === 'promotion' ? eventForm.from_role : eventForm.from_location} onChange={e => setEventForm(p => ({ ...p, [eventForm.event_type === 'promotion' ? 'from_role' : 'from_location']: e.target.value }))} /></div>
                      <div><Label>To {eventForm.event_type === 'promotion' ? 'Role' : 'Location'}</Label><Input value={eventForm.event_type === 'promotion' ? eventForm.to_role : eventForm.to_location} onChange={e => setEventForm(p => ({ ...p, [eventForm.event_type === 'promotion' ? 'to_role' : 'to_location']: e.target.value }))} /></div>
                    </div>
                  )}
                  <div><Label>Reason</Label><Textarea value={eventForm.reason} onChange={e => setEventForm(p => ({ ...p, reason: e.target.value }))} rows={2} /></div>
                  <div><Label>Remarks</Label><Textarea value={eventForm.remarks} onChange={e => setEventForm(p => ({ ...p, remarks: e.target.value }))} rows={2} /></div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCreateEvent(false)}>Cancel</Button>
                    <Button onClick={handleCreateEvent} disabled={createEvent.isPending}>{createEvent.isPending ? 'Recording...' : 'Record Event'}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Employee</TableHead><TableHead>Event Type</TableHead><TableHead>Date</TableHead><TableHead>Details</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : (events as any[]).length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No lifecycle events recorded</TableCell></TableRow>
                ) : (events as any[]).map((event: any) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.employee?.name || event.employee_id?.slice(0, 8)}</TableCell>
                    <TableCell><Badge variant={(eventTypeColors[event.event_type] as any) || 'outline'}>{eventTypeLabels[event.event_type] || event.event_type}</Badge></TableCell>
                    <TableCell>{event.event_date}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{event.reason || '-'}</TableCell>
                    <TableCell><Badge variant={event.status === 'completed' ? 'default' : event.status === 'approved' ? 'secondary' : 'outline'}>{event.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {event.status === 'pending' && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => updateEvent.mutate({ id: event.id, status: 'approved' })} className="text-green-600">Approve</Button>
                            <Button variant="ghost" size="sm" onClick={() => updateEvent.mutate({ id: event.id, status: 'rejected' })} className="text-destructive">Reject</Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="probation">
          <Card><CardContent className="py-12 text-center text-muted-foreground">
            <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Track employees currently on probation.</p>
            <p className="text-sm">Filter probation_start events to see pending confirmations with due dates.</p>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="exits">
          <Card><CardContent className="py-12 text-center text-muted-foreground">
            <UserX className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Manage resignations, terminations, and full & final settlements.</p>
            <p className="text-sm">Track exit interviews, notice periods, and FNF processing.</p>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
