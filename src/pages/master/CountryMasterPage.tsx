import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { useCountries, useDeleteCountry, Country } from '@/hooks/useGeoMasterData';
import { Plus, Globe, Edit, Trash2, Eye, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function CountryMasterPage() {
  const navigate = useNavigate();
  const { data: countries = [], isLoading } = useCountries();
  const deleteCountry = useDeleteCountry();

  const [deleteModal, setDeleteModal] = useState<Country | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredData = statusFilter === 'all' 
    ? countries 
    : countries.filter(c => c.status === statusFilter);

  const handleDelete = async () => {
    if (deleteModal) {
      await deleteCountry.mutateAsync(deleteModal.id);
      setDeleteModal(null);
    }
  };

  const activeCount = countries.filter(c => c.status === 'active').length;
  const inactiveCount = countries.filter(c => c.status === 'inactive').length;

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
          <button onClick={() => navigate(`/master/countries/${item.id}`)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Eye size={16} className="text-muted-foreground" />
          </button>
          <button onClick={() => navigate(`/master/countries/${item.id}/edit`)} className="p-2 hover:bg-muted rounded-lg transition-colors">
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
          <h1 className="module-title">Country Master</h1>
          <p className="text-muted-foreground">Manage countries in the system</p>
        </div>
        <button onClick={() => navigate('/master/countries/new')} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add Country
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Globe size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{countries.length}</p>
              <p className="text-sm text-muted-foreground">Total Countries</p>
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <DataTable 
        data={filteredData} 
        columns={columns} 
        searchPlaceholder="Search countries..."
        emptyMessage="No countries found. Add your first country to get started."
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
