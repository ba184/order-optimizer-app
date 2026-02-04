import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge, StatusType } from '@/components/ui/StatusBadge';
import { useUsersData, useRoles, UserWithRole } from '@/hooks/useUsersData';
import {
  Plus,
  Users,
  User,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Loader2,
} from 'lucide-react';

const roleColors: Record<string, string> = {
  sales_executive: 'bg-info/10 text-info',
  asm: 'bg-secondary/10 text-secondary',
  rsm: 'bg-warning/10 text-warning',
  admin: 'bg-primary/10 text-primary',
};

export default function EmployeesPage() {
  const navigate = useNavigate();
  const { users, isLoading, updateUser, deleteUser } = useUsersData();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredUsers = users.filter(u => {
    if (statusFilter === 'all') return true;
    return u.status === statusFilter;
  });

  const handleDelete = (user: UserWithRole) => {
    if (confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      deleteUser.mutate(user.id);
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

  const columns = [
    {
      key: 'employee_id',
      header: 'Employee ID',
      render: (item: UserWithRole) => (
        <span className="font-mono text-sm text-muted-foreground">
          {item.id.slice(0, 8).toUpperCase()}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'name',
      header: 'Employee',
      render: (item: UserWithRole) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.email}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'mobile',
      header: 'Mobile',
      render: (item: UserWithRole) => (
        <div className="flex items-center gap-2 text-sm">
          <Phone size={14} className="text-muted-foreground" />
          <span>{item.phone || '-'}</span>
        </div>
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
      key: 'territory',
      header: 'Territory',
      render: (item: UserWithRole) => (
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-muted-foreground" />
          <span className="text-sm">
            {item.territory || '-'}
          </span>
        </div>
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
    </div>
  );
}
