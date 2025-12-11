import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useSchemes, useCreateScheme, useDeleteScheme, Scheme } from '@/hooks/useSchemesData';
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
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const typeColors: Record<string, string> = {
  volume: 'bg-primary/10 text-primary',
  product: 'bg-secondary/10 text-secondary',
  opening: 'bg-success/10 text-success',
  display: 'bg-warning/10 text-warning',
};

export default function SchemesPage() {
  const { data: schemes = [], isLoading } = useSchemes();
  const createScheme = useCreateScheme();
  const deleteScheme = useDeleteScheme();
  const [activeTab, setActiveTab] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'volume',
    description: '',
    start_date: '',
    end_date: '',
    min_quantity: '',
    free_quantity: '',
    discount_percent: '',
    applicable_products: [] as string[],
    status: 'pending',
  });

  const filteredSchemes = activeTab === 'All' 
    ? schemes 
    : schemes.filter(s => s.type.toLowerCase() === activeTab.toLowerCase());

  const stats = {
    total: schemes.length,
    active: schemes.filter(s => s.status === 'active').length,
    pending: schemes.filter(s => s.status === 'pending').length,
    volume: schemes.filter(s => s.type === 'volume').length,
  };

  const handleCreateScheme = async () => {
    if (!formData.name || !formData.start_date || !formData.end_date) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      await createScheme.mutateAsync({
        name: formData.name,
        type: formData.type,
        description: formData.description || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        min_quantity: formData.min_quantity ? parseInt(formData.min_quantity) : null,
        free_quantity: formData.free_quantity ? parseInt(formData.free_quantity) : null,
        discount_percent: formData.discount_percent ? parseFloat(formData.discount_percent) : null,
        applicable_products: formData.applicable_products,
        status: formData.status,
        created_by: null,
      });
      toast.success('Scheme created successfully');
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to create scheme');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this scheme?')) {
      try {
        await deleteScheme.mutateAsync(id);
        toast.success('Scheme deleted successfully');
      } catch (error) {
        toast.error('Failed to delete scheme');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'volume',
      description: '',
      start_date: '',
      end_date: '',
      min_quantity: '',
      free_quantity: '',
      discount_percent: '',
      applicable_products: [],
      status: 'pending',
    });
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
            <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[item.type] || 'bg-muted text-muted-foreground'}`}>
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
          {item.description || '-'}
        </p>
      ),
    },
    {
      key: 'validity',
      header: 'Validity',
      render: (item: Scheme) => (
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={14} className="text-muted-foreground" />
          <span>
            {format(new Date(item.start_date), 'dd MMM')} - {format(new Date(item.end_date), 'dd MMM yyyy')}
          </span>
        </div>
      ),
    },
    {
      key: 'benefit',
      header: 'Benefit',
      render: (item: Scheme) => (
        <div className="text-sm">
          {item.free_quantity && (
            <span className="flex items-center gap-1">
              <Package size={14} className="text-success" />
              {item.free_quantity} Free
            </span>
          )}
          {item.discount_percent && (
            <span className="flex items-center gap-1">
              <Percent size={14} className="text-primary" />
              {item.discount_percent}% Off
            </span>
          )}
          {!item.free_quantity && !item.discount_percent && '-'}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Scheme) => <StatusBadge status={item.status as any} />,
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
          <button 
            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item.id);
            }}
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
          <h1 className="module-title">Schemes & Offers</h1>
          <p className="text-muted-foreground">Manage promotional schemes and offers</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
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
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === activeTab
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Data Table */}
      {filteredSchemes.length > 0 ? (
        <DataTable
          data={filteredSchemes}
          columns={columns}
          searchPlaceholder="Search schemes..."
        />
      ) : (
        <div className="card p-12 text-center">
          <Gift size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Schemes Found</h3>
          <p className="text-muted-foreground mb-4">Create your first scheme to get started</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} className="mr-2" />
            Create Scheme
          </button>
        </div>
      )}

      {/* Create Scheme Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold">Create New Scheme</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Scheme Name *</label>
                <input
                  type="text"
                  className="input-field w-full"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter scheme name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    className="input-field w-full"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="volume">Volume</option>
                    <option value="product">Product</option>
                    <option value="opening">Opening</option>
                    <option value="display">Display</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    className="input-field w-full"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="input-field w-full"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Scheme description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date *</label>
                  <input
                    type="date"
                    className="input-field w-full"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date *</label>
                  <input
                    type="date"
                    className="input-field w-full"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Min Quantity</label>
                  <input
                    type="number"
                    className="input-field w-full"
                    value={formData.min_quantity}
                    onChange={(e) => setFormData({ ...formData, min_quantity: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Free Quantity</label>
                  <input
                    type="number"
                    className="input-field w-full"
                    value={formData.free_quantity}
                    onChange={(e) => setFormData({ ...formData, free_quantity: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Discount %</label>
                  <input
                    type="number"
                    className="input-field w-full"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleCreateScheme}
                disabled={createScheme.isPending}
              >
                {createScheme.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Create Scheme
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
