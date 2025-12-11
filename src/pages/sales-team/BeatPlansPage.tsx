import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Building2,
  Store,
  Route,
  Phone,
  Mail,
  FileText,
  ChevronRight,
  ChevronLeft,
  User,
  CalendarDays,
  Clock3,
  Repeat,
  AlertCircle,
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

interface VisitPlan {
  employeeId: string;
  distributorId: string;
  retailers: string[];
  visitDate: string;
  visitTime: string;
  visitType: string;
  priority: string;
  duration: string;
  objectives: string;
  notes: string;
  frequency: string;
  route: string;
}

const mockBeatPlans: BeatPlan[] = [
  { id: 'bp-001', userId: 'se-001', userName: 'Rajesh Kumar', month: 'December', year: 2024, totalRoutes: 6, totalRetailers: 85, plannedVisits: 340, status: 'approved', createdAt: '2024-11-25', approvedBy: 'Priya Sharma (ASM)', zone: 'North Zone', city: 'New Delhi' },
  { id: 'bp-002', userId: 'se-002', userName: 'Amit Sharma', month: 'December', year: 2024, totalRoutes: 5, totalRetailers: 72, plannedVisits: 288, status: 'pending', createdAt: '2024-11-28', zone: 'North Zone', city: 'New Delhi' },
  { id: 'bp-003', userId: 'se-003', userName: 'Priya Singh', month: 'December', year: 2024, totalRoutes: 6, totalRetailers: 90, plannedVisits: 360, status: 'approved', createdAt: '2024-11-24', approvedBy: 'Priya Sharma (ASM)', zone: 'North Zone', city: 'New Delhi' },
  { id: 'bp-004', userId: 'se-004', userName: 'Vikram Patel', month: 'December', year: 2024, totalRoutes: 4, totalRetailers: 60, plannedVisits: 240, status: 'draft', createdAt: '2024-12-01', zone: 'South Zone', city: 'Mumbai' },
  { id: 'bp-005', userId: 'se-005', userName: 'Sunita Gupta', month: 'December', year: 2024, totalRoutes: 5, totalRetailers: 68, plannedVisits: 272, status: 'rejected', createdAt: '2024-11-26', zone: 'East Zone', city: 'Kolkata', remarks: 'Need more coverage in South area' },
];

const mockDistributors = [
  { id: 'dist-001', name: 'ABC Distributors Pvt Ltd', zone: 'North Zone', city: 'New Delhi', contact: '9876543210', address: 'Karol Bagh, Delhi' },
  { id: 'dist-002', name: 'XYZ Trading Company', zone: 'North Zone', city: 'New Delhi', contact: '9876543211', address: 'Connaught Place, Delhi' },
  { id: 'dist-003', name: 'Metro Suppliers', zone: 'South Zone', city: 'Mumbai', contact: '9876543212', address: 'Andheri, Mumbai' },
  { id: 'dist-004', name: 'Eastern Traders', zone: 'East Zone', city: 'Kolkata', contact: '9876543213', address: 'Park Street, Kolkata' },
];

const mockRetailers = [
  { id: 'ret-001', name: 'Sharma General Store', distributorId: 'dist-001', address: 'Shop 12, Karol Bagh', contact: '9988776655', type: 'General Store' },
  { id: 'ret-002', name: 'Gupta Hardware', distributorId: 'dist-001', address: 'Shop 45, Rajouri Garden', contact: '9988776656', type: 'Hardware' },
  { id: 'ret-003', name: 'Singh Paint House', distributorId: 'dist-001', address: 'Shop 78, Janakpuri', contact: '9988776657', type: 'Paint Shop' },
  { id: 'ret-004', name: 'Delhi Construction Supplies', distributorId: 'dist-002', address: 'Shop 23, CP', contact: '9988776658', type: 'Construction' },
  { id: 'ret-005', name: 'Quick Fix Hardware', distributorId: 'dist-002', address: 'Shop 56, Saket', contact: '9988776659', type: 'Hardware' },
  { id: 'ret-006', name: 'Mumbai Paints', distributorId: 'dist-003', address: 'Shop 89, Andheri', contact: '9988776660', type: 'Paint Shop' },
  { id: 'ret-007', name: 'Eastern Hardware', distributorId: 'dist-004', address: 'Shop 34, Salt Lake', contact: '9988776661', type: 'Hardware' },
];

const visitTypes = ['Regular Visit', 'Collection Visit', 'Order Collection', 'Scheme Promotion', 'Product Demo', 'Complaint Resolution', 'New Launch'];
const priorities = ['High', 'Medium', 'Low'];
const frequencies = ['One Time', 'Daily', 'Weekly', 'Bi-Weekly', 'Monthly'];
const routes = ['Route A - Karol Bagh Area', 'Route B - CP Area', 'Route C - South Delhi', 'Route D - West Delhi', 'Route E - East Delhi'];

export default function BeatPlansPage() {
  const [selectedMonth, setSelectedMonth] = useState('December 2024');
  const [geoFilter, setGeoFilter] = useState<GeoFilterType>({ country: 'India' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState<BeatPlan | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState<{ plan: BeatPlan; action: 'approve' | 'reject' } | null>(null);
  const [remarks, setRemarks] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [visitPlan, setVisitPlan] = useState<VisitPlan>({
    employeeId: '',
    distributorId: '',
    retailers: [],
    visitDate: '',
    visitTime: '',
    visitType: '',
    priority: 'Medium',
    duration: '60',
    objectives: '',
    notes: '',
    frequency: 'One Time',
    route: '',
  });

  const filteredPlans = mockBeatPlans.filter(plan => {
    if (geoFilter.zone && plan.zone !== geoFilter.zone) return false;
    if (geoFilter.city && plan.city !== geoFilter.city) return false;
    return true;
  });

  const filteredRetailers = mockRetailers.filter(r => r.distributorId === visitPlan.distributorId);

  const stats = {
    total: filteredPlans.length,
    approved: filteredPlans.filter(bp => bp.status === 'approved').length,
    pending: filteredPlans.filter(bp => bp.status === 'pending').length,
    draft: filteredPlans.filter(bp => bp.status === 'draft').length,
  };

  const selectedEmployee = employees.find(e => e.id === visitPlan.employeeId);
  const selectedDistributor = mockDistributors.find(d => d.id === visitPlan.distributorId);

  const handleCreate = () => {
    if (!visitPlan.employeeId || !visitPlan.distributorId || visitPlan.retailers.length === 0) {
      toast.error('Please fill all required fields');
      return;
    }
    toast.success('Visit plan created successfully');
    setShowCreateModal(false);
    setCurrentStep(1);
    setVisitPlan({
      employeeId: '',
      distributorId: '',
      retailers: [],
      visitDate: '',
      visitTime: '',
      visitType: '',
      priority: 'Medium',
      duration: '60',
      objectives: '',
      notes: '',
      frequency: 'One Time',
      route: '',
    });
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

  const toggleRetailer = (retailerId: string) => {
    setVisitPlan(prev => ({
      ...prev,
      retailers: prev.retailers.includes(retailerId)
        ? prev.retailers.filter(id => id !== retailerId)
        : [...prev.retailers, retailerId]
    }));
  };

  const nextStep = () => {
    if (currentStep === 1 && !visitPlan.employeeId) {
      toast.error('Please select an employee');
      return;
    }
    if (currentStep === 2 && !visitPlan.distributorId) {
      toast.error('Please select a distributor');
      return;
    }
    if (currentStep === 3 && visitPlan.retailers.length === 0) {
      toast.error('Please select at least one retailer');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

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

  const stepTitles = [
    'Select Employee',
    'Select Distributor',
    'Select Retailers',
    'Visit Details'
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
            Plan Visit
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

      {/* Create Visit Plan Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-xl border border-border shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">Plan Employee Visit</h2>
                  <button onClick={() => { setShowCreateModal(false); setCurrentStep(1); }} className="p-2 hover:bg-muted rounded-lg">
                    <X size={20} />
                  </button>
                </div>
                
                {/* Step Indicator */}
                <div className="flex items-center gap-2">
                  {stepTitles.map((title, index) => (
                    <div key={index} className="flex items-center">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                        currentStep === index + 1 
                          ? 'bg-primary text-primary-foreground' 
                          : currentStep > index + 1 
                            ? 'bg-success/10 text-success' 
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        <span className="text-sm font-medium">{index + 1}</span>
                        <span className="text-sm hidden sm:inline">{title}</span>
                      </div>
                      {index < stepTitles.length - 1 && (
                        <ChevronRight size={16} className="text-muted-foreground mx-1" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto flex-1">
                {/* Step 1: Select Employee */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <User size={24} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Select Employee</h3>
                        <p className="text-sm text-muted-foreground">Choose the sales executive for this visit</p>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {employees.filter(e => e.role === 'sales_executive').map(emp => (
                        <div
                          key={emp.id}
                          onClick={() => setVisitPlan({ ...visitPlan, employeeId: emp.id })}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            visitPlan.employeeId === emp.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="font-semibold text-primary">
                                {emp.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{emp.name}</p>
                              <p className="text-sm text-muted-foreground">{emp.zone} • {emp.city}</p>
                              <p className="text-xs text-muted-foreground">{emp.area}</p>
                            </div>
                            {visitPlan.employeeId === emp.id && (
                              <CheckCircle size={20} className="text-primary" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Select Distributor */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Building2 size={24} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Select Distributor</h3>
                        <p className="text-sm text-muted-foreground">Choose the distributor for this visit coverage</p>
                      </div>
                    </div>

                    {selectedEmployee && (
                      <div className="p-3 rounded-lg bg-info/10 mb-4">
                        <div className="flex items-center gap-2 text-sm text-info">
                          <User size={16} />
                          <span>Planning visit for: <strong>{selectedEmployee.name}</strong></span>
                        </div>
                      </div>
                    )}

                    <div className="grid gap-3">
                      {mockDistributors.map(dist => (
                        <div
                          key={dist.id}
                          onClick={() => setVisitPlan({ ...visitPlan, distributorId: dist.id, retailers: [] })}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            visitPlan.distributorId === dist.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                              <Building2 size={24} className="text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{dist.name}</p>
                              <p className="text-sm text-muted-foreground">{dist.zone} • {dist.city}</p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Phone size={12} /> {dist.contact}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin size={12} /> {dist.address}
                                </span>
                              </div>
                            </div>
                            {visitPlan.distributorId === dist.id && (
                              <CheckCircle size={20} className="text-primary" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Select Retailers */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Store size={24} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Select Retailers</h3>
                        <p className="text-sm text-muted-foreground">Choose one or more retailers to visit</p>
                      </div>
                    </div>

                    {selectedDistributor && (
                      <div className="p-3 rounded-lg bg-info/10 mb-4">
                        <div className="flex items-center gap-2 text-sm text-info">
                          <Building2 size={16} />
                          <span>Showing retailers under: <strong>{selectedDistributor.name}</strong></span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">
                        {visitPlan.retailers.length} retailer(s) selected
                      </span>
                      <button
                        onClick={() => setVisitPlan({ 
                          ...visitPlan, 
                          retailers: visitPlan.retailers.length === filteredRetailers.length 
                            ? [] 
                            : filteredRetailers.map(r => r.id) 
                        })}
                        className="text-sm text-primary hover:underline"
                      >
                        {visitPlan.retailers.length === filteredRetailers.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>

                    <div className="grid gap-3">
                      {filteredRetailers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                          <p>No retailers found for this distributor</p>
                        </div>
                      ) : (
                        filteredRetailers.map(ret => (
                          <div
                            key={ret.id}
                            onClick={() => toggleRetailer(ret.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                              visitPlan.retailers.includes(ret.id)
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                                visitPlan.retailers.includes(ret.id)
                                  ? 'bg-primary border-primary'
                                  : 'border-muted-foreground'
                              }`}>
                                {visitPlan.retailers.includes(ret.id) && (
                                  <CheckCircle size={14} className="text-primary-foreground" />
                                )}
                              </div>
                              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                                <Store size={18} className="text-primary" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-foreground">{ret.name}</p>
                                <p className="text-xs text-muted-foreground">{ret.type}</p>
                                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <MapPin size={12} /> {ret.address}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Phone size={12} /> {ret.contact}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Visit Details */}
                {currentStep === 4 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <FileText size={24} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Visit Details</h3>
                        <p className="text-sm text-muted-foreground">Configure visit schedule and objectives</p>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User size={16} className="text-primary" />
                        <span className="text-muted-foreground">Employee:</span>
                        <span className="font-medium text-foreground">{selectedEmployee?.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 size={16} className="text-primary" />
                        <span className="text-muted-foreground">Distributor:</span>
                        <span className="font-medium text-foreground">{selectedDistributor?.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Store size={16} className="text-primary" />
                        <span className="text-muted-foreground">Retailers:</span>
                        <span className="font-medium text-foreground">{visitPlan.retailers.length} selected</span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          <CalendarDays size={14} className="inline mr-1" />
                          Visit Date *
                        </label>
                        <input
                          type="date"
                          value={visitPlan.visitDate}
                          onChange={(e) => setVisitPlan({ ...visitPlan, visitDate: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          <Clock3 size={14} className="inline mr-1" />
                          Visit Time *
                        </label>
                        <input
                          type="time"
                          value={visitPlan.visitTime}
                          onChange={(e) => setVisitPlan({ ...visitPlan, visitTime: e.target.value })}
                          className="input-field"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Visit Type *</label>
                        <select
                          value={visitPlan.visitType}
                          onChange={(e) => setVisitPlan({ ...visitPlan, visitType: e.target.value })}
                          className="input-field"
                        >
                          <option value="">Select type</option>
                          {visitTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Priority</label>
                        <select
                          value={visitPlan.priority}
                          onChange={(e) => setVisitPlan({ ...visitPlan, priority: e.target.value })}
                          className="input-field"
                        >
                          {priorities.map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          <Repeat size={14} className="inline mr-1" />
                          Frequency
                        </label>
                        <select
                          value={visitPlan.frequency}
                          onChange={(e) => setVisitPlan({ ...visitPlan, frequency: e.target.value })}
                          className="input-field"
                        >
                          {frequencies.map(f => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          <Route size={14} className="inline mr-1" />
                          Assign Route
                        </label>
                        <select
                          value={visitPlan.route}
                          onChange={(e) => setVisitPlan({ ...visitPlan, route: e.target.value })}
                          className="input-field"
                        >
                          <option value="">Select route</option>
                          {routes.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Expected Duration (minutes)
                      </label>
                      <input
                        type="number"
                        value={visitPlan.duration}
                        onChange={(e) => setVisitPlan({ ...visitPlan, duration: e.target.value })}
                        placeholder="60"
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Visit Objectives</label>
                      <textarea
                        value={visitPlan.objectives}
                        onChange={(e) => setVisitPlan({ ...visitPlan, objectives: e.target.value })}
                        placeholder="Enter visit objectives..."
                        rows={3}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Additional Notes</label>
                      <textarea
                        value={visitPlan.notes}
                        onChange={(e) => setVisitPlan({ ...visitPlan, notes: e.target.value })}
                        placeholder="Any additional notes or instructions..."
                        rows={2}
                        className="input-field"
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-border flex items-center justify-between">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="btn-outline flex items-center gap-2 disabled:opacity-50"
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>
                <div className="flex items-center gap-3">
                  <button onClick={() => { setShowCreateModal(false); setCurrentStep(1); }} className="btn-outline">
                    Cancel
                  </button>
                  {currentStep < totalSteps ? (
                    <button onClick={nextStep} className="btn-primary flex items-center gap-2">
                      Next
                      <ChevronRight size={18} />
                    </button>
                  ) : (
                    <button onClick={handleCreate} className="btn-primary">
                      Create Visit Plan
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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