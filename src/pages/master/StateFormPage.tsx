import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Map } from 'lucide-react';
import { useStates, useCountries, useCreateState, useUpdateState } from '@/hooks/useGeoMasterData';
import { toast } from 'sonner';

export default function StateFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: states = [], isLoading: isLoadingStates } = useStates();
  const { data: countries = [] } = useCountries();
  const createState = useCreateState();
  const updateState = useUpdateState();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    country_id: '',
    status: 'active' as 'active' | 'inactive',
  });

  const existingState = states.find(s => s.id === id);

  useEffect(() => {
    if (existingState) {
      setFormData({
        name: existingState.name,
        code: existingState.code,
        country_id: existingState.country_id,
        status: existingState.status,
      });
    }
  }, [existingState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.code || !formData.country_id) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      if (isEdit && id) {
        await updateState.mutateAsync({ id, ...formData });
      } else {
        await createState.mutateAsync(formData);
      }
      navigate('/master/states');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isSubmitting = createState.isPending || updateState.isPending;

  if (isEdit && isLoadingStates) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/master/states')} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <Map size={28} className="text-secondary" />
            <h1 className="module-title">{isEdit ? 'Edit' : 'New'} State</h1>
          </div>
          <p className="text-muted-foreground">
            {isEdit ? 'Update state details' : 'Add a new state to the system'}
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
              onChange={(e) => setFormData({ ...formData, country_id: e.target.value })}
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
            <label className="text-sm font-medium text-foreground">State Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field w-full"
              placeholder="Enter state name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">State Code *</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="input-field w-full"
              placeholder="e.g., DL, MH"
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
            onClick={() => navigate('/master/states')}
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
            {isEdit ? 'Update' : 'Create'} State
          </button>
        </div>
      </motion.form>
    </div>
  );
}
