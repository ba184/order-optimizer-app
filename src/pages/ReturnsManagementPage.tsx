import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import {
  useReturns,
  useCreateReturn,
  useUpdateReturnStatus,
  useApproveUnlock,
  useSetSettlement,
  Return,
  ReturnStatus,
  ReturnType,
  PartyType,
  SettlementType,
} from '@/hooks/useReturnsData';
import { useProducts } from '@/hooks/useProductsData';
import { useOrders } from '@/hooks/useOrdersData';
import { ReturnMediaUpload } from '@/components/ui/ReturnMediaUpload';
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
  Calendar,
  IndianRupee,
  Loader2,
  Trash2,
  Unlock,
  FileText,
  Droplets,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const typeConfig: Record<ReturnType, { label: string; color: string; icon: React.ElementType }> = {
  sales_return: { label: 'Sales Return', color: 'bg-info/10 text-info', icon: RotateCcw },
  damage: { label: 'Damage', color: 'bg-destructive/10 text-destructive', icon: AlertTriangle },
  leakage: { label: 'Leakage', color: 'bg-warning/10 text-warning', icon: Droplets },
  expiry: { label: 'Expiry', color: 'bg-secondary/10 text-secondary-foreground', icon: Clock },
};

const statusConfig: Record<ReturnStatus, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground', icon: FileText },
  submitted: { label: 'Submitted', color: 'bg-info/10 text-info', icon: Clock },
  approved: { label: 'Approved', color: 'bg-success/10 text-success', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-destructive/10 text-destructive', icon: XCircle },
};

const partyTypeConfig: Record<PartyType, { label: string; color: string }> = {
  primary: { label: 'Primary', color: 'bg-primary/10 text-primary' },
  secondary: { label: 'Secondary', color: 'bg-info/10 text-info' },
  institutional: { label: 'Institutional', color: 'bg-secondary/10 text-secondary-foreground' },
};

const settlementConfig: Record<SettlementType, { label: string; color: string }> = {
  credit: { label: 'Credit', color: 'bg-success/10 text-success' },
  debit: { label: 'Debit', color: 'bg-destructive/10 text-destructive' },
  replacement: { label: 'Replacement', color: 'bg-info/10 text-info' },
};

const formatCurrency = (value: number) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
};

interface ReturnItemInput {
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  reason: string;
  batch_no: string;
}

export default function ReturnsManagementPage() {
  const { data: returns = [], isLoading } = useReturns();
  const { data: products = [] } = useProducts();
  const { data: orders = [] } = useOrders();
  const createReturn = useCreateReturn();
  const updateStatus = useUpdateReturnStatus();
  const approveUnlock = useApproveUnlock();
  const setSettlement = useSetSettlement();

  const [selectedItem, setSelectedItem] = useState<Return | null>(null);
  const [showActionModal, setShowActionModal] = useState<'approve' | 'reject' | 'settlement' | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [settlementType, setSettlementType] = useState<SettlementType>('credit');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Create form state
  const [formData, setFormData] = useState({
    return_type: 'sales_return' as ReturnType,
    order_id: '',
    party_type: 'primary' as PartyType,
    reason: '',
    claim_date: new Date().toISOString().split('T')[0],
    batch_no: '',
  });
  const [formItems, setFormItems] = useState<ReturnItemInput[]>([
    { product_id: '', product_name: '', sku: '', quantity: 1, unit_price: 0, reason: '', batch_no: '' }
  ]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);

  const filteredData = returns.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (typeFilter !== 'all' && item.return_type !== typeFilter) return false;
    return true;
  });

  const stats = {
    total: returns.length,
    submitted: returns.filter(r => r.status === 'submitted').length,
    approved: returns.filter(r => r.status === 'approved').length,
    rejected: returns.filter(r => r.status === 'rejected').length,
    totalValue: returns.filter(r => r.status !== 'rejected').reduce((sum, r) => sum + Number(r.total_value), 0),
  };

  const handleView = (item: Return) => {
    setSelectedItem(item);
  };

  const handleApprove = async () => {
    if (!selectedItem) return;
    await updateStatus.mutateAsync({ 
      id: selectedItem.id, 
      status: 'approved',
      settlement_type: settlementType 
    });
    setShowActionModal(null);
    setSelectedItem(null);
  };

  const handleReject = async () => {
    if (!selectedItem || !actionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    await updateStatus.mutateAsync({ id: selectedItem.id, status: 'rejected', rejection_reason: actionReason });
    setShowActionModal(null);
    setSelectedItem(null);
    setActionReason('');
  };

  const handleUnlock = async (item: Return) => {
    await approveUnlock.mutateAsync(item.id);
  };

  const handleSetSettlement = async () => {
    if (!selectedItem) return;
    await setSettlement.mutateAsync({ id: selectedItem.id, settlement_type: settlementType });
    setShowActionModal(null);
    setSelectedItem(null);
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const newItems = [...formItems];
      newItems[index] = {
        ...newItems[index],
        product_id: productId,
        product_name: product.name,
        sku: product.sku,
        unit_price: product.ptr,
      };
      setFormItems(newItems);
    }
  };

  const handleOrderChange = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    setFormData({ 
      ...formData, 
      order_id: orderId,
    });
  };

  const handleAddItem = () => {
    setFormItems([...formItems, { product_id: '', product_name: '', sku: '', quantity: 1, unit_price: 0, reason: '', batch_no: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    if (formItems.length > 1) {
      setFormItems(formItems.filter((_, i) => i !== index));
    }
  };

  const handleCreateReturn = async () => {
    // Validate media for damage/leakage
    if ((formData.return_type === 'damage' || formData.return_type === 'leakage') && mediaUrls.length === 0) {
      toast.error('Please upload at least one image/video for damage or leakage claims');
      return;
    }

    if (formItems.some(item => !item.product_name)) {
      toast.error('Please select products for all items');
      return;
    }

    const selectedOrder = orders.find(o => o.id === formData.order_id);

    await createReturn.mutateAsync({
      return_type: formData.return_type,
      source: 'retailer',
      source_name: selectedOrder?.retailer?.shop_name || 'Unknown',
      order_id: formData.order_id || undefined,
      reason: formData.reason,
      party_type: formData.party_type,
      batch_no: formData.batch_no,
      claim_date: formData.claim_date,
      media_urls: mediaUrls,
      items: formItems,
    });

    setShowCreateModal(false);
    setFormData({ return_type: 'sales_return', order_id: '', party_type: 'primary', reason: '', claim_date: new Date().toISOString().split('T')[0], batch_no: '' });
    setFormItems([{ product_id: '', product_name: '', sku: '', quantity: 1, unit_price: 0, reason: '', batch_no: '' }]);
    setMediaUrls([]);
  };

  const columns = [
    {
      key: 'return_number',
      header: 'Return ID',
      render: (item: Return) => (
        <p className="font-medium text-foreground">{item.return_number}</p>
      ),
      sortable: true,
    },
    {
      key: 'claim_date',
      header: 'Claim Date',
      render: (item: Return) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar size={14} />
          {item.claim_date ? format(new Date(item.claim_date), 'dd MMM yyyy') : format(new Date(item.created_at), 'dd MMM yyyy')}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'source_name',
      header: 'Party Name',
      render: (item: Return) => (
        <p className="font-medium text-foreground">{item.source_name}</p>
      ),
    },
    {
      key: 'party_type',
      header: 'Party Type',
      render: (item: Return) => {
        const config = partyTypeConfig[item.party_type] || partyTypeConfig.primary;
        return (
          <span className={`px-2 py-0.5 rounded text-xs ${config.color}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      key: 'se_name',
      header: 'SE Name',
      render: (item: Return) => (
        <p className="text-sm text-foreground">{item.se_name || '-'}</p>
      ),
    },
    {
      key: 'return_type',
      header: 'Return Type',
      render: (item: Return) => {
        const config = typeConfig[item.return_type] || typeConfig.sales_return;
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
      key: 'status',
      header: 'Claim Status',
      render: (item: Return) => {
        const config = statusConfig[item.status] || statusConfig.submitted;
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
      key: 'settlement_type',
      header: 'Settlement',
      render: (item: Return) => {
        if (!item.settlement_type) return <span className="text-muted-foreground">—</span>;
        const config = settlementConfig[item.settlement_type];
        return (
          <span className={`px-2 py-0.5 rounded text-xs ${config?.color || 'bg-muted'}`}>
            {config?.label || item.settlement_type}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Return) => (
        <div className="flex items-center gap-1">
          <button onClick={() => handleView(item)} className="p-2 hover:bg-muted rounded-lg transition-colors" title="View">
            <Eye size={16} className="text-muted-foreground" />
          </button>
          {item.status === 'submitted' && (
            <>
              <button onClick={() => { setSelectedItem(item); setShowActionModal('approve'); }} className="p-2 hover:bg-success/10 rounded-lg transition-colors" title="Approve">
                <CheckCircle size={16} className="text-success" />
              </button>
              <button onClick={() => { setSelectedItem(item); setShowActionModal('reject'); }} className="p-2 hover:bg-destructive/10 rounded-lg transition-colors" title="Reject">
                <XCircle size={16} className="text-destructive" />
              </button>
            </>
          )}
          {item.status === 'approved' && item.is_locked && item.unlock_requested_at && !item.unlock_approved_at && (
            <button onClick={() => handleUnlock(item)} className="p-2 hover:bg-warning/10 rounded-lg transition-colors" title="Unlock">
              <Unlock size={16} className="text-warning" />
            </button>
          )}
          {item.status === 'approved' && !item.settlement_type && (
            <button onClick={() => { setSelectedItem(item); setShowActionModal('settlement'); }} className="p-2 hover:bg-info/10 rounded-lg transition-colors" title="Set Settlement">
              <IndianRupee size={16} className="text-info" />
            </button>
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
          <h1 className="module-title">Return & Claim Management</h1>
          <p className="text-muted-foreground">Manage product returns, damages, and claims</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Create Return
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10"><RotateCcw size={24} className="text-primary" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card cursor-pointer" onClick={() => setStatusFilter(statusFilter === 'submitted' ? 'all' : 'submitted')}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-info/10"><Clock size={24} className="text-info" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.submitted}</p>
              <p className="text-sm text-muted-foreground">Submitted</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card cursor-pointer" onClick={() => setStatusFilter(statusFilter === 'approved' ? 'all' : 'approved')}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10"><CheckCircle size={24} className="text-success" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10"><IndianRupee size={24} className="text-secondary-foreground" /></div>
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
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field w-40">
            <option value="all">All Types</option>
            <option value="sales_return">Sales Return</option>
            <option value="damage">Damage</option>
            <option value="leakage">Leakage</option>
            <option value="expiry">Expiry</option>
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
              <h2 className="text-lg font-semibold text-foreground">{selectedItem.return_number}</h2>
              <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-muted rounded-lg"><X size={20} /></button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeConfig[selectedItem.return_type]?.color}`}>{typeConfig[selectedItem.return_type]?.label}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[selectedItem.status]?.color}`}>{statusConfig[selectedItem.status]?.label}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${partyTypeConfig[selectedItem.party_type]?.color}`}>{partyTypeConfig[selectedItem.party_type]?.label}</span>
                {selectedItem.settlement_type && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${settlementConfig[selectedItem.settlement_type]?.color}`}>{settlementConfig[selectedItem.settlement_type]?.label}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Party Name</p>
                  <p className="font-medium">{selectedItem.source_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Value</p>
                  <p className="font-medium text-lg">{formatCurrency(Number(selectedItem.total_value))}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Claim Date</p>
                  <p className="font-medium">{selectedItem.claim_date ? format(new Date(selectedItem.claim_date), 'dd MMM yyyy') : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">SE Name</p>
                  <p className="font-medium">{selectedItem.se_name || '-'}</p>
                </div>
                {selectedItem.batch_no && (
                  <div>
                    <p className="text-xs text-muted-foreground">Batch No</p>
                    <p className="font-medium">{selectedItem.batch_no}</p>
                  </div>
                )}
                {selectedItem.order?.order_number && (
                  <div>
                    <p className="text-xs text-muted-foreground">Order/Invoice</p>
                    <p className="font-medium">{selectedItem.order.order_number}</p>
                  </div>
                )}
              </div>

              {selectedItem.reason && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Reason</p>
                  <p className="text-sm">{selectedItem.reason}</p>
                </div>
              )}

              {selectedItem.rejection_reason && (
                <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <p className="text-xs text-destructive font-medium mb-1">Rejection Reason</p>
                  <p className="text-sm">{selectedItem.rejection_reason}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setSelectedItem(null)} className="btn-outline">Close</button>
              {selectedItem.status === 'submitted' && (
                <>
                  <button onClick={() => setShowActionModal('approve')} className="btn-primary flex items-center gap-2">
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button onClick={() => setShowActionModal('reject')} className="btn-outline text-destructive flex items-center gap-2">
                    <XCircle size={16} /> Reject
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Action Modal (Approve/Reject/Settlement) */}
      {showActionModal && selectedItem && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {showActionModal === 'approve' ? 'Approve Return' : showActionModal === 'reject' ? 'Reject Return' : 'Set Settlement'}
            </h2>
            
            {showActionModal === 'approve' && (
              <div className="space-y-4">
                <p className="text-muted-foreground">Approve return {selectedItem.return_number}?</p>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Settlement Type</label>
                  <select value={settlementType} onChange={(e) => setSettlementType(e.target.value as SettlementType)} className="input-field">
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                    <option value="replacement">Replacement</option>
                  </select>
                </div>
              </div>
            )}

            {showActionModal === 'reject' && (
              <div className="space-y-4">
                <p className="text-muted-foreground">Reject return {selectedItem.return_number}?</p>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Enter rejection reason... (required)"
                  className="input-field min-h-[100px]"
                />
              </div>
            )}

            {showActionModal === 'settlement' && (
              <div className="space-y-4">
                <p className="text-muted-foreground">Set settlement for {selectedItem.return_number}</p>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Settlement Type</label>
                  <select value={settlementType} onChange={(e) => setSettlementType(e.target.value as SettlementType)} className="input-field">
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                    <option value="replacement">Replacement</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => { setShowActionModal(null); setActionReason(''); }} className="btn-outline">Cancel</button>
              <button 
                onClick={showActionModal === 'approve' ? handleApprove : showActionModal === 'reject' ? handleReject : handleSetSettlement}
                disabled={updateStatus.isPending || setSettlement.isPending || (showActionModal === 'reject' && !actionReason.trim())}
                className={showActionModal === 'reject' ? 'btn-primary bg-destructive hover:bg-destructive/90' : 'btn-primary'}
              >
                {(updateStatus.isPending || setSettlement.isPending) ? <Loader2 size={16} className="animate-spin" /> : 
                  showActionModal === 'approve' ? 'Approve' : showActionModal === 'reject' ? 'Reject' : 'Set Settlement'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Return Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Create Return Request</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-muted rounded-lg"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Order / Invoice No</label>
                  <select value={formData.order_id} onChange={(e) => handleOrderChange(e.target.value)} className="input-field">
                    <option value="">Select Order</option>
                    {orders.map(o => (
                      <option key={o.id} value={o.id}>{o.order_number}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Claim Date *</label>
                  <input
                    type="date"
                    value={formData.claim_date}
                    onChange={(e) => setFormData({ ...formData, claim_date: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Party Type *</label>
                  <select
                    value={formData.party_type}
                    onChange={(e) => setFormData({ ...formData, party_type: e.target.value as PartyType })}
                    className="input-field"
                  >
                    <option value="primary">Distributor</option>
                    <option value="secondary">Retailer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Return Type *</label>
                  <select
                    value={formData.return_type}
                    onChange={(e) => setFormData({ ...formData, return_type: e.target.value as ReturnType })}
                    className="input-field"
                  >
                    <option value="sales_return">Sales Return</option>
                    <option value="damage">Damage</option>
                    <option value="leakage">Leakage</option>
                    <option value="expiry">Expiry</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Reason</label>
                <select
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select Reason</option>
                  <option value="Quality Issue">Quality Issue</option>
                  <option value="Wrong Product">Wrong Product</option>
                  <option value="Damaged in Transit">Damaged in Transit</option>
                  <option value="Near Expiry">Near Expiry</option>
                  <option value="Expired">Expired</option>
                  <option value="Packaging Defect">Packaging Defect</option>
                  <option value="Customer Return">Customer Return</option>
                </select>
              </div>

              {(formData.return_type === 'damage' || formData.return_type === 'leakage') && (
                <ReturnMediaUpload
                  mediaUrls={mediaUrls}
                  onMediaChange={setMediaUrls}
                  maxFiles={5}
                  maxSizeMB={10}
                />
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">Return Items *</label>
                  <button onClick={handleAddItem} className="text-sm text-primary hover:underline flex items-center gap-1">
                    <Plus size={14} /> Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {formItems.map((item, index) => (
                    <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Item {index + 1}</span>
                        {formItems.length > 1 && (
                          <button onClick={() => handleRemoveItem(index)} className="p-1 hover:bg-destructive/10 rounded">
                            <Trash2 size={14} className="text-destructive" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <select value={item.product_id} onChange={(e) => handleProductChange(index, e.target.value)} className="input-field">
                            <option value="">Select Product (SKU)</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...formItems];
                              newItems[index].quantity = parseInt(e.target.value) || 1;
                              setFormItems(newItems);
                            }}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Batch No</label>
                          <input
                            type="text"
                            value={item.batch_no}
                            onChange={(e) => {
                              const newItems = [...formItems];
                              newItems[index].batch_no = e.target.value;
                              setFormItems(newItems);
                            }}
                            className="input-field"
                            placeholder="Enter batch"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex justify-between">
                  <span className="font-medium">Total Value</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(formItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0))}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="btn-outline">Cancel</button>
              <button 
                onClick={handleCreateReturn}
                disabled={createReturn.isPending}
                className="btn-primary flex items-center gap-2"
              >
                {createReturn.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Create Return
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
