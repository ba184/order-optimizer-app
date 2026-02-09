import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge, StatusType } from '@/components/ui/StatusBadge';
import { useUsersData, UserWithRole } from '@/hooks/useUsersData';
import {
  Plus,
  Users,
  Eye,
  Edit,
  Trash2,
  Key,
  UserCheck,
  UserX,
  Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const roleColors: Record<string, string> = {
  sales_executive: 'bg-info/10 text-info',
  manager: 'bg-secondary/10 text-secondary',
  admin: 'bg-primary/10 text-primary',
  warehouse_manager: 'bg-warning/10 text-warning',
};

export default function EmployeesPage() {
  const navigate = useNavigate();
  const { users, isLoading, deleteUser, resetPassword } = useUsersData();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<UserWithRole | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const filteredUsers = users.filter(u => {
    if (statusFilter === 'all') return true;
    return u.status === statusFilter;
  });

  const handleDelete = (user: UserWithRole) => {
    if (confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      deleteUser.mutate(user.id);
    }
  };

  const handleResetPasswordClick = (user: UserWithRole) => {
    setSelectedEmployee(user);
    setShowPasswordModal(true);
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!selectedEmployee) return;

    setIsResettingPassword(true);
    try {
      await resetPassword.mutateAsync({
        userId: selectedEmployee.id,
        newPassword,
      });
      setShowPasswordModal(false);
      setNewPassword('');
      setSelectedEmployee(null);
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsResettingPassword(false);
    }
  };

  const columns = [
    {
      key: 'employee_id',
      header: 'E Code',
      render: (item: UserWithRole) => (
        <span className="font-mono text-sm text-foreground font-medium">
          {item.employee_id || item.id.slice(0, 8).toUpperCase()}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'name',
      header: 'Employee Name',
      render: (item: UserWithRole) => (
        <span className="font-medium text-foreground">{item.name}</span>
      ),
      sortable: true,
    },
    {
      key: 'email',
      header: 'Email',
      render: (item: UserWithRole) => (
        <span className="text-sm text-muted-foreground">{item.email}</span>
      ),
    },
    {
      key: 'mobile',
      header: 'Mobile',
      render: (item: UserWithRole) => (
        <span className="text-sm">{item.phone || '-'}</span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (item: UserWithRole) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[item.role_code || ''] || 'bg-muted text-muted-foreground'}`}>
          {item.role_name || 'No Role'}
        </span>
      ),
    },
    {
      key: 'reportingTo',
      header: 'Report To',
      render: (item: UserWithRole) => (
        <span className="text-sm">{item.reporting_to_name || '-'}</span>
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
            onClick={() => navigate(`/master/employees/${item.id}`)}
            className="p-2 hover:bg-muted rounded-lg transition-colors" 
            title="View"
          >
            <Eye size={16} className="text-muted-foreground" />
          </button>
          <button 
            onClick={() => navigate(`/master/employees/${item.id}/edit`)}
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
          <button 
            onClick={() => handleResetPasswordClick(item)}
            className="p-2 hover:bg-warning/10 rounded-lg transition-colors" 
            title="Reset Password"
          >
            <Key size={16} className="text-warning" />
          </button>
        </div>
      ),
    },
  ];

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
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
          <h1 className="module-title">Employee Management</h1>
          <p className="text-muted-foreground">Manage employees, roles, and assignments</p>
        </div>
        <button 
          onClick={() => navigate('/master/employees/new')} 
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { key: 'all', label: 'Total Employees', count: stats.total, icon: Users, color: 'bg-primary/10 text-primary' },
          { key: 'active', label: 'Active', count: stats.active, icon: UserCheck, color: 'bg-success/10 text-success' },
          { key: 'inactive', label: 'Inactive', count: stats.inactive, icon: UserX, color: 'bg-destructive/10 text-destructive' },
        ].map((stat, index) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`stat-card cursor-pointer ${statusFilter === stat.key ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setStatusFilter(stat.key)}
          >
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.count}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Employees Table */}
      <DataTable 
        data={filteredUsers} 
        columns={columns} 
        searchPlaceholder="Search employees..." 
        emptyMessage="No employees found. Click 'Add Employee' to create one."
      />

      {/* Reset Password Modal */}
      {showPasswordModal && selectedEmployee && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Reset Password</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Set a new password for {selectedEmployee.name}
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setNewPassword('');
                    setSelectedEmployee(null);
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetPassword}
                  disabled={isResettingPassword}
                  className="btn-primary"
                >
                  {isResettingPassword ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}