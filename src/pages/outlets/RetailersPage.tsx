import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge, StatusType } from '@/components/ui/StatusBadge';
import { GeoFilter } from '@/components/ui/GeoFilter';
import { GeoFilter as GeoFilterType } from '@/data/geoData';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { useRetailers, useCreateRetailer, useUpdateRetailer, useDeleteRetailer, useDistributors } from '@/hooks/useOutletsData';
import {
  Plus,
  Store,
  MapPin,
  Star,
  Eye,
  Edit,
  Trash2,
  ShoppingCart,
  Loader2,
  X,
} from 'lucide-react';

interface Retailer {
  id: string;
  code: string;
  shop_name: string;
  owner_name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  category: string;
  distributor_id: string | null;
  last_visit: string | null;
  last_order_value: number;
  status: string;
  distributors?: { id: string; firm_name: string; code: string } | null;
}

const formatCurrency = (value: number) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
};

const categoryColors: Record<string, string> = {
  A: 'bg-success text-success-foreground',
  B: 'bg-warning text-warning-foreground',
  C: 'bg-muted text-muted-foreground',
};

export default function RetailersPage() {
  const navigate = useNavigate();
  const [geoFilter, setGeoFilter] = useState<GeoFilterType>({ country: 'India' });
  const [deleteModal, setDeleteModal] = useState<Retailer | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Retailer | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    shop_name: '',
    owner_name: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    category: 'C',
    distributor_id: '',
    status: 'pending',
  });

  const { data: retailersData, isLoading } = useRetailers();
  const { data: distributorsData } = useDistributors();
  const createRetailer = useCreateRetailer();
  const updateRetailer = useUpdateRetailer();
  const deleteRetailer = useDeleteRetailer();

  const retailers: Retailer[] = (retailersData || []).map((r: any) => ({
    ...r,
    last_order_value: Number(r.last_order_value) || 0,
  }));

  const distributors = distributorsData || [];

  const filteredData = retailers.filter(r => {
    if (geoFilter.city && r.city !== geoFilter.city) return false;
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    return true;
  });

  const handleCreate = () => {
    setEditItem(null);
    setFormData({
      code: '',
      shop_name: '',
      owner_name: '',
      phone: '',
      email: '',
      city: '',
      address: '',
      category: 'C',
      distributor_id: '',
      status: 'pending',
    });
    setShowModal(true);
  };

  const handleEdit = (item: Retailer) => {
    setEditItem(item);
    setFormData({
      code: item.code,
      shop_name: item.shop_name,
      owner_name: item.owner_name,
      phone: item.phone || '',
      email: item.email || '',
      city: item.city || '',
      address: item.address || '',
      category: item.category || 'C',
      distributor_id: item.distributor_id || '',
      status: item.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.shop_name || !formData.owner_name) return;

    const data = {
      code: formData.code,
      shop_name: formData.shop_name,
      owner_name: formData.owner_name,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      city: formData.city || undefined,
      address: formData.address || undefined,
      category: formData.category,
      distributor_id: formData.distributor_id || undefined,
      status: formData.status,
    };

    if (editItem) {
      await updateRetailer.mutateAsync({ id: editItem.id, ...data });
    } else {
      await createRetailer.mutateAsync(data);
    }
    setShowModal(false);
  };

  const handleDelete = async () => {
    if (deleteModal) {
      await deleteRetailer.mutateAsync(deleteModal.id);
      setDeleteModal(null);
    }
  };

  const stats = {
    total: filteredData.length,
    categoryA: filteredData.filter(r => r.category === 'A').length,
    categoryB: filteredData.filter(r => r.category === 'B').length,
    categoryC: filteredData.filter(r => r.category === 'C').length,
  };

  const columns = [
    {
      key: 'shop_name',
      header: 'Retailer',
      render: (item: Retailer) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Store size={20} className="text-secondary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.shop_name}</p>
            <p className="text-xs text-muted-foreground">{item.code}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    { key: 'owner_name', header: 'Owner', sortable: true },
    {
      key: 'address',
      header: 'Location',
      render: (item: Retailer) => (
        <div className="flex items-center gap-2 max-w-[200px]">
          <MapPin size={14} className="text-muted-foreground shrink-0" />
          <span className="truncate text-sm">{item.address || 'N/A'}{item.city ? `, ${item.city}` : ''}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (item: Retailer) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${categoryColors[item.category] || categoryColors['C']}`}>
          {item.category}
        </span>
      ),
      sortable: true,
    },
    { 
      key: 'distributor', 
      header: 'Distributor',
      render: (item: Retailer) => (
        <span className="text-sm">{item.distributors?.firm_name || 'N/A'}</span>
      ),
    },
    {
      key: 'last_order_value',
      header: 'Last Order',
      render: (item: Retailer) => (
        <div>
          <p className="font-medium">{formatCurrency(item.last_order_value)}</p>
          <p className="text-xs text-muted-foreground">{item.last_visit || '-'}</p>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Retailer) => <StatusBadge status={item.status as StatusType} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Retailer) => (
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(`/outlets/retailers/${item.id}`)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Eye size={16} className="text-muted-foreground" />
          </button>
          <button onClick={() => handleEdit(item)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Edit size={16} className="text-muted-foreground" />
          </button>
          <button onClick={() => navigate('/orders/new')} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ShoppingCart size={16} className="text-muted-foreground" />
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
          <h1 className="module-title">Retailers</h1>
          <p className="text-muted-foreground">Manage retail outlet network</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add Retailer
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <GeoFilter value={geoFilter} onChange={setGeoFilter} showArea={false} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10"><Store size={24} className="text-primary" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Retailers</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card cursor-pointer" onClick={() => setCategoryFilter(categoryFilter === 'A' ? 'all' : 'A')}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10"><Star size={24} className="text-success" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.categoryA}</p>
              <p className="text-sm text-muted-foreground">Category A</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card cursor-pointer" onClick={() => setCategoryFilter(categoryFilter === 'B' ? 'all' : 'B')}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10"><Star size={24} className="text-warning" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.categoryB}</p>
              <p className="text-sm text-muted-foreground">Category B</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card cursor-pointer" onClick={() => setCategoryFilter(categoryFilter === 'C' ? 'all' : 'C')}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-muted"><Star size={24} className="text-muted-foreground" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.categoryC}</p>
              <p className="text-sm text-muted-foreground">Category C</p>
            </div>
          </div>
        </motion.div>
      </div>

      <DataTable 
        data={filteredData} 
        columns={columns} 
        searchPlaceholder="Search by shop name, owner, code..." 
        onRowClick={(item) => navigate(`/outlets/retailers/${item.id}`)} 
        emptyMessage="No retailers found. Add your first retailer!"
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
                {editItem ? 'Edit Retailer' : 'Add Retailer'}
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
                    placeholder="RET-DEL-001"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Shop Name *</label>
                  <input
                    type="text"
                    value={formData.shop_name}
                    onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                    placeholder="Enter shop name"
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
                  <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 12345"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                  >
                    <option value="A">Category A</option>
                    <option value="B">Category B</option>
                    <option value="C">Category C</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Distributor</label>
                  <select
                    value={formData.distributor_id}
                    onChange={(e) => setFormData({ ...formData, distributor_id: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select Distributor</option>
                    {distributors.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.firm_name}</option>
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
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-outline">Cancel</button>
              <button 
                onClick={handleSubmit}
                disabled={createRetailer.isPending || updateRetailer.isPending}
                className="btn-primary"
              >
                {(createRetailer.isPending || updateRetailer.isPending) ? 'Saving...' : editItem ? 'Update' : 'Create'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <DeleteConfirmModal 
        isOpen={!!deleteModal} 
        onClose={() => setDeleteModal(null)} 
        onConfirm={handleDelete} 
        title="Delete Retailer" 
        message={`Are you sure you want to delete "${deleteModal?.shop_name}"? This action cannot be undone.`} 
      />
    </div>
  );
}
