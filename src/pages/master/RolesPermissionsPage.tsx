import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import {
  Shield,
  Users,
  ChevronRight,
  Edit,
  X,
  Check,
  Lock,
  Unlock,
  Plus,
  Trash2,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Permission {
  id: string;
  module: string;
  actions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    approve: boolean;
  };
}

type GeoLevel = 'country' | 'state' | 'city' | 'territory' | 'zone';
type ZoneType = 'country' | 'state' | 'city' | 'territory';

interface Role {
  id: string;
  name: string;
  code: string;
  geoLevel: GeoLevel;
  zoneType?: ZoneType;
  permissions: Permission[];
  userCount: number;
  status: 'active' | 'inactive';
  isSystem?: boolean;
}

// Updated modules list with separated Master Data and added Users & Roles
const modulesList = [
  'Dashboard',
  'Users',
  'Roles & Permissions',
  'Sales Team',
  'Outlets',
  'Orders',
  'Inventory',
  'Schemes',
  'Expenses',
  'Reports',
  'Products',
  'Categories',
  'Warehouses',
  'Territories',
  'Countries',
  'States',
  'Cities',
  'Zones',
  'Settings',
  'Leads',
  'Beat Plans',
  'Attendance',
  'DSR',
  'Leave Management',
  'Samples & Gifts',
  'Training',
  'Feedback',
  'Returns',
];

const geoLevels: { value: GeoLevel; label: string }[] = [
  { value: 'country', label: 'Country' },
  { value: 'state', label: 'State' },
  { value: 'city', label: 'City' },
  { value: 'territory', label: 'Territory' },
  { value: 'zone', label: 'Zone' },
];

const zoneTypes: { value: ZoneType; label: string }[] = [
  { value: 'country', label: 'Country' },
  { value: 'state', label: 'State' },
  { value: 'city', label: 'City' },
  { value: 'territory', label: 'Territory' },
];

const createDefaultPermissions = (prefix: string): Permission[] => 
  modulesList.map((module, idx) => ({
    id: `perm-${prefix}-${idx}`,
    module,
    actions: { view: false, create: false, edit: false, delete: false, approve: false },
  }));

const initialRoles: Role[] = [
  {
    id: 'role-admin',
    name: 'Administrator',
    code: 'admin',
    geoLevel: 'country',
    permissions: modulesList.map((module, idx) => ({
      id: `perm-admin-${idx}`,
      module,
      actions: { view: true, create: true, edit: true, delete: true, approve: true },
    })),
    userCount: 1,
    status: 'active',
    isSystem: true,
  },
  {
    id: 'role-rsm',
    name: 'Regional Sales Manager',
    code: 'rsm',
    geoLevel: 'zone',
    zoneType: 'state',
    permissions: modulesList.map((module, idx) => ({
      id: `perm-rsm-${idx}`,
      module,
      actions: {
        view: true,
        create: !['Settings', 'Users', 'Roles & Permissions'].includes(module),
        edit: !['Settings', 'Users', 'Roles & Permissions'].includes(module),
        delete: false,
        approve: ['Orders', 'Expenses', 'Leave Management', 'Beat Plans', 'Leads'].includes(module),
      },
    })),
    userCount: 1,
    status: 'active',
    isSystem: true,
  },
  {
    id: 'role-asm',
    name: 'Area Sales Manager',
    code: 'asm',
    geoLevel: 'city',
    permissions: modulesList.map((module, idx) => ({
      id: `perm-asm-${idx}`,
      module,
      actions: {
        view: !['Settings', 'Users', 'Roles & Permissions'].includes(module),
        create: ['Orders', 'Outlets', 'Leads', 'Beat Plans', 'Expenses'].includes(module),
        edit: ['Orders', 'Outlets', 'Leads'].includes(module),
        delete: false,
        approve: ['Orders', 'Leads'].includes(module),
      },
    })),
    userCount: 2,
    status: 'active',
    isSystem: true,
  },
  {
    id: 'role-se',
    name: 'Sales Executive',
    code: 'sales_executive',
    geoLevel: 'territory',
    permissions: modulesList.map((module, idx) => ({
      id: `perm-se-${idx}`,
      module,
      actions: {
        view: !['Settings', 'Users', 'Roles & Permissions', 'Reports'].includes(module),
        create: ['Orders', 'Leads', 'DSR', 'Attendance', 'Expenses'].includes(module),
        edit: ['DSR'].includes(module),
        delete: false,
        approve: false,
      },
    })),
    userCount: 3,
    status: 'active',
    isSystem: true,
  },
];

const roleColorsList = [
  'bg-primary/10 text-primary',
  'bg-warning/10 text-warning',
  'bg-secondary/10 text-secondary',
  'bg-info/10 text-info',
  'bg-success/10 text-success',
  'bg-destructive/10 text-destructive',
];

const getLevelLabel = (level: GeoLevel): string => {
  return geoLevels.find(l => l.value === level)?.label || level;
};

const getZoneTypeLabel = (type?: ZoneType): string => {
  if (!type) return '';
  return zoneTypes.find(t => t.value === type)?.label || type;
};

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPermissions, setEditingPermissions] = useState<Permission[]>([]);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  const [roleForm, setRoleForm] = useState({
    name: '',
    code: '',
    geoLevel: 'territory' as GeoLevel,
    zoneType: '' as ZoneType | '',
    status: 'active' as 'active' | 'inactive',
  });

  const [newRolePermissions, setNewRolePermissions] = useState<Permission[]>(
    createDefaultPermissions('new')
  );

  const getRoleColor = (index: number) => roleColorsList[index % roleColorsList.length];

  const handleEditPermissions = (role: Role) => {
    setSelectedRole(role);
    setEditingPermissions(JSON.parse(JSON.stringify(role.permissions)));
    setShowPermissionModal(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setRoleForm({
      name: role.name,
      code: role.code,
      geoLevel: role.geoLevel,
      zoneType: role.zoneType || '',
      status: role.status,
    });
    setNewRolePermissions(JSON.parse(JSON.stringify(role.permissions)));
    setModalMode('edit');
    setShowCreateModal(true);
  };

  const togglePermission = (permId: string, action: keyof Permission['actions']) => {
    setEditingPermissions(prev =>
      prev.map(p =>
        p.id === permId ? { ...p, actions: { ...p.actions, [action]: !p.actions[action] } } : p
      )
    );
  };

  const toggleNewRolePermission = (permId: string, action: keyof Permission['actions']) => {
    setNewRolePermissions(prev =>
      prev.map(p =>
        p.id === permId ? { ...p, actions: { ...p.actions, [action]: !p.actions[action] } } : p
      )
    );
  };

  const toggleAllPermissionsForModule = (permId: string, enable: boolean) => {
    setNewRolePermissions(prev =>
      prev.map(p =>
        p.id === permId ? { 
          ...p, 
          actions: { view: enable, create: enable, edit: enable, delete: enable, approve: enable } 
        } : p
      )
    );
  };

  const handleSavePermissions = () => {
    if (!selectedRole) return;
    setRoles(prev =>
      prev.map(r =>
        r.id === selectedRole.id ? { ...r, permissions: editingPermissions } : r
      )
    );
    toast.success(`Permissions updated for ${selectedRole.name}`);
    setShowPermissionModal(false);
    setSelectedRole(null);
  };

  const handleCreateRole = () => {
    if (!roleForm.name || !roleForm.code) {
      toast.error('Please fill required fields');
      return;
    }

    if (roles.some(r => r.code === roleForm.code && r.id !== selectedRole?.id)) {
      toast.error('Role code must be unique');
      return;
    }

    if (roleForm.geoLevel === 'zone' && !roleForm.zoneType) {
      toast.error('Please select zone type');
      return;
    }

    if (modalMode === 'edit' && selectedRole) {
      setRoles(prev =>
        prev.map(r =>
          r.id === selectedRole.id ? {
            ...r,
            name: roleForm.name,
            code: roleForm.code,
            geoLevel: roleForm.geoLevel,
            zoneType: roleForm.geoLevel === 'zone' ? (roleForm.zoneType as ZoneType) : undefined,
            status: roleForm.status,
            permissions: newRolePermissions,
          } : r
        )
      );
      toast.success('Role updated successfully');
    } else {
      const newRole: Role = {
        id: `role-${Date.now()}`,
        name: roleForm.name,
        code: roleForm.code,
        geoLevel: roleForm.geoLevel,
        zoneType: roleForm.geoLevel === 'zone' ? (roleForm.zoneType as ZoneType) : undefined,
        permissions: newRolePermissions.map((p, idx) => ({ ...p, id: `perm-${roleForm.code}-${idx}` })),
        userCount: 0,
        status: roleForm.status,
        isSystem: false,
      };
      setRoles([...roles, newRole]);
      toast.success('Role created successfully');
    }

    resetForm();
  };

  const resetForm = () => {
    setShowCreateModal(false);
    setSelectedRole(null);
    setModalMode('create');
    setRoleForm({
      name: '',
      code: '',
      geoLevel: 'territory',
      zoneType: '',
      status: 'active',
    });
    setNewRolePermissions(createDefaultPermissions('new'));
  };

  const handleDeleteRole = (role: Role) => {
    if (role.isSystem) {
      toast.error('System roles cannot be deleted');
      return;
    }
    if (role.userCount > 0) {
      toast.error('Cannot delete role with assigned users');
      return;
    }
    setRoles(prev => prev.filter(r => r.id !== role.id));
    toast.success('Role deleted successfully');
  };

  // Group permissions by category for better organization
  const groupedPermissions = useMemo(() => {
    const groups: { name: string; permissions: Permission[] }[] = [
      { 
        name: 'Core Modules', 
        permissions: newRolePermissions.filter(p => 
          ['Dashboard', 'Users', 'Roles & Permissions', 'Settings'].includes(p.module)
        ) 
      },
      { 
        name: 'Sales & Operations', 
        permissions: newRolePermissions.filter(p => 
          ['Sales Team', 'Outlets', 'Orders', 'Leads', 'Schemes'].includes(p.module)
        ) 
      },
      { 
        name: 'Field Activities', 
        permissions: newRolePermissions.filter(p => 
          ['Beat Plans', 'Attendance', 'DSR', 'Leave Management'].includes(p.module)
        ) 
      },
      { 
        name: 'Inventory & Finance', 
        permissions: newRolePermissions.filter(p => 
          ['Inventory', 'Expenses', 'Samples & Gifts', 'Returns'].includes(p.module)
        ) 
      },
      { 
        name: 'Master Data', 
        permissions: newRolePermissions.filter(p => 
          ['Products', 'Categories', 'Warehouses', 'Territories', 'Countries', 'States', 'Cities', 'Zones'].includes(p.module)
        ) 
      },
      { 
        name: 'Other', 
        permissions: newRolePermissions.filter(p => 
          ['Reports', 'Training', 'Feedback'].includes(p.module)
        ) 
      },
    ];
    return groups.filter(g => g.permissions.length > 0);
  }, [newRolePermissions]);

  const columns = [
    {
      key: 'name',
      header: 'Role',
      render: (item: Role) => {
        const colorIndex = roles.findIndex(r => r.id === item.id);
        return (
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getRoleColor(colorIndex)}`}>
              <Shield size={20} />
            </div>
            <div>
              <p className="font-medium text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground">Code: {item.code}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'geoLevel',
      header: 'Geography Level',
      render: (item: Role) => (
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-muted-foreground" />
          <div>
            <span className="text-sm font-medium">{getLevelLabel(item.geoLevel)}</span>
            {item.geoLevel === 'zone' && item.zoneType && (
              <span className="text-xs text-muted-foreground ml-1">({getZoneTypeLabel(item.zoneType)})</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'userCount',
      header: 'Users',
      render: (item: Role) => (
        <div className="flex items-center gap-2">
          <Users size={14} className="text-muted-foreground" />
          <span>{item.userCount}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Role) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
        }`}>
          {item.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Role) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleEditPermissions(item)}
            className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
            title="Edit Permissions"
          >
            <Lock size={16} className="text-primary" />
          </button>
          <button 
            onClick={() => handleEditRole(item)}
            className="p-2 hover:bg-muted rounded-lg transition-colors" 
            title="Edit Role"
          >
            <Edit size={16} className="text-muted-foreground" />
          </button>
          {!item.isSystem && (
            <button 
              onClick={() => handleDeleteRole(item)}
              className="p-2 hover:bg-destructive/10 rounded-lg transition-colors" 
              title="Delete Role"
            >
              <Trash2 size={16} className="text-destructive" />
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
          <h1 className="module-title">Roles & Permissions</h1>
          <p className="text-muted-foreground">Manage roles by geography level and access permissions</p>
        </div>
        <button 
          onClick={() => {
            setModalMode('create');
            setShowCreateModal(true);
          }} 
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Create Role
        </button>
      </div>

      {/* Geography Level Visualization */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-medium text-foreground mb-4">Geography Hierarchy</h3>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {geoLevels.map((level, index) => {
            const rolesAtLevel = roles.filter(r => r.geoLevel === level.value && r.status === 'active');
            return (
              <div key={level.value} className="flex items-center gap-2">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`px-4 py-3 rounded-lg border-2 ${getRoleColor(index)} border-current min-w-[120px] text-center`}
                >
                  <p className="font-semibold text-sm">{level.label}</p>
                  <p className="text-xs opacity-70">{rolesAtLevel.length} role(s)</p>
                </motion.div>
                {index < geoLevels.length - 1 && (
                  <ChevronRight size={20} className="text-muted-foreground" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {geoLevels.map((level, index) => {
          const rolesAtLevel = roles.filter(r => r.geoLevel === level.value);
          const totalUsers = rolesAtLevel.reduce((sum, r) => sum + r.userCount, 0);
          return (
            <motion.div
              key={level.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="stat-card"
            >
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${getRoleColor(index)}`}>
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
                  <p className="text-sm text-muted-foreground truncate">{level.label}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Roles Table */}
      <DataTable data={roles} columns={columns} searchPlaceholder="Search roles..." />

      {/* Create/Edit Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {modalMode === 'edit' ? 'Edit Role' : 'Create New Role'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {modalMode === 'edit' ? 'Update role details and permissions' : 'Define role with geography level and permissions'}
                </p>
              </div>
              <button onClick={resetForm} className="p-2 hover:bg-muted rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-auto space-y-6">
              {/* Role Details */}
              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <h3 className="text-sm font-medium text-foreground mb-4">Role Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="roleName">Role Name *</Label>
                    <Input
                      id="roleName"
                      value={roleForm.name}
                      onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                      placeholder="e.g., Territory Manager"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roleCode">Role Code *</Label>
                    <Input
                      id="roleCode"
                      value={roleForm.code}
                      onChange={(e) => setRoleForm({ ...roleForm, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                      placeholder="e.g., territory_manager"
                      disabled={modalMode === 'edit' && selectedRole?.isSystem}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="geoLevel">Level *</Label>
                    <Select
                      value={roleForm.geoLevel}
                      onValueChange={(value: GeoLevel) => setRoleForm({ ...roleForm, geoLevel: value, zoneType: '' })}
                    >
                      <SelectTrigger id="geoLevel">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {geoLevels.map(level => (
                          <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {roleForm.geoLevel === 'zone' && (
                    <div className="space-y-2">
                      <Label htmlFor="zoneType">Zone Type *</Label>
                      <Select
                        value={roleForm.zoneType}
                        onValueChange={(value: ZoneType) => setRoleForm({ ...roleForm, zoneType: value })}
                      >
                        <SelectTrigger id="zoneType">
                          <SelectValue placeholder="Select zone type" />
                        </SelectTrigger>
                        <SelectContent>
                          {zoneTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={roleForm.status}
                      onValueChange={(value: 'active' | 'inactive') => setRoleForm({ ...roleForm, status: value })}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Permissions Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-foreground">Module Permissions</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNewRolePermissions(prev => prev.map(p => ({
                        ...p,
                        actions: { view: true, create: true, edit: true, delete: true, approve: true }
                      })))}
                      className="text-xs text-primary hover:underline"
                    >
                      Enable All
                    </button>
                    <span className="text-muted-foreground">|</span>
                    <button
                      onClick={() => setNewRolePermissions(prev => prev.map(p => ({
                        ...p,
                        actions: { view: false, create: false, edit: false, delete: false, approve: false }
                      })))}
                      className="text-xs text-destructive hover:underline"
                    >
                      Disable All
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {groupedPermissions.map(group => (
                    <div key={group.name} className="border border-border rounded-lg overflow-hidden">
                      <div className="bg-muted/50 px-4 py-2 border-b border-border">
                        <h4 className="text-sm font-medium text-foreground">{group.name}</h4>
                      </div>
                      <table className="w-full">
                        <thead className="bg-muted/30">
                          <tr className="border-b border-border">
                            <th className="text-left py-2 px-4 text-xs font-medium text-foreground">Module</th>
                            <th className="text-center py-2 px-2 text-xs font-medium text-foreground">View</th>
                            <th className="text-center py-2 px-2 text-xs font-medium text-foreground">Create</th>
                            <th className="text-center py-2 px-2 text-xs font-medium text-foreground">Edit</th>
                            <th className="text-center py-2 px-2 text-xs font-medium text-foreground">Delete</th>
                            <th className="text-center py-2 px-2 text-xs font-medium text-foreground">Approve</th>
                            <th className="text-center py-2 px-2 text-xs font-medium text-foreground">All</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.permissions.map(perm => {
                            const allEnabled = Object.values(perm.actions).every(v => v);
                            return (
                              <tr key={perm.id} className="border-b border-border/50 hover:bg-muted/30">
                                <td className="py-2 px-4 text-sm text-foreground">{perm.module}</td>
                                {(['view', 'create', 'edit', 'delete', 'approve'] as const).map(action => (
                                  <td key={action} className="py-2 px-2 text-center">
                                    <button
                                      onClick={() => toggleNewRolePermission(perm.id, action)}
                                      className={`p-1 rounded transition-colors ${
                                        perm.actions[action]
                                          ? 'bg-success/10 text-success'
                                          : 'bg-muted text-muted-foreground'
                                      }`}
                                    >
                                      {perm.actions[action] ? <Unlock size={12} /> : <Lock size={12} />}
                                    </button>
                                  </td>
                                ))}
                                <td className="py-2 px-2 text-center">
                                  <button
                                    onClick={() => toggleAllPermissionsForModule(perm.id, !allEnabled)}
                                    className={`p-1 rounded transition-colors ${
                                      allEnabled
                                        ? 'bg-primary/10 text-primary'
                                        : 'bg-muted text-muted-foreground'
                                    }`}
                                  >
                                    <Check size={12} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
              <button onClick={resetForm} className="btn-outline">Cancel</button>
              <button onClick={handleCreateRole} className="btn-primary flex items-center gap-2">
                <Check size={18} />
                {modalMode === 'edit' ? 'Update Role' : 'Create Role'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Permissions Modal (Quick Edit) */}
      {showPermissionModal && selectedRole && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Edit Permissions</h2>
                <p className="text-sm text-muted-foreground">{selectedRole.name} ({getLevelLabel(selectedRole.geoLevel)})</p>
              </div>
              <button onClick={() => setShowPermissionModal(false)} className="p-2 hover:bg-muted rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-foreground">Module</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-foreground">View</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-foreground">Create</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-foreground">Edit</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-foreground">Delete</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-foreground">Approve</th>
                  </tr>
                </thead>
                <tbody>
                  {editingPermissions.map(perm => (
                    <tr key={perm.id} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm font-medium text-foreground">{perm.module}</td>
                      {(['view', 'create', 'edit', 'delete', 'approve'] as const).map(action => (
                        <td key={action} className="py-3 px-4 text-center">
                          <button
                            onClick={() => togglePermission(perm.id, action)}
                            className={`p-2 rounded-lg transition-colors ${
                              perm.actions[action]
                                ? 'bg-success/10 text-success'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {perm.actions[action] ? <Unlock size={16} /> : <Lock size={16} />}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
              <button onClick={() => setShowPermissionModal(false)} className="btn-outline">
                Cancel
              </button>
              <button onClick={handleSavePermissions} className="btn-primary flex items-center gap-2">
                <Check size={18} />
                Save Permissions
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}