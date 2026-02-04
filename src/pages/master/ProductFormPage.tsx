import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Plus, Trash2, Package, FlaskConical, Calculator } from 'lucide-react';
import { useProduct, useCreateProduct } from '@/hooks/useProductsData';
import { useCreateSample } from '@/hooks/useSamplesData';
import { useWarehouses } from '@/hooks/useWarehousesData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

const variantOptions = [
  { value: 'Liquid', label: 'Liquid' },
  { value: 'Gel', label: 'Gel' },
  { value: 'Powder', label: 'Powder' },
];

const packTypeOptions = [
  { value: 'container', label: 'Container' },
  { value: 'bottle', label: 'Bottle' },
  { value: 'tube', label: 'Tube' },
];

const skuSizeOptions = [
  { value: '2g', label: '2g' },
  { value: '4g', label: '4g' },
  { value: '5g', label: '5g' },
  { value: '20g', label: '20g' },
];

const packSizeOptions = [
  { value: '2g', label: '2g' },
  { value: '4g', label: '4g' },
  { value: '5g', label: '5g' },
  { value: '20g', label: '20g' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

interface SKUEntry {
  id: string;
  skuSize: string;
  packSize: string;
  unitMRP: string;
  unitPTR: string;
  unitPTS: string;
  boxMRP: number;
  boxPTR: number;
  boxPTS: number;
}

interface SampleSKU {
  skuSize: string;
  packSize: string;
}

export default function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: product, isLoading: isLoadingProduct } = useProduct(id);
  const { data: warehouses = [] } = useWarehouses();
  const createProduct = useCreateProduct();
  const createSample = useCreateSample();

  // Sample toggle
  const [isSample, setIsSample] = useState(false);

  // Product Info
  const [productInfo, setProductInfo] = useState({
    name: '',
    variant: '',
    packType: '',
    status: 'active',
  });

  // Sample specific fields
  const [sampleInfo, setSampleInfo] = useState({
    quantity: '',
    warehouse: '',
    purpose: '',
  });

  // Sample SKU info
  const [sampleSKU, setSampleSKU] = useState<SampleSKU>({
    skuSize: '2g',
    packSize: '2g',
  });

  // SKU Entries for products
  const [skuEntries, setSkuEntries] = useState<SKUEntry[]>([
    { id: crypto.randomUUID(), skuSize: '2g', packSize: '2g', unitMRP: '', unitPTR: '', unitPTS: '', boxMRP: 0, boxPTR: 0, boxPTS: 0 }
  ]);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product && isEdit) {
      setIsSample(product.product_type === 'sample');
      setProductInfo({
        name: product.name || '',
        variant: product.variant || product.category || '',
        packType: product.pack_type || '',
        status: product.status || 'active',
      });
      if (product.pack_size) {
        setSkuEntries([{
          id: crypto.randomUUID(),
          skuSize: product.sku_size || '2g',
          packSize: product.pack_size || '2g',
          unitMRP: product.mrp?.toString() || '',
          unitPTR: product.ptr?.toString() || '',
          unitPTS: product.pts?.toString() || '',
          boxMRP: product.mrp || 0,
          boxPTR: product.ptr || 0,
          boxPTS: product.pts || 0,
        }]);
      }
    }
  }, [product, isEdit]);

  const validateSKUEntry = (entry: SKUEntry): string | null => {
    const mrp = parseFloat(entry.unitMRP) || 0;
    const ptr = parseFloat(entry.unitPTR) || 0;
    const pts = parseFloat(entry.unitPTS) || 0;

    if (mrp <= 0) return 'MRP is required';
    if (pts > ptr) return 'PTS must be ≤ PTR';
    if (ptr > mrp) return 'PTR must be ≤ MRP';
    return null;
  };

  const addSKUEntry = () => {
    setSkuEntries([...skuEntries, {
      id: crypto.randomUUID(),
      skuSize: '2g',
      packSize: '2g',
      unitMRP: '',
      unitPTR: '',
      unitPTS: '',
      boxMRP: 0,
      boxPTR: 0,
      boxPTS: 0,
    }]);
  };

  const removeSKUEntry = (id: string) => {
    if (skuEntries.length > 1) {
      setSkuEntries(skuEntries.filter(entry => entry.id !== id));
    }
  };

  const updateSKUEntry = (id: string, field: keyof SKUEntry, value: string | number) => {
    setSkuEntries(skuEntries.map(entry => {
      if (entry.id !== id) return entry;
      
      const updated = { ...entry, [field]: value };
      
      // For pack size as string (2g, 4g, etc.), just use the unit prices directly as box values
      const unitMRP = parseFloat(String(updated.unitMRP)) || 0;
      const unitPTR = parseFloat(String(updated.unitPTR)) || 0;
      const unitPTS = parseFloat(String(updated.unitPTS)) || 0;
      
      updated.boxMRP = unitMRP;
      updated.boxPTR = unitPTR;
      updated.boxPTS = unitPTS;
      
      return updated;
    }));
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!productInfo.name.trim()) newErrors.name = 'Product name is required';
    if (!productInfo.variant) newErrors.variant = 'Variant is required';
    if (!productInfo.packType) newErrors.packType = 'Pack type is required';

    if (isSample) {
      if (!sampleInfo.quantity || parseInt(sampleInfo.quantity) <= 0) {
        newErrors.quantity = 'Sample quantity is required';
      }
    } else {
      // Validate SKU entries for products
      const validSKUs = skuEntries.filter(entry => 
        entry.unitMRP && entry.unitPTR && entry.unitPTS
      );

      if (validSKUs.length === 0) {
        newErrors.sku = 'At least one complete SKU entry is required';
      }

      validSKUs.forEach((entry, index) => {
        const error = validateSKUEntry(entry);
        if (error) {
          newErrors[`sku_${index}`] = error;
        }
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix validation errors');
      return;
    }

    setErrors({});

    try {
      if (isSample) {
        // Create sample
        await createSample.mutateAsync({
          name: productInfo.name,
          sku: `SMPL-${productInfo.name.substring(0, 3).toUpperCase()}-${sampleSKU.skuSize}-${sampleSKU.packSize}`,
          type: productInfo.variant,
          cost_price: 0,
          stock: parseInt(sampleInfo.quantity) || 0,
          description: `Pack Type: ${productInfo.packType}, SKU Size: ${sampleSKU.skuSize}, Pack Size: ${sampleSKU.packSize}${sampleInfo.purpose ? `. ${sampleInfo.purpose}` : ''}`,
        });
        toast.success('Sample created successfully');
      } else {
        // Create products for each SKU entry
        const validSKUs = skuEntries.filter(entry => 
          entry.unitMRP && entry.unitPTR && entry.unitPTS
        );

        for (const sku of validSKUs) {
          await createProduct.mutateAsync({
            product_type: 'product',
            name: productInfo.name,
            sku: `${productInfo.name.substring(0, 3).toUpperCase()}-${sku.skuSize}-${sku.packSize}`,
            variant: productInfo.variant,
            pack_type: productInfo.packType,
            sku_size: sku.skuSize,
            pack_size: sku.packSize,
            mrp: sku.boxMRP,
            ptr: sku.boxPTR,
            pts: sku.boxPTS,
            gst: 18,
            status: productInfo.status,
          });
        }
        toast.success(`${validSKUs.length} product variant(s) created successfully`);
      }
      
      navigate('/master/products');
    } catch (error) {
      console.error('Error creating:', error);
    }
  };

  const isSubmitting = createProduct.isPending || createSample.isPending;

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
          <h1 className="module-title">{isEdit ? 'Edit' : 'New'} {isSample ? 'Sample' : 'Product'}</h1>
          <p className="text-muted-foreground">
            {isSample ? 'Create a sample for distribution' : 'Create product with pack-level pricing'}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Sample Toggle */}
        {!isEdit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="isSample"
                    checked={isSample}
                    onCheckedChange={(checked) => setIsSample(checked === true)}
                  />
                  <Label htmlFor="isSample" className="flex items-center gap-2 cursor-pointer">
                    <FlaskConical className="h-5 w-5 text-secondary" />
                    <span className="text-base font-medium">This is a Sample</span>
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground mt-2 ml-7">
                  Check this box to create a sample instead of a product
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Common Product/Sample Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                {isSample ? (
                  <FlaskConical className="h-5 w-5 text-secondary" />
                ) : (
                  <Package className="h-5 w-5 text-primary" />
                )}
                {isSample ? 'Sample' : 'Product'} Information
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
                  <Label htmlFor="status">Status *</Label>
                  <select
                    id="status"
                    value={productInfo.status}
                    onChange={(e) => setProductInfo({ ...productInfo, status: e.target.value })}
                    className="input-field w-full"
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sample-specific fields */}
        {isSample && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Sample Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="skuSizeSample">SKU Size *</Label>
                    <select
                      id="skuSizeSample"
                      value={sampleSKU.skuSize}
                      onChange={(e) => setSampleSKU({ ...sampleSKU, skuSize: e.target.value })}
                      className="input-field w-full"
                    >
                      {skuSizeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="packSizeSample">Pack Size *</Label>
                    <select
                      id="packSizeSample"
                      value={sampleSKU.packSize}
                      onChange={(e) => setSampleSKU({ ...sampleSKU, packSize: e.target.value })}
                      className="input-field w-full"
                    >
                      {packSizeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Sample Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={sampleInfo.quantity}
                      onChange={(e) => setSampleInfo({ ...sampleInfo, quantity: e.target.value })}
                      placeholder="Enter quantity"
                      min="1"
                      className={errors.quantity ? 'border-destructive' : ''}
                    />
                    {errors.quantity && <p className="text-xs text-destructive">{errors.quantity}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="warehouse">Warehouse / Location</Label>
                    <select
                      id="warehouse"
                      value={sampleInfo.warehouse}
                      onChange={(e) => setSampleInfo({ ...sampleInfo, warehouse: e.target.value })}
                      className="input-field w-full"
                    >
                      <option value="">Select warehouse</option>
                      {warehouses.map(wh => (
                        <option key={wh.id} value={wh.id}>{wh.name} ({wh.code})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purpose">Purpose / Remarks</Label>
                    <Textarea
                      id="purpose"
                      value={sampleInfo.purpose}
                      onChange={(e) => setSampleInfo({ ...sampleInfo, purpose: e.target.value })}
                      placeholder="Enter purpose or remarks"
                      rows={1}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* SKU Unit Pricing for Products */}
        {!isSample && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-primary" />
                      SKU Unit Pricing
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Enter unit prices. Box value = Unit Price × Pack Size. Validation: MRP ≥ PTR ≥ PTS
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addSKUEntry}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Pack
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {errors.sku && (
                  <p className="text-sm text-destructive mb-4">{errors.sku}</p>
                )}
                
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[100px]">SKU Size</TableHead>
                        <TableHead className="w-[120px]">Pack Size</TableHead>
                        <TableHead>Unit MRP (₹)</TableHead>
                        <TableHead>Unit PTR (₹)</TableHead>
                        <TableHead>Unit PTS (₹)</TableHead>
                        <TableHead className="text-right bg-primary/5">Box MRP (₹)</TableHead>
                        <TableHead className="text-right bg-primary/5">Box PTR (₹)</TableHead>
                        <TableHead className="text-right bg-primary/5">Box PTS (₹)</TableHead>
                        <TableHead className="w-[60px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {skuEntries.map((entry, index) => {
                        const entryError = errors[`sku_${index}`];
                        return (
                          <TableRow key={entry.id} className={entryError ? 'bg-destructive/5' : ''}>
                            <TableCell>
                              <select
                                value={entry.skuSize}
                                onChange={(e) => updateSKUEntry(entry.id, 'skuSize', e.target.value)}
                                className="input-field w-full text-sm"
                              >
                                {skuSizeOptions.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                            </TableCell>
                            <TableCell>
                              <select
                                value={entry.packSize}
                                onChange={(e) => updateSKUEntry(entry.id, 'packSize', e.target.value)}
                                className="input-field w-full text-sm"
                              >
                                {packSizeOptions.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={entry.unitMRP}
                                onChange={(e) => updateSKUEntry(entry.id, 'unitMRP', e.target.value)}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className="text-sm"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={entry.unitPTR}
                                onChange={(e) => updateSKUEntry(entry.id, 'unitPTR', e.target.value)}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className="text-sm"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={entry.unitPTS}
                                onChange={(e) => updateSKUEntry(entry.id, 'unitPTS', e.target.value)}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className="text-sm"
                              />
                            </TableCell>
                            <TableCell className="text-right font-medium bg-primary/5">
                              ₹{entry.boxMRP.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-medium bg-primary/5">
                              ₹{entry.boxPTR.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-medium bg-primary/5">
                              ₹{entry.boxPTS.toFixed(2)}
                            </TableCell>
                            <TableCell>
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
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {skuEntries.some((_, index) => errors[`sku_${index}`]) && (
                  <div className="mt-3 space-y-1">
                    {skuEntries.map((_, index) => 
                      errors[`sku_${index}`] && (
                        <p key={index} className="text-xs text-destructive">
                          Row {index + 1}: {errors[`sku_${index}`]}
                        </p>
                      )
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

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
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSample ? 'Create Sample' : 'Publish Product'}
          </Button>
        </div>
      </div>
    </div>
  );
}
