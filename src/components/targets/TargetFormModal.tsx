import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Target as TargetIcon } from 'lucide-react';
import { Target } from '@/hooks/useTargetsData';

interface TargetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TargetFormData) => void;
  users: Array<{ id: string; name: string; email: string }>;
  initialData?: Target | null;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

export interface TargetFormData {
  user_id: string;
  target_type: string;
  target_value: number;
  period: string;
  start_date: string;
  end_date: string;
  status: string;
}

const periodOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom' },
];

const targetTypeOptions = [
  { value: 'sales', label: 'Sales', isValue: true },
  { value: 'collection', label: 'Collection', isValue: true },
  { value: 'visits', label: 'Visit', isValue: false },
  { value: 'new_outlets', label: 'New Outlet', isValue: false },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'expired', label: 'Expired' },
];

export default function TargetFormModal({
  isOpen,
  onClose,
  onSubmit,
  users,
  initialData,
  isLoading,
  mode,
}: TargetFormModalProps) {
  const [formData, setFormData] = useState<TargetFormData>({
    user_id: '',
    target_type: 'sales',
    target_value: 0,
    period: 'monthly',
    start_date: '',
    end_date: '',
    status: 'active',
  });

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        user_id: initialData.user_id,
        target_type: initialData.target_type,
        target_value: initialData.target_value,
        period: initialData.period === 'quarterly' ? 'custom' : initialData.period,
        start_date: initialData.start_date,
        end_date: initialData.end_date,
        status: initialData.status,
      });
    } else {
      setFormData({
        user_id: '',
        target_type: 'sales',
        target_value: 0,
        period: 'monthly',
        start_date: '',
        end_date: '',
        status: 'active',
      });
    }
  }, [initialData, mode, isOpen]);

  const handleSubmit = () => {
    if (!formData.user_id || !formData.target_value) {
      return;
    }
    
    // Auto-calculate dates for non-custom periods
    let startDate = formData.start_date;
    let endDate = formData.end_date;
    
    if (formData.period !== 'custom') {
      const today = new Date();
      startDate = today.toISOString().split('T')[0];
      
      switch (formData.period) {
        case 'daily':
          endDate = startDate;
          break;
        case 'weekly':
          const weekEnd = new Date(today);
          weekEnd.setDate(today.getDate() + 6);
          endDate = weekEnd.toISOString().split('T')[0];
          break;
        case 'monthly':
          const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          endDate = monthEnd.toISOString().split('T')[0];
          break;
        case 'yearly':
          const yearEnd = new Date(today.getFullYear(), 11, 31);
          endDate = yearEnd.toISOString().split('T')[0];
          break;
      }
    }
    
    onSubmit({
      ...formData,
      start_date: startDate,
      end_date: endDate,
    });
  };

  const isValueType = targetTypeOptions.find(t => t.value === formData.target_type)?.isValue;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TargetIcon size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {mode === 'create' ? 'Set New Target' : 'Edit Target'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {mode === 'create' ? 'Configure target for an employee' : 'Update target details'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
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
                {targetTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {isValueType ? 'Target Value (₹) *' : 'Target Count *'}
              </label>
              <input
                type="number"
                value={formData.target_value || ''}
                onChange={(e) => setFormData({ ...formData, target_value: parseFloat(e.target.value) || 0 })}
                placeholder={isValueType ? '₹500000' : '100'}
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
              {periodOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {formData.period === 'custom' && (
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
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="input-field"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !formData.user_id || !formData.target_value}
            className="btn-primary"
          >
            {isLoading ? (mode === 'create' ? 'Creating...' : 'Updating...') : (mode === 'create' ? 'Create Target' : 'Update Target')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
