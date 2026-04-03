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
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Plus, Star, TrendingUp, Users, BarChart3, Eye, Edit, CheckCircle, XCircle, Target, ShoppingCart, UserCheck, Store } from 'lucide-react';
import {
  useAppraisalCycles, useCreateAppraisalCycle, useUpdateAppraisalCycle,
  usePerformanceReviews, useCreatePerformanceReview, useUpdatePerformanceReview,
  useEmployeeKPIs, useEmployeesList
} from '@/hooks/usePerformanceData';
import { toast } from 'sonner';

const DEFAULT_KPI_CONFIG = [
  { category: 'targets', label: 'Target Achievement', weight: 30 },
  { category: 'orders', label: 'Order Performance', weight: 25 },
  { category: 'leads', label: 'Lead Conversion', weight: 20 },
  { category: 'outlets', label: 'Outlet Coverage', weight: 15 },
  { category: 'manual', label: 'Manager Assessment', weight: 10 },
];

export default function PerformanceManagementPage() {
  const [activeTab, setActiveTab] = useState('cycles');
  const [showCreateCycle, setShowCreateCycle] = useState(false);
  const [showCreateReview, setShowCreateReview] = useState(false);
  const [showReviewDetail, setShowReviewDetail] = useState<any>(null);
  const [showApproval, setShowApproval] = useState<any>(null);
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');
  const [selectedEmployeeForKPI, setSelectedEmployeeForKPI] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: cycles = [], isLoading: cyclesLoading } = useAppraisalCycles();
  const { data: reviews = [], isLoading: reviewsLoading } = usePerformanceReviews(selectedCycleId || undefined);
  const { data: employees = [] } = useEmployeesList();
  const { data: kpiData } = useEmployeeKPIs(selectedEmployeeForKPI || undefined);
  const createCycle = useCreateAppraisalCycle();
  const updateCycle = useUpdateAppraisalCycle();
  const createReview = useCreatePerformanceReview();
  const updateReview = useUpdatePerformanceReview();

  const [cycleForm, setCycleForm] = useState({
    name: '', cycle_type: 'quarterly', start_date: '', end_date: '',
    kpi_config: DEFAULT_KPI_CONFIG, approval_required: true,
  });

  const [reviewForm, setReviewForm] = useState({
    employee_id: '', cycle_id: '', review_period: '',
    self_rating: '', manager_rating: '', kpi_score: '',
    strengths: '', improvements: '', manager_feedback: '', employee_feedback: '', goals_next_period: '',
    increment_percent: '', increment_amount: '',
  });

  const [rejectionReason, setRejectionReason] = useState('');

  const handleCreateCycle = () => {
    if (!cycleForm.name || !cycleForm.start_date || !cycleForm.end_date) {
      toast.error('All fields are required'); return;
    }
    const totalWeight = cycleForm.kpi_config.reduce((s, k) => s + k.weight, 0);
    if (totalWeight !== 100) { toast.error('KPI weights must total 100%'); return; }
    createCycle.mutate({ ...cycleForm, kpi_config: cycleForm.kpi_config }, {
      onSuccess: () => { setShowCreateCycle(false); setCycleForm({ name: '', cycle_type: 'quarterly', start_date: '', end_date: '', kpi_config: DEFAULT_KPI_CONFIG, approval_required: true }); }
    });
  };

  const handleCreateReview = () => {
    if (!reviewForm.employee_id || !reviewForm.cycle_id) {
      toast.error('Employee and Cycle are required'); return;
    }
    const selfR = parseFloat(reviewForm.self_rating) || 0;
    const mgrR = parseFloat(reviewForm.manager_rating) || 0;
    const kpiS = parseFloat(reviewForm.kpi_score) || 0;
    // Weighted: self 20%, manager 30%, KPI 50%
    const weighted = (selfR * 0.2) + (mgrR * 0.3) + ((kpiS / 20) * 0.5);
    const finalRating = Math.round(weighted * 10) / 10;

    createReview.mutate({
      ...reviewForm,
      self_rating: selfR, manager_rating: mgrR, kpi_score: kpiS,
      final_rating: finalRating, weighted_score: weighted,
      increment_percent: parseFloat(reviewForm.increment_percent) || 0,
      increment_amount: parseFloat(reviewForm.increment_amount) || 0,
      kpi_weights: { self: 20, manager: 30, kpi: 50 },
      status: 'pending', approval_status: 'pending',
    }, {
      onSuccess: () => { setShowCreateReview(false); resetReviewForm(); }
    });
  };

  const handleApprove = (review: any) => {
    updateReview.mutate({
      id: review.id, approval_status: 'approved', status: 'completed',
      approved_at: new Date().toISOString(),
    });
    setShowApproval(null);
  };

  const handleReject = (review: any) => {
    if (!rejectionReason) { toast.error('Rejection reason required'); return; }
    updateReview.mutate({
      id: review.id, approval_status: 'rejected', status: 'rejected',
      rejection_reason: rejectionReason,
    });
    setShowApproval(null); setRejectionReason('');
  };

  const handleLinkToPayroll = (review: any) => {
    updateReview.mutate({ id: review.id, payroll_linked: true });
    toast.success('Linked to payroll for incentive/increment processing');
  };

  const resetReviewForm = () => setReviewForm({ employee_id: '', cycle_id: '', review_period: '', self_rating: '', manager_rating: '', kpi_score: '', strengths: '', improvements: '', manager_feedback: '', employee_feedback: '', goals_next_period: '', increment_percent: '', increment_amount: '' });

  const filteredReviews = useMemo(() => {
    let r = reviews as any[];
    if (statusFilter !== 'all') r = r.filter((rv: any) => rv.approval_status === statusFilter);
    return r;
  }, [reviews, statusFilter]);

  const activeCycles = (cycles as any[]).filter((c: any) => c.status === 'active').length;
  const pendingReviews = (reviews as any[]).filter((r: any) => r.approval_status === 'pending').length;
  const completedReviews = (reviews as any[]).filter((r: any) => r.approval_status === 'approved').length;
  const avgRating = (reviews as any[]).length > 0
    ? ((reviews as any[]).reduce((s: number, r: any) => s + (r.final_rating || 0), 0) / (reviews as any[]).length).toFixed(1)
    : '0';

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getApprovalBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-500/10 text-green-600 border-green-200">Approved</Badge>;
      case 'rejected': return <Badge className="bg-red-500/10 text-red-600 border-red-200">Rejected</Badge>;
      default: return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Performance Management</h1>
          <p className="text-muted-foreground">KPI tracking, appraisal cycles, reviews, approvals & payroll integration</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><BarChart3 className="h-5 w-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">Total Cycles</p><p className="text-2xl font-bold">{(cycles as any[]).length}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-500/10"><TrendingUp className="h-5 w-5 text-green-500" /></div><div><p className="text-sm text-muted-foreground">Active Cycles</p><p className="text-2xl font-bold">{activeCycles}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-yellow-500/10"><Star className="h-5 w-5 text-yellow-500" /></div><div><p className="text-sm text-muted-foreground">Pending Reviews</p><p className="text-2xl font-bold">{pendingReviews}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-500/10"><Users className="h-5 w-5 text-blue-500" /></div><div><p className="text-sm text-muted-foreground">Completed</p><p className="text-2xl font-bold">{completedReviews}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-purple-500/10"><Star className="h-5 w-5 text-purple-500" /></div><div><p className="text-sm text-muted-foreground">Avg Rating</p><p className="text-2xl font-bold">{avgRating}/5</p></div></div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="cycles">Appraisal Cycles</TabsTrigger>
          <TabsTrigger value="reviews">Performance Reviews</TabsTrigger>
          <TabsTrigger value="kpis">KPI Dashboard</TabsTrigger>
          <TabsTrigger value="payroll">Payroll Integration</TabsTrigger>
        </TabsList>

        {/* ========== CYCLES TAB ========== */}
        <TabsContent value="cycles" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={showCreateCycle} onOpenChange={setShowCreateCycle}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Create Cycle</Button></DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Create Appraisal Cycle</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Cycle Name *</Label><Input value={cycleForm.name} onChange={e => setCycleForm(p => ({ ...p, name: e.target.value }))} placeholder="Q1 2026 Appraisal" /></div>
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
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Start Date *</Label><Input type="date" value={cycleForm.start_date} onChange={e => setCycleForm(p => ({ ...p, start_date: e.target.value }))} /></div>
                    <div><Label>End Date *</Label><Input type="date" value={cycleForm.end_date} onChange={e => setCycleForm(p => ({ ...p, end_date: e.target.value }))} /></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={cycleForm.approval_required} onCheckedChange={v => setCycleForm(p => ({ ...p, approval_required: v }))} />
                    <Label>Approval Required</Label>
                  </div>

                  <div>
                    <Label className="text-base font-semibold">KPI Weights Configuration (must total 100%)</Label>
                    <p className="text-sm text-muted-foreground mb-2">Define how each KPI category contributes to the final score.</p>
                    <div className="space-y-2">
                      {cycleForm.kpi_config.map((kpi, idx) => (
                        <div key={kpi.category} className="flex items-center gap-3">
                          <span className="w-48 text-sm font-medium">{kpi.label}</span>
                          <Input
                            type="number" min={0} max={100} className="w-24"
                            value={kpi.weight}
                            onChange={e => {
                              const updated = [...cycleForm.kpi_config];
                              updated[idx] = { ...updated[idx], weight: parseInt(e.target.value) || 0 };
                              setCycleForm(p => ({ ...p, kpi_config: updated }));
                            }}
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                          <Progress value={kpi.weight} className="flex-1 h-2" />
                        </div>
                      ))}
                      <div className="text-right text-sm font-semibold">
                        Total: {cycleForm.kpi_config.reduce((s, k) => s + k.weight, 0)}%
                        {cycleForm.kpi_config.reduce((s, k) => s + k.weight, 0) !== 100 && <span className="text-destructive ml-2">Must be 100%</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCreateCycle(false)}>Cancel</Button>
                    <Button onClick={handleCreateCycle} disabled={createCycle.isPending}>{createCycle.isPending ? 'Creating...' : 'Create Cycle'}</Button>
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
                  <TableHead>Period</TableHead>
                  <TableHead>Approval</TableHead>
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
                    <TableCell>{cycle.start_date} → {cycle.end_date}</TableCell>
                    <TableCell>{cycle.approval_required ? <Badge variant="secondary">Required</Badge> : <Badge variant="outline">No</Badge>}</TableCell>
                    <TableCell>
                      <Badge variant={cycle.status === 'active' ? 'default' : cycle.status === 'completed' ? 'secondary' : 'outline'}>{cycle.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedCycleId(cycle.id); setActiveTab('reviews'); }}><Eye className="h-4 w-4" /></Button>
                        {cycle.status === 'draft' && (
                          <Button variant="ghost" size="icon" onClick={() => updateCycle.mutate({ id: cycle.id, status: 'active' })}><CheckCircle className="h-4 w-4 text-green-500" /></Button>
                        )}
                        {cycle.status === 'active' && (
                          <Button variant="ghost" size="icon" onClick={() => updateCycle.mutate({ id: cycle.id, status: 'completed' })}><XCircle className="h-4 w-4 text-muted-foreground" /></Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ========== REVIEWS TAB ========== */}
        <TabsContent value="reviews" className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex gap-3">
              <Select value={selectedCycleId} onValueChange={setSelectedCycleId}>
                <SelectTrigger className="w-56"><SelectValue placeholder="Filter by cycle" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cycles</SelectItem>
                  {(cycles as any[]).map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={showCreateReview} onOpenChange={setShowCreateReview}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Create Review</Button></DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Create Performance Review</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Employee *</Label>
                      <Select value={reviewForm.employee_id} onValueChange={v => setReviewForm(p => ({ ...p, employee_id: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                        <SelectContent>{employees.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name} ({e.employee_code || e.email})</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Appraisal Cycle *</Label>
                      <Select value={reviewForm.cycle_id} onValueChange={v => setReviewForm(p => ({ ...p, cycle_id: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select cycle" /></SelectTrigger>
                        <SelectContent>{(cycles as any[]).map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div><Label>Review Period</Label><Input value={reviewForm.review_period} onChange={e => setReviewForm(p => ({ ...p, review_period: e.target.value }))} placeholder="e.g. Jan-Mar 2026" /></div>

                  <div className="border rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold">Ratings (1-5 scale)</h3>
                    <p className="text-xs text-muted-foreground">Weighted: Self Rating 20% + Manager Rating 30% + KPI Score 50%</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div><Label>Self Rating</Label><Input type="number" min={1} max={5} step={0.1} value={reviewForm.self_rating} onChange={e => setReviewForm(p => ({ ...p, self_rating: e.target.value }))} /></div>
                      <div><Label>Manager Rating</Label><Input type="number" min={1} max={5} step={0.1} value={reviewForm.manager_rating} onChange={e => setReviewForm(p => ({ ...p, manager_rating: e.target.value }))} /></div>
                      <div><Label>KPI Score (0-100)</Label><Input type="number" min={0} max={100} value={reviewForm.kpi_score} onChange={e => setReviewForm(p => ({ ...p, kpi_score: e.target.value }))} /></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Strengths</Label><Textarea value={reviewForm.strengths} onChange={e => setReviewForm(p => ({ ...p, strengths: e.target.value }))} rows={3} /></div>
                    <div><Label>Areas of Improvement</Label><Textarea value={reviewForm.improvements} onChange={e => setReviewForm(p => ({ ...p, improvements: e.target.value }))} rows={3} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Manager Feedback</Label><Textarea value={reviewForm.manager_feedback} onChange={e => setReviewForm(p => ({ ...p, manager_feedback: e.target.value }))} rows={3} /></div>
                    <div><Label>Employee Feedback</Label><Textarea value={reviewForm.employee_feedback} onChange={e => setReviewForm(p => ({ ...p, employee_feedback: e.target.value }))} rows={3} /></div>
                  </div>
                  <div><Label>Goals for Next Period</Label><Textarea value={reviewForm.goals_next_period} onChange={e => setReviewForm(p => ({ ...p, goals_next_period: e.target.value }))} rows={2} /></div>

                  <div className="border rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold">Payroll Integration</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Increment %</Label><Input type="number" min={0} step={0.5} value={reviewForm.increment_percent} onChange={e => setReviewForm(p => ({ ...p, increment_percent: e.target.value }))} /></div>
                      <div><Label>Increment Amount (₹)</Label><Input type="number" min={0} value={reviewForm.increment_amount} onChange={e => setReviewForm(p => ({ ...p, increment_amount: e.target.value }))} /></div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => { setShowCreateReview(false); resetReviewForm(); }}>Cancel</Button>
                    <Button onClick={handleCreateReview} disabled={createReview.isPending}>{createReview.isPending ? 'Creating...' : 'Submit Review'}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Self</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>KPI</TableHead>
                  <TableHead>Weighted</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead>Payroll</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviewsLoading ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : filteredReviews.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No reviews found</TableCell></TableRow>
                ) : filteredReviews.map((review: any) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{review.employee?.name || '-'}</p>
                        <p className="text-xs text-muted-foreground">{review.employee?.employee_code || ''}</p>
                      </div>
                    </TableCell>
                    <TableCell>{review.review_period || '-'}</TableCell>
                    <TableCell className={getRatingColor(review.self_rating)}>{review.self_rating?.toFixed(1) || '-'}</TableCell>
                    <TableCell className={getRatingColor(review.manager_rating)}>{review.manager_rating?.toFixed(1) || '-'}</TableCell>
                    <TableCell>{review.kpi_score || '-'}</TableCell>
                    <TableCell className={`font-bold ${getRatingColor(review.final_rating)}`}>{review.final_rating?.toFixed(1) || '-'}</TableCell>
                    <TableCell>{getApprovalBadge(review.approval_status || 'pending')}</TableCell>
                    <TableCell>
                      {review.payroll_linked ? (
                        <Badge className="bg-green-500/10 text-green-600">Linked</Badge>
                      ) : (
                        <Badge variant="outline">Not linked</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setShowReviewDetail(review)}><Eye className="h-4 w-4" /></Button>
                        {review.approval_status === 'pending' && (
                          <Button variant="ghost" size="icon" onClick={() => setShowApproval(review)}><CheckCircle className="h-4 w-4 text-green-500" /></Button>
                        )}
                        {review.approval_status === 'approved' && !review.payroll_linked && (
                          <Button variant="ghost" size="icon" onClick={() => handleLinkToPayroll(review)} title="Link to Payroll"><TrendingUp className="h-4 w-4 text-blue-500" /></Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ========== KPI DASHBOARD ========== */}
        <TabsContent value="kpis" className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={selectedEmployeeForKPI} onValueChange={setSelectedEmployeeForKPI}>
              <SelectTrigger className="w-72"><SelectValue placeholder="Select employee to view KPIs" /></SelectTrigger>
              <SelectContent>{employees.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name} ({e.employee_code || e.designation || ''})</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {!selectedEmployeeForKPI ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Select an employee to view their KPI dashboard</p>
            </CardContent></Card>
          ) : kpiData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Target className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Target Achievement</p>
                        <p className="text-3xl font-bold">{kpiData.targets.score}%</p>
                        <p className="text-xs text-muted-foreground">{kpiData.targets.data.length} targets assigned</p>
                      </div>
                    </div>
                    <Progress value={kpiData.targets.score} className="mt-3 h-2" />
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Order Performance</p>
                        <p className="text-3xl font-bold">{kpiData.orders.score}</p>
                        <p className="text-xs text-muted-foreground">{kpiData.orders.count} orders · ₹{(kpiData.orders.value / 1000).toFixed(1)}K</p>
                      </div>
                    </div>
                    <Progress value={kpiData.orders.score} className="mt-3 h-2" />
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <UserCheck className="h-8 w-8 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Lead Conversion</p>
                        <p className="text-3xl font-bold">{kpiData.leads.score}%</p>
                        <p className="text-xs text-muted-foreground">{kpiData.leads.converted}/{kpiData.leads.total} converted</p>
                      </div>
                    </div>
                    <Progress value={kpiData.leads.score} className="mt-3 h-2" />
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-orange-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Store className="h-8 w-8 text-orange-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Outlet Coverage</p>
                        <p className="text-3xl font-bold">{kpiData.outlets.score}</p>
                        <p className="text-xs text-muted-foreground">{kpiData.outlets.distributors} dist · {kpiData.outlets.retailers} ret</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Target Breakdown */}
              {kpiData.targets.data.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Target Breakdown</CardTitle></CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Target Type</TableHead>
                          <TableHead>Period</TableHead>
                          <TableHead>Target</TableHead>
                          <TableHead>Achieved</TableHead>
                          <TableHead>%</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {kpiData.targets.data.map((t: any) => {
                          const pct = t.target_value > 0 ? Math.round((t.achieved_value / t.target_value) * 100) : 0;
                          return (
                            <TableRow key={t.id}>
                              <TableCell className="font-medium capitalize">{t.target_type}</TableCell>
                              <TableCell>{t.period}</TableCell>
                              <TableCell>{t.target_value?.toLocaleString()}</TableCell>
                              <TableCell>{t.achieved_value?.toLocaleString()}</TableCell>
                              <TableCell>
                                <span className={pct >= 100 ? 'text-green-600 font-bold' : pct >= 75 ? 'text-yellow-600' : 'text-red-600'}>{pct}%</span>
                              </TableCell>
                              <TableCell><Badge variant={t.status === 'active' ? 'default' : 'secondary'}>{t.status}</Badge></TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Loading KPI data...</CardContent></Card>
          )}
        </TabsContent>

        {/* ========== PAYROLL INTEGRATION ========== */}
        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Payroll-Linked Reviews</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Final Rating</TableHead>
                    <TableHead>Increment %</TableHead>
                    <TableHead>Increment ₹</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(reviews as any[]).filter((r: any) => r.payroll_linked).length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No payroll-linked reviews yet. Approve reviews and link them to payroll.</TableCell></TableRow>
                  ) : (reviews as any[]).filter((r: any) => r.payroll_linked).map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.employee?.name || '-'}</TableCell>
                      <TableCell className={`font-bold ${getRatingColor(r.final_rating)}`}>{r.final_rating?.toFixed(1)}</TableCell>
                      <TableCell>{r.increment_percent || 0}%</TableCell>
                      <TableCell>₹{(r.increment_amount || 0).toLocaleString()}</TableCell>
                      <TableCell><Badge className="bg-green-500/10 text-green-600">Applied to Payroll</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Detail Dialog */}
      <Dialog open={!!showReviewDetail} onOpenChange={() => setShowReviewDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Review Details</DialogTitle></DialogHeader>
          {showReviewDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">Employee</Label><p className="font-medium">{showReviewDetail.employee?.name}</p></div>
                <div><Label className="text-muted-foreground">Period</Label><p>{showReviewDetail.review_period}</p></div>
              </div>
              <div className="grid grid-cols-4 gap-4 p-4 rounded-lg bg-muted/50">
                <div className="text-center"><p className="text-xs text-muted-foreground">Self</p><p className={`text-xl font-bold ${getRatingColor(showReviewDetail.self_rating)}`}>{showReviewDetail.self_rating?.toFixed(1)}</p></div>
                <div className="text-center"><p className="text-xs text-muted-foreground">Manager</p><p className={`text-xl font-bold ${getRatingColor(showReviewDetail.manager_rating)}`}>{showReviewDetail.manager_rating?.toFixed(1)}</p></div>
                <div className="text-center"><p className="text-xs text-muted-foreground">KPI</p><p className="text-xl font-bold">{showReviewDetail.kpi_score}</p></div>
                <div className="text-center"><p className="text-xs text-muted-foreground">Weighted Final</p><p className={`text-xl font-bold ${getRatingColor(showReviewDetail.final_rating)}`}>{showReviewDetail.final_rating?.toFixed(1)}</p></div>
              </div>
              {showReviewDetail.strengths && <div><Label className="text-muted-foreground">Strengths</Label><p className="text-sm">{showReviewDetail.strengths}</p></div>}
              {showReviewDetail.improvements && <div><Label className="text-muted-foreground">Improvements</Label><p className="text-sm">{showReviewDetail.improvements}</p></div>}
              {showReviewDetail.manager_feedback && <div><Label className="text-muted-foreground">Manager Feedback</Label><p className="text-sm">{showReviewDetail.manager_feedback}</p></div>}
              {showReviewDetail.employee_feedback && <div><Label className="text-muted-foreground">Employee Feedback</Label><p className="text-sm">{showReviewDetail.employee_feedback}</p></div>}
              {showReviewDetail.goals_next_period && <div><Label className="text-muted-foreground">Goals Next Period</Label><p className="text-sm">{showReviewDetail.goals_next_period}</p></div>}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                <div><Label className="text-muted-foreground">Increment %</Label><p>{showReviewDetail.increment_percent || 0}%</p></div>
                <div><Label className="text-muted-foreground">Increment Amount</Label><p>₹{(showReviewDetail.increment_amount || 0).toLocaleString()}</p></div>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-muted-foreground">Approval:</Label>
                {getApprovalBadge(showReviewDetail.approval_status)}
                {showReviewDetail.rejection_reason && <span className="text-sm text-destructive">— {showReviewDetail.rejection_reason}</span>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={!!showApproval} onOpenChange={() => { setShowApproval(null); setRejectionReason(''); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Review Approval</DialogTitle></DialogHeader>
          {showApproval && (
            <div className="space-y-4">
              <p>Employee: <strong>{showApproval.employee?.name}</strong></p>
              <p>Final Rating: <strong className={getRatingColor(showApproval.final_rating)}>{showApproval.final_rating?.toFixed(1)}/5</strong></p>
              <p>Increment: <strong>{showApproval.increment_percent || 0}% (₹{(showApproval.increment_amount || 0).toLocaleString()})</strong></p>
              <div><Label>Rejection Reason (if rejecting)</Label><Textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder="Reason..." /></div>
              <div className="flex justify-end gap-2">
                <Button variant="destructive" onClick={() => handleReject(showApproval)}>Reject</Button>
                <Button onClick={() => handleApprove(showApproval)}>Approve</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
