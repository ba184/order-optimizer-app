import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, User, Mail, Phone, MapPin, Shield, Calendar, Key, Target, Heart, AlertCircle } from 'lucide-react';
import { StatusBadge, StatusType } from '@/components/ui/StatusBadge';
import { useUsersData, useRoles } from '@/hooks/useUsersData';
import { format } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const roleColors: Record<string, string> = {
  sales_executive: 'bg-info/10 text-info',
  manager: 'bg-secondary/10 text-secondary',
  admin: 'bg-primary/10 text-primary',
  warehouse_manager: 'bg-warning/10 text-warning',
};

export default function EmployeeViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { users, resetPassword } = useUsersData();
  const { data: roles = [] } = useRoles();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const employee = users.find(u => u.id === id);

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Employee not found</p>
      </div>
    );
  }

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsResettingPassword(true);
    try {
      await resetPassword.mutateAsync({
        userId: employee.id,
        newPassword,
      });
      setShowPasswordModal(false);
      setNewPassword('');
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsResettingPassword(false);
    }
  };

  const InfoCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      {children}
    </div>
  );

  const InfoRow = ({ label, value, icon: Icon }: { label: string; value: string | React.ReactNode; icon?: any }) => (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      {Icon && <Icon size={18} className="text-muted-foreground mt-0.5" />}
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-foreground font-medium">{value || '-'}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/master/employees')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User size={32} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{employee.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[employee.role_code || ''] || 'bg-muted text-muted-foreground'}`}>
                  {employee.role_name || 'No Role'}
                </span>
                <StatusBadge status={(employee.status || 'active') as StatusType} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="btn-outline flex items-center gap-2"
          >
            <Key size={16} />
            Reset Password
          </button>
          <button
            onClick={() => navigate(`/master/employees/${id}/edit`)}
            className="btn-primary flex items-center gap-2"
          >
            <Edit size={16} />
            Edit Employee
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-2 gap-6">
        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <InfoCard title="Basic Information">
            <InfoRow 
              label="Employee ID" 
              value={<span className="font-mono">{employee.employee_id || employee.id.slice(0, 8).toUpperCase()}</span>}
            />
            <InfoRow label="Full Name" value={employee.name} icon={User} />
            <InfoRow label="Email" value={employee.email} icon={Mail} />
            <InfoRow label="Mobile" value={employee.phone || '-'} icon={Phone} />
            <InfoRow 
              label="Status" 
              value={<StatusBadge status={(employee.status || 'active') as StatusType} />}
            />
          </InfoCard>
        </motion.div>

        {/* Role & Reporting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <InfoCard title="Role & Reporting">
            <InfoRow 
              label="Role" 
              value={
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[employee.role_code || ''] || 'bg-muted text-muted-foreground'}`}>
                  {employee.role_name || 'No Role'}
                </span>
              }
              icon={Shield}
            />
            <InfoRow label="Reports To" value={employee.reporting_to_name || '-'} icon={User} />
            <InfoRow 
              label="Date of Joining" 
              value={employee.doj ? format(new Date(employee.doj), 'PPP') : '-'}
              icon={Calendar}
            />
            <InfoRow 
              label="Created At" 
              value={employee.created_at ? format(new Date(employee.created_at), 'PPP') : '-'}
              icon={Calendar}
            />
          </InfoCard>
        </motion.div>

        {/* Personal Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <InfoCard title="Personal Details">
            <InfoRow 
              label="Date of Birth" 
              value={employee.dob ? format(new Date(employee.dob), 'PPP') : '-'}
              icon={Calendar}
            />
            <InfoRow label="Blood Group" value={employee.blood_group || '-'} icon={Heart} />
          </InfoCard>
        </motion.div>

        {/* Emergency Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <InfoCard title="Emergency Contact">
            <InfoRow label="Contact Name" value={employee.emergency_contact_name || '-'} icon={AlertCircle} />
            <InfoRow label="Contact Phone" value={employee.emergency_contact_phone || '-'} icon={Phone} />
          </InfoCard>
        </motion.div>

        {/* Location Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <InfoCard title="Location Information">
            <InfoRow label="Region" value={employee.region || '-'} icon={MapPin} />
            <InfoRow label="Territory" value={employee.territory || '-'} icon={MapPin} />
          </InfoCard>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <InfoCard title="Quick Actions">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/master/targets')}
                className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left"
              >
                <Target size={18} className="text-success" />
                <span className="text-sm font-medium">Set Target</span>
              </button>
              <button
                onClick={() => navigate('/master/roles')}
                className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left"
              >
                <Shield size={18} className="text-primary" />
                <span className="text-sm font-medium">Permissions</span>
              </button>
            </div>
          </InfoCard>
        </motion.div>
      </div>

      {/* Reset Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Reset Password</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Set a new password for {employee.name}
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