import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GeoFilter } from '@/components/ui/GeoFilter';
import { GeoFilter as GeoFilterType } from '@/data/geoData';
import { useBeatPlans, useCreateBeatPlan, useUpdateBeatPlan, useDeleteBeatPlan, useProfiles, useCreateBeatRoute } from '@/hooks/useSalesTeamData';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import {
  Plus,
  Calendar,
  Target,
  MapPin,
  Users,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  X,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Loader2,
  Download,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

interface BeatPlan {
  id: string;
  user_id: string;
  userName: string;
  createdBy: string;
  month: number;
  year: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  overallStatus: 'pending' | 'in_progress' | 'partially_completed' | 'completed';
  created_at: string;
  approved_by?: string;
  rejection_reason?: string;
  zone: string;
  city: string;
  beat_routes?: any[];
  profiles?: { name: string; region?: string; territory?: string };
  totalVisits: number;
  plannedDateRange: string;
}

interface VisitMapping {
  id: string;
  entityType: 'distributor' | 'retailer';
  entityName: string;
  zone: string;
  visitDate: string;
  visitStartTime: string;
  visitEndTime: string;
  visitType: string[];
  priority: 'high' | 'medium' | 'low';
  frequency: 'one-time' | 'recurring';
  recurrenceType: 'weekly' | 'bi-weekly' | 'monthly' | 'yearly';
  assignZone: string;
  additionalNotes: string;
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const visitTypeOptions = [
  'Follow-up',
  'New Visit',
  'Regular Visit',
  'Collection Visit',
  'Order Collection',
  'Promotional Visit',
  'Complaint Resolution',
];

export default function BeatPlansPage() {
  const { user } = useAuth();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const [selectedMonth, setSelectedMonth] = useState(`${currentMonth}-${currentYear}`);
  const [geoFilter, setGeoFilter] = useState<GeoFilterType>({ country: 'India' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState<BeatPlan | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState<{ plan: BeatPlan; action: 'approve' | 'reject' } | null>(null);
  const [remarks, setRemarks] = useState('');

  const [month, year] = selectedMonth.split('-').map(Number);
  const { data: beatPlansData, isLoading } = useBeatPlans(month, year);
  const { data: profilesData } = useProfiles();
  const createBeatPlan = useCreateBeatPlan();
  const updateBeatPlan = useUpdateBeatPlan();
  const deleteBeatPlan = useDeleteBeatPlan();
  const createBeatRoute = useCreateBeatRoute();

  // New Plan Form State
  const [newPlan, setNewPlan] = useState({
    user_id: '',
    month: currentMonth,
    year: currentYear,
    createdBy: 'Admin',
  });

  // Visit Mappings for new plan
  const [visitMappings, setVisitMappings] = useState<VisitMapping[]>([{
    id: '1',
    entityType: 'retailer',
    entityName: '',
    zone: '',
    visitDate: '',
    visitStartTime: '',
    visitEndTime: '',
    visitType: [],
    priority: 'medium',
    frequency: 'one-time',
    recurrenceType: 'weekly',
    assignZone: '',
    additionalNotes: '',
  }]);

  // Transform data for display
  const beatPlans: BeatPlan[] = (beatPlansData || []).map((plan: any) => {
    const routes = plan.beat_routes || [];
    const dates = routes.map((r: any) => r.route_date).filter(Boolean).sort();
    const plannedDateRange = dates.length > 0 
      ? `${format(new Date(dates[0]), 'dd MMM')} - ${format(new Date(dates[dates.length - 1]), 'dd MMM yyyy')}`
      : 'Not set';

    return {
      ...plan,
      userName: plan.profiles?.name || 'Unknown',
      createdBy: 'Admin', // Default, can be enhanced
      zone: plan.profiles?.region || 'N/A',
      city: plan.profiles?.territory || 'N/A',
      totalVisits: routes.reduce((sum: number, r: any) => sum + (r.planned_visits || 0), 0),
      plannedDateRange,
      overallStatus: plan.status === 'approved' ? 'in_progress' : 'pending',
    };
  });

  const filteredPlans = beatPlans.filter(plan => {
    if (geoFilter.zone && plan.zone !== geoFilter.zone) return false;
    if (geoFilter.city && plan.city !== geoFilter.city) return false;
    return true;
  });

  const stats = {
    total: filteredPlans.length,
    approved: filteredPlans.filter(bp => bp.status === 'approved').length,
    pending: filteredPlans.filter(bp => bp.status === 'pending').length,
    draft: filteredPlans.filter(bp => bp.status === 'draft').length,
  };

  const addVisitMapping = () => {
    setVisitMappings([...visitMappings, {
      id: Date.now().toString(),
      entityType: 'retailer',
      entityName: '',
      zone: '',
      visitDate: '',
      visitStartTime: '',
      visitEndTime: '',
      visitType: [],
      priority: 'medium',
      frequency: 'one-time',
      recurrenceType: 'weekly',
      assignZone: '',
      additionalNotes: '',
    }]);
  };

  const removeVisitMapping = (id: string) => {
    setVisitMappings(visitMappings.filter(v => v.id !== id));
  };

  const updateVisitMapping = (id: string, field: keyof VisitMapping, value: any) => {
    setVisitMappings(visitMappings.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ));
  };

  const toggleVisitType = (id: string, type: string) => {
    const mapping = visitMappings.find(v => v.id === id);
    if (!mapping) return;
    
    const newTypes = mapping.visitType.includes(type)
      ? mapping.visitType.filter(t => t !== type)
      : [...mapping.visitType, type];
    
    updateVisitMapping(id, 'visitType', newTypes);
  };

  const handleCreate = async () => {
    if (!newPlan.user_id) {
      toast.error('Please select an employee');
      return;
    }

    try {
      const plan = await createBeatPlan.mutateAsync({
        user_id: newPlan.user_id,
        month: newPlan.month,
        year: newPlan.year,
        status: 'draft',
        plan_type: 'monthly',
      });

      // Create beat routes for each visit mapping
      for (const mapping of visitMappings) {
        if (mapping.entityName && mapping.visitDate) {
          await createBeatRoute.mutateAsync({
            beat_plan_id: plan.id,
            route_date: mapping.visitDate,
            zone: mapping.zone,
            area: mapping.assignZone,
            planned_visits: 1,
            retailers: [{
              type: mapping.entityType,
              name: mapping.entityName,
              visitType: mapping.visitType,
              priority: mapping.priority,
              startTime: mapping.visitStartTime,
              endTime: mapping.visitEndTime,
              notes: mapping.additionalNotes,
              frequency: mapping.frequency,
              recurrenceType: mapping.recurrenceType,
            }],
          });
        }
      }

      setShowCreateModal(false);
      setNewPlan({ user_id: '', month: currentMonth, year: currentYear, createdBy: 'Admin' });
      setVisitMappings([{
        id: '1',
        entityType: 'retailer',
        entityName: '',
        zone: '',
        visitDate: '',
        visitStartTime: '',
        visitEndTime: '',
        visitType: [],
        priority: 'medium',
        frequency: 'one-time',
        recurrenceType: 'weekly',
        assignZone: '',
        additionalNotes: '',
      }]);
      toast.success('Beat plan created successfully');
    } catch (error) {
      console.error('Error creating beat plan:', error);
    }
  };

  const handleApproval = async () => {
    if (!showApprovalModal) return;
    if (showApprovalModal.action === 'reject' && !remarks) {
      toast.error('Please provide a rejection reason');
      return;
    }
    
    await updateBeatPlan.mutateAsync({
      id: showApprovalModal.plan.id,
      status: showApprovalModal.action === 'approve' ? 'approved' : 'rejected',
      approved_by: user?.id,
      rejection_reason: showApprovalModal.action === 'reject' ? remarks : undefined,
    });
    
    setShowApprovalModal(null);
    setRemarks('');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this beat plan?')) {
      await deleteBeatPlan.mutateAsync(id);
    }
  };

  const exportToCSV = () => {
    const headers = ['Beat Plan ID', 'Employee Name', 'Created By', 'Total Visits', 'Planned Date Range', 'Approval Status', 'Overall Status'];
    const rows = filteredPlans.map(p => [
      p.id.slice(0, 8),
      p.userName,
      p.createdBy,
      p.totalVisits,
      p.plannedDateRange,
      p.status,
      p.overallStatus,
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beat_plans_${month}_${year}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Exported to CSV');
  };

  const columns = [
    {
      key: 'beatPlanId',
      header: 'Beat Plan ID',
      render: (item: BeatPlan) => (
        <button 
          onClick={() => setShowViewModal(item)}
          className="text-primary font-medium hover:underline"
        >
          #{item.id.slice(0, 8).toUpperCase()}
        </button>
      ),
    },
    {
      key: 'userName',
      header: 'Employee Name',
      render: (item: BeatPlan) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">
              {item.userName.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <span className="font-medium">{item.userName}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'createdBy',
      header: 'Created By',
      render: (item: BeatPlan) => (
        <span className="text-muted-foreground">{item.createdBy}</span>
      ),
    },
    {
      key: 'totalVisits',
      header: 'Total Visits',
      render: (item: BeatPlan) => (
        <span className="font-medium">{item.totalVisits}</span>
      ),
      sortable: true,
    },
    {
      key: 'plannedDateRange',
      header: 'Planned Date Range',
      render: (item: BeatPlan) => (
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-muted-foreground" />
          <span>{item.plannedDateRange}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Approval Status',
      render: (item: BeatPlan) => <StatusBadge status={item.status} />,
    },
    {
      key: 'overallStatus',
      header: 'Overall Status',
      render: (item: BeatPlan) => (
        <StatusBadge status={item.overallStatus === 'in_progress' ? 'active' : item.overallStatus === 'completed' ? 'approved' : 'pending'} />
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      render: (item: BeatPlan) => (
        <div className="flex items-center gap-1">
          <button onClick={() => setShowViewModal(item)} className="p-2 hover:bg-muted rounded-lg transition-colors" title="View">
            <Eye size={16} className="text-muted-foreground" />
          </button>
          {item.status === 'pending' && (
            <>
              <button onClick={() => setShowApprovalModal({ plan: item, action: 'approve' })} className="p-2 hover:bg-success/10 rounded-lg transition-colors" title="Approve">
                <ThumbsUp size={16} className="text-success" />
              </button>
              <button onClick={() => setShowApprovalModal({ plan: item, action: 'reject' })} className="p-2 hover:bg-destructive/10 rounded-lg transition-colors" title="Reject">
                <ThumbsDown size={16} className="text-destructive" />
              </button>
            </>
          )}
          {(item.status === 'draft' || item.status === 'rejected') && (
            <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Edit">
              <Edit size={16} className="text-muted-foreground" />
            </button>
          )}
          {item.status === 'draft' && (
            <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-destructive/10 rounded-lg transition-colors" title="Delete">
              <Trash2 size={16} className="text-destructive" />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Beat Planning / Journey Plan</h1>
          <p className="text-muted-foreground">Monthly route planning and approval workflow</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="input-field"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {[...Array(12)].map((_, i) => {
              const m = i + 1;
              return (
                <option key={m} value={`${m}-${currentYear}`}>
                  {monthNames[i]} {currentYear}
                </option>
              );
            })}
          </select>
          <Button variant="outline" onClick={exportToCSV} className="flex items-center gap-2">
            <Download size={16} />
            Export
          </Button>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Create Plan
          </button>
        </div>
      </div>

      {/* Geo Filter */}
      <GeoFilter value={geoFilter} onChange={setGeoFilter} />

      {/* Stats - 4 Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <FileText size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Plans</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <CheckCircle size={24} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <Clock size={24} className="text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending Approval</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-muted">
              <Target size={24} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.draft}</p>
              <p className="text-sm text-muted-foreground">In Draft</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Data Table */}
      <DataTable 
        data={filteredPlans} 
        columns={columns} 
        searchPlaceholder="Search by executive name, plan ID..." 
        emptyMessage="No beat plans found for this period"
      />

      {/* Create Modal with Full Form */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-xl border border-border shadow-xl w-full max-w-4xl p-6 my-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Create Beat Plan</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-muted rounded-lg">
                  <X size={20} />
                </button>
              </div>

              {/* Master Details */}
              <div className="border-b border-border pb-6 mb-6">
                <h3 className="text-lg font-medium text-foreground mb-4">Master Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Beat Plan ID</label>
                    <input
                      type="text"
                      value="Auto-generated"
                      disabled
                      className="input-field bg-muted"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Created By</label>
                    <select
                      value={newPlan.createdBy}
                      onChange={(e) => setNewPlan({ ...newPlan, createdBy: e.target.value })}
                      className="input-field"
                    >
                      <option value="Admin">Admin</option>
                      <option value="FSE">Field Sales Executive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Employee *</label>
                    <select
                      value={newPlan.user_id}
                      onChange={(e) => setNewPlan({ ...newPlan, user_id: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select Employee</option>
                      {(profilesData || []).map((emp: any) => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Plan Created Date</label>
                    <input
                      type="date"
                      value={new Date().toISOString().split('T')[0]}
                      disabled
                      className="input-field bg-muted"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Month *</label>
                    <select
                      value={newPlan.month}
                      onChange={(e) => setNewPlan({ ...newPlan, month: parseInt(e.target.value) })}
                      className="input-field"
                    >
                      {monthNames.map((name, i) => (
                        <option key={i} value={i + 1}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Year *</label>
                    <select
                      value={newPlan.year}
                      onChange={(e) => setNewPlan({ ...newPlan, year: parseInt(e.target.value) })}
                      className="input-field"
                    >
                      <option value={currentYear}>{currentYear}</option>
                      <option value={currentYear + 1}>{currentYear + 1}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Approval Status</label>
                    <input
                      type="text"
                      value="Pending (Admin Only)"
                      disabled
                      className="input-field bg-muted"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Overall Status</label>
                    <input
                      type="text"
                      value="System Managed"
                      disabled
                      className="input-field bg-muted"
                    />
                  </div>
                </div>
              </div>

              {/* Distributor / Retailer Visit Mapping */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-foreground">Distributor / Retailer Visit Mapping</h3>
                  <Button variant="outline" size="sm" onClick={addVisitMapping}>
                    <Plus size={16} className="mr-1" /> Add Visit
                  </Button>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {visitMappings.map((mapping, index) => (
                    <div key={mapping.id} className="border border-border rounded-lg p-4 bg-muted/20">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-muted-foreground">Visit #{index + 1}</span>
                        {visitMappings.length > 1 && (
                          <button 
                            onClick={() => removeVisitMapping(mapping.id)}
                            className="p-1 hover:bg-destructive/10 rounded text-destructive"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Entity Type</label>
                          <select
                            value={mapping.entityType}
                            onChange={(e) => updateVisitMapping(mapping.id, 'entityType', e.target.value)}
                            className="input-field text-sm"
                          >
                            <option value="distributor">Distributor</option>
                            <option value="retailer">Retailer</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Entity Name</label>
                          <input
                            type="text"
                            value={mapping.entityName}
                            onChange={(e) => updateVisitMapping(mapping.id, 'entityName', e.target.value)}
                            placeholder="Select from master"
                            className="input-field text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Zone (Optional)</label>
                          <input
                            type="text"
                            value={mapping.zone}
                            onChange={(e) => updateVisitMapping(mapping.id, 'zone', e.target.value)}
                            placeholder="Enter zone"
                            className="input-field text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Visit Date</label>
                          <input
                            type="date"
                            value={mapping.visitDate}
                            onChange={(e) => updateVisitMapping(mapping.id, 'visitDate', e.target.value)}
                            className="input-field text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Start Time</label>
                          <input
                            type="time"
                            value={mapping.visitStartTime}
                            onChange={(e) => updateVisitMapping(mapping.id, 'visitStartTime', e.target.value)}
                            className="input-field text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">End Time</label>
                          <input
                            type="time"
                            value={mapping.visitEndTime}
                            onChange={(e) => updateVisitMapping(mapping.id, 'visitEndTime', e.target.value)}
                            className="input-field text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Priority</label>
                          <select
                            value={mapping.priority}
                            onChange={(e) => updateVisitMapping(mapping.id, 'priority', e.target.value)}
                            className="input-field text-sm"
                          >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Frequency</label>
                          <select
                            value={mapping.frequency}
                            onChange={(e) => updateVisitMapping(mapping.id, 'frequency', e.target.value)}
                            className="input-field text-sm"
                          >
                            <option value="one-time">One-time</option>
                            <option value="recurring">Recurring</option>
                          </select>
                        </div>
                        {mapping.frequency === 'recurring' && (
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Recurrence</label>
                            <select
                              value={mapping.recurrenceType}
                              onChange={(e) => updateVisitMapping(mapping.id, 'recurrenceType', e.target.value)}
                              className="input-field text-sm"
                            >
                              <option value="weekly">Weekly</option>
                              <option value="bi-weekly">Bi-weekly</option>
                              <option value="monthly">Monthly</option>
                              <option value="yearly">Yearly</option>
                            </select>
                          </div>
                        )}
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Assign Zone</label>
                          <input
                            type="text"
                            value={mapping.assignZone}
                            onChange={(e) => updateVisitMapping(mapping.id, 'assignZone', e.target.value)}
                            placeholder="Optional"
                            className="input-field text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Visit Type</label>
                          <div className="flex flex-wrap gap-2">
                            {visitTypeOptions.map(type => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => toggleVisitType(mapping.id, type)}
                                className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                                  mapping.visitType.includes(type)
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-muted border-border hover:border-primary'
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Additional Notes</label>
                          <textarea
                            value={mapping.additionalNotes}
                            onChange={(e) => updateVisitMapping(mapping.id, 'additionalNotes', e.target.value)}
                            placeholder="Any additional notes..."
                            rows={2}
                            className="input-field text-sm resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
                <button onClick={() => setShowCreateModal(false)} className="btn-outline">Cancel</button>
                <button 
                  onClick={handleCreate}
                  disabled={createBeatPlan.isPending || !newPlan.user_id}
                  className="btn-primary"
                >
                  {createBeatPlan.isPending ? 'Creating...' : 'Create Plan'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {showViewModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-xl border border-border shadow-xl w-full max-w-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Beat Plan Details</h2>
                <button onClick={() => setShowViewModal(null)} className="p-2 hover:bg-muted rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {showViewModal.userName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{showViewModal.userName}</p>
                    <p className="text-sm text-muted-foreground">{showViewModal.zone} • {showViewModal.city}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Beat Plan ID</p>
                    <p className="font-medium">#{showViewModal.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Period</p>
                    <p className="font-medium">{monthNames[showViewModal.month - 1]} {showViewModal.year}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Visits</p>
                    <p className="font-medium">{showViewModal.totalVisits}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Planned Date Range</p>
                    <p className="font-medium">{showViewModal.plannedDateRange}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Approval Status</p>
                    <StatusBadge status={showViewModal.status} />
                  </div>
                  <div>
                    <p className="text-muted-foreground">Overall Status</p>
                    <StatusBadge status={showViewModal.overallStatus === 'in_progress' ? 'active' : 'pending'} />
                  </div>
                </div>

                {showViewModal.rejection_reason && (
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <p className="text-sm text-destructive font-medium">Rejection Reason:</p>
                    <p className="text-sm text-muted-foreground">{showViewModal.rejection_reason}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end mt-6">
                <button onClick={() => setShowViewModal(null)} className="btn-outline">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Approval Modal */}
      <AnimatePresence>
        {showApprovalModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-xl border border-border shadow-xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  {showApprovalModal.action === 'approve' ? 'Approve' : 'Reject'} Beat Plan
                </h2>
                <button onClick={() => setShowApprovalModal(null)} className="p-2 hover:bg-muted rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <p className="text-muted-foreground mb-4">
                Are you sure you want to {showApprovalModal.action} the beat plan for{' '}
                <span className="font-medium text-foreground">{showApprovalModal.plan.userName}</span>?
              </p>

              {showApprovalModal.action === 'reject' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Rejection Reason *</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Please provide a reason for rejection..."
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 mt-6">
                <button onClick={() => setShowApprovalModal(null)} className="btn-outline">Cancel</button>
                <button 
                  onClick={handleApproval}
                  disabled={updateBeatPlan.isPending}
                  className={showApprovalModal.action === 'approve' ? 'btn-primary' : 'btn-destructive'}
                >
                  {updateBeatPlan.isPending ? 'Processing...' : showApprovalModal.action === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
