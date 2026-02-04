import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { useTargets, useCreateTarget, useUpdateTarget, useDeleteTarget, useUsers, Target } from '@/hooks/useTargetsData';
import TargetFormModal, { TargetFormData } from '@/components/targets/TargetFormModal';
import TargetViewModal from '@/components/targets/TargetViewModal';
import {
  Plus,
  Target as TargetIcon,
  User,
  TrendingUp,
  IndianRupee,
  Users,
  Store,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Activity,
  Ban,
} from 'lucide-react';
import { toast } from 'sonner';

const targetTypeLabels: Record<string, string> = {
  sales: 'Sales',
  collection: 'Collection',
  visits: 'Visit',
  new_outlets: 'New Outlet',
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
  custom: 'Custom',
};

export default function TargetManagementPage() {
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');

  const { data: targets = [], isLoading } = useTargets({
    targetType: targetTypeFilter,
    period: periodFilter,
  });
  const { data: users = [] } = useUsers();
  const createTarget = useCreateTarget();
  const updateTarget = useUpdateTarget();
  const deleteTarget = useDeleteTarget();

  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedTarget, setSelectedTarget] = useState<Target | null>(null);
  const [showViewModal, setShowViewModal] = useState<Target | null>(null);

  const handleCreate = () => {
    setFormMode('create');
    setSelectedTarget(null);
    setShowFormModal(true);
  };

  const handleEdit = (target: Target) => {
    setFormMode('edit');
    setSelectedTarget(target);
    setShowFormModal(true);
  };

  const handleFormSubmit = async (data: TargetFormData) => {
    try {
      if (formMode === 'create') {
        await createTarget.mutateAsync({
          user_id: data.user_id,
          target_type: data.target_type,
          target_value: data.target_value,
          period: data.period,
          start_date: data.start_date,
          end_date: data.end_date,
        });
      } else if (selectedTarget) {
        await updateTarget.mutateAsync({
          id: selectedTarget.id,
          user_id: data.user_id,
          target_type: data.target_type as any,
          target_value: data.target_value,
          period: data.period as any,
          start_date: data.start_date,
          end_date: data.end_date,
          status: data.status as any,
        });
      }
      setShowFormModal(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this target?')) {
      await deleteTarget.mutateAsync(id);
    }
  };

  const getProgressPercentage = (achieved: number, target: number) => {
    if (target === 0) return 0;
    return Math.min((achieved / target) * 100, 100);
  };

  const getProgressColor = (achieved: number, target: number) => {
    const percentage = getProgressPercentage(achieved, target);
    if (percentage >= 100) return 'bg-success';
    if (percentage >= 75) return 'bg-warning';
    if (percentage >= 50) return 'bg-info';
    return 'bg-destructive';
  };

  const formatValue = (value: number, type: string) => {
    if (type === 'sales' || type === 'collection') {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    return value.toString();
  };

  const getGoalStatus = (target: Target) => {
    const percentage = getProgressPercentage(target.achieved_value, target.target_value);
    if (percentage >= 100 || target.status === 'completed') {
      return (
        <div className="flex items-center gap-1.5 text-success">
          <CheckCircle size={16} />
          <span className="text-sm font-medium">Completed</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 text-warning">
        <Clock size={16} />
        <span className="text-sm font-medium">In Progress</span>
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
            Active
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-info/10 text-info">
            Completed
          </span>
        );
      case 'expired':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
            Expired
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
            {status}
          </span>
        );
    }
  };

  const columns = [
    {
      key: 'user',
      header: 'Employee',
      render: (item: Target) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={18} className="text-primary" />
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
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            {targetTypeIcons[item.target_type]}
          </div>
          <span className="font-medium">{targetTypeLabels[item.target_type]}</span>
        </div>
      ),
    },
    {
      key: 'goal_status',
      header: 'Goal Status',
      render: (item: Target) => getGoalStatus(item),
    },
    {
      key: 'progress',
      header: 'Progress',
      render: (item: Target) => {
        const percentage = getProgressPercentage(item.achieved_value, item.target_value);
        return (
          <div className="space-y-1.5 min-w-[120px]">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                {formatValue(item.achieved_value, item.target_type)} / {formatValue(item.target_value, item.target_type)}
              </span>
              <span className={`font-medium ${percentage >= 100 ? 'text-success' : 'text-foreground'}`}>
                {percentage.toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
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
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
          {periodLabels[item.period]}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Target) => getStatusBadge(item.status),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Target) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowViewModal(item)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="View"
          >
            <Eye size={16} className="text-muted-foreground" />
          </button>
          <button
            onClick={() => handleEdit(item)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Edit"
          >
            <Edit size={16} className="text-muted-foreground" />
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={16} className="text-destructive" />
          </button>
        </div>
      ),
    },
  ];

  // KPI calculations
  const stats = {
    total: targets.length,
    active: targets.filter((t) => t.status === 'active').length,
    inactive: targets.filter((t) => t.status !== 'active').length,
    avgProgress:
      targets.length > 0
        ? Math.round(
            targets.reduce((acc, t) => acc + getProgressPercentage(t.achieved_value, t.target_value), 0) / targets.length
          )
        : 0,
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
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Set Target
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Targets', value: stats.total, icon: TargetIcon, color: 'bg-primary/10 text-primary' },
          { label: 'Active Targets', value: stats.active, icon: Activity, color: 'bg-success/10 text-success' },
          { label: 'Inactive Targets', value: stats.inactive, icon: Ban, color: 'bg-muted text-muted-foreground' },
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
          <option value="visits">Visit</option>
          <option value="new_outlets">New Outlet</option>
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
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* Data Table */}
      <DataTable
        data={targets}
        columns={columns}
        searchPlaceholder="Search targets..."
        emptyMessage="No targets found. Set your first target to get started."
      />

      {/* Form Modal */}
      <TargetFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleFormSubmit}
        users={users}
        initialData={selectedTarget}
        isLoading={createTarget.isPending || updateTarget.isPending}
        mode={formMode}
      />

      {/* View Modal */}
      <TargetViewModal target={showViewModal} onClose={() => setShowViewModal(null)} />
    </div>
  );
}
