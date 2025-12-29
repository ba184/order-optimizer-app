import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GeoFilter } from '@/components/ui/GeoFilter';
import { GeoFilter as GeoFilterType } from '@/data/geoData';
import { useAttendance } from '@/hooks/useSalesTeamData';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  Navigation,
  Loader2,
  Users,
  Route,
  ShoppingCart,
  Package,
  ThumbsUp,
  ThumbsDown,
  X,
  Download,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

interface AttendanceRecord {
  id: string;
  user_id: string;
  userName: string;
  date: string;
  punchInDate: string;
  punchInTime: string;
  loginTime: string;
  logoutTime: string | null;
  loginLocation: any;
  loginLocationAddress: string;
  totalDistance: number;
  visitCount: number;
  ordersPlaced: number;
  orderValue: number;
  preOrderValue: number;
  status: 'active' | 'inactive';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  punchInImage: string | null;
  zone: string;
  city: string;
  state: string;
}

export default function AttendancePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [geoFilter, setGeoFilter] = useState<GeoFilterType>({ country: 'India' });
  const [showImageModal, setShowImageModal] = useState<string | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState<{ record: AttendanceRecord; action: 'approve' | 'reject' } | null>(null);
  const [remarks, setRemarks] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('');
  
  const { data: attendanceData, isLoading } = useAttendance(selectedDate);

  // Transform data for display
  const transformedData: AttendanceRecord[] = (attendanceData || []).map((att: any) => ({
    id: att.id,
    user_id: att.user_id,
    userName: att.profiles?.name || 'Unknown',
    date: att.date,
    punchInDate: att.date ? format(new Date(att.date), 'dd-MM-yyyy') : '--',
    punchInTime: att.login_time ? format(new Date(att.login_time), 'hh:mm a') : '--',
    loginTime: att.login_time ? format(new Date(att.login_time), 'hh:mm a') : '--',
    logoutTime: att.logout_time ? format(new Date(att.logout_time), 'hh:mm a') : null,
    loginLocation: att.login_location,
    loginLocationAddress: att.login_location?.address || '--',
    totalDistance: att.total_distance || 0,
    visitCount: att.visit_count || 0,
    ordersPlaced: att.orders_placed || 0,
    orderValue: 0, // Would come from joined orders data
    preOrderValue: 0, // Would come from joined pre-orders data
    status: att.status === 'present' ? 'active' : 'inactive',
    approvalStatus: att.status === 'present' ? 'approved' : att.status === 'absent' ? 'rejected' : 'pending',
    punchInImage: att.login_selfie || null,
    zone: att.profiles?.region || 'N/A',
    city: att.profiles?.territory || 'N/A',
    state: 'N/A',
  }));

  const filteredAttendance = transformedData.filter(att => {
    if (geoFilter.zone && att.zone !== geoFilter.zone) return false;
    if (geoFilter.city && att.city !== geoFilter.city) return false;
    if (geoFilter.state && att.state !== geoFilter.state) return false;
    if (statusFilter !== 'all' && att.status !== statusFilter) return false;
    if (employeeFilter && !att.userName.toLowerCase().includes(employeeFilter.toLowerCase())) return false;
    return true;
  });

  const stats = {
    present: filteredAttendance.filter(a => a.status === 'active').length,
    absent: filteredAttendance.filter(a => a.status === 'inactive').length,
    onField: filteredAttendance.filter(a => a.status === 'active' && !a.logoutTime).length,
    totalVisits: filteredAttendance.reduce((sum, a) => sum + a.visitCount, 0),
    totalOrderValue: filteredAttendance.reduce((sum, a) => sum + a.orderValue, 0),
    totalPreOrderValue: filteredAttendance.reduce((sum, a) => sum + a.preOrderValue, 0),
    totalDistance: filteredAttendance.reduce((sum, a) => sum + a.totalDistance, 0),
  };

  const updateAttendanceMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('attendance')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Attendance status updated');
      setShowApprovalModal(null);
      setRemarks('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update attendance');
    },
  });

  const handleApproval = async () => {
    if (!showApprovalModal) return;
    const newStatus = showApprovalModal.action === 'approve' ? 'present' : 'absent';
    await updateAttendanceMutation.mutateAsync({
      id: showApprovalModal.record.id,
      status: newStatus,
    });
  };

  const exportToCSV = () => {
    const headers = ['Sales Executive', 'Punch-in Date', 'Punch-in Time', 'Login Time', 'Distance (KM)', 'Visits', 'Order Value', 'Pre-Order Value', 'Status', 'Approval Status'];
    const rows = filteredAttendance.map(a => [
      a.userName,
      a.punchInDate,
      a.punchInTime,
      a.loginTime,
      a.totalDistance,
      a.visitCount,
      a.orderValue,
      a.preOrderValue,
      a.status,
      a.approvalStatus,
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Exported to CSV');
  };

  const columns = [
    {
      key: 'userName',
      header: 'Sales Executive Name',
      render: (item: AttendanceRecord) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">
              {item.userName.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="font-medium text-foreground">{item.userName}</p>
            <p className="text-xs text-muted-foreground">{item.zone} • {item.city}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'punchInImage',
      header: 'Punch-in Image',
      render: (item: AttendanceRecord) => (
        item.punchInImage ? (
          <button
            onClick={() => setShowImageModal(item.punchInImage)}
            className="w-10 h-10 rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
          >
            <img src={item.punchInImage} alt="Punch-in" className="w-full h-full object-cover" />
          </button>
        ) : (
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <ImageIcon size={16} className="text-muted-foreground" />
          </div>
        )
      ),
    },
    {
      key: 'punchInDate',
      header: 'Punch-in Date',
      render: (item: AttendanceRecord) => (
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-muted-foreground" />
          <span>{item.punchInDate}</span>
        </div>
      ),
    },
    {
      key: 'punchInTime',
      header: 'Punch-in Time',
      render: (item: AttendanceRecord) => (
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-muted-foreground" />
          <span>{item.punchInTime}</span>
        </div>
      ),
    },
    {
      key: 'loginTime',
      header: 'Login Time',
      render: (item: AttendanceRecord) => (
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-muted-foreground" />
          <span>{item.loginTime}</span>
        </div>
      ),
    },
    {
      key: 'loginLocation',
      header: 'Real-Time Location',
      render: (item: AttendanceRecord) => (
        <button
          onClick={() => {
            if (item.loginLocation?.lat && item.loginLocation?.lng) {
              window.open(`https://maps.google.com/?q=${item.loginLocation.lat},${item.loginLocation.lng}`, '_blank');
            }
          }}
          className="flex items-center gap-2 text-primary hover:underline"
          disabled={!item.loginLocation?.lat}
        >
          <MapPin size={14} />
          <span className="truncate max-w-[150px]">{item.loginLocationAddress}</span>
          {item.loginLocation?.lat && <ExternalLink size={12} />}
        </button>
      ),
    },
    {
      key: 'totalDistance',
      header: 'Distance Covered',
      render: (item: AttendanceRecord) => (
        <span className="font-medium">{item.totalDistance > 0 ? `${item.totalDistance.toFixed(1)} KM` : '--'}</span>
      ),
      sortable: true,
    },
    { 
      key: 'visitCount', 
      header: 'Number of Visits', 
      sortable: true,
      render: (item: AttendanceRecord) => (
        <span className="font-medium">{item.visitCount}</span>
      ),
    },
    {
      key: 'orderValue',
      header: 'Order Value',
      render: (item: AttendanceRecord) => (
        <span className="font-medium">₹{item.orderValue.toLocaleString()}</span>
      ),
      sortable: true,
    },
    {
      key: 'preOrderValue',
      header: 'Pre-Order Value',
      render: (item: AttendanceRecord) => (
        <span className="font-medium">₹{item.preOrderValue.toLocaleString()}</span>
      ),
      sortable: true,
    },
    {
      key: 'liveTracking',
      header: 'Live Tracking',
      render: (item: AttendanceRecord) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate('/sales-team/tracking')}
          className="flex items-center gap-1"
        >
          <Navigation size={14} />
          Track
        </Button>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: AttendanceRecord) => (
        <StatusBadge status={item.status} />
      ),
    },
    {
      key: 'approvalStatus',
      header: 'Approval Status',
      render: (item: AttendanceRecord) => (
        <StatusBadge status={item.approvalStatus} />
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      render: (item: AttendanceRecord) => (
        <div className="flex items-center gap-1">
          {item.approvalStatus === 'pending' && (
            <>
              <button 
                onClick={() => setShowApprovalModal({ record: item, action: 'approve' })} 
                className="p-2 hover:bg-success/10 rounded-lg transition-colors"
                title="Approve"
              >
                <ThumbsUp size={16} className="text-success" />
              </button>
              <button 
                onClick={() => setShowApprovalModal({ record: item, action: 'reject' })} 
                className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                title="Reject"
              >
                <ThumbsDown size={16} className="text-destructive" />
              </button>
            </>
          )}
          <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="View Details">
            <Eye size={16} className="text-muted-foreground" />
          </button>
        </div>
      ),
    },
  ];

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
          <h1 className="module-title">Attendance Management</h1>
          <p className="text-muted-foreground">Monitor team attendance with geo-fenced login/logout and approval workflow</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="input-field pl-10 pr-4"
            />
          </div>
          <Button variant="outline" onClick={exportToCSV} className="flex items-center gap-2">
            <Download size={16} />
            Export
          </Button>
          <button 
            onClick={() => navigate('/sales-team/tracking')}
            className="btn-primary flex items-center gap-2"
          >
            <Navigation size={18} />
            Live Tracking
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <GeoFilter value={geoFilter} onChange={setGeoFilter} />
        <input
          type="text"
          placeholder="Search by employee name..."
          value={employeeFilter}
          onChange={(e) => setEmployeeFilter(e.target.value)}
          className="input-field"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Stats - 7 Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <CheckCircle size={24} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.present}</p>
              <p className="text-sm text-muted-foreground">Total Present</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/10">
              <XCircle size={24} className="text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.absent}</p>
              <p className="text-sm text-muted-foreground">Total Absent</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-info/10">
              <MapPin size={24} className="text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.onField}</p>
              <p className="text-sm text-muted-foreground">Total On Field</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Users size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalVisits}</p>
              <p className="text-sm text-muted-foreground">Total Visits</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <ShoppingCart size={24} className="text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">₹{stats.totalOrderValue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Order Value</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10">
              <Package size={24} className="text-secondary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">₹{stats.totalPreOrderValue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Pre-Order Value</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-muted">
              <Route size={24} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalDistance.toFixed(0)} KM</p>
              <p className="text-sm text-muted-foreground">Distance Covered</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Data Table */}
      <DataTable 
        data={filteredAttendance} 
        columns={columns} 
        searchPlaceholder="Search by name, location..." 
        emptyMessage="No attendance records found for this date"
      />

      {/* Image Preview Modal */}
      <AnimatePresence>
        {showImageModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-xl border border-border shadow-xl w-full max-w-lg p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Punch-in Image</h2>
                <button onClick={() => setShowImageModal(null)} className="p-2 hover:bg-muted rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <img src={showImageModal} alt="Punch-in" className="w-full h-auto rounded-lg" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Approval Modal */}
      <AnimatePresence>
        {showApprovalModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-xl border border-border shadow-xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  {showApprovalModal.action === 'approve' ? 'Approve' : 'Reject'} Attendance
                </h2>
                <button onClick={() => setShowApprovalModal(null)} className="p-2 hover:bg-muted rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <p className="text-muted-foreground mb-4">
                Are you sure you want to {showApprovalModal.action} the attendance for{' '}
                <span className="font-medium text-foreground">{showApprovalModal.record.userName}</span>?
              </p>

              {showApprovalModal.action === 'reject' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Rejection Reason</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Please provide a reason for rejection..."
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 mt-6">
                <button onClick={() => setShowApprovalModal(null)} className="btn-outline">Cancel</button>
                <button 
                  onClick={handleApproval}
                  disabled={updateAttendanceMutation.isPending}
                  className={showApprovalModal.action === 'approve' ? 'btn-primary' : 'btn-destructive'}
                >
                  {updateAttendanceMutation.isPending ? 'Processing...' : showApprovalModal.action === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
