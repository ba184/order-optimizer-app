import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Plus, ArrowRightLeft, UserCheck, UserX, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useLifecycleEvents, useCreateLifecycleEvent, useUpdateLifecycleEvent } from '@/hooks/useLifecycleData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const eventTypeLabels: Record<string, string> = {
  probation_start: 'Probation Start', probation_end: 'Probation End', confirmation: 'Confirmation',
  promotion: 'Promotion', transfer: 'Transfer', resignation: 'Resignation', termination: 'Termination', fnf: 'Full & Final',
};

export default function EmployeeLifecyclePage() {
  const [activeTab, setActiveTab] = useState('events');
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: events = [], isLoading } = useLifecycleEvents();
  const createEvent = useCreateLifecycleEvent();
  const updateEvent = useUpdateLifecycleEvent();

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-lifecycle'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('id, name, email, employee_id, is_probation').order('name');
      return data || [];
    },
  });

  const initialForm = { employee_id: '', event_type: 'probation_start', event_date: '', from_role: '', to_role: '', from_location: '', to_location: '', reason: '', remarks: '' };
  const [eventForm, setEventForm] = useState(initialForm);

  const handleCreateEvent = () => {
    if (!eventForm.employee_id || !eventForm.event_date) { toast.error('Employee and date are required'); return; }
    createEvent.mutate(eventForm, {
      onSuccess: () => { setShowCreateEvent(false); setEventForm(initialForm); }
    });
  };

  const filteredEvents = useMemo(() => {
    let e = events as any[];
    if (typeFilter !== 'all') e = e.filter((ev: any) => ev.event_type === typeFilter);
    if (statusFilter !== 'all') e = e.filter((ev: any) => ev.status === statusFilter);
    return e;
  }, [events, typeFilter, statusFilter]);

  const probationEvents = useMemo(() =>
    (events as any[]).filter((e: any) => ['probation_start', 'probation_end', 'confirmation'].includes(e.event_type)),
    [events]
  );

  const exitEvents = useMemo(() =>
    (events as any[]).filter((e: any) => ['resignation', 'termination', 'fnf'].includes(e.event_type)),
    [events]
  );

  const pendingCount = (events as any[]).filter((e: any) => e.status === 'pending').length;
  const promotions = (events as any[]).filter((e: any) => e.event_type === 'promotion').length;
  const exits = exitEvents.length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-500/10 text-green-600 border-green-200">Approved</Badge>;
      case 'completed': return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">Completed</Badge>;
      case 'rejected': return <Badge className="bg-red-500/10 text-red-600 border-red-200">Rejected</Badge>;
      default: return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200">Pending</Badge>;
    }
  };

  const showFromTo = ['promotion', 'transfer'].includes(eventForm.event_type);
  const showExitFields = ['resignation', 'termination', 'fnf'].includes(eventForm.event_type);

  const CreateEventDialog = (
    <Dialog open={showCreateEvent} onOpenChange={setShowCreateEvent}>
      <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Record Event</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Record Lifecycle Event</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Employee *</Label>
            <Select value={eventForm.employee_id} onValueChange={v => setEventForm(p => ({ ...p, employee_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
              <SelectContent>
                {employees.map((e: any) => (
                  <SelectItem key={e.id} value={e.id}>{e.name} {e.employee_id ? `(${e.employee_id})` : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
          {showFromTo && (
            <div className="grid grid-cols-2 gap-4">
              <div><Label>From {eventForm.event_type === 'promotion' ? 'Role' : 'Location'}</Label>
                <Input value={eventForm.event_type === 'promotion' ? eventForm.from_role : eventForm.from_location} onChange={e => setEventForm(p => ({ ...p, [eventForm.event_type === 'promotion' ? 'from_role' : 'from_location']: e.target.value }))} />
              </div>
              <div><Label>To {eventForm.event_type === 'promotion' ? 'Role' : 'Location'}</Label>
                <Input value={eventForm.event_type === 'promotion' ? eventForm.to_role : eventForm.to_location} onChange={e => setEventForm(p => ({ ...p, [eventForm.event_type === 'promotion' ? 'to_role' : 'to_location']: e.target.value }))} />
              </div>
            </div>
          )}
          {showExitFields && (
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Last Working Date</Label><Input type="date" onChange={e => setEventForm(p => ({ ...p, metadata: JSON.stringify({ last_working_date: e.target.value }) } as any))} /></div>
              <div><Label>Notice Period (days)</Label><Input type="number" placeholder="30" onChange={e => setEventForm(p => ({ ...p, remarks: `Notice period: ${e.target.value} days. ${p.remarks}` }))} /></div>
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
  );

  const EventTable = ({ data, emptyMsg }: { data: any[]; emptyMsg: string }) => (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Event Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
          ) : data.length === 0 ? (
            <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{emptyMsg}</TableCell></TableRow>
          ) : data.map((event: any) => (
            <TableRow key={event.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{event.employee?.name || '-'}</p>
                  <p className="text-xs text-muted-foreground">{event.employee?.employee_code || ''}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={
                  ['resignation', 'termination'].includes(event.event_type) ? 'destructive' :
                  ['promotion', 'confirmation'].includes(event.event_type) ? 'default' : 'outline'
                }>
                  {eventTypeLabels[event.event_type] || event.event_type}
                </Badge>
              </TableCell>
              <TableCell>{event.event_date}</TableCell>
              <TableCell className="max-w-[250px]">
                <p className="text-sm truncate">{event.reason || '-'}</p>
                {(event.from_role || event.to_role) && <p className="text-xs text-muted-foreground">{event.from_role} → {event.to_role}</p>}
                {(event.from_location || event.to_location) && <p className="text-xs text-muted-foreground">{event.from_location} → {event.to_location}</p>}
              </TableCell>
              <TableCell>{getStatusBadge(event.status)}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {event.status === 'pending' && (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => updateEvent.mutate({ id: event.id, status: 'approved', approved_at: new Date().toISOString() })} title="Approve">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => updateEvent.mutate({ id: event.id, status: 'rejected' })} title="Reject">
                        <XCircle className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  )}
                  {event.status === 'approved' && event.event_type !== 'fnf' && (
                    <Button variant="ghost" size="icon" onClick={() => updateEvent.mutate({ id: event.id, status: 'completed' })} title="Mark Completed">
                      <Clock className="h-4 w-4 text-blue-500" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );

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
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-yellow-500/10"><UserCheck className="h-5 w-5 text-yellow-500" /></div><div><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold">{pendingCount}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-500/10"><TrendingUp className="h-5 w-5 text-green-500" /></div><div><p className="text-sm text-muted-foreground">Promotions</p><p className="text-2xl font-bold">{promotions}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-red-500/10"><UserX className="h-5 w-5 text-red-500" /></div><div><p className="text-sm text-muted-foreground">Exits</p><p className="text-2xl font-bold">{exits}</p></div></div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="events">All Events</TabsTrigger>
          <TabsTrigger value="probation">Probation Tracker</TabsTrigger>
          <TabsTrigger value="exits">Exit Management</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex gap-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Event Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(eventTypeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {CreateEventDialog}
          </div>
          <EventTable data={filteredEvents} emptyMsg="No lifecycle events recorded" />
        </TabsContent>

        <TabsContent value="probation" className="space-y-4">
          <div className="flex justify-end">{CreateEventDialog}</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">On Probation</p>
                <p className="text-2xl font-bold">{employees.filter((e: any) => e.is_probation).length}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold">{probationEvents.filter((e: any) => e.event_type === 'confirmation').length}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">Probation Events</p>
                <p className="text-2xl font-bold">{probationEvents.length}</p>
              </CardContent>
            </Card>
          </div>
          <EventTable data={probationEvents} emptyMsg="No probation events found" />
        </TabsContent>

        <TabsContent value="exits" className="space-y-4">
          <div className="flex justify-end">{CreateEventDialog}</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">Resignations</p>
                <p className="text-2xl font-bold">{exitEvents.filter((e: any) => e.event_type === 'resignation').length}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-destructive">
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">Terminations</p>
                <p className="text-2xl font-bold">{exitEvents.filter((e: any) => e.event_type === 'termination').length}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">F&F Pending</p>
                <p className="text-2xl font-bold">{exitEvents.filter((e: any) => e.event_type === 'fnf' && e.status === 'pending').length}</p>
              </CardContent>
            </Card>
          </div>
          <EventTable data={exitEvents} emptyMsg="No exit events found" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
