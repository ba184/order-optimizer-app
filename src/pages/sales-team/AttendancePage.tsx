import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GeoFilter } from '@/components/ui/GeoFilter';
import { GeoFilter as GeoFilterType } from '@/data/geoData';
import {
  MapPin,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  Navigation,
} from 'lucide-react';

interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: string;
  loginTime: string;
  logoutTime: string | null;
  loginLocation: string;
  totalDistance: number;
  visitCount: number;
  ordersPlaced: number;
  status: 'active' | 'pending' | 'inactive';
  zone: string;
  city: string;
  latitude: number;
  longitude: number;
}

const mockAttendance: AttendanceRecord[] = [
  { id: '1', userId: 'se-001', userName: 'Rajesh Kumar', date: '2024-12-09', loginTime: '09:15 AM', logoutTime: '06:30 PM', loginLocation: 'Connaught Place, Delhi', totalDistance: 45.2, visitCount: 12, ordersPlaced: 8, status: 'active', zone: 'North Zone', city: 'New Delhi', latitude: 28.6139, longitude: 77.2090 },
  { id: '2', userId: 'se-002', userName: 'Amit Sharma', date: '2024-12-09', loginTime: '09:30 AM', logoutTime: null, loginLocation: 'Lajpat Nagar, Delhi', totalDistance: 32.8, visitCount: 8, ordersPlaced: 5, status: 'active', zone: 'North Zone', city: 'New Delhi', latitude: 28.5355, longitude: 77.2500 },
  { id: '3', userId: 'se-003', userName: 'Priya Singh', date: '2024-12-09', loginTime: '09:00 AM', logoutTime: '05:45 PM', loginLocation: 'Karol Bagh, Delhi', totalDistance: 38.5, visitCount: 10, ordersPlaced: 7, status: 'active', zone: 'North Zone', city: 'New Delhi', latitude: 28.6519, longitude: 77.2315 },
  { id: '4', userId: 'se-004', userName: 'Vikram Patel', date: '2024-12-09', loginTime: '--', logoutTime: null, loginLocation: '--', totalDistance: 0, visitCount: 0, ordersPlaced: 0, status: 'inactive', zone: 'South Zone', city: 'Mumbai', latitude: 19.0760, longitude: 72.8777 },
  { id: '5', userId: 'se-005', userName: 'Sunita Gupta', date: '2024-12-09', loginTime: '10:15 AM', logoutTime: null, loginLocation: 'Rohini, Delhi', totalDistance: 22.1, visitCount: 6, ordersPlaced: 4, status: 'pending', zone: 'North Zone', city: 'New Delhi', latitude: 28.7041, longitude: 77.1025 },
];

export default function AttendancePage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [geoFilter, setGeoFilter] = useState<GeoFilterType>({ country: 'India' });

  const filteredAttendance = mockAttendance.filter(att => {
    if (geoFilter.zone && att.zone !== geoFilter.zone) return false;
    if (geoFilter.city && att.city !== geoFilter.city) return false;
    return true;
  });

  const stats = {
    present: filteredAttendance.filter(a => a.status === 'active').length,
    absent: filteredAttendance.filter(a => a.status === 'inactive').length,
    onField: filteredAttendance.filter(a => a.status === 'active' && !a.logoutTime).length,
    totalDistance: filteredAttendance.reduce((sum, a) => sum + a.totalDistance, 0),
  };

  const columns = [
    {
      key: 'userName',
      header: 'Sales Executive',
      render: (item: AttendanceRecord) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">
              {item.userName.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="font-medium text-foreground">{item.userName}</p>
            <p className="text-xs text-muted-foreground">{item.zone} • {item.city}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'loginTime',
      header: 'Login Time',
      render: (item: AttendanceRecord) => (
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-muted-foreground" />
          <span>{item.loginTime}</span>
        </div>
      ),
    },
    {
      key: 'loginLocation',
      header: 'Location',
      render: (item: AttendanceRecord) => (
        <div className="flex items-center gap-2 max-w-[200px]">
          <MapPin size={14} className="text-muted-foreground shrink-0" />
          <span className="truncate">{item.loginLocation}</span>
        </div>
      ),
    },
    {
      key: 'totalDistance',
      header: 'Distance',
      render: (item: AttendanceRecord) => (
        <span>{item.totalDistance > 0 ? `${item.totalDistance} km` : '--'}</span>
      ),
      sortable: true,
    },
    { key: 'visitCount', header: 'Visits', sortable: true },
    { key: 'ordersPlaced', header: 'Orders', sortable: true },
    {
      key: 'status',
      header: 'Status',
      render: (item: AttendanceRecord) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: AttendanceRecord) => (
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="View Details">
            <Eye size={16} className="text-muted-foreground" />
          </button>
          {item.status === 'active' && (
            <button 
              onClick={() => navigate('/sales-team/tracking')}
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors" 
              title="Track Location"
            >
              <Navigation size={16} className="text-primary" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Attendance Tracking</h1>
          <p className="text-muted-foreground">Monitor team attendance with geo-fenced login/logout</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="input-field pl-10 pr-4"
            />
          </div>
          <button 
            onClick={() => navigate('/sales-team/tracking')}
            className="btn-primary flex items-center gap-2"
          >
            <Navigation size={18} />
            Live Tracking
          </button>
        </div>
      </div>

      {/* Geo Filter */}
      <GeoFilter value={geoFilter} onChange={setGeoFilter} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <CheckCircle size={24} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.present}</p>
              <p className="text-sm text-muted-foreground">Present Today</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/10">
              <XCircle size={24} className="text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.absent}</p>
              <p className="text-sm text-muted-foreground">Absent</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-info/10">
              <MapPin size={24} className="text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.onField}</p>
              <p className="text-sm text-muted-foreground">On Field</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10">
              <Navigation size={24} className="text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalDistance.toFixed(0)} km</p>
              <p className="text-sm text-muted-foreground">Total Distance</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Data Table */}
      <DataTable data={filteredAttendance} columns={columns} searchPlaceholder="Search by name, location..." />
    </div>
  );
}