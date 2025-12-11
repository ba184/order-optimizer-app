import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CrudModal, FieldConfig } from '@/components/ui/CrudModal';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { useCities, useCreateCity, useUpdateCity, useDeleteCity, useStates, useCountries, City } from '@/hooks/useGeoMasterData';
import { Plus, Building, Edit, Trash2, Eye, Loader2 } from 'lucide-react';

export default function CityMasterPage() {
  const { data: cities = [], isLoading } = useCities();
  const { data: states = [] } = useStates();
  const { data: countries = [] } = useCountries();
  const createCity = useCreateCity();
  const updateCity = useUpdateCity();
  const deleteCity = useDeleteCity();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<City | null>(null);
  const [selectedItem, setSelectedItem] = useState<City | null>(null);
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>('create');
  const [stateFilter, setStateFilter] = useState<string>('all');

  const filteredData = stateFilter === 'all' 
    ? cities 
    : cities.filter(c => c.state_id === stateFilter);

  const stateOptions = states.map(s => ({ 
    value: s.id, 
    label: `${s.name} (${(s.country as any)?.name || 'Unknown'})`
  }));

  const countryOptions = countries.map(c => ({ value: c.id, label: c.name }));

  const fields: FieldConfig[] = [
    { 
      key: 'country_id', 
      label: 'Country', 
      type: 'select', 
      required: true, 
      options: countryOptions 
    },
    { 
      key: 'state_id', 
      label: 'State', 
      type: 'select', 
      required: true, 
      dependsOn: 'country_id',
      getOptions: (formData) => {
        const filteredStates = states.filter(s => s.country_id === formData.country_id);
        return filteredStates.map(s => ({ value: s.id, label: s.name }));
      }
    },
    { key: 'name', label: 'City Name', type: 'text', required: true, placeholder: 'Enter city name' },
    { key: 'code', label: 'City Code', type: 'text', required: true, placeholder: 'e.g., NDL, MUM' },
    { key: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
  ];

  const handleCreate = () => {
    setSelectedItem(null);
    setMode('create');
    setModalOpen(true);
  };

  const handleView = (item: City) => {
    setSelectedItem(item);
    setMode('view');
    setModalOpen(true);
  };

  const handleEdit = (item: City) => {
    setSelectedItem(item);
    setMode('edit');
    setModalOpen(true);
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    if (mode === 'create') {
      await createCity.mutateAsync({
        name: formData.name,
        code: formData.code,
        state_id: formData.state_id,
        status: formData.status || 'active',
      });
    } else if (selectedItem) {
      await updateCity.mutateAsync({
        id: selectedItem.id,
        name: formData.name,
        code: formData.code,
        state_id: formData.state_id,
        status: formData.status,
      });
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (deleteModal) {
      await deleteCity.mutateAsync(deleteModal.id);
      setDeleteModal(null);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'City',
      render: (item: City) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-info/10">
            <Building size={18} className="text-info" />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.code}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    { 
      key: 'state', 
      header: 'State',
      render: (item: City) => (item.state as any)?.name || '-'
    },
    { 
      key: 'country', 
      header: 'Country',
      render: (item: City) => (item.state as any)?.country?.name || '-'
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: City) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: City) => (
        <div className="flex items-center gap-1">
          <button onClick={() => handleView(item)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Eye size={16} className="text-muted-foreground" />
          </button>
          <button onClick={() => handleEdit(item)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Edit size={16} className="text-muted-foreground" />
          </button>
          <button onClick={() => setDeleteModal(item)} className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
            <Trash2 size={16} className="text-destructive" />
          </button>
        </div>
      ),
    },
  ];

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
          <h1 className="module-title">City Master</h1>
          <p className="text-muted-foreground">Manage cities and locations</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add City
        </button>
      </div>

      <div className="flex items-center gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card flex-1">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-info/10">
              <Building size={24} className="text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{cities.length}</p>
              <p className="text-sm text-muted-foreground">Total Cities</p>
            </div>
          </div>
        </motion.div>

        <div className="w-48">
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All States</option>
            {states.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <DataTable 
        data={filteredData} 
        columns={columns} 
        searchPlaceholder="Search cities..."
        emptyMessage="No cities found. Add your first city to get started."
      />

      <CrudModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={mode === 'create' ? 'Add City' : mode === 'edit' ? 'Edit City' : 'City Details'}
        fields={fields}
        initialData={selectedItem ? { ...selectedItem, country_id: (selectedItem.state as any)?.country_id } : undefined}
        onSubmit={handleSubmit}
        mode={mode}
      />

      <DeleteConfirmModal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
        title="Delete City"
        message={`Are you sure you want to delete "${deleteModal?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
