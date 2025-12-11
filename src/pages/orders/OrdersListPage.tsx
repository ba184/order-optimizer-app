import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge, StatusType } from '@/components/ui/StatusBadge';
import { useOrders } from '@/hooks/useOrdersData';
import {
  Plus,
  ShoppingCart,
  Eye,
  FileText,
  CheckCircle,
  Clock,
  Truck,
  IndianRupee,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';

const formatCurrency = (value: number) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
};

export default function OrdersListPage() {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const { data: orders = [], isLoading } = useOrders();

  const filteredOrders = orders.filter(order => {
    if (filterType !== 'all' && order.order_type !== filterType) return false;
    if (filterStatus !== 'all' && order.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    approved: orders.filter(o => o.status === 'approved').length,
    dispatched: orders.filter(o => o.status === 'dispatched').length,
    totalValue: orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + Number(o.total_amount), 0),
  };

  const columns = [
    {
      key: 'order_number',
      header: 'Order',
      render: (item: typeof orders[0]) => (
        <div>
          <p className="font-medium text-foreground">{item.order_number}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            item.order_type === 'primary' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
          }`}>
            {item.order_type === 'primary' ? 'Primary' : 'Secondary'}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'distributor',
      header: 'Distributor',
      render: (item: typeof orders[0]) => (
        <div>
          <p className="font-medium text-foreground">{item.distributor?.firm_name || '-'}</p>
          {item.retailer?.shop_name && (
            <p className="text-xs text-muted-foreground">→ {item.retailer.shop_name}</p>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'items_count',
      header: 'Items',
      sortable: true,
    },
    {
      key: 'total_amount',
      header: 'Amount',
      render: (item: typeof orders[0]) => (
        <span className="font-semibold text-foreground">{formatCurrency(Number(item.total_amount))}</span>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Order Status',
      render: (item: typeof orders[0]) => <StatusBadge status={item.status as StatusType} />,
    },
    {
      key: 'payment_status',
      header: 'Payment',
      render: (item: typeof orders[0]) => <StatusBadge status={item.payment_status as StatusType} />,
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (item: typeof orders[0]) => (
        <div>
          <p className="text-sm">{format(new Date(item.created_at), 'dd MMM yyyy')}</p>
          <p className="text-xs text-muted-foreground">{item.creator?.name || '-'}</p>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: typeof orders[0]) => (
        <div className="flex items-center gap-1">
          <button 
            onClick={() => navigate(`/orders/${item.id}`)}
            className="p-2 hover:bg-muted rounded-lg transition-colors" 
            title="View"
          >
            <Eye size={16} className="text-muted-foreground" />
          </button>
          <button 
            onClick={() => navigate(`/orders/${item.id}?invoice=true`)}
            className="p-2 hover:bg-muted rounded-lg transition-colors" 
            title="Invoice"
          >
            <FileText size={16} className="text-muted-foreground" />
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
