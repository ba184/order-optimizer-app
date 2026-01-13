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
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  useAdvancedSchemes,
  useSchemeClaims,
  useCreateAdvancedScheme,
  useDeleteAdvancedScheme,
  AdvancedScheme,
  SchemeClaim,
} from '@/hooks/useAdvancedSchemesData';
import { useProducts } from '@/hooks/useProductsData';

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
  const { data: schemes = [], isLoading } = useAdvancedSchemes();
  const createScheme = useCreateAdvancedScheme();
  const deleteScheme = useDeleteAdvancedScheme();

  const [selectedType, setSelectedType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState<AdvancedScheme | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'slab',
    description: '',
    start_date: '',
    end_date: '',
    applicability: 'All Outlets',
    benefit: '',
    min_value: '',
    max_benefit: '',
    status: 'pending',
  });

  const filteredSchemes = selectedType === 'all' 
    ? schemes 
    : schemes.filter(s => s.type === selectedType);

  const stats = {
    activeSchemes: schemes.filter(s => s.status === 'active').length,
    totalClaims: schemes.reduce((sum, s) => sum + s.claims_generated, 0),
    approvedClaims: schemes.reduce((sum, s) => sum + s.claims_approved, 0),
    totalPayout: schemes.reduce((sum, s) => sum + Number(s.total_payout), 0),
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.code || !formData.start_date || !formData.end_date) {
      toast.error('Please fill all required fields');
      return;
    }

    await createScheme.mutateAsync({
      name: formData.name,
      code: formData.code,
      type: formData.type,
      description: formData.description || null,
      start_date: formData.start_date,
      end_date: formData.end_date,
      applicability: formData.applicability,
      benefit: formData.benefit || null,
      min_value: formData.min_value ? parseFloat(formData.min_value) : null,
      max_benefit: formData.max_benefit ? parseFloat(formData.max_benefit) : null,
      status: formData.status,
      created_by: null,
    });

    setShowCreateModal(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this scheme?')) {
      await deleteScheme.mutateAsync(id);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: 'slab',
      description: '',
      start_date: '',
      end_date: '',
      applicability: 'All Outlets',
      benefit: '',
      min_value: '',
      max_benefit: '',
      status: 'pending',
    });
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
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${schemeTypeColors[item.type] || 'bg-muted text-muted-foreground'}`}>
          {schemeTypeLabels[item.type] || item.type}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Benefit',
      render: (item: AdvancedScheme) => (
        <div className="max-w-[200px]">
          <p className="text-sm truncate">{item.description || '-'}</p>
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
          <span>
            {format(new Date(item.start_date), 'dd MMM')} - {format(new Date(item.end_date), 'dd MMM yyyy')}
          </span>
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
            {item.claims_approved} approved
          </p>
          <p className="text-xs text-muted-foreground">{item.claims_generated} generated</p>
        </div>
      ),
    },
    {
      key: 'totalPayout',
      header: 'Payout',
      render: (item: AdvancedScheme) => (
        <span className="font-semibold text-primary">₹{(Number(item.total_payout) / 1000).toFixed(1)}K</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: AdvancedScheme) => <StatusBadge status={item.status as any} />,
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
          <button 
            onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <Trash2 size={16} className="text-destructive" />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
      {filteredSchemes.length > 0 ? (
        <DataTable data={filteredSchemes} columns={columns} searchPlaceholder="Search schemes..." />
      ) : (
        <div className="card p-12 text-center">
          <Gift size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Schemes Found</h3>
          <p className="text-muted-foreground mb-4">Create your first advanced scheme to get started</p>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} className="mr-2" />
            Create Scheme
          </button>
        </div>
      )}

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

              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input-field"
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
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
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">End Date *</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
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
                    placeholder="e.g., 10% discount"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Min Value (₹)</label>
                  <input
                    type="number"
                    value={formData.min_value}
                    onChange={(e) => setFormData({ ...formData, min_value: e.target.value })}
                    placeholder="0"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Max Benefit (₹)</label>
                  <input
                    type="number"
                    value={formData.max_benefit}
                    onChange={(e) => setFormData({ ...formData, max_benefit: e.target.value })}
                    placeholder="0"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-border">
              <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="btn-outline">
                Cancel
              </button>
              <button onClick={handleCreate} disabled={createScheme.isPending} className="btn-primary flex items-center gap-2">
                {createScheme.isPending && <Loader2 size={16} className="animate-spin" />}
                Create Scheme
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && (
        <SchemeViewModal scheme={showViewModal} onClose={() => setShowViewModal(null)} />
      )}
    </div>
  );
}

function SchemeViewModal({ scheme, onClose }: { scheme: AdvancedScheme; onClose: () => void }) {
  const { data: claims = [], isLoading } = useSchemeClaims(scheme.id);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{scheme.name}</h2>
            <p className="text-sm text-muted-foreground">{scheme.code}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Scheme Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">Type</p>
            <p className="font-medium">{schemeTypeLabels[scheme.type] || scheme.type}</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">Validity</p>
            <p className="font-medium">
              {format(new Date(scheme.start_date), 'dd MMM')} - {format(new Date(scheme.end_date), 'dd MMM yyyy')}
            </p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">Claims</p>
            <p className="font-medium">{scheme.claims_approved} / {scheme.claims_generated}</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Payout</p>
            <p className="font-medium text-primary">₹{Number(scheme.total_payout).toLocaleString()}</p>
          </div>
        </div>

        {/* Claims/Applicants */}
        <div>
          <h3 className="font-semibold mb-4">Applicants & Claims</h3>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : claims.length > 0 ? (
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">Applicant</th>
                    <th className="text-left p-3 text-sm font-medium">Type</th>
                    <th className="text-left p-3 text-sm font-medium">City</th>
                    <th className="text-left p-3 text-sm font-medium">Amount</th>
                    <th className="text-left p-3 text-sm font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map(claim => (
                    <tr key={claim.id} className="border-t border-border">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {claim.applicant_type === 'retailer' ? (
                            <Store size={16} className="text-primary" />
                          ) : (
                            <Building2 size={16} className="text-secondary" />
                          )}
                          <span>
                            {claim.applicant_type === 'retailer' 
                              ? claim.retailer?.shop_name 
                              : claim.distributor?.firm_name}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 capitalize">{claim.applicant_type}</td>
                      <td className="p-3">
                        {claim.applicant_type === 'retailer' 
                          ? claim.retailer?.city 
                          : claim.distributor?.city}
                      </td>
                      <td className="p-3 font-medium">₹{Number(claim.claim_amount).toLocaleString()}</td>
                      <td className="p-3">
                        <StatusBadge status={claim.claim_status as any} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No claims recorded for this scheme yet
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6 pt-6 border-t border-border">
          <button onClick={onClose} className="btn-secondary">Close</button>
        </div>
      </motion.div>
    </div>
  );
}
