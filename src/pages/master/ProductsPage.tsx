import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CrudModal, FieldConfig } from '@/components/ui/CrudModal';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import {
  Package,
  Plus,
  Image as ImageIcon,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  subCategory: string;
  mrp: number;
  ptr: number;
  gst: number;
  unit: string;
  packSize: number;
  status: 'active' | 'inactive';
}

const initialProducts: Product[] = [
  { id: 'p-001', sku: 'PA-500', name: 'Product Alpha 500ml', category: 'Beverages', subCategory: 'Energy Drinks', mrp: 150, ptr: 120, gst: 18, unit: 'Bottle', packSize: 24, status: 'active' },
  { id: 'p-002', sku: 'PB-1L', name: 'Product Beta 1L', category: 'Beverages', subCategory: 'Health Drinks', mrp: 275, ptr: 220, gst: 18, unit: 'Bottle', packSize: 12, status: 'active' },
  { id: 'p-003', sku: 'PG-250', name: 'Product Gamma 250g', category: 'Food', subCategory: 'Snacks', mrp: 110, ptr: 85, gst: 12, unit: 'Pack', packSize: 48, status: 'active' },
  { id: 'p-004', sku: 'PD-PK', name: 'Product Delta Pack', category: 'Combo', subCategory: 'Value Pack', mrp: 450, ptr: 350, gst: 18, unit: 'Combo', packSize: 6, status: 'active' },
  { id: 'p-005', sku: 'PE-2L', name: 'Product Epsilon 2L', category: 'Beverages', subCategory: 'Family Pack', mrp: 480, ptr: 380, gst: 18, unit: 'Bottle', packSize: 6, status: 'inactive' },
];

const categories = [
  { value: 'Beverages', label: 'Beverages' },
  { value: 'Food', label: 'Food' },
  { value: 'Combo', label: 'Combo' },
];

const units = [
  { value: 'Bottle', label: 'Bottle' },
  { value: 'Pack', label: 'Pack' },
  { value: 'Combo', label: 'Combo' },
  { value: 'Box', label: 'Box' },
];

const fields: FieldConfig[] = [
  { key: 'sku', label: 'SKU', type: 'text', required: true, placeholder: 'e.g., PA-500' },
  { key: 'name', label: 'Product Name', type: 'text', required: true, placeholder: 'Enter product name' },
  { key: 'category', label: 'Category', type: 'select', required: true, options: categories },
  { key: 'subCategory', label: 'Sub Category', type: 'text', placeholder: 'Enter sub-category' },
  { key: 'mrp', label: 'MRP (₹)', type: 'number', required: true, placeholder: '0' },
  { key: 'ptr', label: 'PTR (₹)', type: 'number', required: true, placeholder: '0' },
  { key: 'gst', label: 'GST (%)', type: 'number', required: true, placeholder: '18' },
  { key: 'unit', label: 'Unit', type: 'select', required: true, options: units },
  { key: 'packSize', label: 'Pack Size', type: 'number', required: true, placeholder: '12' },
  { key: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
];

export default function ProductsPage() {
  const [data, setData] = useState<Product[]>(initialProducts);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<Product | null>(null);
  const [selectedItem, setSelectedItem] = useState<Product | null>(null);
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>('create');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredData = categoryFilter === 'all' ? data : data.filter(p => p.category === categoryFilter);

  const handleCreate = () => {
    setSelectedItem(null);
    setMode('create');
    setModalOpen(true);
  };

  const handleView = (item: Product) => {
    setSelectedItem(item);
    setMode('view');
    setModalOpen(true);
  };

  const handleEdit = (item: Product) => {
    setSelectedItem(item);
    setMode('edit');
    setModalOpen(true);
  };

  const handleSubmit = (formData: Record<string, any>) => {
    if (mode === 'create') {
      const newItem: Product = {
        id: Date.now().toString(),
        sku: formData.sku,
        name: formData.name,
        category: formData.category,
        subCategory: formData.subCategory || '',
        mrp: Number(formData.mrp),
        ptr: Number(formData.ptr),
        gst: Number(formData.gst),
        unit: formData.unit,
        packSize: Number(formData.packSize),
        status: formData.status || 'active',
      };
      setData([...data, newItem]);
      toast.success('Product created successfully');
    } else {
      setData(data.map(item => item.id === selectedItem?.id ? { ...item, ...formData, mrp: Number(formData.mrp), ptr: Number(formData.ptr), gst: Number(formData.gst), packSize: Number(formData.packSize) } : item));
      toast.success('Product updated successfully');
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteModal) {
      setData(data.filter(item => item.id !== deleteModal.id));
      toast.success('Product deleted successfully');
      setDeleteModal(null);
    }
  };

  const stats = {
    total: data.length,
    active: data.filter(p => p.status === 'active').length,
    inactive: data.filter(p => p.status === 'inactive').length,
    categories: [...new Set(data.map(p => p.category))].length,
  };

  const columns = [
    {
      key: 'name',
      header: 'Product',
      render: (item: Product) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
            <Package size={24} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'category',
      header: 'Category',
      render: (item: Product) => (
        <div>
          <p className="text-sm">{item.category}</p>
          <p className="text-xs text-muted-foreground">{item.subCategory}</p>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'mrp',
      header: 'MRP',
      render: (item: Product) => <span className="font-medium">₹{item.mrp}</span>,
      sortable: true,
    },
    {
      key: 'ptr',
      header: 'PTR',
      render: (item: Product) => <span className="font-medium text-primary">₹{item.ptr}</span>,
      sortable: true,
    },
    {
      key: 'gst',
      header: 'GST',
      render: (item: Product) => <span>{item.gst}%</span>,
    },
    {
      key: 'packSize',
      header: 'Pack Size',
      render: (item: Product) => <span>{item.packSize} {item.unit}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Product) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Product) => (
        <div className="flex items-center gap-1">
          <button onClick={() => handleView(item)} className="p-2 hover:bg-muted rounded-lg transition-colors">
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

  return (
    <div className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="module-title">Product Master</h1>
          <p className="text-muted-foreground">Manage product catalog and pricing</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Package size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Products</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <Package size={24} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-muted">
              <Package size={24} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.inactive}</p>
              <p className="text-sm text-muted-foreground">Inactive</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10">
              <ImageIcon size={24} className="text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.categories}</p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="filter-bar">
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input-field w-40">
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      <DataTable data={filteredData} columns={columns} searchPlaceholder="Search products by name or SKU..." />

      <CrudModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={mode === 'create' ? 'Add Product' : mode === 'edit' ? 'Edit Product' : 'Product Details'}
        fields={fields}
        initialData={selectedItem || undefined}
        onSubmit={handleSubmit}
        mode={mode}
      />

      <DeleteConfirmModal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteModal?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
