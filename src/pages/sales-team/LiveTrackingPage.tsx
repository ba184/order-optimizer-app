import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation, MapPin, Clock, Battery, Users, Signal } from 'lucide-react';

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
}

const mockLocations: EmployeeLocation[] = [
  { id: '1', userId: 'se-001', userName: 'Rajesh Kumar', latitude: 28.6139, longitude: 77.2090, address: 'Connaught Place, Delhi', timestamp: '2 mins ago', batteryLevel: 85, isMoving: true, zone: 'North Zone', city: 'New Delhi' },
  { id: '2', userId: 'se-002', userName: 'Amit Sharma', latitude: 28.5355, longitude: 77.2500, address: 'Lajpat Nagar, Delhi', timestamp: '5 mins ago', batteryLevel: 62, isMoving: false, zone: 'North Zone', city: 'New Delhi' },
  { id: '3', userId: 'se-003', userName: 'Priya Singh', latitude: 28.6519, longitude: 77.2315, address: 'Karol Bagh, Delhi', timestamp: '1 min ago', batteryLevel: 91, isMoving: true, zone: 'North Zone', city: 'New Delhi' },
  { id: '4', userId: 'se-004', userName: 'Vikram Patel', latitude: 28.7041, longitude: 77.1025, address: 'Rohini, Delhi', timestamp: '8 mins ago', batteryLevel: 45, isMoving: false, zone: 'North Zone', city: 'New Delhi' },
];

export default function LiveTrackingPage() {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="module-title">Live GPS Tracking</h1>
          <p className="text-muted-foreground">Real-time employee location monitoring</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-lg">
          <Signal size={16} className="text-success" />
          <span className="text-sm text-success font-medium">{mockLocations.length} Online</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          <div className="h-[500px] bg-muted/50 flex items-center justify-center relative">
            <div className="text-center">
              <Navigation size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Map View</p>
              <p className="text-sm text-muted-foreground/60">Integration with Google Maps / Mapbox</p>
            </div>
            {/* Employee pins simulation */}
            {mockLocations.map((loc, i) => (
              <motion.div
                key={loc.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`absolute w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                  loc.isMoving ? 'bg-success' : 'bg-warning'
                }`}
                style={{ left: `${20 + i * 15}%`, top: `${30 + (i % 2) * 20}%` }}
                onClick={() => setSelectedEmployee(loc.id)}
              >
                <MapPin size={16} className="text-white" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Employee List */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users size={18} className="text-primary" />
            Field Executives
          </h3>
          <div className="space-y-3">
            {mockLocations.map(loc => (
              <motion.div
                key={loc.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedEmployee(loc.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedEmployee === loc.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-foreground">{loc.userName}</p>
                    <p className="text-xs text-muted-foreground">{loc.zone} • {loc.city}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    loc.isMoving ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                  }`}>
                    {loc.isMoving ? 'Moving' : 'Stationary'}
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
                    <Battery size={12} className={loc.batteryLevel < 50 ? 'text-warning' : 'text-success'} />
                    {loc.batteryLevel}%
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
