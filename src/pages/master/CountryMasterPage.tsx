import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CrudModal, FieldConfig } from '@/components/ui/CrudModal';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { Plus, Globe, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Country {
  id: string;
  name: string;
  code: string;
  currency: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

const initialData: Country[] = [
  { id: '1', name: 'India', code: 'IN', currency: 'INR', status: 'active', createdAt: '2024-01-01' },
  { id: '2', name: 'United States', code: 'US', currency: 'USD', status: 'active', createdAt: '2024-01-01' },
  { id: '3', name: 'United Kingdom', code: 'UK', currency: 'GBP', status: 'active', createdAt: '2024-01-01' },
];

const fields: FieldConfig[] = [
  { key: 'name', label: 'Country Name', type: 'text', required: true, placeholder: 'Enter country name' },
  { key: 'code', label: 'Country Code', type: 'text', required: true, placeholder: 'e.g., IN, US' },
  { key: 'currency', label: 'Currency', type: 'text', required: true, placeholder: 'e.g., INR, USD' },
  { key: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
];

export default function CountryMasterPage() {
  const [data, setData] = useState<Country[]>(initialData);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<Country | null>(null);
  const [selectedItem, setSelectedItem] = useState<Country | null>(null);
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>('create');

  const handleCreate = () => {
    setSelectedItem(null);
    setMode('create');
    setModalOpen(true);
  };

  const handleView = (item: Country) => {
    setSelectedItem(item);
    setMode('view');
    setModalOpen(true);
  };

  const handleEdit = (item: Country) => {
    setSelectedItem(item);
    setMode('edit');
    setModalOpen(true);
  };

  const handleSubmit = (formData: Record<string, any>) => {
    if (mode === 'create') {
      const newItem: Country = {
        id: Date.now().toString(),
        name: formData.name,
        code: formData.code,
        currency: formData.currency,
        status: formData.status || 'active',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setData([...data, newItem]);
      toast.success('Country created successfully');
    } else {
      setData(data.map(item => item.id === selectedItem?.id ? { ...item, ...formData } : item));
      toast.success('Country updated successfully');
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteModal) {
      setData(data.filter(item => item.id !== deleteModal.id));
      toast.success('Country deleted successfully');
      setDeleteModal(null);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Country',
      render: (item: Country) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Globe size={18} className="text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.code}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    { key: 'currency', header: 'Currency' },
    {
      key: 'status',
      header: 'Status',
      render: (item: Country) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Country) => (
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

  return (
    <div className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="module-title">Country Master</h1>
          <p className="text-muted-foreground">Manage countries in the system</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add Country
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="stat-card"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Globe size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{data.length}</p>
            <p className="text-sm text-muted-foreground">Total Countries</p>
          </div>
        </div>
      </motion.div>

      <DataTable data={data} columns={columns} searchPlaceholder="Search countries..." />

      <CrudModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={mode === 'create' ? 'Add Country' : mode === 'edit' ? 'Edit Country' : 'Country Details'}
        fields={fields}
        initialData={selectedItem || undefined}
        onSubmit={handleSubmit}
        mode={mode}
      />

      <DeleteConfirmModal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
        title="Delete Country"
        message={`Are you sure you want to delete "${deleteModal?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
