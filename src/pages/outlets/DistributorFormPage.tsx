import { useState } from 'react';
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
  X,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';

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

const mockProducts = [
  { id: '1', name: 'Product Alpha 500ml', sku: 'PA-500', category: 'Beverages' },
  { id: '2', name: 'Product Beta 1L', sku: 'PB-1L', category: 'Beverages' },
  { id: '3', name: 'Product Gamma 250g', sku: 'PG-250', category: 'Food' },
  { id: '4', name: 'Product Delta Pack', sku: 'PD-PK', category: 'Combo' },
];

const mockSchemes = [
  { id: '1', name: 'Summer Sale 2024', type: 'Discount', value: '10%' },
  { id: '2', name: 'Buy 10 Get 1 Free', type: 'Free Product', value: '1 Free' },
  { id: '3', name: 'Festive Offer', type: 'Cashback', value: '₹500' },
];

export default function DistributorFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Basic Info
    firmName: '',
    ownerName: '',
    gstin: '',
    pan: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    
    // Products
    selectedProducts: [] as string[],
    
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

  const handleProductToggle = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.includes(productId)
        ? prev.selectedProducts.filter(id => id !== productId)
        : [...prev.selectedProducts, productId]
    }));
  };

  const handleSchemeToggle = (schemeId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedSchemes: prev.assignedSchemes.includes(schemeId)
        ? prev.assignedSchemes.filter(id => id !== schemeId)
        : [...prev.assignedSchemes, schemeId]
    }));
  };

  const addPricingTier = () => {
    setFormData(prev => ({
      ...prev,
      pricingTiers: [...prev.pricingTiers, { minQty: 0, maxQty: 0, marginPercent: 0 }]
    }));
  };

  const removePricingTier = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pricingTiers: prev.pricingTiers.filter((_, i) => i !== index)
    }));
  };

  const addKycDocument = () => {
    setFormData(prev => ({
      ...prev,
      kycDocuments: [...prev.kycDocuments, { type: '', number: '' }]
    }));
  };

  const removeKycDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      kycDocuments: prev.kycDocuments.filter((_, i) => i !== index)
    }));
  };

  const addSecondaryCounter = () => {
    setFormData(prev => ({
      ...prev,
      secondaryCounters: [...prev.secondaryCounters, { name: '', address: '', phone: '' }]
    }));
  };

  const removeSecondaryCounter = (index: number) => {
    setFormData(prev => ({
      ...prev,
      secondaryCounters: prev.secondaryCounters.filter((_, i) => i !== index)
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

  const handleSubmit = () => {
    toast.success(isEdit ? 'Distributor updated successfully' : 'Distributor created successfully');
    navigate('/outlets/distributors');
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'products':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Select Products for Distribution</h3>
              <p className="text-sm text-muted-foreground mb-4">Choose the products this distributor will handle</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {mockProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => handleProductToggle(product.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.selectedProducts.includes(product.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.selectedProducts.includes(product.id)
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`}>
                      {formData.selectedProducts.includes(product.id) && (
                        <Check size={12} className="text-primary-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">SKU: {product.sku} • {product.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
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

            <div className="space-y-3">
              {mockSchemes.map(scheme => (
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
                    <span className="px-3 py-1 bg-success/10 text-success rounded-full text-sm font-medium">
                      {scheme.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>

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

              {formData.kycDocuments.length === 0 && (
                <div className="p-8 border-2 border-dashed border-border rounded-xl text-center">
                  <Shield size={40} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No documents added yet</p>
                  <button onClick={addKycDocument} className="btn-primary mt-4">
                    Add First Document
                  </button>
                </div>
              )}

              {formData.kycDocuments.map((doc, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
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
                      <option value="gstin">GSTIN Certificate</option>
                      <option value="aadhar">Aadhar Card</option>
                      <option value="bank">Bank Statement</option>
                      <option value="address">Address Proof</option>
                      <option value="photo">Passport Photo</option>
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
                      placeholder="Enter document number"
                      className="input-field"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button className="btn-outline text-sm flex-1">
                      <Upload size={14} className="mr-1" /> Upload
                    </button>
                    <button
                      onClick={() => removeKycDocument(index)}
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

      case 'orders':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Order History</h3>
              <p className="text-sm text-muted-foreground mb-4">View and manage distributor orders</p>
            </div>

            {isEdit ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="stat-card">
                    <p className="text-2xl font-bold text-foreground">₹12.5L</p>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                  </div>
                  <div className="stat-card">
                    <p className="text-2xl font-bold text-foreground">45</p>
                    <p className="text-sm text-muted-foreground">Order Count</p>
                  </div>
                  <div className="stat-card">
                    <p className="text-2xl font-bold text-foreground">₹1.2L</p>
                    <p className="text-sm text-muted-foreground">Outstanding</p>
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Order ID</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium">ORD-2024-001</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">Dec 8, 2024</td>
                        <td className="px-4 py-3 text-sm font-medium">₹45,000</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 bg-success/10 text-success rounded text-xs">Delivered</span></td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium">ORD-2024-002</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">Dec 5, 2024</td>
                        <td className="px-4 py-3 text-sm font-medium">₹32,500</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 bg-warning/10 text-warning rounded text-xs">Pending</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-12 border-2 border-dashed border-border rounded-xl text-center">
                <ShoppingCart size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Order history will be available after creating the distributor</p>
              </div>
            )}
          </div>
        );

      case 'counters':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Secondary Counters</h3>
              <p className="text-sm text-muted-foreground mb-4">Add sub-distributors or secondary outlets</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Counters ({formData.secondaryCounters.length})</h4>
                <button onClick={addSecondaryCounter} className="btn-outline text-sm flex items-center gap-1">
                  <Plus size={14} /> Add Counter
                </button>
              </div>

              {formData.secondaryCounters.length === 0 && (
                <div className="p-8 border-2 border-dashed border-border rounded-xl text-center">
                  <Store size={40} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No secondary counters added</p>
                  <button onClick={addSecondaryCounter} className="btn-primary mt-4">
                    Add First Counter
                  </button>
                </div>
              )}

              {formData.secondaryCounters.map((counter, index) => (
                <div key={index} className="p-4 bg-muted/30 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">Counter #{index + 1}</span>
                    <button
                      onClick={() => removeSecondaryCounter(index)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Counter Name</label>
                      <input
                        type="text"
                        value={counter.name}
                        onChange={e => {
                          const counters = [...formData.secondaryCounters];
                          counters[index].name = e.target.value;
                          setFormData({ ...formData, secondaryCounters: counters });
                        }}
                        placeholder="Enter name"
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
                        placeholder="Enter address"
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
                        placeholder="Enter phone"
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">{isEdit ? 'Edit Distributor' : 'Add Distributor'}</h1>
          <p className="text-muted-foreground">Complete all steps to {isEdit ? 'update' : 'create'} distributor</p>
        </div>
        <button onClick={() => navigate('/outlets/distributors')} className="btn-outline flex items-center gap-2">
          <X size={18} />
          Cancel
        </button>
      </div>

      {/* Steps Indicator */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between overflow-x-auto">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="flex items-center cursor-pointer"
              onClick={() => setCurrentStep(index)}
            >
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                index === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : index < currentStep
                  ? 'bg-success/10 text-success'
                  : 'text-muted-foreground'
              }`}>
                <step.icon size={18} />
                <span className="text-sm font-medium whitespace-nowrap hidden lg:inline">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight size={20} className="text-muted-foreground mx-1 hidden md:block" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-card rounded-xl border border-border p-6"
      >
        {renderStepContent()}
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="btn-outline flex items-center gap-2 disabled:opacity-50"
        >
          <ChevronLeft size={18} />
          Previous
        </button>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>

        {currentStep === steps.length - 1 ? (
          <button onClick={handleSubmit} className="btn-primary flex items-center gap-2">
            <Save size={18} />
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
  );
}
