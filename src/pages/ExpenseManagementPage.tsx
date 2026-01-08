import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MultiImageUpload } from '@/components/ui/MultiImageUpload';
import {
  Plus,
  IndianRupee,
  Eye,
  CheckCircle,
  Clock,
  Loader2,
  X,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  useExpenseClaims,
  useCreateExpenseClaim,
  useApproveExpenseClaim,
  useRejectExpenseClaim,
  useEmployees,
  ExpenseClaim,
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

export default function ExpenseManagementPage() {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'admin' || (userRole as any)?.code === 'admin';
  
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [viewingClaim, setViewingClaim] = useState<ExpenseClaim | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  
  const [claimData, setClaimData] = useState({
    employee_id: '',
    expense_type: 'misc',
    expense_date: '',
    amount: 0,
    bill_photos: [] as string[],
    description: '',
  });

  const { data: expenses = [], isLoading } = useExpenseClaims(statusFilter);
  const { data: employees = [] } = useEmployees();
  const createMutation = useCreateExpenseClaim();
  const approveMutation = useApproveExpenseClaim();
  const rejectMutation = useRejectExpenseClaim();

  const handleSubmitClaim = () => {
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
      isAdmin,
    });
    setShowClaimModal(false);
    setClaimData({
      employee_id: '',
      expense_type: 'misc',
      expense_date: '',
      amount: 0,
      bill_photos: [],
      description: '',
    });
  };

  const handleReject = (id: string) => {
    if (!rejectReason.trim()) {
      alert('Rejection reason is required');
      return;
    }
    rejectMutation.mutate({ id, reason: rejectReason });
    setShowRejectModal(null);
    setRejectReason('');
  };

  const columns = [
    {
      key: 'claim_number',
      header: 'Expense ID',
      render: (item: ExpenseClaim) => (
        <p className="font-medium text-foreground">{item.claim_number}</p>
      ),
    },
    {
      key: 'user_name',
      header: 'Employee Name',
    },
    {
      key: 'expense_type',
      header: 'Expense Type',
      render: (item: ExpenseClaim) => (
        <span className="px-2 py-1 bg-muted rounded text-sm capitalize">
          {expenseTypes.find(t => t.value === item.expense_type)?.label || item.expense_type}
        </span>
      ),
    },
    {
      key: 'expense_date',
      header: 'Expense Date',
      render: (item: ExpenseClaim) => (
        <span>{item.expense_date ? format(new Date(item.expense_date), 'MMM d, yyyy') : '-'}</span>
      ),
    },
    {
      key: 'total_amount',
      header: 'Amount',
      render: (item: ExpenseClaim) => (
        <span className="font-semibold text-primary">₹{Number(item.total_amount).toLocaleString()}</span>
      ),
    },
    {
      key: 'created_by_role',
      header: 'Created By',
      render: (item: ExpenseClaim) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          item.created_by_role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-info/10 text-info'
        }`}>
          {item.created_by_role === 'admin' ? 'Admin' : 'FSE'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: ExpenseClaim) => <StatusBadge status={item.status as any} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: ExpenseClaim) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewingClaim(item)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="View"
          >
            <Eye size={16} className="text-muted-foreground" />
          </button>
          {item.status === 'pending' && isAdmin && (
            <>
              <button
                onClick={() => approveMutation.mutate(item.id)}
                className="p-2 hover:bg-success/10 rounded-lg transition-colors"
                title="Approve"
              >
                <Check size={16} className="text-success" />
              </button>
              <button
                onClick={() => setShowRejectModal(item.id)}
                className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                title="Reject"
              >
                <X size={16} className="text-destructive" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const stats = {
    pending: expenses.filter((e) => e.status === 'pending').length,
    approved: expenses.filter((e) => e.status === 'approved').length,
    totalPending: expenses.filter((e) => e.status === 'pending').reduce((sum, e) => sum + Number(e.total_amount), 0),
    totalApproved: expenses.filter((e) => e.status === 'approved').reduce((sum, e) => sum + Number(e.total_amount), 0),
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
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Expense & Allowance Management</h1>
          <p className="text-muted-foreground">Manage expenses, approvals, and reimbursements</p>
        </div>
        <button onClick={() => setShowClaimModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          New Expense
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <Clock size={24} className="text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
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
            <div className="p-3 rounded-xl bg-primary/10">
              <IndianRupee size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">₹{(stats.totalPending / 1000).toFixed(1)}K</p>
              <p className="text-sm text-muted-foreground">Pending Amount</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10">
              <IndianRupee size={24} className="text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">₹{(stats.totalApproved / 1000).toFixed(1)}K</p>
              <p className="text-sm text-muted-foreground">Approved Amount</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Claims Table */}
      <DataTable data={expenses} columns={columns} searchPlaceholder="Search expenses..." />

      {/* New Expense Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-lg font-semibold text-foreground mb-6">New Expense</h2>

            <div className="space-y-4">
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
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Enter expense details..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowClaimModal(false)} className="btn-outline">
                Cancel
              </button>
              <button
                onClick={handleSubmitClaim}
                disabled={createMutation.isPending || !claimData.expense_date || !claimData.amount}
                className="btn-primary"
              >
                {createMutation.isPending ? 'Submitting...' : isAdmin ? 'Create & Approve' : 'Submit for Approval'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Expense Modal */}
      {viewingClaim && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Expense Details</h2>
              <button onClick={() => setViewingClaim(null)} className="p-2 hover:bg-muted rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expense ID</span>
                <span className="font-medium">{viewingClaim.claim_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Employee</span>
                <span className="font-medium">{viewingClaim.user_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium capitalize">
                  {expenseTypes.find(t => t.value === viewingClaim.expense_type)?.label || viewingClaim.expense_type}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">
                  {viewingClaim.expense_date ? format(new Date(viewingClaim.expense_date), 'MMM d, yyyy') : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-primary">₹{Number(viewingClaim.total_amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={viewingClaim.status as any} />
              </div>
              {viewingClaim.description && (
                <div>
                  <span className="text-muted-foreground block mb-1">Description</span>
                  <p className="text-sm bg-muted/30 p-3 rounded-lg">{viewingClaim.description}</p>
                </div>
              )}
              {viewingClaim.bill_photo && viewingClaim.bill_photo.length > 0 && (
                <div>
                  <span className="text-muted-foreground block mb-2">Bill Photos ({viewingClaim.bill_photo.length})</span>
                  <div className="flex flex-wrap gap-2">
                    {viewingClaim.bill_photo.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={url}
                          alt={`Bill ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-border hover:border-primary transition-colors"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {viewingClaim.rejection_reason && (
                <div>
                  <span className="text-muted-foreground block mb-1">Rejection Reason</span>
                  <p className="text-sm bg-destructive/10 text-destructive p-3 rounded-lg">{viewingClaim.rejection_reason}</p>
                </div>
              )}
            </div>

            {viewingClaim.status === 'pending' && isAdmin && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    approveMutation.mutate(viewingClaim.id);
                    setViewingClaim(null);
                  }}
                  className="flex-1 btn-primary"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(viewingClaim.id);
                    setViewingClaim(null);
                  }}
                  className="flex-1 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-medium"
                >
                  Reject
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}

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
              <button onClick={() => setShowRejectModal(null)} className="flex-1 btn-outline">
                Cancel
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                disabled={!rejectReason.trim()}
                className="flex-1 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-medium disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
