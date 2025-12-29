import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Briefcase,
  Package,
  Gift,
  Camera,
  ChevronLeft,
  ChevronRight,
  Save,
  Plus,
  Trash2,
  Loader2,
  Check,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRetailer, useCreateRetailer, useUpdateRetailer, useDistributors } from '@/hooks/useOutletsData';
import { useSchemes } from '@/hooks/useSchemesData';
import { useProducts } from '@/hooks/useProductsData';
import { useAuth } from '@/contexts/AuthContext';
import {
  useRetailerSchemes,
  useRetailerImages,
  useRetailerPreorders,
  useSaveRetailerExtendedData,
} from '@/hooks/useRetailerExtendedData';

type Step = {
  id: string;
  title: string;
  icon: React.ElementType;
};

const steps: Step[] = [
  { id: 'info', title: 'Retailer Information', icon: User },
  { id: 'business', title: 'Business Details', icon: Briefcase },
  { id: 'preorder', title: 'Pre-Order', icon: Package },
  { id: 'schemes', title: 'Schemes & Commercials', icon: Gift },
  { id: 'images', title: 'Shop Images', icon: Camera },
];

const firmTypes = [
  { value: 'proprietorship', label: 'Proprietorship' },
  { value: 'pvt_ltd', label: 'Pvt Ltd' },
  { value: 'llp', label: 'LLP' },
  { value: 'partnership', label: 'Partnership' },
];

const shopTypes = [
  { value: 'general', label: 'General Store' },
  { value: 'hardware', label: 'Hardware' },
  { value: 'kirana', label: 'Kirana Store' },
  { value: 'supermarket', label: 'Supermarket' },
  { value: 'medical', label: 'Medical Store' },
  { value: 'others', label: 'Others' },
];

const weeklyOffOptions = [
  { value: 'sunday', label: 'Sunday' },
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'none', label: 'No Weekly Off' },
];

export default function RetailerFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { user, userRole } = useAuth();
  const isAdmin = userRole === 'admin';

  // Fetch data
  const { data: retailer, isLoading: retailerLoading } = useRetailer(id || '');
  const { data: distributors } = useDistributors();
  const { data: schemes, isLoading: schemesLoading } = useSchemes();
  const { data: products } = useProducts();
  const { data: existingSchemes } = useRetailerSchemes(id);
  const { data: existingImages } = useRetailerImages(id);
  const { data: existingPreorders } = useRetailerPreorders(id);

  // Mutations
  const createRetailer = useCreateRetailer();
  const updateRetailer = useUpdateRetailer();
  const saveExtendedData = useSaveRetailerExtendedData();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Step 1: Retailer Information
    code: '',
    shopName: '',
    ownerName: '',
    phone: '',
    altPhone: '',
    email: '',
    category: 'B',
    distributorId: '',
    country: 'India',
    state: '',
    city: '',
    zone: '',
    pincode: '',
    address: '',

    // Step 2: Business Details
    firmType: 'proprietorship',
    shopType: 'general',
    employeeCount: 1,
    yearsInBusiness: 1,
    weeklyOff: 'sunday',

    // Step 3: Pre-Orders
    preorders: [] as { productId: string; quantity: number; expectedDelivery: string; value: number }[],

    // Step 4: Schemes
    activeSchemes: [] as string[],

    // Step 5: Images
    images: [] as { type: string; url: string }[],
    gpsLocation: null as { lat: number; lng: number } | null,

    // Status
    status: 'pending',
    approvalStatus: 'pending',
  });

  // Load existing retailer data
  useEffect(() => {
    if (isEdit && retailer) {
      setFormData(prev => ({
        ...prev,
        code: retailer.code || '',
        shopName: retailer.shop_name || '',
        ownerName: retailer.owner_name || '',
        phone: retailer.phone || '',
        altPhone: (retailer as any).alt_phone || '',
        email: retailer.email || '',
        category: retailer.category || 'B',
        distributorId: retailer.distributor_id || '',
        country: (retailer as any).country || 'India',
        state: retailer.state || '',
        city: retailer.city || '',
        zone: (retailer as any).zone || '',
        pincode: (retailer as any).pincode || '',
        address: retailer.address || '',
        firmType: (retailer as any).firm_type || 'proprietorship',
        shopType: (retailer as any).shop_type || 'general',
        employeeCount: Number((retailer as any).employee_count) || 1,
        yearsInBusiness: Number((retailer as any).years_in_business) || 1,
        weeklyOff: (retailer as any).weekly_off || 'sunday',
        status: retailer.status || 'pending',
        approvalStatus: (retailer as any).approval_status || 'pending',
        gpsLocation: (retailer as any).gps_location || null,
      }));
    }
  }, [isEdit, retailer]);

  // Load existing schemes
  useEffect(() => {
    if (existingSchemes?.length) {
      setFormData(prev => ({
        ...prev,
        activeSchemes: existingSchemes.map(s => s.scheme_id),
      }));
    }
  }, [existingSchemes]);

  // Load existing images
  useEffect(() => {
    if (existingImages?.length) {
      setFormData(prev => ({
        ...prev,
        images: existingImages.map(i => ({
          type: i.image_type,
          url: i.image_url,
        })),
      }));
    }
  }, [existingImages]);

  // Load existing preorders
  useEffect(() => {
    if (existingPreorders?.length) {
      setFormData(prev => ({
        ...prev,
        preorders: existingPreorders.map(p => ({
          productId: p.product_id || '',
          quantity: p.quantity,
          expectedDelivery: p.expected_delivery || '',
          value: Number(p.preorder_value) || 0,
        })),
      }));
    }
  }, [existingPreorders]);

  const handleSchemeToggle = (schemeId: string) => {
    setFormData(prev => ({
      ...prev,
      activeSchemes: prev.activeSchemes.includes(schemeId)
        ? prev.activeSchemes.filter(id => id !== schemeId)
        : [...prev.activeSchemes, schemeId],
    }));
  };

  const addPreorder = () => {
    setFormData(prev => ({
      ...prev,
      preorders: [...prev.preorders, { productId: '', quantity: 1, expectedDelivery: '', value: 0 }],
    }));
  };

  const removePreorder = (index: number) => {
    setFormData(prev => ({
      ...prev,
      preorders: prev.preorders.filter((_, i) => i !== index),
    }));
  };

  const updatePreorder = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const preorders = [...prev.preorders];
      preorders[index] = { ...preorders[index], [field]: value };
      
      // Auto-calculate value if product and quantity are set
      if (field === 'productId' || field === 'quantity') {
        const product = products?.find(p => p.id === preorders[index].productId);
        if (product) {
          preorders[index].value = Number(product.ptr) * preorders[index].quantity;
        }
      }
      
      return { ...prev, preorders };
    });
  };

  const addImage = (type: string) => {
    // Simulate image upload - in real app, this would open file picker
    const url = `https://picsum.photos/seed/${Date.now()}/400/300`;
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { type, url }],
    }));
    toast.success('Image added successfully');
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const captureGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            gpsLocation: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          }));
          toast.success('GPS location captured');
        },
        (error) => {
          toast.error('Failed to capture GPS location');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser');
    }
  };

  const validateStep = (stepIndex: number): boolean => {
    switch (steps[stepIndex].id) {
      case 'info':
        if (!formData.shopName || !formData.ownerName || !formData.phone) {
          toast.error('Please fill in required fields: Firm Name, Contact Name, Phone Number');
          return false;
        }
        return true;
      case 'business':
        return true; // Optional step
      case 'preorder':
        return true; // Optional step
      case 'schemes':
        return true; // Optional step
      case 'images':
        const hasShopFront = formData.images.some(img => img.type === 'shop_front');
        if (!hasShopFront) {
          toast.error('Shop Front Image is mandatory');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      // Determine approval status based on who created it
      const approvalStatus = isAdmin ? 'approved' : 'pending';

      const retailerData = {
        code: formData.code || `RET-${Date.now()}`,
        shop_name: formData.shopName,
        owner_name: formData.ownerName,
        phone: formData.phone,
        alt_phone: formData.altPhone || undefined,
        email: formData.email || undefined,
        category: formData.category,
        distributor_id: formData.distributorId || undefined,
        country: formData.country,
        state: formData.state || undefined,
        city: formData.city || undefined,
        zone: formData.zone || undefined,
        pincode: formData.pincode || undefined,
        address: formData.address || undefined,
        firm_type: formData.firmType,
        shop_type: formData.shopType,
        employee_count: formData.employeeCount,
        years_in_business: formData.yearsInBusiness,
        weekly_off: formData.weeklyOff,
        status: approvalStatus === 'approved' ? 'active' : 'pending',
        approval_status: approvalStatus,
        created_by: user?.id,
        gps_location: formData.gpsLocation,
      };

      let retailerId = id;

      if (isEdit && id) {
        await updateRetailer.mutateAsync({ id, ...retailerData });
      } else {
        const result = await createRetailer.mutateAsync(retailerData as any);
        retailerId = result.id;
      }

      // Save extended data
      if (retailerId) {
        await saveExtendedData.mutateAsync({
          retailerId,
          schemes: formData.activeSchemes,
          images: formData.images
            .filter(i => i.type && i.url)
            .map(i => ({ image_type: i.type, image_url: i.url })),
          preorders: formData.preorders
            .filter(p => p.productId)
            .map(p => ({
              product_id: p.productId,
              quantity: p.quantity,
              expected_delivery: p.expectedDelivery || undefined,
              preorder_value: p.value,
            })),
        });
      }

      toast.success(isEdit ? 'Retailer updated successfully' : 'Retailer created successfully');
      navigate('/outlets/retailers');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save retailer');
    }
  };

  const isLoading = retailerLoading;
  const isSaving = createRetailer.isPending || updateRetailer.isPending || saveExtendedData.isPending;

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'info':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Retailer Information</h3>
              <p className="text-sm text-muted-foreground mb-4">Enter basic retailer details</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Firm Name *</label>
                <input
                  type="text"
                  value={formData.shopName}
                  onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                  placeholder="Enter firm/shop name"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Contact Name *</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="Enter contact/owner name"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Alternate Phone</label>
                <input
                  type="tel"
                  value={formData.altPhone}
                  onChange={e => setFormData({ ...formData, altPhone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email ID</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Retailer Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                >
                  <option value="A">Category A (Premium)</option>
                  <option value="B">Category B (Standard)</option>
                  <option value="C">Category C (Basic)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Distributor</label>
                <select
                  value={formData.distributorId}
                  onChange={e => setFormData({ ...formData, distributorId: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select Distributor</option>
                  {distributors?.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.firm_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={e => setFormData({ ...formData, country: e.target.value })}
                  placeholder="India"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Enter state"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Enter city"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Zone</label>
                <input
                  type="text"
                  value={formData.zone}
                  onChange={e => setFormData({ ...formData, zone: e.target.value })}
                  placeholder="Enter zone"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="110001"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Address</label>
              <textarea
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter complete address"
                className="input-field min-h-[80px]"
              />
            </div>
          </div>
        );

      case 'business':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Business Details</h3>
              <p className="text-sm text-muted-foreground mb-4">Enter business information</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Firm Type</label>
                <select
                  value={formData.firmType}
                  onChange={e => setFormData({ ...formData, firmType: e.target.value })}
                  className="input-field"
                >
                  {firmTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Shop Type</label>
                <select
                  value={formData.shopType}
                  onChange={e => setFormData({ ...formData, shopType: e.target.value })}
                  className="input-field"
                >
                  {shopTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Number of Employees</label>
                <input
                  type="number"
                  min="1"
                  value={formData.employeeCount}
                  onChange={e => setFormData({ ...formData, employeeCount: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Years in Business</label>
                <input
                  type="number"
                  min="0"
                  value={formData.yearsInBusiness}
                  onChange={e => setFormData({ ...formData, yearsInBusiness: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Weekly Off</label>
                <select
                  value={formData.weeklyOff}
                  onChange={e => setFormData({ ...formData, weeklyOff: e.target.value })}
                  className="input-field"
                >
                  {weeklyOffOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 'preorder':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Pre-Order Details</h3>
              <p className="text-sm text-muted-foreground mb-4">Add pre-order products (optional)</p>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-foreground">Pre-Order Products</h4>
              <button onClick={addPreorder} className="btn-outline text-sm flex items-center gap-1">
                <Plus size={14} /> Add Product
              </button>
            </div>

            {formData.preorders.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-border rounded-xl text-center">
                <Package size={40} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No pre-order products added</p>
                <button onClick={addPreorder} className="btn-primary text-sm mt-4">
                  Add Pre-Order Product
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.preorders.map((preorder, index) => (
                  <div key={index} className="p-4 bg-muted/30 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-foreground">Product {index + 1}</h5>
                      <button
                        onClick={() => removePreorder(index)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Product</label>
                        <select
                          value={preorder.productId}
                          onChange={e => updatePreorder(index, 'productId', e.target.value)}
                          className="input-field"
                        >
                          <option value="">Select Product</option>
                          {products?.map((p: any) => (
                            <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={preorder.quantity}
                          onChange={e => updatePreorder(index, 'quantity', Number(e.target.value))}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Expected Delivery</label>
                        <input
                          type="date"
                          value={preorder.expectedDelivery}
                          onChange={e => updatePreorder(index, 'expectedDelivery', e.target.value)}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Pre-Order Value (Auto)</label>
                        <input
                          type="text"
                          value={`₹${preorder.value.toLocaleString()}`}
                          readOnly
                          className="input-field bg-muted"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">Total Pre-Order Value</span>
                    <span className="text-xl font-bold text-primary">
                      ₹{formData.preorders.reduce((sum, p) => sum + p.value, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'schemes':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Schemes & Commercials</h3>
              <p className="text-sm text-muted-foreground mb-4">Select applicable schemes for this retailer</p>
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
                      formData.activeSchemes.includes(scheme.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          formData.activeSchemes.includes(scheme.id)
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        }`}>
                          {formData.activeSchemes.includes(scheme.id) && (
                            <Check size={12} className="text-primary-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{scheme.name}</p>
                          <p className="text-sm text-muted-foreground">{scheme.type || 'Scheme'}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        scheme.status === 'active' 
                          ? 'bg-success/10 text-success' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {scheme.status}
                      </span>
                    </div>
                    {scheme.description && (
                      <p className="text-sm text-muted-foreground mt-2 ml-8">{scheme.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'images':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Shop Images & Documents</h3>
              <p className="text-sm text-muted-foreground mb-4">Upload shop images for verification</p>
            </div>

            <div className="space-y-6">
              {/* Shop Front Image - Mandatory */}
              <div className="p-4 border-2 border-dashed border-border rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-foreground">Shop Front Image *</h4>
                    <p className="text-sm text-muted-foreground">Mandatory - Main shop facade</p>
                  </div>
                  {!formData.images.some(img => img.type === 'shop_front') && (
                    <button onClick={() => addImage('shop_front')} className="btn-outline text-sm">
                      <Camera size={14} className="mr-1" /> Upload
                    </button>
                  )}
                </div>
                {formData.images.filter(img => img.type === 'shop_front').map((img, idx) => (
                  <div key={idx} className="relative inline-block">
                    <img src={img.url} alt="Shop Front" className="w-40 h-32 object-cover rounded-lg" />
                    <button
                      onClick={() => removeImage(formData.images.indexOf(img))}
                      className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Shop Inside Image - Optional */}
              <div className="p-4 border-2 border-dashed border-border rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-foreground">Shop Inside Image</h4>
                    <p className="text-sm text-muted-foreground">Optional - Interior view</p>
                  </div>
                  <button onClick={() => addImage('shop_inside')} className="btn-outline text-sm">
                    <Camera size={14} className="mr-1" /> Upload
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {formData.images.filter(img => img.type === 'shop_inside').map((img, idx) => (
                    <div key={idx} className="relative">
                      <img src={img.url} alt="Shop Inside" className="w-32 h-24 object-cover rounded-lg" />
                      <button
                        onClick={() => removeImage(formData.images.indexOf(img))}
                        className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Images */}
              <div className="p-4 border-2 border-dashed border-border rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-foreground">Additional Shop Images</h4>
                    <p className="text-sm text-muted-foreground">Optional - Other relevant images</p>
                  </div>
                  <button onClick={() => addImage('additional')} className="btn-outline text-sm">
                    <Plus size={14} className="mr-1" /> Add Image
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {formData.images.filter(img => img.type === 'additional').map((img, idx) => (
                    <div key={idx} className="relative">
                      <img src={img.url} alt="Additional" className="w-32 h-24 object-cover rounded-lg" />
                      <button
                        onClick={() => removeImage(formData.images.indexOf(img))}
                        className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* GPS Location */}
              <div className="p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">GPS Location Tag</h4>
                    <p className="text-sm text-muted-foreground">
                      {formData.gpsLocation 
                        ? `Lat: ${formData.gpsLocation.lat.toFixed(6)}, Lng: ${formData.gpsLocation.lng.toFixed(6)}`
                        : 'Auto-captured on image upload'}
                    </p>
                  </div>
                  <button onClick={captureGPS} className="btn-outline text-sm">
                    <MapPin size={14} className="mr-1" /> Capture GPS
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="module-header">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/outlets/retailers')} className="p-2 hover:bg-muted rounded-lg">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="module-title">{isEdit ? 'Edit Retailer' : 'Add New Retailer'}</h1>
            <p className="text-muted-foreground">
              {isEdit ? 'Update retailer information' : 'Complete the onboarding form'}
            </p>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div key={step.id} className="flex items-center">
                <div
                  onClick={() => index <= currentStep && setCurrentStep(index)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : isCompleted
                      ? 'bg-success/10 text-success'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon size={18} />
                  <span className="hidden md:inline text-sm font-medium">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${isCompleted ? 'bg-success' : 'bg-border'}`} />
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

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="btn-outline flex items-center gap-2 disabled:opacity-50"
        >
          <ChevronLeft size={18} />
          Previous
        </button>

        {currentStep === steps.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="btn-primary flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                {isEdit ? 'Update Retailer' : 'Save Retailer'}
              </>
            )}
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