import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Compass, Globe, Map, Building, MapPin, Edit, Calendar, User, Loader2 } from 'lucide-react';
import { useZones, useStates, useCities } from '@/hooks/useGeoMasterData';
import { useTerritories } from '@/hooks/useTerritoriesData';
import { supabase } from '@/integrations/supabase/client';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { format } from 'date-fns';

export default function ZoneViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: zones = [], isLoading } = useZones();
  const { data: states = [] } = useStates();
  const { data: cities = [] } = useCities();
  const { data: territories = [] } = useTerritories();

  const [linkedStates, setLinkedStates] = useState<string[]>([]);
  const [linkedCities, setLinkedCities] = useState<string[]>([]);
  const [linkedTerritories, setLinkedTerritories] = useState<string[]>([]);
  const [zoneType, setZoneType] = useState<'state' | 'city' | 'territory' | null>(null);

  const zone = zones.find(z => z.id === id);

  useEffect(() => {
    if (id) loadLinkedData();
  }, [id]);

  const loadLinkedData = async () => {
    const { data: zoneStates } = await supabase
      .from('zone_states' as any)
      .select('state_id')
      .eq('zone_id', id);
    if (zoneStates && zoneStates.length > 0) {
      setLinkedStates(zoneStates.map((zs: any) => zs.state_id));
      setZoneType('state');
    }

    const { data: zoneCities } = await supabase
      .from('zone_cities' as any)
      .select('city_id')
      .eq('zone_id', id);
    if (zoneCities && zoneCities.length > 0) {
      setLinkedCities(zoneCities.map((zc: any) => zc.city_id));
      setZoneType('city');
    }

    const { data: zoneTerritories } = await supabase
      .from('zone_territories' as any)
      .select('territory_id')
      .eq('zone_id', id);
    if (zoneTerritories && zoneTerritories.length > 0) {
      setLinkedTerritories(zoneTerritories.map((zt: any) => zt.territory_id));
      setZoneType('territory');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!zone) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Zone not found</p>
        <button onClick={() => navigate('/master/zones')} className="btn-primary mt-4">
          Back to Zones
        </button>
      </div>
    );
  }

  const stateNames = linkedStates.map(id => states.find(s => s.id === id)?.name).filter(Boolean);
  const cityNames = linkedCities.map(id => cities.find(c => c.id === id)?.name).filter(Boolean);
  const territoryNames = linkedTerritories.map(id => territories.find(t => t.id === id)?.name).filter(Boolean);

  const getZoneTypeLabel = () => {
    switch (zoneType) {
      case 'state': return 'State Zone';
      case 'city': return 'City Zone';
      case 'territory': return 'Territory Zone';
      default: return 'Zone';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/master/zones')} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <Compass size={28} className="text-warning" />
              <h1 className="module-title">{zone.name}</h1>
            </div>
            <p className="text-muted-foreground">{zone.code} • {getZoneTypeLabel()}</p>
          </div>
        </div>
        <button onClick={() => navigate(`/master/zones/${id}/edit`)} className="btn-primary flex items-center gap-2">
          <Edit size={18} />
          Edit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 lg:col-span-2"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Zone Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Zone Name</p>
              <p className="font-medium text-foreground">{zone.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Zone Code</p>
              <p className="font-mono font-medium text-primary">{zone.code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Zone Type</p>
              <p className="font-medium text-foreground capitalize">{getZoneTypeLabel()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Country</p>
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-muted-foreground" />
                <span className="font-medium text-foreground">{(zone.country as any)?.name || '-'}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Manager</p>
              <div className="flex items-center gap-2">
                <User size={16} className="text-muted-foreground" />
                <span className="font-medium text-foreground">{(zone.manager as any)?.name || 'Not assigned'}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <StatusBadge status={zone.status} />
            </div>
          </div>
        </motion.div>

        {/* Linked Entities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          {zoneType === 'state' && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <Map size={20} className="text-secondary" />
                <h2 className="text-lg font-semibold text-foreground">Linked States ({stateNames.length})</h2>
              </div>
              {stateNames.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {stateNames.map((name, idx) => (
                    <span key={idx} className="px-3 py-1 bg-secondary/20 text-secondary rounded-lg text-sm">
                      {name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No states linked</p>
              )}
            </>
          )}

          {zoneType === 'city' && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <Building size={20} className="text-info" />
                <h2 className="text-lg font-semibold text-foreground">Linked Cities ({cityNames.length})</h2>
              </div>
              {cityNames.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {cityNames.map((name, idx) => (
                    <span key={idx} className="px-3 py-1 bg-info/20 text-info rounded-lg text-sm">
                      {name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No cities linked</p>
              )}
            </>
          )}

          {zoneType === 'territory' && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <MapPin size={20} className="text-success" />
                <h2 className="text-lg font-semibold text-foreground">Linked Territories ({territoryNames.length})</h2>
              </div>
              {territoryNames.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {territoryNames.map((name, idx) => (
                    <span key={idx} className="px-3 py-1 bg-success/20 text-success rounded-lg text-sm">
                      {name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No territories linked</p>
              )}
            </>
          )}

          {!zoneType && (
            <p className="text-muted-foreground text-sm">No entities linked to this zone</p>
          )}
        </motion.div>

        {/* Timestamps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6 lg:col-span-3"
        >
          <div className="flex items-center gap-3 mb-4">
            <Calendar size={20} className="text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Timeline</h2>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="font-medium">{format(new Date(zone.created_at), 'PPpp')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">{format(new Date(zone.updated_at), 'PPpp')}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
