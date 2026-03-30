import { useState } from 'react';
import { MapPin, Plus, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { StatCard } from '@/components/ui/StatCard';
import { useTravelClaims, useCreateTravelClaim, useApproveTravelClaim, useRejectTravelClaim } from '@/hooks/useTravelClaimsData';
import { toast } from 'sonner';

const travelTypes = [
  { value: 'local', label: 'Local', rate: 8 },
  { value: 'outstation', label: 'Outstation', rate: 12 },
  { value: 'intercity', label: 'Inter-City', rate: 10 },
  { value: 'two_wheeler', label: 'Two Wheeler', rate: 5 },
  { value: 'four_wheeler', label: 'Four Wheeler', rate: 10 },
];

export default function TravelAllowancePage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState<{ id: string; open: boolean }>({ id: '', open: false });
  const [rejectReason, setRejectReason] = useState('');
  const [form, setForm] = useState({
    claim_date: new Date().toISOString().split('T')[0],
    start_location: '',
    end_location: '',
    distance_km: 0,
    travel_type: 'local',
    rate_per_km: 8,
    total_amount: 0,
    purpose: '',
  });

  const { data: claims = [], isLoading } = useTravelClaims(statusFilter);
  const createClaim = useCreateTravelClaim();
  const approveClaim = useApproveTravelClaim();
  const rejectClaim = useRejectTravelClaim();

  const totalClaims = claims.length;
  const totalAmount = claims.reduce((s: number, c: any) => s + (c.total_amount || 0), 0);
  const pendingCount = claims.filter((c: any) => c.status === 'pending').length;
  const approvedAmount = claims.filter((c: any) => c.status === 'approved').reduce((s: number, c: any) => s + (c.total_amount || 0), 0);

  const updateForm = (key: string, value: any) => {
    const updated = { ...form, [key]: value };
    if (key === 'travel_type') {
      const type = travelTypes.find(t => t.value === value);
      updated.rate_per_km = type?.rate || 0;
      updated.total_amount = updated.distance_km * (type?.rate || 0);
    }
    if (key === 'distance_km') {
      updated.total_amount = Number(value) * updated.rate_per_km;
    }
    setForm(updated);
  };

  const handleCreate = () => {
    if (!form.start_location || !form.end_location) { toast.error('Fill all required fields'); return; }
    createClaim.mutate(form, { onSuccess: () => {
      setShowCreateDialog(false);
      setForm({ claim_date: new Date().toISOString().split('T')[0], start_location: '', end_location: '', distance_km: 0, travel_type: 'local', rate_per_km: 8, total_amount: 0, purpose: '' });
    }});
  };

  const handleReject = () => {
    if (!rejectReason) { toast.error('Enter rejection reason'); return; }
    rejectClaim.mutate({ id: rejectDialog.id, reason: rejectReason }, {
      onSuccess: () => { setRejectDialog({ id: '', open: false }); setRejectReason(''); },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Travel Allowance</h1>
          <p className="text-muted-foreground">Track and reimburse employee travel</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />New Claim</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Travel Claim</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Date *</Label>
                <Input type="date" value={form.claim_date} onChange={e => updateForm('claim_date', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Location *</Label>
                  <Input value={form.start_location} onChange={e => updateForm('start_location', e.target.value)} placeholder="From" />
                </div>
                <div>
                  <Label>End Location *</Label>
                  <Input value={form.end_location} onChange={e => updateForm('end_location', e.target.value)} placeholder="To" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Travel Type</Label>
                  <Select value={form.travel_type} onValueChange={v => updateForm('travel_type', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {travelTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label} (₹{t.rate}/km)</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Distance (km) *</Label>
                  <Input type="number" value={form.distance_km} onChange={e => updateForm('distance_km', Number(e.target.value))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Rate/KM</Label>
                  <Input type="number" value={form.rate_per_km} readOnly className="bg-muted" />
                </div>
                <div>
                  <Label>Total Amount</Label>
                  <Input value={`₹${form.total_amount.toLocaleString()}`} readOnly className="bg-muted font-semibold" />
                </div>
              </div>
              <div>
                <Label>Purpose</Label>
                <Textarea value={form.purpose} onChange={e => updateForm('purpose', e.target.value)} placeholder="Travel purpose" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={createClaim.isPending}>Submit</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Claims" value={totalClaims} icon={MapPin} />
        <StatCard title="Total Amount" value={`₹${totalAmount.toLocaleString()}`} icon={MapPin} />
        <StatCard title="Pending" value={pendingCount} icon={MapPin} />
        <StatCard title="Approved Amount" value={`₹${approvedAmount.toLocaleString()}`} icon={CheckCircle} />
      </div>

      <div className="flex gap-2 mb-4">
        {['all', 'pending', 'approved', 'rejected'].map(s => (
          <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(s)} className="capitalize">{s}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3">Employee</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Route</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-right p-3">Distance</th>
                  <th className="text-right p-3">Rate</th>
                  <th className="text-right p-3">Amount</th>
                  <th className="text-center p-3">Status</th>
                  <th className="text-center p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={9} className="text-center p-8 text-muted-foreground">Loading...</td></tr>
                ) : claims.length === 0 ? (
                  <tr><td colSpan={9} className="text-center p-8 text-muted-foreground">No travel claims found</td></tr>
                ) : (
                  claims.map((c: any) => (
                    <tr key={c.id} className="border-b hover:bg-muted/30">
                      <td className="p-3 font-medium">{c.profiles?.name || 'Unknown'}</td>
                      <td className="p-3">{c.claim_date}</td>
                      <td className="p-3">
                        <div className="text-xs">{c.start_location} → {c.end_location}</div>
                      </td>
                      <td className="p-3 capitalize">{c.travel_type?.replace('_', ' ')}</td>
                      <td className="text-right p-3">{c.distance_km} km</td>
                      <td className="text-right p-3">₹{c.rate_per_km}</td>
                      <td className="text-right p-3 font-semibold">₹{(c.total_amount || 0).toLocaleString()}</td>
                      <td className="text-center p-3">
                        <Badge variant={c.status === 'approved' ? 'default' : c.status === 'rejected' ? 'destructive' : 'secondary'}>{c.status}</Badge>
                      </td>
                      <td className="text-center p-3">
                        {c.status === 'pending' && (
                          <div className="flex gap-1 justify-center">
                            <Button size="sm" variant="ghost" onClick={() => approveClaim.mutate(c.id)}><CheckCircle className="h-4 w-4 text-green-600" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => setRejectDialog({ id: c.id, open: true })}><XCircle className="h-4 w-4 text-red-600" /></Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={open => setRejectDialog(p => ({ ...p, open }))}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Travel Claim</DialogTitle></DialogHeader>
          <div>
            <Label>Reason *</Label>
            <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Rejection reason" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRejectDialog({ id: '', open: false })}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={rejectClaim.isPending}>Reject</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
