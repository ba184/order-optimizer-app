import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2, X, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface GPSLocationPickerProps {
  value: { lat: number; lng: number } | null;
  onChange: (location: { lat: number; lng: number } | null) => void;
  label?: string;
}

export function GPSLocationPicker({
  value,
  onChange,
  label = 'GPS Location'
}: GPSLocationPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [tempLocation, setTempLocation] = useState<{ lat: number; lng: number } | null>(value);
  const [manualLat, setManualLat] = useState(value?.lat?.toString() || '');
  const [manualLng, setManualLng] = useState(value?.lng?.toString() || '');
  const [capturingGPS, setCapturingGPS] = useState(false);

  useEffect(() => {
    if (value) {
      setTempLocation(value);
      setManualLat(value.lat.toString());
      setManualLng(value.lng.toString());
    }
  }, [value]);

  const captureCurrentLocation = async () => {
    if (!navigator.geolocation) {
      return;
    }
    
    setCapturingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setTempLocation(location);
        setManualLat(location.lat.toString());
        setManualLng(location.lng.toString());
        setCapturingGPS(false);
      },
      () => {
        setCapturingGPS(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const searchPlaces = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      // Using Nominatim (OpenStreetMap) for geocoding - free and no API key required
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectPlace = (place: any) => {
    const location = {
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
    };
    setTempLocation(location);
    setManualLat(location.lat.toString());
    setManualLng(location.lng.toString());
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleManualInput = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      setTempLocation({ lat, lng });
    }
  };

  const handleConfirm = () => {
    onChange(tempLocation);
    setOpen(false);
  };

  const handleClear = () => {
    setTempLocation(null);
    setManualLat('');
    setManualLng('');
    onChange(null);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2"
            type="button"
          >
            <MapPin size={16} className="text-primary" />
            {value ? (
              <span className="truncate">
                {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
              </span>
            ) : (
              <span className="text-muted-foreground">Capture GPS Location</span>
            )}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin size={20} className="text-primary" />
              Select GPS Location
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Capture Current Location */}
            <Button
              onClick={captureCurrentLocation}
              disabled={capturingGPS}
              className="w-full"
              type="button"
            >
              {capturingGPS ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <Navigation size={16} className="mr-2" />
              )}
              Capture Current GPS Location
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* Search by Place Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Search by Place Name</label>
              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter city, address or landmark"
                  onKeyDown={(e) => e.key === 'Enter' && searchPlaces()}
                />
                <Button onClick={searchPlaces} disabled={searching} type="button" variant="secondary">
                  {searching ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Search size={16} />
                  )}
                </Button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="max-h-40 overflow-y-auto border rounded-lg divide-y">
                  {searchResults.map((place, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectPlace(place)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                      type="button"
                    >
                      <p className="font-medium truncate">{place.display_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {parseFloat(place.lat).toFixed(6)}, {parseFloat(place.lon).toFixed(6)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* Manual Lat/Lng Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Enter Latitude & Longitude</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="number"
                    step="any"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    onBlur={handleManualInput}
                    placeholder="Latitude (-90 to 90)"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    step="any"
                    value={manualLng}
                    onChange={(e) => setManualLng(e.target.value)}
                    onBlur={handleManualInput}
                    placeholder="Longitude (-180 to 180)"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            {tempLocation && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-foreground mb-2">Selected Location</p>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-primary" />
                  <span className="text-sm">
                    {tempLocation.lat.toFixed(6)}, {tempLocation.lng.toFixed(6)}
                  </span>
                </div>
                {/* Map Preview - Static map image */}
                <div className="mt-3 aspect-video bg-muted rounded-lg overflow-hidden relative">
                  <img
                    src={`https://staticmap.openstreetmap.de/staticmap.php?center=${tempLocation.lat},${tempLocation.lng}&zoom=15&size=400x200&markers=${tempLocation.lat},${tempLocation.lng},red`}
                    alt="Map Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect fill="%23f1f5f9" width="400" height="200"/><text x="50%" y="50%" text-anchor="middle" fill="%2394a3b8" font-family="sans-serif">Map Preview</text></svg>';
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <MapPin size={32} className="text-destructive drop-shadow-lg" />
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={handleClear} type="button">
                <X size={16} className="mr-2" />
                Clear
              </Button>
              <Button onClick={handleConfirm} type="button" disabled={!tempLocation}>
                Confirm Location
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {value && (
        <p className="text-xs text-muted-foreground">
          Lat: {value.lat.toFixed(6)}, Lng: {value.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}
