import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  IndianRupee,
  Gift,
  FileText,
  Shield,
  ShoppingCart,
  Store,
  ChevronLeft,
  ChevronRight,
  Check,
  Save,
  Plus,
  Trash2,
  Upload,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDistributor, useCreateDistributor, useUpdateDistributor } from '@/hooks/useOutletsData';
import { useProducts } from '@/hooks/useProductsData';
import { useSchemes } from '@/hooks/useSchemesData';
import {
  useDistributorProducts,
  useDistributorPricingTiers,
  useDistributorSchemes,
  useDistributorKycDocuments,
  useDistributorSecondaryCounters,
  useSaveDistributorExtendedData,
} from '@/hooks/useDistributorExtendedData';

type Step = {
  id: string;
  title: string;
  icon: React.ElementType;
};

const steps: Step[] = [
  { id: 'products', title: 'Product Information', icon: Package },
  { id: 'pricing', title: 'Pricing & Margins', icon: IndianRupee },
  { id: 'schemes', title: 'Schemes', icon: Gift },
  { id: 'agreement', title: 'Agreement & Policies', icon: FileText },
  { id: 'kyc', title: 'KYC Documents', icon: Shield },
  { id: 'orders', title: 'Orders', icon: ShoppingCart },
  { id: 'counters', title: 'Secondary Counters', icon: Store },
];

export default function DistributorFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  // Fetch data
  const { data: distributor, isLoading: distributorLoading } = useDistributor(id || '');
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: schemes, isLoading: schemesLoading } = useSchemes();
  const { data: existingProducts } = useDistributorProducts(id);
  const { data: existingTiers } = useDistributorPricingTiers(id);
  const { data: existingSchemes } = useDistributorSchemes(id);
  const { data: existingKycDocs } = useDistributorKycDocuments(id);
  const { data: existingCounters } = useDistributorSecondaryCounters(id);

  // Mutations
  const createDistributor = useCreateDistributor();
  const updateDistributor = useUpdateDistributor();
  const saveExtendedData = useSaveDistributorExtendedData();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Basic Info
    code: '',
    firmName: '',
    ownerName: '',
    gstin: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    
    // Products
    selectedProducts: [] as { productId: string; marginPercent: number }[],
    
    // Pricing
    pricingTiers: [
      { minQty: 1, maxQty: 100, marginPercent: 10 },
      { minQty: 101, maxQty: 500, marginPercent: 12 },
      { minQty: 501, maxQty: 999999, marginPercent: 15 },
    ],
    creditLimit: 500000,
    paymentTerms: '30',
    
    // Schemes
    assignedSchemes: [] as string[],
    
    // Agreement
    agreementStartDate: '',
    agreementEndDate: '',
    territoryExclusive: false,
    minimumOrderValue: 50000,
    returnPolicy: 'standard',
    
    // KYC
    kycDocuments: [] as { type: string; number: string; file?: string }[],
    
    // Secondary Counters
    secondaryCounters: [] as { name: string; address: string; phone: string }[],
  });

  // Load existing data for edit mode
  useEffect(() => {
    if (isEdit && distributor) {
      setFormData(prev => ({
        ...prev,
        code: distributor.code || '',
        firmName: distributor.firm_name || '',
        ownerName: distributor.owner_name || '',
        gstin: distributor.gstin || '',
        phone: distributor.phone || '',
        email: distributor.email || '',
        address: distributor.address || '',
        city: distributor.city || '',
        state: distributor.state || '',
        creditLimit: Number(distributor.credit_limit) || 500000,
        paymentTerms: (distributor as any).payment_terms || '30',
        agreementStartDate: (distributor as any).agreement_start_date || '',
        agreementEndDate: (distributor as any).agreement_end_date || '',
        territoryExclusive: (distributor as any).territory_exclusive || false,
        minimumOrderValue: Number((distributor as any).minimum_order_value) || 50000,
        returnPolicy: (distributor as any).return_policy || 'standard',
      }));
    }
  }, [isEdit, distributor]);

  // Load extended data
  useEffect(() => {
    if (existingProducts?.length) {
      setFormData(prev => ({
        ...prev,
        selectedProducts: existingProducts.map(p => ({
          productId: p.product_id,
          marginPercent: Number(p.margin_percent) || 0,
        })),
      }));
    }
  }, [existingProducts]);

  useEffect(() => {
    if (existingTiers?.length) {
      setFormData(prev => ({
        ...prev,
        pricingTiers: existingTiers.map(t => ({
          minQty: t.min_qty,
          maxQty: t.max_qty,
          marginPercent: Number(t.margin_percent),
        })),
      }));
    }
  }, [existingTiers]);

  useEffect(() => {
    if (existingSchemes?.length) {
      setFormData(prev => ({
        ...prev,
        assignedSchemes: existingSchemes.map(s => s.scheme_id),
      }));
    }
  }, [existingSchemes]);

  useEffect(() => {
    if (existingKycDocs?.length) {
      setFormData(prev => ({
        ...prev,
        kycDocuments: existingKycDocs.map(d => ({
          type: d.document_type,
          number: d.document_number,
          file: d.file_url || undefined,
        })),
      }));
    }
  }, [existingKycDocs]);

  useEffect(() => {
    if (existingCounters?.length) {
      setFormData(prev => ({
        ...prev,
        secondaryCounters: existingCounters.map(c => ({
          name: c.name,
          address: c.address || '',
          phone: c.phone || '',
        })),
      }));
    }
  }, [existingCounters]);

  const handleProductToggle = (productId: string) => {
    setFormData(prev => {
      const exists = prev.selectedProducts.find(p => p.productId === productId);
      if (exists) {
        return {
          ...prev,
          selectedProducts: prev.selectedProducts.filter(p => p.productId !== productId),
        };
      } else {
        return {
          ...prev,
          selectedProducts: [...prev.selectedProducts, { productId, marginPercent: 10 }],
        };
      }
    });
  };

  const handleSchemeToggle = (schemeId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedSchemes: prev.assignedSchemes.includes(schemeId)
        ? prev.assignedSchemes.filter(id => id !== schemeId)
        : [...prev.assignedSchemes, schemeId],
    }));
  };

  const addPricingTier = () => {
    setFormData(prev => ({
      ...prev,
      pricingTiers: [...prev.pricingTiers, { minQty: 0, maxQty: 0, marginPercent: 0 }],
    }));
  };

  const removePricingTier = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pricingTiers: prev.pricingTiers.filter((_, i) => i !== index),
    }));
  };

  const addKycDocument = () => {
    setFormData(prev => ({
      ...prev,
      kycDocuments: [...prev.kycDocuments, { type: '', number: '' }],
    }));
  };

  const removeKycDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      kycDocuments: prev.kycDocuments.filter((_, i) => i !== index),
    }));
  };

  const addSecondaryCounter = () => {
    setFormData(prev => ({
      ...prev,
      secondaryCounters: [...prev.secondaryCounters, { name: '', address: '', phone: '' }],
    }));
  };

  const removeSecondaryCounter = (index: number) => {
    setFormData(prev => ({
      ...prev,
      secondaryCounters: prev.secondaryCounters.filter((_, i) => i !== index),
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.firmName || !formData.ownerName) {
      toast.error('Please fill in required fields: Code, Firm Name, Owner Name');
      return;
    }

    try {
      const distributorData = {
        code: formData.code,
        firm_name: formData.firmName,
        owner_name: formData.ownerName,
        gstin: formData.gstin || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        credit_limit: formData.creditLimit,
        payment_terms: formData.paymentTerms,
        agreement_start_date: formData.agreementStartDate || undefined,
        agreement_end_date: formData.agreementEndDate || undefined,
        territory_exclusive: formData.territoryExclusive,
        minimum_order_value: formData.minimumOrderValue,
        return_policy: formData.returnPolicy,
      };

      let distributorId = id;

      if (isEdit && id) {
        await updateDistributor.mutateAsync({ id, ...distributorData });
      } else {
        const result = await createDistributor.mutateAsync(distributorData);
        distributorId = result.id;
      }

      // Save extended data
      if (distributorId) {
        await saveExtendedData.mutateAsync({
          distributorId,
          products: formData.selectedProducts.map(p => ({
            product_id: p.productId,
            margin_percent: p.marginPercent,
          })),
          pricingTiers: formData.pricingTiers.map(t => ({
            min_qty: t.minQty,
            max_qty: t.maxQty,
            margin_percent: t.marginPercent,
          })),
          schemes: formData.assignedSchemes,
          kycDocuments: formData.kycDocuments
            .filter(d => d.type && d.number)
            .map(d => ({
              document_type: d.type,
              document_number: d.number,
              file_url: d.file,
            })),
          secondaryCounters: formData.secondaryCounters
            .filter(c => c.name)
            .map(c => ({
              name: c.name,
              address: c.address || undefined,
              phone: c.phone || undefined,
            })),
        });
      }

      toast.success(isEdit ? 'Distributor updated successfully' : 'Distributor created successfully');
      navigate('/outlets/distributors');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save distributor');
    }
  };

  const isLoading = distributorLoading || productsLoading || schemesLoading;
  const isSaving = createDistributor.isPending || updateDistributor.isPending || saveExtendedData.isPending;

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'products':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Select Products for Distribution</h3>
              <p className="text-sm text-muted-foreground mb-4">Choose the products this distributor will handle</p>
            </div>

            {productsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : products?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No products available. Add products first.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {products?.map(product => {
                  const isSelected = formData.selectedProducts.some(p => p.productId === product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => handleProductToggle(product.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                        }`}>
                          {isSelected && <Check size={12} className="text-primary-foreground" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            SKU: {product.sku} • {product.category || 'Uncategorized'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              {formData.selectedProducts.length} products selected
            </p>
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Pricing & Margin Structure</h3>
              <p className="text-sm text-muted-foreground mb-4">Define pricing tiers and payment terms</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Credit Limit (₹)</label>
                <input
                  type="number"
                  value={formData.creditLimit}
                  onChange={e => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Payment Terms (Days)</label>
                <select
                  value={formData.paymentTerms}
                  onChange={e => setFormData({ ...formData, paymentTerms: e.target.value })}
                  className="input-field"
                >
                  <option value="15">15 Days</option>
                  <option value="30">30 Days</option>
                  <option value="45">45 Days</option>
                  <option value="60">60 Days</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Margin Tiers</h4>
                <button onClick={addPricingTier} className="btn-outline text-sm flex items-center gap-1">
                  <Plus size={14} /> Add Tier
                </button>
              </div>

              {formData.pricingTiers.map((tier, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Min Qty</label>
                    <input
                      type="number"
                      value={tier.minQty}
                      onChange={e => {
                        const tiers = [...formData.pricingTiers];
                        tiers[index].minQty = Number(e.target.value);
                        setFormData({ ...formData, pricingTiers: tiers });
                      }}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Max Qty</label>
                    <input
                      type="number"
                      value={tier.maxQty}
                      onChange={e => {
                        const tiers = [...formData.pricingTiers];
                        tiers[index].maxQty = Number(e.target.value);
                        setFormData({ ...formData, pricingTiers: tiers });
                      }}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Margin %</label>
                    <input
                      type="number"
                      value={tier.marginPercent}
                      onChange={e => {
                        const tiers = [...formData.pricingTiers];
                        tiers[index].marginPercent = Number(e.target.value);
                        setFormData({ ...formData, pricingTiers: tiers });
                      }}
                      className="input-field"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => removePricingTier(index)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'schemes':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Assign Schemes</h3>
              <p className="text-sm text-muted-foreground mb-4">Select applicable schemes for this distributor</p>
            </div>

            {schemesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : schemes?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No schemes available. Create schemes first.
              </div>
            ) : (
              <div className="space-y-3">
                {schemes?.map(scheme => (
                  <div
                    key={scheme.id}
                    onClick={() => handleSchemeToggle(scheme.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.assignedSchemes.includes(scheme.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          formData.assignedSchemes.includes(scheme.id)
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        }`}>
                          {formData.assignedSchemes.includes(scheme.id) && (
                            <Check size={12} className="text-primary-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{scheme.name}</p>
                          <p className="text-xs text-muted-foreground">{scheme.type}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        scheme.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                      }`}>
                        {scheme.discount_percent ? `${scheme.discount_percent}%` : scheme.free_quantity ? `${scheme.free_quantity} Free` : 'Active'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              {formData.assignedSchemes.length} schemes assigned
            </p>
          </div>
        );

      case 'agreement':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Agreement & Policies</h3>
              <p className="text-sm text-muted-foreground mb-4">Configure distributor agreement terms</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Agreement Start Date</label>
                <input
                  type="date"
                  value={formData.agreementStartDate}
                  onChange={e => setFormData({ ...formData, agreementStartDate: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Agreement End Date</label>
                <input
                  type="date"
                  value={formData.agreementEndDate}
                  onChange={e => setFormData({ ...formData, agreementEndDate: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Minimum Order Value (₹)</label>
                <input
                  type="number"
                  value={formData.minimumOrderValue}
                  onChange={e => setFormData({ ...formData, minimumOrderValue: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Return Policy</label>
                <select
                  value={formData.returnPolicy}
                  onChange={e => setFormData({ ...formData, returnPolicy: e.target.value })}
                  className="input-field"
                >
                  <option value="standard">Standard (15 Days)</option>
                  <option value="extended">Extended (30 Days)</option>
                  <option value="no-return">No Return</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
              <input
                type="checkbox"
                id="exclusive"
                checked={formData.territoryExclusive}
                onChange={e => setFormData({ ...formData, territoryExclusive: e.target.checked })}
                className="w-5 h-5 rounded border-border"
              />
              <label htmlFor="exclusive" className="text-foreground">
                <span className="font-medium">Territory Exclusive Rights</span>
                <p className="text-sm text-muted-foreground">Grant exclusive distribution rights in assigned territory</p>
              </label>
            </div>

            <div className="p-4 border-2 border-dashed border-border rounded-xl">
              <div className="flex flex-col items-center gap-2 text-center">
                <Upload size={32} className="text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Upload signed agreement document</p>
                <button className="btn-outline text-sm">Choose File</button>
              </div>
            </div>
          </div>
        );

      case 'kyc':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">KYC Documents</h3>
              <p className="text-sm text-muted-foreground mb-4">Upload required KYC documents</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Documents</h4>
                <button onClick={addKycDocument} className="btn-outline text-sm flex items-center gap-1">
                  <Plus size={14} /> Add Document
                </button>
              </div>

              {formData.kycDocuments.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-border rounded-xl text-center">
                  <Shield size={40} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No documents added yet</p>
                  <button onClick={addKycDocument} className="btn-primary text-sm mt-4">
                    Add First Document
                  </button>
                </div>
              ) : (
                formData.kycDocuments.map((doc, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Document Type</label>
                      <select
                        value={doc.type}
                        onChange={e => {
                          const docs = [...formData.kycDocuments];
                          docs[index].type = e.target.value;
                          setFormData({ ...formData, kycDocuments: docs });
                        }}
                        className="input-field"
                      >
                        <option value="">Select Type</option>
                        <option value="pan">PAN Card</option>
                        <option value="aadhaar">Aadhaar Card</option>
                        <option value="gst">GST Certificate</option>
                        <option value="bank">Bank Statement</option>
                        <option value="address">Address Proof</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Document Number</label>
                      <input
                        type="text"
                        value={doc.number}
                        onChange={e => {
                          const docs = [...formData.kycDocuments];
                          docs[index].number = e.target.value;
                          setFormData({ ...formData, kycDocuments: docs });
                        }}
                        placeholder="Enter number"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Upload</label>
                      <button className="btn-outline text-sm w-full">
                        <Upload size={14} className="mr-1" /> Upload
                      </button>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => removeKycDocument(index)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Orders</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isEdit ? 'View order history for this distributor' : 'Order history will be available after creation'}
              </p>
            </div>

            {isEdit ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
                <p>Order history will appear here</p>
                <button 
                  onClick={() => navigate('/orders/new')}
                  className="btn-primary text-sm mt-4"
                >
                  Create New Order
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
                <p>Save the distributor first to create orders</p>
              </div>
            )}
          </div>
        );

      case 'counters':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Secondary Counters</h3>
              <p className="text-sm text-muted-foreground mb-4">Add secondary business locations</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Locations</h4>
                <button onClick={addSecondaryCounter} className="btn-outline text-sm flex items-center gap-1">
                  <Plus size={14} /> Add Counter
                </button>
              </div>

              {formData.secondaryCounters.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-border rounded-xl text-center">
                  <Store size={40} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No secondary counters added</p>
                  <button onClick={addSecondaryCounter} className="btn-primary text-sm mt-4">
                    Add Counter
                  </button>
                </div>
              ) : (
                formData.secondaryCounters.map((counter, index) => (
                  <div key={index} className="p-4 bg-muted/30 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-foreground">Counter {index + 1}</h5>
                      <button
                        onClick={() => removeSecondaryCounter(index)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Name</label>
                        <input
                          type="text"
                          value={counter.name}
                          onChange={e => {
                            const counters = [...formData.secondaryCounters];
                            counters[index].name = e.target.value;
                            setFormData({ ...formData, secondaryCounters: counters });
                          }}
                          placeholder="Counter name"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Address</label>
                        <input
                          type="text"
                          value={counter.address}
                          onChange={e => {
                            const counters = [...formData.secondaryCounters];
                            counters[index].address = e.target.value;
                            setFormData({ ...formData, secondaryCounters: counters });
                          }}
                          placeholder="Address"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Phone</label>
                        <input
                          type="text"
                          value={counter.phone}
                          onChange={e => {
                            const counters = [...formData.secondaryCounters];
                            counters[index].phone = e.target.value;
                            setFormData({ ...formData, secondaryCounters: counters });
                          }}
                          placeholder="Phone number"
                          className="input-field"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading && isEdit) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/outlets/distributors')} className="p-2 hover:bg-muted rounded-lg">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEdit ? 'Edit Distributor' : 'Add New Distributor'}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? 'Update distributor information' : 'Complete all steps to create a distributor'}
            </p>
          </div>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(index)}
                  className={`flex flex-col items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : isCompleted
                      ? 'text-success'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : isCompleted
                      ? 'bg-success text-success-foreground'
                      : 'bg-muted'
                  }`}>
                    {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                  </div>
                  <span className="text-xs font-medium hidden md:block">{step.title}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 ${isCompleted ? 'bg-success' : 'bg-muted'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-card rounded-xl border border-border p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="btn-outline flex items-center gap-2"
        >
          <ChevronLeft size={18} />
          Previous
        </button>

        <div className="flex items-center gap-3">
          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="btn-primary flex items-center gap-2"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isEdit ? 'Update Distributor' : 'Create Distributor'}
            </button>
          ) : (
            <button onClick={handleNext} className="btn-primary flex items-center gap-2">
              Next
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
