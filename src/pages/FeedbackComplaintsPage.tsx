import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import {
  useFeedbackTickets,
  useAcceptTicket,
  useRejectTicket,
  FeedbackTicket,
  TicketStatus,
  TicketType,
  TicketPriority,
  TicketSource,
} from '@/hooks/useFeedbackData';
import {
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  X,
  Filter,
  ThumbsUp,
  Smartphone,
  MapPin,
  Calendar,
  Loader2,
  XCircle,
  Package,
} from 'lucide-react';
import { format } from 'date-fns';

const typeConfig: Record<TicketType, { label: string; color: string; icon: React.ElementType }> = {
  general: { label: 'General', color: 'bg-info/10 text-info', icon: MessageSquare },
  product_related: { label: 'Product Related', color: 'bg-primary/10 text-primary', icon: Package },
  complaint: { label: 'Complaint', color: 'bg-destructive/10 text-destructive', icon: AlertTriangle },
};

const priorityConfig: Record<TicketPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-muted text-muted-foreground' },
  medium: { label: 'Medium', color: 'bg-warning/10 text-warning' },
  high: { label: 'High', color: 'bg-destructive/10 text-destructive' },
};

const sourceConfig: Record<TicketSource, { label: string; icon: React.ElementType }> = {
  mobile_app: { label: 'Mobile App', icon: Smartphone },
  field_visit: { label: 'Field Visit', icon: MapPin },
};

const statusConfig: Record<TicketStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-warning/10 text-warning', icon: Clock },
  accepted: { label: 'Accepted', color: 'bg-success/10 text-success', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-destructive/10 text-destructive', icon: XCircle },
};

export default function FeedbackComplaintsPage() {
  const { data: tickets = [], isLoading } = useFeedbackTickets();
  const acceptTicket = useAcceptTicket();
  const rejectTicket = useRejectTicket();

  const [selectedItem, setSelectedItem] = useState<FeedbackTicket | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredData = tickets.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
    return true;
  });

  const stats = {
    total: tickets.length,
    pending: tickets.filter(c => c.status === 'pending').length,
    accepted: tickets.filter(c => c.status === 'accepted').length,
    rejected: tickets.filter(c => c.status === 'rejected').length,
  };

  const handleView = (item: FeedbackTicket) => {
    setSelectedItem(item);
  };

  const handleAccept = async (item: FeedbackTicket) => {
    await acceptTicket.mutateAsync(item.id);
  };

  const handleRejectClick = (item: FeedbackTicket) => {
    setSelectedItem(item);
    setShowRejectModal(true);
    setRejectionReason('');
  };

  const handleRejectSubmit = async () => {
    if (!selectedItem || !rejectionReason.trim()) return;
    await rejectTicket.mutateAsync({ id: selectedItem.id, rejection_reason: rejectionReason });
    setShowRejectModal(false);
    setSelectedItem(null);
    setRejectionReason('');
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return dateString;
    }
  };

  const columns = [
    {
      key: 'ticket_number',
      header: 'Ticket ID',
      render: (item: FeedbackTicket) => (
        <p className="font-medium text-foreground">{item.ticket_number}</p>
      ),
      sortable: true,
    },
    {
      key: 'subject',
      header: 'Subject',
      render: (item: FeedbackTicket) => (
        <div className="max-w-[200px]">
          <p className="font-medium text-foreground truncate">{item.subject}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Feedback Type',
      render: (item: FeedbackTicket) => {
        const config = typeConfig[item.type] || typeConfig.general;
        const TypeIcon = config.icon;
        return (
          <div className="flex items-center gap-2">
            <TypeIcon size={14} />
            <span className={`px-2 py-0.5 rounded text-xs ${config.color}`}>
              {config.label}
            </span>
          </div>
        );
      },
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (item: FeedbackTicket) => {
        const config = priorityConfig[item.priority] || priorityConfig.medium;
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
        );
      },
      sortable: true,
    },
    {
      key: 'source',
      header: 'Source',
      render: (item: FeedbackTicket) => {
        const config = sourceConfig[item.source] || sourceConfig.mobile_app;
        const SourceIcon = config.icon;
        return (
          <div className="flex items-center gap-2">
            <SourceIcon size={14} className="text-muted-foreground" />
            <span className="text-sm">{config.label}</span>
          </div>
        );
      },
    },
    {
      key: 'source_name',
      header: 'Submitted By',
      render: (item: FeedbackTicket) => (
        <p className="text-sm text-foreground">{item.source_name}</p>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (item: FeedbackTicket) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar size={14} />
          {formatDate(item.created_at)}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: FeedbackTicket) => {
        const config = statusConfig[item.status] || statusConfig.pending;
        const StatusIcon = config.icon;
        return (
          <div className="flex items-center gap-1">
            <StatusIcon size={14} />
            <span className={`px-2 py-0.5 rounded text-xs ${config.color}`}>
              {config.label}
            </span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: FeedbackTicket) => (
        <div className="flex items-center gap-1">
          <button onClick={() => handleView(item)} className="p-2 hover:bg-muted rounded-lg transition-colors" title="View">
            <Eye size={16} className="text-muted-foreground" />
          </button>
          {item.status === 'pending' && (
            <>
              <button onClick={() => handleAccept(item)} className="p-2 hover:bg-success/10 rounded-lg transition-colors" title="Accept">
                <CheckCircle size={16} className="text-success" />
              </button>
              <button onClick={() => handleRejectClick(item)} className="p-2 hover:bg-destructive/10 rounded-lg transition-colors" title="Reject">
                <XCircle size={16} className="text-destructive" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

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
          <h1 className="module-title">Feedback Management</h1>
          <p className="text-muted-foreground">Manage customer feedback and complaints</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10"><MessageSquare size={24} className="text-primary" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card cursor-pointer" onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10"><Clock size={24} className="text-warning" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card cursor-pointer" onClick={() => setStatusFilter(statusFilter === 'accepted' ? 'all' : 'accepted')}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10"><CheckCircle size={24} className="text-success" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.accepted}</p>
              <p className="text-sm text-muted-foreground">Accepted</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card cursor-pointer" onClick={() => setStatusFilter(statusFilter === 'rejected' ? 'all' : 'rejected')}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/10"><XCircle size={24} className="text-destructive" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.rejected}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={16} className="text-muted-foreground" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-36">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field w-40">
            <option value="all">All Types</option>
            <option value="general">General</option>
            <option value="product_related">Product Related</option>
            <option value="complaint">Complaint</option>
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="input-field w-36">
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable 
        data={filteredData} 
        columns={columns} 
        searchPlaceholder="Search feedback..."
        emptyMessage="No feedback found."
      />

      {/* View Detail Modal */}
      {selectedItem && !showRejectModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">{selectedItem.ticket_number}</h2>
              <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-muted rounded-lg"><X size={20} /></button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeConfig[selectedItem.type]?.color || 'bg-muted'}`}>
                  {typeConfig[selectedItem.type]?.label || selectedItem.type}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${priorityConfig[selectedItem.priority]?.color || 'bg-muted'}`}>
                  {priorityConfig[selectedItem.priority]?.label || selectedItem.priority}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[selectedItem.status]?.color || 'bg-muted'}`}>
                  {statusConfig[selectedItem.status]?.label || selectedItem.status}
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-foreground">{selectedItem.subject}</h3>
                <p className="text-sm text-muted-foreground mt-1">{selectedItem.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Source</p>
                  <p className="font-medium">{sourceConfig[selectedItem.source]?.label || selectedItem.source}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Submitted By</p>
                  <p className="font-medium">{selectedItem.source_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Submitted Date</p>
                  <p className="font-medium">{formatDate(selectedItem.created_at)}</p>
                </div>
              </div>

              {selectedItem.rejection_reason && (
                <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <p className="text-xs text-destructive font-medium mb-1">Rejection Reason</p>
                  <p className="text-sm">{selectedItem.rejection_reason}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setSelectedItem(null)} className="btn-outline">Close</button>
              {selectedItem.status === 'pending' && (
                <>
                  <button onClick={() => handleAccept(selectedItem)} className="btn-primary flex items-center gap-2">
                    <CheckCircle size={16} /> Accept
                  </button>
                  <button onClick={() => { setShowRejectModal(true); setRejectionReason(''); }} className="btn-outline text-destructive flex items-center gap-2">
                    <XCircle size={16} /> Reject
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedItem && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Reject Feedback</h2>
              <button onClick={() => { setShowRejectModal(false); setSelectedItem(null); }} className="p-2 hover:bg-muted rounded-lg"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <p className="text-muted-foreground">
                Please provide a reason for rejecting: <span className="font-medium text-foreground">{selectedItem.ticket_number}</span>
              </p>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Rejection Reason *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  className="input-field min-h-[120px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => { setShowRejectModal(false); setSelectedItem(null); }} className="btn-outline">Cancel</button>
              <button 
                onClick={handleRejectSubmit}
                disabled={rejectTicket.isPending || !rejectionReason.trim()}
                className="btn-primary bg-destructive hover:bg-destructive/90 flex items-center gap-2"
              >
                {rejectTicket.isPending ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                Reject
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
