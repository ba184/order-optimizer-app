import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Plus,
  ShoppingCart,
  Eye,
  FileText,
  CheckCircle,
  Clock,
  Package,
  XCircle,
  IndianRupee,
  Truck,
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  type: 'primary' | 'secondary';
  distributorName: string;
  retailerName?: string;
  items: number;
  totalAmount: number;
  status: 'draft' | 'pending' | 'approved' | 'dispatched' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'partial' | 'paid';
  createdBy: string;
  createdAt: string;
}

const mockOrders: Order[] = [
  {
    id: 'o-001',
    orderNumber: 'ORD-2024-001',
    type: 'primary',
    distributorName: 'Krishna Traders',
    items: 12,
    totalAmount: 245000,
    status: 'approved',
    paymentStatus: 'pending',
    createdBy: 'Rajesh Kumar',
    createdAt: '2024-12-09 10:30 AM',
  },
  {
    id: 'o-002',
    orderNumber: 'ORD-2024-002',
    type: 'secondary',
    distributorName: 'Krishna Traders',
    retailerName: 'New Sharma Store',
    items: 8,
    totalAmount: 15500,
    status: 'dispatched',
    paymentStatus: 'paid',
    createdBy: 'Rajesh Kumar',
    createdAt: '2024-12-09 09:15 AM',
  },
  {
    id: 'o-003',
    orderNumber: 'ORD-2024-003',
    type: 'primary',
    distributorName: 'Sharma Distributors',
    items: 25,
    totalAmount: 520000,
    status: 'pending',
    paymentStatus: 'pending',
    createdBy: 'Amit Sharma',
    createdAt: '2024-12-08 04:45 PM',
  },
  {
    id: 'o-004',
    orderNumber: 'ORD-2024-004',
    type: 'secondary',
    distributorName: 'Sharma Distributors',
    retailerName: 'Gupta General Store',
    items: 5,
    totalAmount: 8200,
    status: 'delivered',
    paymentStatus: 'paid',
    createdBy: 'Priya Singh',
    createdAt: '2024-12-08 02:30 PM',
  },
  {
    id: 'o-005',
    orderNumber: 'ORD-2024-005',
    type: 'primary',
    distributorName: 'Patel Trading Co',
    items: 18,
    totalAmount: 380000,
    status: 'cancelled',
    paymentStatus: 'pending',
    createdBy: 'Vikram Patel',
    createdAt: '2024-12-07 11:00 AM',
  },
];

const formatCurrency = (value: number) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
};

const columns = [
  {
    key: 'orderNumber',
    header: 'Order',
    render: (item: Order) => (
      <div>
        <p className="font-medium text-foreground">{item.orderNumber}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          item.type === 'primary' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
        }`}>
          {item.type === 'primary' ? 'Primary' : 'Secondary'}
        </span>
      </div>
    ),
    sortable: true,
  },
  {
    key: 'distributorName',
    header: 'Distributor',
    render: (item: Order) => (
      <div>
        <p className="font-medium text-foreground">{item.distributorName}</p>
        {item.retailerName && (
          <p className="text-xs text-muted-foreground">→ {item.retailerName}</p>
        )}
      </div>
    ),
    sortable: true,
  },
  {
    key: 'items',
    header: 'Items',
    sortable: true,
  },
  {
    key: 'totalAmount',
    header: 'Amount',
    render: (item: Order) => (
      <span className="font-semibold text-foreground">{formatCurrency(item.totalAmount)}</span>
    ),
    sortable: true,
  },
  {
    key: 'status',
    header: 'Order Status',
    render: (item: Order) => <StatusBadge status={item.status} />,
  },
  {
    key: 'paymentStatus',
    header: 'Payment',
    render: (item: Order) => <StatusBadge status={item.paymentStatus} />,
  },
  {
    key: 'createdAt',
    header: 'Created',
    render: (item: Order) => (
      <div>
        <p className="text-sm">{item.createdAt.split(' ')[0]}</p>
        <p className="text-xs text-muted-foreground">{item.createdBy}</p>
      </div>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (item: Order) => (
      <div className="flex items-center gap-1">
        <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="View">
          <Eye size={16} className="text-muted-foreground" />
        </button>
        <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Invoice">
          <FileText size={16} className="text-muted-foreground" />
        </button>
      </div>
    ),
  },
];

export default function OrdersListPage() {
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredOrders = mockOrders.filter(order => {
    if (filterType !== 'all' && order.type !== filterType) return false;
    if (filterStatus !== 'all' && order.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: mockOrders.length,
    pending: mockOrders.filter(o => o.status === 'pending').length,
    approved: mockOrders.filter(o => o.status === 'approved').length,
    dispatched: mockOrders.filter(o => o.status === 'dispatched').length,
    totalValue: mockOrders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.totalAmount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Orders</h1>
          <p className="text-muted-foreground">Manage primary and secondary orders</p>
        </div>
        <a href="/orders/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Create Order
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <ShoppingCart size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <Clock size={24} className="text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <CheckCircle size={24} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-info/10">
              <Truck size={24} className="text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.dispatched}</p>
              <p className="text-sm text-muted-foreground">Dispatched</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10">
              <IndianRupee size={24} className="text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalValue)}</p>
              <p className="text-sm text-muted-foreground">Total Value</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="input-field w-40"
        >
          <option value="all">All Types</option>
          <option value="primary">Primary</option>
          <option value="secondary">Secondary</option>
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="input-field w-40"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="dispatched">Dispatched</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredOrders}
        columns={columns}
        searchPlaceholder="Search orders..."
      />
    </div>
  );
}
