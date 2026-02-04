import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, MapPin } from 'lucide-react';
import { useTerritories, useCreateTerritory, useUpdateTerritory } from '@/hooks/useTerritoriesData';
import { toast } from 'sonner';

const territoryTypeOptions = [
  { value: 'region', label: 'Region' },
  { value: 'district', label: 'District' },
  { value: 'area', label: 'Area' },
  { value: 'beat', label: 'Beat' },
];

export default function TerritoryFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: territories = [], isLoading: isLoadingTerritories } = useTerritories();
  const createTerritory = useCreateTerritory();
  const updateTerritory = useUpdateTerritory();

  const [formData, setFormData] = useState({
    name: '',
    type: 'region',
    parent_id: '',
    status: 'active' as 'active' | 'inactive',
  });

  const existingTerritory = territories.find(t => t.id === id);

  useEffect(() => {
    if (existingTerritory) {
      setFormData({
        name: existingTerritory.name,
        type: existingTerritory.type || 'region',
        parent_id: existingTerritory.parent_id || '',
        status: existingTerritory.status as 'active' | 'inactive',
      });
    }
  }, [existingTerritory]);

  const parentTerritories = territories.filter(t => t.id !== id && t.status === 'active');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      const data = {
        name: formData.name,
        type: formData.type as any,
        parent_id: formData.parent_id || null,
        status: formData.status,
      };

      if (isEdit && id) {
        await updateTerritory.mutateAsync({ id, ...data });
      } else {
        await createTerritory.mutateAsync(data);
      }
      navigate('/master/territories');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isSubmitting = createTerritory.isPending || updateTerritory.isPending;

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
            <label className="text-sm font-medium text-foreground">Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="input-field w-full"
              required
            >
              {territoryTypeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Parent Territory</label>
            <select
              value={formData.parent_id}
              onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
              className="input-field w-full"
            >
              <option value="">None (Top Level)</option>
              {parentTerritories.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.type})</option>
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
            onClick={() => navigate('/master/territories')}
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
            {isEdit ? 'Update' : 'Create'} Territory
          </button>
        </div>
      </motion.form>
    </div>
  );
}
