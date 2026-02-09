import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { useStates, useDeleteState, useCountries, State } from '@/hooks/useGeoMasterData';
import { Plus, Map, Edit, Trash2, Eye, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function StateMasterPage() {
  const navigate = useNavigate();
  const { data: states = [], isLoading } = useStates();
  const { data: countries = [] } = useCountries();
  const deleteState = useDeleteState();

  const [deleteModal, setDeleteModal] = useState<State | null>(null);
  const [countryFilter, setCountryFilter] = useState<string>('all');

  const filteredData = countryFilter === 'all' 
    ? states 
    : states.filter(s => s.country_id === countryFilter);

  const handleDelete = async () => {
    if (deleteModal) {
      await deleteState.mutateAsync(deleteModal.id);
      setDeleteModal(null);
    }
  };

  const activeCount = states.filter(s => s.status === 'active').length;
  const inactiveCount = states.filter(s => s.status === 'inactive').length;

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
          <button onClick={() => navigate(`/master/states/${item.id}`)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Eye size={16} className="text-muted-foreground" />
          </button>
          <button onClick={() => navigate(`/master/states/${item.id}/edit`)} className="p-2 hover:bg-muted rounded-lg transition-colors">
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
        <button onClick={() => navigate('/master/states/new')} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add State
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
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
