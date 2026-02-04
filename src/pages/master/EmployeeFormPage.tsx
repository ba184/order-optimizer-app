import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUsersData, useRoles } from '@/hooks/useUsersData';
import { useCountries, useStates, useCities } from '@/hooks/useGeoMasterData';
import { useTerritories } from '@/hooks/useTerritoriesData';
import { toast } from 'sonner';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: '',
    reportingTo: '',
    country: '',
    state: '',
    city: '',
    territory: '',
    status: 'active',
    doj: '',
    dob: '',
    bloodGroup: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });

  // Load existing employee data when editing
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
          country: '',
          state: '',
          city: employee.territory || '',
          territory: employee.territory || '',
          status: employee.status || 'active',
          doj: employee.doj || '',
          dob: employee.dob || '',
          bloodGroup: employee.blood_group || '',
          emergencyContactName: employee.emergency_contact_name || '',
          emergencyContactPhone: employee.emergency_contact_phone || '',
        });
      }
    }
  }, [isEditMode, id, users]);

  // Filter states by country
  const filteredStates = states.filter(s => {
    if (!formData.country) return true;
    const country = countries.find(c => c.id === formData.country);
    return country ? s.country_id === country.id : true;
  });

  // Filter cities by state
  const filteredCities = cities.filter(c => {
    if (!formData.state) return true;
    return c.state_id === formData.state;
  });

  // Filter territories by city
  const filteredTerritories = territories.filter(t => {
    if (!formData.city) return true;
    return t.city_id === formData.city;
  });

  // Get managers/supervisors for reporting to dropdown
  const managers = users.filter(u => 
    u.id !== id && 
    ['admin', 'rsm', 'asm'].includes(u.role_code || '')
  );

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
      if (isEditMode && id) {
        // Update existing employee
        await updateUser.mutateAsync({
          id,
          name: formData.name,
          phone: formData.phone,
          territory: formData.territory || undefined,
          region: formData.state || undefined,
          reporting_to: formData.reportingTo || undefined,
          status: formData.status,
          doj: formData.doj || undefined,
          dob: formData.dob || undefined,
          blood_group: formData.bloodGroup || undefined,
          emergency_contact_name: formData.emergencyContactName || undefined,
          emergency_contact_phone: formData.emergencyContactPhone || undefined,
        });

        // Update role if changed
        const currentEmployee = users.find(u => u.id === id);
        if (formData.role && formData.role !== currentEmployee?.role_code) {
          await updateUserRole.mutateAsync({
            userId: id,
            roleCode: formData.role,
          });
        }

        toast.success('Employee updated successfully');
      } else {
        // Create new employee
        await createUser.mutateAsync({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
          territory: formData.territory || undefined,
          region: formData.state || undefined,
          reporting_to: formData.reportingTo || undefined,
          role_code: formData.role,
          doj: formData.doj || undefined,
          dob: formData.dob || undefined,
          blood_group: formData.bloodGroup || undefined,
          emergency_contact_name: formData.emergencyContactName || undefined,
          emergency_contact_phone: formData.emergencyContactPhone || undefined,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/master/employees')}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditMode ? 'Edit Employee' : 'Add New Employee'}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? 'Update employee information' : 'Create a new employee record'}
          </p>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee ID & Status */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Employee ID</Label>
              <Input
                value={employeeId}
                disabled
                className="bg-muted font-mono"
              />
              <p className="text-xs text-muted-foreground">System generated</p>
            </div>
            <div className="space-y-2">
              <Label>Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Employee Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Mobile *</Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@company.com"
                disabled={isEditMode}
              />
              {isEditMode && (
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              )}
            </div>
            {!isEditMode && (
              <div className="space-y-2">
                <Label>Password *</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                />
              </div>
            )}
          </div>

          {/* DOJ, DOB, Blood Group */}
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Date of Joining</Label>
              <Input
                type="date"
                value={formData.doj}
                onChange={(e) => setFormData({ ...formData, doj: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Blood Group</Label>
              <Select
                value={formData.bloodGroup}
                onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  {bloodGroups.map((bg) => (
                    <SelectItem key={bg} value={bg}>
                      {bg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Emergency Contact Name</Label>
              <Input
                value={formData.emergencyContactName}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                placeholder="Contact person name"
              />
            </div>
            <div className="space-y-2">
              <Label>Emergency Contact Phone</Label>
              <Input
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          {/* Role & Reporting */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.code}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Report To *</Label>
              <Select
                value={formData.reportingTo}
                onValueChange={(value) => setFormData({ ...formData, reportingTo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select manager" />
                </SelectTrigger>
                <SelectContent>
                  {managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name} ({manager.role_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Country</Label>
              <Select
                value={formData.country}
                onValueChange={(value) => setFormData({ ...formData, country: value, state: '', city: '', territory: '' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Select
                value={formData.state}
                onValueChange={(value) => setFormData({ ...formData, state: value, city: '', territory: '' })}
                disabled={!formData.country}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {filteredStates.map((state) => (
                    <SelectItem key={state.id} value={state.id}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>City</Label>
              <Select
                value={formData.city}
                onValueChange={(value) => setFormData({ ...formData, city: value, territory: '' })}
                disabled={!formData.state}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Territory</Label>
              <Select
                value={formData.territory}
                onValueChange={(value) => setFormData({ ...formData, territory: value })}
                disabled={!formData.city}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select territory" />
                </SelectTrigger>
                <SelectContent>
                  {filteredTerritories.map((territory) => (
                    <SelectItem key={territory.id} value={territory.name}>
                      {territory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => navigate('/master/employees')}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {isEditMode ? 'Update Employee' : 'Create Employee'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}