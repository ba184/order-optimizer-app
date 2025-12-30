import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GeoFilter } from '@/components/ui/GeoFilter';
import { GeoFilter as GeoFilterType } from '@/data/geoData';
import { useUsersData, useRoles, UserWithRole } from '@/hooks/useUsersData';
import { useCreateTarget } from '@/hooks/useTargetsData';
import { StatusType } from '@/components/ui/StatusBadge';
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
  Loader2,
  UserCheck,
  UserX,
} from 'lucide-react';
import { toast } from 'sonner';

const roleLabels: Record<string, string> = {
  sales_executive: 'Sales Executive',
  asm: 'Area Sales Manager',
  rsm: 'Regional Sales Manager',
  admin: 'Administrator',
};

const roleColors: Record<string, string> = {
  sales_executive: 'bg-info/10 text-info',
  asm: 'bg-secondary/10 text-secondary',
  rsm: 'bg-warning/10 text-warning',
  admin: 'bg-primary/10 text-primary',
};

export default function UsersPage() {
  const navigate = useNavigate();
  const { users, isLoading, createUser, updateUser, updateUserRole, deleteUser, resetPassword } = useUsersData();
  const { data: roles = [] } = useRoles();
  const createTarget = useCreateTarget();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState<UserWithRole | null>(null);
  const [showEditModal, setShowEditModal] = useState<UserWithRole | null>(null);
  const [showViewModal, setShowViewModal] = useState<UserWithRole | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState<UserWithRole | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState<UserWithRole | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [geoFilter, setGeoFilter] = useState<GeoFilterType>({ country: 'India' });
  const [isCreating, setIsCreating] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'sales_executive',
    territory: '',
    region: '',
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

  const [newPassword, setNewPassword] = useState('');

  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'all' && u.role_code !== roleFilter) return false;
    if (geoFilter.zone && u.region !== geoFilter.zone) return false;
    if (geoFilter.city && u.territory !== geoFilter.city) return false;
    return true;
  });

  const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsCreating(true);
    try {
      await createUser.mutateAsync({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        territory: formData.territory || undefined,
        region: formData.region || undefined,
        reporting_to: formData.reportingTo || undefined,
        role_code: formData.role,
      });
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async () => {
    if (!showEditModal) return;
    
    try {
      await updateUser.mutateAsync({
        id: showEditModal.id,
        name: formData.name,
        phone: formData.phone || undefined,
        territory: formData.territory || undefined,
        region: formData.region || undefined,
        reporting_to: formData.reportingTo || undefined,
      });
      
      if (formData.role && formData.role !== showEditModal.role_code) {
        await updateUserRole.mutateAsync({
          userId: showEditModal.id,
          roleCode: formData.role,
        });
      }
      
      setShowEditModal(null);
      resetForm();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleSetTarget = () => {
    if (!targetData.salesTarget || !targetData.startDate || !targetData.endDate || !showTargetModal) {
      toast.error('Please fill required fields');
      return;
    }
    
    createTarget.mutate({
      user_id: showTargetModal.id,
      target_type: 'sales',
      target_value: parseFloat(targetData.salesTarget),
      start_date: targetData.startDate,
      end_date: targetData.endDate,
      period: 'monthly',
    });
    
    setShowTargetModal(null);
    setTargetData({ salesTarget: '', collectionTarget: '', visitTarget: '', newOutletTarget: '', startDate: '', endDate: '' });
  };

  const handleDelete = (user: UserWithRole) => {
    if (confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      deleteUser.mutate(user.id);
    }
  };

  const handleResetPassword = async () => {
    if (!showPasswordModal || !newPassword) {
      toast.error('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await resetPassword.mutateAsync({
        userId: showPasswordModal.id,
        newPassword,
      });
      setShowPasswordModal(null);
      setNewPassword('');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleToggleStatus = async (user: UserWithRole) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await updateUser.mutateAsync({
        id: user.id,
        status: newStatus,
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const openEditModal = (user: UserWithRole) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      phone: user.phone || '',
      role: user.role_code || 'sales_executive',
      territory: user.territory || '',
      region: user.region || '',
      reportingTo: user.reporting_to || '',
    });
    setShowEditModal(user);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', phone: '', role: 'sales_executive', territory: '', region: '', reportingTo: '' });
  };

  const columns = [
    {
      key: 'name',
      header: 'User',
      render: (item: UserWithRole) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.id.slice(0, 8)}...</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (item: UserWithRole) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Mail size={14} className="text-muted-foreground" />
            <span>{item.email}</span>
          </div>
          {item.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone size={14} className="text-muted-foreground" />
              <span>{item.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (item: UserWithRole) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[item.role_code || ''] || 'bg-muted text-muted-foreground'}`}>
          {item.role_name || roleLabels[item.role_code || ''] || 'No Role'}
        </span>
      ),
    },
    {
      key: 'territory',
      header: 'Territory',
      render: (item: UserWithRole) => (
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-muted-foreground" />
          <span className="text-sm">
            {item.region || 'All'}{item.territory ? ` / ${item.territory}` : ''}
          </span>
        </div>
      ),
    },
    {
      key: 'reportingTo',
      header: 'Reports To',
      render: (item: UserWithRole) => (
        item.reporting_to_name ? (
          <span className="text-sm">{item.reporting_to_name}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: UserWithRole) => <StatusBadge status={(item.status || 'active') as StatusType} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: UserWithRole) => (
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowViewModal(item)}
            className="p-2 hover:bg-muted rounded-lg transition-colors" 
            title="View"
          >
            <Eye size={16} className="text-muted-foreground" />
          </button>
          {item.role_code === 'sales_executive' && (
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
          <button 
            onClick={() => setShowPermissionsModal(item)}
            className="p-2 hover:bg-muted rounded-lg transition-colors" 
            title="Permissions"
          >
            <Shield size={16} className="text-muted-foreground" />
          </button>
          <button 
            onClick={() => setShowPasswordModal(item)}
            className="p-2 hover:bg-muted rounded-lg transition-colors" 
            title="Reset Password"
          >
            <Key size={16} className="text-muted-foreground" />
          </button>
          <button 
            onClick={() => handleToggleStatus(item)}
            className={`p-2 rounded-lg transition-colors ${item.status === 'active' ? 'hover:bg-destructive/10' : 'hover:bg-success/10'}`}
            title={item.status === 'active' ? 'Deactivate' : 'Activate'}
          >
            {item.status === 'active' ? (
              <UserX size={16} className="text-destructive" />
            ) : (
              <UserCheck size={16} className="text-success" />
            )}
          </button>
          <button 
            onClick={() => openEditModal(item)}
            className="p-2 hover:bg-muted rounded-lg transition-colors" 
            title="Edit"
          >
            <Edit size={16} className="text-muted-foreground" />
          </button>
          <button 
            onClick={() => handleDelete(item)}
            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors" 
            title="Delete"
          >
            <Trash2 size={16} className="text-destructive" />
          </button>
        </div>
      ),
    },
  ];

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role_code === 'admin').length,
    rsm: users.filter(u => u.role_code === 'rsm').length,
    asm: users.filter(u => u.role_code === 'asm').length,
    se: users.filter(u => u.role_code === 'sales_executive').length,
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
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">User Management</h1>
          <p className="text-muted-foreground">Manage users, roles, permissions, and targets</p>
        </div>
        <button onClick={() => { resetForm(); setShowCreateModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add User
        </button>
      </div>

      {/* Geo Filter */}
      <GeoFilter value={geoFilter} onChange={setGeoFilter} />

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
              <div className={`p-3 rounded-xl ${stat.role === 'all' ? 'bg-primary/10' : roleColors[stat.role] || 'bg-primary/10'}`}>
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
      <DataTable 
        data={filteredUsers} 
        columns={columns} 
        searchPlaceholder="Search users..." 
        emptyMessage="No users found. Click 'Add User' to create one."
      />

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Add New User</h2>
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
                  placeholder="email@company.com"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input-field"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.code}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Region</label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="Region/Zone"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Territory</label>
                  <input
                    type="text"
                    value={formData.territory}
                    onChange={(e) => setFormData({ ...formData, territory: e.target.value })}
                    placeholder="Territory/City"
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
                  {users.filter(u => u.role_code !== 'sales_executive').map((user) => (
                    <option key={user.id} value={user.id}>{user.name} ({user.role_name || user.role_code})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="btn-outline">Cancel</button>
              <button 
                onClick={handleCreate} 
                className="btn-primary flex items-center gap-2"
                disabled={isCreating}
              >
                {isCreating && <Loader2 size={16} className="animate-spin" />}
                Create User
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Edit User</h2>
              <button onClick={() => setShowEditModal(null)} className="p-2 hover:bg-muted rounded-lg">
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
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="input-field bg-muted"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input-field"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.code}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Region</label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="Region/Zone"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Territory</label>
                  <input
                    type="text"
                    value={formData.territory}
                    onChange={(e) => setFormData({ ...formData, territory: e.target.value })}
                    placeholder="Territory/City"
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
                  {users.filter(u => u.id !== showEditModal.id && u.role_code !== 'sales_executive').map((user) => (
                    <option key={user.id} value={user.id}>{user.name} ({user.role_name || user.role_code})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowEditModal(null)} className="btn-outline">Cancel</button>
              <button onClick={handleUpdate} className="btn-primary">Update User</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">User Details</h2>
              <button onClick={() => setShowViewModal(null)} className="p-2 hover:bg-muted rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User size={32} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{showViewModal.name}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[showViewModal.role_code || ''] || 'bg-muted text-muted-foreground'}`}>
                    {showViewModal.role_name || showViewModal.role_code || 'No Role'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{showViewModal.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{showViewModal.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Region</p>
                  <p className="font-medium">{showViewModal.region || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Territory</p>
                  <p className="font-medium">{showViewModal.territory || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reports To</p>
                  <p className="font-medium">{showViewModal.reporting_to_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge status={(showViewModal.status || 'active') as StatusType} />
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-mono text-sm">{showViewModal.id}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowViewModal(null)} className="btn-outline">Close</button>
              <button onClick={() => { openEditModal(showViewModal); setShowViewModal(null); }} className="btn-primary">Edit User</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Reset Password</h2>
                <p className="text-sm text-muted-foreground">{showPasswordModal.name}</p>
              </div>
              <button onClick={() => setShowPasswordModal(null)} className="p-2 hover:bg-muted rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">New Password *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => { setShowPasswordModal(null); setNewPassword(''); }} className="btn-outline">Cancel</button>
              <button onClick={handleResetPassword} className="btn-primary">Reset Password</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Permissions</h2>
                <p className="text-sm text-muted-foreground">{showPermissionsModal.name} - {showPermissionsModal.role_name || showPermissionsModal.role_code}</p>
              </div>
              <button onClick={() => setShowPermissionsModal(null)} className="p-2 hover:bg-muted rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
                <p className="text-sm text-info">
                  Permissions are managed through roles. To change permissions for this user, 
                  either change their role or modify the role's permissions in the Roles & Permissions page.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Current Role: <span className="text-primary">{showPermissionsModal.role_name || showPermissionsModal.role_code || 'No Role'}</span></p>
                <p className="text-sm text-muted-foreground">
                  Navigate to Master → Roles & Permissions to manage role-based permissions.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowPermissionsModal(null)} className="btn-outline">Close</button>
              <button 
                onClick={() => { navigate('/master/roles'); setShowPermissionsModal(null); }}
                className="btn-primary"
              >
                Manage Roles
              </button>
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
                <p className="text-sm text-muted-foreground">{showTargetModal.name} - {showTargetModal.role_name || showTargetModal.role_code}</p>
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
                    placeholder="400000"
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
                    placeholder="200"
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
