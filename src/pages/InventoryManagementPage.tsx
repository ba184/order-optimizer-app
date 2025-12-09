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

export default function InventoryManagementPage() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'expiry' | 'transfers'>('inventory');

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
    pendingTransfers: mockTransfers.filter(t => t.status === 'pending' || t.status === 'approved').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Inventory Management</h1>
          <p className="text-muted-foreground">Track stock levels, expiry, and transfers</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-outline flex items-center gap-2">
            <RefreshCw size={18} />
            Sync Stock
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Stock Transfer
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
      {activeTab === 'expiry' && (
        <DataTable data={mockExpiryAlerts} columns={expiryColumns} searchPlaceholder="Search expiry alerts..." />
      )}
      {activeTab === 'transfers' && (
        <DataTable data={mockTransfers} columns={transferColumns} searchPlaceholder="Search transfers..." />
      )}
    </div>
  );
}
