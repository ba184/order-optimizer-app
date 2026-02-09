import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  useExpenseClaims,
  useApproveExpenseClaim,
  useRejectExpenseClaim,
} from '@/hooks/useExpensesData';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

const expenseTypes = [
  { value: 'da', label: 'Daily Allowance (DA)' },
  { value: 'ta', label: 'Travel Allowance (TA)' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'food', label: 'Food' },
  { value: 'fuel', label: 'Fuel' },
  { value: 'misc', label: 'Miscellaneous' },
];

export default function ExpenseViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const isAdmin = userRole === 'admin' || (userRole as any)?.code === 'admin';
  
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const { data: expenses = [], isLoading } = useExpenseClaims('all');
  const approveMutation = useApproveExpenseClaim();
  const rejectMutation = useRejectExpenseClaim();

  const expense = expenses.find(e => e.id === id);

  const handleReject = () => {
    if (!rejectReason.trim() || !id) {
      alert('Rejection reason is required');
      return;
    }
    rejectMutation.mutate({ id, reason: rejectReason }, {
      onSuccess: () => {
        setShowRejectModal(false);
        navigate('/expenses');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Expense not found</p>
        <button onClick={() => navigate('/expenses')} className="btn-primary mt-4">
          Back to Expenses
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/expenses')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Expense Details</h1>
            <p className="text-muted-foreground">{expense.claim_number}</p>
          </div>
        </div>
        {expense.status === 'pending' && isAdmin && (
          <div className="flex gap-3">
            <button
              onClick={() => {
                approveMutation.mutate(expense.id, {
                  onSuccess: () => navigate('/expenses'),
                });
              }}
              disabled={approveMutation.isPending}
              className="btn-primary flex items-center gap-2"
            >
              <Check size={16} />
              Approve
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2"
            >
              <X size={16} />
              Reject
            </button>
          </div>
        )}
      </div>

      {/* Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-6 shadow-sm max-w-2xl"
      >
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <span className="text-sm text-muted-foreground">Expense ID</span>
              <p className="font-medium text-foreground">{expense.claim_number}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Status</span>
              <div className="mt-1">
                <StatusBadge status={expense.status as any} />
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Employee</span>
              <p className="font-medium text-foreground">{expense.user_name}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Created By</span>
              <p className={`font-medium ${expense.created_by_role === 'admin' ? 'text-primary' : 'text-info'}`}>
                {expense.created_by_role === 'admin' ? 'Admin' : 'FSE'}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Expense Type</span>
              <p className="font-medium text-foreground capitalize">
                {expenseTypes.find(t => t.value === expense.expense_type)?.label || expense.expense_type}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Expense Date</span>
              <p className="font-medium text-foreground">
                {expense.expense_date ? format(new Date(expense.expense_date), 'MMM d, yyyy') : '-'}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Amount</span>
              <p className="text-2xl font-bold text-primary">₹{Number(expense.total_amount).toLocaleString()}</p>
            </div>
          </div>

          {expense.description && (
            <div>
              <span className="text-sm text-muted-foreground block mb-2">Description</span>
              <p className="bg-muted/30 p-4 rounded-lg">{expense.description}</p>
            </div>
          )}

          {expense.bill_photo && expense.bill_photo.length > 0 && (
            <div>
              <span className="text-sm text-muted-foreground block mb-3">Bill Photos ({expense.bill_photo.length})</span>
              <div className="grid grid-cols-4 gap-3">
                {expense.bill_photo.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block aspect-square"
                  >
                    <img
                      src={url}
                      alt={`Bill ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-border hover:border-primary transition-colors"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {expense.rejection_reason && (
            <div>
              <span className="text-sm text-muted-foreground block mb-2">Rejection Reason</span>
              <p className="bg-destructive/10 text-destructive p-4 rounded-lg">{expense.rejection_reason}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Reject Expense</h2>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Rejection Reason *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="input-field resize-none"
                placeholder="Enter reason for rejection..."
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 btn-outline">
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || rejectMutation.isPending}
                className="flex-1 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-medium disabled:opacity-50"
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
