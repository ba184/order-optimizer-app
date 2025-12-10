import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Package,
  Warehouse,
  AlertTriangle,
  TrendingDown,
  ArrowRightLeft,
  Calendar,
  Eye,
  Plus,
  RefreshCw,
  X,
  Check,
  Edit,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  warehouseStock: number;
  distributorStock: Record<string, number>;
  totalStock: number;
  reorderLevel: number;
  expiryAlerts: number;
  status: 'active' | 'inactive';
}

interface StockEntry {
  id: string;
  sku: string;
  productName: string;
  batchNumber: string;
  quantity: number;
  manufacturingDate: string;
  expiryDate: string;
  warehouse: string;
  purchasePrice: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  createdBy: string;
}

interface StockTransfer {
  id: string;
  transferNumber: string;
  fromDistributor: string;
  toDistributor: string;
  items: { sku: string; name: string; quantity: number }[];
  status: 'pending' | 'approved' | 'dispatched' | 'delivered';
  createdAt: string;
}

interface ExpiryAlert {
  id: string;
  sku: string;
  name: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  location: string;
  daysToExpiry: number;
}

const mockInventory: InventoryItem[] = [
  { id: 'inv-001', sku: 'PA-500', name: 'Product Alpha 500ml', category: 'Beverages', warehouseStock: 15000, distributorStock: { 'Krishna Traders': 2500, 'Sharma Distributors': 1800, 'Patel Trading': 2200 }, totalStock: 21500, reorderLevel: 5000, expiryAlerts: 2, status: 'active' },
  { id: 'inv-002', sku: 'PB-1L', name: 'Product Beta 1L', category: 'Beverages', warehouseStock: 8000, distributorStock: { 'Krishna Traders': 1500, 'Sharma Distributors': 1200, 'Patel Trading': 900 }, totalStock: 11600, reorderLevel: 3000, expiryAlerts: 0, status: 'active' },
  { id: 'inv-003', sku: 'PG-250', name: 'Product Gamma 250g', category: 'Food', warehouseStock: 25000, distributorStock: { 'Krishna Traders': 4000, 'Sharma Distributors': 3500, 'Patel Trading': 3000 }, totalStock: 35500, reorderLevel: 8000, expiryAlerts: 5, status: 'active' },
  { id: 'inv-004', sku: 'PD-PK', name: 'Product Delta Pack', category: 'Combo', warehouseStock: 3000, distributorStock: { 'Krishna Traders': 500, 'Sharma Distributors': 400, 'Patel Trading': 350 }, totalStock: 4250, reorderLevel: 2000, expiryAlerts: 0, status: 'active' },
];

const mockStockEntries: StockEntry[] = [
  { id: 'se-001', sku: 'PA-500', productName: 'Product Alpha 500ml', batchNumber: 'BA2024010', quantity: 5000, manufacturingDate: '2024-12-01', expiryDate: '2025-12-01', warehouse: 'Main Warehouse', purchasePrice: 45, status: 'approved', createdAt: '2024-12-05', createdBy: 'Admin' },
  { id: 'se-002', sku: 'PB-1L', productName: 'Product Beta 1L', batchNumber: 'BB2024015', quantity: 3000, manufacturingDate: '2024-12-03', expiryDate: '2025-06-03', warehouse: 'Main Warehouse', purchasePrice: 85, status: 'pending', createdAt: '2024-12-08', createdBy: 'Admin' },
];

const mockExpiryAlerts: ExpiryAlert[] = [
  { id: 'ea-001', sku: 'PA-500', name: 'Product Alpha 500ml', batchNumber: 'BA2024001', expiryDate: '2025-01-15', quantity: 500, location: 'Krishna Traders', daysToExpiry: 37 },
  { id: 'ea-002', sku: 'PA-500', name: 'Product Alpha 500ml', batchNumber: 'BA2024002', expiryDate: '2025-02-01', quantity: 350, location: 'Warehouse', daysToExpiry: 54 },
  { id: 'ea-003', sku: 'PG-250', name: 'Product Gamma 250g', batchNumber: 'BG2024005', expiryDate: '2025-01-20', quantity: 1200, location: 'Sharma Distributors', daysToExpiry: 42 },
  { id: 'ea-004', sku: 'PG-250', name: 'Product Gamma 250g', batchNumber: 'BG2024006', expiryDate: '2025-01-10', quantity: 800, location: 'Warehouse', daysToExpiry: 32 },
  { id: 'ea-005', sku: 'PG-250', name: 'Product Gamma 250g', batchNumber: 'BG2024007', expiryDate: '2025-01-25', quantity: 600, location: 'Patel Trading', daysToExpiry: 47 },
];

const mockTransfers: StockTransfer[] = [
  { id: 'st-001', transferNumber: 'STF-2024-001', fromDistributor: 'Krishna Traders', toDistributor: 'Sharma Distributors', items: [{ sku: 'PA-500', name: 'Product Alpha 500ml', quantity: 200 }], status: 'approved', createdAt: '2024-12-08' },
  { id: 'st-002', transferNumber: 'STF-2024-002', fromDistributor: 'Warehouse', toDistributor: 'Patel Trading', items: [{ sku: 'PB-1L', name: 'Product Beta 1L', quantity: 500 }, { sku: 'PG-250', name: 'Product Gamma 250g', quantity: 1000 }], status: 'dispatched', createdAt: '2024-12-09' },
];

const products = [
  { sku: 'PA-500', name: 'Product Alpha 500ml' },
  { sku: 'PB-1L', name: 'Product Beta 1L' },
  { sku: 'PG-250', name: 'Product Gamma 250g' },
  { sku: 'PD-PK', name: 'Product Delta Pack' },
];

const warehouses = ['Main Warehouse', 'North Warehouse', 'South Warehouse'];
const distributors = ['Krishna Traders', 'Sharma Distributors', 'Patel Trading', 'Warehouse'];

export default function InventoryManagementPage() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'stock-entry' | 'expiry' | 'transfers'>('inventory');
  const [showStockModal, setShowStockModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [stockEntries, setStockEntries] = useState<StockEntry[]>(mockStockEntries);
  
  const [stockForm, setStockForm] = useState({
    sku: '',
    batchNumber: '',
    quantity: '',
    manufacturingDate: '',
    expiryDate: '',
    warehouse: '',
    purchasePrice: '',
  });

  const [transferForm, setTransferForm] = useState({
    fromDistributor: '',
    toDistributor: '',
    items: [{ sku: '', quantity: '' }],
  });

  const handleCreateStock = () => {
    if (!stockForm.sku || !stockForm.batchNumber || !stockForm.quantity || !stockForm.warehouse) {
      toast.error('Please fill all required fields');
      return;
    }

    const product = products.find(p => p.sku === stockForm.sku);
    const newEntry: StockEntry = {
      id: `se-${Date.now()}`,
      sku: stockForm.sku,
      productName: product?.name || '',
      batchNumber: stockForm.batchNumber,
      quantity: parseInt(stockForm.quantity),
      manufacturingDate: stockForm.manufacturingDate,
      expiryDate: stockForm.expiryDate,
      warehouse: stockForm.warehouse,
      purchasePrice: parseFloat(stockForm.purchasePrice) || 0,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: 'Admin',
    };

    setStockEntries([newEntry, ...stockEntries]);
    toast.success('Stock entry created successfully');
    setShowStockModal(false);
    setStockForm({ sku: '', batchNumber: '', quantity: '', manufacturingDate: '', expiryDate: '', warehouse: '', purchasePrice: '' });
  };

  const handleApproveStock = (id: string) => {
    setStockEntries(prev => prev.map(e => e.id === id ? { ...e, status: 'approved' } : e));
    toast.success('Stock entry approved');
  };

  const handleRejectStock = (id: string) => {
    setStockEntries(prev => prev.map(e => e.id === id ? { ...e, status: 'rejected' } : e));
    toast.error('Stock entry rejected');
  };

  const handleCreateTransfer = () => {
    if (!transferForm.fromDistributor || !transferForm.toDistributor || !transferForm.items[0].sku) {
      toast.error('Please fill all required fields');
      return;
    }
    toast.success('Stock transfer request created');
    setShowTransferModal(false);
    setTransferForm({ fromDistributor: '', toDistributor: '', items: [{ sku: '', quantity: '' }] });
  };

  const addTransferItem = () => {
    setTransferForm(prev => ({
      ...prev,
      items: [...prev.items, { sku: '', quantity: '' }],
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
      render: (item: InventoryItem) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.sku} • {item.category}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'warehouseStock',
      header: 'Warehouse',
      render: (item: InventoryItem) => <span className="font-medium">{item.warehouseStock.toLocaleString()}</span>,
    },
    {
      key: 'distributorStock',
      header: 'Distributor Stock',
      render: (item: InventoryItem) => (
        <div className="text-sm">
          {Object.entries(item.distributorStock).map(([dist, qty]) => (
            <div key={dist} className="flex justify-between">
              <span className="text-muted-foreground truncate max-w-[100px]">{dist.split(' ')[0]}:</span>
              <span>{qty.toLocaleString()}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'totalStock',
      header: 'Total',
      render: (item: InventoryItem) => (
        <span className={`font-semibold ${item.totalStock < item.reorderLevel ? 'text-destructive' : 'text-foreground'}`}>
          {item.totalStock.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'expiryAlerts',
      header: 'Expiry Alerts',
      render: (item: InventoryItem) => (
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
      render: (item: StockEntry) => (
        <div>
          <p className="font-medium text-foreground">{item.productName}</p>
          <p className="text-xs text-muted-foreground">{item.sku}</p>
        </div>
      ),
    },
    { key: 'batchNumber', header: 'Batch #' },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (item: StockEntry) => <span className="font-medium">{item.quantity.toLocaleString()}</span>,
    },
    { key: 'warehouse', header: 'Warehouse' },
    {
      key: 'dates',
      header: 'Mfg / Expiry',
      render: (item: StockEntry) => (
        <div className="text-sm">
          <p>Mfg: {item.manufacturingDate}</p>
          <p>Exp: {item.expiryDate}</p>
        </div>
      ),
    },
    {
      key: 'purchasePrice',
      header: 'Price',
      render: (item: StockEntry) => <span>₹{item.purchasePrice}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: StockEntry) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: StockEntry) => (
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
      render: (item: ExpiryAlert) => (
        <div>
          <p className="font-medium text-foreground">{item.name}</p>
          <p className="text-xs text-muted-foreground">{item.sku} • Batch: {item.batchNumber}</p>
        </div>
      ),
    },
    { key: 'location', header: 'Location' },
    { key: 'quantity', header: 'Quantity' },
    {
      key: 'expiryDate',
      header: 'Expiry Date',
      render: (item: ExpiryAlert) => (
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-muted-foreground" />
          <span>{item.expiryDate}</span>
        </div>
      ),
    },
    {
      key: 'daysToExpiry',
      header: 'Days Left',
      render: (item: ExpiryAlert) => (
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
      key: 'transferNumber',
      header: 'Transfer #',
      render: (item: StockTransfer) => (
        <p className="font-medium text-foreground">{item.transferNumber}</p>
      ),
    },
    {
      key: 'route',
      header: 'From → To',
      render: (item: StockTransfer) => (
        <div className="flex items-center gap-2 text-sm">
          <span>{item.fromDistributor}</span>
          <ArrowRightLeft size={14} className="text-muted-foreground" />
          <span>{item.toDistributor}</span>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      render: (item: StockTransfer) => (
        <div className="text-sm">
          {item.items.map((i, idx) => (
            <p key={idx}>{i.name} x {i.quantity}</p>
          ))}
        </div>
      ),
    },
    { key: 'createdAt', header: 'Date' },
    {
      key: 'status',
      header: 'Status',
      render: (item: StockTransfer) => <StatusBadge status={item.status} />,
    },
  ];

  const stats = {
    totalSKUs: mockInventory.length,
    lowStock: mockInventory.filter(i => i.totalStock < i.reorderLevel).length,
    expiryAlerts: mockExpiryAlerts.length,
    pendingEntries: stockEntries.filter(e => e.status === 'pending').length,
    pendingTransfers: mockTransfers.filter(t => t.status === 'pending' || t.status === 'approved').length,
  };

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
            <div className="p-3 rounded-xl bg-secondary/10">
              <Warehouse size={24} className="text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.pendingEntries}</p>
              <p className="text-sm text-muted-foreground">Pending Entries</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-info/10">
              <ArrowRightLeft size={24} className="text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.pendingTransfers}</p>
              <p className="text-sm text-muted-foreground">Pending Transfers</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'inventory' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          Stock Overview
        </button>
        <button
          onClick={() => setActiveTab('stock-entry')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'stock-entry' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          Stock Entries ({stockEntries.length})
        </button>
        <button
          onClick={() => setActiveTab('expiry')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'expiry' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          Expiry Alerts ({stats.expiryAlerts})
        </button>
        <button
          onClick={() => setActiveTab('transfers')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'transfers' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          Stock Transfers
        </button>
      </div>

      {/* Content */}
      {activeTab === 'inventory' && (
        <DataTable data={mockInventory} columns={inventoryColumns} searchPlaceholder="Search products..." />
      )}
      {activeTab === 'stock-entry' && (
        <DataTable data={stockEntries} columns={stockEntryColumns} searchPlaceholder="Search stock entries..." />
      )}
      {activeTab === 'expiry' && (
        <DataTable data={mockExpiryAlerts} columns={expiryColumns} searchPlaceholder="Search expiry alerts..." />
      )}
      {activeTab === 'transfers' && (
        <DataTable data={mockTransfers} columns={transferColumns} searchPlaceholder="Search transfers..." />
      )}

      {/* Add Stock Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Add Stock Entry</h2>
              <button onClick={() => setShowStockModal(false)} className="p-2 hover:bg-muted rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Product *</label>
                <select
                  value={stockForm.sku}
                  onChange={(e) => setStockForm({ ...stockForm, sku: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p.sku} value={p.sku}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Batch Number *</label>
                  <input
                    type="text"
                    value={stockForm.batchNumber}
                    onChange={(e) => setStockForm({ ...stockForm, batchNumber: e.target.value })}
                    placeholder="e.g., BA2024011"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Quantity *</label>
                  <input
                    type="number"
                    value={stockForm.quantity}
                    onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
                    placeholder="Enter quantity"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Warehouse *</label>
                <select
                  value={stockForm.warehouse}
                  onChange={(e) => setStockForm({ ...stockForm, warehouse: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select Warehouse</option>
                  {warehouses.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Manufacturing Date</label>
                  <input
                    type="date"
                    value={stockForm.manufacturingDate}
                    onChange={(e) => setStockForm({ ...stockForm, manufacturingDate: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={stockForm.expiryDate}
                    onChange={(e) => setStockForm({ ...stockForm, expiryDate: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Purchase Price (₹)</label>
                <input
                  type="number"
                  value={stockForm.purchasePrice}
                  onChange={(e) => setStockForm({ ...stockForm, purchasePrice: e.target.value })}
                  placeholder="Enter price per unit"
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowStockModal(false)} className="btn-outline">Cancel</button>
              <button onClick={handleCreateStock} className="btn-primary">Create Entry</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Stock Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Create Stock Transfer</h2>
              <button onClick={() => setShowTransferModal(false)} className="p-2 hover:bg-muted rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">From *</label>
                  <select
                    value={transferForm.fromDistributor}
                    onChange={(e) => setTransferForm({ ...transferForm, fromDistributor: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select Source</option>
                    {distributors.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">To *</label>
                  <select
                    value={transferForm.toDistributor}
                    onChange={(e) => setTransferForm({ ...transferForm, toDistributor: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select Destination</option>
                    {distributors.filter(d => d !== transferForm.fromDistributor).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Items *</label>
                {transferForm.items.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <select
                      value={item.sku}
                      onChange={(e) => updateTransferItem(index, 'sku', e.target.value)}
                      className="input-field flex-1"
                    >
                      <option value="">Select Product</option>
                      {products.map((p) => (
                        <option key={p.sku} value={p.sku}>{p.name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateTransferItem(index, 'quantity', e.target.value)}
                      placeholder="Qty"
                      className="input-field w-24"
                    />
                    {transferForm.items.length > 1 && (
                      <button
                        onClick={() => removeTransferItem(index)}
                        className="p-2 hover:bg-destructive/10 rounded-lg"
                      >
                        <Trash2 size={16} className="text-destructive" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addTransferItem}
                  className="text-sm text-primary hover:underline"
                >
                  + Add Another Item
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowTransferModal(false)} className="btn-outline">Cancel</button>
              <button onClick={handleCreateTransfer} className="btn-primary">Create Transfer</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
