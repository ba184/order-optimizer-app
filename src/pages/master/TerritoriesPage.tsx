import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { useTerritories, useDeleteTerritory, Territory } from '@/hooks/useTerritoriesData';
import { useCountries, useStates, useCities } from '@/hooks/useGeoMasterData';
import {
  Plus,
  MapPin,
  Edit,
  Trash2,
  Eye,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export default function TerritoriesPage() {
  const navigate = useNavigate();
  const { data: territories = [], isLoading } = useTerritories();
  const { data: countries = [] } = useCountries();
  const { data: states = [] } = useStates();
  const { data: cities = [] } = useCities();
  const deleteTerritory = useDeleteTerritory();

  const [deleteModal, setDeleteModal] = useState<Territory | null>(null);

  const handleDelete = async () => {
    if (deleteModal) {
      await deleteTerritory.mutateAsync(deleteModal.id);
      setDeleteModal(null);
    }
  };

  const activeCount = territories.filter(t => t.status === 'active').length;
  const inactiveCount = territories.filter(t => t.status === 'inactive').length;

  // Helper functions to get names
  const getCountryName = (countryId: string) => {
    const country = countries.find(c => c.id === countryId);
    return country?.name || '-';
  };

  const getStateName = (stateId: string) => {
    const state = states.find(s => s.id === stateId);
    return state?.name || '-';
  };

  const getCityName = (cityId: string) => {
    const city = cities.find(c => c.id === cityId);
    return city?.name || '-';
  };

  const columns = [
    {
      key: 'name',
      header: 'Territory',
      render: (item: Territory) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-success/10 text-success">
            <MapPin size={20} />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.name}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'country',
      header: 'Country',
      render: (item: Territory) => (
        <span className="text-foreground">{getCountryName((item as any).country_id)}</span>
      ),
    },
    {
      key: 'state',
      header: 'State',
      render: (item: Territory) => (
        <span className="text-foreground">{getStateName((item as any).state_id)}</span>
      ),
    },
    {
      key: 'city',
      header: 'City',
      render: (item: Territory) => (
        <span className="text-foreground">{getCityName((item as any).city_id)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Territory) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Territory) => (
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(`/master/territories/${item.id}`)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Eye size={16} className="text-muted-foreground" />
          </button>
          <button onClick={() => navigate(`/master/territories/${item.id}/edit`)} className="p-2 hover:bg-muted rounded-lg transition-colors">
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
          <h1 className="module-title">Territory Management</h1>
          <p className="text-muted-foreground">Manage geographical territories and assignments</p>
        </div>
        <button onClick={() => navigate('/master/territories/new')} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add Territory
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <MapPin size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{territories.length}</p>
              <p className="text-sm text-muted-foreground">Total Territories</p>
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
      </div>

      <DataTable 
        data={territories} 
        columns={columns} 
        searchPlaceholder="Search territories..."
        emptyMessage="No territories found. Add your first territory to get started."
      />

      <DeleteConfirmModal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
        title="Delete Territory"
        message={`Are you sure you want to delete "${deleteModal?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
