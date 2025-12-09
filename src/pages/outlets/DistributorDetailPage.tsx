import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge, StatusType } from '@/components/ui/StatusBadge';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  IndianRupee,
  ShoppingCart,
  FileText,
  Gift,
  Store,
  Truck,
  Edit,
  Plus,
  Calendar,
  Package,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const mockDistributor = {
  id: 'd-001',
  code: 'DIST-DEL-001',
  firmName: 'Krishna Traders',
  ownerName: 'Ramesh Krishna',
  gstin: '07AABCT1234K1ZK',
  pan: 'AABCT1234K',
  address: '123 Industrial Area, Kirti Nagar',
  city: 'New Delhi',
  state: 'Delhi',
  zone: 'North Zone',
  area: 'Kirti Nagar',
  pincode: '110015',
  phone: '+91 98765 43210',
  email: 'krishna.traders@email.com',
  creditLimit: 500000,
  creditDays: 30,
  outstandingAmount: 125000,
  status: 'active' as StatusType,
  assignedSE: 'Rajesh Kumar',
  assignedASM: 'Priya Sharma',
  createdAt: '2024-01-15',
  lastOrderDate: '2024-12-08',
  totalOrders: 156,
  totalOrderValue: 4500000,
  avgMonthlyBusiness: 375000,
};

const mockOrders: { id: string; orderNumber: string; date: string; items: number; amount: number; status: StatusType }[] = [
  { id: 'ord-001', orderNumber: 'ORD-2024-1234', date: '2024-12-08', items: 12, amount: 45000, status: 'delivered' },
  { id: 'ord-002', orderNumber: 'ORD-2024-1189', date: '2024-12-05', items: 8, amount: 32000, status: 'dispatched' },
  { id: 'ord-003', orderNumber: 'ORD-2024-1145', date: '2024-12-01', items: 15, amount: 58000, status: 'delivered' },
  { id: 'ord-004', orderNumber: 'ORD-2024-1098', date: '2024-11-28', items: 6, amount: 24000, status: 'delivered' },
];

const mockClaims: { id: string; claimNumber: string; date: string; type: string; items: number; amount: number; status: StatusType }[] = [
  { id: 'clm-001', claimNumber: 'CLM-2024-045', date: '2024-12-05', type: 'return', items: 3, amount: 4500, status: 'pending' },
  { id: 'clm-002', claimNumber: 'CLM-2024-032', date: '2024-11-28', type: 'damage', items: 2, amount: 2800, status: 'approved' },
  { id: 'clm-003', claimNumber: 'CLM-2024-018', date: '2024-11-15', type: 'expiry', items: 5, amount: 8500, status: 'settled' },
];

const mockSchemes: { id: string; name: string; type: string; discount: string; validity: string; status: StatusType }[] = [
  { id: 'sch-001', name: 'Winter Bonanza', type: 'volume', discount: '10%', validity: 'Dec 1-31, 2024', status: 'active' },
  { id: 'sch-002', name: 'Buy 10 Get 1', type: 'product', discount: 'Free Goods', validity: 'Dec 1-15, 2024', status: 'active' },
  { id: 'sch-003', name: 'Opening Scheme', type: 'opening', discount: '15%', validity: 'On New Counters', status: 'active' },
];

const mockSecondarySales: { id: string; retailer: string; date: string; amount: number; status: StatusType }[] = [
  { id: 'ss-001', retailer: 'Sharma Store', date: '2024-12-08', amount: 15500, status: 'verified' },
  { id: 'ss-002', retailer: 'Gupta General', date: '2024-12-07', amount: 8200, status: 'verified' },
  { id: 'ss-003', retailer: 'Jain Provisions', date: '2024-12-06', amount: 22000, status: 'pending' },
];

const mockDispatches: { id: string; invoiceNo: string; date: string; items: number; amount: number; vehicleNo: string; status: StatusType }[] = [
  { id: 'dsp-001', invoiceNo: 'INV-2024-4567', date: '2024-12-08', items: 12, amount: 45000, vehicleNo: 'DL-01-AB-1234', status: 'validated' },
  { id: 'dsp-002', invoiceNo: 'INV-2024-4498', date: '2024-12-05', items: 8, amount: 32000, vehicleNo: 'DL-02-CD-5678', status: 'pending' },
];

type TabType = 'overview' | 'orders' | 'claims' | 'schemes' | 'secondary' | 'dispatch';

export default function DistributorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'claims', label: 'Claims & Returns', icon: FileText },
    { id: 'schemes', label: 'Schemes', icon: Gift },
    { id: 'secondary', label: 'Secondary Sales', icon: Store },
    { id: 'dispatch', label: 'Dispatch', icon: Truck },
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
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{mockDistributor.firmName}</h1>
              <p className="text-muted-foreground">{mockDistributor.code}</p>
            </div>
          </div>
        </div>
        <StatusBadge status={mockDistributor.status} />
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
                  <IndianRupee size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(mockDistributor.creditLimit)}</p>
                  <p className="text-xs text-muted-foreground">Credit Limit</p>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-warning/10">
                  <IndianRupee size={20} className="text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(mockDistributor.outstandingAmount)}</p>
                  <p className="text-xs text-muted-foreground">Outstanding</p>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-success/10">
                  <ShoppingCart size={20} className="text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{mockDistributor.totalOrders}</p>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-secondary/10">
                  <IndianRupee size={20} className="text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(mockDistributor.avgMonthlyBusiness)}</p>
                  <p className="text-xs text-muted-foreground">Avg Monthly</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4">Business Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Owner Name</span>
                  <span className="font-medium text-foreground">{mockDistributor.ownerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GSTIN</span>
                  <span className="font-medium text-foreground">{mockDistributor.gstin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PAN</span>
                  <span className="font-medium text-foreground">{mockDistributor.pan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Credit Days</span>
                  <span className="font-medium text-foreground">{mockDistributor.creditDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Since</span>
                  <span className="font-medium text-foreground">{mockDistributor.createdAt}</span>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4">Contact & Location</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium text-foreground">{mockDistributor.address}</p>
                    <p className="text-sm text-muted-foreground">{mockDistributor.city}, {mockDistributor.state} - {mockDistributor.pincode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-muted-foreground" />
                  <span className="text-foreground">{mockDistributor.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-muted-foreground" />
                  <span className="text-foreground">{mockDistributor.email}</span>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-sm text-muted-foreground">Zone: <span className="text-foreground">{mockDistributor.zone}</span></p>
                  <p className="text-sm text-muted-foreground">Area: <span className="text-foreground">{mockDistributor.area}</span></p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4">Assigned Team</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sales Executive</span>
                  <span className="font-medium text-foreground">{mockDistributor.assignedSE}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Area Sales Manager</span>
                  <span className="font-medium text-foreground">{mockDistributor.assignedASM}</span>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4">Credit Utilization</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Used</span>
                  <span className="text-foreground">{formatCurrency(mockDistributor.outstandingAmount)} / {formatCurrency(mockDistributor.creditLimit)}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-warning rounded-full"
                    style={{ width: `${(mockDistributor.outstandingAmount / mockDistributor.creditLimit) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Available: <span className="text-success font-medium">{formatCurrency(mockDistributor.creditLimit - mockDistributor.outstandingAmount)}</span>
                </p>
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

      {activeTab === 'claims' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">Claims & Returns</h3>
            <button className="btn-primary flex items-center gap-2">
              <Plus size={16} />
              New Claim
            </button>
          </div>
          <DataTable
            data={mockClaims}
            columns={[
              { key: 'claimNumber', header: 'Claim #' },
              { key: 'date', header: 'Date' },
              { key: 'type', header: 'Type', render: (item) => <span className="capitalize">{item.type}</span> },
              { key: 'items', header: 'Items' },
              { key: 'amount', header: 'Amount', render: (item) => formatCurrency(item.amount) },
              { key: 'status', header: 'Status', render: (item) => <StatusBadge status={item.status} /> },
            ]}
          />
        </div>
      )}

      {activeTab === 'schemes' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Active Schemes</h3>
          <div className="grid md:grid-cols-3 gap-4">
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
                <p className="text-2xl font-bold text-primary mb-1">{scheme.discount}</p>
                <p className="text-xs text-muted-foreground">{scheme.validity}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'secondary' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Secondary Counter Sales</h3>
          <DataTable
            data={mockSecondarySales}
            columns={[
              { key: 'retailer', header: 'Retailer' },
              { key: 'date', header: 'Date' },
              { key: 'amount', header: 'Amount', render: (item) => formatCurrency(item.amount) },
              { key: 'status', header: 'Status', render: (item) => <StatusBadge status={item.status} /> },
            ]}
          />
        </div>
      )}

      {activeTab === 'dispatch' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Dispatch Validation</h3>
          <DataTable
            data={mockDispatches}
            columns={[
              { key: 'invoiceNo', header: 'Invoice #' },
              { key: 'date', header: 'Date' },
              { key: 'items', header: 'Items' },
              { key: 'amount', header: 'Amount', render: (item) => formatCurrency(item.amount) },
              { key: 'vehicleNo', header: 'Vehicle' },
              { key: 'status', header: 'Status', render: (item) => <StatusBadge status={item.status} /> },
              {
                key: 'actions',
                header: 'Actions',
                render: (item) => item.status === 'pending' && (
                  <div className="flex gap-1">
                    <button onClick={() => toast.success('Dispatch validated')} className="p-2 hover:bg-success/10 rounded-lg">
                      <CheckCircle size={16} className="text-success" />
                    </button>
                    <button onClick={() => toast.error('Dispatch rejected')} className="p-2 hover:bg-destructive/10 rounded-lg">
                      <XCircle size={16} className="text-destructive" />
                    </button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}
    </div>
  );
}
