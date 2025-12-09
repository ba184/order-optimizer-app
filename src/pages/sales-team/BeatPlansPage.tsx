import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Plus,
  Calendar,
  Target,
  MapPin,
  Users,
  CheckCircle,
  Clock,
  Eye,
  Edit,
} from 'lucide-react';

interface BeatPlan {
  id: string;
  userId: string;
  userName: string;
  month: string;
  year: number;
  totalRoutes: number;
  totalRetailers: number;
  plannedVisits: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedBy?: string;
}

const mockBeatPlans: BeatPlan[] = [
  {
    id: 'bp-001',
    userId: 'se-001',
    userName: 'Rajesh Kumar',
    month: 'December',
    year: 2024,
    totalRoutes: 6,
    totalRetailers: 85,
    plannedVisits: 340,
    status: 'approved',
    createdAt: '2024-11-25',
    approvedBy: 'Priya Sharma (ASM)',
  },
  {
    id: 'bp-002',
    userId: 'se-002',
    userName: 'Amit Sharma',
    month: 'December',
    year: 2024,
    totalRoutes: 5,
    totalRetailers: 72,
    plannedVisits: 288,
    status: 'pending',
    createdAt: '2024-11-28',
  },
  {
    id: 'bp-003',
    userId: 'se-003',
    userName: 'Priya Singh',
    month: 'December',
    year: 2024,
    totalRoutes: 6,
    totalRetailers: 90,
    plannedVisits: 360,
    status: 'approved',
    createdAt: '2024-11-24',
    approvedBy: 'Priya Sharma (ASM)',
  },
  {
    id: 'bp-004',
    userId: 'se-004',
    userName: 'Vikram Patel',
    month: 'December',
    year: 2024,
    totalRoutes: 4,
    totalRetailers: 60,
    plannedVisits: 240,
    status: 'draft',
    createdAt: '2024-12-01',
  },
  {
    id: 'bp-005',
    userId: 'se-005',
    userName: 'Sunita Gupta',
    month: 'December',
    year: 2024,
    totalRoutes: 5,
    totalRetailers: 68,
    plannedVisits: 272,
    status: 'rejected',
    createdAt: '2024-11-26',
  },
];

const columns = [
  {
    key: 'userName',
    header: 'Sales Executive',
    render: (item: BeatPlan) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-xs font-semibold text-primary">
            {item.userName.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div>
          <p className="font-medium text-foreground">{item.userName}</p>
          <p className="text-xs text-muted-foreground">{item.userId}</p>
        </div>
      </div>
    ),
    sortable: true,
  },
  {
    key: 'period',
    header: 'Period',
    render: (item: BeatPlan) => (
      <div className="flex items-center gap-2">
        <Calendar size={14} className="text-muted-foreground" />
        <span>{item.month} {item.year}</span>
      </div>
    ),
  },
  {
    key: 'totalRoutes',
    header: 'Routes',
    render: (item: BeatPlan) => (
      <div className="flex items-center gap-2">
        <MapPin size={14} className="text-muted-foreground" />
        <span>{item.totalRoutes}</span>
      </div>
    ),
    sortable: true,
  },
  {
    key: 'totalRetailers',
    header: 'Retailers',
    sortable: true,
  },
  {
    key: 'plannedVisits',
    header: 'Planned Visits',
    render: (item: BeatPlan) => (
      <div className="flex items-center gap-2">
        <Target size={14} className="text-muted-foreground" />
        <span>{item.plannedVisits}</span>
      </div>
    ),
    sortable: true,
  },
  {
    key: 'status',
    header: 'Status',
    render: (item: BeatPlan) => <StatusBadge status={item.status} />,
  },
  {
    key: 'approvedBy',
    header: 'Approved By',
    render: (item: BeatPlan) => (
      <span className="text-sm text-muted-foreground">
        {item.approvedBy || '--'}
      </span>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (item: BeatPlan) => (
      <div className="flex items-center gap-1">
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <Eye size={16} className="text-muted-foreground" />
        </button>
        {(item.status === 'draft' || item.status === 'rejected') && (
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Edit size={16} className="text-muted-foreground" />
          </button>
        )}
      </div>
    ),
  },
];

export default function BeatPlansPage() {
  const [selectedMonth, setSelectedMonth] = useState('December 2024');

  const stats = {
    total: mockBeatPlans.length,
    approved: mockBeatPlans.filter(bp => bp.status === 'approved').length,
    pending: mockBeatPlans.filter(bp => bp.status === 'pending').length,
    draft: mockBeatPlans.filter(bp => bp.status === 'draft').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Beat Plans / Journey Plans</h1>
          <p className="text-muted-foreground">Monthly route planning and approval workflow</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="input-field">
            <option>December 2024</option>
            <option>January 2025</option>
            <option>February 2025</option>
          </select>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Create Plan
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Users size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Plans</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <CheckCircle size={24} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <Clock size={24} className="text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending Approval</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-muted">
              <Target size={24} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.draft}</p>
              <p className="text-sm text-muted-foreground">In Draft</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Data Table */}
      <DataTable
        data={mockBeatPlans}
        columns={columns}
        searchPlaceholder="Search by executive name..."
      />
    </div>
  );
}
