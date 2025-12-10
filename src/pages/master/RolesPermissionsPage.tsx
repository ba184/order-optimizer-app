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
} from 'lucide-react';
import { toast } from 'sonner';
import { UserRole } from '@/types';

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
  code: UserRole;
  level: number;
  description: string;
  reportsTo: UserRole | null;
  permissions: Permission[];
  userCount: number;
  status: 'active' | 'inactive';
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

const defaultPermissions: Permission[] = modulesList.map((module, idx) => ({
  id: `perm-${idx}`,
  module,
  actions: { view: false, create: false, edit: false, delete: false, approve: false },
}));

const roleHierarchy: Role[] = [
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
  },
];

const roleColors: Record<UserRole, string> = {
  admin: 'bg-primary/10 text-primary',
  rsm: 'bg-warning/10 text-warning',
  asm: 'bg-secondary/10 text-secondary',
  sales_executive: 'bg-info/10 text-info',
};

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState<Role[]>(roleHierarchy);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [editingPermissions, setEditingPermissions] = useState<Permission[]>([]);

  const handleEditPermissions = (role: Role) => {
    setSelectedRole(role);
    setEditingPermissions(JSON.parse(JSON.stringify(role.permissions)));
    setShowPermissionModal(true);
  };

  const togglePermission = (permId: string, action: keyof Permission['actions']) => {
    setEditingPermissions(prev =>
      prev.map(p =>
        p.id === permId ? { ...p, actions: { ...p.actions, [action]: !p.actions[action] } } : p
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

  const columns = [
    {
      key: 'name',
      header: 'Role',
      render: (item: Role) => (
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${roleColors[item.code]}`}>
            <Shield size={20} />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">Level {item.level}</p>
          </div>
        </div>
      ),
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
          <span className="text-sm">{roleHierarchy.find(r => r.code === item.reportsTo)?.name || '-'}</span>
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
          <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="View">
            <Eye size={16} className="text-muted-foreground" />
          </button>
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
      </div>

      {/* Role Hierarchy Visualization */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-medium text-foreground mb-4">Role Hierarchy</h3>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {roles.map((role, index) => (
            <div key={role.id} className="flex items-center gap-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`px-4 py-3 rounded-lg border-2 ${roleColors[role.code]} border-current`}
              >
                <p className="font-semibold text-sm">{role.name}</p>
                <p className="text-xs opacity-70">Level {role.level}</p>
              </motion.div>
              {index < roles.length - 1 && (
                <ChevronRight size={20} className="text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {roles.map((role, index) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="stat-card"
          >
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${roleColors[role.code]}`}>
                <Shield size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{role.userCount}</p>
                <p className="text-sm text-muted-foreground">{role.name}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Roles Table */}
      <DataTable data={roles} columns={columns} searchPlaceholder="Search roles..." />

      {/* Permissions Modal */}
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
