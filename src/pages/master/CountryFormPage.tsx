import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Globe } from 'lucide-react';
import { useCountries, useCreateCountry, useUpdateCountry } from '@/hooks/useGeoMasterData';
import { toast } from 'sonner';

const currencyOptions = [
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'AED', label: 'AED - UAE Dirham' },
];

export default function CountryFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

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
    if (existingCountry) {
      setFormData({
        name: existingCountry.name,
        code: existingCountry.code,
        currency: existingCountry.currency,
        status: existingCountry.status,
      });
    }
  }, [existingCountry]);

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

  const isSubmitting = createCountry.isPending || updateCountry.isPending;

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
          <div className="flex items-center gap-3">
            <Globe size={28} className="text-primary" />
            <h1 className="module-title">{isEdit ? 'Edit' : 'New'} Country</h1>
          </div>
          <p className="text-muted-foreground">
            {isEdit ? 'Update country details' : 'Add a new country to the system'}
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
            <label className="text-sm font-medium text-foreground">Country Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field w-full"
              placeholder="Enter country name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Country Code *</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="input-field w-full"
              placeholder="e.g., IN, US"
              maxLength={3}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Currency *</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="input-field w-full"
              required
            >
              {currencyOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
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
            onClick={() => navigate('/master/countries')}
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
            {isEdit ? 'Update' : 'Create'} Country
          </button>
        </div>
      </motion.form>
    </div>
  );
}
