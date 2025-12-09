import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GeoFilter } from '@/components/ui/GeoFilter';
import { geoHierarchy } from '@/data/geoData';
import {
  Plus,
  Users,
  User,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  Shield,
  Key,
  Navigation,
  Eye,
  X,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';
import { UserRole } from '@/types';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  zone: string;
  city: string;
  area: string;
  reportingTo?: string;
  reportingToName?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

const mockUsers: UserData[] = [
  { id: 'admin-001', name: 'Suresh Patel', email: 'suresh@toagosei.com', phone: '+91 98765 43213', role: 'admin', zone: '', city: '', area: '', status: 'active', createdAt: '2024-01-01' },
  { id: 'rsm-001', name: 'Vikram Singh', email: 'vikram@toagosei.com', phone: '+91 98765 43212', role: 'rsm', zone: 'North Zone', city: '', area: '', reportingTo: 'admin-001', reportingToName: 'Suresh Patel', status: 'active', createdAt: '2024-01-15' },
  { id: 'asm-001', name: 'Priya Sharma', email: 'priya@toagosei.com', phone: '+91 98765 43211', role: 'asm', zone: 'North Zone', city: 'New Delhi', area: '', reportingTo: 'rsm-001', reportingToName: 'Vikram Singh', status: 'active', createdAt: '2024-02-01' },
  { id: 'asm-002', name: 'Rahul Mehta', email: 'rahul@toagosei.com', phone: '+91 98765 43214', role: 'asm', zone: 'South Zone', city: 'Mumbai', area: '', reportingTo: 'rsm-001', reportingToName: 'Vikram Singh', status: 'active', createdAt: '2024-02-15' },
  { id: 'se-001', name: 'Rajesh Kumar', email: 'rajesh@toagosei.com', phone: '+91 98765 43210', role: 'sales_executive', zone: 'North Zone', city: 'New Delhi', area: 'Connaught Place', reportingTo: 'asm-001', reportingToName: 'Priya Sharma', status: 'active', createdAt: '2024-03-01' },
  { id: 'se-002', name: 'Amit Sharma', email: 'amit@toagosei.com', phone: '+91 98765 43215', role: 'sales_executive', zone: 'North Zone', city: 'New Delhi', area: 'Karol Bagh', reportingTo: 'asm-001', reportingToName: 'Priya Sharma', status: 'active', createdAt: '2024-03-15' },
  { id: 'se-003', name: 'Priya Singh', email: 'priyasingh@toagosei.com', phone: '+91 98765 43216', role: 'sales_executive', zone: 'North Zone', city: 'New Delhi', area: 'Lajpat Nagar', reportingTo: 'asm-001', reportingToName: 'Priya Sharma', status: 'active', createdAt: '2024-04-01' },
];

const roleLabels: Record<UserRole, string> = {
  sales_executive: 'Sales Executive',
  asm: 'Area Sales Manager',
  rsm: 'Regional Sales Manager',
  admin: 'Administrator',
};

const roleColors: Record<UserRole, string> = {
  sales_executive: 'bg-info/10 text-info',
  asm: 'bg-secondary/10 text-secondary',
  rsm: 'bg-warning/10 text-warning',
  admin: 'bg-primary/10 text-primary',
};

export default function UsersPage() {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState<UserData | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [geoFilter, setGeoFilter] = useState({ zone: '', city: '', area: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'sales_executive' as UserRole,
    zone: '',
    city: '',
    area: '',
    reportingTo: '',
  });
  const [targetData, setTargetData] = useState({
    salesTarget: '',
    collectionTarget: '',
    visitTarget: '',
    newOutletTarget: '',
    startDate: '',
    endDate: '',
  });

  const filteredUsers = mockUsers.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (geoFilter.zone && u.zone !== geoFilter.zone) return false;
    if (geoFilter.city && u.city !== geoFilter.city) return false;
    return true;
  });

  const handleCreate = () => {
    if (!formData.name || !formData.email || !formData.role) {
      toast.error('Please fill required fields');
      return;
    }
    toast.success('User created successfully');
    setShowCreateModal(false);
    setFormData({ name: '', email: '', phone: '', role: 'sales_executive', zone: '', city: '', area: '', reportingTo: '' });
  };

  const handleSetTarget = () => {
    if (!targetData.salesTarget || !targetData.startDate || !targetData.endDate) {
      toast.error('Please fill required fields');
      return;
    }
    toast.success(`Target set for ${showTargetModal?.name}`);
    setShowTargetModal(null);
    setTargetData({ salesTarget: '', collectionTarget: '', visitTarget: '', newOutletTarget: '', startDate: '', endDate: '' });
  };

  const columns = [
    {
      key: 'name',
      header: 'User',
      render: (item: UserData) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.id}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (item: UserData) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Mail size={14} className="text-muted-foreground" />
            <span>{item.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone size={14} className="text-muted-foreground" />
            <span>{item.phone}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (item: UserData) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[item.role]}`}>
          {roleLabels[item.role]}
        </span>
      ),
    },
    {
      key: 'territory',
      header: 'Territory',
      render: (item: UserData) => (
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-muted-foreground" />
          <span className="text-sm">
            {item.zone || 'All'}{item.city ? ` / ${item.city}` : ''}{item.area ? ` / ${item.area}` : ''}
          </span>
        </div>
      ),
    },
    {
      key: 'reportingTo',
      header: 'Reports To',
      render: (item: UserData) => (
        item.reportingToName ? (
          <span className="text-sm">{item.reportingToName}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: UserData) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: UserData) => (
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="View">
            <Eye size={16} className="text-muted-foreground" />
          </button>
          {item.role === 'sales_executive' && (
            <button 
              onClick={() => navigate('/sales-team/tracking')}
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors" 
              title="Track Location"
            >
              <Navigation size={16} className="text-primary" />
            </button>
          )}
          <button 
            onClick={() => setShowTargetModal(item)}
            className="p-2 hover:bg-success/10 rounded-lg transition-colors" 
            title="Set Target"
          >
            <Target size={16} className="text-success" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Permissions">
            <Shield size={16} className="text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Reset Password">
            <Key size={16} className="text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Edit">
            <Edit size={16} className="text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-destructive/10 rounded-lg transition-colors" title="Delete">
            <Trash2 size={16} className="text-destructive" />
          </button>
        </div>
      ),
    },
  ];

  const stats = {
    total: mockUsers.length,
    admins: mockUsers.filter(u => u.role === 'admin').length,
    rsm: mockUsers.filter(u => u.role === 'rsm').length,
    asm: mockUsers.filter(u => u.role === 'asm').length,
    se: mockUsers.filter(u => u.role === 'sales_executive').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">User Management</h1>
          <p className="text-muted-foreground">Manage users, roles, permissions, and targets</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add User
        </button>
      </div>

      {/* Geo Filter */}
      <GeoFilter geoHierarchy={geoHierarchy} value={geoFilter} onChange={setGeoFilter} />

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { role: 'all', label: 'Total Users', count: stats.total },
          { role: 'admin', label: 'Admins', count: stats.admins },
          { role: 'rsm', label: 'RSM', count: stats.rsm },
          { role: 'asm', label: 'ASM', count: stats.asm },
          { role: 'sales_executive', label: 'Sales Exec', count: stats.se },
        ].map((stat, index) => (
          <motion.div
            key={stat.role}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`stat-card cursor-pointer ${roleFilter === stat.role ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setRoleFilter(stat.role)}
          >
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${stat.role === 'all' ? 'bg-primary/10' : roleColors[stat.role as UserRole] || 'bg-primary/10'}`}>
                <Users size={20} className={stat.role === 'all' ? 'text-primary' : ''} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.count}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Users Table */}
      <DataTable data={filteredUsers} columns={columns} searchPlaceholder="Search users..." />

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Add User</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-muted rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter name"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@toagosei.com"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="input-field"
                >
                  <option value="sales_executive">Sales Executive</option>
                  <option value="asm">Area Sales Manager</option>
                  <option value="rsm">Regional Sales Manager</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Zone</label>
                  <select
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    className="input-field"
                  >
                    <option value="">All Zones</option>
                    <option value="North Zone">North Zone</option>
                    <option value="South Zone">South Zone</option>
                    <option value="East Zone">East Zone</option>
                    <option value="West Zone">West Zone</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Area</label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="Area"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Reports To</label>
                <select
                  value={formData.reportingTo}
                  onChange={(e) => setFormData({ ...formData, reportingTo: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select Manager</option>
                  {mockUsers.filter(u => u.role !== 'sales_executive').map((user) => (
                    <option key={user.id} value={user.id}>{user.name} ({roleLabels[user.role]})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="btn-outline">Cancel</button>
              <button onClick={handleCreate} className="btn-primary">Create User</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Set Target Modal */}
      {showTargetModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Set Target</h2>
                <p className="text-sm text-muted-foreground">{showTargetModal.name} - {roleLabels[showTargetModal.role]}</p>
              </div>
              <button onClick={() => setShowTargetModal(null)} className="p-2 hover:bg-muted rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Start Date *</label>
                  <input
                    type="date"
                    value={targetData.startDate}
                    onChange={(e) => setTargetData({ ...targetData, startDate: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">End Date *</label>
                  <input
                    type="date"
                    value={targetData.endDate}
                    onChange={(e) => setTargetData({ ...targetData, endDate: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Sales Target (₹) *</label>
                  <input
                    type="number"
                    value={targetData.salesTarget}
                    onChange={(e) => setTargetData({ ...targetData, salesTarget: e.target.value })}
                    placeholder="500000"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Collection Target (₹)</label>
                  <input
                    type="number"
                    value={targetData.collectionTarget}
                    onChange={(e) => setTargetData({ ...targetData, collectionTarget: e.target.value })}
                    placeholder="450000"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Visit Target</label>
                  <input
                    type="number"
                    value={targetData.visitTarget}
                    onChange={(e) => setTargetData({ ...targetData, visitTarget: e.target.value })}
                    placeholder="300"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">New Outlet Target</label>
                  <input
                    type="number"
                    value={targetData.newOutletTarget}
                    onChange={(e) => setTargetData({ ...targetData, newOutletTarget: e.target.value })}
                    placeholder="10"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowTargetModal(null)} className="btn-outline">Cancel</button>
              <button onClick={handleSetTarget} className="btn-primary">Set Target</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}