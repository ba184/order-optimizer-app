import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GeoFilter } from '@/components/ui/GeoFilter';
import { GeoFilter as GeoFilterType } from '@/data/geoData';
import {
  Plus,
  Target,
  User,
  Calendar,
  TrendingUp,
  IndianRupee,
  Users,
  Store,
  Edit,
  Trash2,
  Eye,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { UserRole } from '@/types';

interface TargetData {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  targetType: 'sales' | 'collection' | 'visits' | 'new_outlets';
  targetValue: number;
  achievedValue: number;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'expired';
  zone: string;
  city: string;
}

interface UserData {
  id: string;
  name: string;
  role: UserRole;
  zone: string;
  city: string;
}

const mockUsers: UserData[] = [
  { id: 'rsm-001', name: 'Vikram Singh', role: 'rsm', zone: 'North Zone', city: '' },
  { id: 'asm-001', name: 'Priya Sharma', role: 'asm', zone: 'North Zone', city: 'New Delhi' },
  { id: 'asm-002', name: 'Rahul Mehta', role: 'asm', zone: 'South Zone', city: 'Mumbai' },
  { id: 'se-001', name: 'Rajesh Kumar', role: 'sales_executive', zone: 'North Zone', city: 'New Delhi' },
  { id: 'se-002', name: 'Amit Sharma', role: 'sales_executive', zone: 'North Zone', city: 'New Delhi' },
  { id: 'se-003', name: 'Priya Singh', role: 'sales_executive', zone: 'North Zone', city: 'New Delhi' },
];

const mockTargets: TargetData[] = [
  { id: 'TGT-001', userId: 'se-001', userName: 'Rajesh Kumar', userRole: 'sales_executive', targetType: 'sales', targetValue: 500000, achievedValue: 320000, period: 'monthly', startDate: '2024-03-01', endDate: '2024-03-31', status: 'active', zone: 'North Zone', city: 'New Delhi' },
  { id: 'TGT-002', userId: 'se-001', userName: 'Rajesh Kumar', userRole: 'sales_executive', targetType: 'visits', targetValue: 100, achievedValue: 75, period: 'monthly', startDate: '2024-03-01', endDate: '2024-03-31', status: 'active', zone: 'North Zone', city: 'New Delhi' },
  { id: 'TGT-003', userId: 'se-002', userName: 'Amit Sharma', userRole: 'sales_executive', targetType: 'sales', targetValue: 450000, achievedValue: 480000, period: 'monthly', startDate: '2024-03-01', endDate: '2024-03-31', status: 'active', zone: 'North Zone', city: 'New Delhi' },
  { id: 'TGT-004', userId: 'asm-001', userName: 'Priya Sharma', userRole: 'asm', targetType: 'sales', targetValue: 2000000, achievedValue: 1500000, period: 'monthly', startDate: '2024-03-01', endDate: '2024-03-31', status: 'active', zone: 'North Zone', city: 'New Delhi' },
  { id: 'TGT-005', userId: 'rsm-001', userName: 'Vikram Singh', userRole: 'rsm', targetType: 'sales', targetValue: 10000000, achievedValue: 7500000, period: 'quarterly', startDate: '2024-01-01', endDate: '2024-03-31', status: 'active', zone: 'North Zone', city: '' },
  { id: 'TGT-006', userId: 'se-003', userName: 'Priya Singh', userRole: 'sales_executive', targetType: 'new_outlets', targetValue: 15, achievedValue: 8, period: 'monthly', startDate: '2024-03-01', endDate: '2024-03-31', status: 'active', zone: 'North Zone', city: 'New Delhi' },
  { id: 'TGT-007', userId: 'asm-002', userName: 'Rahul Mehta', userRole: 'asm', targetType: 'collection', targetValue: 1500000, achievedValue: 1200000, period: 'monthly', startDate: '2024-03-01', endDate: '2024-03-31', status: 'active', zone: 'South Zone', city: 'Mumbai' },
];

const roleLabels: Record<UserRole, string> = {
  sales_executive: 'Sales Executive',
  asm: 'Area Sales Manager',
  rsm: 'Regional Sales Manager',
  admin: 'Administrator',
};

const roleColors: Record<UserRole, string> = {
  sales_executive: 'bg-info/10 text-info',
  asm: 'bg-secondary/10 text-secondary',
  rsm: 'bg-warning/10 text-warning',
  admin: 'bg-primary/10 text-primary',
};

const targetTypeLabels: Record<string, string> = {
  sales: 'Sales Target',
  collection: 'Collection Target',
  visits: 'Visit Target',
  new_outlets: 'New Outlets',
};

const targetTypeIcons: Record<string, React.ReactNode> = {
  sales: <IndianRupee size={16} />,
  collection: <TrendingUp size={16} />,
  visits: <Users size={16} />,
  new_outlets: <Store size={16} />,
};

const periodLabels: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

export default function TargetManagementPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState<TargetData | null>(null);
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [geoFilter, setGeoFilter] = useState<GeoFilterType>({ country: 'India' });
  const [formData, setFormData] = useState({
    userId: '',
    targetType: 'sales' as 'sales' | 'collection' | 'visits' | 'new_outlets',
    targetValue: '',
    period: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    startDate: '',
    endDate: '',
  });

  const filteredTargets = mockTargets.filter(t => {
    if (targetTypeFilter !== 'all' && t.targetType !== targetTypeFilter) return false;
    if (periodFilter !== 'all' && t.period !== periodFilter) return false;
    if (geoFilter.zone && t.zone !== geoFilter.zone) return false;
    if (geoFilter.city && t.city !== geoFilter.city) return false;
    return true;
  });

  const handleCreate = () => {
    if (!formData.userId || !formData.targetValue || !formData.startDate || !formData.endDate) {
      toast.error('Please fill all required fields');
      return;
    }
    toast.success('Target created successfully');
    setShowCreateModal(false);
    setFormData({ userId: '', targetType: 'sales', targetValue: '', period: 'monthly', startDate: '', endDate: '' });
  };

  const getProgressColor = (achieved: number, target: number) => {
    const percentage = (achieved / target) * 100;
    if (percentage >= 100) return 'bg-success';
    if (percentage >= 75) return 'bg-warning';
    if (percentage >= 50) return 'bg-info';
    return 'bg-destructive';
  };

  const getProgressPercentage = (achieved: number, target: number) => {
    return Math.min((achieved / target) * 100, 100);
  };

  const formatValue = (value: number, type: string) => {
    if (type === 'sales' || type === 'collection') {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    return value.toString();
  };

  const columns = [
    {
      key: 'user',
      header: 'Employee',
      render: (item: TargetData) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.userName}</p>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[item.userRole]}`}>
              {roleLabels[item.userRole]}
            </span>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'targetType',
      header: 'Target Type',
      render: (item: TargetData) => (
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {targetTypeIcons[item.targetType]}
          </div>
          <span className="font-medium">{targetTypeLabels[item.targetType]}</span>
        </div>
      ),
    },
    {
      key: 'progress',
      header: 'Progress',
      render: (item: TargetData) => {
        const percentage = getProgressPercentage(item.achievedValue, item.targetValue);
        return (
          <div className="space-y-2 min-w-[150px]">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {formatValue(item.achievedValue, item.targetType)} / {formatValue(item.targetValue, item.targetType)}
              </span>
              <span className={`font-medium ${percentage >= 100 ? 'text-success' : percentage >= 75 ? 'text-warning' : 'text-foreground'}`}>
                {percentage.toFixed(0)}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getProgressColor(item.achievedValue, item.targetValue)}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'period',
      header: 'Period',
      render: (item: TargetData) => (
        <div className="space-y-1">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
            {periodLabels[item.period]}
          </span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar size={12} />
            <span>{new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: TargetData) => {
        const percentage = (item.achievedValue / item.targetValue) * 100;
        if (item.status === 'completed' || percentage >= 100) {
          return (
            <div className="flex items-center gap-1.5 text-success">
              <CheckCircle size={16} />
              <span className="text-sm font-medium">Achieved</span>
            </div>
          );
        }
        if (item.status === 'expired') {
          return (
            <div className="flex items-center gap-1.5 text-destructive">
              <AlertCircle size={16} />
              <span className="text-sm font-medium">Expired</span>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-1.5 text-warning">
            <Clock size={16} />
            <span className="text-sm font-medium">In Progress</span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: TargetData) => (
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowViewModal(item)}
            className="p-2 hover:bg-muted rounded-lg transition-colors" 
            title="View"
          >
            <Eye size={16} className="text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Edit">
            <Edit size={16} className="text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-destructive/10 rounded-lg transition-colors" title="Delete">
            <Trash2 size={16} className="text-destructive" />
          </button>
        </div>
      ),
    },
  ];

  const stats = {
    total: mockTargets.length,
    achieved: mockTargets.filter(t => (t.achievedValue / t.targetValue) >= 1).length,
    inProgress: mockTargets.filter(t => t.status === 'active' && (t.achievedValue / t.targetValue) < 1).length,
    avgProgress: Math.round(mockTargets.reduce((acc, t) => acc + (t.achievedValue / t.targetValue) * 100, 0) / mockTargets.length),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Target Management</h1>
          <p className="text-muted-foreground">Set and manage goals/targets for employees</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Set Target
        </button>
      </div>

      {/* Geo Filter */}
      <GeoFilter value={geoFilter} onChange={setGeoFilter} />

      {/* Filters */}
      <div className="flex items-center gap-4">
        <select
          value={targetTypeFilter}
          onChange={(e) => setTargetTypeFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="all">All Target Types</option>
          <option value="sales">Sales</option>
          <option value="collection">Collection</option>
          <option value="visits">Visits</option>
          <option value="new_outlets">New Outlets</option>
        </select>
        <select
          value={periodFilter}
          onChange={(e) => setPeriodFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="all">All Periods</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Targets', value: stats.total, icon: Target, color: 'bg-primary/10 text-primary' },
          { label: 'Achieved', value: stats.achieved, icon: CheckCircle, color: 'bg-success/10 text-success' },
          { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'bg-warning/10 text-warning' },
          { label: 'Avg Progress', value: `${stats.avgProgress}%`, icon: TrendingUp, color: 'bg-info/10 text-info' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="stat-card"
          >
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Targets Table */}
      <DataTable data={filteredTargets} columns={columns} searchPlaceholder="Search targets..." />

      {/* Create Target Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Set New Target</h2>
                <p className="text-sm text-muted-foreground">Configure target/goal for an employee</p>
              </div>
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
                  <option value="">Select an employee</option>
                  {mockUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({roleLabels[user.role]})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Target Type *</label>
                  <select
                    value={formData.targetType}
                    onChange={(e) => setFormData({ ...formData, targetType: e.target.value as any })}
                    className="input-field"
                  >
                    <option value="sales">Sales Target (₹)</option>
                    <option value="collection">Collection Target (₹)</option>
                    <option value="visits">Visit Target</option>
                    <option value="new_outlets">New Outlets Target</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Target Value *</label>
                  <input
                    type="number"
                    value={formData.targetValue}
                    onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                    placeholder={formData.targetType === 'sales' || formData.targetType === 'collection' ? '₹500000' : '100'}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Period *</label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value as any })}
                  className="input-field"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">End Date *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="btn-outline">Cancel</button>
              <button onClick={handleCreate} className="btn-primary">Create Target</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Target Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Target Details</h2>
              <button onClick={() => setShowViewModal(null)} className="p-2 hover:bg-muted rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Employee Info */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User size={24} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{showViewModal.userName}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[showViewModal.userRole]}`}>
                    {roleLabels[showViewModal.userRole]}
                  </span>
                </div>
              </div>

              {/* Target Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">Target Type</p>
                  <p className="font-medium text-foreground flex items-center gap-2 mt-1">
                    {targetTypeIcons[showViewModal.targetType]}
                    {targetTypeLabels[showViewModal.targetType]}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">Period</p>
                  <p className="font-medium text-foreground mt-1">{periodLabels[showViewModal.period]}</p>
                </div>
              </div>

              {/* Progress */}
              <div className="p-4 rounded-xl bg-muted/30">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className="font-bold text-foreground">
                    {((showViewModal.achievedValue / showViewModal.targetValue) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all ${getProgressColor(showViewModal.achievedValue, showViewModal.targetValue)}`}
                    style={{ width: `${getProgressPercentage(showViewModal.achievedValue, showViewModal.targetValue)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Achieved: <span className="font-medium text-foreground">{formatValue(showViewModal.achievedValue, showViewModal.targetType)}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Target: <span className="font-medium text-foreground">{formatValue(showViewModal.targetValue, showViewModal.targetType)}</span>
                  </span>
                </div>
              </div>

              {/* Date Range */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar size={16} />
                <span>
                  {new Date(showViewModal.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} 
                  {' - '}
                  {new Date(showViewModal.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowViewModal(null)} className="btn-outline">Close</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
