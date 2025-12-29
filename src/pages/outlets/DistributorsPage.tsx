import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge, StatusType } from '@/components/ui/StatusBadge';
import { GeoFilter } from '@/components/ui/GeoFilter';
import { GeoFilter as GeoFilterType } from '@/data/geoData';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { useDistributors, useUpdateDistributor, useDeleteDistributor } from '@/hooks/useOutletsData';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Plus,
  Building2,
  Phone,
  Eye,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Package,
  FileText,
} from 'lucide-react';

interface Distributor {
  id: string;
  code: string;
  firm_name: string;
  owner_name: string;
  contact_name?: string;
  gstin: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  credit_limit: number;
  outstanding_amount: number;
  status: string;
  category?: string;
  kyc_status?: string;
  approval_status?: string;
  interested_products?: string[];
  created_by?: string;
}

const approvalStatusStyles: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

const kycStatusStyles: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  verified: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
};

export default function DistributorsPage() {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const isAdmin = userRole === 'admin';
  const [geoFilter, setGeoFilter] = useState<GeoFilterType>({ country: 'India' });
  const [deleteModal, setDeleteModal] = useState<Distributor | null>(null);
  const [rejectModal, setRejectModal] = useState<Distributor | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: distributorsData, isLoading, refetch } = useDistributors();
  const updateDistributor = useUpdateDistributor();
  const deleteDistributor = useDeleteDistributor();

  const distributors: Distributor[] = (distributorsData || []).map((d: any) => ({
    ...d,
    credit_limit: Number(d.credit_limit) || 0,
    outstanding_amount: Number(d.outstanding_amount) || 0,
  }));

  const filteredData = distributors.filter(d => {
    if (geoFilter.state && d.state !== geoFilter.state) return false;
    return true;
  });

  const handleCreate = () => {
    navigate('/outlets/distributors/new');
  };

  const handleEdit = (item: Distributor) => {
    navigate(`/outlets/distributors/${item.id}/edit`);
  };

  const handleApprove = async (item: Distributor) => {
    try {
      await updateDistributor.mutateAsync({
        id: item.id,
        approval_status: 'approved',
        status: 'active',
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
      });
      toast.success('Distributor approved successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve distributor');
    }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      await updateDistributor.mutateAsync({
        id: rejectModal.id,
        approval_status: 'rejected',
        status: 'rejected',
        rejection_reason: rejectionReason,
      });
      toast.success('Distributor rejected');
      setRejectModal(null);
      setRejectionReason('');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject distributor');
    }
  };

  const handleDelete = async () => {
    if (deleteModal) {
      await deleteDistributor.mutateAsync(deleteModal.id);
      setDeleteModal(null);
    }
  };

  const getCreatedByLabel = (distributor: Distributor) => {
    // For now, assume if created_by matches current admin, it's admin-created
    // In real scenario, you'd join with profiles table
    return distributor.created_by ? 'FSE' : 'Admin';
  };

  const stats = {
    total: filteredData.length,
    active: filteredData.filter(d => d.status === 'active').length,
    pending: filteredData.filter(d => (d.approval_status || d.status) === 'pending').length,
    rejected: filteredData.filter(d => (d.approval_status || d.status) === 'rejected').length,
  };

  const columns = [
    {
      key: 'code',
      header: 'Distributor ID',
      render: (item: Distributor) => (
        <button 
          onClick={() => navigate(`/outlets/distributors/${item.id}`)}
          className="font-medium text-primary hover:underline"
        >
          {item.code}
        </button>
      ),
      sortable: true,
    },
    {
      key: 'firm_name',
      header: 'Firm Name',
      render: (item: Distributor) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.firm_name}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    { 
      key: 'contact_name', 
      header: 'Contact Name', 
      render: (item: Distributor) => item.contact_name || item.owner_name,
      sortable: true 
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (item: Distributor) => (
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-muted-foreground" />
          <span className="text-sm">{item.phone || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (item: Distributor) => (
        <span className="capitalize">{item.category || 'Standard'}</span>
      ),
    },
    {
      key: 'products',
      header: 'Products',
      render: (item: Distributor) => (
        <div className="flex items-center gap-2">
          <Package size={14} className="text-muted-foreground" />
          <span>{item.interested_products?.length || 0}</span>
        </div>
      ),
    },
    {
      key: 'kyc_status',
      header: 'KYC Status',
      render: (item: Distributor) => {
        const status = item.kyc_status || 'pending';
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${kycStatusStyles[status] || kycStatusStyles.pending}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      key: 'created_by',
      header: 'Created By',
      render: (item: Distributor) => (
        <span className="text-sm">{getCreatedByLabel(item)}</span>
      ),
    },
    {
      key: 'approval_status',
      header: 'Approval Status',
      render: (item: Distributor) => {
        const status = item.approval_status || item.status || 'pending';
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${approvalStatusStyles[status] || approvalStatusStyles.pending}`}>
            {status === 'pending' ? 'Pending Approval' : status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Distributor) => {
        const isPending = (item.approval_status || item.status) === 'pending';
        const isRejected = (item.approval_status || item.status) === 'rejected';
        
        return (
          <div className="flex items-center gap-1">
            {isAdmin && isPending && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleApprove(item); }}
                  className="p-2 hover:bg-success/10 rounded-lg transition-colors"
                  title="Approve"
                >
                  <CheckCircle size={16} className="text-success" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setRejectModal(item); }}
                  className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Reject"
                >
                  <XCircle size={16} className="text-destructive" />
                </button>
              </>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); navigate(`/outlets/distributors/${item.id}`); }}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="View"
            >
              <Eye size={16} className="text-muted-foreground" />
            </button>
            {(isAdmin || isRejected) && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Edit"
              >
                <Edit size={16} className="text-muted-foreground" />
              </button>
            )}
            {isAdmin && (
              <button 
                onClick={(e) => { e.stopPropagation(); setDeleteModal(item); }}
                className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 size={16} className="text-destructive" />
              </button>
            )}
          </div>
        );
      },
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
      <div className="module-header">
        <div>
          <h1 className="module-title">Distributors</h1>
          <p className="text-muted-foreground">Manage distributor network and approvals</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add Distributor
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <GeoFilter value={geoFilter} onChange={setGeoFilter} showArea={false} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10"><Building2 size={24} className="text-primary" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10"><CheckCircle size={24} className="text-success" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10"><FileText size={24} className="text-warning" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/10"><XCircle size={24} className="text-destructive" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.rejected}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </div>
        </motion.div>
      </div>

      <DataTable 
        data={filteredData} 
        columns={columns} 
        searchPlaceholder="Search by name, code, phone..." 
        onRowClick={(item) => navigate(`/outlets/distributors/${item.id}`)} 
        emptyMessage="No distributors found. Add your first distributor!"
      />

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
        title="Delete Distributor"
        message={`Are you sure you want to delete "${deleteModal?.firm_name}"? This action cannot be undone.`}
      />

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Reject Distributor</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to reject "{rejectModal.firm_name}"? Please provide a reason.
            </p>
            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={3}
              className="input-field resize-none mb-4"
            />
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => { setRejectModal(null); setRejectionReason(''); }}
                className="btn-outline"
              >
                Cancel
              </button>
              <button 
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className="btn-primary bg-destructive hover:bg-destructive/90 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}