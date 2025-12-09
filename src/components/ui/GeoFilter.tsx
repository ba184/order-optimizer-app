import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { geoHierarchy, GeoFilter as GeoFilterType } from '@/data/geoData';

interface GeoFilterProps {
  value: GeoFilterType;
  onChange: (filter: GeoFilterType) => void;
  showArea?: boolean;
}

export function GeoFilter({ value, onChange, showArea = true }: GeoFilterProps) {
  const [states, setStates] = useState<string[]>([]);
  const [zones, setZones] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);

  useEffect(() => {
    setStates(geoHierarchy.states['India'] || []);
  }, []);

  useEffect(() => {
    if (value.state) {
      setZones(geoHierarchy.zones[value.state as keyof typeof geoHierarchy.zones] || []);
    } else {
      setZones([]);
    }
  }, [value.state]);

  useEffect(() => {
    if (value.zone) {
      setCities(geoHierarchy.cities[value.zone as keyof typeof geoHierarchy.cities] || []);
    } else {
      setCities([]);
    }
  }, [value.zone]);

  useEffect(() => {
    if (value.city) {
      setAreas(geoHierarchy.areas[value.city as keyof typeof geoHierarchy.areas] || []);
    } else {
      setAreas([]);
    }
  }, [value.city]);

  const handleStateChange = (state: string) => {
    onChange({ ...value, state, zone: '', city: '', area: '' });
  };

  const handleZoneChange = (zone: string) => {
    onChange({ ...value, zone, city: '', area: '' });
  };

  const handleCityChange = (city: string) => {
    onChange({ ...value, city, area: '' });
  };

  const handleAreaChange = (area: string) => {
    onChange({ ...value, area });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-2 text-muted-foreground">
        <MapPin size={16} />
        <span className="text-sm font-medium">Filter by Location:</span>
      </div>
      
      <select
        value={value.state || ''}
        onChange={(e) => handleStateChange(e.target.value)}
        className="input-field w-36"
      >
        <option value="">All States</option>
        {states.map((state) => (
          <option key={state} value={state}>{state}</option>
        ))}
      </select>

      <select
        value={value.zone || ''}
        onChange={(e) => handleZoneChange(e.target.value)}
        className="input-field w-36"
        disabled={!value.state}
      >
        <option value="">All Zones</option>
        {zones.map((zone) => (
          <option key={zone} value={zone}>{zone}</option>
        ))}
      </select>

      <select
        value={value.city || ''}
        onChange={(e) => handleCityChange(e.target.value)}
        className="input-field w-36"
        disabled={!value.zone}
      >
        <option value="">All Cities</option>
        {cities.map((city) => (
          <option key={city} value={city}>{city}</option>
        ))}
      </select>

      {showArea && (
        <select
          value={value.area || ''}
          onChange={(e) => handleAreaChange(e.target.value)}
          className="input-field w-40"
          disabled={!value.city}
        >
          <option value="">All Areas</option>
          {areas.map((area) => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>
      )}

      {(value.state || value.zone || value.city || value.area) && (
        <button
          onClick={() => onChange({ country: 'India' })}
          className="text-sm text-primary hover:underline"
        >
          Clear
        </button>
      )}
    </div>
  );
}
