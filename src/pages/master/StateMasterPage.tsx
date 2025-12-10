import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CrudModal, FieldConfig } from '@/components/ui/CrudModal';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { Plus, Map, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface State {
  id: string;
  name: string;
  code: string;
  country: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

const countries = [
  { value: 'India', label: 'India' },
  { value: 'United States', label: 'United States' },
  { value: 'United Kingdom', label: 'United Kingdom' },
];

const initialData: State[] = [
  { id: '1', name: 'Delhi NCR', code: 'DL', country: 'India', status: 'active', createdAt: '2024-01-01' },
  { id: '2', name: 'Maharashtra', code: 'MH', country: 'India', status: 'active', createdAt: '2024-01-01' },
  { id: '3', name: 'Karnataka', code: 'KA', country: 'India', status: 'active', createdAt: '2024-01-01' },
  { id: '4', name: 'West Bengal', code: 'WB', country: 'India', status: 'active', createdAt: '2024-01-01' },
  { id: '5', name: 'Tamil Nadu', code: 'TN', country: 'India', status: 'active', createdAt: '2024-01-01' },
  { id: '6', name: 'California', code: 'CA', country: 'United States', status: 'active', createdAt: '2024-01-01' },
];

const fields: FieldConfig[] = [
  { key: 'country', label: 'Country', type: 'select', required: true, options: countries },
  { key: 'name', label: 'State Name', type: 'text', required: true, placeholder: 'Enter state name' },
  { key: 'code', label: 'State Code', type: 'text', required: true, placeholder: 'e.g., DL, MH' },
  { key: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
];

export default function StateMasterPage() {
  const [data, setData] = useState<State[]>(initialData);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<State | null>(null);
  const [selectedItem, setSelectedItem] = useState<State | null>(null);
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>('create');
  const [countryFilter, setCountryFilter] = useState<string>('all');

  const filteredData = countryFilter === 'all' ? data : data.filter(s => s.country === countryFilter);

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

  const handleSubmit = (formData: Record<string, any>) => {
    if (mode === 'create') {
      const newItem: State = {
        id: Date.now().toString(),
        name: formData.name,
        code: formData.code,
        country: formData.country,
        status: formData.status || 'active',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setData([...data, newItem]);
      toast.success('State created successfully');
    } else {
      setData(data.map(item => item.id === selectedItem?.id ? { ...item, ...formData } : item));
      toast.success('State updated successfully');
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteModal) {
      setData(data.filter(item => item.id !== deleteModal.id));
      toast.success('State deleted successfully');
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
    { key: 'country', header: 'Country' },
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card flex-1"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10">
              <Map size={24} className="text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{data.length}</p>
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
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <DataTable data={filteredData} columns={columns} searchPlaceholder="Search states..." />

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
