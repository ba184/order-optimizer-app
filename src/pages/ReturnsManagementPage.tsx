import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import {
  useReturns,
  useReturnItems,
  useCreateReturn,
  useUpdateReturnStatus,
  Return,
  ReturnStatus,
  ReturnType,
} from '@/hooks/useReturnsData';
import { useProducts } from '@/hooks/useProductsData';
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
  Truck,
  Calendar,
  IndianRupee,
  Loader2,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

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

interface ReturnItemInput {
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  reason: string;
}

export default function ReturnsManagementPage() {
  const { data: returns = [], isLoading } = useReturns();
  const { data: products = [] } = useProducts();
  const createReturn = useCreateReturn();
  const updateStatus = useUpdateReturnStatus();

  const [selectedItem, setSelectedItem] = useState<Return | null>(null);
  const [showActionModal, setShowActionModal] = useState<'approve' | 'reject' | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Create form state
  const [formData, setFormData] = useState({
    return_type: 'return' as ReturnType,
    source: 'retailer',
    source_name: '',
    reason: '',
  });
  const [formItems, setFormItems] = useState<ReturnItemInput[]>([
    { product_id: '', product_name: '', sku: '', quantity: 1, unit_price: 0, reason: '' }
  ]);

  const filteredData = returns.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (typeFilter !== 'all' && item.return_type !== typeFilter) return false;
    return true;
  });

  const stats = {
    total: returns.length,
    pending: returns.filter(r => r.status === 'pending').length,
    approved: returns.filter(r => r.status === 'approved' || r.status === 'processing').length,
    completed: returns.filter(r => r.status === 'completed' || r.status === 'refunded').length,
    totalValue: returns.filter(r => r.status !== 'rejected').reduce((sum, r) => sum + Number(r.total_value), 0),
  };

  const handleView = (item: Return) => {
    setSelectedItem(item);
  };

  const handleApprove = async () => {
    if (!selectedItem) return;
    await updateStatus.mutateAsync({ id: selectedItem.id, status: 'approved' });
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

  const handleMarkProcessing = async (item: Return) => {
    await updateStatus.mutateAsync({ id: item.id, status: 'processing' });
  };

  const handleMarkCompleted = async (item: Return) => {
    await updateStatus.mutateAsync({ id: item.id, status: 'completed' });
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

  const handleAddItem = () => {
    setFormItems([...formItems, { product_id: '', product_name: '', sku: '', quantity: 1, unit_price: 0, reason: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    if (formItems.length > 1) {
      setFormItems(formItems.filter((_, i) => i !== index));
    }
  };

  const handleCreateReturn = async () => {
    if (!formData.source_name.trim()) {
      toast.error('Please enter source name');
      return;
    }
    if (formItems.some(item => !item.product_name)) {
      toast.error('Please select products for all items');
      return;
    }

    await createReturn.mutateAsync({
      return_type: formData.return_type,
      source: formData.source,
      source_name: formData.source_name,
      reason: formData.reason,
      items: formItems,
    });

    setShowCreateModal(false);
    setFormData({ return_type: 'return', source: 'retailer', source_name: '', reason: '' });
    setFormItems([{ product_id: '', product_name: '', sku: '', quantity: 1, unit_price: 0, reason: '' }]);
  };

  const columns = [
    {
      key: 'return_number',
      header: 'Return ID',
      render: (item: Return) => {
        const TypeIcon = typeConfig[item.return_type]?.icon || RotateCcw;
        return (
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${typeConfig[item.return_type]?.color || 'bg-muted'}`}>
              <TypeIcon size={18} />
            </div>
            <div>
              <p className="font-medium text-foreground">{item.return_number}</p>
              <span className={`px-2 py-0.5 rounded text-xs ${typeConfig[item.return_type]?.color || 'bg-muted'}`}>
                {typeConfig[item.return_type]?.label || item.return_type}
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
      render: (item: Return) => (
        <div>
          <p className="font-medium text-foreground">{item.source_name}</p>
          <p className="text-xs text-muted-foreground capitalize">{item.source}</p>
        </div>
      ),
    },
    {
      key: 'total_value',
      header: 'Value',
      render: (item: Return) => (
        <span className="font-medium text-foreground">{formatCurrency(Number(item.total_value))}</span>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Return) => {
        const StatusIcon = statusConfig[item.status]?.icon || Clock;
        return (
          <div className="flex items-center gap-1">
            <StatusIcon size={14} />
            <span className={`px-2 py-0.5 rounded text-xs ${statusConfig[item.status]?.color || 'bg-muted'}`}>
              {statusConfig[item.status]?.label || item.status}
            </span>
          </div>
        );
      },
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (item: Return) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar size={14} />
          {format(new Date(item.created_at), 'dd MMM yyyy')}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Return) => (
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
          <h1 className="module-title">Returns & Damage Management</h1>
          <p className="text-muted-foreground">Manage product returns, damages, and replacements</p>
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
              <h2 className="text-lg font-semibold text-foreground">{selectedItem.return_number}</h2>
              <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-muted rounded-lg"><X size={20} /></button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeConfig[selectedItem.return_type]?.color}`}>{typeConfig[selectedItem.return_type]?.label}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[selectedItem.status]?.color}`}>{statusConfig[selectedItem.status]?.label}</span>
                {selectedItem.order?.order_number && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">Order: {selectedItem.order.order_number}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Source</p>
                  <p className="font-medium">{selectedItem.source_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{selectedItem.source}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Value</p>
                  <p className="font-medium text-lg">{formatCurrency(Number(selectedItem.total_value))}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="font-medium">{format(new Date(selectedItem.created_at), 'dd MMM yyyy')}</p>
                </div>
                {selectedItem.processed_at && (
                  <div>
                    <p className="text-xs text-muted-foreground">Processed</p>
                    <p className="font-medium">{format(new Date(selectedItem.processed_at), 'dd MMM yyyy')}</p>
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
              {selectedItem.status === 'pending' && (
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

      {/* Action Modal */}
      {showActionModal && selectedItem && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {showActionModal === 'approve' ? 'Approve Return' : 'Reject Return'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {showActionModal === 'approve' 
                ? `Are you sure you want to approve return ${selectedItem.return_number}?`
                : `Please provide a reason for rejecting return ${selectedItem.return_number}.`}
            </p>
            {showActionModal === 'reject' && (
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="input-field min-h-[100px] mb-4"
              />
            )}
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => { setShowActionModal(null); setActionReason(''); }} className="btn-outline">Cancel</button>
              <button 
                onClick={showActionModal === 'approve' ? handleApprove : handleReject}
                disabled={updateStatus.isPending}
                className={showActionModal === 'approve' ? 'btn-primary' : 'btn-primary bg-destructive hover:bg-destructive/90'}
              >
                {updateStatus.isPending ? <Loader2 size={16} className="animate-spin" /> : showActionModal === 'approve' ? 'Approve' : 'Reject'}
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
                  <label className="block text-sm font-medium text-foreground mb-2">Return Type *</label>
                  <select
                    value={formData.return_type}
                    onChange={(e) => setFormData({ ...formData, return_type: e.target.value as ReturnType })}
                    className="input-field"
                  >
                    <option value="return">Return</option>
                    <option value="damage">Damage</option>
                    <option value="expiry">Expiry</option>
                    <option value="wrong_product">Wrong Product</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Source Type *</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="input-field"
                  >
                    <option value="retailer">Retailer</option>
                    <option value="distributor">Distributor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Source Name *</label>
                <input
                  type="text"
                  value={formData.source_name}
                  onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
                  placeholder="Enter retailer/distributor name"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Enter reason for return..."
                  className="input-field min-h-[80px]"
                />
              </div>

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
                          <select
                            value={item.product_id}
                            onChange={(e) => handleProductChange(index, e.target.value)}
                            className="input-field"
                          >
                            <option value="">Select Product</option>
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
                          <label className="text-xs text-muted-foreground">Unit Price</label>
                          <input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => {
                              const newItems = [...formItems];
                              newItems[index].unit_price = parseFloat(e.target.value) || 0;
                              setFormItems(newItems);
                            }}
                            className="input-field"
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
