import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  MapPin,
  Camera,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

const steps = [
  { id: 1, title: 'Shop Details', description: 'Basic information' },
  { id: 2, title: 'Photos', description: 'Capture shop images' },
  { id: 3, title: 'First Order', description: 'Opening order' },
  { id: 4, title: 'Review', description: 'Confirm & submit' },
];

const mockProducts = [
  { id: 'p-001', name: 'Product Alpha 500ml', sku: 'PA-500', ptr: 120, mrp: 150 },
  { id: 'p-002', name: 'Product Beta 1L', sku: 'PB-1L', ptr: 220, mrp: 275 },
  { id: 'p-003', name: 'Product Gamma 250g', sku: 'PG-250', ptr: 85, mrp: 110 },
  { id: 'p-004', name: 'Product Delta Pack', sku: 'PD-PK', ptr: 350, mrp: 450 },
];

export default function NewRetailerPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    distributorId: '',
    competitorBrands: [] as string[],
    geoLocation: { lat: 0, lng: 0 },
    photos: {
      shopFront: null as File | null,
      ownerWithExec: null as File | null,
      shelf: null as File | null,
      competitor: null as File | null,
    },
  });
  const [orderItems, setOrderItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [newCompetitor, setNewCompetitor] = useState('');

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addCompetitor = () => {
    if (newCompetitor.trim()) {
      updateFormData('competitorBrands', [...formData.competitorBrands, newCompetitor.trim()]);
      setNewCompetitor('');
    }
  };

  const removeCompetitor = (index: number) => {
    updateFormData('competitorBrands', formData.competitorBrands.filter((_, i) => i !== index));
  };

  const updateOrderQuantity = (productId: string, delta: number) => {
    setOrderItems(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) {
          return prev.filter(item => item.productId !== productId);
        }
        return prev.map(item =>
          item.productId === productId ? { ...item, quantity: newQty } : item
        );
      }
      if (delta > 0) {
        return [...prev, { productId, quantity: delta }];
      }
      return prev;
    });
  };

  const getOrderTotal = () => {
    return orderItems.reduce((total, item) => {
      const product = mockProducts.find(p => p.id === item.productId);
      return total + (product?.ptr || 0) * item.quantity;
    }, 0);
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    if (orderItems.length === 0) {
      toast.error('First order is mandatory for new retailer');
      return;
    }
    toast.success('New retailer added successfully!');
    navigate('/outlets/retailers');
  };

  const captureLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          updateFormData('geoLocation', {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          toast.success('Location captured!');
        },
        () => toast.error('Failed to capture location')
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">New Retailer / Counter Opening</h1>
        <p className="text-muted-foreground">Add new retail outlet with mandatory photos and first order</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  currentStep > step.id
                    ? 'bg-success text-success-foreground'
                    : currentStep === step.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {currentStep > step.id ? <Check size={20} /> : step.id}
              </div>
              <div className="mt-2 text-center hidden md:block">
                <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.title}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 md:w-32 h-0.5 mx-2 ${currentStep > step.id ? 'bg-success' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-card rounded-xl border border-border p-6 shadow-sm"
      >
        {/* Step 1: Shop Details */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Store size={20} className="text-primary" />
              Shop Details
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Shop Name *</label>
                <input
                  type="text"
                  value={formData.shopName}
                  onChange={e => updateFormData('shopName', e.target.value)}
                  placeholder="Enter shop name"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Owner Name *</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={e => updateFormData('ownerName', e.target.value)}
                  placeholder="Enter owner name"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => updateFormData('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Distributor *</label>
                <select
                  value={formData.distributorId}
                  onChange={e => updateFormData('distributorId', e.target.value)}
                  className="input-field"
                >
                  <option value="">Select Distributor</option>
                  <option value="d-001">Krishna Traders</option>
                  <option value="d-002">Sharma Distributors</option>
                  <option value="d-003">Patel Trading Co</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Address *</label>
                <textarea
                  value={formData.address}
                  onChange={e => updateFormData('address', e.target.value)}
                  placeholder="Enter complete address"
                  rows={2}
                  className="input-field resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => updateFormData('city', e.target.value)}
                  placeholder="Enter city"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Pincode *</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={e => updateFormData('pincode', e.target.value)}
                  placeholder="110001"
                  className="input-field"
                  maxLength={6}
                />
              </div>
            </div>
            
            {/* Location & Competitors */}
            <div className="pt-4 border-t border-border space-y-4">
              <div className="flex items-center gap-4">
                <button onClick={captureLocation} className="btn-secondary flex items-center gap-2">
                  <MapPin size={18} />
                  Capture Location
                </button>
                {formData.geoLocation.lat !== 0 && (
                  <p className="text-sm text-success flex items-center gap-1">
                    <Check size={16} />
                    Location captured
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Competitor Brands</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newCompetitor}
                    onChange={e => setNewCompetitor(e.target.value)}
                    placeholder="Enter brand name"
                    className="input-field flex-1"
                    onKeyPress={e => e.key === 'Enter' && addCompetitor()}
                  />
                  <button onClick={addCompetitor} className="btn-outline">
                    <Plus size={18} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.competitorBrands.map((brand, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-muted rounded-full text-sm flex items-center gap-2"
                    >
                      {brand}
                      <button onClick={() => removeCompetitor(index)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Photos */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Camera size={20} className="text-primary" />
              Mandatory Photos (Minimum 4)
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { key: 'shopFront', label: 'Shop Front', description: 'Clear view of shop signage' },
                { key: 'ownerWithExec', label: 'Owner with Executive', description: 'Both visible in frame' },
                { key: 'shelf', label: 'Product Shelf', description: 'Display area for products' },
                { key: 'competitor', label: 'Competitor Products', description: 'Competitor brands on shelf' },
              ].map(photo => (
                <motion.div
                  key={photo.key}
                  whileHover={{ scale: 1.02 }}
                  className="p-6 border-2 border-dashed border-border rounded-xl hover:border-primary transition-colors cursor-pointer"
                >
                  <label className="cursor-pointer flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Camera size={28} className="text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-foreground">{photo.label} *</p>
                      <p className="text-xs text-muted-foreground">{photo.description}</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" capture="environment" />
                  </label>
                </motion.div>
              ))}
            </div>
            <div className="p-4 bg-info/10 rounded-lg border border-info/20">
              <p className="text-sm text-info flex items-center gap-2">
                <AlertCircle size={16} />
                All photos must be geo-tagged. Ensure location is enabled.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: First Order */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ShoppingCart size={20} className="text-primary" />
              First Order (Mandatory)
            </h2>
            <div className="p-4 bg-warning/10 rounded-lg border border-warning/20 mb-4">
              <p className="text-sm text-warning flex items-center gap-2">
                <AlertCircle size={16} />
                First order is mandatory for new retailer opening. Opening scheme will be auto-applied.
              </p>
            </div>

            <div className="space-y-3">
              {mockProducts.map(product => {
                const item = orderItems.find(i => i.productId === product.id);
                const quantity = item?.quantity || 0;

                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        SKU: {product.sku} • PTR: ₹{product.ptr} • MRP: ₹{product.mrp}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateOrderQuantity(product.id, -1)}
                        disabled={quantity === 0}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-50"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center font-semibold">{quantity}</span>
                      <button
                        onClick={() => updateOrderQuantity(product.id, 1)}
                        className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-card rounded-lg border border-border">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Order Total</span>
                <span className="text-primary">₹{getOrderTotal().toLocaleString()}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {orderItems.reduce((sum, i) => sum + i.quantity, 0)} items selected
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Check size={20} className="text-primary" />
              Review & Submit
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Shop Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Shop Name:</span> {formData.shopName || '-'}</p>
                  <p><span className="text-muted-foreground">Owner:</span> {formData.ownerName || '-'}</p>
                  <p><span className="text-muted-foreground">Phone:</span> {formData.phone || '-'}</p>
                  <p><span className="text-muted-foreground">Address:</span> {formData.address || '-'}</p>
                  <p><span className="text-muted-foreground">City:</span> {formData.city || '-'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">First Order Summary</h3>
                <div className="space-y-2">
                  {orderItems.map(item => {
                    const product = mockProducts.find(p => p.id === item.productId);
                    return (
                      <div key={item.productId} className="flex justify-between text-sm">
                        <span>{product?.name} x {item.quantity}</span>
                        <span className="font-medium">₹{((product?.ptr || 0) * item.quantity).toLocaleString()}</span>
                      </div>
                    );
                  })}
                  <div className="pt-2 border-t border-border flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-primary">₹{getOrderTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            {orderItems.length === 0 && (
              <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-sm text-destructive flex items-center gap-2">
                  <AlertCircle size={16} />
                  First order is mandatory. Please go back and add products.
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className="btn-outline flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={18} />
          Back
        </button>
        {currentStep < 4 ? (
          <button onClick={handleNext} className="btn-primary flex items-center gap-2">
            Next
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={orderItems.length === 0}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check size={18} />
            Add Retailer
          </button>
        )}
      </div>
    </div>
  );
}
