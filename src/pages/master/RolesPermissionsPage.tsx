import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import {
  Shield,
  Users,
  ChevronRight,
  Edit,
  Eye,
  X,
  Check,
  Lock,
  Unlock,
  Plus,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

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

interface Role {
  id: string;
  name: string;
  code: string;
  level: number;
  description: string;
  reportsTo: string | null;
  permissions: Permission[];
  userCount: number;
  status: 'active' | 'inactive';
  isSystem?: boolean;
}

const modulesList = [
  'Dashboard',
  'Sales Team',
  'Outlets',
  'Orders',
  'Inventory',
  'Schemes',
  'Expenses',
  'Reports',
  'Master Data',
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
    level: 1,
    description: 'Full system access with all permissions',
    reportsTo: null,
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
    level: 2,
    description: 'Regional level access with approval rights',
    reportsTo: 'admin',
    permissions: modulesList.map((module, idx) => ({
      id: `perm-rsm-${idx}`,
      module,
      actions: {
        view: true,
        create: !['Settings', 'Master Data'].includes(module),
        edit: !['Settings', 'Master Data'].includes(module),
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
    level: 3,
    description: 'Area level access with limited approval',
    reportsTo: 'rsm',
    permissions: modulesList.map((module, idx) => ({
      id: `perm-asm-${idx}`,
      module,
      actions: {
        view: !['Settings', 'Master Data'].includes(module),
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
    level: 4,
    description: 'Field level access for daily operations',
    reportsTo: 'asm',
    permissions: modulesList.map((module, idx) => ({
      id: `perm-se-${idx}`,
      module,
      actions: {
        view: !['Settings', 'Master Data', 'Reports'].includes(module),
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
    level: roles.length + 1,
    description: '',
    reportsTo: '',
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
      level: role.level,
      description: role.description,
      reportsTo: role.reportsTo || '',
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

    if (modalMode === 'edit' && selectedRole) {
      setRoles(prev =>
        prev.map(r =>
          r.id === selectedRole.id ? {
            ...r,
            name: roleForm.name,
            code: roleForm.code,
            level: roleForm.level,
            description: roleForm.description,
            reportsTo: roleForm.reportsTo || null,
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
        level: roleForm.level,
        description: roleForm.description,
        reportsTo: roleForm.reportsTo || null,
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
      level: roles.length + 1,
      description: '',
      reportsTo: '',
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
              <p className="text-xs text-muted-foreground">Code: {item.code} • Level {item.level}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'description',
      header: 'Description',
      render: (item: Role) => (
        <p className="text-sm text-muted-foreground max-w-xs">{item.description}</p>
      ),
    },
    {
      key: 'hierarchy',
      header: 'Reports To',
      render: (item: Role) => (
        item.reportsTo ? (
          <span className="text-sm">{roles.find(r => r.code === item.reportsTo)?.name || '-'}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
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
          <p className="text-muted-foreground">Manage role hierarchy and access permissions</p>
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

      {/* Role Hierarchy Visualization */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-medium text-foreground mb-4">Role Hierarchy</h3>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {roles.filter(r => r.status === 'active').sort((a, b) => a.level - b.level).map((role, index) => (
            <div key={role.id} className="flex items-center gap-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`px-4 py-3 rounded-lg border-2 ${getRoleColor(roles.findIndex(r => r.id === role.id))} border-current`}
              >
                <p className="font-semibold text-sm">{role.name}</p>
                <p className="text-xs opacity-70">Level {role.level}</p>
              </motion.div>
              {index < roles.filter(r => r.status === 'active').length - 1 && (
                <ChevronRight size={20} className="text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {roles.slice(0, 5).map((role, index) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="stat-card"
          >
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${getRoleColor(index)}`}>
                <Shield size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{role.userCount}</p>
                <p className="text-sm text-muted-foreground truncate">{role.name}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Roles Table */}
      <DataTable data={roles} columns={columns} searchPlaceholder="Search roles..." />

      {/* Create/Edit Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {modalMode === 'edit' ? 'Edit Role' : 'Create New Role'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {modalMode === 'edit' ? 'Update role details and permissions' : 'Define role details and assign permissions'}
                </p>
              </div>
              <button onClick={resetForm} className="p-2 hover:bg-muted rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-auto space-y-6">
              {/* Role Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Role Name *</label>
                  <input
                    type="text"
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                    placeholder="e.g., Territory Manager"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Role Code *</label>
                  <input
                    type="text"
                    value={roleForm.code}
                    onChange={(e) => setRoleForm({ ...roleForm, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    placeholder="e.g., territory_manager"
                    className="input-field"
                    disabled={modalMode === 'edit' && selectedRole?.isSystem}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Hierarchy Level</label>
                  <input
                    type="number"
                    value={roleForm.level}
                    onChange={(e) => setRoleForm({ ...roleForm, level: parseInt(e.target.value) || 1 })}
                    min="1"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Reports To</label>
                  <select
                    value={roleForm.reportsTo}
                    onChange={(e) => setRoleForm({ ...roleForm, reportsTo: e.target.value })}
                    className="input-field"
                  >
                    <option value="">None (Top Level)</option>
                    {roles.filter(r => r.id !== selectedRole?.id).map((role) => (
                      <option key={role.id} value={role.code}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                  <select
                    value={roleForm.status}
                    onChange={(e) => setRoleForm({ ...roleForm, status: e.target.value as 'active' | 'inactive' })}
                    className="input-field"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  placeholder="Brief description of this role's responsibilities"
                  className="input-field min-h-[80px]"
                />
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
                
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-foreground">Module</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-foreground">View</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-foreground">Create</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-foreground">Edit</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-foreground">Delete</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-foreground">Approve</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-foreground">All</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newRolePermissions.map(perm => {
                        const allEnabled = Object.values(perm.actions).every(v => v);
                        return (
                          <tr key={perm.id} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="py-2 px-4 text-sm font-medium text-foreground">{perm.module}</td>
                            {(['view', 'create', 'edit', 'delete', 'approve'] as const).map(action => (
                              <td key={action} className="py-2 px-2 text-center">
                                <button
                                  onClick={() => toggleNewRolePermission(perm.id, action)}
                                  className={`p-1.5 rounded transition-colors ${
                                    perm.actions[action]
                                      ? 'bg-success/10 text-success'
                                      : 'bg-muted text-muted-foreground'
                                  }`}
                                >
                                  {perm.actions[action] ? <Unlock size={14} /> : <Lock size={14} />}
                                </button>
                              </td>
                            ))}
                            <td className="py-2 px-2 text-center">
                              <button
                                onClick={() => toggleAllPermissionsForModule(perm.id, !allEnabled)}
                                className={`p-1.5 rounded transition-colors ${
                                  allEnabled
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                <Check size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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
                <p className="text-sm text-muted-foreground">{selectedRole.name}</p>
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
