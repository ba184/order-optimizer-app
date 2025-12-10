import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Navigation, MapPin, Clock, Battery, Users, Signal, AlertCircle, Key } from "lucide-react";
import { toast } from "sonner";

import "mapbox-gl/dist/mapbox-gl.css";

interface EmployeeLocation {
  id: string;
  userId: string;
  userName: string;
  latitude: number;
  longitude: number;
  address: string;
  timestamp: string;
  batteryLevel: number;
  isMoving: boolean;
  zone: string;
  city: string;
  travelHistory: [number, number][]; // Array of [lng, lat] coordinates
}

const mockLocations: EmployeeLocation[] = [
  {
    id: "1",
    userId: "se-001",
    userName: "Rajesh Kumar",
    latitude: 28.6139,
    longitude: 77.209,
    address: "Connaught Place, Delhi",
    timestamp: "2 mins ago",
    batteryLevel: 85,
    isMoving: true,
    zone: "North Zone",
    city: "New Delhi",
    travelHistory: [
      [77.199, 28.605],
      [77.202, 28.608],
      [77.205, 28.610],
      [77.207, 28.612],
      [77.209, 28.6139],
    ],
  },
  {
    id: "2",
    userId: "se-002",
    userName: "Amit Sharma",
    latitude: 28.5355,
    longitude: 77.25,
    address: "Lajpat Nagar, Delhi",
    timestamp: "5 mins ago",
    batteryLevel: 62,
    isMoving: false,
    zone: "North Zone",
    city: "New Delhi",
    travelHistory: [
      [77.240, 28.530],
      [77.243, 28.532],
      [77.246, 28.533],
      [77.248, 28.534],
      [77.25, 28.5355],
    ],
  },
  {
    id: "3",
    userId: "se-003",
    userName: "Priya Singh",
    latitude: 28.6519,
    longitude: 77.2315,
    address: "Karol Bagh, Delhi",
    timestamp: "1 min ago",
    batteryLevel: 91,
    isMoving: true,
    zone: "North Zone",
    city: "New Delhi",
    travelHistory: [
      [77.220, 28.645],
      [77.223, 28.647],
      [77.226, 28.649],
      [77.229, 28.650],
      [77.2315, 28.6519],
    ],
  },
  {
    id: "4",
    userId: "se-004",
    userName: "Vikram Patel",
    latitude: 28.7041,
    longitude: 77.1025,
    address: "Rohini, Delhi",
    timestamp: "8 mins ago",
    batteryLevel: 45,
    isMoving: false,
    zone: "North Zone",
    city: "New Delhi",
    travelHistory: [
      [77.095, 28.698],
      [77.097, 28.700],
      [77.099, 28.702],
      [77.101, 28.703],
      [77.1025, 28.7041],
    ],
  },
];

export default function LiveTrackingPage() {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [mapboxToken, setMapboxToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<any[]>([]);

  const initializeMap = async () => {
    if (!mapboxToken || !mapContainer.current) return;

    try {
      const mapboxgl = (await import("mapbox-gl")).default;
      mapboxgl.accessToken = mapboxToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [77.209, 28.6139],
        zoom: 11,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      map.current.on("load", () => {
        setMapLoaded(true);

        mockLocations.forEach((loc, index) => {
          // Add radius circle for each employee
          const radiusSourceId = `radius-${loc.id}`;
          const radiusLayerId = `radius-layer-${loc.id}`;
          
          map.current.addSource(radiusSourceId, {
            type: "geojson",
            data: createCircleGeoJSON(loc.longitude, loc.latitude, 0.5), // 500m radius
          });

          map.current.addLayer({
            id: radiusLayerId,
            type: "fill",
            source: radiusSourceId,
            paint: {
              "fill-color": loc.isMoving ? "#22c55e" : "#f59e0b",
              "fill-opacity": 0.15,
            },
          });

          // Add radius border
          map.current.addLayer({
            id: `${radiusLayerId}-border`,
            type: "line",
            source: radiusSourceId,
            paint: {
              "line-color": loc.isMoving ? "#22c55e" : "#f59e0b",
              "line-width": 2,
              "line-opacity": 0.5,
            },
          });

          // Add travel path line
          const pathSourceId = `path-${loc.id}`;
          const pathLayerId = `path-layer-${loc.id}`;

          map.current.addSource(pathSourceId, {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: loc.travelHistory,
              },
            },
          });

          map.current.addLayer({
            id: pathLayerId,
            type: "line",
            source: pathSourceId,
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#1e293b",
              "line-width": 4,
              "line-opacity": 0.8,
            },
          });

          // Add direction dots along the path
          const dotSourceId = `dots-${loc.id}`;
          map.current.addSource(dotSourceId, {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: loc.travelHistory.slice(0, -1).map((coord, i) => ({
                type: "Feature",
                properties: { order: i },
                geometry: {
                  type: "Point",
                  coordinates: coord,
                },
              })),
            },
          });

          map.current.addLayer({
            id: `dots-layer-${loc.id}`,
            type: "circle",
            source: dotSourceId,
            paint: {
              "circle-radius": 5,
              "circle-color": "#64748b",
              "circle-stroke-width": 2,
              "circle-stroke-color": "#ffffff",
            },
          });

          // Add employee marker
          const el = document.createElement("div");
          el.className = "employee-marker";
          el.style.cssText = `
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: ${loc.isMoving ? "hsl(142, 71%, 45%)" : "hsl(38, 92%, 50%)"};
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
              <div style="margin-top: 8px; padding: 4px 8px; border-radius: 4px; background: ${loc.isMoving ? "#dcfce7" : "#fef3c7"};">
                <span style="color: ${loc.isMoving ? "#16a34a" : "#d97706"}; font-size: 12px; font-weight: 500;">
                  ${loc.isMoving ? "● Moving" : "● Stationary"}
                </span>
              </div>
              <div style="margin-top: 8px; font-size: 11px; color: #888;">
                <div>📍 ${loc.travelHistory.length} checkpoints tracked</div>
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
      });

      setShowTokenInput(false);
      toast.success("Map loaded successfully!");
    } catch (error) {
      console.error("Error initializing map:", error);
      toast.error("Failed to load map. Please check your token.");
    }
  };

  // Helper function to create circle GeoJSON
  const createCircleGeoJSON = (lng: number, lat: number, radiusKm: number) => {
    const points = 64;
    const coords: [number, number][] = [];
    
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      const dx = radiusKm * Math.cos(angle);
      const dy = radiusKm * Math.sin(angle);
      
      // Convert km to degrees (approximate)
      const dLng = dx / (111.32 * Math.cos(lat * Math.PI / 180));
      const dLat = dy / 110.574;
      
      coords.push([lng + dLng, lat + dLat]);
    }
    coords.push(coords[0]); // Close the circle
    
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

  return (
    <div className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="module-title">Live GPS Tracking</h1>
          <p className="text-muted-foreground">Real-time employee location monitoring with travel paths</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
            <div className="w-3 h-3 rounded-full bg-[#1e293b]" />
            <span className="text-xs text-muted-foreground">Travel Path</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-lg">
            <Signal size={16} className="text-success" />
            <span className="text-sm text-success font-medium">{mockLocations.length} Online</span>
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
                <div className="w-8 h-1 rounded bg-[#1e293b]" />
                <span className="text-muted-foreground">Travel Path</span>
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
            {mockLocations.map((loc) => (
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
                      loc.isMoving ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                    }`}
                  >
                    {loc.isMoving ? "Moving" : "Stationary"}
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
                    <Battery size={12} className={loc.batteryLevel < 50 ? "text-warning" : "text-success"} />
                    {loc.batteryLevel}%
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-3 h-0.5 bg-[#1e293b] rounded" />
                    <span>{loc.travelHistory.length} checkpoints tracked</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
