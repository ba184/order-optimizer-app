import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge, StatusType } from '@/components/ui/StatusBadge';
import {
  Package,
  TrendingDown,
  ArrowRightLeft,
  Calendar,
  Eye,
  Plus,
  RefreshCw,
  X,
  Check,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  useInventoryBatches,
  useStockTransfers,
  useCreateInventoryBatch,
  useUpdateInventoryBatchStatus,
  useCreateStockTransfer,
  calculateInventorySummary,
  getExpiryAlerts,
  InventoryBatch,
  StockTransfer,
} from '@/hooks/useInventoryData';
import { useProducts } from '@/hooks/useOrdersData';
import { useDistributors } from '@/hooks/useOutletsData';

const warehouses = ['Main Warehouse', 'North Warehouse', 'South Warehouse'];

export default function InventoryManagementPage() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'stock-entry' | 'expiry' | 'transfers'>('inventory');
  const [showStockModal, setShowStockModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  
  const { data: batches = [], isLoading: batchesLoading } = useInventoryBatches();
  const { data: transfers = [], isLoading: transfersLoading } = useStockTransfers();
  const { data: products = [] } = useProducts();
  const { data: distributors = [] } = useDistributors();
  
  const createBatch = useCreateInventoryBatch();
  const updateBatchStatus = useUpdateInventoryBatchStatus();
  const createTransfer = useCreateStockTransfer();

  const [stockForm, setStockForm] = useState({
    product_id: '',
    batch_number: '',
    quantity: '',
    manufacturing_date: '',
    expiry_date: '',
    warehouse: '',
    distributor_id: '',
    purchase_price: '',
  });

  const [transferForm, setTransferForm] = useState({
    from_location: '',
    from_distributor_id: '',
    to_location: '',
    to_distributor_id: '',
    items: [{ product_id: '', quantity: '' }],
  });

  const inventorySummary = useMemo(() => calculateInventorySummary(batches), [batches]);
  const expiryAlerts = useMemo(() => getExpiryAlerts(batches), [batches]);

  const handleCreateStock = async () => {
    if (!stockForm.product_id || !stockForm.batch_number || !stockForm.quantity) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await createBatch.mutateAsync({
        product_id: stockForm.product_id,
        batch_number: stockForm.batch_number,
        quantity: parseInt(stockForm.quantity),
        manufacturing_date: stockForm.manufacturing_date || undefined,
        expiry_date: stockForm.expiry_date || undefined,
        warehouse: stockForm.warehouse || undefined,
        distributor_id: stockForm.distributor_id || undefined,
        purchase_price: parseFloat(stockForm.purchase_price) || 0,
      });
      setShowStockModal(false);
      setStockForm({ product_id: '', batch_number: '', quantity: '', manufacturing_date: '', expiry_date: '', warehouse: '', distributor_id: '', purchase_price: '' });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleApproveStock = (id: string) => {
    updateBatchStatus.mutate({ id, status: 'approved' });
  };

  const handleRejectStock = (id: string) => {
    updateBatchStatus.mutate({ id, status: 'rejected' });
  };

  const handleCreateTransfer = async () => {
    const validItems = transferForm.items.filter(i => i.product_id && i.quantity);
    if (!transferForm.from_location || !transferForm.to_location || validItems.length === 0) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await createTransfer.mutateAsync({
        from_location: transferForm.from_location,
        from_distributor_id: transferForm.from_distributor_id || undefined,
        to_location: transferForm.to_location,
        to_distributor_id: transferForm.to_distributor_id || undefined,
        items: validItems.map(i => ({
          product_id: i.product_id,
          quantity: parseInt(i.quantity),
        })),
      });
      setShowTransferModal(false);
      setTransferForm({ from_location: '', from_distributor_id: '', to_location: '', to_distributor_id: '', items: [{ product_id: '', quantity: '' }] });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const addTransferItem = () => {
    setTransferForm(prev => ({
      ...prev,
      items: [...prev.items, { product_id: '', quantity: '' }],
    }));
  };

  const updateTransferItem = (index: number, field: string, value: string) => {
    setTransferForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? { ...item, [field]: value } : item),
    }));
  };

  const removeTransferItem = (index: number) => {
    if (transferForm.items.length > 1) {
      setTransferForm(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const inventoryColumns = [
    {
      key: 'name',
      header: 'Product',
      render: (item: typeof inventorySummary[0]) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.product?.name || '-'}</p>
            <p className="text-xs text-muted-foreground">{item.product?.sku} • {item.product?.category}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'warehouseStock',
      header: 'Warehouse',
      render: (item: typeof inventorySummary[0]) => <span className="font-medium">{item.warehouseStock.toLocaleString()}</span>,
    },
    {
      key: 'distributorStock',
      header: 'Distributor Stock',
      render: (item: typeof inventorySummary[0]) => (
        <div className="text-sm">
          {Object.entries(item.distributorStock).length > 0 ? (
            Object.entries(item.distributorStock).map(([dist, qty]) => (
              <div key={dist} className="flex justify-between">
                <span className="text-muted-foreground truncate max-w-[100px]">{dist.split(' ')[0]}:</span>
                <span>{qty.toLocaleString()}</span>
              </div>
            ))
          ) : (
            <span className="text-muted-foreground">--</span>
          )}
        </div>
      ),
    },
    {
      key: 'totalStock',
      header: 'Total',
      render: (item: typeof inventorySummary[0]) => (
        <span className="font-semibold text-foreground">{item.totalStock.toLocaleString()}</span>
      ),
    },
    {
      key: 'expiryAlerts',
      header: 'Expiry Alerts',
      render: (item: typeof inventorySummary[0]) => (
        item.expiryAlerts > 0 ? (
          <span className="flex items-center gap-1 text-warning">
            <AlertTriangle size={14} />
            {item.expiryAlerts}
          </span>
        ) : (
          <span className="text-muted-foreground">--</span>
        )
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: () => (
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <Eye size={16} className="text-muted-foreground" />
        </button>
      ),
    },
  ];

  const stockEntryColumns = [
    {
      key: 'productName',
      header: 'Product',
      render: (item: InventoryBatch) => (
        <div>
          <p className="font-medium text-foreground">{item.product?.name || '-'}</p>
          <p className="text-xs text-muted-foreground">{item.product?.sku}</p>
        </div>
      ),
    },
    { key: 'batch_number', header: 'Batch #' },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (item: InventoryBatch) => <span className="font-medium">{item.quantity.toLocaleString()}</span>,
    },
    {
      key: 'location',
      header: 'Location',
      render: (item: InventoryBatch) => <span>{item.distributor?.firm_name || item.warehouse || '-'}</span>,
    },
    {
      key: 'dates',
      header: 'Mfg / Expiry',
      render: (item: InventoryBatch) => (
        <div className="text-sm">
          <p>Mfg: {item.manufacturing_date || '-'}</p>
          <p>Exp: {item.expiry_date || '-'}</p>
        </div>
      ),
    },
    {
      key: 'purchase_price',
      header: 'Price',
      render: (item: InventoryBatch) => <span>₹{item.purchase_price}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: InventoryBatch) => <StatusBadge status={item.status as StatusType} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: InventoryBatch) => (
        <div className="flex items-center gap-1">
          {item.status === 'pending' && (
            <>
              <button
                onClick={() => handleApproveStock(item.id)}
                className="p-2 hover:bg-success/10 rounded-lg transition-colors"
                title="Approve"
              >
                <Check size={16} className="text-success" />
              </button>
              <button
                onClick={() => handleRejectStock(item.id)}
                className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                title="Reject"
              >
                <X size={16} className="text-destructive" />
              </button>
            </>
          )}
          <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="View">
            <Eye size={16} className="text-muted-foreground" />
          </button>
        </div>
      ),
    },
  ];

  const expiryColumns = [
    {
      key: 'name',
      header: 'Product',
      render: (item: ReturnType<typeof getExpiryAlerts>[0]) => (
        <div>
          <p className="font-medium text-foreground">{item.product?.name || '-'}</p>
          <p className="text-xs text-muted-foreground">{item.product?.sku} • Batch: {item.batch_number}</p>
        </div>
      ),
    },
    { key: 'location', header: 'Location' },
    { key: 'quantity', header: 'Quantity' },
    {
      key: 'expiry_date',
      header: 'Expiry Date',
      render: (item: ReturnType<typeof getExpiryAlerts>[0]) => (
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-muted-foreground" />
          <span>{item.expiry_date}</span>
        </div>
      ),
    },
    {
      key: 'daysToExpiry',
      header: 'Days Left',
      render: (item: ReturnType<typeof getExpiryAlerts>[0]) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.daysToExpiry < 30 ? 'bg-destructive/10 text-destructive' :
          item.daysToExpiry < 60 ? 'bg-warning/10 text-warning' :
          'bg-success/10 text-success'
        }`}>
          {item.daysToExpiry} days
        </span>
      ),
    },
  ];

  const transferColumns = [
    {
      key: 'transfer_number',
      header: 'Transfer #',
      render: (item: StockTransfer) => (
        <p className="font-medium text-foreground">{item.transfer_number}</p>
      ),
    },
    {
      key: 'route',
      header: 'From → To',
      render: (item: StockTransfer) => (
        <div className="flex items-center gap-2 text-sm">
          <span>{item.from_distributor?.firm_name || item.from_location}</span>
          <ArrowRightLeft size={14} className="text-muted-foreground" />
          <span>{item.to_distributor?.firm_name || item.to_location}</span>
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (item: StockTransfer) => format(new Date(item.created_at), 'dd MMM yyyy'),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: StockTransfer) => <StatusBadge status={item.status as StatusType} />,
    },
  ];

  const stats = {
    totalSKUs: inventorySummary.length,
    lowStock: 0,
    expiryAlerts: expiryAlerts.length,
    pendingEntries: batches.filter(e => e.status === 'pending').length,
    pendingTransfers: transfers.filter(t => t.status === 'pending' || t.status === 'approved').length,
  };

  const isLoading = batchesLoading || transfersLoading;

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
          <h1 className="module-title">Inventory Management</h1>
          <p className="text-muted-foreground">Track stock levels, create entries, and manage transfers</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-outline flex items-center gap-2">
            <RefreshCw size={18} />
            Sync Stock
          </button>
          <button 
            onClick={() => setShowTransferModal(true)}
            className="btn-outline flex items-center gap-2"
          >
            <ArrowRightLeft size={18} />
            Stock Transfer
          </button>
          <button 
            onClick={() => setShowStockModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Add Stock
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Package size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalSKUs}</p>
              <p className="text-sm text-muted-foreground">Active SKUs</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/10">
              <TrendingDown size={24} className="text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.lowStock}</p>
              <p className="text-sm text-muted-foreground">Low Stock</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <AlertTriangle size={24} className="text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.expiryAlerts}</p>
              <p className="text-sm text-muted-foreground">Expiry Alerts</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-info/10">
              <Package size={24} className="text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.pendingEntries}</p>
              <p className="text-sm text-muted-foreground">Pending Entries</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10">
              <ArrowRightLeft size={24} className="text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.pendingTransfers}</p>
              <p className="text-sm text-muted-foreground">Active Transfers</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {[
          { key: 'inventory', label: 'Inventory Overview' },
          { key: 'stock-entry', label: 'Stock Entries' },
          { key: 'expiry', label: 'Expiry Alerts' },
          { key: 'transfers', label: 'Transfers' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab.key ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'inventory' && (
        <DataTable data={inventorySummary} columns={inventoryColumns} searchPlaceholder="Search inventory..." />
      )}

      {activeTab === 'stock-entry' && (
        <DataTable data={batches} columns={stockEntryColumns} searchPlaceholder="Search stock entries..." />
      )}

      {activeTab === 'expiry' && (
        <DataTable data={expiryAlerts} columns={expiryColumns} searchPlaceholder="Search expiry alerts..." />
      )}

      {activeTab === 'transfers' && (
        <DataTable data={transfers} columns={transferColumns} searchPlaceholder="Search transfers..." />
      )}

      {/* Add Stock Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Add Stock Entry</h2>
              <button onClick={() => setShowStockModal(false)} className="p-2 hover:bg-muted rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Product *</label>
                <select
                  value={stockForm.product_id}
                  onChange={e => setStockForm(prev => ({ ...prev, product_id: e.target.value }))}
                  className="input-field"
                >
                  <option value="">Select Product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Batch Number *</label>
                  <input
                    type="text"
                    value={stockForm.batch_number}
                    onChange={e => setStockForm(prev => ({ ...prev, batch_number: e.target.value }))}
                    className="input-field"
                    placeholder="e.g., BA2024001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Quantity *</label>
                  <input
                    type="number"
                    value={stockForm.quantity}
                    onChange={e => setStockForm(prev => ({ ...prev, quantity: e.target.value }))}
                    className="input-field"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Manufacturing Date</label>
                  <input
                    type="date"
                    value={stockForm.manufacturing_date}
                    onChange={e => setStockForm(prev => ({ ...prev, manufacturing_date: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={stockForm.expiry_date}
                    onChange={e => setStockForm(prev => ({ ...prev, expiry_date: e.target.value }))}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={stockForm.warehouse}
                    onChange={e => setStockForm(prev => ({ ...prev, warehouse: e.target.value, distributor_id: '' }))}
                    className="input-field"
                    disabled={!!stockForm.distributor_id}
                  >
                    <option value="">Warehouse</option>
                    {warehouses.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                  <select
                    value={stockForm.distributor_id}
                    onChange={e => setStockForm(prev => ({ ...prev, distributor_id: e.target.value, warehouse: '' }))}
                    className="input-field"
                    disabled={!!stockForm.warehouse}
                  >
                    <option value="">Or Distributor</option>
                    {distributors.map(d => (
                      <option key={d.id} value={d.id}>{d.firm_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Purchase Price (₹)</label>
                <input
                  type="number"
                  value={stockForm.purchase_price}
                  onChange={e => setStockForm(prev => ({ ...prev, purchase_price: e.target.value }))}
                  className="input-field"
                  placeholder="0.00"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowStockModal(false)} className="btn-outline flex-1">
                  Cancel
                </button>
                <button
                  onClick={handleCreateStock}
                  disabled={createBatch.isPending}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {createBatch.isPending && <Loader2 size={16} className="animate-spin" />}
                  Create Entry
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Stock Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Stock Transfer Request</h2>
              <button onClick={() => setShowTransferModal(false)} className="p-2 hover:bg-muted rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">From *</label>
                <select
                  value={transferForm.from_distributor_id || transferForm.from_location}
                  onChange={e => {
                    const value = e.target.value;
                    const isDistributor = distributors.some(d => d.id === value);
                    setTransferForm(prev => ({
                      ...prev,
                      from_location: isDistributor ? '' : value,
                      from_distributor_id: isDistributor ? value : '',
                    }));
                  }}
                  className="input-field"
                >
                  <option value="">Select Source</option>
                  <optgroup label="Warehouses">
                    {warehouses.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Distributors">
                    {distributors.map(d => (
                      <option key={d.id} value={d.id}>{d.firm_name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">To *</label>
                <select
                  value={transferForm.to_distributor_id || transferForm.to_location}
                  onChange={e => {
                    const value = e.target.value;
                    const isDistributor = distributors.some(d => d.id === value);
                    setTransferForm(prev => ({
                      ...prev,
                      to_location: isDistributor ? '' : value,
                      to_distributor_id: isDistributor ? value : '',
                    }));
                  }}
                  className="input-field"
                >
                  <option value="">Select Destination</option>
                  <optgroup label="Warehouses">
                    {warehouses.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Distributors">
                    {distributors.map(d => (
                      <option key={d.id} value={d.id}>{d.firm_name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Items *</label>
                <div className="space-y-2">
                  {transferForm.items.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <select
                        value={item.product_id}
                        onChange={e => updateTransferItem(index, 'product_id', e.target.value)}
                        className="input-field flex-1"
                      >
                        <option value="">Select Product</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={e => updateTransferItem(index, 'quantity', e.target.value)}
                        className="input-field w-24"
                        placeholder="Qty"
                      />
                      {transferForm.items.length > 1 && (
                        <button
                          onClick={() => removeTransferItem(index)}
                          className="p-2 hover:bg-destructive/10 rounded-lg"
                        >
                          <X size={16} className="text-destructive" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={addTransferItem} className="text-sm text-primary hover:underline">
                    + Add another item
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowTransferModal(false)} className="btn-outline flex-1">
                  Cancel
                </button>
                <button
                  onClick={handleCreateTransfer}
                  disabled={createTransfer.isPending}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {createTransfer.isPending && <Loader2 size={16} className="animate-spin" />}
                  Create Transfer
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
