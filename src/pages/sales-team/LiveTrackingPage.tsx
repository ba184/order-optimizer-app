import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Navigation,
  MapPin,
  Clock,
  Battery,
  Users,
  Signal,
  AlertCircle,
  Key,
  Loader2,
  Route,
  Package,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { useEmployeeLocations } from "@/hooks/useSalesTeamData";
import { formatDistanceToNow } from "date-fns";

import "mapbox-gl/dist/mapbox-gl.css";

interface VisitedDistributor {
  name: string;
  address: string;
  visitTime: string;
  products: string[];
  orderValue: number;
}

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
  status: "moving" | "stationary" | "traveled";
  traveledKm?: number;
  visitedDistributors?: VisitedDistributor[];
  routeCoordinates?: [number, number][];
  currentSpeed?: number;
}

// Dummy data for demonstration
const dummyEmployees: EmployeeLocation[] = [
  {
    id: "dummy-1",
    user_id: "dummy-user-1",
    userName: "Rajesh Kumar",
    latitude: 28.6139,
    longitude: 77.209,
    address: "Connaught Place, New Delhi",
    timestamp: "2 minutes ago",
    battery_level: 85,
    is_moving: true,
    zone: "North Delhi",
    city: "New Delhi",
    status: "moving",
    currentSpeed: 25,
    traveledKm: 4.2,
    visitedDistributors: [
      {
        name: "ABC Distributors",
        address: "Karol Bagh, Delhi",
        visitTime: "09:30 AM",
        products: ["Product A", "Product B", "Product C"],
        orderValue: 15000,
      },
    ],
    routeCoordinates: [
      [77.205, 28.61],
      [77.207, 28.612],
      [77.209, 28.6139],
    ],
  },
  {
    id: "dummy-2",
    user_id: "dummy-user-2",
    userName: "Priya Sharma",
    latitude: 28.628,
    longitude: 77.219,
    address: "Civil Lines, New Delhi",
    timestamp: "5 minutes ago",
    battery_level: 92,
    is_moving: false,
    zone: "North Delhi",
    city: "New Delhi",
    status: "stationary",
    traveledKm: 2.8,
    visitedDistributors: [
      {
        name: "XYZ Enterprises",
        address: "Civil Lines, Delhi",
        visitTime: "10:15 AM",
        products: ["Product D", "Product E"],
        orderValue: 8500,
      },
      {
        name: "Metro Traders",
        address: "Model Town, Delhi",
        visitTime: "11:00 AM",
        products: ["Product A", "Product F"],
        orderValue: 12000,
      },
    ],
  },
  {
    id: "dummy-3",
    user_id: "dummy-user-3",
    userName: "Amit Singh",
    latitude: 28.585,
    longitude: 77.25,
    address: "Lajpat Nagar, New Delhi",
    timestamp: "15 minutes ago",
    battery_level: 67,
    is_moving: false,
    zone: "South Delhi",
    city: "New Delhi",
    status: "traveled",
    traveledKm: 18.5,
    visitedDistributors: [
      {
        name: "Premier Distributors",
        address: "Saket, Delhi",
        visitTime: "08:00 AM",
        products: ["Product A", "Product B", "Product G"],
        orderValue: 25000,
      },
      {
        name: "National Traders",
        address: "Green Park, Delhi",
        visitTime: "09:30 AM",
        products: ["Product C", "Product D"],
        orderValue: 18000,
      },
      {
        name: "Supreme Wholesalers",
        address: "Defence Colony, Delhi",
        visitTime: "11:00 AM",
        products: ["Product E", "Product F", "Product H"],
        orderValue: 32000,
      },
      {
        name: "Royal Enterprises",
        address: "Lajpat Nagar, Delhi",
        visitTime: "12:30 PM",
        products: ["Product A", "Product I"],
        orderValue: 15000,
      },
    ],
    routeCoordinates: [
      [77.2167, 28.5245], // Saket
      [77.2065, 28.5594], // Green Park
      [77.2295, 28.5715], // Defence Colony
      [77.25, 28.585], // Lajpat Nagar (current)
    ],
  },
];

export default function LiveTrackingPage() {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [mapboxToken, setMapboxToken] = useState(
    "pk.eyJ1IjoiYWJoaTAwMDEiLCJhIjoiY21peWlvdGtrMDdyeDNlc2R2YzNmbTgxcyJ9.CFTqYpkBUENiseB1xKMwYQ"
  );
  const [showTokenInput, setShowTokenInput] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [movingMarkerPosition, setMovingMarkerPosition] = useState<
    [number, number]
  >([77.209, 28.6139]);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const animationRef = useRef<number | null>(null);

  const { data: locationsData, isLoading } = useEmployeeLocations();

  // Transform real data and merge with dummy data
  const realLocations: EmployeeLocation[] = (locationsData || []).map(
    (loc: any) => ({
      id: loc.id,
      user_id: loc.user_id,
      userName: loc.profiles?.name || "Unknown",
      latitude: Number(loc.latitude),
      longitude: Number(loc.longitude),
      address: loc.address || "Unknown location",
      timestamp: loc.recorded_at
        ? formatDistanceToNow(new Date(loc.recorded_at), { addSuffix: true })
        : "N/A",
      battery_level: loc.battery_level || 100,
      is_moving: loc.is_moving || false,
      zone: loc.profiles?.region || "N/A",
      city: loc.profiles?.territory || "N/A",
      status: loc.is_moving ? "moving" : ("stationary" as const),
    })
  );

  // Combine real and dummy data
  const locations: EmployeeLocation[] = [...dummyEmployees, ...realLocations];

  // Animate the moving marker
  useEffect(() => {
    setTimeout(() => {
      (async () => await initializeMap())();
    }, 500);
    let step = 0;
    const animateMovingMarker = () => {
      step += 0.002;
      const newLng = 77.209 + Math.sin(step) * 0.005;
      const newLat = 28.6139 + Math.cos(step * 0.5) * 0.003;
      setMovingMarkerPosition([newLng, newLat]);

      // Update the dummy moving employee position
      if (map.current && map.current.getSource("moving-point")) {
        map.current.getSource("moving-point").setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "Point",
            coordinates: [newLng, newLat],
          },
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
    try {
      const mapboxgl = (await import("mapbox-gl")).default;
      mapboxgl.accessToken =
        "pk.eyJ1IjoiYWJoaTAwMDEiLCJhIjoiY21peWlvdGtrMDdyeDNlc2R2YzNmbTgxcyJ9.CFTqYpkBUENiseB1xKMwYQ";

      const center: [number, number] = [77.22, 28.6];

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
    // Clear existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // Add traveled route for Amit Singh (dummy-3)
    const traveledEmployee = dummyEmployees.find((e) => e.id === "dummy-3");
    if (traveledEmployee?.routeCoordinates) {
      map.current.addSource("traveled-route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: traveledEmployee.routeCoordinates,
          },
        },
      });

      // Highlighted route line
      map.current.addLayer({
        id: "traveled-route-line",
        type: "line",
        source: "traveled-route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#8b5cf6",
          "line-width": 6,
          "line-opacity": 0.8,
        },
      });

      // Glow effect
      map.current.addLayer(
        {
          id: "traveled-route-glow",
          type: "line",
          source: "traveled-route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#a78bfa",
            "line-width": 12,
            "line-opacity": 0.3,
          },
        },
        "traveled-route-line"
      );

      // Add visit point markers along the route
      traveledEmployee.routeCoordinates.forEach((coord, index) => {
        const visitEl = document.createElement("div");
        visitEl.style.cssText = `
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.5);
        `;

        const visitMarker = new mapboxgl.Marker(visitEl)
          .setLngLat(coord)
          .addTo(map.current);
        markers.current.push(visitMarker);
      });
    }

    // Add moving trail for Rajesh Kumar (dummy-1)
    const movingEmployee = dummyEmployees.find((e) => e.id === "dummy-1");
    if (movingEmployee?.routeCoordinates) {
      map.current.addSource("moving-trail", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: movingEmployee.routeCoordinates,
          },
        },
      });

      map.current.addLayer({
        id: "moving-trail-line",
        type: "line",
        source: "moving-trail",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#22c55e",
          "line-width": 4,
          "line-dasharray": [2, 2],
        },
      });

      // Moving point source
      map.current.addSource("moving-point", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Point",
            coordinates: [movingEmployee.longitude, movingEmployee.latitude],
          },
        },
      });

      map.current.addLayer({
        id: "moving-point-pulse",
        type: "circle",
        source: "moving-point",
        paint: {
          "circle-radius": 20,
          "circle-color": "#22c55e",
          "circle-opacity": 0.3,
        },
      });
    }

    // Add markers for all employees
    locations.forEach((loc) => {
      const isDummy = loc.id.startsWith("dummy-");

      // Add radius circle for stationary and traveled employees
      if (loc.status !== "moving" || !isDummy) {
        const radiusSourceId = `radius-${loc.id}`;

        if (!map.current.getSource(radiusSourceId)) {
          map.current.addSource(radiusSourceId, {
            type: "geojson",
            data: createCircleGeoJSON(
              loc.longitude,
              loc.latitude,
              loc.status === "traveled" ? 0.3 : 0.5
            ),
          });

          const fillColor =
            loc.status === "traveled"
              ? "#8b5cf6"
              : loc.status === "moving"
              ? "#22c55e"
              : "#f59e0b";

          map.current.addLayer({
            id: `${radiusSourceId}-fill`,
            type: "fill",
            source: radiusSourceId,
            paint: {
              "fill-color": fillColor,
              "fill-opacity": 0.15,
            },
          });

          map.current.addLayer({
            id: `${radiusSourceId}-border`,
            type: "line",
            source: radiusSourceId,
            paint: {
              "line-color": fillColor,
              "line-width": 2,
              "line-opacity": 0.5,
            },
          });
        }
      }

      // Create marker element
      const el = document.createElement("div");
      el.className = "employee-marker";

      const markerColor =
        loc.status === "traveled"
          ? "hsl(263, 70%, 50%)"
          : loc.status === "moving"
          ? "hsl(142, 71%, 45%)"
          : "hsl(38, 92%, 50%)";

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

      el.innerHTML = loc.userName
        .split(" ")
        .map((n) => n[0])
        .join("");

      // Add pulsing animation for moving employee
      if (loc.status === "moving" && isDummy) {
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

      // Create detailed popup
      const popupContent = createPopupContent(loc);
      const popup = new mapboxgl.Popup({
        offset: 25,
        maxWidth: "350px",
        className: "custom-popup",
      }).setHTML(popupContent);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([loc.longitude, loc.latitude])
        .setPopup(popup)
        .addTo(map.current);

      el.addEventListener("click", () => setSelectedEmployee(loc.id));
      markers.current.push(marker);
    });

    // Add CSS for pulse animation
    const style = document.createElement("style");
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
    const statusColor =
      loc.status === "traveled"
        ? "#8b5cf6"
        : loc.status === "moving"
        ? "#22c55e"
        : "#f59e0b";
    const statusBg =
      loc.status === "traveled"
        ? "#f3e8ff"
        : loc.status === "moving"
        ? "#dcfce7"
        : "#fef3c7";
    const statusText =
      loc.status === "traveled"
        ? "Route Completed"
        : loc.status === "moving"
        ? "Currently Moving"
        : "At Location";

    let distributorHtml = "";
    if (loc.visitedDistributors && loc.visitedDistributors.length > 0) {
      distributorHtml = `
        <div style="border-top: 1px solid #e5e7eb; padding: 12px; background: #f9fafb;">
          <div style="font-weight: 600; font-size: 13px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${statusColor}" stroke-width="2">
              <path d="M3 21h18M3 7v1a3 3 0 006 0V7m0 1a3 3 0 006 0V7m0 1a3 3 0 006 0V7H3l2-4h14l2 4M5 21V10.85M19 21V10.85"/>
            </svg>
            Visited Distributors (${loc.visitedDistributors.length})
          </div>
          ${loc.visitedDistributors
            .map(
              (dist, idx) => `
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; margin-bottom: ${
              idx < loc.visitedDistributors!.length - 1 ? "8px" : "0"
            };">
              <div style="font-weight: 600; font-size: 12px; color: #1f2937;">${
                dist.name
              }</div>
              <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">${
                dist.address
              }</div>
              <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">🕐 ${
                dist.visitTime
              }</div>
              <div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 4px;">
                ${dist.products
                  .map(
                    (p) => `
                  <span style="background: #e0f2fe; color: #0369a1; font-size: 10px; padding: 2px 6px; border-radius: 4px;">${p}</span>
                `
                  )
                  .join("")}
              </div>
              <div style="margin-top: 8px; font-size: 12px; font-weight: 600; color: #059669;">
                ₹${dist.orderValue.toLocaleString()}
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      `;
    }

    const totalOrderValue =
      loc.visitedDistributors?.reduce((sum, d) => sum + d.orderValue, 0) || 0;

    return `
      <div style="min-width: 280px; font-family: system-ui, -apple-system, sans-serif;">
        <div style="padding: 16px; background: linear-gradient(135deg, ${statusColor}22, ${statusColor}11);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <strong style="font-size: 16px; color: #1f2937;">${
              loc.userName
            }</strong>
            <span style="background: ${statusBg}; color: ${statusColor}; font-size: 11px; font-weight: 600; padding: 4px 8px; border-radius: 12px;">
              ${statusText}
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px; color: #6b7280; font-size: 12px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            ${loc.address}
          </div>
        </div>
        
        <div style="padding: 12px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
          <div style="background: #f3f4f6; padding: 8px; border-radius: 8px; text-align: center;">
            <div style="font-size: 11px; color: #6b7280;">Travel Distance</div>
            <div style="font-size: 16px; font-weight: 700; color: #1f2937;">${
              loc.traveledKm || 0
            } km</div>
          </div>
          <div style="background: #f3f4f6; padding: 8px; border-radius: 8px; text-align: center;">
            <div style="font-size: 11px; color: #6b7280;">Total Orders</div>
            <div style="font-size: 16px; font-weight: 700; color: #059669;">₹${totalOrderValue.toLocaleString()}</div>
          </div>
          <div style="background: #f3f4f6; padding: 8px; border-radius: 8px; text-align: center;">
            <div style="font-size: 11px; color: #6b7280;">Battery</div>
            <div style="font-size: 16px; font-weight: 700; color: ${
              loc.battery_level < 50 ? "#f59e0b" : "#22c55e"
            };">${loc.battery_level}%</div>
          </div>
          <div style="background: #f3f4f6; padding: 8px; border-radius: 8px; text-align: center;">
            <div style="font-size: 11px; color: #6b7280;">Last Update</div>
            <div style="font-size: 12px; font-weight: 600; color: #1f2937;">${
              loc.timestamp
            }</div>
          </div>
          ${
            loc.currentSpeed !== undefined
              ? `
            <div style="background: #dcfce7; padding: 8px; border-radius: 8px; text-align: center; grid-column: span 2;">
              <div style="font-size: 11px; color: #166534;">Current Speed</div>
              <div style="font-size: 16px; font-weight: 700; color: #166534;">${loc.currentSpeed} km/h</div>
            </div>
          `
              : ""
          }
        </div>

        ${distributorHtml}
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

      const dLng = dx / (111.32 * Math.cos((lat * Math.PI) / 180));
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
    if (map.current && mapLoaded) {
      map.current.flyTo({
        center: [loc.longitude, loc.latitude],
        zoom: 14,
        duration: 1000,
      });

      // Open the popup for this employee
      const marker = markers.current.find((m) => {
        const lngLat = m.getLngLat();
        return (
          Math.abs(lngLat.lng - loc.longitude) < 0.001 &&
          Math.abs(lngLat.lat - loc.latitude) < 0.001
        );
      });
      if (marker) {
        marker.togglePopup();
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "moving":
        return <Navigation size={14} className="text-success animate-pulse" />;
      case "traveled":
        return <Route size={14} className="text-violet-500" />;
      default:
        return <MapPin size={14} className="text-warning" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      moving: "bg-success/10 text-success",
      traveled: "bg-violet-500/10 text-violet-500",
      stationary: "bg-warning/10 text-warning",
    };
    const labels = {
      moving: "Moving",
      traveled: "Completed",
      stationary: "Stationary",
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
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
          <p className="text-muted-foreground">
            Real-time employee location monitoring
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-lg">
            <Signal size={16} className="text-success" />
            <span className="text-sm text-success font-medium">
              {locations.length} Online
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          <div className="h-[500px] relative">
            {/* {showTokenInput ? (
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
            ) : null} */}

            <div ref={mapContainer} className="absolute inset-0" />

            {!mapLoaded && !showTokenInput && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                <div className="text-center">
                  <Navigation
                    size={48}
                    className="text-muted-foreground mx-auto mb-4 animate-pulse"
                  />
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
                <div className="w-4 h-4 rounded-full bg-violet-500 border-2 border-white shadow" />
                <span className="text-muted-foreground">Route Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-violet-500 rounded" />
                <span className="text-muted-foreground">Travel Route</span>
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
              <p className="text-center text-muted-foreground py-8">
                No active employees found
              </p>
            ) : (
              locations.map((loc) => (
                <motion.div
                  key={loc.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => focusOnEmployee(loc)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedEmployee === loc.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(loc.status)}
                      <div>
                        <p className="font-medium text-foreground">
                          {loc.userName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {loc.zone} • {loc.city}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(loc.status)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin size={12} />
                    <span className="truncate">{loc.address}</span>
                  </div>

                  {/* Additional info for dummy employees */}
                  {loc.traveledKm !== undefined && (
                    <div className="mt-2 flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Route size={12} />
                        <span>{loc.traveledKm} km</span>
                      </div>
                      {loc.visitedDistributors && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Building2 size={12} />
                          <span>{loc.visitedDistributors.length} visits</span>
                        </div>
                      )}
                      {loc.visitedDistributors && (
                        <div className="flex items-center gap-1 text-success">
                          <Package size={12} />
                          <span>
                            ₹
                            {loc.visitedDistributors
                              .reduce((s, d) => s + d.orderValue, 0)
                              .toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      {loc.timestamp}
                    </div>
                    <div className="flex items-center gap-1">
                      <Battery
                        size={12}
                        className={
                          loc.battery_level < 50
                            ? "text-warning"
                            : "text-success"
                        }
                      />
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
