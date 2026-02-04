import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Compass, Map, Building, MapPin, X } from 'lucide-react';
import { useZones, useStates, useCountries, useCities, useCreateZone, useUpdateZone } from '@/hooks/useGeoMasterData';
import { useTerritories } from '@/hooks/useTerritoriesData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const zoneTypeOptions = [
  { value: 'state', label: 'State Zone', description: 'Zone based on states', icon: Map },
  { value: 'city', label: 'City Zone', description: 'Zone based on cities', icon: Building },
  { value: 'territory', label: 'Territory Zone', description: 'Zone based on territories', icon: MapPin },
];

export default function ZoneFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

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

  const [zoneType, setZoneType] = useState<'state' | 'city' | 'territory'>('state');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedTerritories, setSelectedTerritories] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const existingZone = zones.find(z => z.id === id);

  useEffect(() => {
    if (existingZone) {
      setFormData({
        name: existingZone.name,
        code: existingZone.code,
        country_id: existingZone.country_id,
        status: existingZone.status,
      });
      setSelectedCountry(existingZone.country_id);
      loadLinkedData();
    }
  }, [existingZone]);

  const loadLinkedData = async () => {
    if (!id) return;

    // Fetch linked states
    const { data: zoneStates } = await supabase
      .from('zone_states' as any)
      .select('state_id')
      .eq('zone_id', id);
    if (zoneStates && zoneStates.length > 0) {
      setSelectedStates(zoneStates.map((zs: any) => zs.state_id));
      setZoneType('state');
    }

    // Fetch linked cities
    const { data: zoneCities } = await supabase
      .from('zone_cities' as any)
      .select('city_id')
      .eq('zone_id', id);
    if (zoneCities && zoneCities.length > 0) {
      setSelectedCities(zoneCities.map((zc: any) => zc.city_id));
      setZoneType('city');
    }

    // Fetch linked territories
    const { data: zoneTerritories } = await supabase
      .from('zone_territories' as any)
      .select('territory_id')
      .eq('zone_id', id);
    if (zoneTerritories && zoneTerritories.length > 0) {
      setSelectedTerritories(zoneTerritories.map((zt: any) => zt.territory_id));
      setZoneType('territory');
    }
  };

  const filteredStates = states.filter(s => s.country_id === selectedCountry);
  const filteredCities = cities.filter(c => c.state_id === selectedState);
  const filteredTerritories = territories.filter(t => t.status === 'active');

  const handleZoneTypeChange = (type: 'state' | 'city' | 'territory') => {
    setZoneType(type);
    setSelectedStates([]);
    setSelectedCities([]);
    setSelectedTerritories([]);
    setSelectedState('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.code || !selectedCountry) {
      toast.error('Please fill required fields');
      return;
    }

    // Validate selection based on zone type
    if (zoneType === 'state' && selectedStates.length === 0) {
      toast.error('Please select at least one state');
      return;
    }
    if (zoneType === 'city' && selectedCities.length === 0) {
      toast.error('Please select at least one city');
      return;
    }
    if (zoneType === 'territory' && selectedTerritories.length === 0) {
      toast.error('Please select at least one territory');
      return;
    }

    setIsSaving(true);
    try {
      let zoneId = id;

      const zoneData = {
        ...formData,
        country_id: selectedCountry,
      };

      if (isEdit && id) {
        await updateZone.mutateAsync({ id, ...zoneData });
      } else {
        const result = await createZone.mutateAsync(zoneData);
        zoneId = result.id;
      }

      // Clear all existing links
      await supabase.from('zone_states' as any).delete().eq('zone_id', zoneId);
      await supabase.from('zone_cities' as any).delete().eq('zone_id', zoneId);
      await supabase.from('zone_territories' as any).delete().eq('zone_id', zoneId);

      // Insert new links based on zone type
      if (zoneType === 'state' && selectedStates.length > 0) {
        await supabase.from('zone_states' as any).insert(
          selectedStates.map(stateId => ({ zone_id: zoneId, state_id: stateId }))
        );
      }

      if (zoneType === 'city' && selectedCities.length > 0) {
        await supabase.from('zone_cities' as any).insert(
          selectedCities.map(cityId => ({ zone_id: zoneId, city_id: cityId }))
        );
      }

      if (zoneType === 'territory' && selectedTerritories.length > 0) {
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
          <div className="flex items-center gap-3">
            <Compass size={28} className="text-warning" />
            <h1 className="module-title">{isEdit ? 'Edit' : 'New'} Zone</h1>
          </div>
          <p className="text-muted-foreground">
            {isEdit ? 'Update zone details' : 'Add a new zone to the system'}
          </p>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="card p-6 space-y-6"
      >
        {/* Zone Type Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Zone Type *</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {zoneTypeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    zoneType === option.value
                      ? 'border-warning bg-warning/5'
                      : 'border-border hover:border-warning/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="zone_type"
                    value={option.value}
                    checked={zoneType === option.value}
                    onChange={() => handleZoneTypeChange(option.value as any)}
                    className="sr-only"
                  />
                  <Icon
                    size={24}
                    className={zoneType === option.value ? 'text-warning' : 'text-muted-foreground'}
                  />
                  <div>
                    <p className="font-medium">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Basic Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Zone Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field w-full"
              placeholder="e.g., North Zone"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Zone Code *</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="input-field w-full"
              placeholder="e.g., NZ"
              maxLength={10}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Country *</label>
            <select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setFormData({ ...formData, country_id: e.target.value });
                setSelectedStates([]);
                setSelectedCities([]);
                setSelectedState('');
              }}
              className="input-field w-full"
              required
            >
              <option value="">Select Country</option>
              {countries.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              className="input-field w-full"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Dynamic Fields Based on Zone Type */}
        {zoneType === 'state' && (
          <div className="space-y-4">
            <label className="text-sm font-medium text-foreground">Select States *</label>
            {selectedCountry ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 border border-border rounded-lg">
                  {filteredStates.length > 0 ? filteredStates.map(state => (
                    <label key={state.id} className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStates.includes(state.id)}
                        onChange={() => toggleState(state.id)}
                        className="rounded border-border"
                      />
                      <span className="text-sm text-foreground">{state.name}</span>
                    </label>
                  )) : (
                    <p className="text-muted-foreground text-sm col-span-full">No states available</p>
                  )}
                </div>
                {selectedStates.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedStates.map(stateId => {
                      const state = states.find(s => s.id === stateId);
                      return state && (
                        <span key={stateId} className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/20 text-secondary rounded-lg text-sm">
                          {state.name}
                          <button type="button" onClick={() => toggleState(stateId)} className="hover:text-destructive">
                            <X size={14} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground text-sm">Select a country first</p>
            )}
          </div>
        )}

        {zoneType === 'city' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">State *</label>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedCities([]);
                  }}
                  className="input-field w-full"
                  disabled={!selectedCountry}
                >
                  <option value="">Select State</option>
                  {filteredStates.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <label className="text-sm font-medium text-foreground">Select Cities *</label>
            {selectedState ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 border border-border rounded-lg">
                  {filteredCities.length > 0 ? filteredCities.map(city => (
                    <label key={city.id} className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCities.includes(city.id)}
                        onChange={() => toggleCity(city.id)}
                        className="rounded border-border"
                      />
                      <span className="text-sm text-foreground">{city.name}</span>
                    </label>
                  )) : (
                    <p className="text-muted-foreground text-sm col-span-full">No cities available</p>
                  )}
                </div>
                {selectedCities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedCities.map(cityId => {
                      const city = cities.find(c => c.id === cityId);
                      return city && (
                        <span key={cityId} className="inline-flex items-center gap-1 px-3 py-1 bg-info/20 text-info rounded-lg text-sm">
                          {city.name}
                          <button type="button" onClick={() => toggleCity(cityId)} className="hover:text-destructive">
                            <X size={14} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground text-sm">Select a state first</p>
            )}
          </div>
        )}

        {zoneType === 'territory' && (
          <div className="space-y-4">
            <label className="text-sm font-medium text-foreground">Select Territories *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 border border-border rounded-lg">
              {filteredTerritories.length > 0 ? filteredTerritories.map(territory => (
                <label key={territory.id} className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTerritories.includes(territory.id)}
                    onChange={() => toggleTerritory(territory.id)}
                    className="rounded border-border"
                  />
                  <span className="text-sm text-foreground">{territory.name}</span>
                </label>
              )) : (
                <p className="text-muted-foreground text-sm col-span-full">No territories available</p>
              )}
            </div>
            {selectedTerritories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTerritories.map(territoryId => {
                  const territory = territories.find(t => t.id === territoryId);
                  return territory && (
                    <span key={territoryId} className="inline-flex items-center gap-1 px-3 py-1 bg-success/20 text-success rounded-lg text-sm">
                      {territory.name}
                      <button type="button" onClick={() => toggleTerritory(territoryId)} className="hover:text-destructive">
                        <X size={14} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => navigate('/master/zones')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary flex items-center gap-2"
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isEdit ? 'Update' : 'Create'} Zone
          </button>
        </div>
      </motion.form>
    </div>
  );
}
