import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Gift,
  Plus,
  Calendar,
  Percent,
  Package,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface Scheme {
  id: string;
  name: string;
  type: 'volume' | 'product' | 'opening' | 'display';
  description: string;
  startDate: string;
  endDate: string;
  minQuantity?: number;
  freeQuantity?: number;
  discountPercent?: number;
  applicableProducts: string[];
  status: 'active' | 'pending' | 'inactive';
}

const mockSchemes: Scheme[] = [
  {
    id: 's-001',
    name: 'Buy 10 Get 1 Free',
    type: 'volume',
    description: 'Purchase 10 units of any product and get 1 unit free',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    minQuantity: 10,
    freeQuantity: 1,
    applicableProducts: ['All Products'],
    status: 'active',
  },
  {
    id: 's-002',
    name: 'New Retailer Opening',
    type: 'opening',
    description: '10% discount on first order for new retailers',
    startDate: '2024-11-01',
    endDate: '2025-03-31',
    discountPercent: 10,
    applicableProducts: ['All Products'],
    status: 'active',
  },
  {
    id: 's-003',
    name: 'Product Alpha Combo',
    type: 'product',
    description: 'Buy 5 Alpha 500ml, get 1 Beta 1L free',
    startDate: '2024-12-01',
    endDate: '2024-12-15',
    minQuantity: 5,
    freeQuantity: 1,
    applicableProducts: ['Product Alpha 500ml', 'Product Beta 1L'],
    status: 'active',
  },
  {
    id: 's-004',
    name: 'Display Incentive',
    type: 'display',
    description: '₹500 incentive for prominent product display',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    applicableProducts: ['Product Delta Pack', 'Product Zeta Combo'],
    status: 'pending',
  },
  {
    id: 's-005',
    name: 'Holiday Volume Bonus',
    type: 'volume',
    description: 'Extra 5% discount on orders above ₹50,000',
    startDate: '2024-12-20',
    endDate: '2025-01-05',
    discountPercent: 5,
    applicableProducts: ['All Products'],
    status: 'pending',
  },
];

const typeColors = {
  volume: 'bg-primary/10 text-primary',
  product: 'bg-secondary/10 text-secondary',
  opening: 'bg-success/10 text-success',
  display: 'bg-warning/10 text-warning',
};

const columns = [
  {
    key: 'name',
    header: 'Scheme',
    render: (item: Scheme) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
          <Gift size={20} className="text-primary" />
        </div>
        <div>
          <p className="font-medium text-foreground">{item.name}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[item.type]}`}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </span>
        </div>
      </div>
    ),
    sortable: true,
  },
  {
    key: 'description',
    header: 'Description',
    render: (item: Scheme) => (
      <p className="text-sm text-muted-foreground max-w-[250px] truncate">
        {item.description}
      </p>
    ),
  },
  {
    key: 'validity',
    header: 'Validity',
    render: (item: Scheme) => (
      <div className="flex items-center gap-2 text-sm">
        <Calendar size={14} className="text-muted-foreground" />
        <span>{item.startDate} - {item.endDate}</span>
      </div>
    ),
  },
  {
    key: 'benefit',
    header: 'Benefit',
    render: (item: Scheme) => (
      <div className="text-sm">
        {item.freeQuantity && (
          <span className="flex items-center gap-1">
            <Package size={14} className="text-success" />
            {item.freeQuantity} Free
          </span>
        )}
        {item.discountPercent && (
          <span className="flex items-center gap-1">
            <Percent size={14} className="text-primary" />
            {item.discountPercent}% Off
          </span>
        )}
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (item: Scheme) => <StatusBadge status={item.status} />,
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (item: Scheme) => (
      <div className="flex items-center gap-1">
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <Eye size={16} className="text-muted-foreground" />
        </button>
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <Edit size={16} className="text-muted-foreground" />
        </button>
      </div>
    ),
  },
];

export default function SchemesPage() {
  const stats = {
    total: mockSchemes.length,
    active: mockSchemes.filter(s => s.status === 'active').length,
    pending: mockSchemes.filter(s => s.status === 'pending').length,
    volume: mockSchemes.filter(s => s.type === 'volume').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Schemes & Offers</h1>
          <p className="text-muted-foreground">Manage promotional schemes and offers</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Create Scheme
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Gift size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Schemes</p>
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
            <div className="p-3 rounded-xl bg-success/10">
              <CheckCircle size={24} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Active</p>
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
          transition={{ delay: 0.3 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10">
              <Package size={24} className="text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.volume}</p>
              <p className="text-sm text-muted-foreground">Volume Based</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scheme Type Tabs */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
        {['All', 'Volume', 'Product', 'Opening', 'Display'].map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'All'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <DataTable
        data={mockSchemes}
        columns={columns}
        searchPlaceholder="Search schemes..."
      />
    </div>
  );
}
