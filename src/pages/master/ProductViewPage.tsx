import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, Package, FlaskConical, Loader2, PackagePlus } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useProduct } from '@/hooks/useProductsData';

export default function ProductViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: product, isLoading } = useProduct(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Product not found</p>
        <button onClick={() => navigate('/master/products')} className="btn-primary mt-4">
          Back to Products
        </button>
      </div>
    );
  }

  const isSample = product.product_type === 'sample';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/master/products')} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              {isSample ? (
                <FlaskConical size={28} className="text-secondary" />
              ) : (
                <Package size={28} className="text-primary" />
              )}
              <h1 className="module-title">{product.name}</h1>
            </div>
            <p className="text-muted-foreground">
              {product.product_code} • {isSample ? 'Sample' : 'Product'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/inventory?product=${product.id}`)}
            className="btn-secondary flex items-center gap-2"
          >
            <PackagePlus size={18} />
            Add Stock
          </button>
          <button
            onClick={() => navigate(`/master/products/${id}/edit`)}
            className="btn-primary flex items-center gap-2"
          >
            <Edit size={18} />
            Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 lg:col-span-2"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {isSample ? 'Sample' : 'Product'} Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Product ID</p>
              <p className="font-mono font-medium text-primary">{product.product_code || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium capitalize">{product.product_type || 'product'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">SKU</p>
              <p className="font-medium">{product.sku}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{isSample ? 'Sample Type' : 'Variant'}</p>
              <p className="font-medium">{product.variant || product.category || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pack Type</p>
              <p className="font-medium capitalize">{product.pack_type || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">SKU Size</p>
              <p className="font-medium">{product.sku_size || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pack Size</p>
              <p className="font-medium">{product.pack_size || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <StatusBadge status={product.status === 'active' ? 'active' : 'inactive'} />
            </div>
          </div>
        </motion.div>

        {/* Pricing Details - Only for Products */}
        {!isSample && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Pricing & Tax</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">MRP</span>
                <span className="font-semibold text-lg">₹{product.mrp}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">PTR</span>
                <span className="font-semibold text-lg text-primary">₹{product.ptr}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">PTS (Supplier)</span>
                <span className="font-semibold text-lg text-secondary">₹{product.pts || 0}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-muted-foreground">GST</span>
                <span className="font-semibold text-lg">{product.gst}%</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stock Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Inventory</h2>
          <div className="text-center py-6">
            <p className="text-4xl font-bold text-foreground">{product.stock}</p>
            <p className="text-sm text-muted-foreground mt-1">Current Stock</p>
            {product.stock < 50 && (
              <p className="text-xs text-destructive mt-2">Low stock warning</p>
            )}
          </div>
          <button
            onClick={() => navigate(`/inventory?product=${product.id}`)}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
          >
            <PackagePlus size={18} />
            Add Stock
          </button>
        </motion.div>

        {/* Timestamps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Timeline</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="font-medium">
                {product.created_at ? new Date(product.created_at).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }) : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">
                {product.updated_at ? new Date(product.updated_at).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }) : '-'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
