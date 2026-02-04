import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { useTerritories, useDeleteTerritory, Territory } from '@/hooks/useTerritoriesData';
import {
  Plus,
  MapPin,
  Globe,
  Building,
  Map,
  Navigation,
  Edit,
  Trash2,
  Eye,
  User,
  ChevronRight,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const typeIcons = {
  country: Globe,
  state: Map,
  zone: Navigation,
  city: Building,
  area: MapPin,
};

const typeColors = {
  country: 'bg-primary/10 text-primary',
  state: 'bg-secondary/10 text-secondary',
  zone: 'bg-success/10 text-success',
  city: 'bg-warning/10 text-warning',
  area: 'bg-info/10 text-info',
};

export default function TerritoriesPage() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string>('all');
  const { data: territories = [], isLoading } = useTerritories(selectedType === 'all' ? undefined : selectedType);
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

  const columns = [
    {
      key: 'name',
      header: 'Territory',
      render: (item: Territory) => {
        const TypeIcon = typeIcons[item.type as keyof typeof typeIcons] || MapPin;
        return (
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[item.type as keyof typeof typeColors] || 'bg-muted'}`}>
              <TypeIcon size={20} />
            </div>
            <div>
              <p className="font-medium text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'hierarchy',
      header: 'Hierarchy',
      render: (item: Territory) => (
        item.parent ? (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>{(item.parent as any)?.name}</span>
            <ChevronRight size={14} />
            <span className="text-foreground">{item.name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">Root Level</span>
        )
      ),
    },
    {
      key: 'manager',
      header: 'Manager',
      render: (item: Territory) => (
        item.manager ? (
          <div className="flex items-center gap-2">
            <User size={14} className="text-muted-foreground" />
            <span>{(item.manager as any)?.name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
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
          <p className="text-muted-foreground">Manage geographical hierarchy and assignments</p>
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

      {/* Type filter chips */}
      <div className="flex flex-wrap gap-2">
        {[
          { type: 'all', label: 'All', icon: MapPin },
          { type: 'country', label: 'Countries', icon: Globe },
          { type: 'state', label: 'States', icon: Map },
          { type: 'zone', label: 'Zones', icon: Navigation },
          { type: 'city', label: 'Cities', icon: Building },
          { type: 'area', label: 'Areas', icon: MapPin },
        ].map((item) => (
          <button
            key={item.type}
            onClick={() => setSelectedType(item.type)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedType === item.type
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
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
