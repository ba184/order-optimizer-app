import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge, StatusType } from '@/components/ui/StatusBadge';
import { GeoFilter } from '@/components/ui/GeoFilter';
import { GeoFilter as GeoFilterType } from '@/data/geoData';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { useRetailers, useUpdateRetailer, useDeleteRetailer, useDistributors } from '@/hooks/useOutletsData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Plus,
  Store,
  Star,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Check,
  X,
  User,
} from 'lucide-react';

interface Retailer {
  id: string;
  code: string;
  shop_name: string;
  owner_name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  category: string;
  distributor_id: string | null;
  last_visit: string | null;
  last_order_value: number;
  status: string;
  approval_status?: string;
  created_by?: string;
  distributors?: { id: string; firm_name: string; code: string } | null;
}

const categoryColors: Record<string, string> = {
  A: 'bg-success text-success-foreground',
  B: 'bg-warning text-warning-foreground',
  C: 'bg-muted text-muted-foreground',
};

const approvalStatusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  active: 'bg-success/10 text-success border-success/20',
  inactive: 'bg-muted text-muted-foreground border-muted',
};

export default function RetailersPage() {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const isAdmin = userRole === 'admin';
  const [geoFilter, setGeoFilter] = useState<GeoFilterType>({ country: 'India' });
  const [deleteModal, setDeleteModal] = useState<Retailer | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { data: retailersData, isLoading } = useRetailers();
  const { data: distributorsData } = useDistributors();
  const updateRetailer = useUpdateRetailer();
  const deleteRetailer = useDeleteRetailer();

  const retailers: Retailer[] = (retailersData || []).map((r: any) => ({
    ...r,
    last_order_value: Number(r.last_order_value) || 0,
    approval_status: r.approval_status || r.status || 'pending',
  }));

  const distributors = distributorsData || [];

  const filteredData = retailers.filter(r => {
    if (geoFilter.city && r.city !== geoFilter.city) return false;
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    return true;
  });

  const handleCreate = () => {
    navigate('/outlets/retailers/new');
  };

  const handleEdit = (item: Retailer) => {
    navigate(`/outlets/retailers/${item.id}/edit`);
  };

  const handleApprove = async (item: Retailer) => {
    try {
      await updateRetailer.mutateAsync({
        id: item.id,
        approval_status: 'approved',
        status: 'active',
      });
      toast.success(`${item.shop_name} has been approved`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve retailer');
    }
  };

  const handleReject = async (item: Retailer) => {
    try {
      await updateRetailer.mutateAsync({
        id: item.id,
        approval_status: 'rejected',
        status: 'rejected',
      });
      toast.success(`${item.shop_name} has been rejected`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject retailer');
    }
  };

  const handleDelete = async () => {
    if (deleteModal) {
      await deleteRetailer.mutateAsync(deleteModal.id);
      setDeleteModal(null);
    }
  };

  const getDistributorName = (distributorId: string | null) => {
    if (!distributorId) return 'N/A';
    const distributor = distributors.find((d: any) => d.id === distributorId);
    return distributor?.firm_name || 'N/A';
  };

  const stats = {
    total: filteredData.length,
    categoryA: filteredData.filter(r => r.category === 'A').length,
    categoryB: filteredData.filter(r => r.category === 'B').length,
    categoryC: filteredData.filter(r => r.category === 'C').length,
  };

  const columns = [
    {
      key: 'code',
      header: 'Retailer ID',
      render: (item: Retailer) => (
        <span className="font-mono text-sm text-muted-foreground">{item.code}</span>
      ),
      sortable: true,
    },
    {
      key: 'shop_name',
      header: 'Firm Name',
      render: (item: Retailer) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Store size={20} className="text-secondary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.shop_name}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'owner_name',
      header: 'Contact Name',
      render: (item: Retailer) => (
        <div className="flex items-center gap-2">
          <User size={14} className="text-muted-foreground" />
          <span>{item.owner_name}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'phone',
      header: 'Phone Number',
      render: (item: Retailer) => (
        <span className="text-sm">{item.phone || 'N/A'}</span>
      ),
    },
    {
      key: 'distributor',
      header: 'Distributor',
      render: (item: Retailer) => (
        <span className="text-sm">{item.distributors?.firm_name || getDistributorName(item.distributor_id)}</span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (item: Retailer) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${categoryColors[item.category] || categoryColors['C']}`}>
          {item.category}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'created_by',
      header: 'Created By',
      render: (item: Retailer) => (
        <span className="text-sm text-muted-foreground">
          {item.created_by ? 'FSE' : 'Admin'}
        </span>
      ),
    },
    {
      key: 'approval_status',
      header: 'Approval Status',
      render: (item: Retailer) => {
        const status = item.approval_status || item.status || 'pending';
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${approvalStatusColors[status] || approvalStatusColors['pending']}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Retailer) => {
        const status = item.approval_status || item.status || 'pending';
        const canApprove = isAdmin && status === 'pending';
        const canEdit = status === 'rejected' || isAdmin;

        return (
          <div className="flex items-center gap-1">
            {canApprove && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handleApprove(item); }}
                  className="p-2 hover:bg-success/10 rounded-lg transition-colors"
                  title="Approve"
                >
                  <Check size={16} className="text-success" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleReject(item); }}
                  className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Reject"
                >
                  <X size={16} className="text-destructive" />
                </button>
              </>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/outlets/retailers/${item.id}`); }}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="View"
            >
              <Eye size={16} className="text-muted-foreground" />
            </button>
            {canEdit && (
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
          <h1 className="module-title">Retailers</h1>
          <p className="text-muted-foreground">Manage retail outlet network</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add Retailer
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <GeoFilter value={geoFilter} onChange={setGeoFilter} showArea={false} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10"><Store size={24} className="text-primary" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Retailers</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card cursor-pointer" onClick={() => setCategoryFilter(categoryFilter === 'A' ? 'all' : 'A')}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10"><Star size={24} className="text-success" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.categoryA}</p>
              <p className="text-sm text-muted-foreground">Category A</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card cursor-pointer" onClick={() => setCategoryFilter(categoryFilter === 'B' ? 'all' : 'B')}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10"><Star size={24} className="text-warning" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.categoryB}</p>
              <p className="text-sm text-muted-foreground">Category B</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card cursor-pointer" onClick={() => setCategoryFilter(categoryFilter === 'C' ? 'all' : 'C')}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-muted"><Star size={24} className="text-muted-foreground" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.categoryC}</p>
              <p className="text-sm text-muted-foreground">Category C</p>
            </div>
          </div>
        </motion.div>
      </div>

      <DataTable
        data={filteredData}
        columns={columns}
        searchPlaceholder="Search by firm name, contact, code..."
        onRowClick={(item) => navigate(`/outlets/retailers/${item.id}`)}
        emptyMessage="No retailers found. Add your first retailer!"
      />

      <DeleteConfirmModal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
        title="Delete Retailer"
        message={`Are you sure you want to delete "${deleteModal?.shop_name}"? This action cannot be undone.`}
      />
    </div>
  );
}