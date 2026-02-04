import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2,
  PackagePlus,
  FlaskConical,
} from 'lucide-react';
import {
  useProducts,
  useDeleteProduct,
  Product,
} from '@/hooks/useProductsData';

export default function ProductsPage() {
  const navigate = useNavigate();
  const { data: products = [], isLoading } = useProducts();
  const deleteProduct = useDeleteProduct();

  const [deleteModal, setDeleteModal] = useState<Product | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredData = typeFilter === 'all' 
    ? products 
    : products.filter(p => p.product_type === typeFilter);

  const handleDelete = () => {
    if (deleteModal) {
      deleteProduct.mutate(deleteModal.id, {
        onSuccess: () => setDeleteModal(null),
      });
    }
  };

  const stats = {
    total: products.length,
    products: products.filter(p => p.product_type === 'product').length,
    samples: products.filter(p => p.product_type === 'sample').length,
    active: products.filter(p => p.status === 'active').length,
  };

  const columns = [
    {
      key: 'product_code',
      header: 'Product ID',
      render: (item: Product) => (
        <span className="font-mono text-sm font-medium text-primary">
          {item.product_code || '-'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'product_type',
      header: 'Type',
      render: (item: Product) => (
        <div className="flex items-center gap-2">
          {item.product_type === 'sample' ? (
            <FlaskConical size={16} className="text-secondary" />
          ) : (
            <Package size={16} className="text-primary" />
          )}
          <span className="capitalize">{item.product_type || 'product'}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'name',
      header: 'Name',
      render: (item: Product) => (
        <div>
          <p className="font-medium text-foreground">{item.name}</p>
          <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'variant',
      header: 'Variant',
      render: (item: Product) => (
        <span className="text-sm">{item.variant || item.category || '-'}</span>
      ),
      sortable: true,
    },
    {
      key: 'pack_type',
      header: 'Pack Type',
      render: (item: Product) => (
        <span className="capitalize">{item.pack_type || '-'}</span>
      ),
    },
    {
      key: 'sku_size',
      header: 'SKU Size',
      render: (item: Product) => (
        <span>{item.sku_size || '-'}</span>
      ),
    },
    {
      key: 'pack_size',
      header: 'Pack Size',
      render: (item: Product) => (
        <span>{item.pack_size || '-'}</span>
      ),
    },
    {
      key: 'mrp',
      header: 'MRP',
      render: (item: Product) => (
        item.product_type === 'sample' ? '-' : <span className="font-medium">₹{item.mrp}</span>
      ),
      sortable: true,
    },
    {
      key: 'ptr',
      header: 'PTR',
      render: (item: Product) => (
        item.product_type === 'sample' ? '-' : <span className="font-medium text-primary">₹{item.ptr}</span>
      ),
      sortable: true,
    },
    {
      key: 'pts',
      header: 'PTS',
      render: (item: Product) => (
        item.product_type === 'sample' ? '-' : <span className="font-medium text-secondary">₹{item.pts || 0}</span>
      ),
      sortable: true,
    },
    {
      key: 'gst',
      header: 'GST',
      render: (item: Product) => (
        item.product_type === 'sample' ? '-' : <span>{item.gst}%</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Product) => <StatusBadge status={item.status === 'active' ? 'active' : 'inactive'} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Product) => (
        <div className="flex items-center gap-1">
          <button 
            onClick={() => navigate(`/master/products/${item.id}`)} 
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="View"
          >
            <Eye size={16} className="text-muted-foreground" />
          </button>
          <button 
            onClick={() => navigate(`/master/products/${item.id}/edit`)} 
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Edit"
          >
            <Edit size={16} className="text-muted-foreground" />
          </button>
          <button 
            onClick={() => navigate(`/inventory?product=${item.id}`)} 
            className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
            title="Add Stock"
          >
            <PackagePlus size={16} className="text-primary" />
          </button>
          <button 
            onClick={() => setDeleteModal(item)} 
            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
            title="Delete"
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
      <div className="module-header">
        <div>
          <h1 className="module-title">Product Master</h1>
          <p className="text-muted-foreground">Manage products and samples</p>
        </div>
        <button onClick={() => navigate('/master/products/new')} className="btn-primary flex items-center gap-2">
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
              <p className="text-sm text-muted-foreground">Total Items</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <Package size={24} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.products}</p>
              <p className="text-sm text-muted-foreground">Products</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10">
              <FlaskConical size={24} className="text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.samples}</p>
              <p className="text-sm text-muted-foreground">Samples</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <Package size={24} className="text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="filter-bar">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field w-40">
          <option value="all">All Types</option>
          <option value="product">Products</option>
          <option value="sample">Samples</option>
        </select>
      </div>

      <DataTable data={filteredData} columns={columns} searchPlaceholder="Search products by name, SKU, or code..." />

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
