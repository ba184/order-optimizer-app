import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  User,
  ShoppingCart,
  Target,
  Gift,
  Camera,
  ChevronLeft,
  ChevronRight,
  Save,
  Plus,
  Trash2,
  Upload,
  Check,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRetailer, useCreateRetailer, useUpdateRetailer, useDistributors } from '@/hooks/useOutletsData';
import { useSchemes } from '@/hooks/useSchemesData';
import {
  useRetailerCompetitorAnalysis,
  useRetailerSchemes,
  useRetailerImages,
  useSaveRetailerExtendedData,
} from '@/hooks/useRetailerExtendedData';

type Step = {
  id: string;
  title: string;
  icon: React.ElementType;
};

const steps: Step[] = [
  { id: 'visit', title: 'Visit Information', icon: MapPin },
  { id: 'info', title: 'Retailer Information', icon: User },
  { id: 'orders', title: 'Orders', icon: ShoppingCart },
  { id: 'competitor', title: 'Competitor Analysis', icon: Target },
  { id: 'schemes', title: 'Schemes & Offers', icon: Gift },
  { id: 'images', title: 'Images', icon: Camera },
];

const competitors = [
  { id: '1', name: 'Competitor A' },
  { id: '2', name: 'Competitor B' },
  { id: '3', name: 'Competitor C' },
  { id: '4', name: 'Other' },
];

export default function RetailerFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  // Fetch data
  const { data: retailer, isLoading: retailerLoading } = useRetailer(id || '');
  const { data: distributors } = useDistributors();
  const { data: schemes, isLoading: schemesLoading } = useSchemes();
  const { data: existingCompetitors } = useRetailerCompetitorAnalysis(id);
  const { data: existingSchemes } = useRetailerSchemes(id);
  const { data: existingImages } = useRetailerImages(id);

  // Mutations
  const createRetailer = useCreateRetailer();
  const updateRetailer = useUpdateRetailer();
  const saveExtendedData = useSaveRetailerExtendedData();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Visit Info
    visitDate: new Date().toISOString().split('T')[0],
    visitTime: '',
    visitPurpose: 'regular',
    visitNotes: '',
    geoLocation: { lat: 28.6139, lng: 77.209 },

    // Retailer Info
    code: '',
    shopName: '',
    ownerName: '',
    phone: '',
    altPhone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    category: 'B',
    distributorId: '',
    gstNumber: '',
    panNumber: '',
    shopArea: '',
    employeeCount: 1,
    yearsInBusiness: 1,
    shopType: 'kirana',
    weeklyOff: 'sunday',
    status: 'pending',

    // Competitor Analysis
    competitorProducts: [] as { competitorName: string; products: string; pricing: string; display: string; remarks: string }[],
    marketShare: '',
    competitorStrength: '',
    opportunities: '',

    // Schemes
    activeSchemes: [] as string[],

    // Images
    images: [] as { type: string; url: string }[],
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
        address: retailer.address || '',
        city: retailer.city || '',
        state: retailer.state || '',
        pincode: (retailer as any).pincode || '',
        landmark: (retailer as any).landmark || '',
        category: retailer.category || 'B',
        distributorId: retailer.distributor_id || '',
        gstNumber: (retailer as any).gst_number || '',
        panNumber: (retailer as any).pan_number || '',
        shopArea: (retailer as any).shop_area || '',
        employeeCount: Number((retailer as any).employee_count) || 1,
        yearsInBusiness: Number((retailer as any).years_in_business) || 1,
        shopType: (retailer as any).shop_type || 'kirana',
        weeklyOff: (retailer as any).weekly_off || 'sunday',
        status: retailer.status || 'pending',
        marketShare: (retailer as any).market_share || '',
        competitorStrength: (retailer as any).competitor_strength || '',
        opportunities: (retailer as any).opportunities || '',
      }));
    }
  }, [isEdit, retailer]);

  // Load extended data
  useEffect(() => {
    if (existingCompetitors?.length) {
      setFormData(prev => ({
        ...prev,
        competitorProducts: existingCompetitors.map(c => ({
          competitorName: c.competitor_name,
          products: c.products || '',
          pricing: c.pricing || '',
          display: c.display_quality || '',
          remarks: c.remarks || '',
        })),
      }));
    }
  }, [existingCompetitors]);

  useEffect(() => {
    if (existingSchemes?.length) {
      setFormData(prev => ({
        ...prev,
        activeSchemes: existingSchemes.map(s => s.scheme_id),
      }));
    }
  }, [existingSchemes]);

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

  const handleSchemeToggle = (schemeId: string) => {
    setFormData(prev => ({
      ...prev,
      activeSchemes: prev.activeSchemes.includes(schemeId)
        ? prev.activeSchemes.filter(id => id !== schemeId)
        : [...prev.activeSchemes, schemeId],
    }));
  };

  const addCompetitorEntry = () => {
    setFormData(prev => ({
      ...prev,
      competitorProducts: [...prev.competitorProducts, { competitorName: '', products: '', pricing: '', display: '', remarks: '' }],
    }));
  };

  const removeCompetitorEntry = (index: number) => {
    setFormData(prev => ({
      ...prev,
      competitorProducts: prev.competitorProducts.filter((_, i) => i !== index),
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
    if (!formData.code || !formData.shopName || !formData.ownerName) {
      toast.error('Please fill in required fields: Code, Shop Name, Owner Name');
      return;
    }

    try {
      const retailerData = {
        code: formData.code,
        shop_name: formData.shopName,
        owner_name: formData.ownerName,
        phone: formData.phone || undefined,
        alt_phone: formData.altPhone || undefined,
        email: formData.email || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        pincode: formData.pincode || undefined,
        landmark: formData.landmark || undefined,
        category: formData.category,
        distributor_id: formData.distributorId || undefined,
        gst_number: formData.gstNumber || undefined,
        pan_number: formData.panNumber || undefined,
        shop_area: formData.shopArea || undefined,
        employee_count: formData.employeeCount,
        years_in_business: formData.yearsInBusiness,
        shop_type: formData.shopType,
        weekly_off: formData.weeklyOff,
        status: formData.status,
        market_share: formData.marketShare || undefined,
        competitor_strength: formData.competitorStrength || undefined,
        opportunities: formData.opportunities || undefined,
      };

      let retailerId = id;

      if (isEdit && id) {
        await updateRetailer.mutateAsync({ id, ...retailerData });
      } else {
        const result = await createRetailer.mutateAsync(retailerData);
        retailerId = result.id;
      }

      // Save extended data
      if (retailerId) {
        await saveExtendedData.mutateAsync({
          retailerId,
          competitorAnalysis: formData.competitorProducts
            .filter(c => c.competitorName)
            .map(c => ({
              competitor_name: c.competitorName,
              products: c.products || undefined,
              pricing: c.pricing || undefined,
              display_quality: c.display || undefined,
              remarks: c.remarks || undefined,
            })),
          schemes: formData.activeSchemes,
          images: formData.images
            .filter(i => i.type && i.url)
            .map(i => ({ image_type: i.type, image_url: i.url })),
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
      case 'visit':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Visit Information</h3>
              <p className="text-sm text-muted-foreground mb-4">Record visit details and location</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Visit Date</label>
                <input
                  type="date"
                  value={formData.visitDate}
                  onChange={e => setFormData({ ...formData, visitDate: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Visit Time</label>
                <input
                  type="time"
                  value={formData.visitTime}
                  onChange={e => setFormData({ ...formData, visitTime: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Visit Purpose</label>
                <select
                  value={formData.visitPurpose}
                  onChange={e => setFormData({ ...formData, visitPurpose: e.target.value })}
                  className="input-field"
                >
                  <option value="regular">Regular Visit</option>
                  <option value="order">Order Collection</option>
                  <option value="complaint">Complaint Resolution</option>
                  <option value="new">New Retailer Onboarding</option>
                  <option value="scheme">Scheme Promotion</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">GPS Location</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={`${formData.geoLocation.lat}, ${formData.geoLocation.lng}`}
                    readOnly
                    className="input-field flex-1"
                  />
                  <button className="btn-outline">
                    <MapPin size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Visit Notes</label>
              <textarea
                value={formData.visitNotes}
                onChange={e => setFormData({ ...formData, visitNotes: e.target.value })}
                placeholder="Enter any observations or notes from the visit..."
                className="input-field min-h-[100px]"
              />
            </div>

            <div className="h-48 bg-muted rounded-xl flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MapPin size={40} className="mx-auto mb-2" />
                <p>Location: {formData.geoLocation.lat}, {formData.geoLocation.lng}</p>
              </div>
            </div>
          </div>
        );

      case 'info':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Complete Retailer Information</h3>
              <p className="text-sm text-muted-foreground mb-4">Enter all retailer details including business information</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Retailer Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  placeholder="RET-001"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Shop Name *</label>
                <input
                  type="text"
                  value={formData.shopName}
                  onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                  placeholder="Enter shop name"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Owner Name *</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="Enter owner name"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone *</label>
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
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Category *</label>
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
            </div>

            <div className="border-t border-border pt-6">
              <h4 className="font-medium text-foreground mb-4">Address Details</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Address *</label>
                  <textarea
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter complete address"
                    className="input-field min-h-[80px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Enter city"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">State *</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Enter state"
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
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Landmark</label>
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={e => setFormData({ ...formData, landmark: e.target.value })}
                    placeholder="Near metro station"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h4 className="font-medium text-foreground mb-4">Business Details</h4>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Shop Type</label>
                  <select
                    value={formData.shopType}
                    onChange={e => setFormData({ ...formData, shopType: e.target.value })}
                    className="input-field"
                  >
                    <option value="kirana">Kirana Store</option>
                    <option value="supermarket">Supermarket</option>
                    <option value="departmental">Departmental Store</option>
                    <option value="medical">Medical Store</option>
                    <option value="general">General Store</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Shop Area (sq ft)</label>
                  <input
                    type="text"
                    value={formData.shopArea}
                    onChange={e => setFormData({ ...formData, shopArea: e.target.value })}
                    placeholder="500"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Employees</label>
                  <input
                    type="number"
                    value={formData.employeeCount}
                    onChange={e => setFormData({ ...formData, employeeCount: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Years in Business</label>
                  <input
                    type="number"
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
                    <option value="sunday">Sunday</option>
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="none">No Weekly Off</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">GST Number</label>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
                    placeholder="07AABCT1234K1ZK"
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Order Information</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isEdit ? 'View order history for this retailer' : 'Order history will be available after creation'}
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
                <p>Save the retailer first to create orders</p>
              </div>
            )}
          </div>
        );

      case 'competitor':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Competitor Analysis</h3>
              <p className="text-sm text-muted-foreground mb-4">Record competitor presence and market intelligence</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Competitor Products</h4>
                <button onClick={addCompetitorEntry} className="btn-outline text-sm flex items-center gap-1">
                  <Plus size={14} /> Add Entry
                </button>
              </div>

              {formData.competitorProducts.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-border rounded-xl text-center">
                  <Target size={40} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No competitor data added</p>
                  <button onClick={addCompetitorEntry} className="btn-primary text-sm mt-4">
                    Add Competitor
                  </button>
                </div>
              ) : (
                formData.competitorProducts.map((entry, index) => (
                  <div key={index} className="p-4 bg-muted/30 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-foreground">Competitor {index + 1}</h5>
                      <button
                        onClick={() => removeCompetitorEntry(index)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Competitor Name</label>
                        <select
                          value={entry.competitorName}
                          onChange={e => {
                            const entries = [...formData.competitorProducts];
                            entries[index].competitorName = e.target.value;
                            setFormData({ ...formData, competitorProducts: entries });
                          }}
                          className="input-field"
                        >
                          <option value="">Select Competitor</option>
                          {competitors.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Products</label>
                        <input
                          type="text"
                          value={entry.products}
                          onChange={e => {
                            const entries = [...formData.competitorProducts];
                            entries[index].products = e.target.value;
                            setFormData({ ...formData, competitorProducts: entries });
                          }}
                          placeholder="Product names"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Pricing</label>
                        <input
                          type="text"
                          value={entry.pricing}
                          onChange={e => {
                            const entries = [...formData.competitorProducts];
                            entries[index].pricing = e.target.value;
                            setFormData({ ...formData, competitorProducts: entries });
                          }}
                          placeholder="Price range"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Display Quality</label>
                        <select
                          value={entry.display}
                          onChange={e => {
                            const entries = [...formData.competitorProducts];
                            entries[index].display = e.target.value;
                            setFormData({ ...formData, competitorProducts: entries });
                          }}
                          className="input-field"
                        >
                          <option value="">Select</option>
                          <option value="excellent">Excellent</option>
                          <option value="good">Good</option>
                          <option value="average">Average</option>
                          <option value="poor">Poor</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Remarks</label>
                      <input
                        type="text"
                        value={entry.remarks}
                        onChange={e => {
                          const entries = [...formData.competitorProducts];
                          entries[index].remarks = e.target.value;
                          setFormData({ ...formData, competitorProducts: entries });
                        }}
                        placeholder="Additional notes"
                        className="input-field"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-border pt-6">
              <h4 className="font-medium text-foreground mb-4">Market Intelligence</h4>
              <div className="grid md:grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Market Share Assessment</label>
                  <textarea
                    value={formData.marketShare}
                    onChange={e => setFormData({ ...formData, marketShare: e.target.value })}
                    placeholder="Describe estimated market share..."
                    className="input-field min-h-[80px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Competitor Strengths</label>
                  <textarea
                    value={formData.competitorStrength}
                    onChange={e => setFormData({ ...formData, competitorStrength: e.target.value })}
                    placeholder="What are competitors doing well?"
                    className="input-field min-h-[80px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Opportunities</label>
                  <textarea
                    value={formData.opportunities}
                    onChange={e => setFormData({ ...formData, opportunities: e.target.value })}
                    placeholder="What opportunities exist?"
                    className="input-field min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'schemes':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Schemes & Offers</h3>
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
              {formData.activeSchemes.length} schemes applied
            </p>
          </div>
        );

      case 'images':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Images</h3>
              <p className="text-sm text-muted-foreground mb-4">Upload shop photos and images</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 border-2 border-dashed border-border rounded-xl">
                <div className="text-center">
                  <Camera size={40} className="mx-auto text-muted-foreground mb-2" />
                  <p className="font-medium text-foreground">Shop Front</p>
                  <p className="text-sm text-muted-foreground mb-4">Upload main shop photo</p>
                  <button className="btn-outline text-sm">
                    <Upload size={14} className="mr-1" /> Upload
                  </button>
                </div>
              </div>
              <div className="p-6 border-2 border-dashed border-border rounded-xl">
                <div className="text-center">
                  <Camera size={40} className="mx-auto text-muted-foreground mb-2" />
                  <p className="font-medium text-foreground">Interior</p>
                  <p className="text-sm text-muted-foreground mb-4">Upload shop interior</p>
                  <button className="btn-outline text-sm">
                    <Upload size={14} className="mr-1" /> Upload
                  </button>
                </div>
              </div>
              <div className="p-6 border-2 border-dashed border-border rounded-xl">
                <div className="text-center">
                  <Camera size={40} className="mx-auto text-muted-foreground mb-2" />
                  <p className="font-medium text-foreground">Product Display</p>
                  <p className="text-sm text-muted-foreground mb-4">Upload display area</p>
                  <button className="btn-outline text-sm">
                    <Upload size={14} className="mr-1" /> Upload
                  </button>
                </div>
              </div>
              <div className="p-6 border-2 border-dashed border-border rounded-xl">
                <div className="text-center">
                  <Camera size={40} className="mx-auto text-muted-foreground mb-2" />
                  <p className="font-medium text-foreground">Owner Photo</p>
                  <p className="text-sm text-muted-foreground mb-4">Upload owner photo</p>
                  <button className="btn-outline text-sm">
                    <Upload size={14} className="mr-1" /> Upload
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
          <button onClick={() => navigate('/outlets/retailers')} className="p-2 hover:bg-muted rounded-lg">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEdit ? 'Edit Retailer' : 'Add New Retailer'}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? 'Update retailer information' : 'Complete all steps to create a retailer'}
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
              {isEdit ? 'Update Retailer' : 'Create Retailer'}
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
