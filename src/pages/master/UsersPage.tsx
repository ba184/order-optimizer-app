import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useUsersData, useRoles, UserWithRole } from '@/hooks/useUsersData';
import { useAuth } from '@/contexts/AuthContext';
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
  Shield,
  Key,
  Navigation,
  Eye,
  X,
  Target,
  Loader2,
  UserCheck,
  UserX,
  Globe,
  Clock,
  Building,
  Hash,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Zone → City cascade data
const geoData: Record<string, string[]> = {
  'North': ['Delhi', 'Chandigarh', 'Jaipur', 'Lucknow'],
  'South': ['Bangalore', 'Chennai', 'Hyderabad', 'Kochi'],
  'East': ['Kolkata', 'Bhubaneswar', 'Patna', 'Guwahati'],
  'West': ['Mumbai', 'Pune', 'Ahmedabad', 'Surat'],
  'Central': ['Bhopal', 'Indore', 'Nagpur', 'Raipur'],
};

const roleColors: Record<string, string> = {
  sales_executive: 'bg-info/10 text-info',
  asm: 'bg-secondary/10 text-secondary',
  rsm: 'bg-warning/10 text-warning',
  admin: 'bg-primary/10 text-primary',
  fse: 'bg-success/10 text-success',
};

export default function UsersPage() {
  const navigate = useNavigate();
  const { users, isLoading, createUser, updateUser, updateUserRole, resetPassword } = useUsersData();
  const { data: roles = [] } = useRoles();
  const { userRole: currentUserRoleCode } = useAuth();
  const createTarget = useCreateTarget();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState<UserWithRole | null>(null);
  const [showEditModal, setShowEditModal] = useState<UserWithRole | null>(null);
  const [showViewModal, setShowViewModal] = useState<UserWithRole | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState<UserWithRole | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState<UserWithRole | null>(null);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState<UserWithRole | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'sales_executive',
    territory: '',
    region: '',
    zone: '',
    city: '',
    reportingTo: '',
    employeeId: '',
    designationCode: '',
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

  // Get current user's role level for hierarchy validation
  const currentUserRole = roles.find(r => r.code === currentUserRoleCode);
  const currentUserLevel = currentUserRole?.level || 999;

  // Filter managers based on role hierarchy
  const getValidManagers = (selectedRoleCode: string, excludeUserId?: string) => {
    const selectedRole = roles.find(r => r.code === selectedRoleCode);
    if (!selectedRole) return [];
    
    // Manager must have a lower level number (higher in hierarchy)
    return users.filter(u => {
      if (excludeUserId && u.id === excludeUserId) return false;
      const managerRole = roles.find(r => r.code === u.role_code);
      return managerRole && managerRole.level < selectedRole.level;
    });
  };

  // Filter roles that current user can assign
  const getAssignableRoles = () => {
    return roles.filter(r => r.level >= currentUserLevel || currentUserLevel === 1);
  };

  // Available cities based on selected zone
  const availableCities = formData.zone ? geoData[formData.zone] || [] : [];

  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'all' && u.role_code !== roleFilter) return false;
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    if (zoneFilter !== 'all' && u.zone !== zoneFilter) return false;
    return true;
  });

  // Calculate stats
  const stats = useMemo(() => {
    const activeUsers = users.filter(u => u.status === 'active').length;
    const zonesWithUsers = new Set(users.map(u => u.zone).filter(Boolean)).size;
    const citiesWithUsers = new Set(users.map(u => u.city).filter(Boolean)).size;
    
    const byRole = roles.reduce((acc, role) => {
      acc[role.code] = users.filter(u => u.role_code === role.code).length;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: users.length,
      active: activeUsers,
      inactive: users.length - activeUsers,
      byRole,
      geoZones: zonesWithUsers,
      geoCities: citiesWithUsers,
    };
  }, [users, roles]);

  const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Validate hierarchy rule
    const selectedRole = roles.find(r => r.code === formData.role);
    if (selectedRole && selectedRole.level > 1 && !formData.reportingTo) {
      toast.error('Reports To is mandatory for non-admin roles');
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
        zone: formData.zone || undefined,
        city: formData.city || undefined,
        reporting_to: formData.reportingTo || undefined,
        role_code: formData.role,
        employee_id: formData.employeeId || undefined,
        designation_code: formData.designationCode || undefined,
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
    
    // Validate hierarchy rule
    const selectedRole = roles.find(r => r.code === formData.role);
    if (selectedRole && selectedRole.level > 1 && !formData.reportingTo) {
      toast.error('Reports To is mandatory for non-admin roles');
      return;
    }
    
    try {
      await updateUser.mutateAsync({
        id: showEditModal.id,
        name: formData.name,
        phone: formData.phone || undefined,
        territory: formData.territory || undefined,
        region: formData.region || undefined,
        zone: formData.zone || undefined,
        city: formData.city || undefined,
        reporting_to: formData.reportingTo || undefined,
        employee_id: formData.employeeId || undefined,
        designation_code: formData.designationCode || undefined,
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

  const handleToggleStatus = async (user: UserWithRole) => {
    if (user.status === 'active') {
      setShowDeactivateConfirm(user);
    } else {
      try {
        await updateUser.mutateAsync({
          id: user.id,
          status: 'active',
        });
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

  const confirmDeactivate = async () => {
    if (!showDeactivateConfirm) return;
    try {
      await updateUser.mutateAsync({
        id: showDeactivateConfirm.id,
        status: 'inactive',
      });
      setShowDeactivateConfirm(null);
    } catch (error) {
      // Error handled by mutation
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

  const openEditModal = (user: UserWithRole) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      phone: user.phone || '',
      role: user.role_code || 'sales_executive',
      territory: user.territory || '',
      region: user.region || '',
      zone: user.zone || '',
      city: user.city || '',
      reportingTo: user.reporting_to || '',
      employeeId: user.employee_id || '',
      designationCode: user.designation_code || '',
    });
    setShowEditModal(user);
  };

  const resetForm = () => {
    setFormData({ 
      name: '', email: '', password: '', phone: '', role: 'sales_executive', 
      territory: '', region: '', zone: '', city: '', reportingTo: '',
      employeeId: '', designationCode: ''
    });
  };

  const columns = [
    {
      key: 'employee',
      header: 'Employee',
      render: (item: UserWithRole) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {item.avatar_url ? (
              <img src={item.avatar_url} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <User size={20} className="text-primary" />
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.employee_id || item.id.slice(0, 8)}...</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'designation',
      header: 'Designation',
      render: (item: UserWithRole) => (
        <div className="space-y-1">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[item.role_code || ''] || 'bg-muted text-muted-foreground'}`}>
            {item.role_name || 'No Role'}
          </span>
          {item.designation_code && (
            <p className="text-xs text-muted-foreground">{item.designation_code}</p>
          )}
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (item: UserWithRole) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Mail size={14} className="text-muted-foreground" />
            <span className="truncate max-w-[180px]">{item.email}</span>
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
      key: 'geography',
      header: 'Zone / City',
      render: (item: UserWithRole) => (
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-muted-foreground" />
          <span className="text-sm">
            {item.zone || 'All'}{item.city ? ` / ${item.city}` : ''}
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
      key: 'lastLogin',
      header: 'Last Login',
      render: (item: UserWithRole) => (
        item.last_login_at ? (
          <div className="flex items-center gap-2 text-sm">
            <Clock size={14} className="text-muted-foreground" />
            <span>{format(new Date(item.last_login_at), 'dd MMM, HH:mm')}</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">Never</span>
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
        </div>
      ),
    },
  ];

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

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Users size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
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
              <UserCheck size={20} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
          </div>
        </motion.div>

        {roles.slice(0, 2).map((role, index) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="stat-card cursor-pointer"
            onClick={() => setRoleFilter(role.code)}
          >
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${roleColors[role.code] || 'bg-muted'}`}>
                <Shield size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.byRole[role.code] || 0}</p>
                <p className="text-sm text-muted-foreground">{role.name}</p>
              </div>
            </div>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-info/10">
              <Globe size={20} className="text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.geoZones}</p>
              <p className="text-sm text-muted-foreground">Zones Covered</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <Building size={20} className="text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.geoCities}</p>
              <p className="text-sm text-muted-foreground">Cities Covered</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">Role:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field w-40"
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role.id} value={role.code}>{role.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-32"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">Zone:</label>
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="input-field w-32"
          >
            <option value="all">All Zones</option>
            {Object.keys(geoData).map(zone => (
              <option key={zone} value={zone}>{zone}</option>
            ))}
          </select>
        </div>
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
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
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
                  <label className="block text-sm font-medium text-foreground mb-2">Employee ID</label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="EMP-001"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-foreground mb-2">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value, reportingTo: '' })}
                    className="input-field"
                  >
                    {getAssignableRoles().map((role) => (
                      <option key={role.id} value={role.code}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Designation Code</label>
                  <input
                    type="text"
                    value={formData.designationCode}
                    onChange={(e) => setFormData({ ...formData, designationCode: e.target.value })}
                    placeholder="SE-L1, ASM-SR"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Zone</label>
                  <select
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value, city: '' })}
                    className="input-field"
                  >
                    <option value="">Select Zone</option>
                    {Object.keys(geoData).map(zone => (
                      <option key={zone} value={zone}>{zone}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">City</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="input-field"
                    disabled={!formData.zone}
                  >
                    <option value="">Select City</option>
                    {availableCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Reports To {formData.role !== 'admin' && <span className="text-destructive">*</span>}
                </label>
                <select
                  value={formData.reportingTo}
                  onChange={(e) => setFormData({ ...formData, reportingTo: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select Manager</option>
                  {getValidManagers(formData.role).map((user) => (
                    <option key={user.id} value={user.id}>{user.name} ({user.role_name})</option>
                  ))}
                </select>
                {formData.role !== 'admin' && !formData.reportingTo && (
                  <p className="text-xs text-warning mt-1 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    Required for hierarchy compliance
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Region</label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="Region"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Territory</label>
                  <input
                    type="text"
                    value={formData.territory}
                    onChange={(e) => setFormData({ ...formData, territory: e.target.value })}
                    placeholder="Territory"
                    className="input-field"
                  />
                </div>
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
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
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
                  <label className="block text-sm font-medium text-foreground mb-2">Employee ID</label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="EMP-001"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value, reportingTo: '' })}
                    className="input-field"
                  >
                    {getAssignableRoles().map((role) => (
                      <option key={role.id} value={role.code}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Designation Code</label>
                  <input
                    type="text"
                    value={formData.designationCode}
                    onChange={(e) => setFormData({ ...formData, designationCode: e.target.value })}
                    placeholder="SE-L1, ASM-SR"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Zone</label>
                  <select
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value, city: '' })}
                    className="input-field"
                  >
                    <option value="">Select Zone</option>
                    {Object.keys(geoData).map(zone => (
                      <option key={zone} value={zone}>{zone}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">City</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="input-field"
                    disabled={!formData.zone}
                  >
                    <option value="">Select City</option>
                    {(formData.zone ? geoData[formData.zone] || [] : []).map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Reports To {formData.role !== 'admin' && <span className="text-destructive">*</span>}
                </label>
                <select
                  value={formData.reportingTo}
                  onChange={(e) => setFormData({ ...formData, reportingTo: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select Manager</option>
                  {getValidManagers(formData.role, showEditModal.id).map((user) => (
                    <option key={user.id} value={user.id}>{user.name} ({user.role_name})</option>
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
                    placeholder="Region"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Territory</label>
                  <input
                    type="text"
                    value={formData.territory}
                    onChange={(e) => setFormData({ ...formData, territory: e.target.value })}
                    placeholder="Territory"
                    className="input-field"
                  />
                </div>
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
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  {showViewModal.avatar_url ? (
                    <img src={showViewModal.avatar_url} alt={showViewModal.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{showViewModal.name}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[showViewModal.role_code || ''] || 'bg-muted text-muted-foreground'}`}>
                    {showViewModal.role_name || 'No Role'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Employee ID</p>
                  <p className="font-medium">{showViewModal.employee_id || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Designation</p>
                  <p className="font-medium">{showViewModal.designation_code || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{showViewModal.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{showViewModal.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Zone</p>
                  <p className="font-medium">{showViewModal.zone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">City</p>
                  <p className="font-medium">{showViewModal.city || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reports To</p>
                  <p className="font-medium">{showViewModal.reporting_to_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge status={(showViewModal.status || 'active') as StatusType} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Login</p>
                  <p className="font-medium">
                    {showViewModal.last_login_at 
                      ? format(new Date(showViewModal.last_login_at), 'dd MMM yyyy, HH:mm')
                      : 'Never'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {showViewModal.created_at 
                      ? format(new Date(showViewModal.created_at), 'dd MMM yyyy')
                      : '-'}
                  </p>
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
                <p className="text-sm text-muted-foreground">{showPermissionsModal.name} - {showPermissionsModal.role_name}</p>
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
                <p className="text-sm font-medium text-foreground">Current Role: <span className="text-primary">{showPermissionsModal.role_name || 'No Role'}</span></p>
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
                <p className="text-sm text-muted-foreground">{showTargetModal.name} - {showTargetModal.role_name}</p>
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
                    placeholder="100"
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

      {/* Deactivate Confirmation Modal */}
      {showDeactivateConfirm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-warning/10">
                <AlertTriangle size={24} className="text-warning" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Deactivate User</h2>
                <p className="text-sm text-muted-foreground">{showDeactivateConfirm.name}</p>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to deactivate this user? They will no longer be able to access the system.
              This action can be reversed by activating the user later.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setShowDeactivateConfirm(null)} className="btn-outline">Cancel</button>
              <button onClick={confirmDeactivate} className="btn-primary bg-warning hover:bg-warning/90">
                Deactivate
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
