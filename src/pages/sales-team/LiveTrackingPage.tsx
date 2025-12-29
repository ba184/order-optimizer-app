import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Navigation, MapPin, Clock, Users, Signal, AlertCircle, Key, Loader2, Route, Eye, RefreshCw, Download, Filter } from "lucide-react";
import { toast } from "sonner";
import { useEmployeeLocations } from "@/hooks/useSalesTeamData";
import { formatDistanceToNow, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";

import "mapbox-gl/dist/mapbox-gl.css";

interface VisitedDistributor {
  name: string;
  address: string;
  visitTime: string;
  products: string[];
  orderValue: number;
  preOrderValue?: number;
}

interface EmployeeLocation {
  id: string;
  user_id: string;
  userName: string;
  employeeCode: string;
  latitude: number;
  longitude: number;
  address: string;
  punchInLocation: string;
  timestamp: string;
  lastActiveTime: string;
  is_moving: boolean;
  status: 'moving' | 'stationary' | 'completed';
  distanceCovered: number;
  totalVisits: number;
  orderValue: number;
  preOrderValue: number;
  trackingStartTime: string;
  trackingEndTime?: string;
  visitedDistributors?: VisitedDistributor[];
  routeCoordinates?: [number, number][];
}

// Dummy data for demonstration
const dummyEmployees: EmployeeLocation[] = [
  {
    id: "dummy-1",
    user_id: "dummy-user-1",
    userName: "Rajesh Kumar",
    employeeCode: "EMP-001",
    latitude: 28.6139,
    longitude: 77.209,
    address: "Connaught Place, New Delhi",
    punchInLocation: "Karol Bagh, New Delhi",
    timestamp: new Date().toISOString(),
    lastActiveTime: "2 minutes ago",
    is_moving: true,
    status: 'moving',
    distanceCovered: 4.2,
    totalVisits: 3,
    orderValue: 15000,
    preOrderValue: 8500,
    trackingStartTime: "09:00 AM",
    visitedDistributors: [
      {
        name: "ABC Distributors",
        address: "Karol Bagh, Delhi",
        visitTime: "09:30 AM",
        products: ["Product A", "Product B", "Product C"],
        orderValue: 15000,
        preOrderValue: 8500
      }
    ],
    routeCoordinates: [
      [77.205, 28.610],
      [77.207, 28.612],
      [77.209, 28.6139],
    ]
  },
  {
    id: "dummy-2",
    user_id: "dummy-user-2",
    userName: "Priya Sharma",
    employeeCode: "EMP-002",
    latitude: 28.6280,
    longitude: 77.2190,
    address: "Civil Lines, New Delhi",
    punchInLocation: "Rajouri Garden, New Delhi",
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    lastActiveTime: "5 minutes ago",
    is_moving: false,
    status: 'stationary',
    distanceCovered: 2.8,
    totalVisits: 2,
    orderValue: 20500,
    preOrderValue: 12000,
    trackingStartTime: "08:45 AM",
    visitedDistributors: [
      {
        name: "XYZ Enterprises",
        address: "Civil Lines, Delhi",
        visitTime: "10:15 AM",
        products: ["Product D", "Product E"],
        orderValue: 8500,
        preOrderValue: 5000
      },
      {
        name: "Metro Traders",
        address: "Model Town, Delhi",
        visitTime: "11:00 AM",
        products: ["Product A", "Product F"],
        orderValue: 12000,
        preOrderValue: 7000
      }
    ]
  },
  {
    id: "dummy-3",
    user_id: "dummy-user-3",
    userName: "Amit Singh",
    employeeCode: "EMP-003",
    latitude: 28.5850,
    longitude: 77.2500,
    address: "Lajpat Nagar, New Delhi",
    punchInLocation: "Saket, New Delhi",
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    lastActiveTime: "15 minutes ago",
    is_moving: false,
    status: 'completed',
    distanceCovered: 18.5,
    totalVisits: 4,
    orderValue: 90000,
    preOrderValue: 45000,
    trackingStartTime: "08:00 AM",
    trackingEndTime: "05:30 PM",
    visitedDistributors: [
      {
        name: "Premier Distributors",
        address: "Saket, Delhi",
        visitTime: "08:00 AM",
        products: ["Product A", "Product B", "Product G"],
        orderValue: 25000,
        preOrderValue: 12000
      },
      {
        name: "National Traders",
        address: "Green Park, Delhi",
        visitTime: "09:30 AM",
        products: ["Product C", "Product D"],
        orderValue: 18000,
        preOrderValue: 9000
      },
      {
        name: "Supreme Wholesalers",
        address: "Defence Colony, Delhi",
        visitTime: "11:00 AM",
        products: ["Product E", "Product F", "Product H"],
        orderValue: 32000,
        preOrderValue: 16000
      },
      {
        name: "Royal Enterprises",
        address: "Lajpat Nagar, Delhi",
        visitTime: "12:30 PM",
        products: ["Product A", "Product I"],
        orderValue: 15000,
        preOrderValue: 8000
      }
    ],
    routeCoordinates: [
      [77.2167, 28.5245],
      [77.2065, 28.5594],
      [77.2295, 28.5715],
      [77.2500, 28.5850],
    ]
  }
];

export default function LiveTrackingPage() {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [mapboxToken, setMapboxToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [movingMarkerPosition, setMovingMarkerPosition] = useState<[number, number]>([77.209, 28.6139]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const animationRef = useRef<number | null>(null);

  const { data: locationsData, isLoading, refetch } = useEmployeeLocations();

  // Transform real data and merge with dummy data
  const realLocations: EmployeeLocation[] = (locationsData || []).map((loc: any) => ({
    id: loc.id,
    user_id: loc.user_id,
    userName: loc.profiles?.name || 'Unknown',
    employeeCode: `EMP-${loc.user_id?.slice(0, 4)?.toUpperCase() || '0000'}`,
    latitude: Number(loc.latitude),
    longitude: Number(loc.longitude),
    address: loc.address || 'Unknown location',
    punchInLocation: loc.address || 'Unknown',
    timestamp: loc.recorded_at || new Date().toISOString(),
    lastActiveTime: loc.recorded_at ? formatDistanceToNow(new Date(loc.recorded_at), { addSuffix: true }) : 'N/A',
    is_moving: loc.is_moving || false,
    status: loc.is_moving ? 'moving' : 'stationary' as const,
    distanceCovered: 0,
    totalVisits: 0,
    orderValue: 0,
    preOrderValue: 0,
    trackingStartTime: loc.recorded_at ? format(new Date(loc.recorded_at), 'hh:mm a') : 'N/A',
  }));

  // Combine real and dummy data
  const locations: EmployeeLocation[] = [...dummyEmployees, ...realLocations];

  // Filter locations
  const filteredLocations = locations.filter(loc => {
    if (employeeFilter !== 'all' && loc.id !== employeeFilter) return false;
    return true;
  });

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  // Animate the moving marker
  useEffect(() => {
    if (!mapLoaded) return;

    let step = 0;
    const animateMovingMarker = () => {
      step += 0.002;
      const newLng = 77.209 + Math.sin(step) * 0.005;
      const newLat = 28.6139 + Math.cos(step * 0.5) * 0.003;
      setMovingMarkerPosition([newLng, newLat]);

      if (map.current && map.current.getSource('moving-point')) {
        map.current.getSource('moving-point').setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [newLng, newLat]
          }
        });
      }

      animationRef.current = requestAnimationFrame(animateMovingMarker);
    };

    animationRef.current = requestAnimationFrame(animateMovingMarker);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mapLoaded]);

  const initializeMap = async () => {
    if (!mapboxToken || !mapContainer.current) return;

    try {
      const mapboxgl = (await import("mapbox-gl")).default;
      mapboxgl.accessToken = mapboxToken;

      const center: [number, number] = [77.22, 28.60];

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: center,
        zoom: 11,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      map.current.on("load", () => {
        setMapLoaded(true);
        addRoutesAndMarkers(mapboxgl);
      });

      setShowTokenInput(false);
      toast.success("Map loaded successfully!");
    } catch (error) {
      console.error("Error initializing map:", error);
      toast.error("Failed to load map. Please check your token.");
    }
  };

  const addRoutesAndMarkers = async (mapboxgl: any) => {
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add traveled route for completed employee (dummy-3)
    const completedEmployee = dummyEmployees.find(e => e.id === 'dummy-3');
    if (completedEmployee?.routeCoordinates) {
      map.current.addSource('traveled-route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: completedEmployee.routeCoordinates
          }
        }
      });

      // Route line - color coded
      map.current.addLayer({
        id: 'traveled-route-line',
        type: 'line',
        source: 'traveled-route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3b82f6',
          'line-width': 6,
          'line-opacity': 0.8
        }
      });

      // Glow effect
      map.current.addLayer({
        id: 'traveled-route-glow',
        type: 'line',
        source: 'traveled-route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#60a5fa',
          'line-width': 12,
          'line-opacity': 0.3
        }
      }, 'traveled-route-line');

      // Start point indicator
      const startEl = document.createElement('div');
      startEl.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #22c55e;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(34, 197, 94, 0.5);
      `;
      const startMarker = new mapboxgl.Marker(startEl)
        .setLngLat(completedEmployee.routeCoordinates[0])
        .addTo(map.current);
      markers.current.push(startMarker);

      // Latest point indicator
      const endEl = document.createElement('div');
      endEl.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #ef4444;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.5);
      `;
      const endMarker = new mapboxgl.Marker(endEl)
        .setLngLat(completedEmployee.routeCoordinates[completedEmployee.routeCoordinates.length - 1])
        .addTo(map.current);
      markers.current.push(endMarker);
    }

    // Add moving trail for moving employee (dummy-1)
    const movingEmployee = dummyEmployees.find(e => e.id === 'dummy-1');
    if (movingEmployee?.routeCoordinates) {
      map.current.addSource('moving-trail', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: movingEmployee.routeCoordinates
          }
        }
      });

      map.current.addLayer({
        id: 'moving-trail-line',
        type: 'line',
        source: 'moving-trail',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#22c55e',
          'line-width': 4,
          'line-dasharray': [2, 2]
        }
      });

      map.current.addSource('moving-point', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [movingEmployee.longitude, movingEmployee.latitude]
          }
        }
      });

      map.current.addLayer({
        id: 'moving-point-pulse',
        type: 'circle',
        source: 'moving-point',
        paint: {
          'circle-radius': 20,
          'circle-color': '#22c55e',
          'circle-opacity': 0.3
        }
      });
    }

    // Add markers for all employees
    filteredLocations.forEach((loc) => {
      const isDummy = loc.id.startsWith('dummy-');
      
      // Add radius circle for stationary employees
      if (loc.status === 'stationary') {
        const radiusSourceId = `radius-${loc.id}`;
        
        if (!map.current.getSource(radiusSourceId)) {
          map.current.addSource(radiusSourceId, {
            type: "geojson",
            data: createCircleGeoJSON(loc.longitude, loc.latitude, 0.3),
          });

          map.current.addLayer({
            id: `${radiusSourceId}-fill`,
            type: "fill",
            source: radiusSourceId,
            paint: {
              "fill-color": '#f59e0b',
              "fill-opacity": 0.15,
            },
          });

          map.current.addLayer({
            id: `${radiusSourceId}-border`,
            type: "line",
            source: radiusSourceId,
            paint: {
              "line-color": '#f59e0b',
              "line-width": 2,
              "line-opacity": 0.5,
            },
          });
        }
      }

      // Create marker element
      const el = document.createElement("div");
      el.className = "employee-marker";
      
      const markerColor = loc.status === 'completed' ? 'hsl(217, 91%, 60%)' :
                         loc.status === 'moving' ? 'hsl(142, 71%, 45%)' : 'hsl(38, 92%, 50%)';
      
      el.style.cssText = `
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: ${markerColor};
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
        position: relative;
      `;
      
      el.innerHTML = loc.userName.split(" ").map(n => n[0]).join("");

      // Add pulsing animation for moving employee
      if (loc.status === 'moving' && isDummy) {
        const pulse = document.createElement("div");
        pulse.style.cssText = `
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: ${markerColor};
          animation: pulse 2s infinite;
          z-index: -1;
        `;
        el.appendChild(pulse);
      }

      // Create popup with updated fields
      const popupContent = createPopupContent(loc);
      const popup = new mapboxgl.Popup({ 
        offset: 25, 
        maxWidth: '350px',
        className: 'custom-popup'
      }).setHTML(popupContent);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([loc.longitude, loc.latitude])
        .setPopup(popup)
        .addTo(map.current);

      el.addEventListener("click", () => setSelectedEmployee(loc.id));
      markers.current.push(marker);
    });

    // Add CSS for pulse animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); opacity: 0.7; }
        50% { transform: scale(1.5); opacity: 0; }
        100% { transform: scale(1); opacity: 0; }
      }
      .mapboxgl-popup-content {
        padding: 0 !important;
        border-radius: 12px !important;
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);
  };

  const createPopupContent = (loc: EmployeeLocation) => {
    const statusColor = loc.status === 'completed' ? '#3b82f6' :
                       loc.status === 'moving' ? '#22c55e' : '#f59e0b';
    const statusBg = loc.status === 'completed' ? '#dbeafe' :
                    loc.status === 'moving' ? '#dcfce7' : '#fef3c7';
    const statusText = loc.status === 'completed' ? 'Completed' :
                      loc.status === 'moving' ? 'Moving' : 'Stationary';

    return `
      <div style="min-width: 300px; font-family: system-ui, -apple-system, sans-serif;">
        <div style="padding: 16px; background: linear-gradient(135deg, ${statusColor}22, ${statusColor}11);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <strong style="font-size: 16px; color: #1f2937;">${loc.userName}</strong>
            <span style="background: ${statusBg}; color: ${statusColor}; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 12px;">
              ${statusText}
            </span>
          </div>
          <div style="font-size: 12px; color: #6b7280;">
            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <span><strong>Punch-in:</strong> ${loc.punchInLocation}</span>
            </div>
          </div>
        </div>
        
        <div style="padding: 12px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
          <div style="background: #f3f4f6; padding: 10px; border-radius: 8px; text-align: center;">
            <div style="font-size: 11px; color: #6b7280;">Distance Covered</div>
            <div style="font-size: 16px; font-weight: 700; color: #1f2937;">${loc.distanceCovered} KM</div>
          </div>
          <div style="background: #f3f4f6; padding: 10px; border-radius: 8px; text-align: center;">
            <div style="font-size: 11px; color: #6b7280;">Total Visits</div>
            <div style="font-size: 16px; font-weight: 700; color: #1f2937;">${loc.totalVisits}</div>
          </div>
          <div style="background: #dcfce7; padding: 10px; border-radius: 8px; text-align: center;">
            <div style="font-size: 11px; color: #166534;">Order Value</div>
            <div style="font-size: 16px; font-weight: 700; color: #166534;">₹${loc.orderValue.toLocaleString()}</div>
          </div>
          <div style="background: #dbeafe; padding: 10px; border-radius: 8px; text-align: center;">
            <div style="font-size: 11px; color: #1e40af;">Pre-Order Value</div>
            <div style="font-size: 16px; font-weight: 700; color: #1e40af;">₹${loc.preOrderValue.toLocaleString()}</div>
          </div>
          <div style="background: #f3f4f6; padding: 10px; border-radius: 8px; text-align: center; grid-column: span 2;">
            <div style="font-size: 11px; color: #6b7280;">Last Location Update</div>
            <div style="font-size: 14px; font-weight: 600; color: #1f2937;">${loc.lastActiveTime}</div>
          </div>
        </div>
      </div>
    `;
  };

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
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const focusOnEmployee = (loc: EmployeeLocation) => {
    setSelectedEmployee(loc.id);
    setViewMode('map');
    if (map.current && mapLoaded) {
      map.current.flyTo({
        center: [loc.longitude, loc.latitude],
        zoom: 14,
        duration: 1000,
      });
      
      const marker = markers.current.find(m => {
        const lngLat = m.getLngLat();
        return Math.abs(lngLat.lng - loc.longitude) < 0.001 && Math.abs(lngLat.lat - loc.latitude) < 0.001;
      });
      if (marker) {
        marker.togglePopup();
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'moving':
        return <Navigation size={14} className="text-success animate-pulse" />;
      case 'completed':
        return <Route size={14} className="text-blue-500" />;
      default:
        return <MapPin size={14} className="text-warning" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      moving: 'bg-success/10 text-success border border-success/20',
      completed: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
      stationary: 'bg-warning/10 text-warning border border-warning/20'
    };
    const labels = {
      moving: '🟢 Moving',
      completed: '🔵 Completed',
      stationary: '🟡 Stationary'
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const exportToCSV = () => {
    const headers = ['Employee Name', 'Employee Code', 'Status', 'Last Active', 'Current Location', 'Distance (KM)', 'Total Visits', 'Order Value', 'Pre-Order Value', 'Tracking Start', 'Tracking End'];
    const rows = filteredLocations.map(loc => [
      loc.userName,
      loc.employeeCode,
      loc.status,
      loc.lastActiveTime,
      loc.address,
      loc.distanceCovered,
      loc.totalVisits,
      loc.orderValue,
      loc.preOrderValue,
      loc.trackingStartTime,
      loc.trackingEndTime || '-'
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `live-tracking-${dateFilter}.csv`;
    a.click();
    toast.success('Export completed');
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
            <span className="text-sm text-success font-medium">{filteredLocations.length} Online</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-xl border border-border">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-40"
        />
        <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Employees" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employees</SelectItem>
            {locations.map(loc => (
              <SelectItem key={loc.id} value={loc.id}>{loc.userName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-muted-foreground">Auto-refresh</span>
          <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw size={14} className="mr-1" /> Refresh
        </Button>
        <Button variant="outline" size="sm" onClick={exportToCSV}>
          <Download size={14} className="mr-1" /> Export
        </Button>
        <div className="flex items-center gap-1 border rounded-lg p-1">
          <Button
            variant={viewMode === 'map' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('map')}
          >
            Map
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            Table
          </Button>
        </div>
      </div>

      {viewMode === 'map' ? (
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
                  <div className="w-4 h-4 rounded-full bg-success border-2 border-white shadow animate-pulse" />
                  <span className="text-muted-foreground">Moving</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-warning border-2 border-white shadow" />
                  <span className="text-muted-foreground">Stationary</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow" />
                  <span className="text-muted-foreground">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span className="text-muted-foreground">Start Point</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span className="text-muted-foreground">Latest Point</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-blue-500 rounded" />
                  <span className="text-muted-foreground">Route</span>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Cards List */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users size={18} className="text-primary" />
              Field Executives
            </h3>
            <div className="space-y-3 max-h-[520px] overflow-y-auto scrollbar-thin">
              {filteredLocations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No active employees found</p>
              ) : (
                filteredLocations.map((loc) => (
                  <motion.div
                    key={loc.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => focusOnEmployee(loc)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedEmployee === loc.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(loc.status)}
                        <div>
                          <p className="font-medium text-foreground">{loc.userName}</p>
                          <p className="text-xs text-muted-foreground">{loc.employeeCode}</p>
                        </div>
                      </div>
                      {getStatusBadge(loc.status)}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <MapPin size={12} />
                      <span className="truncate">{loc.address}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Route size={12} />
                        <span>{loc.distanceCovered} KM</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users size={12} />
                        <span>{loc.totalVisits} Visits</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-success/10 text-success px-2 py-1 rounded text-center">
                        ₹{loc.orderValue.toLocaleString()}
                      </div>
                      <div className="bg-blue-500/10 text-blue-500 px-2 py-1 rounded text-center">
                        ₹{loc.preOrderValue.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {loc.lastActiveTime}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee Name</TableHead>
                <TableHead>Employee Code</TableHead>
                <TableHead>Current Status</TableHead>
                <TableHead>Last Active Time</TableHead>
                <TableHead>Current Location</TableHead>
                <TableHead>Distance Covered</TableHead>
                <TableHead>Total Visits</TableHead>
                <TableHead>Tracking Start</TableHead>
                <TableHead>Tracking End</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLocations.map((loc) => (
                <TableRow key={loc.id}>
                  <TableCell className="font-medium">{loc.userName}</TableCell>
                  <TableCell>{loc.employeeCode}</TableCell>
                  <TableCell>{getStatusBadge(loc.status)}</TableCell>
                  <TableCell>{loc.lastActiveTime}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{loc.address}</TableCell>
                  <TableCell>{loc.distanceCovered} KM</TableCell>
                  <TableCell>{loc.totalVisits}</TableCell>
                  <TableCell>{loc.trackingStartTime}</TableCell>
                  <TableCell>
                    {loc.status === 'completed' && loc.trackingEndTime ? loc.trackingEndTime : '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => focusOnEmployee(loc)}
                    >
                      <Eye size={14} className="mr-1" /> View Live Map
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
