import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  User,
  FileText,
  Eye,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { toast } from 'sonner';

interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  leaveType: 'casual' | 'sick' | 'earned' | 'compensatory';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedOn: string;
  approvedBy?: string;
  remarks?: string;
}

const mockLeaveRequests: LeaveRequest[] = [
  {
    id: 'l-001',
    userId: 'se-001',
    userName: 'Rajesh Kumar',
    leaveType: 'casual',
    startDate: '2024-12-15',
    endDate: '2024-12-16',
    days: 2,
    reason: 'Family function',
    status: 'pending',
    appliedOn: '2024-12-09',
  },
  {
    id: 'l-002',
    userId: 'se-002',
    userName: 'Amit Sharma',
    leaveType: 'sick',
    startDate: '2024-12-10',
    endDate: '2024-12-10',
    days: 1,
    reason: 'Not feeling well',
    status: 'approved',
    appliedOn: '2024-12-09',
    approvedBy: 'Priya Sharma (ASM)',
  },
  {
    id: 'l-003',
    userId: 'se-003',
    userName: 'Priya Singh',
    leaveType: 'earned',
    startDate: '2024-12-20',
    endDate: '2024-12-25',
    days: 6,
    reason: 'Annual vacation',
    status: 'pending',
    appliedOn: '2024-12-08',
  },
  {
    id: 'l-004',
    userId: 'se-004',
    userName: 'Vikram Patel',
    leaveType: 'casual',
    startDate: '2024-12-05',
    endDate: '2024-12-05',
    days: 1,
    reason: 'Personal work',
    status: 'rejected',
    appliedOn: '2024-12-04',
    approvedBy: 'Priya Sharma (ASM)',
    remarks: 'Critical sales period, please reschedule',
  },
];

const leaveBalance = {
  casual: { total: 12, used: 4, remaining: 8 },
  sick: { total: 10, used: 2, remaining: 8 },
  earned: { total: 15, used: 0, remaining: 15 },
  compensatory: { total: 3, used: 1, remaining: 2 },
};

const leaveTypeLabels = {
  casual: 'Casual Leave',
  sick: 'Sick Leave',
  earned: 'Earned Leave',
  compensatory: 'Comp Off',
};

const leaveTypeColors = {
  casual: 'bg-info/10 text-info',
  sick: 'bg-destructive/10 text-destructive',
  earned: 'bg-success/10 text-success',
  compensatory: 'bg-warning/10 text-warning',
};

export default function LeaveManagementPage() {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [newLeave, setNewLeave] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const handleApplyLeave = () => {
    if (!newLeave.startDate || !newLeave.endDate || !newLeave.reason) {
      toast.error('Please fill all fields');
      return;
    }
    toast.success('Leave application submitted');
    setShowApplyModal(false);
    setNewLeave({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
  };

  const handleApprove = (id: string) => {
    toast.success('Leave approved');
  };

  const handleReject = (id: string) => {
    toast.success('Leave rejected');
  };

  const columns = [
    {
      key: 'userName',
      header: 'Employee',
      render: (item: LeaveRequest) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={16} className="text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.userName}</p>
            <p className="text-xs text-muted-foreground">{item.userId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'leaveType',
      header: 'Type',
      render: (item: LeaveRequest) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${leaveTypeColors[item.leaveType]}`}>
          {leaveTypeLabels[item.leaveType]}
        </span>
      ),
    },
    {
      key: 'dates',
      header: 'Duration',
      render: (item: LeaveRequest) => (
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-muted-foreground" />
          <div>
            <p className="text-sm">{item.startDate} - {item.endDate}</p>
            <p className="text-xs text-muted-foreground">{item.days} day(s)</p>
          </div>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (item: LeaveRequest) => (
        <p className="text-sm max-w-[200px] truncate">{item.reason}</p>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: LeaveRequest) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: LeaveRequest) => (
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="View">
            <Eye size={16} className="text-muted-foreground" />
          </button>
          {item.status === 'pending' && (
            <>
              <button
                onClick={() => handleApprove(item.id)}
                className="p-2 hover:bg-success/10 rounded-lg transition-colors"
                title="Approve"
              >
                <ThumbsUp size={16} className="text-success" />
              </button>
              <button
                onClick={() => handleReject(item.id)}
                className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                title="Reject"
              >
                <ThumbsDown size={16} className="text-destructive" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const stats = {
    pending: mockLeaveRequests.filter(l => l.status === 'pending').length,
    approved: mockLeaveRequests.filter(l => l.status === 'approved').length,
    rejected: mockLeaveRequests.filter(l => l.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Leave Management</h1>
          <p className="text-muted-foreground">Apply and manage leave requests</p>
        </div>
        <button onClick={() => setShowApplyModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Apply Leave
        </button>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(leaveBalance).map(([type, balance], index) => (
          <motion.div
            key={type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${leaveTypeColors[type as keyof typeof leaveTypeColors]}`}>
                {leaveTypeLabels[type as keyof typeof leaveTypeLabels]}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">{balance.remaining}</p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>Used: {balance.used}</p>
                <p>Total: {balance.total}</p>
              </div>
            </div>
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(balance.remaining / balance.total) * 100}%` }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Request Stats */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card"
        >
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/10">
              <XCircle size={24} className="text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.rejected}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Leave Requests Table */}
      <DataTable
        data={mockLeaveRequests}
        columns={columns}
        searchPlaceholder="Search by employee name..."
      />

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Apply for Leave</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Leave Type</label>
                <select
                  value={newLeave.leaveType}
                  onChange={e => setNewLeave({ ...newLeave, leaveType: e.target.value })}
                  className="input-field"
                >
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="earned">Earned Leave</option>
                  <option value="compensatory">Compensatory Off</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
                  <input
                    type="date"
                    value={newLeave.startDate}
                    onChange={e => setNewLeave({ ...newLeave, startDate: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
                  <input
                    type="date"
                    value={newLeave.endDate}
                    onChange={e => setNewLeave({ ...newLeave, endDate: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Reason</label>
                <textarea
                  value={newLeave.reason}
                  onChange={e => setNewLeave({ ...newLeave, reason: e.target.value })}
                  placeholder="Enter reason for leave..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowApplyModal(false)} className="btn-outline">
                Cancel
              </button>
              <button onClick={handleApplyLeave} className="btn-primary">
                Submit
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
