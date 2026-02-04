import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Compass, Save, Loader2, X } from 'lucide-react';
import { useZones, useStates, useCountries, useCities, useCreateZone, useUpdateZone } from '@/hooks/useGeoMasterData';
import { useTerritories } from '@/hooks/useTerritoriesData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ZoneFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { data: zones = [], isLoading: isLoadingZones } = useZones();
  const { data: countries = [] } = useCountries();
  const { data: states = [] } = useStates();
  const { data: cities = [] } = useCities();
  const { data: territories = [] } = useTerritories();
  const createZone = useCreateZone();
  const updateZone = useUpdateZone();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    country_id: '',
    status: 'active' as 'active' | 'inactive',
  });

  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedTerritories, setSelectedTerritories] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const existingZone = zones.find(z => z.id === id);

  useEffect(() => {
    if (isEdit && existingZone) {
      setFormData({
        name: existingZone.name,
        code: existingZone.code,
        country_id: existingZone.country_id,
        status: existingZone.status,
      });
      // Fetch linked states, cities, territories
      loadLinkedData();
    }
  }, [isEdit, existingZone]);

  const loadLinkedData = async () => {
    if (!id) return;

    // Fetch linked states
    const { data: zoneStates } = await supabase
      .from('zone_states' as any)
      .select('state_id')
      .eq('zone_id', id);
    if (zoneStates) setSelectedStates(zoneStates.map((zs: any) => zs.state_id));

    // Fetch linked cities
    const { data: zoneCities } = await supabase
      .from('zone_cities' as any)
      .select('city_id')
      .eq('zone_id', id);
    if (zoneCities) setSelectedCities(zoneCities.map((zc: any) => zc.city_id));

    // Fetch linked territories
    const { data: zoneTerritories } = await supabase
      .from('zone_territories' as any)
      .select('territory_id')
      .eq('zone_id', id);
    if (zoneTerritories) setSelectedTerritories(zoneTerritories.map((zt: any) => zt.territory_id));
  };

  const filteredStates = states.filter(s => s.country_id === formData.country_id);
  const filteredCities = cities.filter(c => selectedStates.includes(c.state_id));
  const filteredTerritories = territories.filter(t => t.status === 'active');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.code || !formData.country_id) {
      toast.error('Please fill required fields');
      return;
    }

    setIsSaving(true);
    try {
      let zoneId = id;

      if (isEdit && id) {
        await updateZone.mutateAsync({ id, ...formData });
      } else {
        const result = await createZone.mutateAsync(formData);
        zoneId = result.id;
      }

      // Update zone_states
      await supabase.from('zone_states' as any).delete().eq('zone_id', zoneId);
      if (selectedStates.length > 0) {
        await supabase.from('zone_states' as any).insert(
          selectedStates.map(stateId => ({ zone_id: zoneId, state_id: stateId }))
        );
      }

      // Update zone_cities
      await supabase.from('zone_cities' as any).delete().eq('zone_id', zoneId);
      if (selectedCities.length > 0) {
        await supabase.from('zone_cities' as any).insert(
          selectedCities.map(cityId => ({ zone_id: zoneId, city_id: cityId }))
        );
      }

      // Update zone_territories
      await supabase.from('zone_territories' as any).delete().eq('zone_id', zoneId);
      if (selectedTerritories.length > 0) {
        await supabase.from('zone_territories' as any).insert(
          selectedTerritories.map(territoryId => ({ zone_id: zoneId, territory_id: territoryId }))
        );
      }

      navigate('/master/zones');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save zone');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleState = (stateId: string) => {
    setSelectedStates(prev => 
      prev.includes(stateId) ? prev.filter(id => id !== stateId) : [...prev, stateId]
    );
  };

  const toggleCity = (cityId: string) => {
    setSelectedCities(prev => 
      prev.includes(cityId) ? prev.filter(id => id !== cityId) : [...prev, cityId]
    );
  };

  const toggleTerritory = (territoryId: string) => {
    setSelectedTerritories(prev => 
      prev.includes(territoryId) ? prev.filter(id => id !== territoryId) : [...prev, territoryId]
    );
  };

  if (isEdit && isLoadingZones) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/master/zones')} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="module-title">{isEdit ? 'Edit Zone' : 'Add Zone'}</h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update zone details' : 'Create a new zone entry'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-warning/10">
                <Compass size={24} className="text-warning" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Zone Details</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Country *</label>
                <select
                  value={formData.country_id}
                  onChange={(e) => {
                    setFormData({ ...formData, country_id: e.target.value });
                    setSelectedStates([]);
                    setSelectedCities([]);
                  }}
                  className="input-field"
                  required
                >
                  <option value="">Select Country</option>
                  {countries.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Zone Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., North Zone"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Zone Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., NZ"
                  className="input-field"
                  maxLength={10}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="input-field"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
            <h2 className="text-lg font-semibold text-foreground mb-4">States (Multi-select)</h2>
            {formData.country_id ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredStates.length > 0 ? filteredStates.map(state => (
                  <label key={state.id} className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStates.includes(state.id)}
                      onChange={() => toggleState(state.id)}
                      className="rounded border-border"
                    />
                    <span className="text-foreground">{state.name}</span>
                    <span className="text-xs text-muted-foreground">({state.code})</span>
                  </label>
                )) : (
                  <p className="text-muted-foreground text-sm">No states available for selected country</p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Select a country first</p>
            )}

            {selectedStates.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedStates.map(stateId => {
                  const state = states.find(s => s.id === stateId);
                  return state && (
                    <span key={stateId} className="inline-flex items-center gap-1 px-2 py-1 bg-secondary/20 text-secondary rounded-lg text-sm">
                      {state.name}
                      <button type="button" onClick={() => toggleState(stateId)} className="hover:text-destructive">
                        <X size={14} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
            <h2 className="text-lg font-semibold text-foreground mb-4">Cities (Multi-select)</h2>
            {selectedStates.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredCities.length > 0 ? filteredCities.map(city => (
                  <label key={city.id} className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCities.includes(city.id)}
                      onChange={() => toggleCity(city.id)}
                      className="rounded border-border"
                    />
                    <span className="text-foreground">{city.name}</span>
                    <span className="text-xs text-muted-foreground">({(city.state as any)?.name})</span>
                  </label>
                )) : (
                  <p className="text-muted-foreground text-sm">No cities available for selected states</p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Select states first</p>
            )}

            {selectedCities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedCities.map(cityId => {
                  const city = cities.find(c => c.id === cityId);
                  return city && (
                    <span key={cityId} className="inline-flex items-center gap-1 px-2 py-1 bg-info/20 text-info rounded-lg text-sm">
                      {city.name}
                      <button type="button" onClick={() => toggleCity(cityId)} className="hover:text-destructive">
                        <X size={14} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
            <h2 className="text-lg font-semibold text-foreground mb-4">Territories (Multi-select)</h2>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filteredTerritories.length > 0 ? filteredTerritories.map(territory => (
                <label key={territory.id} className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTerritories.includes(territory.id)}
                    onChange={() => toggleTerritory(territory.id)}
                    className="rounded border-border"
                  />
                  <span className="text-foreground">{territory.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">({territory.type})</span>
                </label>
              )) : (
                <p className="text-muted-foreground text-sm">No territories available</p>
              )}
            </div>

            {selectedTerritories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedTerritories.map(territoryId => {
                  const territory = territories.find(t => t.id === territoryId);
                  return territory && (
                    <span key={territoryId} className="inline-flex items-center gap-1 px-2 py-1 bg-success/20 text-success rounded-lg text-sm">
                      {territory.name}
                      <button type="button" onClick={() => toggleTerritory(territoryId)} className="hover:text-destructive">
                        <X size={14} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button type="button" onClick={() => navigate('/master/zones')} className="btn-outline">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary flex items-center gap-2"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isEdit ? 'Update Zone' : 'Create Zone'}
          </button>
        </div>
      </form>
    </div>
  );
}
