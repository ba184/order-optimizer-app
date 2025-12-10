import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CrudModal, FieldConfig } from '@/components/ui/CrudModal';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { Plus, Building, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface City {
  id: string;
  name: string;
  code: string;
  state: string;
  country: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

const statesData: Record<string, { value: string; label: string }[]> = {
  'India': [
    { value: 'Delhi NCR', label: 'Delhi NCR' },
    { value: 'Maharashtra', label: 'Maharashtra' },
    { value: 'Karnataka', label: 'Karnataka' },
    { value: 'West Bengal', label: 'West Bengal' },
  ],
  'United States': [
    { value: 'California', label: 'California' },
    { value: 'New York', label: 'New York' },
  ],
};

const countries = [
  { value: 'India', label: 'India' },
  { value: 'United States', label: 'United States' },
];

const initialData: City[] = [
  { id: '1', name: 'New Delhi', code: 'NDL', state: 'Delhi NCR', country: 'India', status: 'active', createdAt: '2024-01-01' },
  { id: '2', name: 'Mumbai', code: 'MUM', state: 'Maharashtra', country: 'India', status: 'active', createdAt: '2024-01-01' },
  { id: '3', name: 'Bangalore', code: 'BLR', state: 'Karnataka', country: 'India', status: 'active', createdAt: '2024-01-01' },
  { id: '4', name: 'Kolkata', code: 'KOL', state: 'West Bengal', country: 'India', status: 'active', createdAt: '2024-01-01' },
  { id: '5', name: 'Pune', code: 'PUN', state: 'Maharashtra', country: 'India', status: 'active', createdAt: '2024-01-01' },
  { id: '6', name: 'Gurgaon', code: 'GGN', state: 'Delhi NCR', country: 'India', status: 'active', createdAt: '2024-01-01' },
];

export default function CityMasterPage() {
  const [data, setData] = useState<City[]>(initialData);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<City | null>(null);
  const [selectedItem, setSelectedItem] = useState<City | null>(null);
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>('create');
  const [stateFilter, setStateFilter] = useState<string>('all');

  const filteredData = stateFilter === 'all' ? data : data.filter(c => c.state === stateFilter);

  const fields: FieldConfig[] = [
    { key: 'country', label: 'Country', type: 'select', required: true, options: countries },
    { 
      key: 'state', 
      label: 'State', 
      type: 'select', 
      required: true, 
      dependsOn: 'country',
      getOptions: (formData) => statesData[formData.country] || []
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

  const handleSubmit = (formData: Record<string, any>) => {
    if (mode === 'create') {
      const newItem: City = {
        id: Date.now().toString(),
        name: formData.name,
        code: formData.code,
        state: formData.state,
        country: formData.country,
        status: formData.status || 'active',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setData([...data, newItem]);
      toast.success('City created successfully');
    } else {
      setData(data.map(item => item.id === selectedItem?.id ? { ...item, ...formData } : item));
      toast.success('City updated successfully');
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteModal) {
      setData(data.filter(item => item.id !== deleteModal.id));
      toast.success('City deleted successfully');
      setDeleteModal(null);
    }
  };

  const allStates = Object.values(statesData).flat();

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
    { key: 'state', header: 'State' },
    { key: 'country', header: 'Country' },
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card flex-1"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-info/10">
              <Building size={24} className="text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{data.length}</p>
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
            {allStates.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <DataTable data={filteredData} columns={columns} searchPlaceholder="Search cities..." />

      <CrudModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={mode === 'create' ? 'Add City' : mode === 'edit' ? 'Edit City' : 'City Details'}
        fields={fields}
        initialData={selectedItem || undefined}
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
