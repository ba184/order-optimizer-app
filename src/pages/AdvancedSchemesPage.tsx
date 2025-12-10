import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Plus,
  Gift,
  Calendar,
  Eye,
  Edit,
  Copy,
  CheckCircle,
  IndianRupee,
  Layers,
  Trash2,
  X,
  Store,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';

interface AdvancedScheme {
  id: string;
  name: string;
  code: string;
  type: 'slab' | 'buy_x_get_y' | 'combo' | 'bill_wise' | 'value_wise' | 'display';
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

interface SchemeApplicant {
  id: string;
  name: string;
  type: 'retailer' | 'distributor';
  code: string;
  city: string;
  claimStatus: 'approved' | 'pending' | 'rejected';
  claimAmount: number;
}

const mockSchemes: AdvancedScheme[] = [
  { id: 's-001', name: 'Slab Discount Dec 2024', code: 'SLAB-DEC-24', type: 'slab', description: '5% on ₹50K, 7% on ₹1L, 10% on ₹2L+', startDate: '2024-12-01', endDate: '2024-12-31', applicability: 'All Distributors', benefit: 'Up to 10% discount', minValue: 50000, maxBenefit: 25000, claimsGenerated: 45, claimsApproved: 38, totalPayout: 285000, status: 'active' },
  { id: 's-002', name: 'Buy 10 Get 1 Free', code: 'B10G1-DEC', type: 'buy_x_get_y', description: 'On Alpha & Beta series', startDate: '2024-12-01', endDate: '2024-12-31', applicability: 'All Outlets', benefit: '1 free per 10', claimsGenerated: 120, claimsApproved: 115, totalPayout: 172500, status: 'active' },
  { id: 's-003', name: 'Festive Combo Pack', code: 'FEST-COMBO', type: 'combo', description: 'Alpha + Beta + Gamma at 15% off', startDate: '2024-12-15', endDate: '2024-12-31', applicability: 'All Outlets', benefit: '15% on combo', claimsGenerated: 25, claimsApproved: 20, totalPayout: 45000, status: 'active' },
  { id: 's-004', name: 'Bill Value Bonus', code: 'BILL-BONUS', type: 'bill_wise', description: '₹500 off on bills above ₹25,000', startDate: '2024-12-01', endDate: '2024-12-31', applicability: 'Retailers Only', benefit: '₹500 flat off', minValue: 25000, claimsGenerated: 85, claimsApproved: 82, totalPayout: 41000, status: 'active' },
  { id: 's-005', name: 'Display Incentive', code: 'DISP-INC', type: 'display', description: '₹1000 for premium display placement', startDate: '2024-12-01', endDate: '2024-12-31', applicability: 'Selected Retailers', benefit: '₹1000 incentive', claimsGenerated: 35, claimsApproved: 28, totalPayout: 28000, status: 'active' },
];

const mockApplicants: Record<string, SchemeApplicant[]> = {
  's-001': [
    { id: 'a1', name: 'ABC Distributors', type: 'distributor', code: 'DIST-001', city: 'Mumbai', claimStatus: 'approved', claimAmount: 15000 },
    { id: 'a2', name: 'XYZ Wholesale', type: 'distributor', code: 'DIST-002', city: 'Delhi', claimStatus: 'approved', claimAmount: 22000 },
    { id: 'a3', name: 'PQR Trading', type: 'distributor', code: 'DIST-003', city: 'Chennai', claimStatus: 'pending', claimAmount: 18000 },
  ],
  's-002': [
    { id: 'a4', name: 'Sharma Retail Store', type: 'retailer', code: 'RET-001', city: 'Bangalore', claimStatus: 'approved', claimAmount: 5000 },
    { id: 'a5', name: 'Kumar General Store', type: 'retailer', code: 'RET-002', city: 'Hyderabad', claimStatus: 'approved', claimAmount: 3500 },
    { id: 'a6', name: 'Singh Mart', type: 'retailer', code: 'RET-003', city: 'Pune', claimStatus: 'rejected', claimAmount: 0 },
    { id: 'a7', name: 'Metro Distributors', type: 'distributor', code: 'DIST-004', city: 'Kolkata', claimStatus: 'approved', claimAmount: 12000 },
  ],
  's-003': [
    { id: 'a8', name: 'Patel Stores', type: 'retailer', code: 'RET-004', city: 'Ahmedabad', claimStatus: 'approved', claimAmount: 8000 },
    { id: 'a9', name: 'City Mart', type: 'retailer', code: 'RET-005', city: 'Jaipur', claimStatus: 'pending', claimAmount: 6500 },
  ],
  's-004': [
    { id: 'a10', name: 'Gupta Electronics', type: 'retailer', code: 'RET-006', city: 'Lucknow', claimStatus: 'approved', claimAmount: 500 },
    { id: 'a11', name: 'Verma Traders', type: 'retailer', code: 'RET-007', city: 'Chandigarh', claimStatus: 'approved', claimAmount: 500 },
    { id: 'a12', name: 'Reddy Retail', type: 'retailer', code: 'RET-008', city: 'Visakhapatnam', claimStatus: 'pending', claimAmount: 500 },
  ],
  's-005': [
    { id: 'a13', name: 'Premium Store Mumbai', type: 'retailer', code: 'RET-009', city: 'Mumbai', claimStatus: 'approved', claimAmount: 1000 },
    { id: 'a14', name: 'Elite Retail Delhi', type: 'retailer', code: 'RET-010', city: 'Delhi', claimStatus: 'approved', claimAmount: 1000 },
  ],
};

const schemeTypeColors: Record<string, string> = {
  slab: 'bg-primary/10 text-primary',
  buy_x_get_y: 'bg-success/10 text-success',
  combo: 'bg-secondary/10 text-secondary',
  bill_wise: 'bg-info/10 text-info',
  value_wise: 'bg-warning/10 text-warning',
  display: 'bg-destructive/10 text-destructive',
};

const schemeTypeLabels: Record<string, string> = {
  slab: 'Slab',
  buy_x_get_y: 'Buy X Get Y',
  combo: 'Combo',
  bill_wise: 'Bill-wise',
  value_wise: 'Value-wise',
  display: 'Display',
};

export default function AdvancedSchemesPage() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState<AdvancedScheme | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'slab',
    description: '',
    startDate: '',
    endDate: '',
    applicability: 'All Outlets',
    benefit: '',
    minValue: '',
    maxBenefit: '',
  });

  const filteredSchemes = selectedType === 'all' 
    ? mockSchemes 
    : mockSchemes.filter(s => s.type === selectedType);

  const stats = {
    activeSchemes: mockSchemes.filter(s => s.status === 'active').length,
    totalClaims: mockSchemes.reduce((sum, s) => sum + s.claimsGenerated, 0),
    approvedClaims: mockSchemes.reduce((sum, s) => sum + s.claimsApproved, 0),
    totalPayout: mockSchemes.reduce((sum, s) => sum + s.totalPayout, 0),
  };

  const handleCreate = () => {
    if (!formData.name || !formData.code || !formData.startDate || !formData.endDate) {
      toast.error('Please fill all required fields');
      return;
    }
    toast.success('Scheme created successfully');
    setShowCreateModal(false);
    setFormData({ name: '', code: '', type: 'slab', description: '', startDate: '', endDate: '', applicability: 'All Outlets', benefit: '', minValue: '', maxBenefit: '' });
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
      render: (item: AdvancedScheme) => (
        <div className="flex items-center gap-1">
          <button onClick={() => setShowViewModal(item)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Eye size={16} className="text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Edit size={16} className="text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Copy size={16} className="text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
            <Trash2 size={16} className="text-destructive" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Advanced Schemes Engine</h1>
          <p className="text-muted-foreground">Manage scheme types with auto-claim generation</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Create Scheme
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Create New Scheme</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-muted rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Scheme Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter scheme name"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Scheme Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., SLAB-DEC-24"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Scheme Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-field"
                >
                  {Object.entries(schemeTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the scheme benefits"
                  className="input-field min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">End Date *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Applicability</label>
                  <select
                    value={formData.applicability}
                    onChange={(e) => setFormData({ ...formData, applicability: e.target.value })}
                    className="input-field"
                  >
                    <option>All Outlets</option>
                    <option>All Distributors</option>
                    <option>Retailers Only</option>
                    <option>Selected Retailers</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Benefit</label>
                  <input
                    type="text"
                    value={formData.benefit}
                    onChange={(e) => setFormData({ ...formData, benefit: e.target.value })}
                    placeholder="e.g., Up to 10% discount"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Min Value (₹)</label>
                  <input
                    type="number"
                    value={formData.minValue}
                    onChange={(e) => setFormData({ ...formData, minValue: e.target.value })}
                    placeholder="0"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Max Benefit (₹)</label>
                  <input
                    type="number"
                    value={formData.maxBenefit}
                    onChange={(e) => setFormData({ ...formData, maxBenefit: e.target.value })}
                    placeholder="0"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="btn-outline">Cancel</button>
              <button onClick={handleCreate} className="btn-primary">Create Scheme</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Scheme Details</h2>
              <button onClick={() => setShowViewModal(null)} className="p-2 hover:bg-muted rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Gift size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{showViewModal.name}</h3>
                  <p className="text-sm text-muted-foreground">{showViewModal.code}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium mt-1 ${schemeTypeColors[showViewModal.type]}`}>
                    {schemeTypeLabels[showViewModal.type]}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1"><StatusBadge status={showViewModal.status} /></div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Validity</p>
                  <p className="text-sm font-medium">{showViewModal.startDate} - {showViewModal.endDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Applicability</p>
                  <p className="text-sm font-medium">{showViewModal.applicability}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Claims Approved</p>
                  <p className="text-sm font-medium">{showViewModal.claimsApproved} / {showViewModal.claimsGenerated}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Payout</p>
                  <p className="text-sm font-medium text-primary">₹{showViewModal.totalPayout.toLocaleString()}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{showViewModal.description}</p>
              </div>

              {/* Applied Retailers/Distributors List */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium text-foreground mb-3">Applied Retailers & Distributors</p>
                {mockApplicants[showViewModal.id]?.length > 0 ? (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {mockApplicants[showViewModal.id].map((applicant) => (
                      <div key={applicant.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${applicant.type === 'retailer' ? 'bg-info/10' : 'bg-primary/10'}`}>
                            {applicant.type === 'retailer' ? (
                              <Store size={16} className="text-info" />
                            ) : (
                              <Building2 size={16} className="text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{applicant.name}</p>
                            <p className="text-xs text-muted-foreground">{applicant.code} • {applicant.city}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <StatusBadge status={applicant.claimStatus} />
                          {applicant.claimAmount > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">₹{applicant.claimAmount.toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No retailers or distributors have applied this scheme yet.</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowViewModal(null)} className="btn-outline">Close</button>
              <button className="btn-primary">Edit Scheme</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}