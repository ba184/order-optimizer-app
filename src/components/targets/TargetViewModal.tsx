import { motion } from 'framer-motion';
import { X, User, Target as TargetIcon, Calendar, TrendingUp, IndianRupee, Users, Store, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Target } from '@/hooks/useTargetsData';

interface TargetViewModalProps {
  target: Target | null;
  onClose: () => void;
}

const targetTypeLabels: Record<string, string> = {
  sales: 'Sales Target',
  collection: 'Collection Target',
  visits: 'Visit Target',
  new_outlets: 'New Outlets',
};

const targetTypeIcons: Record<string, React.ReactNode> = {
  sales: <IndianRupee size={20} />,
  collection: <TrendingUp size={20} />,
  visits: <Users size={20} />,
  new_outlets: <Store size={20} />,
};

const periodLabels: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
  custom: 'Custom',
};

const formatValue = (value: number, type: string) => {
  if (type === 'sales' || type === 'collection') {
    return `₹${(value / 100000).toFixed(2)}L`;
  }
  return value.toString();
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

export default function TargetViewModal({ target, onClose }: TargetViewModalProps) {
  if (!target) return null;

  const percentage = getProgressPercentage(target.achieved_value, target.target_value);
  const isValueType = target.target_type === 'sales' || target.target_type === 'collection';

  const getStatusBadge = () => {
    if (target.status === 'completed' || percentage >= 100) {
      return (
        <div className="flex items-center gap-1.5 text-success bg-success/10 px-3 py-1.5 rounded-full">
          <CheckCircle size={16} />
          <span className="text-sm font-medium">Completed</span>
        </div>
      );
    }
    if (target.status === 'expired') {
      return (
        <div className="flex items-center gap-1.5 text-destructive bg-destructive/10 px-3 py-1.5 rounded-full">
          <AlertCircle size={16} />
          <span className="text-sm font-medium">Expired</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 text-warning bg-warning/10 px-3 py-1.5 rounded-full">
        <Clock size={16} />
        <span className="text-sm font-medium">In Progress</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Target Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Employee Info */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={24} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">{(target.user as any)?.name || 'Unknown'}</p>
            <p className="text-sm text-muted-foreground">{(target.user as any)?.email}</p>
          </div>
          {getStatusBadge()}
        </div>

        {/* Target Type */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            {targetTypeIcons[target.target_type]}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Target Type</p>
            <p className="font-semibold text-foreground">{targetTypeLabels[target.target_type]}</p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="bg-muted/30 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className={`text-lg font-bold ${percentage >= 100 ? 'text-success' : percentage >= 75 ? 'text-warning' : 'text-foreground'}`}>
              {percentage.toFixed(0)}%
            </span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all ${getProgressColor(target.achieved_value, target.target_value)}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-muted-foreground">Achieved</p>
              <p className="font-semibold text-foreground">
                {isValueType ? formatValue(target.achieved_value, target.target_type) : target.achieved_value}
              </p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">{isValueType ? 'Target Value' : 'Target Count'}</p>
              <p className="font-semibold text-foreground">
                {isValueType ? formatValue(target.target_value, target.target_type) : target.target_value}
              </p>
            </div>
          </div>
        </div>

        {/* Period Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-muted/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Period</p>
            </div>
            <p className="font-semibold text-foreground">{periodLabels[target.period]}</p>
          </div>
          <div className="bg-muted/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TargetIcon size={16} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Status</p>
            </div>
            <p className="font-semibold text-foreground capitalize">{target.status}</p>
          </div>
        </div>

        {/* Date Range */}
        <div className="bg-muted/30 rounded-xl p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-2">Date Range</p>
          <p className="font-medium text-foreground">
            {new Date(target.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} 
            {' → '}
            {new Date(target.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center justify-end">
          <button onClick={onClose} className="btn-outline">Close</button>
        </div>
      </motion.div>
    </div>
  );
}
