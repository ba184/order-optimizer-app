import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, MapPin } from 'lucide-react';
import { useTerritories, useCreateTerritory, useUpdateTerritory } from '@/hooks/useTerritoriesData';
import { useCountries, useStates, useCities } from '@/hooks/useGeoMasterData';
import { FormActionButtons } from '@/components/ui/FormActionButtons';
import { toast } from 'sonner';

export default function TerritoryFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: territories = [], isLoading: isLoadingTerritories } = useTerritories();
  const { data: countries = [] } = useCountries();
  const createTerritory = useCreateTerritory();
  const updateTerritory = useUpdateTerritory();

  const [formData, setFormData] = useState({
    name: '',
    country_id: '',
    state_id: '',
    city_id: '',
    status: 'active' as 'active' | 'inactive',
  });

  // Fetch states based on selected country
  const { data: states = [] } = useStates(formData.country_id || undefined);
  // Fetch cities based on selected state
  const { data: cities = [] } = useCities(formData.state_id || undefined);

  const existingTerritory = territories.find(t => t.id === id);

  useEffect(() => {
    if (existingTerritory) {
      setFormData({
        name: existingTerritory.name,
        country_id: (existingTerritory as any).country_id || '',
        state_id: (existingTerritory as any).state_id || '',
        city_id: (existingTerritory as any).city_id || '',
        status: existingTerritory.status as 'active' | 'inactive',
      });
    }
  }, [existingTerritory]);

  // Reset state when country changes
  useEffect(() => {
    if (!isEdit) {
      setFormData(prev => ({ ...prev, state_id: '', city_id: '' }));
    }
  }, [formData.country_id, isEdit]);

  // Reset city when state changes
  useEffect(() => {
    if (!isEdit) {
      setFormData(prev => ({ ...prev, city_id: '' }));
    }
  }, [formData.state_id, isEdit]);

  const initialFormData = { name: '', country_id: '', state_id: '', city_id: '', status: 'active' as 'active' | 'inactive' };

  const handleSubmit = async (e?: React.FormEvent, addMore = false) => {
    e?.preventDefault();
    if (!formData.name || !formData.country_id || !formData.state_id || !formData.city_id) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      const data = {
        name: formData.name, type: 'area' as any,
        country_id: formData.country_id, state_id: formData.state_id,
        city_id: formData.city_id, status: formData.status,
      };
      if (isEdit && id) {
        await updateTerritory.mutateAsync({ id, ...data });
        navigate('/master/territories');
      } else {
        await createTerritory.mutateAsync(data);
        if (addMore) { setFormData(initialFormData); toast.success('Territory created! Add another.'); }
        else navigate('/master/territories');
      }
    } catch (error) {}
  };

  const handleReset = () => {
    if (existingTerritory && isEdit) {
      setFormData({
        name: existingTerritory.name, country_id: (existingTerritory as any).country_id || '',
        state_id: (existingTerritory as any).state_id || '', city_id: (existingTerritory as any).city_id || '',
        status: existingTerritory.status as 'active' | 'inactive',
      });
    } else setFormData(initialFormData);
  };

  const isSubmitting = createTerritory.isPending || updateTerritory.isPending;

  if (isEdit && isLoadingTerritories) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeCountries = countries.filter(c => c.status === 'active');
  const activeStates = states.filter(s => s.status === 'active');
  const activeCities = cities.filter(c => c.status === 'active');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/master/territories')} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <MapPin size={28} className="text-success" />
            <h1 className="module-title">{isEdit ? 'Edit' : 'New'} Territory</h1>
          </div>
          <p className="text-muted-foreground">
            {isEdit ? 'Update territory details' : 'Add a new territory to the system'}
          </p>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="card p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Country *</label>
            <select
              value={formData.country_id}
              onChange={(e) => setFormData({ ...formData, country_id: e.target.value, state_id: '', city_id: '' })}
              className="input-field w-full"
              required
            >
              <option value="">Select Country</option>
              {activeCountries.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">State *</label>
            <select
              value={formData.state_id}
              onChange={(e) => setFormData({ ...formData, state_id: e.target.value, city_id: '' })}
              className="input-field w-full"
              required
              disabled={!formData.country_id}
            >
              <option value="">Select State</option>
              {activeStates.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">City *</label>
            <select
              value={formData.city_id}
              onChange={(e) => setFormData({ ...formData, city_id: e.target.value })}
              className="input-field w-full"
              required
              disabled={!formData.state_id}
            >
              <option value="">Select City</option>
              {activeCities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Territory Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field w-full"
              placeholder="Enter territory name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              className="input-field w-full"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <FormActionButtons
          isEdit={isEdit}
          isSubmitting={isSubmitting}
          onCancel={() => navigate('/master/territories')}
          onReset={handleReset}
          onSubmit={() => handleSubmit()}
          onAddMore={() => handleSubmit(undefined, true)}
          entityName="Territory"
        />
      </motion.form>
    </div>
  );
}
