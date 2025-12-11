import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CrudModal, FieldConfig } from '@/components/ui/CrudModal';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { useStates, useCreateState, useUpdateState, useDeleteState, useCountries, State } from '@/hooks/useGeoMasterData';
import { Plus, Map, Edit, Trash2, Eye, Loader2 } from 'lucide-react';

export default function StateMasterPage() {
  const { data: states = [], isLoading } = useStates();
  const { data: countries = [] } = useCountries();
  const createState = useCreateState();
  const updateState = useUpdateState();
  const deleteState = useDeleteState();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<State | null>(null);
  const [selectedItem, setSelectedItem] = useState<State | null>(null);
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>('create');
  const [countryFilter, setCountryFilter] = useState<string>('all');

  const filteredData = countryFilter === 'all' 
    ? states 
    : states.filter(s => s.country_id === countryFilter);

  const countryOptions = countries.map(c => ({ value: c.id, label: c.name }));

  const fields: FieldConfig[] = [
    { key: 'country_id', label: 'Country', type: 'select', required: true, options: countryOptions },
    { key: 'name', label: 'State Name', type: 'text', required: true, placeholder: 'Enter state name' },
    { key: 'code', label: 'State Code', type: 'text', required: true, placeholder: 'e.g., DL, MH' },
    { key: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
  ];

  const handleCreate = () => {
    setSelectedItem(null);
    setMode('create');
    setModalOpen(true);
  };

  const handleView = (item: State) => {
    setSelectedItem(item);
    setMode('view');
    setModalOpen(true);
  };

  const handleEdit = (item: State) => {
    setSelectedItem(item);
    setMode('edit');
    setModalOpen(true);
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    if (mode === 'create') {
      await createState.mutateAsync({
        name: formData.name,
        code: formData.code,
        country_id: formData.country_id,
        status: formData.status || 'active',
      });
    } else if (selectedItem) {
      await updateState.mutateAsync({
        id: selectedItem.id,
        name: formData.name,
        code: formData.code,
        country_id: formData.country_id,
        status: formData.status,
      });
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (deleteModal) {
      await deleteState.mutateAsync(deleteModal.id);
      setDeleteModal(null);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'State',
      render: (item: State) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary/10">
            <Map size={18} className="text-secondary" />
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
      key: 'country', 
      header: 'Country',
      render: (item: State) => (item.country as any)?.name || '-'
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: State) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: State) => (
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
          <h1 className="module-title">State Master</h1>
          <p className="text-muted-foreground">Manage states and provinces</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add State
        </button>
      </div>

      <div className="flex items-center gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card flex-1">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10">
              <Map size={24} className="text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{states.length}</p>
              <p className="text-sm text-muted-foreground">Total States</p>
            </div>
          </div>
        </motion.div>

        <div className="w-48">
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Countries</option>
            {countries.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <DataTable 
        data={filteredData} 
        columns={columns} 
        searchPlaceholder="Search states..."
        emptyMessage="No states found. Add your first state to get started."
      />

      <CrudModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={mode === 'create' ? 'Add State' : mode === 'edit' ? 'Edit State' : 'State Details'}
        fields={fields}
        initialData={selectedItem || undefined}
        onSubmit={handleSubmit}
        mode={mode}
      />

      <DeleteConfirmModal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
        title="Delete State"
        message={`Are you sure you want to delete "${deleteModal?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
