import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Building, Save, Loader2 } from 'lucide-react';
import { useCities, useStates, useCountries, useCreateCity, useUpdateCity } from '@/hooks/useGeoMasterData';
import { toast } from 'sonner';

export default function CityFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { data: cities = [], isLoading: isLoadingCities } = useCities();
  const { data: states = [] } = useStates();
  const { data: countries = [] } = useCountries();
  const createCity = useCreateCity();
  const updateCity = useUpdateCity();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    country_id: '',
    state_id: '',
    status: 'active' as 'active' | 'inactive',
  });

  const existingCity = cities.find(c => c.id === id);

  useEffect(() => {
    if (isEdit && existingCity) {
      setFormData({
        name: existingCity.name,
        code: existingCity.code,
        country_id: (existingCity.state as any)?.country_id || '',
        state_id: existingCity.state_id,
        status: existingCity.status,
      });
    }
  }, [isEdit, existingCity]);

  const filteredStates = states.filter(s => s.country_id === formData.country_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.code || !formData.state_id) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      if (isEdit && id) {
        await updateCity.mutateAsync({ id, name: formData.name, code: formData.code, state_id: formData.state_id, status: formData.status });
      } else {
        await createCity.mutateAsync({ name: formData.name, code: formData.code, state_id: formData.state_id, status: formData.status });
      }
      navigate('/master/cities');
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isEdit && isLoadingCities) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/master/cities')} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="module-title">{isEdit ? 'Edit City' : 'Add City'}</h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update city details' : 'Create a new city entry'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-info/10">
              <Building size={24} className="text-info" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">City Details</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Country *</label>
              <select
                value={formData.country_id}
                onChange={(e) => setFormData({ ...formData, country_id: e.target.value, state_id: '' })}
                className="input-field"
                required
              >
                <option value="">Select Country</option>
                {countries.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">State *</label>
              <select
                value={formData.state_id}
                onChange={(e) => setFormData({ ...formData, state_id: e.target.value })}
                className="input-field"
                required
                disabled={!formData.country_id}
              >
                <option value="">Select State</option>
                {filteredStates.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">City Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter city name"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">City Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., NDL, MUM"
                className="input-field"
                maxLength={5}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="input-field"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </motion.div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button type="button" onClick={() => navigate('/master/cities')} className="btn-outline">
            Cancel
          </button>
          <button
            type="submit"
            disabled={createCity.isPending || updateCity.isPending}
            className="btn-primary flex items-center gap-2"
          >
            {(createCity.isPending || updateCity.isPending) ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isEdit ? 'Update City' : 'Create City'}
          </button>
        </div>
      </form>
    </div>
  );
}
