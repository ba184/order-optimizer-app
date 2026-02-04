import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Package, FlaskConical } from 'lucide-react';
import { useProduct, useCreateProduct, useUpdateProduct } from '@/hooks/useProductsData';

const variantOptions = [
  { value: 'Beverages', label: 'Beverages' },
  { value: 'Food', label: 'Food' },
  { value: 'Health', label: 'Health' },
  { value: 'Personal Care', label: 'Personal Care' },
  { value: 'Combo', label: 'Combo' },
];

const packTypeOptions = [
  { value: 'container', label: 'Container' },
  { value: 'tube', label: 'Tube' },
  { value: 'bottle', label: 'Bottle' },
  { value: 'sachet', label: 'Sachet' },
  { value: 'box', label: 'Box' },
];

const skuSizeOptions = [
  { value: '2g', label: '2g' },
  { value: '4g', label: '4g' },
  { value: '5g', label: '5g' },
  { value: '10g', label: '10g' },
  { value: '20g', label: '20g' },
  { value: '50g', label: '50g' },
  { value: '100g', label: '100g' },
  { value: '200ml', label: '200ml' },
  { value: '500ml', label: '500ml' },
  { value: '1L', label: '1L' },
];

const packSizeOptions = [
  { value: '1nos', label: '1 nos' },
  { value: '5nos', label: '5 nos' },
  { value: '10nos', label: '10 nos' },
  { value: '12nos', label: '12 nos' },
  { value: '24nos', label: '24 nos' },
  { value: '50nos', label: '50 nos' },
];

const sampleTypeOptions = [
  { value: 'promotional', label: 'Promotional' },
  { value: 'trial', label: 'Trial' },
  { value: 'gift', label: 'Gift' },
  { value: 'medical', label: 'Medical' },
];

export default function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: product, isLoading: isLoadingProduct } = useProduct(id);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [formData, setFormData] = useState({
    product_type: 'product',
    name: '',
    sku: '',
    variant: '',
    pack_type: '',
    sku_size: '',
    pack_size: '',
    mrp: '',
    ptr: '',
    pts: '',
    gst: '',
    status: 'active',
    sample_type: '',
  });

  useEffect(() => {
    if (product) {
      setFormData({
        product_type: product.product_type || 'product',
        name: product.name || '',
        sku: product.sku || '',
        variant: product.variant || product.category || '',
        pack_type: product.pack_type || '',
        sku_size: product.sku_size || '',
        pack_size: product.pack_size || '',
        mrp: product.mrp?.toString() || '',
        ptr: product.ptr?.toString() || '',
        pts: product.pts?.toString() || '',
        gst: product.gst?.toString() || '',
        status: product.status || 'active',
        sample_type: '',
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isSample = formData.product_type === 'sample';

    const data = {
      product_type: formData.product_type,
      name: formData.name,
      sku: formData.sku,
      variant: isSample ? formData.sample_type : formData.variant,
      pack_type: formData.pack_type,
      sku_size: formData.sku_size,
      pack_size: formData.pack_size,
      mrp: isSample ? 0 : parseFloat(formData.mrp) || 0,
      ptr: isSample ? 0 : parseFloat(formData.ptr) || 0,
      pts: isSample ? 0 : parseFloat(formData.pts) || 0,
      gst: isSample ? 0 : parseFloat(formData.gst) || 0,
      status: formData.status,
    };

    if (isEdit && id) {
      updateProduct.mutate({ id, ...data }, {
        onSuccess: () => navigate('/master/products'),
      });
    } else {
      createProduct.mutate(data, {
        onSuccess: () => navigate('/master/products'),
      });
    }
  };

  const isSample = formData.product_type === 'sample';
  const isSubmitting = createProduct.isPending || updateProduct.isPending;

  if (isEdit && isLoadingProduct) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/master/products')} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="module-title">{isEdit ? 'Edit' : 'New'} {isSample ? 'Sample' : 'Product'}</h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update product details' : 'Add a new product or sample to the catalog'}
          </p>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="card p-6 space-y-6"
      >
        {/* Product Type Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Product Type *</label>
          <div className="flex gap-4">
            <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              formData.product_type === 'product' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}>
              <input
                type="radio"
                name="product_type"
                value="product"
                checked={formData.product_type === 'product'}
                onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                className="sr-only"
              />
              <Package size={24} className={formData.product_type === 'product' ? 'text-primary' : 'text-muted-foreground'} />
              <div>
                <p className="font-medium">Product</p>
                <p className="text-xs text-muted-foreground">Regular product with pricing</p>
              </div>
            </label>

            <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              formData.product_type === 'sample' 
                ? 'border-secondary bg-secondary/5' 
                : 'border-border hover:border-secondary/50'
            }`}>
              <input
                type="radio"
                name="product_type"
                value="sample"
                checked={formData.product_type === 'sample'}
                onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                className="sr-only"
              />
              <FlaskConical size={24} className={formData.product_type === 'sample' ? 'text-secondary' : 'text-muted-foreground'} />
              <div>
                <p className="font-medium">Sample</p>
                <p className="text-xs text-muted-foreground">Sample without pricing</p>
              </div>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Common Fields */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {isSample ? 'Sample Name' : 'Product Name'} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field w-full"
              placeholder={isSample ? 'Enter sample name' : 'Enter product name'}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">SKU *</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="input-field w-full"
              placeholder="e.g., PA-500"
              required
            />
          </div>

          {isSample ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Sample Type *</label>
              <select
                value={formData.sample_type}
                onChange={(e) => setFormData({ ...formData, sample_type: e.target.value })}
                className="input-field w-full"
                required
              >
                <option value="">Select type</option>
                {sampleTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Variant (Category) *</label>
              <select
                value={formData.variant}
                onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                className="input-field w-full"
                required
              >
                <option value="">Select variant</option>
                {variantOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Pack Type</label>
            <select
              value={formData.pack_type}
              onChange={(e) => setFormData({ ...formData, pack_type: e.target.value })}
              className="input-field w-full"
            >
              <option value="">Select pack type</option>
              {packTypeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">SKU Size</label>
            <select
              value={formData.sku_size}
              onChange={(e) => setFormData({ ...formData, sku_size: e.target.value })}
              className="input-field w-full"
            >
              <option value="">Select SKU size</option>
              {skuSizeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Pack Size</label>
            <select
              value={formData.pack_size}
              onChange={(e) => setFormData({ ...formData, pack_size: e.target.value })}
              className="input-field w-full"
            >
              <option value="">Select pack size</option>
              {packSizeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Price Fields - Only for Products */}
          {!isSample && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">MRP (₹) *</label>
                <input
                  type="number"
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                  className="input-field w-full"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">PTR (₹) *</label>
                <input
                  type="number"
                  value={formData.ptr}
                  onChange={(e) => setFormData({ ...formData, ptr: e.target.value })}
                  className="input-field w-full"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">PTS - Supplier Price (₹)</label>
                <input
                  type="number"
                  value={formData.pts}
                  onChange={(e) => setFormData({ ...formData, pts: e.target.value })}
                  className="input-field w-full"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">GST (%) *</label>
                <input
                  type="number"
                  value={formData.gst}
                  onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
                  className="input-field w-full"
                  placeholder="18"
                  min="0"
                  max="100"
                  step="0.01"
                  required
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="input-field w-full"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => navigate('/master/products')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex items-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isEdit ? 'Update' : 'Create'} {isSample ? 'Sample' : 'Product'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
