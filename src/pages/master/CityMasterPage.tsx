import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { useCities, useDeleteCity, useStates, City } from '@/hooks/useGeoMasterData';
import { Plus, Building, Edit, Trash2, Eye, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function CityMasterPage() {
  const navigate = useNavigate();
  const { data: cities = [], isLoading } = useCities();
  const { data: states = [] } = useStates();
  const deleteCity = useDeleteCity();

  const [deleteModal, setDeleteModal] = useState<City | null>(null);
  const [stateFilter, setStateFilter] = useState<string>('all');

  const filteredData = stateFilter === 'all' 
    ? cities 
    : cities.filter(c => c.state_id === stateFilter);

  const handleDelete = async () => {
    if (deleteModal) {
      await deleteCity.mutateAsync(deleteModal.id);
      setDeleteModal(null);
    }
  };

  const activeCount = cities.filter(c => c.status === 'active').length;
  const inactiveCount = cities.filter(c => c.status === 'inactive').length;

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
          <button onClick={() => navigate(`/master/cities/${item.id}`)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Eye size={16} className="text-muted-foreground" />
          </button>
          <button onClick={() => navigate(`/master/cities/${item.id}/edit`)} className="p-2 hover:bg-muted rounded-lg transition-colors">
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
        <button onClick={() => navigate('/master/cities/new')} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add City
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <CheckCircle size={24} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{activeCount}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/10">
              <XCircle size={24} className="text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{inactiveCount}</p>
              <p className="text-sm text-muted-foreground">Inactive</p>
            </div>
          </div>
        </motion.div>

        <div className="stat-card flex items-center">
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
