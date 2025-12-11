import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge, StatusType } from '@/components/ui/StatusBadge';
import { GeoFilter } from '@/components/ui/GeoFilter';
import { GeoFilter as GeoFilterType } from '@/data/geoData';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { useDistributors, useCreateDistributor, useUpdateDistributor, useDeleteDistributor } from '@/hooks/useOutletsData';
import {
  Plus,
  Building2,
  MapPin,
  Phone,
  IndianRupee,
  Eye,
  Edit,
  Trash2,
  Loader2,
  X,
} from 'lucide-react';

interface Distributor {
  id: string;
  code: string;
  firm_name: string;
  owner_name: string;
  gstin: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  credit_limit: number;
  outstanding_amount: number;
  status: string;
  last_order_date: string | null;
}

const states = [
  { value: 'Delhi', label: 'Delhi' },
  { value: 'Haryana', label: 'Haryana' },
  { value: 'Maharashtra', label: 'Maharashtra' },
  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
  { value: 'West Bengal', label: 'West Bengal' },
  { value: 'Karnataka', label: 'Karnataka' },
  { value: 'Gujarat', label: 'Gujarat' },
];

const formatCurrency = (value: number) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
};

export default function DistributorsPage() {
  const navigate = useNavigate();
  const [geoFilter, setGeoFilter] = useState<GeoFilterType>({ country: 'India' });
  const [deleteModal, setDeleteModal] = useState<Distributor | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Distributor | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    firm_name: '',
    owner_name: '',
    gstin: '',
    city: '',
    state: '',
    phone: '',
    email: '',
    address: '',
    credit_limit: '',
    status: 'pending',
  });

  const { data: distributorsData, isLoading } = useDistributors();
  const createDistributor = useCreateDistributor();
  const updateDistributor = useUpdateDistributor();
  const deleteDistributor = useDeleteDistributor();

  const distributors: Distributor[] = (distributorsData || []).map((d: any) => ({
    ...d,
    credit_limit: Number(d.credit_limit) || 0,
    outstanding_amount: Number(d.outstanding_amount) || 0,
  }));

  const filteredData = distributors.filter(d => {
    if (geoFilter.state && d.state !== geoFilter.state) return false;
    return true;
  });

  const handleCreate = () => {
    navigate('/outlets/distributors/new');
  };

  const handleEdit = (item: Distributor) => {
    navigate(`/outlets/distributors/${item.id}/edit`);
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.firm_name || !formData.owner_name) return;

    const data = {
      code: formData.code,
      firm_name: formData.firm_name,
      owner_name: formData.owner_name,
      gstin: formData.gstin || undefined,
      city: formData.city || undefined,
      state: formData.state || undefined,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      address: formData.address || undefined,
      credit_limit: parseFloat(formData.credit_limit) || 0,
      status: formData.status,
    };

    if (editItem) {
      await updateDistributor.mutateAsync({ id: editItem.id, ...data });
    } else {
      await createDistributor.mutateAsync(data);
    }
    setShowModal(false);
  };

  const handleDelete = async () => {
    if (deleteModal) {
      await deleteDistributor.mutateAsync(deleteModal.id);
      setDeleteModal(null);
    }
  };

  const stats = {
    total: filteredData.length,
    active: filteredData.filter(d => d.status === 'active').length,
    pending: filteredData.filter(d => d.status === 'pending').length,
    totalCredit: filteredData.reduce((sum, d) => sum + d.credit_limit, 0),
    totalOutstanding: filteredData.reduce((sum, d) => sum + d.outstanding_amount, 0),
  };

  const columns = [
    {
      key: 'firm_name',
      header: 'Distributor',
      render: (item: Distributor) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.firm_name}</p>
            <p className="text-xs text-muted-foreground">{item.code}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    { key: 'owner_name', header: 'Owner', sortable: true },
    {
      key: 'location',
      header: 'Location',
      render: (item: Distributor) => (
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-muted-foreground" />
          <span>{item.city || 'N/A'}{item.state ? `, ${item.state}` : ''}</span>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Contact',
      render: (item: Distributor) => (
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-muted-foreground" />
          <span className="text-sm">{item.phone || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'credit_limit',
      header: 'Credit Limit',
      render: (item: Distributor) => <span className="font-medium">{formatCurrency(item.credit_limit)}</span>,
      sortable: true,
    },
    {
      key: 'outstanding_amount',
      header: 'Outstanding',
      render: (item: Distributor) => {
        const percentage = item.credit_limit > 0 ? (item.outstanding_amount / item.credit_limit) * 100 : 0;
        return (
          <div>
            <span className={`font-medium ${percentage > 80 ? 'text-destructive' : percentage > 50 ? 'text-warning' : 'text-foreground'}`}>
              {formatCurrency(item.outstanding_amount)}
            </span>
            <div className="w-full h-1.5 bg-muted rounded-full mt-1">
              <div className={`h-full rounded-full ${percentage > 80 ? 'bg-destructive' : percentage > 50 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Distributor) => <StatusBadge status={item.status as StatusType} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Distributor) => (
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(`/outlets/distributors/${item.id}`)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Eye size={16} className="text-muted-foreground" />
          </button>
          <button onClick={() => handleEdit(item)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Edit size={16} className="text-muted-foreground" />
          </button>
          <button onClick={() => setDeleteModal(item)} className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
            <Trash2 size={16} className="text-destructive" />
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
      <div className="module-header">
        <div>
          <h1 className="module-title">Distributors</h1>
          <p className="text-muted-foreground">Manage distributor network and credit</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add Distributor
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <GeoFilter value={geoFilter} onChange={setGeoFilter} showArea={false} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10"><Building2 size={24} className="text-primary" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Distributors</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10"><Building2 size={24} className="text-success" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10"><IndianRupee size={24} className="text-secondary" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalCredit)}</p>
              <p className="text-sm text-muted-foreground">Total Credit</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10"><IndianRupee size={24} className="text-warning" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalOutstanding)}</p>
              <p className="text-sm text-muted-foreground">Outstanding</p>
            </div>
          </div>
        </motion.div>
      </div>

      <DataTable 
        data={filteredData} 
        columns={columns} 
        searchPlaceholder="Search by name, code, city..." 
        onRowClick={(item) => navigate(`/outlets/distributors/${item.id}`)} 
        emptyMessage="No distributors found. Add your first distributor!"
      />

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                {editItem ? 'Edit Distributor' : 'Add Distributor'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-lg">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="DIST-DEL-001"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Firm Name *</label>
                  <input
                    type="text"
                    value={formData.firm_name}
                    onChange={(e) => setFormData({ ...formData, firm_name: e.target.value })}
                    placeholder="Enter firm name"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Owner Name *</label>
                  <input
                    type="text"
                    value={formData.owner_name}
                    onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                    placeholder="Enter owner name"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">GSTIN</label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    placeholder="Enter GSTIN"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select State</option>
                    {states.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Enter city"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter full address"
                  rows={2}
                  className="input-field resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={formData.credit_limit}
                    onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                    placeholder="500000"
                    className="input-field"
                  />
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
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-outline">Cancel</button>
              <button 
                onClick={handleSubmit}
                disabled={createDistributor.isPending || updateDistributor.isPending}
                className="btn-primary"
              >
                {(createDistributor.isPending || updateDistributor.isPending) ? 'Saving...' : editItem ? 'Update' : 'Create'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <DeleteConfirmModal 
        isOpen={!!deleteModal} 
        onClose={() => setDeleteModal(null)} 
        onConfirm={handleDelete} 
        title="Delete Distributor" 
        message={`Are you sure you want to delete "${deleteModal?.firm_name}"? This action cannot be undone.`} 
      />
    </div>
  );
}
