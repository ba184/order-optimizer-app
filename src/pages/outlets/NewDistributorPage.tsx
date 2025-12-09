import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
  Upload,
  Camera,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const steps = [
  { id: 1, title: 'Basic Info', description: 'Firm details & contact' },
  { id: 2, title: 'Location', description: 'Address & geo-tag' },
  { id: 3, title: 'Credit Terms', description: 'Limits & payment terms' },
  { id: 4, title: 'KYC Documents', description: 'Upload verification docs' },
  { id: 5, title: 'Review', description: 'Confirm & submit' },
];

export default function NewDistributorPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firmName: '',
    ownerName: '',
    tradeName: '',
    gstin: '',
    pan: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    creditLimit: '',
    creditDays: '30',
    paymentTerms: 'net30',
    documents: {
      gst: null as File | null,
      pan: null as File | null,
      aadhaar: null as File | null,
      cancelledCheque: null as File | null,
      agreement: null as File | null,
    },
    ownerPhoto: null as File | null,
    shopPhoto: null as File | null,
    geoLocation: { lat: 0, lng: 0 },
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    toast.success('Distributor application submitted for approval!');
    navigate('/outlets/distributors');
  };

  const captureLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          updateFormData('geoLocation', {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          toast.success('Location captured successfully!');
        },
        () => toast.error('Failed to capture location')
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">New Distributor Onboarding</h1>
        <p className="text-muted-foreground">Complete all steps to submit distributor application</p>
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
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 md:w-24 h-0.5 mx-2 ${currentStep > step.id ? 'bg-success' : 'bg-muted'}`} />
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
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Building2 size={20} className="text-primary" />
              Basic Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Firm Name *</label>
                <input
                  type="text"
                  value={formData.firmName}
                  onChange={e => updateFormData('firmName', e.target.value)}
                  placeholder="Enter firm name"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Trade Name</label>
                <input
                  type="text"
                  value={formData.tradeName}
                  onChange={e => updateFormData('tradeName', e.target.value)}
                  placeholder="Enter trade name"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Owner Name *</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={e => updateFormData('ownerName', e.target.value)}
                  placeholder="Enter owner's full name"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">GSTIN *</label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={e => updateFormData('gstin', e.target.value.toUpperCase())}
                  placeholder="07AABCT1234K1ZK"
                  className="input-field uppercase"
                  maxLength={15}
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
                <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => updateFormData('email', e.target.value)}
                  placeholder="email@company.com"
                  className="input-field"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <MapPin size={20} className="text-primary" />
              Location Details
            </h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Full Address *</label>
                <textarea
                  value={formData.address}
                  onChange={e => updateFormData('address', e.target.value)}
                  placeholder="Enter complete address with landmark"
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
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
                  <label className="block text-sm font-medium text-foreground mb-2">State *</label>
                  <select
                    value={formData.state}
                    onChange={e => updateFormData('state', e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select State</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="West Bengal">West Bengal</option>
                  </select>
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
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Geo Location</label>
                <div className="flex items-center gap-4">
                  <button onClick={captureLocation} className="btn-secondary flex items-center gap-2">
                    <MapPin size={18} />
                    Capture Location
                  </button>
                  {formData.geoLocation.lat !== 0 && (
                    <p className="text-sm text-success flex items-center gap-1">
                      <Check size={16} />
                      Location captured: {formData.geoLocation.lat.toFixed(4)}, {formData.geoLocation.lng.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Credit Terms */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              Credit Terms & Pricing
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Credit Limit (₹) *</label>
                <input
                  type="number"
                  value={formData.creditLimit}
                  onChange={e => updateFormData('creditLimit', e.target.value)}
                  placeholder="500000"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Credit Days *</label>
                <select
                  value={formData.creditDays}
                  onChange={e => updateFormData('creditDays', e.target.value)}
                  className="input-field"
                >
                  <option value="7">7 Days</option>
                  <option value="15">15 Days</option>
                  <option value="30">30 Days</option>
                  <option value="45">45 Days</option>
                  <option value="60">60 Days</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Payment Terms</label>
                <select
                  value={formData.paymentTerms}
                  onChange={e => updateFormData('paymentTerms', e.target.value)}
                  className="input-field"
                >
                  <option value="advance">100% Advance</option>
                  <option value="cod">Cash on Delivery</option>
                  <option value="net15">Net 15</option>
                  <option value="net30">Net 30</option>
                  <option value="net45">Net 45</option>
                </select>
              </div>
            </div>
            <div className="p-4 bg-info/10 rounded-lg border border-info/20">
              <p className="text-sm text-info flex items-center gap-2">
                <AlertCircle size={16} />
                Credit limit above ₹5,00,000 requires RSM approval
              </p>
            </div>
          </div>
        )}

        {/* Step 4: KYC Documents */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Upload size={20} className="text-primary" />
              KYC Documents
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { key: 'gst', label: 'GST Certificate', required: true },
                { key: 'pan', label: 'PAN Card', required: true },
                { key: 'aadhaar', label: 'Aadhaar Card', required: false },
                { key: 'cancelledCheque', label: 'Cancelled Cheque', required: true },
                { key: 'agreement', label: 'Signed Agreement', required: false },
              ].map(doc => (
                <div key={doc.key} className="p-4 border border-dashed border-border rounded-lg hover:border-primary transition-colors">
                  <label className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload size={24} className="text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {doc.label} {doc.required && '*'}
                    </span>
                    <span className="text-xs text-muted-foreground">PDF, JPG, PNG (Max 5MB)</span>
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                  </label>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border border-dashed border-border rounded-lg hover:border-primary transition-colors">
                <label className="cursor-pointer flex flex-col items-center gap-2">
                  <Camera size={24} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Owner Photo *</span>
                  <span className="text-xs text-muted-foreground">Take a live selfie</span>
                  <input type="file" className="hidden" accept="image/*" capture="user" />
                </label>
              </div>
              <div className="p-4 border border-dashed border-border rounded-lg hover:border-primary transition-colors">
                <label className="cursor-pointer flex flex-col items-center gap-2">
                  <Camera size={24} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Shop Photo *</span>
                  <span className="text-xs text-muted-foreground">Capture shop front</span>
                  <input type="file" className="hidden" accept="image/*" capture="environment" />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Check size={20} className="text-primary" />
              Review & Submit
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Basic Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Firm Name:</span> {formData.firmName || '-'}</p>
                  <p><span className="text-muted-foreground">Owner:</span> {formData.ownerName || '-'}</p>
                  <p><span className="text-muted-foreground">GSTIN:</span> {formData.gstin || '-'}</p>
                  <p><span className="text-muted-foreground">Phone:</span> {formData.phone || '-'}</p>
                  <p><span className="text-muted-foreground">Email:</span> {formData.email || '-'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Location</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Address:</span> {formData.address || '-'}</p>
                  <p><span className="text-muted-foreground">City:</span> {formData.city || '-'}</p>
                  <p><span className="text-muted-foreground">State:</span> {formData.state || '-'}</p>
                  <p><span className="text-muted-foreground">Pincode:</span> {formData.pincode || '-'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Credit Terms</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Credit Limit:</span> ₹{formData.creditLimit || '-'}</p>
                  <p><span className="text-muted-foreground">Credit Days:</span> {formData.creditDays} days</p>
                  <p><span className="text-muted-foreground">Payment Terms:</span> {formData.paymentTerms}</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
              <p className="text-sm text-warning flex items-center gap-2">
                <AlertCircle size={16} />
                This application will be sent for approval to ASM. Distributor code will be generated after final approval.
              </p>
            </div>
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
        {currentStep < 5 ? (
          <button onClick={handleNext} className="btn-primary flex items-center gap-2">
            Next
            <ChevronRight size={18} />
          </button>
        ) : (
          <button onClick={handleSubmit} className="btn-primary flex items-center gap-2">
            <Check size={18} />
            Submit for Approval
          </button>
        )}
      </div>
    </div>
  );
}
