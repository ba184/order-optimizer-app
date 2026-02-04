import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Save, Loader2 } from 'lucide-react';
import { useTerritories, useCreateTerritory, useUpdateTerritory } from '@/hooks/useTerritoriesData';
import { toast } from 'sonner';

export default function TerritoryFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { data: territories = [], isLoading: isLoadingTerritories } = useTerritories();
  const createTerritory = useCreateTerritory();
  const updateTerritory = useUpdateTerritory();

  const [formData, setFormData] = useState({
    name: '',
    type: 'area' as 'country' | 'state' | 'zone' | 'city' | 'area',
    parent_id: '',
    manager_id: '',
    status: 'active',
  });

  const existingTerritory = territories.find(t => t.id === id);

  useEffect(() => {
    if (isEdit && existingTerritory) {
      setFormData({
        name: existingTerritory.name,
        type: existingTerritory.type,
        parent_id: existingTerritory.parent_id || '',
        manager_id: existingTerritory.manager_id || '',
        status: existingTerritory.status,
      });
    }
  }, [isEdit, existingTerritory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.type) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      const submitData = {
        name: formData.name,
        type: formData.type,
        parent_id: formData.parent_id || null,
        manager_id: formData.manager_id || null,
        status: formData.status as 'active' | 'inactive',
      };

      if (isEdit && id) {
        await updateTerritory.mutateAsync({ id, ...submitData });
      } else {
        await createTerritory.mutateAsync(submitData);
      }
      navigate('/master/territories');
    } catch (error) {
      // Error handled by mutation
    }
  };

  // Filter parent territories based on type hierarchy
  const parentOptions = territories.filter(t => {
    if (formData.type === 'country') return false;
    if (formData.type === 'state') return t.type === 'country';
    if (formData.type === 'zone') return ['country', 'state'].includes(t.type);
    if (formData.type === 'city') return ['state', 'zone'].includes(t.type);
    if (formData.type === 'area') return ['city', 'zone'].includes(t.type);
    return true;
  });

  if (isEdit && isLoadingTerritories) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/master/territories')} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="module-title">{isEdit ? 'Edit Territory' : 'Add Territory'}</h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update territory details' : 'Create a new territory entry'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-success/10">
              <MapPin size={24} className="text-success" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Territory Details</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Territory Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter territory name"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any, parent_id: '' })}
                className="input-field"
                required
              >
                <option value="country">Country</option>
                <option value="state">State</option>
                <option value="zone">Zone</option>
                <option value="city">City</option>
                <option value="area">Area</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-field"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Parent Territory</label>
              <select
                value={formData.parent_id}
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                className="input-field"
              >
                <option value="">No Parent (Root Level)</option>
                {parentOptions.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.type})</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button type="button" onClick={() => navigate('/master/territories')} className="btn-outline">
            Cancel
          </button>
          <button
            type="submit"
            disabled={createTerritory.isPending || updateTerritory.isPending}
            className="btn-primary flex items-center gap-2"
          >
            {(createTerritory.isPending || updateTerritory.isPending) ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isEdit ? 'Update Territory' : 'Create Territory'}
          </button>
        </div>
      </form>
    </div>
  );
}
