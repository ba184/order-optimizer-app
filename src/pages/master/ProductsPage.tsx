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
import { useSamples } from '@/hooks/useSamplesData';

export default function ProductsPage() {
  const navigate = useNavigate();
  const { data: products = [], isLoading: isLoadingProducts } = useProducts();
  const { data: samples = [], isLoading: isLoadingSamples } = useSamples();
  const deleteProduct = useDeleteProduct();

  const [deleteModal, setDeleteModal] = useState<Product | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Filter products (exclude samples from products table)
  const filteredProducts = products.filter(p => p.product_type !== 'sample');
  
  // Combined data based on filter
  const displayData = typeFilter === 'samples' 
    ? [] // Samples shown in separate table
    : filteredProducts;

  const handleDelete = () => {
    if (deleteModal) {
      deleteProduct.mutate(deleteModal.id, {
        onSuccess: () => setDeleteModal(null),
      });
    }
  };

  const stats = {
    total: filteredProducts.length + samples.length,
    products: filteredProducts.length,
    samples: samples.length,
    active: filteredProducts.filter(p => p.status === 'active').length + 
            samples.filter(s => s.status === 'active').length,
  };

  const productColumns = [
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
      key: 'name',
      header: 'Product Name',
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
        <span className="font-medium">{item.sku_size || '-'}</span>
      ),
      sortable: true,
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
        <span className="font-medium">₹{item.mrp}</span>
      ),
      sortable: true,
    },
    {
      key: 'ptr',
      header: 'PTR',
      render: (item: Product) => (
        <span className="font-medium text-primary">₹{item.ptr}</span>
      ),
      sortable: true,
    },
    {
      key: 'pts',
      header: 'PTS',
      render: (item: Product) => (
        <span className="font-medium text-secondary">₹{item.pts || 0}</span>
      ),
      sortable: true,
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

  const sampleColumns = [
    {
      key: 'sku',
      header: 'Sample ID',
      render: (item: any) => (
        <span className="font-mono text-sm font-medium text-secondary">
          {item.sku || '-'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'name',
      header: 'Sample Name',
      render: (item: any) => (
        <p className="font-medium text-foreground">{item.name}</p>
      ),
      sortable: true,
    },
    {
      key: 'type',
      header: 'Variant',
      render: (item: any) => (
        <span className="text-sm">{item.type || '-'}</span>
      ),
      sortable: true,
    },
    {
      key: 'stock',
      header: 'Quantity',
      render: (item: any) => (
        <span className="font-medium">{item.stock || 0}</span>
      ),
      sortable: true,
    },
    {
      key: 'issued_this_month',
      header: 'Issued (Month)',
      render: (item: any) => (
        <span className="text-sm">{item.issued_this_month || 0}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: any) => <StatusBadge status={item.status === 'active' ? 'active' : 'inactive'} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: any) => (
        <div className="flex items-center gap-1">
          <button 
            onClick={() => navigate(`/samples/${item.id}`)} 
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="View"
          >
            <Eye size={16} className="text-muted-foreground" />
          </button>
          <button 
            onClick={() => navigate(`/samples/${item.id}/edit`)} 
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Edit"
          >
            <Edit size={16} className="text-muted-foreground" />
          </button>
          <button 
            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={16} className="text-destructive" />
          </button>
        </div>
      ),
    },
  ];

  const isLoading = isLoadingProducts || isLoadingSamples;

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
          Add Product / Sample
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

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTypeFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            typeFilter === 'all' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          All Products
        </button>
        <button
          onClick={() => setTypeFilter('samples')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            typeFilter === 'samples' 
              ? 'bg-secondary text-secondary-foreground' 
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <FlaskConical size={16} />
          Samples
        </button>
      </div>

      {/* Products Table */}
      {typeFilter !== 'samples' && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Package size={20} className="text-primary" />
            Products ({filteredProducts.length})
          </h2>
          <DataTable 
            data={displayData} 
            columns={productColumns} 
            searchPlaceholder="Search products by name, SKU, or code..." 
          />
        </div>
      )}

      {/* Samples Table */}
      {typeFilter === 'samples' && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FlaskConical size={20} className="text-secondary" />
            Samples ({samples.length})
          </h2>
          <DataTable 
            data={samples} 
            columns={sampleColumns} 
            searchPlaceholder="Search samples by name or ID..." 
          />
        </div>
      )}

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
