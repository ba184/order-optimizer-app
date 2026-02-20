import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Upload, X } from 'lucide-react';
import { FormActionButtons } from '@/components/ui/FormActionButtons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUsersData, useRoles } from '@/hooks/useUsersData';
import { useCountries, useStates, useCities } from '@/hooks/useGeoMasterData';
import { useTerritories } from '@/hooks/useTerritoriesData';
import { toast } from 'sonner';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const initialFormData = {
  name: '',
  phone: '',
  email: '',
  password: '',
  role: '',
  reportingTo: '',
  status: 'active',
  doj: '',
  dob: '',
  bloodGroup: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  panNumber: '',
  aadhaarNumber: '',
  isProbation: false,
  photoPreview: '',
  // Working address
  workingCountry: '',
  workingState: '',
  workingCity: '',
  workingTerritory: '',
  workingAddress: '',
  workingPincode: '',
  // Permanent address
  permanentCountry: '',
  permanentState: '',
  permanentCity: '',
  permanentTerritory: '',
  permanentAddress: '',
  permanentPincode: '',
};

export default function EmployeeFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const { users, createUser, updateUser, updateUserRole } = useUsersData();
  const { data: roles = [] } = useRoles();
  const { data: countries = [] } = useCountries();
  const { data: states = [] } = useStates();
  const { data: cities = [] } = useCities();
  const { data: territories = [] } = useTerritories();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ ...initialFormData });
  const [sameAsWorking, setSameAsWorking] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      const employee = users.find(u => u.id === id);
      if (employee) {
        setFormData({
          name: employee.name || '',
          phone: employee.phone || '',
          email: employee.email || '',
          password: '',
          role: employee.role_code || '',
          reportingTo: employee.reporting_to || '',
          status: employee.status || 'active',
          doj: employee.doj || '',
          dob: employee.dob || '',
          bloodGroup: employee.blood_group || '',
          emergencyContactName: employee.emergency_contact_name || '',
          emergencyContactPhone: employee.emergency_contact_phone || '',
          panNumber: employee.pan_number || '',
          aadhaarNumber: employee.aadhaar_number || '',
          isProbation: employee.is_probation || false,
          photoPreview: employee.photo_url || '',
          workingCountry: employee.working_country || '',
          workingState: employee.working_state || '',
          workingCity: employee.working_city || '',
          workingTerritory: employee.working_territory || '',
          workingAddress: employee.working_address || '',
          workingPincode: employee.working_pincode || '',
          permanentCountry: employee.permanent_country || '',
          permanentState: employee.permanent_state || '',
          permanentCity: employee.permanent_city || '',
          permanentTerritory: employee.permanent_territory || '',
          permanentAddress: employee.permanent_address || '',
          permanentPincode: employee.permanent_pincode || '',
        });
      }
    }
  }, [isEditMode, id, users]);

  // Copy working address to permanent
  useEffect(() => {
    if (sameAsWorking) {
      setFormData(prev => ({
        ...prev,
        permanentCountry: prev.workingCountry,
        permanentState: prev.workingState,
        permanentCity: prev.workingCity,
        permanentTerritory: prev.workingTerritory,
        permanentAddress: prev.workingAddress,
        permanentPincode: prev.workingPincode,
      }));
    }
  }, [sameAsWorking, formData.workingCountry, formData.workingState, formData.workingCity, formData.workingTerritory, formData.workingAddress, formData.workingPincode]);

  // Geo filter helpers
  const filterStates = (countryId: string) => states.filter(s => !countryId || s.country_id === countryId);
  const filterCities = (stateId: string) => cities.filter(c => !stateId || c.state_id === stateId);
  const filterTerritories = (cityId: string) => territories.filter(t => !cityId || t.city_id === cityId);

  const managers = users.filter(u => u.id !== id && ['admin', 'manager'].includes(u.role_code || ''));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoPreview: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.email || !formData.role || !formData.reportingTo || !formData.status) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!isEditMode && (!formData.password || formData.password.length < 6)) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const commonFields = {
        territory: formData.workingTerritory || undefined,
        region: formData.workingState || undefined,
        reporting_to: formData.reportingTo || undefined,
        doj: formData.doj || undefined,
        dob: formData.dob || undefined,
        blood_group: formData.bloodGroup || undefined,
        emergency_contact_name: formData.emergencyContactName || undefined,
        emergency_contact_phone: formData.emergencyContactPhone || undefined,
        pan_number: formData.panNumber || undefined,
        aadhaar_number: formData.aadhaarNumber || undefined,
        is_probation: formData.isProbation,
        photo_url: formData.photoPreview || undefined,
        working_address: formData.workingAddress || undefined,
        working_country: formData.workingCountry || undefined,
        working_state: formData.workingState || undefined,
        working_city: formData.workingCity || undefined,
        working_territory: formData.workingTerritory || undefined,
        working_pincode: formData.workingPincode || undefined,
        permanent_address: formData.permanentAddress || undefined,
        permanent_country: formData.permanentCountry || undefined,
        permanent_state: formData.permanentState || undefined,
        permanent_city: formData.permanentCity || undefined,
        permanent_territory: formData.permanentTerritory || undefined,
        permanent_pincode: formData.permanentPincode || undefined,
      };

      if (isEditMode && id) {
        await updateUser.mutateAsync({
          id,
          name: formData.name,
          phone: formData.phone,
          status: formData.status,
          ...commonFields,
        });
        const currentEmployee = users.find(u => u.id === id);
        if (formData.role && formData.role !== currentEmployee?.role_code) {
          await updateUserRole.mutateAsync({ userId: id, roleCode: formData.role });
        }
        toast.success('Employee updated successfully');
      } else {
        await createUser.mutateAsync({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
          role_code: formData.role,
          ...commonFields,
        });
        toast.success('Employee created successfully');
      }
      navigate('/master/employees');
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const employeeId = isEditMode && id ? id.slice(0, 8).toUpperCase() : 'Auto-generated';

  const renderAddressSection = (prefix: 'working' | 'permanent', title: string) => {
    const countryKey = `${prefix}Country` as keyof typeof formData;
    const stateKey = `${prefix}State` as keyof typeof formData;
    const cityKey = `${prefix}City` as keyof typeof formData;
    const territoryKey = `${prefix}Territory` as keyof typeof formData;
    const addressKey = `${prefix}Address` as keyof typeof formData;
    const pincodeKey = `${prefix}Pincode` as keyof typeof formData;

    const disabled = prefix === 'permanent' && sameAsWorking;

    return (
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {prefix === 'permanent' && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="sameAsWorking"
              checked={sameAsWorking}
              onCheckedChange={(checked) => setSameAsWorking(checked === true)}
            />
            <Label htmlFor="sameAsWorking" className="text-sm cursor-pointer">Same as Working Address</Label>
          </div>
        )}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Country</Label>
            <Select
              value={formData[countryKey] as string}
              onValueChange={(value) => setFormData(prev => ({ ...prev, [countryKey]: value, [stateKey]: '', [cityKey]: '', [territoryKey]: '' }))}
              disabled={disabled}
            >
              <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent>
                {countries.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>State</Label>
            <Select
              value={formData[stateKey] as string}
              onValueChange={(value) => setFormData(prev => ({ ...prev, [stateKey]: value, [cityKey]: '', [territoryKey]: '' }))}
              disabled={disabled || !(formData[countryKey] as string)}
            >
              <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
              <SelectContent>
                {filterStates(formData[countryKey] as string).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>City</Label>
            <Select
              value={formData[cityKey] as string}
              onValueChange={(value) => setFormData(prev => ({ ...prev, [cityKey]: value, [territoryKey]: '' }))}
              disabled={disabled || !(formData[stateKey] as string)}
            >
              <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
              <SelectContent>
                {filterCities(formData[stateKey] as string).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Territory</Label>
            <Select
              value={formData[territoryKey] as string}
              onValueChange={(value) => setFormData(prev => ({ ...prev, [territoryKey]: value }))}
              disabled={disabled || !(formData[cityKey] as string)}
            >
              <SelectTrigger><SelectValue placeholder="Select territory" /></SelectTrigger>
              <SelectContent>
                {filterTerritories(formData[cityKey] as string).map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Full Address</Label>
            <Textarea
              value={formData[addressKey] as string}
              onChange={(e) => setFormData(prev => ({ ...prev, [addressKey]: e.target.value }))}
              placeholder="Enter full address"
              disabled={disabled}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Pincode</Label>
            <Input
              value={formData[pincodeKey] as string}
              onChange={(e) => setFormData(prev => ({ ...prev, [pincodeKey]: e.target.value }))}
              placeholder="Enter pincode"
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/master/employees')} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{isEditMode ? 'Edit Employee' : 'Add New Employee'}</h1>
          <p className="text-muted-foreground">{isEditMode ? 'Update employee information' : 'Create a new employee record'}</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Employee ID, Status & Photo */}
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Employee ID</Label>
              <Input value={employeeId} disabled className="bg-muted font-mono" />
              <p className="text-xs text-muted-foreground">System generated</p>
            </div>
            <div className="space-y-2">
              <Label>Status *</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Employee Photo</Label>
              <div className="flex items-center gap-3">
                {formData.photoPreview ? (
                  <div className="relative">
                    <img src={formData.photoPreview} alt="Employee" className="w-16 h-16 rounded-full object-cover border border-border" />
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, photoPreview: '' }))} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5">
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border border-dashed border-border">
                    <Upload size={18} className="text-muted-foreground" />
                  </div>
                )}
                <label className="cursor-pointer text-sm text-primary hover:underline">
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  {formData.photoPreview ? 'Change' : 'Upload'}
                </label>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Employee Name *</Label>
              <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Enter full name" />
            </div>
            <div className="space-y-2">
              <Label>Mobile *</Label>
              <Input type="tel" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} placeholder="+91 98765 43210" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="email@company.com" disabled={isEditMode} />
              {isEditMode && <p className="text-xs text-muted-foreground">Email cannot be changed</p>}
            </div>
            {!isEditMode && (
              <div className="space-y-2">
                <Label>Password *</Label>
                <Input type="password" value={formData.password} onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} placeholder="Minimum 6 characters" />
              </div>
            )}
          </div>

          {/* DOJ, DOB, Blood Group */}
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Date of Joining</Label>
              <Input type="date" value={formData.doj} onChange={(e) => setFormData(prev => ({ ...prev, doj: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input type="date" value={formData.dob} onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Blood Group</Label>
              <Select value={formData.bloodGroup} onValueChange={(value) => setFormData(prev => ({ ...prev, bloodGroup: value }))}>
                <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
                <SelectContent>
                  {bloodGroups.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* PAN, Aadhaar, Probation */}
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>PAN Number</Label>
              <Input value={formData.panNumber} onChange={(e) => setFormData(prev => ({ ...prev, panNumber: e.target.value.toUpperCase() }))} placeholder="ABCDE1234F" maxLength={10} />
            </div>
            <div className="space-y-2">
              <Label>Aadhaar Number</Label>
              <Input value={formData.aadhaarNumber} onChange={(e) => setFormData(prev => ({ ...prev, aadhaarNumber: e.target.value.replace(/\D/g, '') }))} placeholder="1234 5678 9012" maxLength={12} />
            </div>
            <div className="space-y-2">
              <Label>Probation</Label>
              <div className="flex items-center gap-2 h-10">
                <Checkbox
                  id="isProbation"
                  checked={formData.isProbation}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isProbation: checked === true }))}
                />
                <Label htmlFor="isProbation" className="cursor-pointer">Employee is in probation</Label>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Emergency Contact Name</Label>
              <Input value={formData.emergencyContactName} onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactName: e.target.value }))} placeholder="Contact person name" />
            </div>
            <div className="space-y-2">
              <Label>Emergency Contact Phone</Label>
              <Input type="tel" value={formData.emergencyContactPhone} onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactPhone: e.target.value }))} placeholder="+91 98765 43210" />
            </div>
          </div>

          {/* Role & Reporting */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  {roles.map(role => <SelectItem key={role.id} value={role.code}>{role.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Report To *</Label>
              <Select value={formData.reportingTo} onValueChange={(value) => setFormData(prev => ({ ...prev, reportingTo: value }))}>
                <SelectTrigger><SelectValue placeholder="Select manager" /></SelectTrigger>
                <SelectContent>
                  {managers.map(m => <SelectItem key={m.id} value={m.id}>{m.name} ({m.role_name})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Working Address */}
          <div className="border-t border-border pt-6">
            {renderAddressSection('working', 'Working Address')}
          </div>

          {/* Permanent Address */}
          <div className="border-t border-border pt-6">
            {renderAddressSection('permanent', 'Permanent Address')}
          </div>

          {/* Actions */}
          <FormActionButtons
            isEdit={isEditMode}
            isSubmitting={isSubmitting}
            onCancel={() => navigate('/master/employees')}
            onReset={() => { setFormData({ ...initialFormData }); setSameAsWorking(false); }}
            onSubmit={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            onAddMore={async () => { await handleSubmit({ preventDefault: () => {} } as React.FormEvent); }}
            entityName="Employee"
          />
        </form>
      </motion.div>
    </div>
  );
}
