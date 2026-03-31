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
import { Plus, Briefcase, Users, UserPlus, Calendar, Eye, Edit, Trash2 } from 'lucide-react';
import { useJobOpenings, useCreateJobOpening, useUpdateJobOpening, useCandidates, useCreateCandidate, useUpdateCandidate, useInterviews, useCreateInterview, useUpdateInterview } from '@/hooks/useRecruitmentData';
import { toast } from 'sonner';

export default function RecruitmentPage() {
  const [activeTab, setActiveTab] = useState('openings');
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>('');

  const { data: jobs = [], isLoading: jobsLoading } = useJobOpenings();
  const { data: candidates = [], isLoading: candidatesLoading } = useCandidates(selectedJobId || undefined);
  const { data: interviews = [], isLoading: interviewsLoading } = useInterviews();
  const createJob = useCreateJobOpening();
  const createCandidate = useCreateCandidate();
  const updateCandidate = useUpdateCandidate();
  const createInterview = useCreateInterview();
  const updateJob = useUpdateJobOpening();

  const [jobForm, setJobForm] = useState({ title: '', department: '', location: '', job_type: 'full_time', description: '', requirements: '', salary_range_min: '', salary_range_max: '', positions: 1, closing_date: '' });
  const [candidateForm, setCandidateForm] = useState({ job_opening_id: '', name: '', email: '', phone: '', source: 'direct', experience_years: '', current_ctc: '', expected_ctc: '', notice_period: '', notes: '' });

  const handleCreateJob = () => {
    if (!jobForm.title) { toast.error('Title is required'); return; }
    createJob.mutate({
      ...jobForm,
      salary_range_min: jobForm.salary_range_min ? Number(jobForm.salary_range_min) : null,
      salary_range_max: jobForm.salary_range_max ? Number(jobForm.salary_range_max) : null,
    } as any, { onSuccess: () => { setShowCreateJob(false); setJobForm({ title: '', department: '', location: '', job_type: 'full_time', description: '', requirements: '', salary_range_min: '', salary_range_max: '', positions: 1, closing_date: '' }); } });
  };

  const handleAddCandidate = () => {
    if (!candidateForm.name || !candidateForm.job_opening_id) { toast.error('Name and job opening are required'); return; }
    createCandidate.mutate({
      ...candidateForm,
      experience_years: candidateForm.experience_years ? Number(candidateForm.experience_years) : null,
      current_ctc: candidateForm.current_ctc ? Number(candidateForm.current_ctc) : null,
      expected_ctc: candidateForm.expected_ctc ? Number(candidateForm.expected_ctc) : null,
      notice_period: candidateForm.notice_period ? Number(candidateForm.notice_period) : null,
    } as any, { onSuccess: () => { setShowAddCandidate(false); setCandidateForm({ job_opening_id: '', name: '', email: '', phone: '', source: 'direct', experience_years: '', current_ctc: '', expected_ctc: '', notice_period: '', notes: '' }); } });
  };

  const openJobs = (jobs as any[]).filter((j: any) => j.status === 'open').length;
  const totalCandidates = (candidates as any[]).length;
  const hiredCandidates = (candidates as any[]).filter((c: any) => c.status === 'hired').length;

  const statusColors: Record<string, string> = {
    applied: 'outline', screening: 'secondary', shortlisted: 'default', interview: 'default', offered: 'default', hired: 'default', rejected: 'destructive',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Recruitment & Onboarding</h1>
          <p className="text-muted-foreground">Manage job openings, candidate pipeline, and onboarding</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><Briefcase className="h-5 w-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">Open Positions</p><p className="text-2xl font-bold">{openJobs}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-500/10"><Users className="h-5 w-5 text-blue-500" /></div><div><p className="text-sm text-muted-foreground">Total Candidates</p><p className="text-2xl font-bold">{totalCandidates}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-500/10"><UserPlus className="h-5 w-5 text-green-500" /></div><div><p className="text-sm text-muted-foreground">Hired</p><p className="text-2xl font-bold">{hiredCandidates}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-purple-500/10"><Calendar className="h-5 w-5 text-purple-500" /></div><div><p className="text-sm text-muted-foreground">Interviews Scheduled</p><p className="text-2xl font-bold">{(interviews as any[]).filter((i: any) => i.result === 'pending').length}</p></div></div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="openings">Job Openings</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
        </TabsList>

        <TabsContent value="openings" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={showCreateJob} onOpenChange={setShowCreateJob}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Create Job Opening</Button></DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Create Job Opening</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Job Title *</Label><Input value={jobForm.title} onChange={e => setJobForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Sales Executive" /></div>
                    <div><Label>Department</Label><Input value={jobForm.department} onChange={e => setJobForm(p => ({ ...p, department: e.target.value }))} placeholder="e.g. Sales" /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div><Label>Location</Label><Input value={jobForm.location} onChange={e => setJobForm(p => ({ ...p, location: e.target.value }))} /></div>
                    <div><Label>Job Type</Label>
                      <Select value={jobForm.job_type} onValueChange={v => setJobForm(p => ({ ...p, job_type: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full_time">Full Time</SelectItem>
                          <SelectItem value="part_time">Part Time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>Positions</Label><Input type="number" value={jobForm.positions} onChange={e => setJobForm(p => ({ ...p, positions: Number(e.target.value) }))} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Salary Range Min</Label><Input type="number" value={jobForm.salary_range_min} onChange={e => setJobForm(p => ({ ...p, salary_range_min: e.target.value }))} /></div>
                    <div><Label>Salary Range Max</Label><Input type="number" value={jobForm.salary_range_max} onChange={e => setJobForm(p => ({ ...p, salary_range_max: e.target.value }))} /></div>
                  </div>
                  <div><Label>Closing Date</Label><Input type="date" value={jobForm.closing_date} onChange={e => setJobForm(p => ({ ...p, closing_date: e.target.value }))} /></div>
                  <div><Label>Description</Label><Textarea value={jobForm.description} onChange={e => setJobForm(p => ({ ...p, description: e.target.value }))} rows={3} /></div>
                  <div><Label>Requirements</Label><Textarea value={jobForm.requirements} onChange={e => setJobForm(p => ({ ...p, requirements: e.target.value }))} rows={3} /></div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCreateJob(false)}>Cancel</Button>
                    <Button onClick={handleCreateJob} disabled={createJob.isPending}>{createJob.isPending ? 'Creating...' : 'Create'}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Title</TableHead><TableHead>Department</TableHead><TableHead>Location</TableHead><TableHead>Type</TableHead><TableHead>Positions</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {jobsLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : (jobs as any[]).length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No job openings</TableCell></TableRow>
                ) : (jobs as any[]).map((job: any) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.department || '-'}</TableCell>
                    <TableCell>{job.location || '-'}</TableCell>
                    <TableCell><Badge variant="outline">{job.job_type?.replace('_', ' ')}</Badge></TableCell>
                    <TableCell>{job.filled_positions || 0}/{job.positions}</TableCell>
                    <TableCell><Badge variant={job.status === 'open' ? 'default' : 'secondary'}>{job.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedJobId(job.id); setCandidateForm(p => ({ ...p, job_opening_id: job.id })); setActiveTab('candidates'); }}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => updateJob.mutate({ id: job.id, status: job.status === 'open' ? 'closed' : 'open' })}><Edit className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-4">
          <div className="flex items-center justify-between">
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger className="w-64"><SelectValue placeholder="Filter by job" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {(jobs as any[]).map((j: any) => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <Dialog open={showAddCandidate} onOpenChange={setShowAddCandidate}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Candidate</Button></DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Add Candidate</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><Label>Job Opening *</Label>
                    <Select value={candidateForm.job_opening_id} onValueChange={v => setCandidateForm(p => ({ ...p, job_opening_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select job" /></SelectTrigger>
                      <SelectContent>{(jobs as any[]).map((j: any) => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Name *</Label><Input value={candidateForm.name} onChange={e => setCandidateForm(p => ({ ...p, name: e.target.value }))} /></div>
                    <div><Label>Email</Label><Input type="email" value={candidateForm.email} onChange={e => setCandidateForm(p => ({ ...p, email: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Phone</Label><Input value={candidateForm.phone} onChange={e => setCandidateForm(p => ({ ...p, phone: e.target.value }))} /></div>
                    <div><Label>Source</Label>
                      <Select value={candidateForm.source} onValueChange={v => setCandidateForm(p => ({ ...p, source: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="direct">Direct</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                          <SelectItem value="portal">Job Portal</SelectItem>
                          <SelectItem value="agency">Agency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div><Label>Experience (Yrs)</Label><Input type="number" value={candidateForm.experience_years} onChange={e => setCandidateForm(p => ({ ...p, experience_years: e.target.value }))} /></div>
                    <div><Label>Current CTC</Label><Input type="number" value={candidateForm.current_ctc} onChange={e => setCandidateForm(p => ({ ...p, current_ctc: e.target.value }))} /></div>
                    <div><Label>Expected CTC</Label><Input type="number" value={candidateForm.expected_ctc} onChange={e => setCandidateForm(p => ({ ...p, expected_ctc: e.target.value }))} /></div>
                  </div>
                  <div><Label>Notice Period (Days)</Label><Input type="number" value={candidateForm.notice_period} onChange={e => setCandidateForm(p => ({ ...p, notice_period: e.target.value }))} /></div>
                  <div><Label>Notes</Label><Textarea value={candidateForm.notes} onChange={e => setCandidateForm(p => ({ ...p, notes: e.target.value }))} rows={2} /></div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddCandidate(false)}>Cancel</Button>
                    <Button onClick={handleAddCandidate} disabled={createCandidate.isPending}>{createCandidate.isPending ? 'Adding...' : 'Add'}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Name</TableHead><TableHead>Job</TableHead><TableHead>Source</TableHead><TableHead>Experience</TableHead><TableHead>Expected CTC</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {candidatesLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : (candidates as any[]).length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No candidates found</TableCell></TableRow>
                ) : (candidates as any[]).map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.job?.title || '-'}</TableCell>
                    <TableCell>{c.source}</TableCell>
                    <TableCell>{c.experience_years ? `${c.experience_years} yrs` : '-'}</TableCell>
                    <TableCell>{c.expected_ctc ? `₹${(c.expected_ctc / 100000).toFixed(1)}L` : '-'}</TableCell>
                    <TableCell><Badge variant={(statusColors[c.status] as any) || 'outline'}>{c.status}</Badge></TableCell>
                    <TableCell>
                      <Select value={c.status} onValueChange={v => updateCandidate.mutate({ id: c.id, status: v })}>
                        <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['applied', 'screening', 'shortlisted', 'interview', 'offered', 'hired', 'rejected'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="interviews">
          <Card>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Candidate</TableHead><TableHead>Round</TableHead><TableHead>Mode</TableHead><TableHead>Scheduled</TableHead><TableHead>Rating</TableHead><TableHead>Result</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {interviewsLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : (interviews as any[]).length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No interviews scheduled</TableCell></TableRow>
                ) : (interviews as any[]).map((i: any) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.candidate?.name || '-'}</TableCell>
                    <TableCell>{i.round_name || `Round ${i.round}`}</TableCell>
                    <TableCell>{i.mode?.replace('_', ' ')}</TableCell>
                    <TableCell>{i.scheduled_at ? new Date(i.scheduled_at).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{i.rating || '-'}</TableCell>
                    <TableCell><Badge variant={i.result === 'passed' ? 'default' : i.result === 'failed' ? 'destructive' : 'outline'}>{i.result}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="onboarding">
          <Card><CardContent className="py-12 text-center text-muted-foreground">
            <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Onboarding checklists will appear here when a candidate is marked as hired.</p>
            <p className="text-sm">Track document collection, system access, training, and asset assignment.</p>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
