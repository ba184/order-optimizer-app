import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CrudModal, FieldConfig } from '@/components/ui/CrudModal';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { Plus, Compass, Edit, Trash2, Eye, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Zone {
  id: string;
  name: string;
  code: string;
  country: string;
  states: string[];
  manager?: string;
  employeeCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

const countries = [
  { value: 'India', label: 'India' },
  { value: 'United States', label: 'United States' },
];

const statesData: Record<string, { value: string; label: string }[]> = {
  'India': [
    { value: 'Delhi NCR', label: 'Delhi NCR' },
    { value: 'Maharashtra', label: 'Maharashtra' },
    { value: 'Karnataka', label: 'Karnataka' },
    { value: 'West Bengal', label: 'West Bengal' },
    { value: 'Tamil Nadu', label: 'Tamil Nadu' },
    { value: 'Gujarat', label: 'Gujarat' },
    { value: 'Rajasthan', label: 'Rajasthan' },
  ],
  'United States': [
    { value: 'California', label: 'California' },
    { value: 'New York', label: 'New York' },
    { value: 'Texas', label: 'Texas' },
  ],
};

const initialData: Zone[] = [
  { id: '1', name: 'North Zone', code: 'NZ', country: 'India', states: ['Delhi NCR', 'Rajasthan'], manager: 'Rajesh Kumar', employeeCount: 45, status: 'active', createdAt: '2024-01-01' },
  { id: '2', name: 'South Zone', code: 'SZ', country: 'India', states: ['Karnataka', 'Tamil Nadu'], manager: 'Priya Sharma', employeeCount: 38, status: 'active', createdAt: '2024-01-01' },
  { id: '3', name: 'East Zone', code: 'EZ', country: 'India', states: ['West Bengal'], manager: 'Amit Das', employeeCount: 22, status: 'active', createdAt: '2024-01-01' },
  { id: '4', name: 'West Zone', code: 'WZ', country: 'India', states: ['Maharashtra', 'Gujarat'], manager: 'Vikram Patel', employeeCount: 52, status: 'active', createdAt: '2024-01-01' },
];

const managers = [
  { value: 'Rajesh Kumar', label: 'Rajesh Kumar (RSM)' },
  { value: 'Priya Sharma', label: 'Priya Sharma (RSM)' },
  { value: 'Amit Das', label: 'Amit Das (RSM)' },
  { value: 'Vikram Patel', label: 'Vikram Patel (RSM)' },
];

export default function ZoneMasterPage() {
  const [data, setData] = useState<Zone[]>(initialData);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<Zone | null>(null);
  const [selectedItem, setSelectedItem] = useState<Zone | null>(null);
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>('create');

  const fields: FieldConfig[] = [
    { key: 'country', label: 'Country', type: 'select', required: true, options: countries },
    { key: 'name', label: 'Zone Name', type: 'text', required: true, placeholder: 'e.g., North Zone' },
    { key: 'code', label: 'Zone Code', type: 'text', required: true, placeholder: 'e.g., NZ' },
    { key: 'manager', label: 'Zone Manager', type: 'select', options: managers },
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

  const handleSubmit = (formData: Record<string, any>) => {
    if (mode === 'create') {
      const newItem: Zone = {
        id: Date.now().toString(),
        name: formData.name,
        code: formData.code,
        country: formData.country,
        states: [],
        manager: formData.manager,
        employeeCount: 0,
        status: formData.status || 'active',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setData([...data, newItem]);
      toast.success('Zone created successfully');
    } else {
      setData(data.map(item => item.id === selectedItem?.id ? { ...item, ...formData } : item));
      toast.success('Zone updated successfully');
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteModal) {
      setData(data.filter(item => item.id !== deleteModal.id));
      toast.success('Zone deleted successfully');
      setDeleteModal(null);
    }
  };

  const totalEmployees = data.reduce((sum, z) => sum + z.employeeCount, 0);

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
    { key: 'country', header: 'Country' },
    {
      key: 'states',
      header: 'States',
      render: (item: Zone) => (
        <span className="text-sm">{item.states.join(', ') || '-'}</span>
      ),
    },
    { key: 'manager', header: 'Manager', render: (item: Zone) => item.manager || '-' },
    {
      key: 'employeeCount',
      header: 'Employees',
      render: (item: Zone) => (
        <div className="flex items-center gap-2">
          <Users size={14} className="text-muted-foreground" />
          <span>{item.employeeCount}</span>
        </div>
      ),
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <Compass size={24} className="text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{data.length}</p>
              <p className="text-sm text-muted-foreground">Total Zones</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Users size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalEmployees}</p>
              <p className="text-sm text-muted-foreground">Total Employees</p>
            </div>
          </div>
        </motion.div>
      </div>

      <DataTable data={data} columns={columns} searchPlaceholder="Search zones..." />

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
