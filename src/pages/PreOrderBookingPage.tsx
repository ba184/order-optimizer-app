import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Plus,
  ShoppingBag,
  Calendar,
  Target,
  IndianRupee,
  TrendingUp,
  Eye,
  Edit,
  Package,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

interface PreOrder {
  id: string;
  orderNumber: string;
  distributorName: string;
  scheme: string;
  items: { sku: string; name: string; quantity: number }[];
  totalValue: number;
  advanceCollected: number;
  expectedDelivery: string;
  actualDelivery?: string;
  status: 'booked' | 'confirmed' | 'delivered' | 'cancelled';
  bookedBy: string;
  bookedAt: string;
}

const mockPreOrders: PreOrder[] = [
  {
    id: 'po-001',
    orderNumber: 'PRE-2024-001',
    distributorName: 'Krishna Traders',
    scheme: 'New Year Launch - Alpha Pro',
    items: [{ sku: 'AP-NEW', name: 'Alpha Pro 500ml', quantity: 500 }, { sku: 'AP-1L', name: 'Alpha Pro 1L', quantity: 200 }],
    totalValue: 175000,
    advanceCollected: 50000,
    expectedDelivery: '2025-01-05',
    status: 'confirmed',
    bookedBy: 'Rajesh Kumar',
    bookedAt: '2024-12-01',
  },
  {
    id: 'po-002',
    orderNumber: 'PRE-2024-002',
    distributorName: 'Sharma Distributors',
    scheme: 'New Year Launch - Alpha Pro',
    items: [{ sku: 'AP-NEW', name: 'Alpha Pro 500ml', quantity: 300 }],
    totalValue: 90000,
    advanceCollected: 25000,
    expectedDelivery: '2025-01-05',
    status: 'booked',
    bookedBy: 'Amit Sharma',
    bookedAt: '2024-12-05',
  },
  {
    id: 'po-003',
    orderNumber: 'PRE-2024-003',
    distributorName: 'Patel Trading Co',
    scheme: 'Festive Combo Pack',
    items: [{ sku: 'FCP-01', name: 'Festive Combo Pack', quantity: 150 }],
    totalValue: 112500,
    advanceCollected: 40000,
    expectedDelivery: '2024-12-20',
    actualDelivery: '2024-12-18',
    status: 'delivered',
    bookedBy: 'Priya Singh',
    bookedAt: '2024-11-25',
  },
];

const upcomingSchemes = [
  { id: 's-001', name: 'New Year Launch - Alpha Pro', launchDate: '2025-01-05', preOrderTarget: 50000, preOrderAchieved: 35000 },
  { id: 's-002', name: 'Republic Day Special', launchDate: '2025-01-26', preOrderTarget: 30000, preOrderAchieved: 8000 },
  { id: 's-003', name: 'Spring Collection', launchDate: '2025-03-01', preOrderTarget: 40000, preOrderAchieved: 0 },
];

const columns = [
  {
    key: 'orderNumber',
    header: 'Pre-Order #',
    render: (item: PreOrder) => (
      <div>
        <p className="font-medium text-foreground">{item.orderNumber}</p>
        <p className="text-xs text-muted-foreground">{item.bookedAt}</p>
      </div>
    ),
  },
  {
    key: 'distributorName',
    header: 'Distributor',
  },
  {
    key: 'scheme',
    header: 'Scheme',
    render: (item: PreOrder) => (
      <span className="text-sm">{item.scheme}</span>
    ),
  },
  {
    key: 'items',
    header: 'Items',
    render: (item: PreOrder) => (
      <div className="text-sm">
        {item.items.map((i, idx) => (
          <p key={idx} className="text-muted-foreground">{i.name} x {i.quantity}</p>
        ))}
      </div>
    ),
  },
  {
    key: 'totalValue',
    header: 'Value',
    render: (item: PreOrder) => (
      <div>
        <p className="font-semibold">₹{item.totalValue.toLocaleString()}</p>
        <p className="text-xs text-success">Advance: ₹{item.advanceCollected.toLocaleString()}</p>
      </div>
    ),
  },
  {
    key: 'expectedDelivery',
    header: 'Delivery',
    render: (item: PreOrder) => (
      <div className="flex items-center gap-2">
        <Calendar size={14} className="text-muted-foreground" />
        <span className="text-sm">{item.expectedDelivery}</span>
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (item: PreOrder) => <StatusBadge status={item.status} />,
  },
  {
    key: 'actions',
    header: 'Actions',
    render: () => (
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

export default function PreOrderBookingPage() {
  const [showBookingModal, setShowBookingModal] = useState(false);

  const stats = {
    totalPreOrders: mockPreOrders.length,
    totalValue: mockPreOrders.reduce((sum, p) => sum + p.totalValue, 0),
    advanceCollected: mockPreOrders.reduce((sum, p) => sum + p.advanceCollected, 0),
    delivered: mockPreOrders.filter(p => p.status === 'delivered').length,
  };

  const handleBookPreOrder = () => {
    toast.success('Pre-order booked successfully');
    setShowBookingModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Pre-Order Booking</h1>
          <p className="text-muted-foreground">Book orders for upcoming schemes and launches</p>
        </div>
        <button onClick={() => setShowBookingModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Book Pre-Order
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <ShoppingBag size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalPreOrders}</p>
              <p className="text-sm text-muted-foreground">Total Pre-Orders</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10">
              <IndianRupee size={24} className="text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">₹{(stats.totalValue / 100000).toFixed(1)}L</p>
              <p className="text-sm text-muted-foreground">Order Value</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <TrendingUp size={24} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">₹{(stats.advanceCollected / 1000).toFixed(0)}K</p>
              <p className="text-sm text-muted-foreground">Advance Collected</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-info/10">
              <CheckCircle size={24} className="text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.delivered}</p>
              <p className="text-sm text-muted-foreground">Delivered</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Upcoming Schemes */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h3 className="font-semibold text-foreground mb-4">Upcoming Schemes - Pre-Order Targets</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {upcomingSchemes.map(scheme => {
            const progress = (scheme.preOrderAchieved / scheme.preOrderTarget) * 100;
            return (
              <div key={scheme.id} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-foreground">{scheme.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar size={12} />
                      Launch: {scheme.launchDate}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${progress >= 100 ? 'bg-success' : 'bg-primary'}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Achieved: {scheme.preOrderAchieved.toLocaleString()}</span>
                    <span>Target: {scheme.preOrderTarget.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Pre-Orders Table */}
      <DataTable data={mockPreOrders} columns={columns} searchPlaceholder="Search pre-orders..." />

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-lg"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Book Pre-Order</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Scheme</label>
                <select className="input-field">
                  {upcomingSchemes.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.launchDate})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Distributor</label>
                <select className="input-field">
                  <option value="d-001">Krishna Traders</option>
                  <option value="d-002">Sharma Distributors</option>
                  <option value="d-003">Patel Trading Co</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Quantity</label>
                  <input type="number" placeholder="Enter quantity" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Advance Amount (₹)</label>
                  <input type="number" placeholder="0" className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Remarks</label>
                <textarea placeholder="Any special instructions..." rows={2} className="input-field resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowBookingModal(false)} className="btn-outline">Cancel</button>
              <button onClick={handleBookPreOrder} className="btn-primary">Book Pre-Order</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
