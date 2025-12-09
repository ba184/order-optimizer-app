import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge, StatusType } from '@/components/ui/StatusBadge';
import {
  ArrowLeft,
  Store,
  MapPin,
  Phone,
  Building2,
  IndianRupee,
  ShoppingCart,
  FileText,
  Gift,
  Camera,
  Edit,
  Plus,
  Calendar,
  Star,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

const mockRetailer = {
  id: 'r-001',
  code: 'RET-DEL-001',
  shopName: 'New Sharma Store',
  ownerName: 'Mohan Sharma',
  address: 'Shop 12, Karol Bagh Market',
  city: 'New Delhi',
  state: 'Delhi',
  zone: 'North Zone',
  area: 'Karol Bagh',
  pincode: '110005',
  phone: '+91 98765 12345',
  category: 'A',
  distributorId: 'd-001',
  distributorName: 'Krishna Traders',
  status: 'active' as StatusType,
  assignedSE: 'Rajesh Kumar',
  createdAt: '2024-03-15',
  lastVisit: '2024-12-08',
  lastOrderDate: '2024-12-08',
  lastOrderValue: 15500,
  totalOrders: 48,
  totalOrderValue: 680000,
  avgOrderValue: 14167,
  visitFrequency: 'Weekly',
  competitorBrands: ['Brand X', 'Brand Y', 'Brand Z'],
  photos: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
};

const mockOrders: { id: string; orderNumber: string; date: string; items: number; amount: number; status: StatusType }[] = [
  { id: 'ord-001', orderNumber: 'ORD-2024-4567', date: '2024-12-08', items: 5, amount: 15500, status: 'delivered' },
  { id: 'ord-002', orderNumber: 'ORD-2024-4234', date: '2024-12-01', items: 4, amount: 12000, status: 'delivered' },
  { id: 'ord-003', orderNumber: 'ORD-2024-3987', date: '2024-11-24', items: 6, amount: 18500, status: 'delivered' },
  { id: 'ord-004', orderNumber: 'ORD-2024-3654', date: '2024-11-17', items: 3, amount: 9500, status: 'delivered' },
];

const mockVisits = [
  { id: 'v-001', date: '2024-12-08', visitedBy: 'Rajesh Kumar', duration: '25 mins', orderPlaced: true, notes: 'Regular order placed' },
  { id: 'v-002', date: '2024-12-01', visitedBy: 'Rajesh Kumar', duration: '30 mins', orderPlaced: true, notes: 'Discussed new products' },
  { id: 'v-003', date: '2024-11-24', visitedBy: 'Rajesh Kumar', duration: '20 mins', orderPlaced: true, notes: 'Quick visit' },
];

const mockSchemes: { id: string; name: string; type: string; benefit: string; status: StatusType }[] = [
  { id: 'sch-001', name: 'Winter Bonanza', type: 'volume', benefit: '10% Discount', status: 'active' },
  { id: 'sch-002', name: 'Display Scheme', type: 'display', benefit: 'Free Stand', status: 'active' },
];

type TabType = 'overview' | 'orders' | 'visits' | 'schemes' | 'photos';

const categoryColors = {
  A: 'bg-success text-success-foreground',
  B: 'bg-warning text-warning-foreground',
  C: 'bg-muted text-muted-foreground',
};

export default function RetailerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Store },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'visits', label: 'Visit History', icon: MapPin },
    { id: 'schemes', label: 'Schemes', icon: Gift },
    { id: 'photos', label: 'Photos', icon: Camera },
  ];

  const formatCurrency = (value: number) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
    return `₹${value}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Store size={24} className="text-secondary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">{mockRetailer.shopName}</h1>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${categoryColors[mockRetailer.category as keyof typeof categoryColors]}`}>
                  Category {mockRetailer.category}
                </span>
              </div>
              <p className="text-muted-foreground">{mockRetailer.code}</p>
            </div>
          </div>
        </div>
        <StatusBadge status={mockRetailer.status} />
        <button className="btn-outline flex items-center gap-2">
          <Edit size={16} />
          Edit
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10">
                  <ShoppingCart size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{mockRetailer.totalOrders}</p>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-success/10">
                  <IndianRupee size={20} className="text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(mockRetailer.totalOrderValue)}</p>
                  <p className="text-xs text-muted-foreground">Total Business</p>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-secondary/10">
                  <TrendingUp size={20} className="text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(mockRetailer.avgOrderValue)}</p>
                  <p className="text-xs text-muted-foreground">Avg Order</p>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-warning/10">
                  <Calendar size={20} className="text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{mockRetailer.lastVisit}</p>
                  <p className="text-xs text-muted-foreground">Last Visit</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4">Shop Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Owner Name</span>
                  <span className="font-medium text-foreground">{mockRetailer.ownerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${categoryColors[mockRetailer.category as keyof typeof categoryColors]}`}>
                    {mockRetailer.category}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Visit Frequency</span>
                  <span className="font-medium text-foreground">{mockRetailer.visitFrequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Since</span>
                  <span className="font-medium text-foreground">{mockRetailer.createdAt}</span>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4">Contact & Location</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium text-foreground">{mockRetailer.address}</p>
                    <p className="text-sm text-muted-foreground">{mockRetailer.city}, {mockRetailer.state} - {mockRetailer.pincode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-muted-foreground" />
                  <span className="text-foreground">{mockRetailer.phone}</span>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-sm text-muted-foreground">Zone: <span className="text-foreground">{mockRetailer.zone}</span></p>
                  <p className="text-sm text-muted-foreground">Area: <span className="text-foreground">{mockRetailer.area}</span></p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4">Distributor</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{mockRetailer.distributorName}</p>
                  <p className="text-sm text-muted-foreground">{mockRetailer.distributorId}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">Assigned SE: <span className="text-foreground">{mockRetailer.assignedSE}</span></p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4">Competitor Intelligence</h3>
              <div className="flex flex-wrap gap-2">
                {mockRetailer.competitorBrands.map((brand, index) => (
                  <span key={index} className="px-3 py-1 bg-muted rounded-full text-sm text-foreground">
                    {brand}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">Order History</h3>
            <button onClick={() => navigate('/orders/new')} className="btn-primary flex items-center gap-2">
              <Plus size={16} />
              New Order
            </button>
          </div>
          <DataTable
            data={mockOrders}
            columns={[
              { key: 'orderNumber', header: 'Order #', sortable: true },
              { key: 'date', header: 'Date', sortable: true },
              { key: 'items', header: 'Items' },
              { key: 'amount', header: 'Amount', render: (item) => formatCurrency(item.amount) },
              { key: 'status', header: 'Status', render: (item) => <StatusBadge status={item.status} /> },
            ]}
          />
        </div>
      )}

      {activeTab === 'visits' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Visit History</h3>
          <DataTable
            data={mockVisits}
            columns={[
              { key: 'date', header: 'Date' },
              { key: 'visitedBy', header: 'Visited By' },
              { key: 'duration', header: 'Duration' },
              { key: 'orderPlaced', header: 'Order', render: (item) => item.orderPlaced ? <span className="text-success">Yes</span> : <span className="text-muted-foreground">No</span> },
              { key: 'notes', header: 'Notes' },
            ]}
          />
        </div>
      )}

      {activeTab === 'schemes' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Applicable Schemes</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {mockSchemes.map((scheme) => (
              <motion.div
                key={scheme.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card rounded-xl border border-border p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium capitalize">
                    {scheme.type}
                  </span>
                  <StatusBadge status={scheme.status} />
                </div>
                <h4 className="font-semibold text-foreground mb-2">{scheme.name}</h4>
                <p className="text-lg font-bold text-primary">{scheme.benefit}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'photos' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">Shop Photos</h3>
            <button className="btn-outline flex items-center gap-2">
              <Camera size={16} />
              Upload Photo
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mockRetailer.photos.map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="aspect-square rounded-xl bg-muted flex items-center justify-center"
              >
                <Camera size={32} className="text-muted-foreground" />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
