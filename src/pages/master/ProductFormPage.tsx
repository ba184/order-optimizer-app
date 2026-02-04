import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Plus, Trash2, RefreshCw, Package } from 'lucide-react';
import { useProduct, useCreateProduct } from '@/hooks/useProductsData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

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
];

const skuSizeOptions = [
  { value: '2g', label: '2g' },
  { value: '4g', label: '4g' },
  { value: '5g', label: '5g' },
  { value: '20g', label: '20g' },
];

const packSizeOptions = [
  { value: 5, label: '5 nos' },
  { value: 10, label: '10 nos' },
];

interface SKUEntry {
  id: string;
  skuSize: string;
  unitMRP: string;
  unitPTR: string;
  unitPTS: string;
}

interface PackPrice {
  skuSize: string;
  packSize: number;
  packMRP: number;
  packPTR: number;
  packPTS: number;
}

export default function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: product, isLoading: isLoadingProduct } = useProduct(id);
  const createProduct = useCreateProduct();

  // Section 1: Product Info
  const [productInfo, setProductInfo] = useState({
    name: '',
    variant: '',
    packType: '',
    gst: '18',
  });

  // Section 2: SKU Entries
  const [skuEntries, setSkuEntries] = useState<SKUEntry[]>([
    { id: crypto.randomUUID(), skuSize: '', unitMRP: '', unitPTR: '', unitPTS: '' }
  ]);

  // Section 3: Generated Pack Prices
  const [packPrices, setPackPrices] = useState<PackPrice[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product && isEdit) {
      setProductInfo({
        name: product.name || '',
        variant: product.variant || product.category || '',
        packType: product.pack_type || '',
        gst: product.gst?.toString() || '18',
      });
      // For edit mode, populate SKU entry from existing product
      if (product.sku_size) {
        setSkuEntries([{
          id: crypto.randomUUID(),
          skuSize: product.sku_size,
          unitMRP: product.mrp?.toString() || '',
          unitPTR: product.ptr?.toString() || '',
          unitPTS: product.pts?.toString() || '',
        }]);
      }
    }
  }, [product, isEdit]);

  const validateSKUEntry = (entry: SKUEntry): string | null => {
    const mrp = parseFloat(entry.unitMRP) || 0;
    const ptr = parseFloat(entry.unitPTR) || 0;
    const pts = parseFloat(entry.unitPTS) || 0;

    if (pts > ptr) return 'PTS must be ≤ PTR';
    if (ptr > mrp) return 'PTR must be ≤ MRP';
    return null;
  };

  const addSKUEntry = () => {
    setSkuEntries([...skuEntries, {
      id: crypto.randomUUID(),
      skuSize: '',
      unitMRP: '',
      unitPTR: '',
      unitPTS: ''
    }]);
  };

  const removeSKUEntry = (id: string) => {
    if (skuEntries.length > 1) {
      setSkuEntries(skuEntries.filter(entry => entry.id !== id));
    }
  };

  const updateSKUEntry = (id: string, field: keyof SKUEntry, value: string) => {
    setSkuEntries(skuEntries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
    // Clear pack prices when SKU entries change
    setPackPrices([]);
  };

  const generatePackPrices = () => {
    // Validate all entries first
    const newErrors: Record<string, string> = {};
    
    if (!productInfo.name.trim()) newErrors.name = 'Product name is required';
    if (!productInfo.variant) newErrors.variant = 'Variant is required';
    if (!productInfo.packType) newErrors.packType = 'Pack type is required';
    if (!productInfo.gst) newErrors.gst = 'GST is required';

    const validSKUs = skuEntries.filter(entry => 
      entry.skuSize && entry.unitMRP && entry.unitPTR && entry.unitPTS
    );

    if (validSKUs.length === 0) {
      newErrors.sku = 'At least one complete SKU entry is required';
    }

    // Validate pricing rules
    validSKUs.forEach((entry, index) => {
      const error = validateSKUEntry(entry);
      if (error) {
        newErrors[`sku_${index}`] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix validation errors before generating');
      return;
    }

    setErrors({});
    setIsGenerating(true);

    // Generate pack prices for each SKU + Pack Size combination
    const generated: PackPrice[] = [];
    
    validSKUs.forEach(sku => {
      packSizeOptions.forEach(pack => {
        const unitMRP = parseFloat(sku.unitMRP) || 0;
        const unitPTR = parseFloat(sku.unitPTR) || 0;
        const unitPTS = parseFloat(sku.unitPTS) || 0;

        generated.push({
          skuSize: sku.skuSize,
          packSize: pack.value,
          packMRP: unitMRP * pack.value,
          packPTR: unitPTR * pack.value,
          packPTS: unitPTS * pack.value,
        });
      });
    });

    setTimeout(() => {
      setPackPrices(generated);
      setIsGenerating(false);
      toast.success('Pack prices generated successfully');
    }, 500);
  };

  const handlePublish = async () => {
    if (packPrices.length === 0) {
      toast.error('Please generate pack prices first');
      return;
    }

    const gstValue = parseFloat(productInfo.gst) || 0;

    try {
      // Create a product entry for each pack price
      for (const pack of packPrices) {
        await createProduct.mutateAsync({
          product_type: 'product',
          name: productInfo.name,
          sku: `${productInfo.name.substring(0, 3).toUpperCase()}-${pack.skuSize}-${pack.packSize}`,
          variant: productInfo.variant,
          pack_type: productInfo.packType,
          sku_size: pack.skuSize,
          pack_size: `${pack.packSize}nos`,
          mrp: pack.packMRP,
          ptr: pack.packPTR,
          pts: pack.packPTS,
          gst: gstValue,
          status: 'active',
        });
      }
      
      toast.success(`${packPrices.length} product variants created successfully`);
      navigate('/master/products');
    } catch (error) {
      console.error('Error creating products:', error);
    }
  };

  const isSubmitting = createProduct.isPending;

  if (isEdit && isLoadingProduct) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/master/products')} 
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="module-title">{isEdit ? 'Edit' : 'New'} Product</h1>
          <p className="text-muted-foreground">
            Create product with SKU-level pricing and auto-calculated pack prices
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: Product Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={productInfo.name}
                    onChange={(e) => setProductInfo({ ...productInfo, name: e.target.value })}
                    placeholder="Enter product name"
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="variant">Variant *</Label>
                  <select
                    id="variant"
                    value={productInfo.variant}
                    onChange={(e) => setProductInfo({ ...productInfo, variant: e.target.value })}
                    className={`input-field w-full ${errors.variant ? 'border-destructive' : ''}`}
                  >
                    <option value="">Select variant</option>
                    {variantOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {errors.variant && <p className="text-xs text-destructive">{errors.variant}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="packType">Pack Type *</Label>
                  <select
                    id="packType"
                    value={productInfo.packType}
                    onChange={(e) => setProductInfo({ ...productInfo, packType: e.target.value })}
                    className={`input-field w-full ${errors.packType ? 'border-destructive' : ''}`}
                  >
                    <option value="">Select pack type</option>
                    {packTypeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {errors.packType && <p className="text-xs text-destructive">{errors.packType}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gst">Universal GST % *</Label>
                  <Input
                    id="gst"
                    type="number"
                    value={productInfo.gst}
                    onChange={(e) => setProductInfo({ ...productInfo, gst: e.target.value })}
                    placeholder="18"
                    min="0"
                    max="100"
                    className={errors.gst ? 'border-destructive' : ''}
                  />
                  {errors.gst && <p className="text-xs text-destructive">{errors.gst}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section 2: SKU Unit Pricing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">SKU Unit Pricing</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addSKUEntry}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add SKU
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter unit-level pricing for each SKU size. Validation: PTS ≤ PTR ≤ MRP
              </p>
            </CardHeader>
            <CardContent>
              {errors.sku && (
                <p className="text-sm text-destructive mb-4">{errors.sku}</p>
              )}
              <div className="space-y-4">
                {skuEntries.map((entry, index) => {
                  const entryError = errors[`sku_${index}`];
                  return (
                    <div 
                      key={entry.id} 
                      className={`grid grid-cols-1 md:grid-cols-5 gap-4 p-4 rounded-lg border ${entryError ? 'border-destructive bg-destructive/5' : 'bg-muted/30'}`}
                    >
                      <div className="space-y-2">
                        <Label>SKU Size *</Label>
                        <select
                          value={entry.skuSize}
                          onChange={(e) => updateSKUEntry(entry.id, 'skuSize', e.target.value)}
                          className="input-field w-full"
                        >
                          <option value="">Select size</option>
                          {skuSizeOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>Unit MRP (₹) *</Label>
                        <Input
                          type="number"
                          value={entry.unitMRP}
                          onChange={(e) => updateSKUEntry(entry.id, 'unitMRP', e.target.value)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Unit PTR (₹) *</Label>
                        <Input
                          type="number"
                          value={entry.unitPTR}
                          onChange={(e) => updateSKUEntry(entry.id, 'unitPTR', e.target.value)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Unit PTS (₹) *</Label>
                        <Input
                          type="number"
                          value={entry.unitPTS}
                          onChange={(e) => updateSKUEntry(entry.id, 'unitPTS', e.target.value)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSKUEntry(entry.id)}
                          disabled={skuEntries.length === 1}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {entryError && (
                        <p className="col-span-full text-xs text-destructive">{entryError}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-center">
                <Button 
                  type="button" 
                  onClick={generatePackPrices}
                  disabled={isGenerating}
                  className="min-w-[200px]"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Generate Pack Prices
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section 3: Pack Pricing (Auto) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Pack Pricing (Auto-Generated)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Final pack prices calculated as: Unit Price × Pack Quantity
              </p>
            </CardHeader>
            <CardContent>
              {packPrices.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No pack prices generated yet</p>
                  <p className="text-sm">Fill SKU pricing above and click "Generate Pack Prices"</p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>SKU Size</TableHead>
                        <TableHead>Pack Size</TableHead>
                        <TableHead className="text-right">Pack MRP (₹)</TableHead>
                        <TableHead className="text-right">Pack PTR (₹)</TableHead>
                        <TableHead className="text-right">Pack PTS (₹)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {packPrices.map((pack, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{pack.skuSize}</TableCell>
                          <TableCell>{pack.packSize} nos</TableCell>
                          <TableCell className="text-right">₹{pack.packMRP.toFixed(2)}</TableCell>
                          <TableCell className="text-right">₹{pack.packPTR.toFixed(2)}</TableCell>
                          <TableCell className="text-right">₹{pack.packPTS.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/master/products')}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isSubmitting || packPrices.length === 0}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Publish Product
          </Button>
        </div>
      </div>
    </div>
  );
}
