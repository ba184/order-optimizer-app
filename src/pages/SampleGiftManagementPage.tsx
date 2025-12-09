import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Plus,
  Gift,
  Package,
  Users,
  TrendingUp,
  Eye,
  Edit,
  AlertTriangle,
  Check,
  Camera,
} from 'lucide-react';
import { toast } from 'sonner';

interface Sample {
  id: string;
  sku: string;
  name: string;
  costPrice: number;
  stock: number;
  issuedThisMonth: number;
  conversions: number;
}

interface SampleIssue {
  id: string;
  sampleId: string;
  sampleName: string;
  quantity: number;
  issuedTo: string;
  issuedToType: 'retailer' | 'distributor';
  issuedBy: string;
  issuedAt: string;
  acknowledged: boolean;
  convertedToOrder: boolean;
  orderValue?: number;
}

const mockSamples: Sample[] = [
  { id: 's-001', sku: 'SMP-001', name: 'Product Alpha Sample 50ml', costPrice: 45, stock: 500, issuedThisMonth: 85, conversions: 42 },
  { id: 's-002', sku: 'SMP-002', name: 'Product Beta Trial Pack', costPrice: 80, stock: 300, issuedThisMonth: 62, conversions: 28 },
  { id: 's-003', sku: 'SMP-003', name: 'Product Gamma Sachet', costPrice: 15, stock: 1000, issuedThisMonth: 250, conversions: 95 },
  { id: 's-004', sku: 'GIFT-001', name: 'Branded Pen Set', costPrice: 120, stock: 200, issuedThisMonth: 45, conversions: 0 },
  { id: 's-005', sku: 'GIFT-002', name: 'Promotional T-Shirt', costPrice: 250, stock: 100, issuedThisMonth: 28, conversions: 0 },
];

const mockIssues: SampleIssue[] = [
  {
    id: 'si-001',
    sampleId: 's-001',
    sampleName: 'Product Alpha Sample 50ml',
    quantity: 5,
    issuedTo: 'New Sharma Store',
    issuedToType: 'retailer',
    issuedBy: 'Rajesh Kumar',
    issuedAt: '2024-12-09 10:30 AM',
    acknowledged: true,
    convertedToOrder: true,
    orderValue: 15500,
  },
  {
    id: 'si-002',
    sampleId: 's-002',
    sampleName: 'Product Beta Trial Pack',
    quantity: 3,
    issuedTo: 'Gupta General Store',
    issuedToType: 'retailer',
    issuedBy: 'Amit Sharma',
    issuedAt: '2024-12-09 11:45 AM',
    acknowledged: true,
    convertedToOrder: false,
  },
  {
    id: 'si-003',
    sampleId: 's-003',
    sampleName: 'Product Gamma Sachet',
    quantity: 20,
    issuedTo: 'Krishna Traders',
    issuedToType: 'distributor',
    issuedBy: 'Priya Singh',
    issuedAt: '2024-12-08 03:00 PM',
    acknowledged: true,
    convertedToOrder: true,
    orderValue: 45000,
  },
];

const executiveBudget = {
  monthlyBudget: 5000,
  used: 3250,
  remaining: 1750,
};

export default function SampleGiftManagementPage() {
  const [activeTab, setActiveTab] = useState<'samples' | 'issues'>('samples');
  const [showIssueModal, setShowIssueModal] = useState(false);

  const handleIssue = () => {
    toast.success('Sample issued successfully');
    setShowIssueModal(false);
  };

  const sampleColumns = [
    {
      key: 'name',
      header: 'Sample/Gift',
      render: (item: Sample) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
            {item.sku.startsWith('GIFT') ? <Gift size={20} className="text-secondary" /> : <Package size={20} className="text-primary" />}
          </div>
          <div>
            <p className="font-medium text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'costPrice',
      header: 'Cost',
      render: (item: Sample) => <span>₹{item.costPrice}</span>,
    },
    {
      key: 'stock',
      header: 'Available Stock',
      render: (item: Sample) => (
        <span className={item.stock < 100 ? 'text-destructive font-medium' : ''}>
          {item.stock}
        </span>
      ),
    },
    {
      key: 'issuedThisMonth',
      header: 'Issued (MTD)',
    },
    {
      key: 'conversions',
      header: 'Conversions',
      render: (item: Sample) => {
        const rate = item.issuedThisMonth > 0 ? ((item.conversions / item.issuedThisMonth) * 100).toFixed(0) : 0;
        return (
          <div className="flex items-center gap-2">
            <span>{item.conversions}</span>
            {item.conversions > 0 && (
              <span className="text-xs text-success">({rate}%)</span>
            )}
          </div>
        );
      },
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

  const issueColumns = [
    {
      key: 'sampleName',
      header: 'Sample/Gift',
      render: (item: SampleIssue) => (
        <div>
          <p className="font-medium text-foreground">{item.sampleName}</p>
          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
        </div>
      ),
    },
    {
      key: 'issuedTo',
      header: 'Issued To',
      render: (item: SampleIssue) => (
        <div>
          <p className="text-sm">{item.issuedTo}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            item.issuedToType === 'retailer' ? 'bg-info/10 text-info' : 'bg-primary/10 text-primary'
          }`}>
            {item.issuedToType}
          </span>
        </div>
      ),
    },
    {
      key: 'issuedBy',
      header: 'Issued By',
      render: (item: SampleIssue) => (
        <div>
          <p className="text-sm">{item.issuedBy}</p>
          <p className="text-xs text-muted-foreground">{item.issuedAt}</p>
        </div>
      ),
    },
    {
      key: 'acknowledged',
      header: 'Acknowledgement',
      render: (item: SampleIssue) => (
        item.acknowledged ? (
          <span className="flex items-center gap-1 text-success text-sm">
            <Check size={14} />
            Received
          </span>
        ) : (
          <span className="text-warning text-sm">Pending</span>
        )
      ),
    },
    {
      key: 'convertedToOrder',
      header: 'Conversion',
      render: (item: SampleIssue) => (
        item.convertedToOrder ? (
          <div className="text-success">
            <p className="text-sm font-medium flex items-center gap-1">
              <TrendingUp size={14} />
              Converted
            </p>
            {item.orderValue && (
              <p className="text-xs">₹{item.orderValue.toLocaleString()}</p>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">--</span>
        )
      ),
    },
  ];

  const stats = {
    totalSamples: mockSamples.filter(s => s.sku.startsWith('SMP')).length,
    totalGifts: mockSamples.filter(s => s.sku.startsWith('GIFT')).length,
    issuedThisMonth: mockSamples.reduce((sum, s) => sum + s.issuedThisMonth, 0),
    conversionRate: (mockSamples.reduce((sum, s) => sum + s.conversions, 0) / mockSamples.reduce((sum, s) => sum + s.issuedThisMonth, 0) * 100).toFixed(0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Sample & Gift Management</h1>
          <p className="text-muted-foreground">Track samples, gifts, and conversion metrics</p>
        </div>
        <button onClick={() => setShowIssueModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Issue Sample/Gift
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Package size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalSamples}</p>
              <p className="text-sm text-muted-foreground">Sample SKUs</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10">
              <Gift size={24} className="text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalGifts}</p>
              <p className="text-sm text-muted-foreground">Gift Items</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-info/10">
              <Users size={24} className="text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.issuedThisMonth}</p>
              <p className="text-sm text-muted-foreground">Issued (MTD)</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <TrendingUp size={24} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.conversionRate}%</p>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Budget Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h3 className="font-semibold text-foreground mb-4">Monthly Budget</h3>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Used: ₹{executiveBudget.used.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">Budget: ₹{executiveBudget.monthlyBudget.toLocaleString()}</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  (executiveBudget.used / executiveBudget.monthlyBudget) > 0.8 ? 'bg-warning' : 'bg-primary'
                }`}
                style={{ width: `${(executiveBudget.used / executiveBudget.monthlyBudget) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">₹{executiveBudget.remaining.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Remaining</p>
          </div>
        </div>
        {executiveBudget.remaining < 1000 && (
          <div className="mt-4 p-3 bg-warning/10 rounded-lg">
            <p className="text-sm text-warning flex items-center gap-2">
              <AlertTriangle size={16} />
              Low budget warning. Further issuance requires approval.
            </p>
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('samples')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'samples' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          Sample/Gift Master
        </button>
        <button
          onClick={() => setActiveTab('issues')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'issues' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          Issue History
        </button>
      </div>

      {/* Content */}
      {activeTab === 'samples' ? (
        <DataTable data={mockSamples} columns={sampleColumns} searchPlaceholder="Search samples..." />
      ) : (
        <DataTable data={mockIssues} columns={issueColumns} searchPlaceholder="Search issues..." />
      )}

      {/* Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Issue Sample/Gift</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Select Item</label>
                <select className="input-field">
                  {mockSamples.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (Stock: {s.stock})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Quantity</label>
                <input type="number" placeholder="Enter quantity" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Issue To</label>
                <select className="input-field">
                  <option value="">Select Retailer/Distributor</option>
                  <option value="r-001">New Sharma Store (Retailer)</option>
                  <option value="r-002">Gupta General Store (Retailer)</option>
                  <option value="d-001">Krishna Traders (Distributor)</option>
                </select>
              </div>
              <div className="p-4 border-2 border-dashed border-border rounded-lg text-center">
                <Camera size={24} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-foreground">Capture Acknowledgement Photo</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowIssueModal(false)} className="btn-outline">Cancel</button>
              <button onClick={handleIssue} className="btn-primary">Issue</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
