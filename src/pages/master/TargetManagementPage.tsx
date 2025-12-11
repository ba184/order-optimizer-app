import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { GeoFilter } from '@/components/ui/GeoFilter';
import { GeoFilter as GeoFilterType } from '@/data/geoData';
import { useTargets, useCreateTarget, useDeleteTarget, useUsers, Target } from '@/hooks/useTargetsData';
import {
  Plus,
  Target as TargetIcon,
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
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

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
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [geoFilter, setGeoFilter] = useState<GeoFilterType>({ country: 'India' });

  const { data: targets = [], isLoading } = useTargets({ 
    targetType: targetTypeFilter, 
    period: periodFilter 
  });
  const { data: users = [] } = useUsers();
  const createTarget = useCreateTarget();
  const deleteTarget = useDeleteTarget();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState<Target | null>(null);
  const [formData, setFormData] = useState({
    user_id: '',
    target_type: 'sales',
    target_value: '',
    period: 'monthly',
    start_date: '',
    end_date: '',
  });

  const handleCreate = async () => {
    if (!formData.user_id || !formData.target_value || !formData.start_date || !formData.end_date) {
      toast.error('Please fill all required fields');
      return;
    }
    await createTarget.mutateAsync({
      user_id: formData.user_id,
      target_type: formData.target_type,
      target_value: parseFloat(formData.target_value),
      period: formData.period,
      start_date: formData.start_date,
      end_date: formData.end_date,
    });
    setShowCreateModal(false);
    setFormData({ user_id: '', target_type: 'sales', target_value: '', period: 'monthly', start_date: '', end_date: '' });
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
      render: (item: Target) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{(item.user as any)?.name || 'Unknown'}</p>
            <p className="text-xs text-muted-foreground">{(item.user as any)?.email}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'target_type',
      header: 'Target Type',
      render: (item: Target) => (
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {targetTypeIcons[item.target_type]}
          </div>
          <span className="font-medium">{targetTypeLabels[item.target_type]}</span>
        </div>
      ),
    },
    {
      key: 'progress',
      header: 'Progress',
      render: (item: Target) => {
        const percentage = getProgressPercentage(item.achieved_value, item.target_value);
        return (
          <div className="space-y-2 min-w-[150px]">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {formatValue(item.achieved_value, item.target_type)} / {formatValue(item.target_value, item.target_type)}
              </span>
              <span className={`font-medium ${percentage >= 100 ? 'text-success' : percentage >= 75 ? 'text-warning' : 'text-foreground'}`}>
                {percentage.toFixed(0)}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getProgressColor(item.achieved_value, item.target_value)}`}
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
      render: (item: Target) => (
        <div className="space-y-1">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
            {periodLabels[item.period]}
          </span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar size={12} />
            <span>{new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Target) => {
        const percentage = (item.achieved_value / item.target_value) * 100;
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
      render: (item: Target) => (
        <div className="flex items-center gap-1">
          <button onClick={() => setShowViewModal(item)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Eye size={16} className="text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Edit size={16} className="text-muted-foreground" />
          </button>
          <button 
            onClick={() => deleteTarget.mutateAsync(item.id)}
            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <Trash2 size={16} className="text-destructive" />
          </button>
        </div>
      ),
    },
  ];

  const stats = {
    total: targets.length,
    achieved: targets.filter(t => (t.achieved_value / t.target_value) >= 1).length,
    inProgress: targets.filter(t => t.status === 'active' && (t.achieved_value / t.target_value) < 1).length,
    avgProgress: targets.length > 0 ? Math.round(targets.reduce((acc, t) => acc + (t.achieved_value / t.target_value) * 100, 0) / targets.length) : 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      <GeoFilter value={geoFilter} onChange={setGeoFilter} />

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

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Targets', value: stats.total, icon: TargetIcon, color: 'bg-primary/10 text-primary' },
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

      <DataTable 
        data={targets} 
        columns={columns} 
        searchPlaceholder="Search targets..."
        emptyMessage="No targets found. Set your first target to get started."
      />

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
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select an employee</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Target Type *</label>
                  <select
                    value={formData.target_type}
                    onChange={(e) => setFormData({ ...formData, target_type: e.target.value })}
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
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                    placeholder={formData.target_type === 'sales' || formData.target_type === 'collection' ? '₹500000' : '100'}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Period *</label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
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
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">End Date *</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="btn-outline">Cancel</button>
              <button 
                onClick={handleCreate} 
                disabled={createTarget.isPending}
                className="btn-primary"
              >
                {createTarget.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Employee</p>
                  <p className="font-medium">{(showViewModal.user as any)?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-medium">{targetTypeLabels[showViewModal.target_type]}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Target Value</p>
                  <p className="font-medium">{formatValue(showViewModal.target_value, showViewModal.target_type)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Achieved Value</p>
                  <p className="font-medium">{formatValue(showViewModal.achieved_value, showViewModal.target_type)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Period</p>
                  <p className="font-medium">{periodLabels[showViewModal.period]}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Progress</p>
                  <p className="font-medium">{getProgressPercentage(showViewModal.achieved_value, showViewModal.target_value).toFixed(0)}%</p>
                </div>
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
