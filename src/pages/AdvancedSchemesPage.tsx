import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Plus,
  Gift,
  Percent,
  Package,
  Calendar,
  TrendingUp,
  Eye,
  Edit,
  Copy,
  CheckCircle,
  Clock,
  IndianRupee,
  Layers,
} from 'lucide-react';

interface AdvancedScheme {
  id: string;
  name: string;
  code: string;
  type: 'slab' | 'buy_x_get_y' | 'combo' | 'bill_wise' | 'value_wise' | 'display' | 'sample_linked' | 'retro';
  description: string;
  startDate: string;
  endDate: string;
  applicability: string;
  benefit: string;
  minValue?: number;
  maxBenefit?: number;
  claimsGenerated: number;
  claimsApproved: number;
  totalPayout: number;
  status: 'active' | 'pending' | 'inactive';
}

const mockSchemes: AdvancedScheme[] = [
  { id: 's-001', name: 'Slab Discount Dec 2024', code: 'SLAB-DEC-24', type: 'slab', description: '5% on ₹50K, 7% on ₹1L, 10% on ₹2L+', startDate: '2024-12-01', endDate: '2024-12-31', applicability: 'All Distributors', benefit: 'Up to 10% discount', minValue: 50000, maxBenefit: 25000, claimsGenerated: 45, claimsApproved: 38, totalPayout: 285000, status: 'active' },
  { id: 's-002', name: 'Buy 10 Get 1 Free', code: 'B10G1-DEC', type: 'buy_x_get_y', description: 'On Alpha & Beta series', startDate: '2024-12-01', endDate: '2024-12-31', applicability: 'All Outlets', benefit: '1 free per 10', claimsGenerated: 120, claimsApproved: 115, totalPayout: 172500, status: 'active' },
  { id: 's-003', name: 'Festive Combo Pack', code: 'FEST-COMBO', type: 'combo', description: 'Alpha + Beta + Gamma at 15% off', startDate: '2024-12-15', endDate: '2024-12-31', applicability: 'All Outlets', benefit: '15% on combo', claimsGenerated: 25, claimsApproved: 20, totalPayout: 45000, status: 'active' },
  { id: 's-004', name: 'Bill Value Bonus', code: 'BILL-BONUS', type: 'bill_wise', description: '₹500 off on bills above ₹25,000', startDate: '2024-12-01', endDate: '2024-12-31', applicability: 'Retailers Only', benefit: '₹500 flat off', minValue: 25000, claimsGenerated: 85, claimsApproved: 82, totalPayout: 41000, status: 'active' },
  { id: 's-005', name: 'Display Incentive', code: 'DISP-INC', type: 'display', description: '₹1000 for premium display placement', startDate: '2024-12-01', endDate: '2024-12-31', applicability: 'Selected Retailers', benefit: '₹1000 incentive', claimsGenerated: 35, claimsApproved: 28, totalPayout: 28000, status: 'active' },
  { id: 's-006', name: 'Sample Conversion Bonus', code: 'SAMP-CONV', type: 'sample_linked', description: '₹200 bonus on sample conversion to order', startDate: '2024-12-01', endDate: '2024-12-31', applicability: 'New Retailers', benefit: '₹200 per conversion', claimsGenerated: 42, claimsApproved: 38, totalPayout: 7600, status: 'active' },
  { id: 's-007', name: 'Q4 Retro Scheme', code: 'RETRO-Q4', type: 'retro', description: 'Additional 2% on Q4 purchases above ₹5L', startDate: '2024-10-01', endDate: '2024-12-31', applicability: 'All Distributors', benefit: '2% retrospective', minValue: 500000, claimsGenerated: 12, claimsApproved: 8, totalPayout: 156000, status: 'active' },
];

const schemeTypeColors: Record<string, string> = {
  slab: 'bg-primary/10 text-primary',
  buy_x_get_y: 'bg-success/10 text-success',
  combo: 'bg-secondary/10 text-secondary',
  bill_wise: 'bg-info/10 text-info',
  value_wise: 'bg-warning/10 text-warning',
  display: 'bg-destructive/10 text-destructive',
  sample_linked: 'bg-purple-500/10 text-purple-600',
  retro: 'bg-orange-500/10 text-orange-600',
};

const schemeTypeLabels: Record<string, string> = {
  slab: 'Slab',
  buy_x_get_y: 'Buy X Get Y',
  combo: 'Combo',
  bill_wise: 'Bill-wise',
  value_wise: 'Value-wise',
  display: 'Display',
  sample_linked: 'Sample Linked',
  retro: 'Retro',
};

const columns = [
  {
    key: 'name',
    header: 'Scheme',
    render: (item: AdvancedScheme) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
          <Gift size={20} className="text-primary" />
        </div>
        <div>
          <p className="font-medium text-foreground">{item.name}</p>
          <p className="text-xs text-muted-foreground">{item.code}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'type',
    header: 'Type',
    render: (item: AdvancedScheme) => (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${schemeTypeColors[item.type]}`}>
        {schemeTypeLabels[item.type]}
      </span>
    ),
  },
  {
    key: 'description',
    header: 'Benefit',
    render: (item: AdvancedScheme) => (
      <div className="max-w-[200px]">
        <p className="text-sm truncate">{item.description}</p>
        <p className="text-xs text-muted-foreground">{item.applicability}</p>
      </div>
    ),
  },
  {
    key: 'validity',
    header: 'Validity',
    render: (item: AdvancedScheme) => (
      <div className="flex items-center gap-2 text-sm">
        <Calendar size={14} className="text-muted-foreground" />
        <span>{item.startDate} - {item.endDate}</span>
      </div>
    ),
  },
  {
    key: 'claims',
    header: 'Claims',
    render: (item: AdvancedScheme) => (
      <div className="text-sm">
        <p className="flex items-center gap-1">
          <CheckCircle size={12} className="text-success" />
          {item.claimsApproved} approved
        </p>
        <p className="text-xs text-muted-foreground">{item.claimsGenerated} generated</p>
      </div>
    ),
  },
  {
    key: 'totalPayout',
    header: 'Payout',
    render: (item: AdvancedScheme) => (
      <span className="font-semibold text-primary">₹{(item.totalPayout / 1000).toFixed(1)}K</span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (item: AdvancedScheme) => <StatusBadge status={item.status} />,
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
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <Copy size={16} className="text-muted-foreground" />
        </button>
      </div>
    ),
  },
];

export default function AdvancedSchemesPage() {
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredSchemes = selectedType === 'all' 
    ? mockSchemes 
    : mockSchemes.filter(s => s.type === selectedType);

  const stats = {
    activeSchemes: mockSchemes.filter(s => s.status === 'active').length,
    totalClaims: mockSchemes.reduce((sum, s) => sum + s.claimsGenerated, 0),
    approvedClaims: mockSchemes.reduce((sum, s) => sum + s.claimsApproved, 0),
    totalPayout: mockSchemes.reduce((sum, s) => sum + s.totalPayout, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Advanced Schemes Engine</h1>
          <p className="text-muted-foreground">20+ scheme types with auto-claim generation</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Create Scheme
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Gift size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.activeSchemes}</p>
              <p className="text-sm text-muted-foreground">Active Schemes</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-info/10">
              <Layers size={24} className="text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalClaims}</p>
              <p className="text-sm text-muted-foreground">Claims Generated</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <CheckCircle size={24} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.approvedClaims}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10">
              <IndianRupee size={24} className="text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">₹{(stats.totalPayout / 100000).toFixed(1)}L</p>
              <p className="text-sm text-muted-foreground">Total Payout</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scheme Type Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedType('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedType === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          All Types
        </button>
        {Object.entries(schemeTypeLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedType(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedType === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Schemes Table */}
      <DataTable data={filteredSchemes} columns={columns} searchPlaceholder="Search schemes..." />
    </div>
  );
}
