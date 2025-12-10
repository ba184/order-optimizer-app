import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  X,
  Plus,
  Trash2,
  Upload,
  Eye,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

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

const mockSchemes = [
  { id: '1', name: 'Summer Sale 2024', type: 'Discount', value: '10%', active: true },
  { id: '2', name: 'Buy 10 Get 1 Free', type: 'Free Product', value: '1 Free', active: true },
  { id: '3', name: 'Festive Offer', type: 'Cashback', value: '₹500', active: false },
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

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Visit Info
    visitDate: new Date().toISOString().split('T')[0],
    visitTime: '',
    visitPurpose: 'regular',
    visitNotes: '',
    geoLocation: { lat: 28.6139, lng: 77.209 },

    // Retailer Info
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

    // Competitor Analysis
    competitorProducts: [] as { competitorId: string; products: string; pricing: string; display: string; remarks: string }[],
    marketShare: '',
    competitorStrength: '',
    opportunities: '',

    // Schemes
    activeSchemes: [] as string[],
    schemeUtilization: '',

    // Images
    shopFrontImage: '',
    interiorImages: [] as string[],
    displayImages: [] as string[],
    ownerImage: '',
  });

  const handleSchemeToggle = (schemeId: string) => {
    setFormData(prev => ({
      ...prev,
      activeSchemes: prev.activeSchemes.includes(schemeId)
        ? prev.activeSchemes.filter(id => id !== schemeId)
        : [...prev.activeSchemes, schemeId]
    }));
  };

  const addCompetitorEntry = () => {
    setFormData(prev => ({
      ...prev,
      competitorProducts: [...prev.competitorProducts, { competitorId: '', products: '', pricing: '', display: '', remarks: '' }]
    }));
  };

  const removeCompetitorEntry = (index: number) => {
    setFormData(prev => ({
      ...prev,
      competitorProducts: prev.competitorProducts.filter((_, i) => i !== index)
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
    toast.success(isEdit ? 'Retailer updated successfully' : 'Retailer created successfully');
    navigate('/outlets/retailers');
  };

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

            {/* Mini Map Placeholder */}
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
              <p className="text-sm text-muted-foreground mb-4">View order history and place new orders</p>
            </div>

            {isEdit ? (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="stat-card">
                    <p className="text-2xl font-bold text-foreground">₹1.5L</p>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                  </div>
                  <div className="stat-card">
                    <p className="text-2xl font-bold text-foreground">28</p>
                    <p className="text-sm text-muted-foreground">Order Count</p>
                  </div>
                  <div className="stat-card">
                    <p className="text-2xl font-bold text-foreground">₹5.4K</p>
                    <p className="text-sm text-muted-foreground">Avg Order Value</p>
                  </div>
                  <div className="stat-card">
                    <p className="text-2xl font-bold text-foreground">Dec 8</p>
                    <p className="text-sm text-muted-foreground">Last Order</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">Recent Orders</h4>
                  <button className="btn-primary flex items-center gap-2">
                    <Plus size={16} /> New Order
                  </button>
                </div>

                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Order ID</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Items</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium">ORD-R-001</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">Dec 8, 2024</td>
                        <td className="px-4 py-3 text-sm">5 items</td>
                        <td className="px-4 py-3 text-sm font-medium">₹8,500</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 bg-success/10 text-success rounded text-xs">Delivered</span></td>
                        <td className="px-4 py-3"><button className="p-1 hover:bg-muted rounded"><Eye size={16} /></button></td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium">ORD-R-002</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">Dec 1, 2024</td>
                        <td className="px-4 py-3 text-sm">3 items</td>
                        <td className="px-4 py-3 text-sm font-medium">₹4,200</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 bg-success/10 text-success rounded text-xs">Delivered</span></td>
                        <td className="px-4 py-3"><button className="p-1 hover:bg-muted rounded"><Eye size={16} /></button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-12 border-2 border-dashed border-border rounded-xl text-center">
                <ShoppingCart size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Order history will be available after creating the retailer</p>
              </div>
            )}
          </div>
        );

      case 'competitor':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Competitor Analysis</h3>
              <p className="text-sm text-muted-foreground mb-4">Record competitor presence and market insights</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Competitor Products at this Store</h4>
                <button onClick={addCompetitorEntry} className="btn-outline text-sm flex items-center gap-1">
                  <Plus size={14} /> Add Entry
                </button>
              </div>

              {formData.competitorProducts.length === 0 && (
                <div className="p-8 border-2 border-dashed border-border rounded-xl text-center">
                  <Target size={40} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No competitor data recorded</p>
                  <button onClick={addCompetitorEntry} className="btn-primary mt-4">
                    Add Competitor Entry
                  </button>
                </div>
              )}

              {formData.competitorProducts.map((entry, index) => (
                <div key={index} className="p-4 bg-muted/30 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">Entry #{index + 1}</span>
                    <button
                      onClick={() => removeCompetitorEntry(index)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Competitor</label>
                      <select
                        value={entry.competitorId}
                        onChange={e => {
                          const entries = [...formData.competitorProducts];
                          entries[index].competitorId = e.target.value;
                          setFormData({ ...formData, competitorProducts: entries });
                        }}
                        className="input-field"
                      >
                        <option value="">Select Competitor</option>
                        {competitors.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Products Stocked</label>
                      <input
                        type="text"
                        value={entry.products}
                        onChange={e => {
                          const entries = [...formData.competitorProducts];
                          entries[index].products = e.target.value;
                          setFormData({ ...formData, competitorProducts: entries });
                        }}
                        placeholder="List products"
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
                        <option value="">Rate Display</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="average">Average</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Remarks</label>
                    <textarea
                      value={entry.remarks}
                      onChange={e => {
                        const entries = [...formData.competitorProducts];
                        entries[index].remarks = e.target.value;
                        setFormData({ ...formData, competitorProducts: entries });
                      }}
                      placeholder="Any observations..."
                      className="input-field min-h-[60px]"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-6 space-y-4">
              <h4 className="font-medium text-foreground">Market Insights</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Estimated Market Share (%)</label>
                  <input
                    type="text"
                    value={formData.marketShare}
                    onChange={e => setFormData({ ...formData, marketShare: e.target.value })}
                    placeholder="e.g., 30%"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Competitor Strengths</label>
                  <input
                    type="text"
                    value={formData.competitorStrength}
                    onChange={e => setFormData({ ...formData, competitorStrength: e.target.value })}
                    placeholder="Price, schemes, etc."
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Growth Opportunities</label>
                <textarea
                  value={formData.opportunities}
                  onChange={e => setFormData({ ...formData, opportunities: e.target.value })}
                  placeholder="Identify opportunities to increase sales..."
                  className="input-field min-h-[80px]"
                />
              </div>
            </div>
          </div>
        );

      case 'schemes':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Schemes & Offers</h3>
              <p className="text-sm text-muted-foreground mb-4">View and apply available schemes</p>
            </div>

            <div className="space-y-3">
              {mockSchemes.map(scheme => (
                <div
                  key={scheme.id}
                  onClick={() => scheme.active && handleSchemeToggle(scheme.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    !scheme.active
                      ? 'border-border opacity-50 cursor-not-allowed'
                      : formData.activeSchemes.includes(scheme.id)
                      ? 'border-primary bg-primary/5 cursor-pointer'
                      : 'border-border hover:border-primary/50 cursor-pointer'
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
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">{scheme.type}</p>
                          {!scheme.active && (
                            <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">Expired</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      scheme.active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                    }`}>
                      {scheme.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-6">
              <label className="block text-sm font-medium text-foreground mb-2">Scheme Utilization Notes</label>
              <textarea
                value={formData.schemeUtilization}
                onChange={e => setFormData({ ...formData, schemeUtilization: e.target.value })}
                placeholder="How are schemes being utilized by this retailer?"
                className="input-field min-h-[80px]"
              />
            </div>

            <p className="text-sm text-muted-foreground">
              {formData.activeSchemes.length} schemes applied
            </p>
          </div>
        );

      case 'images':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Store Images</h3>
              <p className="text-sm text-muted-foreground mb-4">Upload images of the retail outlet</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Shop Front */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground">Shop Front Image *</label>
                <div className="aspect-video bg-muted rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                  <Camera size={40} className="text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload or take photo</p>
                  <button className="btn-outline text-sm mt-2">
                    <Upload size={14} className="mr-1" /> Choose File
                  </button>
                </div>
              </div>

              {/* Owner Image */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground">Owner Photo</label>
                <div className="aspect-video bg-muted rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                  <User size={40} className="text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Upload owner photo</p>
                  <button className="btn-outline text-sm mt-2">
                    <Upload size={14} className="mr-1" /> Choose File
                  </button>
                </div>
              </div>
            </div>

            {/* Interior Images */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-foreground">Interior Images</label>
                <button className="btn-outline text-sm flex items-center gap-1">
                  <Plus size={14} /> Add Image
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="aspect-square bg-muted rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center">
                    <Camera size={24} className="text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">Interior {i}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Display Images */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-foreground">Product Display Images</label>
                <button className="btn-outline text-sm flex items-center gap-1">
                  <Plus size={14} /> Add Image
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="aspect-square bg-muted rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center">
                    <Camera size={24} className="text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">Display {i}</p>
                  </div>
                ))}
              </div>
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
          <h1 className="module-title">{isEdit ? 'Edit Retailer' : 'Add Retailer'}</h1>
          <p className="text-muted-foreground">Complete all steps to {isEdit ? 'update' : 'create'} retailer</p>
        </div>
        <button onClick={() => navigate('/outlets/retailers')} className="btn-outline flex items-center gap-2">
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
  );
}
