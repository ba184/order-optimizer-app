import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Package,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
  Filter,
  Plus,
  Camera,
  Upload,
  Truck,
  Calendar,
  IndianRupee,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'refunded';
type ReturnType = 'return' | 'damage' | 'expiry' | 'wrong_product';
type ReturnReason = 'damaged_in_transit' | 'manufacturing_defect' | 'expired' | 'wrong_item' | 'quality_issue' | 'customer_return';

interface ReturnItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  reason: ReturnReason;
}

interface ReturnRequest {
  id: string;
  returnId: string;
  type: ReturnType;
  source: 'retailer' | 'distributor';
  sourceName: string;
  sourceId: string;
  orderId?: string;
  items: ReturnItem[];
  totalValue: number;
  status: ReturnStatus;
  reason: string;
  images: string[];
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
}

const initialData: ReturnRequest[] = [
  {
    id: '1',
    returnId: 'RET-2024-001',
    type: 'damage',
    source: 'distributor',
    sourceName: 'Krishna Traders',
    sourceId: 'd-001',
    orderId: 'ORD-2024-156',
    items: [
      { productId: 'p-001', productName: 'Product Alpha 500ml', sku: 'PA-500', quantity: 10, unitPrice: 120, reason: 'damaged_in_transit' },
    ],
    totalValue: 1200,
    status: 'pending',
    reason: 'Products damaged during transit. Boxes were crushed.',
    images: [],
    createdAt: '2024-12-08',
    updatedAt: '2024-12-08',
  },
  {
    id: '2',
    returnId: 'RET-2024-002',
    type: 'expiry',
    source: 'retailer',
    sourceName: 'New Sharma Store',
    sourceId: 'r-001',
    items: [
      { productId: 'p-002', productName: 'Product Beta 1L', sku: 'PB-1L', quantity: 5, unitPrice: 220, reason: 'expired' },
    ],
    totalValue: 1100,
    status: 'approved',
    reason: 'Products expired on shelf. Requesting replacement.',
    images: [],
    approvedBy: 'Admin',
    createdAt: '2024-12-07',
    updatedAt: '2024-12-08',
  },
  {
    id: '3',
    returnId: 'RET-2024-003',
    type: 'wrong_product',
    source: 'distributor',
    sourceName: 'Sharma Distributors',
    sourceId: 'd-002',
    orderId: 'ORD-2024-142',
    items: [
      { productId: 'p-003', productName: 'Product Gamma 250g', sku: 'PG-250', quantity: 24, unitPrice: 85, reason: 'wrong_item' },
    ],
    totalValue: 2040,
    status: 'processing',
    reason: 'Received wrong product variant. Ordered 500g but received 250g.',
    images: [],
    approvedBy: 'Admin',
    createdAt: '2024-12-06',
    updatedAt: '2024-12-08',
    processedAt: '2024-12-08',
  },
  {
    id: '4',
    returnId: 'RET-2024-004',
    type: 'return',
    source: 'retailer',
    sourceName: 'Gupta General Store',
    sourceId: 'r-002',
    items: [
      { productId: 'p-001', productName: 'Product Alpha 500ml', sku: 'PA-500', quantity: 6, unitPrice: 120, reason: 'customer_return' },
    ],
    totalValue: 720,
    status: 'rejected',
    reason: 'Customer returned due to taste preference.',
    images: [],
    rejectionReason: 'Taste preference is not a valid return reason as per policy.',
    createdAt: '2024-12-05',
    updatedAt: '2024-12-06',
  },
  {
    id: '5',
    returnId: 'RET-2024-005',
    type: 'damage',
    source: 'distributor',
    sourceName: 'Patel Trading Co',
    sourceId: 'd-003',
    orderId: 'ORD-2024-138',
    items: [
      { productId: 'p-004', productName: 'Product Delta Pack', sku: 'PD-PK', quantity: 3, unitPrice: 350, reason: 'manufacturing_defect' },
    ],
    totalValue: 1050,
    status: 'completed',
    reason: 'Manufacturing defect - seals broken on multiple packs.',
    images: [],
    approvedBy: 'Admin',
    createdAt: '2024-12-04',
    updatedAt: '2024-12-07',
    processedAt: '2024-12-07',
  },
];

const typeConfig: Record<ReturnType, { label: string; color: string; icon: React.ElementType }> = {
  return: { label: 'Return', color: 'bg-info/10 text-info', icon: RotateCcw },
  damage: { label: 'Damage', color: 'bg-destructive/10 text-destructive', icon: AlertTriangle },
  expiry: { label: 'Expiry', color: 'bg-warning/10 text-warning', icon: Clock },
  wrong_product: { label: 'Wrong Product', color: 'bg-secondary/10 text-secondary', icon: Package },
};

const statusConfig: Record<ReturnStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-warning/10 text-warning', icon: Clock },
  approved: { label: 'Approved', color: 'bg-success/10 text-success', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-destructive/10 text-destructive', icon: XCircle },
  processing: { label: 'Processing', color: 'bg-info/10 text-info', icon: Truck },
  completed: { label: 'Completed', color: 'bg-success/10 text-success', icon: CheckCircle },
  refunded: { label: 'Refunded', color: 'bg-primary/10 text-primary', icon: IndianRupee },
};

const formatCurrency = (value: number) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
};

export default function ReturnsManagementPage() {
  const [data, setData] = useState<ReturnRequest[]>(initialData);
  const [selectedItem, setSelectedItem] = useState<ReturnRequest | null>(null);
  const [showActionModal, setShowActionModal] = useState<'approve' | 'reject' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredData = data.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    return true;
  });

  const stats = {
    total: data.length,
    pending: data.filter(r => r.status === 'pending').length,
    approved: data.filter(r => r.status === 'approved' || r.status === 'processing').length,
    completed: data.filter(r => r.status === 'completed' || r.status === 'refunded').length,
    totalValue: data.filter(r => r.status !== 'rejected').reduce((sum, r) => sum + r.totalValue, 0),
  };

  const handleView = (item: ReturnRequest) => {
    setSelectedItem(item);
  };

  const handleApprove = () => {
    if (!selectedItem) return;
    setData(data.map(item => 
      item.id === selectedItem.id 
        ? { ...item, status: 'approved' as ReturnStatus, approvedBy: 'Admin', updatedAt: new Date().toISOString().split('T')[0] }
        : item
    ));
    toast.success('Return request approved');
    setShowActionModal(null);
    setSelectedItem(null);
  };

  const handleReject = () => {
    if (!selectedItem || !actionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setData(data.map(item => 
      item.id === selectedItem.id 
        ? { ...item, status: 'rejected' as ReturnStatus, rejectionReason: actionReason, updatedAt: new Date().toISOString().split('T')[0] }
        : item
    ));
    toast.success('Return request rejected');
    setShowActionModal(null);
    setSelectedItem(null);
    setActionReason('');
  };

  const handleMarkProcessing = (item: ReturnRequest) => {
    setData(data.map(r => 
      r.id === item.id 
        ? { ...r, status: 'processing' as ReturnStatus, processedAt: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString().split('T')[0] }
        : r
    ));
    toast.success('Marked as processing');
  };

  const handleMarkCompleted = (item: ReturnRequest) => {
    setData(data.map(r => 
      r.id === item.id 
        ? { ...r, status: 'completed' as ReturnStatus, updatedAt: new Date().toISOString().split('T')[0] }
        : r
    ));
    toast.success('Return completed');
  };

  const columns = [
    {
      key: 'returnId',
      header: 'Return ID',
      render: (item: ReturnRequest) => {
        const TypeIcon = typeConfig[item.type].icon;
        return (
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${typeConfig[item.type].color}`}>
              <TypeIcon size={18} />
            </div>
            <div>
              <p className="font-medium text-foreground">{item.returnId}</p>
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
      key: 'source',
      header: 'Source',
      render: (item: ReturnRequest) => (
        <div>
          <p className="font-medium text-foreground">{item.sourceName}</p>
          <p className="text-xs text-muted-foreground capitalize">{item.source}</p>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      render: (item: ReturnRequest) => (
        <div>
          <p className="text-sm">{item.items.length} item(s)</p>
          <p className="text-xs text-muted-foreground">{item.items.reduce((sum, i) => sum + i.quantity, 0)} units</p>
        </div>
      ),
    },
    {
      key: 'totalValue',
      header: 'Value',
      render: (item: ReturnRequest) => (
        <span className="font-medium text-foreground">{formatCurrency(item.totalValue)}</span>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: ReturnRequest) => {
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
      render: (item: ReturnRequest) => (
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
      render: (item: ReturnRequest) => (
        <div className="flex items-center gap-1">
          <button onClick={() => handleView(item)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Eye size={16} className="text-muted-foreground" />
          </button>
          {item.status === 'pending' && (
            <>
              <button onClick={() => { setSelectedItem(item); setShowActionModal('approve'); }} className="p-2 hover:bg-success/10 rounded-lg transition-colors">
                <CheckCircle size={16} className="text-success" />
              </button>
              <button onClick={() => { setSelectedItem(item); setShowActionModal('reject'); }} className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
                <XCircle size={16} className="text-destructive" />
              </button>
            </>
          )}
          {item.status === 'approved' && (
            <button onClick={() => handleMarkProcessing(item)} className="p-2 hover:bg-info/10 rounded-lg transition-colors">
              <Truck size={16} className="text-info" />
            </button>
          )}
          {item.status === 'processing' && (
            <button onClick={() => handleMarkCompleted(item)} className="p-2 hover:bg-success/10 rounded-lg transition-colors">
              <CheckCircle size={16} className="text-success" />
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
          <h1 className="module-title">Returns & Damage Management</h1>
          <p className="text-muted-foreground">Manage product returns, damages, and replacements</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10"><RotateCcw size={24} className="text-primary" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Returns</p>
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-info/10"><Truck size={24} className="text-info" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
              <p className="text-sm text-muted-foreground">In Process</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10"><CheckCircle size={24} className="text-success" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10"><IndianRupee size={24} className="text-secondary" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalValue)}</p>
              <p className="text-sm text-muted-foreground">Total Value</p>
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
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field w-40">
            <option value="all">All Types</option>
            <option value="return">Returns</option>
            <option value="damage">Damage</option>
            <option value="expiry">Expiry</option>
            <option value="wrong_product">Wrong Product</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable data={filteredData} columns={columns} searchPlaceholder="Search returns..." />

      {/* View Detail Modal */}
      {selectedItem && !showActionModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">{selectedItem.returnId}</h2>
              <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-muted rounded-lg"><X size={20} /></button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeConfig[selectedItem.type].color}`}>{typeConfig[selectedItem.type].label}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[selectedItem.status].color}`}>{statusConfig[selectedItem.status].label}</span>
                {selectedItem.orderId && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">Order: {selectedItem.orderId}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Source</p>
                  <p className="font-medium">{selectedItem.sourceName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{selectedItem.source}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Value</p>
                  <p className="font-medium text-lg">{formatCurrency(selectedItem.totalValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="font-medium">{selectedItem.createdAt}</p>
                </div>
                {selectedItem.approvedBy && (
                  <div>
                    <p className="text-xs text-muted-foreground">Approved By</p>
                    <p className="font-medium">{selectedItem.approvedBy}</p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">Reason</h4>
                <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">{selectedItem.reason}</p>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-3">Items</h4>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Product</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">SKU</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Qty</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {selectedItem.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm">{item.productName}</td>
                          <td className="px-4 py-2 text-sm text-muted-foreground">{item.sku}</td>
                          <td className="px-4 py-2 text-sm">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm font-medium">₹{item.quantity * item.unitPrice}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedItem.rejectionReason && (
                <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <p className="text-xs text-destructive font-medium mb-1">Rejection Reason</p>
                  <p className="text-sm">{selectedItem.rejectionReason}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setSelectedItem(null)} className="btn-outline">Close</button>
              {selectedItem.status === 'pending' && (
                <>
                  <button onClick={() => setShowActionModal('reject')} className="px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">Reject</button>
                  <button onClick={() => setShowActionModal('approve')} className="btn-primary">Approve</button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedItem && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                {showActionModal === 'approve' ? 'Approve Return' : 'Reject Return'}
              </h2>
              <button onClick={() => { setShowActionModal(null); setActionReason(''); }} className="p-2 hover:bg-muted rounded-lg"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="font-medium text-foreground">{selectedItem.returnId}</p>
                <p className="text-sm text-muted-foreground">{selectedItem.sourceName} • {formatCurrency(selectedItem.totalValue)}</p>
              </div>

              {showActionModal === 'reject' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Rejection Reason *</label>
                  <textarea
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="input-field min-h-[100px]"
                  />
                </div>
              )}

              {showActionModal === 'approve' && (
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to approve this return request? The return process will be initiated.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => { setShowActionModal(null); setActionReason(''); }} className="btn-outline">Cancel</button>
              {showActionModal === 'approve' ? (
                <button onClick={handleApprove} className="btn-primary flex items-center gap-2">
                  <CheckCircle size={16} /> Approve
                </button>
              ) : (
                <button onClick={handleReject} className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors flex items-center gap-2">
                  <XCircle size={16} /> Reject
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
