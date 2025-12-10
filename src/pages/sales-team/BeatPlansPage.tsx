import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GeoFilter } from '@/components/ui/GeoFilter';
import { GeoFilter as GeoFilterType } from '@/data/geoData';
import { useBeatPlans, useCreateBeatPlan, useUpdateBeatPlan, useDeleteBeatPlan, useProfiles } from '@/hooks/useSalesTeamData';
import { useAuth } from '@/contexts/AuthContext';
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
} from 'lucide-react';

interface BeatPlan {
  id: string;
  user_id: string;
  userName: string;
  month: number;
  year: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_by?: string;
  rejection_reason?: string;
  zone: string;
  city: string;
  beat_routes?: any[];
  profiles?: { name: string; region?: string; territory?: string };
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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

  const [newPlan, setNewPlan] = useState({
    user_id: '',
    month: currentMonth,
    year: currentYear,
  });

  // Transform data for display
  const beatPlans: BeatPlan[] = (beatPlansData || []).map((plan: any) => ({
    ...plan,
    userName: plan.profiles?.name || 'Unknown',
    zone: plan.profiles?.region || 'N/A',
    city: plan.profiles?.territory || 'N/A',
  }));

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

  const handleCreate = async () => {
    if (!newPlan.user_id) return;
    await createBeatPlan.mutateAsync({
      user_id: newPlan.user_id,
      month: newPlan.month,
      year: newPlan.year,
      status: 'draft',
    });
    setShowCreateModal(false);
    setNewPlan({ user_id: '', month: currentMonth, year: currentYear });
  };

  const handleApproval = async () => {
    if (!showApprovalModal) return;
    if (showApprovalModal.action === 'reject' && !remarks) {
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
    await deleteBeatPlan.mutateAsync(id);
  };

  const columns = [
    {
      key: 'userName',
      header: 'Sales Executive',
      render: (item: BeatPlan) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">
              {item.userName.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="font-medium text-foreground">{item.userName}</p>
            <p className="text-xs text-muted-foreground">{item.zone} • {item.city}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'period',
      header: 'Period',
      render: (item: BeatPlan) => (
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-muted-foreground" />
          <span>{monthNames[item.month - 1]} {item.year}</span>
        </div>
      ),
    },
    {
      key: 'totalRoutes',
      header: 'Routes',
      render: (item: BeatPlan) => (
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-muted-foreground" />
          <span>{item.beat_routes?.length || 0}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: BeatPlan) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: BeatPlan) => (
        <div className="flex items-center gap-1">
          <button onClick={() => setShowViewModal(item)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Eye size={16} className="text-muted-foreground" />
          </button>
          {(item.status === 'draft' || item.status === 'rejected') && (
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Edit size={16} className="text-muted-foreground" />
            </button>
          )}
          {item.status === 'pending' && (
            <>
              <button onClick={() => setShowApprovalModal({ plan: item, action: 'approve' })} className="p-2 hover:bg-success/10 rounded-lg transition-colors">
                <ThumbsUp size={16} className="text-success" />
              </button>
              <button onClick={() => setShowApprovalModal({ plan: item, action: 'reject' })} className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
                <ThumbsDown size={16} className="text-destructive" />
              </button>
            </>
          )}
          {item.status === 'draft' && (
            <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
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
          <h1 className="module-title">Beat Plans / Journey Plans</h1>
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
          <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Create Plan
          </button>
        </div>
      </div>

      {/* Geo Filter */}
      <GeoFilter value={geoFilter} onChange={setGeoFilter} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Users size={24} className="text-primary" />
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
        searchPlaceholder="Search by executive name..." 
        emptyMessage="No beat plans found for this period"
      />

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-xl border border-border shadow-xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Create Beat Plan</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-muted rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Select Employee *</label>
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

                <div className="grid grid-cols-2 gap-4">
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
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
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
              className="bg-card rounded-xl border border-border shadow-xl w-full max-w-md p-6"
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
                    <p className="text-muted-foreground">Period</p>
                    <p className="font-medium">{monthNames[showViewModal.month - 1]} {showViewModal.year}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <StatusBadge status={showViewModal.status} />
                  </div>
                  <div>
                    <p className="text-muted-foreground">Routes</p>
                    <p className="font-medium">{showViewModal.beat_routes?.length || 0}</p>
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
