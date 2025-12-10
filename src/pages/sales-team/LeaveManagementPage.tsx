import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useLeaves, useCreateLeave, useUpdateLeave } from '@/hooks/useSalesTeamData';
import { useAuth } from '@/contexts/AuthContext';
import { format, differenceInDays } from 'date-fns';
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Eye,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  Loader2,
  X,
} from 'lucide-react';

interface LeaveRequest {
  id: string;
  user_id: string;
  userName: string;
  leave_type: 'casual' | 'sick' | 'earned' | 'compensatory';
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_by?: string;
  rejection_reason?: string;
  profiles?: { name: string };
  approved_by_profile?: { name: string };
}

const leaveTypeLabels: Record<string, string> = {
  casual: 'Casual Leave',
  sick: 'Sick Leave',
  earned: 'Earned Leave',
  compensatory: 'Comp Off',
};

const leaveTypeColors: Record<string, string> = {
  casual: 'bg-info/10 text-info',
  sick: 'bg-destructive/10 text-destructive',
  earned: 'bg-success/10 text-success',
  compensatory: 'bg-warning/10 text-warning',
};

export default function LeaveManagementPage() {
  const { user } = useAuth();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<{ userId: string; userName: string } | null>(null);
  const [newLeave, setNewLeave] = useState({
    leave_type: 'casual',
    start_date: '',
    end_date: '',
    reason: '',
  });

  const { data: leavesData, isLoading } = useLeaves();
  const createLeave = useCreateLeave();
  const updateLeave = useUpdateLeave();

  const leaveRequests: LeaveRequest[] = (leavesData || []).map((leave: any) => ({
    ...leave,
    userName: leave.profiles?.name || 'Unknown',
  }));

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    return differenceInDays(new Date(end), new Date(start)) + 1;
  };

  const handleApplyLeave = async () => {
    if (!newLeave.start_date || !newLeave.end_date || !newLeave.reason) {
      return;
    }
    const days = calculateDays(newLeave.start_date, newLeave.end_date);
    await createLeave.mutateAsync({
      leave_type: newLeave.leave_type,
      start_date: newLeave.start_date,
      end_date: newLeave.end_date,
      days,
      reason: newLeave.reason,
    });
    setShowApplyModal(false);
    setNewLeave({ leave_type: 'casual', start_date: '', end_date: '', reason: '' });
  };

  const handleApprove = async (id: string) => {
    await updateLeave.mutateAsync({ id, status: 'approved' });
  };

  const handleReject = async (id: string) => {
    await updateLeave.mutateAsync({ id, status: 'rejected' });
  };

  const handleViewEmployee = (userId: string, userName: string) => {
    setSelectedEmployee({ userId, userName });
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
            <p className="text-xs text-muted-foreground">{item.user_id.slice(0, 8)}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'leave_type',
      header: 'Type',
      render: (item: LeaveRequest) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${leaveTypeColors[item.leave_type] || 'bg-muted text-muted-foreground'}`}>
          {leaveTypeLabels[item.leave_type] || item.leave_type}
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
            <p className="text-sm">{item.start_date} - {item.end_date}</p>
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
          <button
            onClick={() => handleViewEmployee(item.user_id, item.userName)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="View Employee Details"
          >
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
    pending: leaveRequests.filter(l => l.status === 'pending').length,
    approved: leaveRequests.filter(l => l.status === 'approved').length,
    rejected: leaveRequests.filter(l => l.status === 'rejected').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Employee detail view
  if (selectedEmployee) {
    const employeeLeaves = leaveRequests.filter(l => l.user_id === selectedEmployee.userId);

    return (
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="module-header">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedEmployee(null)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="module-title">{selectedEmployee.userName}</h1>
              <p className="text-muted-foreground">Employee ID: {selectedEmployee.userId.slice(0, 8)}</p>
            </div>
          </div>
        </div>

        {/* Employee Leave History */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Leave History</h2>
          {employeeLeaves.length > 0 ? (
            <div className="space-y-3">
              {employeeLeaves.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${leaveTypeColors[leave.leave_type] || 'bg-muted'}`}>
                      {leaveTypeLabels[leave.leave_type] || leave.leave_type}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{leave.start_date} - {leave.end_date}</p>
                      <p className="text-xs text-muted-foreground">{leave.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{leave.days} day(s)</span>
                    <StatusBadge status={leave.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No leave records found</p>
          )}
        </div>
      </div>
    );
  }

  // Main listing view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Leave Management</h1>
          <p className="text-muted-foreground">Manage employee leave requests</p>
        </div>
        <button onClick={() => setShowApplyModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Apply Leave
        </button>
      </div>

      {/* Request Stats */}
      <div className="grid grid-cols-3 gap-4">
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
        data={leaveRequests}
        columns={columns}
        searchPlaceholder="Search by employee name..."
        emptyMessage="No leave requests found"
      />

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Apply for Leave</h2>
              <button onClick={() => setShowApplyModal(false)} className="p-2 hover:bg-muted rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Leave Type</label>
                <select
                  value={newLeave.leave_type}
                  onChange={e => setNewLeave({ ...newLeave, leave_type: e.target.value })}
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
                    value={newLeave.start_date}
                    onChange={e => setNewLeave({ ...newLeave, start_date: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
                  <input
                    type="date"
                    value={newLeave.end_date}
                    onChange={e => setNewLeave({ ...newLeave, end_date: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              {newLeave.start_date && newLeave.end_date && (
                <p className="text-sm text-muted-foreground">
                  Duration: {calculateDays(newLeave.start_date, newLeave.end_date)} day(s)
                </p>
              )}
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
              <button onClick={() => setShowApplyModal(false)} className="btn-outline">Cancel</button>
              <button 
                onClick={handleApplyLeave} 
                disabled={createLeave.isPending}
                className="btn-primary"
              >
                {createLeave.isPending ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
