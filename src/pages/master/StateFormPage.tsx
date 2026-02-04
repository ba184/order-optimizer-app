import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Map, Save, Loader2 } from 'lucide-react';
import { useStates, useCountries, useCreateState, useUpdateState } from '@/hooks/useGeoMasterData';
import { toast } from 'sonner';

export default function StateFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

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
    if (isEdit && existingState) {
      setFormData({
        name: existingState.name,
        code: existingState.code,
        country_id: existingState.country_id,
        status: existingState.status,
      });
    }
  }, [isEdit, existingState]);

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
          <h1 className="module-title">{isEdit ? 'Edit State' : 'Add State'}</h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update state details' : 'Create a new state entry'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-secondary/10">
              <Map size={24} className="text-secondary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">State Details</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Country *</label>
              <select
                value={formData.country_id}
                onChange={(e) => setFormData({ ...formData, country_id: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Select Country</option>
                {countries.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">State Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter state name"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">State Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., DL, MH"
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
          <button type="button" onClick={() => navigate('/master/states')} className="btn-outline">
            Cancel
          </button>
          <button
            type="submit"
            disabled={createState.isPending || updateState.isPending}
            className="btn-primary flex items-center gap-2"
          >
            {(createState.isPending || updateState.isPending) ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isEdit ? 'Update State' : 'Create State'}
          </button>
        </div>
      </form>
    </div>
  );
}
