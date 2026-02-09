import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { MultiImageUpload } from '@/components/ui/MultiImageUpload';
import {
  useCreateExpenseClaim,
  useEmployees,
} from '@/hooks/useExpensesData';
import { useAuth } from '@/contexts/AuthContext';

const expenseTypes = [
  { value: 'da', label: 'Daily Allowance (DA)' },
  { value: 'ta', label: 'Travel Allowance (TA)' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'food', label: 'Food' },
  { value: 'fuel', label: 'Fuel' },
  { value: 'misc', label: 'Miscellaneous' },
];

const billRequiredTypes = ['hotel', 'food', 'fuel'];

export default function ExpenseFormPage() {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const isAdmin = userRole === 'admin' || (userRole as any)?.code === 'admin';
  
  const [claimData, setClaimData] = useState({
    employee_id: '',
    expense_type: 'misc',
    expense_date: '',
    amount: 0,
    bill_photos: [] as string[],
    description: '',
  });

  const { data: employees = [] } = useEmployees();
  const createMutation = useCreateExpenseClaim();

  const handleSubmit = () => {
    const requiresBill = billRequiredTypes.includes(claimData.expense_type);
    if (requiresBill && claimData.bill_photos.length === 0) {
      alert('At least one bill photo is required for this expense type');
      return;
    }

    createMutation.mutate({
      user_id: claimData.employee_id || undefined,
      expense_type: claimData.expense_type,
      expense_date: claimData.expense_date,
      total_amount: claimData.amount,
      bill_photo: claimData.bill_photos.length > 0 ? claimData.bill_photos : undefined,
      description: claimData.description || undefined,
      isAdmin: false, // Always submit for approval, not auto-approve
    }, {
      onSuccess: () => {
        navigate('/expenses');
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/expenses')}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">New Expense</h1>
          <p className="text-muted-foreground">Create a new expense claim</p>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-6 shadow-sm max-w-2xl"
      >
        <div className="space-y-6">
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Employee *</label>
              <select
                value={claimData.employee_id}
                onChange={(e) => setClaimData({ ...claimData, employee_id: e.target.value })}
                className="input-field"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Expense Type *</label>
              <select
                value={claimData.expense_type}
                onChange={(e) => setClaimData({ ...claimData, expense_type: e.target.value })}
                className="input-field"
              >
                {expenseTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Expense Date *</label>
              <input
                type="date"
                value={claimData.expense_date}
                onChange={(e) => setClaimData({ ...claimData, expense_date: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Amount (₹) *</label>
            <input
              type="number"
              value={claimData.amount || ''}
              onChange={(e) => setClaimData({ ...claimData, amount: parseFloat(e.target.value) || 0 })}
              className="input-field"
              placeholder="Enter amount"
            />
          </div>

          <MultiImageUpload
            bucket="expense-bills"
            folder="bills"
            images={claimData.bill_photos}
            onChange={(photos) => setClaimData({ ...claimData, bill_photos: photos })}
            maxImages={5}
            maxSizeMB={5}
            label="Bill Photos"
            required={billRequiredTypes.includes(claimData.expense_type)}
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Description</label>
            <textarea
              value={claimData.description}
              onChange={(e) => setClaimData({ ...claimData, description: e.target.value })}
              rows={4}
              className="input-field resize-none"
              placeholder="Enter expense details..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button onClick={() => navigate('/expenses')} className="btn-outline">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={createMutation.isPending || !claimData.expense_date || !claimData.amount}
              className="btn-primary flex items-center gap-2"
            >
              {createMutation.isPending && <Loader2 size={16} className="animate-spin" />}
              Create
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
