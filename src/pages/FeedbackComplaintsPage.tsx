import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CrudModal, FieldConfig } from '@/components/ui/CrudModal';
import {
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Send,
  Eye,
  X,
  Filter,
  ThumbsUp,
  ThumbsDown,
  User,
  Store,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

type ComplaintStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type ComplaintType = 'complaint' | 'feedback' | 'suggestion' | 'query';
type Priority = 'low' | 'medium' | 'high' | 'critical';

interface Complaint {
  id: string;
  ticketId: string;
  type: ComplaintType;
  priority: Priority;
  subject: string;
  description: string;
  source: 'retailer' | 'distributor' | 'employee';
  sourceName: string;
  sourceId: string;
  status: ComplaintStatus;
  assignedTo?: string;
  response?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

const initialData: Complaint[] = [
  {
    id: '1',
    ticketId: 'TKT-2024-001',
    type: 'complaint',
    priority: 'high',
    subject: 'Delayed delivery of order',
    description: 'Order ORD-2024-156 was supposed to be delivered 3 days ago but still not received.',
    source: 'retailer',
    sourceName: 'New Sharma Store',
    sourceId: 'r-001',
    status: 'open',
    createdAt: '2024-12-08',
    updatedAt: '2024-12-08',
  },
  {
    id: '2',
    ticketId: 'TKT-2024-002',
    type: 'feedback',
    priority: 'medium',
    subject: 'Great product quality',
    description: 'The new product line has excellent quality. Customers are very happy.',
    source: 'distributor',
    sourceName: 'Krishna Traders',
    sourceId: 'd-001',
    status: 'resolved',
    response: 'Thank you for your positive feedback! We are glad to hear about your experience.',
    createdAt: '2024-12-07',
    updatedAt: '2024-12-07',
    resolvedAt: '2024-12-07',
  },
  {
    id: '3',
    ticketId: 'TKT-2024-003',
    type: 'suggestion',
    priority: 'low',
    subject: 'New packaging suggestion',
    description: 'Suggest to add QR code on packaging for easy reorder.',
    source: 'retailer',
    sourceName: 'Gupta General Store',
    sourceId: 'r-002',
    status: 'in_progress',
    assignedTo: 'Product Team',
    createdAt: '2024-12-06',
    updatedAt: '2024-12-08',
  },
  {
    id: '4',
    ticketId: 'TKT-2024-004',
    type: 'complaint',
    priority: 'critical',
    subject: 'Damaged products received',
    description: 'Received 10 damaged bottles in the last shipment. Need immediate replacement.',
    source: 'distributor',
    sourceName: 'Sharma Distributors',
    sourceId: 'd-002',
    status: 'in_progress',
    assignedTo: 'Logistics Team',
    createdAt: '2024-12-05',
    updatedAt: '2024-12-06',
  },
  {
    id: '5',
    ticketId: 'TKT-2024-005',
    type: 'query',
    priority: 'medium',
    subject: 'Scheme eligibility query',
    description: 'Need clarification on Summer Sale scheme eligibility criteria.',
    source: 'retailer',
    sourceName: 'Jain Provision Store',
    sourceId: 'r-003',
    status: 'closed',
    response: 'The Summer Sale scheme applies to orders above ₹10,000. You are eligible.',
    createdAt: '2024-12-04',
    updatedAt: '2024-12-05',
    resolvedAt: '2024-12-05',
  },
];

const typeConfig: Record<ComplaintType, { label: string; color: string; icon: React.ElementType }> = {
  complaint: { label: 'Complaint', color: 'bg-destructive/10 text-destructive', icon: AlertTriangle },
  feedback: { label: 'Feedback', color: 'bg-success/10 text-success', icon: ThumbsUp },
  suggestion: { label: 'Suggestion', color: 'bg-info/10 text-info', icon: MessageSquare },
  query: { label: 'Query', color: 'bg-warning/10 text-warning', icon: MessageSquare },
};

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-muted text-muted-foreground' },
  medium: { label: 'Medium', color: 'bg-warning/10 text-warning' },
  high: { label: 'High', color: 'bg-destructive/10 text-destructive' },
  critical: { label: 'Critical', color: 'bg-destructive text-destructive-foreground' },
};

const statusConfig: Record<ComplaintStatus, { label: string; color: string; icon: React.ElementType }> = {
  open: { label: 'Open', color: 'bg-info/10 text-info', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-warning/10 text-warning', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-success/10 text-success', icon: CheckCircle },
  closed: { label: 'Closed', color: 'bg-muted text-muted-foreground', icon: CheckCircle },
};

export default function FeedbackComplaintsPage() {
  const [data, setData] = useState<Complaint[]>(initialData);
  const [selectedItem, setSelectedItem] = useState<Complaint | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredData = data.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    return true;
  });

  const stats = {
    total: data.length,
    open: data.filter(c => c.status === 'open').length,
    inProgress: data.filter(c => c.status === 'in_progress').length,
    resolved: data.filter(c => c.status === 'resolved' || c.status === 'closed').length,
    critical: data.filter(c => c.priority === 'critical' && c.status !== 'resolved' && c.status !== 'closed').length,
  };

  const handleView = (item: Complaint) => {
    setSelectedItem(item);
  };

  const handleRespond = (item: Complaint) => {
    setSelectedItem(item);
    setResponseText(item.response || '');
    setShowResponseModal(true);
  };

  const handleSubmitResponse = () => {
    if (!responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }
    
    setData(data.map(item => 
      item.id === selectedItem?.id 
        ? { ...item, response: responseText, status: 'resolved' as ComplaintStatus, updatedAt: new Date().toISOString().split('T')[0], resolvedAt: new Date().toISOString().split('T')[0] }
        : item
    ));
    toast.success('Response submitted successfully');
    setShowResponseModal(false);
    setSelectedItem(null);
    setResponseText('');
  };

  const handleChangeStatus = (item: Complaint, newStatus: ComplaintStatus) => {
    setData(data.map(c => 
      c.id === item.id 
        ? { ...c, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
        : c
    ));
    toast.success(`Status changed to ${statusConfig[newStatus].label}`);
  };

  const columns = [
    {
      key: 'ticketId',
      header: 'Ticket',
      render: (item: Complaint) => {
        const TypeIcon = typeConfig[item.type].icon;
        return (
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${typeConfig[item.type].color}`}>
              <TypeIcon size={18} />
            </div>
            <div>
              <p className="font-medium text-foreground">{item.ticketId}</p>
              <span className={`px-2 py-0.5 rounded text-xs ${typeConfig[item.type].color}`}>
                {typeConfig[item.type].label}
              </span>
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'subject',
      header: 'Subject',
      render: (item: Complaint) => (
        <div className="max-w-[250px]">
          <p className="font-medium text-foreground truncate">{item.subject}</p>
          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
        </div>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      render: (item: Complaint) => (
        <div className="flex items-center gap-2">
          {item.source === 'retailer' ? <Store size={14} className="text-muted-foreground" /> : <User size={14} className="text-muted-foreground" />}
          <div>
            <p className="text-sm">{item.sourceName}</p>
            <p className="text-xs text-muted-foreground capitalize">{item.source}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (item: Complaint) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${priorityConfig[item.priority].color}`}>
          {priorityConfig[item.priority].label}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Complaint) => {
        const StatusIcon = statusConfig[item.status].icon;
        return (
          <div className="flex items-center gap-1">
            <StatusIcon size={14} />
            <span className={`px-2 py-0.5 rounded text-xs ${statusConfig[item.status].color}`}>
              {statusConfig[item.status].label}
            </span>
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (item: Complaint) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar size={14} />
          {item.createdAt}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Complaint) => (
        <div className="flex items-center gap-1">
          <button onClick={() => handleView(item)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Eye size={16} className="text-muted-foreground" />
          </button>
          {item.status !== 'resolved' && item.status !== 'closed' && (
            <button onClick={() => handleRespond(item)} className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
              <Send size={16} className="text-primary" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Feedback & Complaints</h1>
          <p className="text-muted-foreground">Manage customer feedback, complaints, and queries</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10"><MessageSquare size={24} className="text-primary" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Tickets</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card cursor-pointer" onClick={() => setStatusFilter(statusFilter === 'open' ? 'all' : 'open')}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-info/10"><Clock size={24} className="text-info" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.open}</p>
              <p className="text-sm text-muted-foreground">Open</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card cursor-pointer" onClick={() => setStatusFilter(statusFilter === 'in_progress' ? 'all' : 'in_progress')}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10"><Clock size={24} className="text-warning" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10"><CheckCircle size={24} className="text-success" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.resolved}</p>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/10"><AlertTriangle size={24} className="text-destructive" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.critical}</p>
              <p className="text-sm text-muted-foreground">Critical</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted-foreground" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-40">
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field w-40">
            <option value="all">All Types</option>
            <option value="complaint">Complaints</option>
            <option value="feedback">Feedback</option>
            <option value="suggestion">Suggestions</option>
            <option value="query">Queries</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable data={filteredData} columns={columns} searchPlaceholder="Search tickets..." />

      {/* View Detail Modal */}
      {selectedItem && !showResponseModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">{selectedItem.ticketId}</h2>
              <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-muted rounded-lg"><X size={20} /></button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeConfig[selectedItem.type].color}`}>{typeConfig[selectedItem.type].label}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${priorityConfig[selectedItem.priority].color}`}>{priorityConfig[selectedItem.priority].label}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[selectedItem.status].color}`}>{statusConfig[selectedItem.status].label}</span>
              </div>

              <div>
                <h3 className="font-semibold text-foreground">{selectedItem.subject}</h3>
                <p className="text-sm text-muted-foreground mt-1">{selectedItem.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Source</p>
                  <p className="font-medium">{selectedItem.sourceName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{selectedItem.source}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="font-medium">{selectedItem.createdAt}</p>
                </div>
                {selectedItem.assignedTo && (
                  <div>
                    <p className="text-xs text-muted-foreground">Assigned To</p>
                    <p className="font-medium">{selectedItem.assignedTo}</p>
                  </div>
                )}
              </div>

              {selectedItem.response && (
                <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                  <p className="text-xs text-success font-medium mb-1">Response</p>
                  <p className="text-sm">{selectedItem.response}</p>
                  {selectedItem.resolvedAt && (
                    <p className="text-xs text-muted-foreground mt-2">Resolved on {selectedItem.resolvedAt}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setSelectedItem(null)} className="btn-outline">Close</button>
              {selectedItem.status !== 'resolved' && selectedItem.status !== 'closed' && (
                <button onClick={() => { setShowResponseModal(true); setResponseText(selectedItem.response || ''); }} className="btn-primary flex items-center gap-2">
                  <Send size={16} /> Respond
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedItem && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Respond to {selectedItem.ticketId}</h2>
              <button onClick={() => { setShowResponseModal(false); setSelectedItem(null); }} className="p-2 hover:bg-muted rounded-lg"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="font-medium text-foreground">{selectedItem.subject}</p>
                <p className="text-sm text-muted-foreground mt-1">{selectedItem.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Your Response *</label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Enter your response to this ticket..."
                  className="input-field min-h-[150px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => { setShowResponseModal(false); setSelectedItem(null); }} className="btn-outline">Cancel</button>
              <button onClick={handleSubmitResponse} className="btn-primary flex items-center gap-2">
                <Send size={16} /> Submit Response
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
