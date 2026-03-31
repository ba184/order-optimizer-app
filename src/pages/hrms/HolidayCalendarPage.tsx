import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Calendar, Trash2 } from 'lucide-react';
import { useHolidayCalendar, useCreateHoliday, useDeleteHoliday } from '@/hooks/useLifecycleData';
import { toast } from 'sonner';

export default function HolidayCalendarPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [showCreate, setShowCreate] = useState(false);
  const { data: holidays = [], isLoading } = useHolidayCalendar(year);
  const createHoliday = useCreateHoliday();
  const deleteHoliday = useDeleteHoliday();

  const [form, setForm] = useState({ name: '', date: '', type: 'public', applicable_to: 'all', year: currentYear });

  const handleCreate = () => {
    if (!form.name || !form.date) { toast.error('Name and date are required'); return; }
    createHoliday.mutate({ ...form, year: new Date(form.date).getFullYear() }, {
      onSuccess: () => { setShowCreate(false); setForm({ name: '', date: '', type: 'public', applicable_to: 'all', year: currentYear }); }
    });
  };

  const typeColors: Record<string, string> = { public: 'default', optional: 'secondary', restricted: 'outline' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Holiday Calendar</h1>
          <p className="text-muted-foreground">Manage company holidays and off days</p>
        </div>
        <div className="flex gap-2">
          <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[currentYear - 1, currentYear, currentYear + 1].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Holiday</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Holiday</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Holiday Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Republic Day" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Date *</Label><Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
                  <div><Label>Type</Label>
                    <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public Holiday</SelectItem>
                        <SelectItem value="optional">Optional Holiday</SelectItem>
                        <SelectItem value="restricted">Restricted Holiday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Applicable To</Label>
                  <Select value={form.applicable_to} onValueChange={v => setForm(p => ({ ...p, applicable_to: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      <SelectItem value="zone_specific">Zone Specific</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                  <Button onClick={handleCreate} disabled={createHoliday.isPending}>{createHoliday.isPending ? 'Adding...' : 'Add Holiday'}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><Calendar className="h-5 w-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">Total Holidays</p><p className="text-2xl font-bold">{(holidays as any[]).length}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-500/10"><Calendar className="h-5 w-5 text-green-500" /></div><div><p className="text-sm text-muted-foreground">Public</p><p className="text-2xl font-bold">{(holidays as any[]).filter((h: any) => h.type === 'public').length}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-500/10"><Calendar className="h-5 w-5 text-blue-500" /></div><div><p className="text-sm text-muted-foreground">Optional</p><p className="text-2xl font-bold">{(holidays as any[]).filter((h: any) => h.type === 'optional').length}</p></div></div></CardContent></Card>
      </div>

      <Card>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Holiday</TableHead><TableHead>Date</TableHead><TableHead>Day</TableHead><TableHead>Type</TableHead><TableHead>Applicable To</TableHead><TableHead>Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : (holidays as any[]).length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No holidays for {year}</TableCell></TableRow>
            ) : (holidays as any[]).map((h: any) => (
              <TableRow key={h.id}>
                <TableCell className="font-medium">{h.name}</TableCell>
                <TableCell>{h.date}</TableCell>
                <TableCell>{new Date(h.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })}</TableCell>
                <TableCell><Badge variant={(typeColors[h.type] as any) || 'outline'}>{h.type}</Badge></TableCell>
                <TableCell>{h.applicable_to === 'all' ? 'All' : 'Zone Specific'}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => deleteHoliday.mutate(h.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
