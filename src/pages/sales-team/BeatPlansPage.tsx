import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GeoFilter } from '@/components/ui/GeoFilter';
import { GeoFilter as GeoFilterType, employees } from '@/data/geoData';
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
} from 'lucide-react';
import { toast } from 'sonner';

interface BeatPlan {
  id: string;
  userId: string;
  userName: string;
  month: string;
  year: number;
  totalRoutes: number;
  totalRetailers: number;
  plannedVisits: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedBy?: string;
  zone: string;
  city: string;
  remarks?: string;
}

const mockBeatPlans: BeatPlan[] = [
  { id: 'bp-001', userId: 'se-001', userName: 'Rajesh Kumar', month: 'December', year: 2024, totalRoutes: 6, totalRetailers: 85, plannedVisits: 340, status: 'approved', createdAt: '2024-11-25', approvedBy: 'Priya Sharma (ASM)', zone: 'North Zone', city: 'New Delhi' },
  { id: 'bp-002', userId: 'se-002', userName: 'Amit Sharma', month: 'December', year: 2024, totalRoutes: 5, totalRetailers: 72, plannedVisits: 288, status: 'pending', createdAt: '2024-11-28', zone: 'North Zone', city: 'New Delhi' },
  { id: 'bp-003', userId: 'se-003', userName: 'Priya Singh', month: 'December', year: 2024, totalRoutes: 6, totalRetailers: 90, plannedVisits: 360, status: 'approved', createdAt: '2024-11-24', approvedBy: 'Priya Sharma (ASM)', zone: 'North Zone', city: 'New Delhi' },
  { id: 'bp-004', userId: 'se-004', userName: 'Vikram Patel', month: 'December', year: 2024, totalRoutes: 4, totalRetailers: 60, plannedVisits: 240, status: 'draft', createdAt: '2024-12-01', zone: 'South Zone', city: 'Mumbai' },
  { id: 'bp-005', userId: 'se-005', userName: 'Sunita Gupta', month: 'December', year: 2024, totalRoutes: 5, totalRetailers: 68, plannedVisits: 272, status: 'rejected', createdAt: '2024-11-26', zone: 'East Zone', city: 'Kolkata', remarks: 'Need more coverage in South area' },
];

export default function BeatPlansPage() {
  const [selectedMonth, setSelectedMonth] = useState('December 2024');
  const [geoFilter, setGeoFilter] = useState<GeoFilterType>({ country: 'India' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState<BeatPlan | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState<{ plan: BeatPlan; action: 'approve' | 'reject' } | null>(null);
  const [remarks, setRemarks] = useState('');
  const [formData, setFormData] = useState({
    userId: '',
    month: 'December',
    year: '2024',
    totalRoutes: '',
    totalRetailers: '',
    plannedVisits: '',
  });

  const filteredPlans = mockBeatPlans.filter(plan => {
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

  const handleCreate = () => {
    if (!formData.userId || !formData.month || !formData.totalRoutes) {
      toast.error('Please fill all required fields');
      return;
    }
    toast.success('Beat plan created successfully');
    setShowCreateModal(false);
    setFormData({ userId: '', month: 'December', year: '2024', totalRoutes: '', totalRetailers: '', plannedVisits: '' });
  };

  const handleApproval = () => {
    if (showApprovalModal?.action === 'reject' && !remarks) {
      toast.error('Please provide rejection reason');
      return;
    }
    toast.success(`Beat plan ${showApprovalModal?.action === 'approve' ? 'approved' : 'rejected'} successfully`);
    setShowApprovalModal(null);
    setRemarks('');
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
          <span>{item.month} {item.year}</span>
        </div>
      ),
    },
    {
      key: 'totalRoutes',
      header: 'Routes',
      render: (item: BeatPlan) => (
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-muted-foreground" />
          <span>{item.totalRoutes}</span>
        </div>
      ),
      sortable: true,
    },
    { key: 'totalRetailers', header: 'Retailers', sortable: true },
    {
      key: 'plannedVisits',
      header: 'Planned Visits',
      render: (item: BeatPlan) => (
        <div className="flex items-center gap-2">
          <Target size={14} className="text-muted-foreground" />
          <span>{item.plannedVisits}</span>
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
      key: 'approvedBy',
      header: 'Approved By',
      render: (item: BeatPlan) => (
        <span className="text-sm text-muted-foreground">
          {item.approvedBy || '--'}
        </span>
      ),
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
            <button className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
              <Trash2 size={16} className="text-destructive" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Beat Plans / Journey Plans</h1>
          <p className="text-muted-foreground">Monthly route planning and approval workflow</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="input-field">
            <option>December 2024</option>
            <option>January 2025</option>
            <option>February 2025</option>
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
      <DataTable data={filteredPlans} columns={columns} searchPlaceholder="Search by executive name..." />

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Create Beat Plan</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-muted rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Select Employee *</label>
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} - {emp.zone}, {emp.city}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Month *</label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="input-field"
                  >
                    <option>January</option>
                    <option>February</option>
                    <option>March</option>
                    <option>April</option>
                    <option>May</option>
                    <option>June</option>
                    <option>July</option>
                    <option>August</option>
                    <option>September</option>
                    <option>October</option>
                    <option>November</option>
                    <option>December</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Year *</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="input-field"
                  >
                    <option>2024</option>
                    <option>2025</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Routes *</label>
                  <input
                    type="number"
                    value={formData.totalRoutes}
                    onChange={(e) => setFormData({ ...formData, totalRoutes: e.target.value })}
                    placeholder="6"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Retailers</label>
                  <input
                    type="number"
                    value={formData.totalRetailers}
                    onChange={(e) => setFormData({ ...formData, totalRetailers: e.target.value })}
                    placeholder="80"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Visits</label>
                  <input
                    type="number"
                    value={formData.plannedVisits}
                    onChange={(e) => setFormData({ ...formData, plannedVisits: e.target.value })}
                    placeholder="320"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="btn-outline">Cancel</button>
              <button onClick={handleCreate} className="btn-primary">Create Plan</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Beat Plan Details</h2>
              <button onClick={() => setShowViewModal(null)} className="p-2 hover:bg-muted rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {showViewModal.userName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{showViewModal.userName}</h3>
                  <p className="text-sm text-muted-foreground">{showViewModal.zone} • {showViewModal.city}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Period</p>
                  <p className="font-medium">{showViewModal.month} {showViewModal.year}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1"><StatusBadge status={showViewModal.status} /></div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Routes</p>
                  <p className="font-medium">{showViewModal.totalRoutes}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Retailers</p>
                  <p className="font-medium">{showViewModal.totalRetailers}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Planned Visits</p>
                  <p className="font-medium">{showViewModal.plannedVisits}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{showViewModal.createdAt}</p>
                </div>
              </div>

              {showViewModal.approvedBy && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">Approved By</p>
                  <p className="font-medium text-success">{showViewModal.approvedBy}</p>
                </div>
              )}

              {showViewModal.remarks && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">Rejection Remarks</p>
                  <p className="text-sm text-destructive">{showViewModal.remarks}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowViewModal(null)} className="btn-outline">Close</button>
              {showViewModal.status === 'pending' && (
                <>
                  <button onClick={() => { setShowViewModal(null); setShowApprovalModal({ plan: showViewModal, action: 'reject' }); }} className="btn-outline text-destructive border-destructive hover:bg-destructive/10">
                    Reject
                  </button>
                  <button onClick={() => { setShowViewModal(null); setShowApprovalModal({ plan: showViewModal, action: 'approve' }); }} className="btn-primary">
                    Approve
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {showApprovalModal.action === 'approve' ? 'Approve' : 'Reject'} Beat Plan
            </h2>
            <p className="text-muted-foreground mb-4">
              {showApprovalModal.action === 'approve' 
                ? `Are you sure you want to approve the beat plan for ${showApprovalModal.plan.userName}?`
                : `Please provide a reason for rejecting the beat plan of ${showApprovalModal.plan.userName}.`
              }
            </p>
            
            {showApprovalModal.action === 'reject' && (
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter rejection reason..."
                className="input-field min-h-[100px] mb-4"
              />
            )}

            <div className="flex items-center justify-end gap-3">
              <button onClick={() => { setShowApprovalModal(null); setRemarks(''); }} className="btn-outline">Cancel</button>
              <button 
                onClick={handleApproval} 
                className={showApprovalModal.action === 'approve' ? 'btn-primary' : 'btn-primary bg-destructive hover:bg-destructive/90'}
              >
                {showApprovalModal.action === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}