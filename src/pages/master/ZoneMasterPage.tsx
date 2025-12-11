import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CrudModal, FieldConfig } from '@/components/ui/CrudModal';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { useZones, useCreateZone, useUpdateZone, useDeleteZone, useCountries, Zone } from '@/hooks/useGeoMasterData';
import { Plus, Compass, Edit, Trash2, Eye, Users, Loader2 } from 'lucide-react';

export default function ZoneMasterPage() {
  const { data: zones = [], isLoading } = useZones();
  const { data: countries = [] } = useCountries();
  const createZone = useCreateZone();
  const updateZone = useUpdateZone();
  const deleteZone = useDeleteZone();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<Zone | null>(null);
  const [selectedItem, setSelectedItem] = useState<Zone | null>(null);
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>('create');

  const countryOptions = countries.map(c => ({ value: c.id, label: c.name }));

  const fields: FieldConfig[] = [
    { key: 'country_id', label: 'Country', type: 'select', required: true, options: countryOptions },
    { key: 'name', label: 'Zone Name', type: 'text', required: true, placeholder: 'e.g., North Zone' },
    { key: 'code', label: 'Zone Code', type: 'text', required: true, placeholder: 'e.g., NZ' },
    { key: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
  ];

  const handleCreate = () => {
    setSelectedItem(null);
    setMode('create');
    setModalOpen(true);
  };

  const handleView = (item: Zone) => {
    setSelectedItem(item);
    setMode('view');
    setModalOpen(true);
  };

  const handleEdit = (item: Zone) => {
    setSelectedItem(item);
    setMode('edit');
    setModalOpen(true);
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    if (mode === 'create') {
      await createZone.mutateAsync({
        name: formData.name,
        code: formData.code,
        country_id: formData.country_id,
        status: formData.status || 'active',
      });
    } else if (selectedItem) {
      await updateZone.mutateAsync({
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
      await deleteZone.mutateAsync(deleteModal.id);
      setDeleteModal(null);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Zone',
      render: (item: Zone) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-warning/10">
            <Compass size={18} className="text-warning" />
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
      render: (item: Zone) => (item.country as any)?.name || '-'
    },
    { 
      key: 'manager', 
      header: 'Manager', 
      render: (item: Zone) => (item.manager as any)?.name || '-' 
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Zone) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Zone) => (
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
          <h1 className="module-title">Zone Master</h1>
          <p className="text-muted-foreground">Manage sales zones and regions</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add Zone
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <Compass size={24} className="text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{zones.length}</p>
              <p className="text-sm text-muted-foreground">Total Zones</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Users size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{zones.filter(z => z.manager_id).length}</p>
              <p className="text-sm text-muted-foreground">With Managers</p>
            </div>
          </div>
        </motion.div>
      </div>

      <DataTable 
        data={zones} 
        columns={columns} 
        searchPlaceholder="Search zones..."
        emptyMessage="No zones found. Add your first zone to get started."
      />

      <CrudModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={mode === 'create' ? 'Add Zone' : mode === 'edit' ? 'Edit Zone' : 'Zone Details'}
        fields={fields}
        initialData={selectedItem || undefined}
        onSubmit={handleSubmit}
        mode={mode}
      />

      <DeleteConfirmModal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
        title="Delete Zone"
        message={`Are you sure you want to delete "${deleteModal?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
