import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Globe, Save, Loader2 } from 'lucide-react';
import { useCountries, useCreateCountry, useUpdateCountry } from '@/hooks/useGeoMasterData';
import { toast } from 'sonner';

export default function CountryFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { data: countries = [], isLoading: isLoadingCountries } = useCountries();
  const createCountry = useCreateCountry();
  const updateCountry = useUpdateCountry();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    currency: 'INR',
    status: 'active' as 'active' | 'inactive',
  });

  const existingCountry = countries.find(c => c.id === id);

  useEffect(() => {
    if (isEdit && existingCountry) {
      setFormData({
        name: existingCountry.name,
        code: existingCountry.code,
        currency: existingCountry.currency,
        status: existingCountry.status,
      });
    }
  }, [isEdit, existingCountry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.code) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      if (isEdit && id) {
        await updateCountry.mutateAsync({ id, ...formData });
      } else {
        await createCountry.mutateAsync(formData);
      }
      navigate('/master/countries');
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isEdit && isLoadingCountries) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/master/countries')} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="module-title">{isEdit ? 'Edit Country' : 'Add Country'}</h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update country details' : 'Create a new country entry'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary/10">
              <Globe size={24} className="text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Country Details</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Country Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter country name"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Country Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., IN, US"
                className="input-field"
                maxLength={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Currency *</label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                placeholder="e.g., INR, USD"
                className="input-field"
                maxLength={3}
                required
              />
            </div>

            <div className="col-span-2">
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
          <button type="button" onClick={() => navigate('/master/countries')} className="btn-outline">
            Cancel
          </button>
          <button
            type="submit"
            disabled={createCountry.isPending || updateCountry.isPending}
            className="btn-primary flex items-center gap-2"
          >
            {(createCountry.isPending || updateCountry.isPending) ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isEdit ? 'Update Country' : 'Create Country'}
          </button>
        </div>
      </form>
    </div>
  );
}
