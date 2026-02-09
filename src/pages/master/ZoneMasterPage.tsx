import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { useZones, useStates, useCities, useDeleteZone, Zone } from '@/hooks/useGeoMasterData';
import { useTerritories } from '@/hooks/useTerritoriesData';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Compass, Edit, Trash2, Eye, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function ZoneMasterPage() {
  const navigate = useNavigate();
  const { data: zones = [], isLoading } = useZones();
  const { data: states = [] } = useStates();
  const { data: cities = [] } = useCities();
  const { data: territories = [] } = useTerritories();
  const deleteZone = useDeleteZone();

  const [deleteModal, setDeleteModal] = useState<Zone | null>(null);
  const [zoneTypeFilter, setZoneTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [zoneValues, setZoneValues] = useState<Record<string, string[]>>({});

  // Filter zones
  const filteredData = zones.filter(z => {
    if (zoneTypeFilter !== 'all' && (z as any).zone_type !== zoneTypeFilter) return false;
    if (statusFilter !== 'all' && z.status !== statusFilter) return false;
    return true;
  });

  // Load zone values (linked states/cities/territories)
  useEffect(() => {
    const loadZoneValues = async () => {
      const values: Record<string, string[]> = {};
      
      for (const zone of zones) {
        const zoneType = (zone as any).zone_type || 'state';
        
        if (zoneType === 'state') {
          const { data } = await supabase
            .from('zone_states' as any)
            .select('state_id')
            .eq('zone_id', zone.id);
          if (data) {
            values[zone.id] = data.map((zs: any) => {
              const state = states.find(s => s.id === zs.state_id);
              return state?.name || '';
            }).filter(Boolean);
          }
        } else if (zoneType === 'city') {
          const { data } = await supabase
            .from('zone_cities' as any)
            .select('city_id')
            .eq('zone_id', zone.id);
          if (data) {
            values[zone.id] = data.map((zc: any) => {
              const city = cities.find(c => c.id === zc.city_id);
              return city?.name || '';
            }).filter(Boolean);
          }
        } else if (zoneType === 'territory') {
          const { data } = await supabase
            .from('zone_territories' as any)
            .select('territory_id')
            .eq('zone_id', zone.id);
          if (data) {
            values[zone.id] = data.map((zt: any) => {
              const territory = territories.find(t => t.id === zt.territory_id);
              return territory?.name || '';
            }).filter(Boolean);
          }
        }
      }
      
      setZoneValues(values);
    };

    if (zones.length > 0) {
      loadZoneValues();
    }
  }, [zones, states, cities, territories]);

  const handleDelete = async () => {
    if (deleteModal) {
      await deleteZone.mutateAsync(deleteModal.id);
      setDeleteModal(null);
    }
  };

  const activeCount = zones.filter(z => z.status === 'active').length;
  const inactiveCount = zones.filter(z => z.status === 'inactive').length;

  const getZoneTypeLabel = (zoneType: string) => {
    switch (zoneType) {
      case 'state': return 'State';
      case 'city': return 'City';
      case 'territory': return 'Territory';
      default: return 'State';
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Zone Name',
      render: (item: Zone) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-warning/10">
            <Compass size={18} className="text-warning" />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.name}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    { 
      key: 'zone_type', 
      header: 'Zone Type',
      render: (item: Zone) => (
        <span className="px-2 py-1 bg-muted rounded-lg text-sm font-medium">
          {getZoneTypeLabel((item as any).zone_type || 'state')}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Zone) => <StatusBadge status={item.status} />,
    },
    { 
      key: 'values', 
      header: 'Zone Values',
      render: (item: Zone) => {
        const values = zoneValues[item.id] || [];
        if (values.length === 0) return <span className="text-muted-foreground">-</span>;
        
        const displayValues = values.slice(0, 3);
        const remaining = values.length - 3;
        
        return (
          <div className="flex flex-wrap gap-1">
            {displayValues.map((v, i) => (
              <span key={i} className="px-2 py-0.5 bg-secondary/20 text-secondary rounded text-xs">
                {v}
              </span>
            ))}
            {remaining > 0 && (
              <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">
                +{remaining} more
              </span>
            )}
          </div>
        );
      }
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

      <div className="grid grid-cols-5 gap-4">
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

        <div className="stat-card flex items-center">
          <select
            value={zoneTypeFilter}
            onChange={(e) => setZoneTypeFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Zone Types</option>
            <option value="state">State</option>
            <option value="city">City</option>
            <option value="territory">Territory</option>
          </select>
        </div>

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
