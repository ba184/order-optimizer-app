import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { useRolesWithCount, useCreateRole, useUpdateRole, usePermissions, useUpdatePermissions, RoleWithCount } from '@/hooks/useUsersData';
import { useAuth } from '@/contexts/AuthContext';
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
  AlertTriangle,
  Hash,
} from 'lucide-react';
import { toast } from 'sonner';

const modulesList = [
  'Dashboard', 'Sales Team', 'Outlets', 'Orders', 'Inventory', 'Schemes',
  'Expenses', 'Reports', 'Master Data', 'Settings', 'Leads', 'Beat Plans',
  'Attendance', 'DSR', 'Leave Management', 'Samples & Gifts', 'Feedback', 'Returns',
];

const roleColorsList = [
  'bg-primary/10 text-primary', 'bg-warning/10 text-warning',
  'bg-secondary/10 text-secondary', 'bg-info/10 text-info',
  'bg-success/10 text-success', 'bg-destructive/10 text-destructive',
];

interface Permission {
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_approve: boolean;
}

export default function RolesPermissionsPage() {
  const { data: roles = [], isLoading } = useRolesWithCount();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const updatePermissions = useUpdatePermissions();
  const { userRole } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState<RoleWithCount | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInactiveConfirm, setShowInactiveConfirm] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  const { data: rolePermissions = [] } = usePermissions(selectedRole?.id || null);

  const [roleForm, setRoleForm] = useState({
    name: '', code: '', level: 5, description: '', status: 'active' as 'active' | 'inactive',
  });

  const [editingPermissions, setEditingPermissions] = useState<Permission[]>(
    modulesList.map(m => ({ module: m, can_view: false, can_create: false, can_edit: false, can_delete: false, can_approve: false }))
  );

  const currentUserRole = roles.find(r => r.code === userRole);
  const currentUserLevel = currentUserRole?.level || 999;

  const getRoleColor = (index: number) => roleColorsList[index % roleColorsList.length];

  const handleEditRole = (role: RoleWithCount) => {
    setSelectedRole(role);
    setRoleForm({ name: role.name, code: role.code, level: role.level, description: role.description || '', status: (role.status || 'active') as 'active' | 'inactive' });
    setModalMode('edit');
    setShowCreateModal(true);
  };

  const handleEditPermissions = (role: RoleWithCount) => {
    setSelectedRole(role);
    const perms = modulesList.map(m => {
      const existing = rolePermissions.find((p: any) => p.module === m);
      return existing ? { module: m, can_view: existing.can_view, can_create: existing.can_create, can_edit: existing.can_edit, can_delete: existing.can_delete, can_approve: existing.can_approve }
        : { module: m, can_view: false, can_create: false, can_edit: false, can_delete: false, can_approve: false };
    });
    setEditingPermissions(perms);
    setShowPermissionModal(true);
  };

  const handleSaveRole = async () => {
    if (!roleForm.name || !roleForm.code) {
      toast.error('Name and Code are required');
      return;
    }

    if (roleForm.status === 'inactive' && modalMode === 'edit' && selectedRole?.user_count && selectedRole.user_count > 0) {
      setShowInactiveConfirm(true);
      return;
    }

    try {
      if (modalMode === 'edit' && selectedRole) {
        await updateRole.mutateAsync({ id: selectedRole.id, ...roleForm });
      } else {
        await createRole.mutateAsync(roleForm);
      }
      resetForm();
    } catch (error) {}
  };

  const confirmInactive = async () => {
    if (!selectedRole) return;
    try {
      await updateRole.mutateAsync({ id: selectedRole.id, ...roleForm });
      setShowInactiveConfirm(false);
      resetForm();
    } catch (error) {}
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    try {
      await updatePermissions.mutateAsync({ roleId: selectedRole.id, permissions: editingPermissions });
      setShowPermissionModal(false);
    } catch (error) {}
  };

  const togglePermission = (module: string, action: keyof Omit<Permission, 'module'>) => {
    setEditingPermissions(prev => prev.map(p => p.module === module ? { ...p, [action]: !p[action] } : p));
  };

  const toggleAllForModule = (module: string, enable: boolean) => {
    setEditingPermissions(prev => prev.map(p => p.module === module 
      ? { ...p, can_view: enable, can_create: enable, can_edit: enable, can_delete: enable, can_approve: enable } : p));
  };

  const resetForm = () => {
    setShowCreateModal(false);
    setSelectedRole(null);
    setModalMode('create');
    setRoleForm({ name: '', code: '', level: 5, description: '', status: 'active' });
  };

  const columns = [
    {
      key: 'name', header: 'Role',
      render: (item: RoleWithCount) => (
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getRoleColor(roles.findIndex(r => r.id === item.id))}`}>
            <Shield size={20} />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">Code: {item.code} • Level {item.level}</p>
          </div>
        </div>
      ),
    },
    { key: 'description', header: 'Description', render: (item: RoleWithCount) => <p className="text-sm text-muted-foreground max-w-xs">{item.description || '-'}</p> },
    {
      key: 'userCount', header: 'Users',
      render: (item: RoleWithCount) => (
        <div className="flex items-center gap-2">
          <Users size={14} className="text-muted-foreground" />
          <span className="font-medium">{item.user_count}</span>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (item: RoleWithCount) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
          {item.status}
        </span>
      ),
    },
    {
      key: 'actions', header: 'Actions',
      render: (item: RoleWithCount) => (
        <div className="flex items-center gap-1">
          <button onClick={() => handleEditPermissions(item)} className="p-2 hover:bg-primary/10 rounded-lg" title="Edit Permissions">
            <Lock size={16} className="text-primary" />
          </button>
          <button onClick={() => handleEditRole(item)} className="p-2 hover:bg-muted rounded-lg" title="Edit Role">
            <Edit size={16} className="text-muted-foreground" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="module-title">Roles & Permissions</h1>
          <p className="text-muted-foreground">Manage role hierarchy and access permissions</p>
        </div>
        <button onClick={() => { setModalMode('create'); setShowCreateModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Create Role
        </button>
      </div>

      {/* Hierarchy */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-medium text-foreground mb-4">Role Hierarchy</h3>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {roles.filter(r => r.status === 'active').sort((a, b) => a.level - b.level).map((role, index) => (
            <div key={role.id} className="flex items-center gap-2">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.1 }}
                className={`px-4 py-3 rounded-lg border-2 ${getRoleColor(roles.findIndex(r => r.id === role.id))} border-current`}>
                <p className="font-semibold text-sm">{role.name}</p>
                <p className="text-xs opacity-70">Level {role.level} • {role.user_count} users</p>
              </motion.div>
              {index < roles.filter(r => r.status === 'active').length - 1 && <ChevronRight size={20} className="text-muted-foreground" />}
            </div>
          ))}
        </div>
      </div>

      <DataTable data={roles} columns={columns} searchPlaceholder="Search roles..." />

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">{modalMode === 'edit' ? 'Edit Role' : 'Create Role'}</h2>
              <button onClick={resetForm} className="p-2 hover:bg-muted rounded-lg"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Role Name *</label>
                  <input type="text" value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role Code *</label>
                  <input type="text" value={roleForm.code} onChange={(e) => setRoleForm({ ...roleForm, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    className="input-field" disabled={modalMode === 'edit' && selectedRole?.is_system} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Hierarchy Level *</label>
                  <input type="number" value={roleForm.level} onChange={(e) => setRoleForm({ ...roleForm, level: parseInt(e.target.value) || 1 })}
                    min={currentUserLevel} className="input-field" />
                  {roleForm.level < currentUserLevel && (
                    <p className="text-xs text-destructive mt-1">Cannot assign level higher than yours</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select value={roleForm.status} onChange={(e) => setRoleForm({ ...roleForm, status: e.target.value as 'active' | 'inactive' })} className="input-field">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea value={roleForm.description} onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })} className="input-field min-h-[80px]" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={resetForm} className="btn-outline">Cancel</button>
              <button onClick={handleSaveRole} className="btn-primary" disabled={roleForm.level < currentUserLevel}>
                {modalMode === 'edit' ? 'Update' : 'Create'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionModal && selectedRole && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Edit Permissions - {selectedRole.name}</h2>
                <p className="text-sm text-muted-foreground">Level {selectedRole.level}</p>
              </div>
              <button onClick={() => setShowPermissionModal(false)} className="p-2 hover:bg-muted rounded-lg"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium">Module</th>
                    <th className="text-center py-3 px-2 text-sm font-medium">View</th>
                    <th className="text-center py-3 px-2 text-sm font-medium">Create</th>
                    <th className="text-center py-3 px-2 text-sm font-medium">Edit</th>
                    <th className="text-center py-3 px-2 text-sm font-medium">Delete</th>
                    <th className="text-center py-3 px-2 text-sm font-medium">Approve</th>
                    <th className="text-center py-3 px-2 text-sm font-medium">All</th>
                  </tr>
                </thead>
                <tbody>
                  {editingPermissions.map(perm => {
                    const allEnabled = perm.can_view && perm.can_create && perm.can_edit && perm.can_delete && perm.can_approve;
                    return (
                      <tr key={perm.module} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-2 px-4 text-sm font-medium">{perm.module}</td>
                        {(['can_view', 'can_create', 'can_edit', 'can_delete', 'can_approve'] as const).map(action => (
                          <td key={action} className="py-2 px-2 text-center">
                            <button onClick={() => togglePermission(perm.module, action)}
                              className={`p-1.5 rounded transition-colors ${perm[action] ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                              {perm[action] ? <Unlock size={14} /> : <Lock size={14} />}
                            </button>
                          </td>
                        ))}
                        <td className="py-2 px-2 text-center">
                          <button onClick={() => toggleAllForModule(perm.module, !allEnabled)}
                            className={`p-1.5 rounded transition-colors ${allEnabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            <Check size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
              <button onClick={() => setShowPermissionModal(false)} className="btn-outline">Cancel</button>
              <button onClick={handleSavePermissions} className="btn-primary flex items-center gap-2">
                <Check size={18} /> Save Permissions
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Inactive Confirmation */}
      {showInactiveConfirm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-warning/10"><AlertTriangle size={24} className="text-warning" /></div>
              <div>
                <h2 className="text-lg font-semibold">Deactivate Role</h2>
                <p className="text-sm text-muted-foreground">{selectedRole?.name} has {selectedRole?.user_count} users</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              This role has active users. Deactivating will affect their access. Are you sure?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowInactiveConfirm(false)} className="btn-outline">Cancel</button>
              <button onClick={confirmInactive} className="btn-primary bg-warning hover:bg-warning/90">Confirm</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
