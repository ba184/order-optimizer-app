import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useLeaves, useCreateLeave, useUpdateLeave, useProfiles } from '@/hooks/useSalesTeamData';
import { useAuth } from '@/contexts/AuthContext';
import { format, differenceInDays, parseISO, isAfter, isBefore, isEqual, startOfDay, endOfDay } from 'date-fns';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  X,
  Filter,
} from 'lucide-react';

interface LeaveRequest {
  id: string;
  user_id: string;
  userName: string;
  leave_type: 'casual' | 'sick' | 'privilege' | 'lwp';
  duration_type: 'full' | 'half';
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_by?: string;
  rejection_reason?: string;
  applied_by?: string;
  profiles?: { name: string };
  approved_by_profile?: { name: string };
}

const leaveTypeLabels: Record<string, string> = {
  casual: 'Casual Leave (CL)',
  sick: 'Sick Leave (SL)',
  privilege: 'Privilege Leave (PL)',
  lwp: 'Leave Without Pay (LWP)',
};

const leaveTypeColors: Record<string, string> = {
  casual: 'bg-info/10 text-info',
  sick: 'bg-destructive/10 text-destructive',
  privilege: 'bg-success/10 text-success',
  lwp: 'bg-warning/10 text-warning',
};

// Leave balance configuration
const leaveBalanceConfig: Record<string, { total: number; unlimited: boolean }> = {
  casual: { total: 7, unlimited: false },
  sick: { total: 7, unlimited: false },
  privilege: { total: 18, unlimited: false },
  lwp: { total: 0, unlimited: true },
};

export default function LeaveManagementPage() {
  const { user } = useAuth();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState<LeaveRequest | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [newLeave, setNewLeave] = useState({
    employee_id: '',
    leave_type: 'casual',
    duration_type: 'full',
    start_date: '',
    end_date: '',
    reason: '',
  });

  const { data: leavesData, isLoading } = useLeaves();
  const { data: profilesData } = useProfiles();
  const createLeave = useCreateLeave();
  const updateLeave = useUpdateLeave();

  const leaveRequests: LeaveRequest[] = (leavesData || []).map((leave: any) => ({
    ...leave,
    userName: leave.profiles?.name || 'Unknown',
    duration_type: leave.duration_type || 'full',
  }));

  // Filter leaves by date
  const filteredLeaveRequests = useMemo(() => {
    if (!filterDate) return leaveRequests;
    const filterDateStr = format(filterDate, 'yyyy-MM-dd');
    return leaveRequests.filter(leave => {
      const start = leave.start_date;
      const end = leave.end_date;
      return start <= filterDateStr && end >= filterDateStr;
    });
  }, [leaveRequests, filterDate]);

  const calculateDays = (start: string, end: string, durationType: string) => {
    if (!start || !end) return 0;
    const totalDays = differenceInDays(new Date(end), new Date(start)) + 1;
    if (durationType === 'half') return totalDays * 0.5;
    return totalDays;
  };

  // Check for overlapping leaves
  const hasOverlappingLeave = (startDate: string, endDate: string, userId: string) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    return leaveRequests.some(leave => {
      if (leave.user_id !== userId || leave.status === 'rejected') return false;
      const leaveStart = parseISO(leave.start_date);
      const leaveEnd = parseISO(leave.end_date);
      
      return (
        (isAfter(start, leaveStart) || isEqual(start, leaveStart)) && (isBefore(start, leaveEnd) || isEqual(start, leaveEnd)) ||
        (isAfter(end, leaveStart) || isEqual(end, leaveStart)) && (isBefore(end, leaveEnd) || isEqual(end, leaveEnd)) ||
        (isBefore(start, leaveStart) || isEqual(start, leaveStart)) && (isAfter(end, leaveEnd) || isEqual(end, leaveEnd))
      );
    });
  };

  // Get used leave balance for a type
  const getUsedBalance = (leaveType: string, userId: string) => {
    return leaveRequests
      .filter(l => l.leave_type === leaveType && l.user_id === userId && l.status === 'approved')
      .reduce((sum, l) => sum + l.days, 0);
  };

  const getAvailableBalance = (leaveType: string, userId: string) => {
    const config = leaveBalanceConfig[leaveType];
    if (!config) return 0;
    if (config.unlimited) return Infinity;
    const used = getUsedBalance(leaveType, userId);
    return Math.max(0, config.total - used);
  };

  const handleApplyLeave = async () => {
    if (!newLeave.start_date || !newLeave.end_date || !newLeave.reason) {
      toast.error('Please fill all required fields');
      return;
    }

    const userId = newLeave.employee_id || user?.id;
    if (!userId) {
      toast.error('User not found');
      return;
    }

    const days = calculateDays(newLeave.start_date, newLeave.end_date, newLeave.duration_type);
    
    // Check for overlapping leaves
    if (hasOverlappingLeave(newLeave.start_date, newLeave.end_date, userId)) {
      toast.error('Leave dates overlap with existing leave');
      return;
    }

    // Check balance (skip for LWP)
    if (newLeave.leave_type !== 'lwp') {
      const available = getAvailableBalance(newLeave.leave_type, userId);
      if (days > available) {
        toast.error(`Insufficient balance. Available: ${available} days`);
        return;
      }
    }

    await createLeave.mutateAsync({
      leave_type: newLeave.leave_type,
      start_date: newLeave.start_date,
      end_date: newLeave.end_date,
      days,
      reason: newLeave.reason,
      duration_type: newLeave.duration_type,
      user_id: userId,
      applied_by: user?.id,
    });
    setShowApplyModal(false);
    resetForm();
  };

  const resetForm = () => {
    setNewLeave({ 
      employee_id: '', 
      leave_type: 'casual', 
      duration_type: 'full', 
      start_date: '', 
      end_date: '', 
      reason: '' 
    });
  };

  const handleApprove = async (id: string) => {
    await updateLeave.mutateAsync({ id, status: 'approved' });
  };

  const handleReject = async () => {
    if (!showRejectModal) return;
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    await updateLeave.mutateAsync({ 
      id: showRejectModal, 
      status: 'rejected',
      rejection_reason: rejectionReason 
    });
    setShowRejectModal(null);
    setRejectionReason('');
  };

  const getAppliedByName = (appliedBy: string | undefined, userId: string) => {
    if (!appliedBy) return 'Self';
    if (appliedBy === userId) return 'Self';
    const profile = profilesData?.find(p => p.id === appliedBy);
    return profile?.name || 'Admin';
  };

  const columns = [
    {
      key: 'id',
      header: 'Leave ID',
      render: (item: LeaveRequest) => (
        <button 
          onClick={() => setShowViewModal(item)}
          className="text-primary hover:underline font-medium"
        >
          {item.id.slice(0, 8).toUpperCase()}
        </button>
      ),
    },
    {
      key: 'userName',
      header: 'Employee Name',
      render: (item: LeaveRequest) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={16} className="text-primary" />
          </div>
          <span className="font-medium text-foreground">{item.userName}</span>
        </div>
      ),
    },
    {
      key: 'leave_type',
      header: 'Leave Type',
      render: (item: LeaveRequest) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${leaveTypeColors[item.leave_type] || 'bg-muted text-muted-foreground'}`}>
          {leaveTypeLabels[item.leave_type] || item.leave_type}
        </span>
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (item: LeaveRequest) => (
        <div>
          <p className="text-sm font-medium">{item.days} day(s)</p>
          <p className="text-xs text-muted-foreground capitalize">{item.duration_type || 'Full'}</p>
        </div>
      ),
    },
    {
      key: 'dates',
      header: 'From – To',
      render: (item: LeaveRequest) => (
        <div className="flex items-center gap-2">
          <CalendarIcon size={14} className="text-muted-foreground" />
          <span className="text-sm">{item.start_date} – {item.end_date}</span>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (item: LeaveRequest) => (
        <p className="text-sm max-w-[150px] truncate" title={item.reason}>{item.reason}</p>
      ),
    },
    {
      key: 'applied_by',
      header: 'Applied By',
      render: (item: LeaveRequest) => (
        <span className="text-sm">{getAppliedByName(item.applied_by, item.user_id)}</span>
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
            onClick={() => setShowViewModal(item)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="View"
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
                onClick={() => setShowRejectModal(item.id)}
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

  // Date-filtered stats
  const stats = useMemo(() => ({
    pending: filteredLeaveRequests.filter(l => l.status === 'pending').length,
    approved: filteredLeaveRequests.filter(l => l.status === 'approved').length,
    rejected: filteredLeaveRequests.filter(l => l.status === 'rejected').length,
  }), [filteredLeaveRequests]);

  const leaveDaysCount = useMemo(() => {
    return calculateDays(newLeave.start_date, newLeave.end_date, newLeave.duration_type);
  }, [newLeave.start_date, newLeave.end_date, newLeave.duration_type]);

  const availableBalance = useMemo(() => {
    const userId = newLeave.employee_id || user?.id;
    if (!userId) return 0;
    return getAvailableBalance(newLeave.leave_type, userId);
  }, [newLeave.leave_type, newLeave.employee_id, user?.id, leaveRequests]);

  // Get all leave balances for display
  const getAllBalances = (userId: string) => {
    return {
      casual: getAvailableBalance('casual', userId),
      sick: getAvailableBalance('sick', userId),
      privilege: getAvailableBalance('privilege', userId),
      lwp: Infinity,
    };
  };

  const currentUserId = newLeave.employee_id || user?.id || '';
  const allBalances = getAllBalances(currentUserId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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

      {/* Date Filter */}
      <div className="flex items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <button className={cn(
              "flex items-center gap-2 px-4 py-2 border border-border rounded-lg bg-card hover:bg-muted transition-colors",
              filterDate && "border-primary"
            )}>
              <Filter size={16} className="text-muted-foreground" />
              <span className="text-sm">
                {filterDate ? format(filterDate, 'PPP') : 'Filter by Date'}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filterDate}
              onSelect={setFilterDate}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        {filterDate && (
          <button 
            onClick={() => setFilterDate(undefined)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Clear filter
          </button>
        )}
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
              <p className="text-sm text-muted-foreground">Pending {filterDate && `(${format(filterDate, 'MMM d')})`}</p>
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
              <p className="text-sm text-muted-foreground">Approved {filterDate && `(${format(filterDate, 'MMM d')})`}</p>
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
              <p className="text-sm text-muted-foreground">Rejected {filterDate && `(${format(filterDate, 'MMM d')})`}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Leave Requests Table */}
      <DataTable
        data={filteredLeaveRequests}
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
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Apply for Leave</h2>
              <button onClick={() => { setShowApplyModal(false); resetForm(); }} className="p-2 hover:bg-muted rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              {/* Employee Dropdown (Admin only) */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Employee *</label>
                <select
                  value={newLeave.employee_id}
                  onChange={e => setNewLeave({ ...newLeave, employee_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Self (Current User)</option>
                  {profilesData?.map(profile => (
                    <option key={profile.id} value={profile.id}>{profile.name}</option>
                  ))}
                </select>
              </div>

              {/* Available Balance Display */}
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Available Leave Balance</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-info/10 rounded-lg">
                    <p className="text-lg font-bold text-info">{allBalances.casual}</p>
                    <p className="text-xs text-muted-foreground">CL</p>
                  </div>
                  <div className="p-2 bg-success/10 rounded-lg">
                    <p className="text-lg font-bold text-success">{allBalances.privilege}</p>
                    <p className="text-xs text-muted-foreground">PL</p>
                  </div>
                  <div className="p-2 bg-destructive/10 rounded-lg">
                    <p className="text-lg font-bold text-destructive">{allBalances.sick}</p>
                    <p className="text-xs text-muted-foreground">SL</p>
                  </div>
                  <div className="p-2 bg-warning/10 rounded-lg">
                    <p className="text-lg font-bold text-warning">∞</p>
                    <p className="text-xs text-muted-foreground">LWP</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Leave Type *</label>
                  <select
                    value={newLeave.leave_type}
                    onChange={e => setNewLeave({ ...newLeave, leave_type: e.target.value })}
                    className="input-field"
                  >
                    <option value="casual">Casual Leave (CL)</option>
                    <option value="sick">Sick Leave (SL)</option>
                    <option value="privilege">Privilege Leave (PL)</option>
                    <option value="lwp">Leave Without Pay (LWP)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Duration Type *</label>
                  <select
                    value={newLeave.duration_type}
                    onChange={e => setNewLeave({ ...newLeave, duration_type: e.target.value })}
                    className="input-field"
                  >
                    <option value="full">Full Day</option>
                    <option value="half">Half Day</option>
                  </select>
                </div>
              </div>

              {/* Date Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">From Date *</label>
                  <input
                    type="date"
                    value={newLeave.start_date}
                    onChange={e => setNewLeave({ ...newLeave, start_date: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">To Date *</label>
                  <input
                    type="date"
                    value={newLeave.end_date}
                    onChange={e => setNewLeave({ ...newLeave, end_date: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Readonly Info */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Selected Type Balance</p>
                  <p className="text-lg font-semibold text-foreground">
                    {newLeave.leave_type === 'lwp' ? '∞ (Unlimited)' : `${availableBalance} days`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Leave Days Count</p>
                  <p className={`text-lg font-semibold ${newLeave.leave_type !== 'lwp' && leaveDaysCount > availableBalance ? 'text-destructive' : 'text-foreground'}`}>
                    {leaveDaysCount} day(s)
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Reason *</label>
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
              <button onClick={() => { setShowApplyModal(false); resetForm(); }} className="btn-outline">Cancel</button>
              <button 
                onClick={handleApplyLeave} 
                disabled={createLeave.isPending || (newLeave.leave_type !== 'lwp' && leaveDaysCount > availableBalance)}
                className="btn-primary"
              >
                {createLeave.isPending ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Leave Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Leave Details</h2>
              <button onClick={() => setShowViewModal(null)} className="p-2 hover:bg-muted rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User size={24} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{showViewModal.userName}</p>
                  <p className="text-sm text-muted-foreground">Leave ID: {showViewModal.id.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Leave Type</p>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${leaveTypeColors[showViewModal.leave_type]}`}>
                    {leaveTypeLabels[showViewModal.leave_type]}
                  </span>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration Type</p>
                  <p className="font-medium capitalize">{showViewModal.duration_type || 'Full'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">From</p>
                  <p className="font-medium">{showViewModal.start_date}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">To</p>
                  <p className="font-medium">{showViewModal.end_date}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Days</p>
                  <p className="font-medium">{showViewModal.days} day(s)</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <StatusBadge status={showViewModal.status} />
                </div>
              </div>
              
              <div>
                <p className="text-muted-foreground text-sm">Reason</p>
                <p className="font-medium">{showViewModal.reason}</p>
              </div>

              {showViewModal.status === 'rejected' && showViewModal.rejection_reason && (
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Rejection Reason</p>
                  <p className="text-sm text-destructive font-medium">{showViewModal.rejection_reason}</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end mt-6">
              <button onClick={() => setShowViewModal(null)} className="btn-outline">Close</button>
            </div>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Reject Leave Request</h2>
              <button onClick={() => { setShowRejectModal(null); setRejectionReason(''); }} className="p-2 hover:bg-muted rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Rejection Reason *</label>
                <textarea
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => { setShowRejectModal(null); setRejectionReason(''); }} className="btn-outline">Cancel</button>
              <button 
                onClick={handleReject} 
                disabled={updateLeave.isPending || !rejectionReason.trim()}
                className="btn-primary bg-destructive hover:bg-destructive/90"
              >
                {updateLeave.isPending ? 'Rejecting...' : 'Reject Leave'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
