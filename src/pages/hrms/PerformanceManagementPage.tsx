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
import { Textarea } from '@/components/ui/textarea';
import { Plus, Star, TrendingUp, Users, BarChart3, Eye, Edit } from 'lucide-react';
import { useAppraisalCycles, useCreateAppraisalCycle, usePerformanceReviews, useCreatePerformanceReview, useUpdatePerformanceReview } from '@/hooks/usePerformanceData';
import { toast } from 'sonner';

export default function PerformanceManagementPage() {
  const [activeTab, setActiveTab] = useState('cycles');
  const [showCreateCycle, setShowCreateCycle] = useState(false);
  const [showCreateReview, setShowCreateReview] = useState(false);
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');

  const { data: cycles = [], isLoading: cyclesLoading } = useAppraisalCycles();
  const { data: reviews = [], isLoading: reviewsLoading } = usePerformanceReviews(selectedCycleId || undefined);
  const createCycle = useCreateAppraisalCycle();
  const createReview = useCreatePerformanceReview();
  const updateReview = useUpdatePerformanceReview();

  const [cycleForm, setCycleForm] = useState({ name: '', cycle_type: 'quarterly', start_date: '', end_date: '' });
  const [reviewForm, setReviewForm] = useState({ employee_id: '', cycle_id: '', review_period: '', manager_rating: '', self_rating: '', strengths: '', improvements: '', manager_feedback: '', goals_next_period: '' });

  const handleCreateCycle = () => {
    if (!cycleForm.name || !cycleForm.start_date || !cycleForm.end_date) {
      toast.error('All fields are required');
      return;
    }
    createCycle.mutate(cycleForm, {
      onSuccess: () => { setShowCreateCycle(false); setCycleForm({ name: '', cycle_type: 'quarterly', start_date: '', end_date: '' }); }
    });
  };

  const activeCycles = (cycles as any[]).filter((c: any) => c.status === 'active').length;
  const pendingReviews = (reviews as any[]).filter((r: any) => r.status === 'pending').length;
  const completedReviews = (reviews as any[]).filter((r: any) => r.status === 'completed').length;

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Performance Management</h1>
          <p className="text-muted-foreground">KPI tracking, reviews, ratings, and appraisal cycles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><BarChart3 className="h-5 w-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">Total Cycles</p><p className="text-2xl font-bold">{(cycles as any[]).length}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-500/10"><TrendingUp className="h-5 w-5 text-green-500" /></div><div><p className="text-sm text-muted-foreground">Active Cycles</p><p className="text-2xl font-bold">{activeCycles}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-yellow-500/10"><Star className="h-5 w-5 text-yellow-500" /></div><div><p className="text-sm text-muted-foreground">Pending Reviews</p><p className="text-2xl font-bold">{pendingReviews}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-500/10"><Users className="h-5 w-5 text-blue-500" /></div><div><p className="text-sm text-muted-foreground">Completed Reviews</p><p className="text-2xl font-bold">{completedReviews}</p></div></div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="cycles">Appraisal Cycles</TabsTrigger>
          <TabsTrigger value="reviews">Performance Reviews</TabsTrigger>
          <TabsTrigger value="kpis">KPI Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="cycles" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={showCreateCycle} onOpenChange={setShowCreateCycle}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Create Cycle</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Appraisal Cycle</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><Label>Cycle Name *</Label><Input value={cycleForm.name} onChange={e => setCycleForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Q1 2026 Appraisal" /></div>
                  <div><Label>Cycle Type *</Label>
                    <Select value={cycleForm.cycle_type} onValueChange={v => setCycleForm(p => ({ ...p, cycle_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="half_yearly">Half Yearly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Start Date *</Label><Input type="date" value={cycleForm.start_date} onChange={e => setCycleForm(p => ({ ...p, start_date: e.target.value }))} /></div>
                    <div><Label>End Date *</Label><Input type="date" value={cycleForm.end_date} onChange={e => setCycleForm(p => ({ ...p, end_date: e.target.value }))} /></div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCreateCycle(false)}>Cancel</Button>
                    <Button onClick={handleCreateCycle} disabled={createCycle.isPending}>{createCycle.isPending ? 'Creating...' : 'Create'}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cycle Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cyclesLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : (cycles as any[]).length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No appraisal cycles found</TableCell></TableRow>
                ) : (cycles as any[]).map((cycle: any) => (
                  <TableRow key={cycle.id}>
                    <TableCell className="font-medium">{cycle.name}</TableCell>
                    <TableCell><Badge variant="outline">{cycle.cycle_type?.replace('_', ' ')}</Badge></TableCell>
                    <TableCell>{cycle.start_date}</TableCell>
                    <TableCell>{cycle.end_date}</TableCell>
                    <TableCell><Badge variant={cycle.status === 'active' ? 'default' : cycle.status === 'completed' ? 'secondary' : 'outline'}>{cycle.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedCycleId(cycle.id); setActiveTab('reviews'); }}><Eye className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <div className="flex items-center justify-between">
            <Select value={selectedCycleId} onValueChange={setSelectedCycleId}>
              <SelectTrigger className="w-64"><SelectValue placeholder="Filter by cycle" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cycles</SelectItem>
                {(cycles as any[]).map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Review Period</TableHead>
                  <TableHead>Self Rating</TableHead>
                  <TableHead>Manager Rating</TableHead>
                  <TableHead>Final Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviewsLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : (reviews as any[]).length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No reviews found</TableCell></TableRow>
                ) : (reviews as any[]).map((review: any) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">{review.employee?.name || '-'}</TableCell>
                    <TableCell>{review.review_period || '-'}</TableCell>
                    <TableCell className={getRatingColor(review.self_rating)}>{review.self_rating || '-'}</TableCell>
                    <TableCell className={getRatingColor(review.manager_rating)}>{review.manager_rating || '-'}</TableCell>
                    <TableCell className={`font-bold ${getRatingColor(review.final_rating)}`}>{review.final_rating || '-'}</TableCell>
                    <TableCell><Badge variant={review.status === 'completed' ? 'default' : 'outline'}>{review.status}</Badge></TableCell>
                    <TableCell><Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="kpis">
          <Card><CardContent className="py-12 text-center text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>KPI Dashboard integrates with Targets module.</p>
            <p className="text-sm">View employee KPI scores linked to assigned targets and order performance.</p>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
