import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Navigation, MapPin, Clock, Battery, Users, Signal, AlertCircle, Key, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEmployeeLocations } from "@/hooks/useSalesTeamData";
import { formatDistanceToNow } from "date-fns";

import "mapbox-gl/dist/mapbox-gl.css";

interface EmployeeLocation {
  id: string;
  user_id: string;
  userName: string;
  latitude: number;
  longitude: number;
  address: string;
  timestamp: string;
  battery_level: number;
  is_moving: boolean;
  zone: string;
  city: string;
}

export default function LiveTrackingPage() {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [mapboxToken, setMapboxToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<any[]>([]);

  const { data: locationsData, isLoading } = useEmployeeLocations();

  // Transform data for display
  const locations: EmployeeLocation[] = (locationsData || []).map((loc: any) => ({
    id: loc.id,
    user_id: loc.user_id,
    userName: loc.profiles?.name || 'Unknown',
    latitude: Number(loc.latitude),
    longitude: Number(loc.longitude),
    address: loc.address || 'Unknown location',
    timestamp: loc.recorded_at ? formatDistanceToNow(new Date(loc.recorded_at), { addSuffix: true }) : 'N/A',
    battery_level: loc.battery_level || 100,
    is_moving: loc.is_moving || false,
    zone: loc.profiles?.region || 'N/A',
    city: loc.profiles?.territory || 'N/A',
  }));

  const initializeMap = async () => {
    if (!mapboxToken || !mapContainer.current) return;

    try {
      const mapboxgl = (await import("mapbox-gl")).default;
      mapboxgl.accessToken = mapboxToken;

      // Default center (Delhi, India) if no locations
      const center = locations.length > 0 
        ? [locations[0].longitude, locations[0].latitude] 
        : [77.209, 28.6139];

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: center as [number, number],
        zoom: 11,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      map.current.on("load", () => {
        setMapLoaded(true);
        updateMarkers(mapboxgl);
      });

      setShowTokenInput(false);
      toast.success("Map loaded successfully!");
    } catch (error) {
      console.error("Error initializing map:", error);
      toast.error("Failed to load map. Please check your token.");
    }
  };

  const updateMarkers = async (mapboxgl: any) => {
    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    locations.forEach((loc) => {
      // Add radius circle for each employee
      const radiusSourceId = `radius-${loc.id}`;
      const radiusLayerId = `radius-layer-${loc.id}`;
      
      if (!map.current.getSource(radiusSourceId)) {
        map.current.addSource(radiusSourceId, {
          type: "geojson",
          data: createCircleGeoJSON(loc.longitude, loc.latitude, 0.5),
        });

        map.current.addLayer({
          id: radiusLayerId,
          type: "fill",
          source: radiusSourceId,
          paint: {
            "fill-color": loc.is_moving ? "#22c55e" : "#f59e0b",
            "fill-opacity": 0.15,
          },
        });

        map.current.addLayer({
          id: `${radiusLayerId}-border`,
          type: "line",
          source: radiusSourceId,
          paint: {
            "line-color": loc.is_moving ? "#22c55e" : "#f59e0b",
            "line-width": 2,
            "line-opacity": 0.5,
          },
        });
      }

      // Add employee marker
      const el = document.createElement("div");
      el.className = "employee-marker";
      el.style.cssText = `
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: ${loc.is_moving ? "hsl(142, 71%, 45%)" : "hsl(38, 92%, 50%)"};
        border: 4px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        z-index: 10;
      `;
      el.innerHTML = loc.userName
        .split(" ")
        .map((n) => n[0])
        .join("");

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 12px; min-width: 180px;">
          <strong style="font-size: 14px;">${loc.userName}</strong><br/>
          <span style="color: #666; font-size: 12px;">${loc.address}</span><br/>
          <div style="margin-top: 8px; padding: 4px 8px; border-radius: 4px; background: ${loc.is_moving ? "#dcfce7" : "#fef3c7"};">
            <span style="color: ${loc.is_moving ? "#16a34a" : "#d97706"}; font-size: 12px; font-weight: 500;">
              ${loc.is_moving ? "● Moving" : "● Stationary"}
            </span>
          </div>
          <div style="margin-top: 8px; font-size: 11px; color: #888;">
            <div>🔋 Battery: ${loc.battery_level}%</div>
            <div>🕒 Last updated: ${loc.timestamp}</div>
          </div>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([loc.longitude, loc.latitude])
        .setPopup(popup)
        .addTo(map.current);

      el.addEventListener("click", () => setSelectedEmployee(loc.id));
      markers.current.push(marker);
    });
  };

  // Helper function to create circle GeoJSON
  const createCircleGeoJSON = (lng: number, lat: number, radiusKm: number) => {
    const points = 64;
    const coords: [number, number][] = [];
    
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      const dx = radiusKm * Math.cos(angle);
      const dy = radiusKm * Math.sin(angle);
      
      const dLng = dx / (111.32 * Math.cos(lat * Math.PI / 180));
      const dLat = dy / 110.574;
      
      coords.push([lng + dLng, lat + dLat]);
    }
    coords.push(coords[0]);
    
    return {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "Polygon" as const,
        coordinates: [coords],
      },
    };
  };

  useEffect(() => {
    return () => {
      if (map.current) map.current.remove();
    };
  }, []);

  const focusOnEmployee = (loc: EmployeeLocation) => {
    setSelectedEmployee(loc.id);
    if (map.current && mapLoaded) {
      map.current.flyTo({
        center: [loc.longitude, loc.latitude],
        zoom: 15,
        duration: 1000,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="module-title">Live GPS Tracking</h1>
          <p className="text-muted-foreground">Real-time employee location monitoring</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-lg">
            <Signal size={16} className="text-success" />
            <span className="text-sm text-success font-medium">{locations.length} Online</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          <div className="h-[500px] relative">
            {showTokenInput ? (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card p-6 rounded-xl border border-border shadow-xl max-w-md w-full mx-4"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Key size={24} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Mapbox API Token</h3>
                      <p className="text-sm text-muted-foreground">Enter your public token to load the map</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={mapboxToken}
                      onChange={(e) => setMapboxToken(e.target.value)}
                      placeholder="pk.eyJ1IjoieW91..."
                      className="input-field"
                    />
                    <div className="flex items-start gap-2 p-3 bg-info/10 rounded-lg">
                      <AlertCircle size={16} className="text-info mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        Get your free token from{" "}
                        <a
                          href="https://mapbox.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline"
                        >
                          mapbox.com
                        </a>{" "}
                        → Account → Tokens
                      </p>
                    </div>
                    <button onClick={initializeMap} disabled={!mapboxToken} className="btn-primary w-full">
                      Load Map
                    </button>
                  </div>
                </motion.div>
              </div>
            ) : null}

            <div ref={mapContainer} className="absolute inset-0" />

            {!mapLoaded && !showTokenInput && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                <div className="text-center">
                  <Navigation size={48} className="text-muted-foreground mx-auto mb-4 animate-pulse" />
                  <p className="text-muted-foreground">Loading map...</p>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="p-4 border-t border-border bg-muted/30">
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-success border-2 border-white shadow" />
                <span className="text-muted-foreground">Moving</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-warning border-2 border-white shadow" />
                <span className="text-muted-foreground">Stationary</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-success bg-success/20" />
                <span className="text-muted-foreground">Coverage Radius (500m)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Employee List */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users size={18} className="text-primary" />
            Field Executives
          </h3>
          <div className="space-y-3 max-h-[520px] overflow-y-auto scrollbar-thin">
            {locations.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No active employees found</p>
            ) : (
              locations.map((loc) => (
                <motion.div
                  key={loc.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => focusOnEmployee(loc)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedEmployee === loc.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-foreground">{loc.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {loc.zone} • {loc.city}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        loc.is_moving ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                      }`}
                    >
                      {loc.is_moving ? "Moving" : "Stationary"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin size={12} />
                    <span className="truncate">{loc.address}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      {loc.timestamp}
                    </div>
                    <div className="flex items-center gap-1">
                      <Battery size={12} className={loc.battery_level < 50 ? "text-warning" : "text-success"} />
                      {loc.battery_level}%
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
