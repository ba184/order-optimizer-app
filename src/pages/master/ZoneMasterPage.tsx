import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { useZones, useDeleteZone, Zone } from '@/hooks/useGeoMasterData';
import { Plus, Compass, Edit, Trash2, Eye, Loader2, CheckCircle, XCircle, Users } from 'lucide-react';

export default function ZoneMasterPage() {
  const navigate = useNavigate();
  const { data: zones = [], isLoading } = useZones();
  const deleteZone = useDeleteZone();

  const [deleteModal, setDeleteModal] = useState<Zone | null>(null);

  const handleDelete = async () => {
    if (deleteModal) {
      await deleteZone.mutateAsync(deleteModal.id);
      setDeleteModal(null);
    }
  };

  const activeCount = zones.filter(z => z.status === 'active').length;
  const inactiveCount = zones.filter(z => z.status === 'inactive').length;
  const withManagerCount = zones.filter(z => z.manager_id).length;

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
          <button onClick={() => navigate(`/master/zones/${item.id}`)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Eye size={16} className="text-muted-foreground" />
          </button>
          <button onClick={() => navigate(`/master/zones/${item.id}/edit`)} className="p-2 hover:bg-muted rounded-lg transition-colors">
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
        <button onClick={() => navigate('/master/zones/new')} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add Zone
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Users size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{withManagerCount}</p>
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
