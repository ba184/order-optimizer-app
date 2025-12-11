import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { useTerritories, useCreateTerritory, useDeleteTerritory, Territory } from '@/hooks/useTerritoriesData';
import {
  Plus,
  MapPin,
  Globe,
  Building,
  Map,
  Navigation,
  Edit,
  Trash2,
  User,
  ChevronRight,
  Loader2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

const typeIcons = {
  country: Globe,
  state: Map,
  zone: Navigation,
  city: Building,
  area: MapPin,
};

const typeColors = {
  country: 'bg-primary/10 text-primary',
  state: 'bg-secondary/10 text-secondary',
  zone: 'bg-success/10 text-success',
  city: 'bg-warning/10 text-warning',
  area: 'bg-info/10 text-info',
};

export default function TerritoriesPage() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const { data: territories = [], isLoading } = useTerritories(selectedType === 'all' ? undefined : selectedType);
  const createTerritory = useCreateTerritory();
  const deleteTerritory = useDeleteTerritory();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'area' as const,
    parent_id: '',
    manager_id: '',
  });

  const handleCreate = async () => {
    if (!formData.name || !formData.type) {
      toast.error('Please fill required fields');
      return;
    }
    await createTerritory.mutateAsync({
      name: formData.name,
      type: formData.type,
      parent_id: formData.parent_id || null,
      manager_id: formData.manager_id || null,
    });
    setShowCreateModal(false);
    setFormData({ name: '', type: 'area', parent_id: '', manager_id: '' });
  };

  const handleDelete = async (id: string) => {
    await deleteTerritory.mutateAsync(id);
  };

  const columns = [
    {
      key: 'name',
      header: 'Territory',
      render: (item: Territory) => {
        const TypeIcon = typeIcons[item.type as keyof typeof typeIcons] || MapPin;
        return (
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[item.type as keyof typeof typeColors] || 'bg-muted'}`}>
              <TypeIcon size={20} />
            </div>
            <div>
              <p className="font-medium text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'hierarchy',
      header: 'Hierarchy',
      render: (item: Territory) => (
        item.parent ? (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>{(item.parent as any)?.name}</span>
            <ChevronRight size={14} />
            <span className="text-foreground">{item.name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">Root Level</span>
        )
      ),
    },
    {
      key: 'manager',
      header: 'Manager',
      render: (item: Territory) => (
        item.manager ? (
          <div className="flex items-center gap-2">
            <User size={14} className="text-muted-foreground" />
            <span>{(item.manager as any)?.name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Territory) => (
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Edit size={16} className="text-muted-foreground" />
          </button>
          <button 
            onClick={() => handleDelete(item.id)}
            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <Trash2 size={16} className="text-destructive" />
          </button>
        </div>
      ),
    },
  ];

  const stats = {
    countries: territories.filter(t => t.type === 'country').length,
    states: territories.filter(t => t.type === 'state').length,
    zones: territories.filter(t => t.type === 'zone').length,
    cities: territories.filter(t => t.type === 'city').length,
    areas: territories.filter(t => t.type === 'area').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="module-title">Territory Management</h1>
          <p className="text-muted-foreground">Manage geographical hierarchy and assignments</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add Territory
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {[
          { type: 'country', label: 'Countries', count: stats.countries, icon: Globe },
          { type: 'state', label: 'States', count: stats.states, icon: Map },
          { type: 'zone', label: 'Zones', count: stats.zones, icon: Navigation },
          { type: 'city', label: 'Cities', count: stats.cities, icon: Building },
          { type: 'area', label: 'Areas', count: stats.areas, icon: MapPin },
        ].map((stat, index) => (
          <motion.div
            key={stat.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`stat-card cursor-pointer ${selectedType === stat.type ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedType(selectedType === stat.type ? 'all' : stat.type)}
          >
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${typeColors[stat.type as keyof typeof typeColors]}`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.count}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <DataTable 
        data={territories} 
        columns={columns} 
        searchPlaceholder="Search territories..."
        emptyMessage="No territories found. Add your first territory to get started."
      />

      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Add Territory</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-muted rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Territory Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="input-field"
                >
                  <option value="country">Country</option>
                  <option value="state">State</option>
                  <option value="zone">Zone</option>
                  <option value="city">City</option>
                  <option value="area">Area</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Parent Territory</label>
                <select
                  value={formData.parent_id}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select Parent</option>
                  {territories.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.type})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="btn-outline">Cancel</button>
              <button 
                onClick={handleCreate} 
                disabled={createTerritory.isPending}
                className="btn-primary"
              >
                {createTerritory.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
