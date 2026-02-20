import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { FormActionButtons } from '@/components/ui/FormActionButtons';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useVendor, useCreateVendor, useUpdateVendor } from '@/hooks/useVendorsData';
import { useStates } from '@/hooks/useGeoMasterData';
import { supabase } from '@/integrations/supabase/client';

const businessTypes = [
  { value: 'supplier', label: 'Supplier' },
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'wholesaler', label: 'Wholesaler' },
  { value: 'importer', label: 'Importer' },
];

const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export default function VendorFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { user } = useAuth();

  const { data: vendor, isLoading: vendorLoading } = useVendor(id || '');
  const { data: states } = useStates();
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();

  const [managers, setManagers] = useState<{ id: string; name: string }[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    firm_name: '',
    contact_person: '',
    contact_number: '',
    alternate_number: '',
    email: '',
    gstin: '',
    pan: '',
    business_type: 'supplier',
    credit_limit: 0,
    credit_days: 30,
    address: '',
    country: 'India',
    state: '',
    city: '',
    zone: '',
    since_date: new Date().toISOString().split('T')[0],
    assigned_manager_id: '',
    status: 'active',
  });

  // Fetch managers (Purchase/Admin roles)
  useEffect(() => {
    const fetchManagers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('status', 'active')
        .order('name');
      if (data) setManagers(data);
    };
    fetchManagers();
  }, []);

  // Load existing data for edit
  useEffect(() => {
    if (isEdit && vendor) {
      setFormData({
        firm_name: vendor.firm_name || '',
        contact_person: vendor.contact_person || '',
        contact_number: vendor.contact_number || '',
        alternate_number: vendor.alternate_number || '',
        email: vendor.email || '',
        gstin: vendor.gstin || '',
        pan: vendor.pan || '',
        business_type: vendor.business_type || 'supplier',
        credit_limit: Number(vendor.credit_limit) || 0,
        credit_days: Number(vendor.credit_days) || 30,
        address: vendor.address || '',
        country: vendor.country || 'India',
        state: vendor.state || '',
        city: vendor.city || '',
        zone: vendor.zone || '',
        since_date: vendor.since_date || new Date().toISOString().split('T')[0],
        assigned_manager_id: vendor.assigned_manager_id || '',
        status: vendor.status || 'active',
      });
    }
  }, [isEdit, vendor]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firm_name.trim()) errors.firm_name = 'Firm/Company Name is required';
    if (!formData.contact_person.trim()) errors.contact_person = 'Contact Person is required';
    if (!formData.contact_number.trim()) errors.contact_number = 'Contact Number is required';
    else if (!/^\d{10}$/.test(formData.contact_number.replace(/\D/g, ''))) 
      errors.contact_number = 'Contact Number must be 10 digits';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) 
      errors.email = 'Invalid email format';
    if (formData.gstin && !gstinRegex.test(formData.gstin)) 
      errors.gstin = 'Invalid GSTIN format';
    if (formData.pan && !panRegex.test(formData.pan)) 
      errors.pan = 'Invalid PAN format';
    if (!formData.business_type) errors.business_type = 'Business Type is required';
    if (formData.credit_limit < 0) errors.credit_limit = 'Credit Limit must be 0 or greater';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.assigned_manager_id) errors.assigned_manager_id = 'Purchase Manager is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix validation errors');
      return;
    }

    try {
      const vendorData = {
        firm_name: formData.firm_name,
        contact_person: formData.contact_person,
        contact_number: formData.contact_number.replace(/\D/g, ''),
        alternate_number: formData.alternate_number?.replace(/\D/g, '') || null,
        email: formData.email,
        gstin: formData.gstin || null,
        pan: formData.pan || null,
        business_type: formData.business_type,
        credit_limit: formData.credit_limit,
        credit_days: formData.credit_days,
        outstanding_amount: 0,
        address: formData.address,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        zone: formData.zone || null,
        since_date: formData.since_date,
        assigned_manager_id: formData.assigned_manager_id || null,
        status: formData.status,
        created_by: isEdit ? undefined : user?.id,
      };

      if (isEdit && id) {
        await updateVendor.mutateAsync({ id, ...vendorData });
      } else {
        await createVendor.mutateAsync(vendorData as any);
      }

      navigate('/outlets/vendors');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save vendor');
    }
  };

  const isSaving = createVendor.isPending || updateVendor.isPending;

  if (vendorLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{isEdit ? 'Edit Vendor' : 'Add New Vendor'}</h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update vendor information' : 'Create a new vendor/supplier'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Business Details</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Firm / Company Name *</label>
              <input
                type="text"
                value={formData.firm_name}
                onChange={(e) => setFormData({ ...formData, firm_name: e.target.value })}
                placeholder="Enter firm name"
                className={`input-field ${validationErrors.firm_name ? 'border-destructive' : ''}`}
              />
              {validationErrors.firm_name && <p className="text-xs text-destructive mt-1">{validationErrors.firm_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Business Type *</label>
              <select
                value={formData.business_type}
                onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                className={`input-field ${validationErrors.business_type ? 'border-destructive' : ''}`}
              >
                {businessTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {validationErrors.business_type && <p className="text-xs text-destructive mt-1">{validationErrors.business_type}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">GSTIN</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                placeholder="22AAAAA0000A1Z5"
                className={`input-field ${validationErrors.gstin ? 'border-destructive' : ''}`}
              />
              {validationErrors.gstin && <p className="text-xs text-destructive mt-1">{validationErrors.gstin}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">PAN</label>
              <input
                type="text"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                placeholder="AAAAA0000A"
                className={`input-field ${validationErrors.pan ? 'border-destructive' : ''}`}
              />
              {validationErrors.pan && <p className="text-xs text-destructive mt-1">{validationErrors.pan}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Since Date *</label>
              <input
                type="date"
                value={formData.since_date}
                onChange={(e) => setFormData({ ...formData, since_date: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-field"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Contact Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Contact Details</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Contact Person *</label>
              <input
                type="text"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                placeholder="Primary representative name"
                className={`input-field ${validationErrors.contact_person ? 'border-destructive' : ''}`}
              />
              {validationErrors.contact_person && <p className="text-xs text-destructive mt-1">{validationErrors.contact_person}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Contact Number *</label>
              <input
                type="text"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                placeholder="10 digit mobile number"
                className={`input-field ${validationErrors.contact_number ? 'border-destructive' : ''}`}
              />
              {validationErrors.contact_number && <p className="text-xs text-destructive mt-1">{validationErrors.contact_number}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Alternate Number</label>
              <input
                type="text"
                value={formData.alternate_number}
                onChange={(e) => setFormData({ ...formData, alternate_number: e.target.value })}
                placeholder="Optional"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email ID *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="vendor@company.com"
                className={`input-field ${validationErrors.email ? 'border-destructive' : ''}`}
              />
              {validationErrors.email && <p className="text-xs text-destructive mt-1">{validationErrors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Assigned Purchase Manager *</label>
              <select
                value={formData.assigned_manager_id}
                onChange={(e) => setFormData({ ...formData, assigned_manager_id: e.target.value })}
                className={`input-field ${validationErrors.assigned_manager_id ? 'border-destructive' : ''}`}
              >
                <option value="">Select Manager</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              {validationErrors.assigned_manager_id && <p className="text-xs text-destructive mt-1">{validationErrors.assigned_manager_id}</p>}
            </div>
          </div>
        </motion.div>

        {/* Credit & Payment Terms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Credit & Payment Terms</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Credit Limit (₹) *</label>
              <input
                type="number"
                value={formData.credit_limit}
                onChange={(e) => setFormData({ ...formData, credit_limit: Number(e.target.value) })}
                min={0}
                className={`input-field ${validationErrors.credit_limit ? 'border-destructive' : ''}`}
              />
              {validationErrors.credit_limit && <p className="text-xs text-destructive mt-1">{validationErrors.credit_limit}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Credit Days *</label>
              <input
                type="number"
                value={formData.credit_days}
                onChange={(e) => setFormData({ ...formData, credit_days: Number(e.target.value) })}
                min={0}
                max={180}
                className="input-field"
              />
            </div>
          </div>
        </motion.div>

        {/* Address Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl border border-border p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Address Details</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-foreground mb-2">Full Address *</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter complete business address"
                rows={3}
                className={`input-field resize-none ${validationErrors.address ? 'border-destructive' : ''}`}
              />
              {validationErrors.address && <p className="text-xs text-destructive mt-1">{validationErrors.address}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">State *</label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className={`input-field ${validationErrors.state ? 'border-destructive' : ''}`}
              >
                <option value="">Select State</option>
                {states?.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
              {validationErrors.state && <p className="text-xs text-destructive mt-1">{validationErrors.state}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">City *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Enter city"
                className={`input-field ${validationErrors.city ? 'border-destructive' : ''}`}
              />
              {validationErrors.city && <p className="text-xs text-destructive mt-1">{validationErrors.city}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Zone / Area</label>
              <input
                type="text"
                value={formData.zone}
                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                placeholder="Optional"
                className="input-field"
              />
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <FormActionButtons
          isEdit={isEdit}
          isSubmitting={isSaving}
          onCancel={() => navigate(-1)}
          onReset={() => setFormData({ firm_name: '', contact_person: '', contact_number: '', alternate_number: '', email: '', gstin: '', pan: '', business_type: 'supplier', credit_limit: 0, credit_days: 30, address: '', country: 'India', state: '', city: '', zone: '', since_date: new Date().toISOString().split('T')[0], assigned_manager_id: '', status: 'active' })}
          submitViaForm
          onAddMore={async () => { await handleSubmit({ preventDefault: () => {} } as React.FormEvent); }}
          entityName="Vendor"
        />
      </form>
    </div>
  );
}
