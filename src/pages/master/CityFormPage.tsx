import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Building } from 'lucide-react';
import { useCities, useStates, useCountries, useCreateCity, useUpdateCity } from '@/hooks/useGeoMasterData';
import { toast } from 'sonner';

export default function CityFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: cities = [], isLoading: isLoadingCities } = useCities();
  const { data: states = [] } = useStates();
  const { data: countries = [] } = useCountries();
  const createCity = useCreateCity();
  const updateCity = useUpdateCity();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    state_id: '',
    status: 'active' as 'active' | 'inactive',
  });

  const [selectedCountry, setSelectedCountry] = useState('');

  const existingCity = cities.find(c => c.id === id);

  useEffect(() => {
    if (existingCity) {
      setFormData({
        name: existingCity.name,
        code: existingCity.code,
        state_id: existingCity.state_id,
        status: existingCity.status,
      });
      // Set country from state
      const cityState = states.find(s => s.id === existingCity.state_id);
      if (cityState) {
        setSelectedCountry(cityState.country_id);
      }
    }
  }, [existingCity, states]);

  const filteredStates = states.filter(s => s.country_id === selectedCountry);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.code || !formData.state_id) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      if (isEdit && id) {
        await updateCity.mutateAsync({ id, ...formData });
      } else {
        await createCity.mutateAsync(formData);
      }
      navigate('/master/cities');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isSubmitting = createCity.isPending || updateCity.isPending;

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
          <div className="flex items-center gap-3">
            <Building size={28} className="text-info" />
            <h1 className="module-title">{isEdit ? 'Edit' : 'New'} City</h1>
          </div>
          <p className="text-muted-foreground">
            {isEdit ? 'Update city details' : 'Add a new city to the system'}
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
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setFormData({ ...formData, state_id: '' });
              }}
              className="input-field w-full"
              required
            >
              <option value="">Select Country</option>
              {countries.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">State *</label>
            <select
              value={formData.state_id}
              onChange={(e) => setFormData({ ...formData, state_id: e.target.value })}
              className="input-field w-full"
              required
              disabled={!selectedCountry}
            >
              <option value="">Select State</option>
              {filteredStates.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">City Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field w-full"
              placeholder="Enter city name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">City Code *</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="input-field w-full"
              placeholder="e.g., DEL, MUM"
              maxLength={5}
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

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => navigate('/master/cities')}
            className="btn-secondary"
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
            {isEdit ? 'Update' : 'Create'} City
          </button>
        </div>
      </motion.form>
    </div>
  );
}
