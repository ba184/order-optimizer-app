import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { GeoFilter } from '@/components/ui/GeoFilter';
import { GeoFilter as GeoFilterType } from '@/data/geoData';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { useVendors, useUpdateVendor, useDeleteVendor, Vendor } from '@/hooks/useVendorsData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Plus,
  Truck,
  Phone,
  Eye,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Building2,
  IndianRupee,
} from 'lucide-react';

const statusStyles: Record<string, string> = {
  active: 'bg-success/10 text-success border-success/20',
  inactive: 'bg-muted text-muted-foreground border-muted',
};

const businessTypeLabels: Record<string, string> = {
  supplier: 'Supplier',
  manufacturer: 'Manufacturer',
  wholesaler: 'Wholesaler',
  importer: 'Importer',
};

export default function VendorsPage() {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const isAdmin = userRole === 'admin';
  const [geoFilter, setGeoFilter] = useState<GeoFilterType>({ country: 'India' });
  const [deleteModal, setDeleteModal] = useState<Vendor | null>(null);

  const { data: vendorsData, isLoading } = useVendors();
  const updateVendor = useUpdateVendor();
  const deleteVendor = useDeleteVendor();

  const vendors: Vendor[] = (vendorsData || []).map((v) => ({
    ...v,
    credit_limit: Number(v.credit_limit) || 0,
    outstanding_amount: Number(v.outstanding_amount) || 0,
    credit_days: Number(v.credit_days) || 30,
  }));

  const filteredData = vendors.filter((v) => {
    if (geoFilter.state && v.state !== geoFilter.state) return false;
    if (geoFilter.city && v.city !== geoFilter.city) return false;
    return true;
  });

  const handleCreate = () => {
    navigate('/outlets/vendors/new');
  };

  const handleEdit = (item: Vendor) => {
    navigate(`/outlets/vendors/${item.id}/edit`);
  };

  const handleToggleStatus = async (item: Vendor) => {
    const newStatus = item.status === 'active' ? 'inactive' : 'active';
    try {
      await updateVendor.mutateAsync({ id: item.id, status: newStatus });
      toast.success(`Vendor ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update vendor status');
    }
  };

  const handleDelete = async () => {
    if (deleteModal) {
      await deleteVendor.mutateAsync(deleteModal.id);
      setDeleteModal(null);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
    return `₹${value}`;
  };

  const stats = {
    total: filteredData.length,
    active: filteredData.filter((v) => v.status === 'active').length,
    inactive: filteredData.filter((v) => v.status === 'inactive').length,
    totalCredit: filteredData.reduce((sum, v) => sum + v.credit_limit, 0),
    totalOutstanding: filteredData.reduce((sum, v) => sum + v.outstanding_amount, 0),
  };

  const columns = [
    {
      key: 'vendor_code',
      header: 'Vendor ID',
      render: (item: Vendor) => (
        <button
          onClick={() => navigate(`/outlets/vendors/${item.id}`)}
          className="font-medium text-primary hover:underline"
        >
          {item.vendor_code}
        </button>
      ),
      sortable: true,
    },
    {
      key: 'firm_name',
      header: 'Firm / Company Name',
      render: (item: Vendor) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Truck size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.firm_name}</p>
            <p className="text-xs text-muted-foreground">{item.contact_person}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'contact_number',
      header: 'Contact',
      render: (item: Vendor) => (
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-muted-foreground" />
          <span className="text-sm">{item.contact_number}</span>
        </div>
      ),
    },
    {
      key: 'business_type',
      header: 'Business Type',
      render: (item: Vendor) => (
        <span className="capitalize">{businessTypeLabels[item.business_type] || item.business_type}</span>
      ),
      sortable: true,
    },
    {
      key: 'credit_limit',
      header: 'Credit Limit',
      render: (item: Vendor) => (
        <span className="font-medium">{formatCurrency(item.credit_limit)}</span>
      ),
      sortable: true,
    },
    {
      key: 'outstanding_amount',
      header: 'Outstanding',
      render: (item: Vendor) => (
        <span className={item.outstanding_amount > 0 ? 'text-warning font-medium' : 'text-muted-foreground'}>
          {formatCurrency(item.outstanding_amount)}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'city',
      header: 'Location',
      render: (item: Vendor) => (
        <span className="text-sm">{item.city}, {item.state}</span>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Vendor) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[item.status] || statusStyles.inactive}`}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Vendor) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/outlets/vendors/${item.id}`); }}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="View"
          >
            <Eye size={16} className="text-muted-foreground" />
          </button>
          {isAdmin && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Edit"
              >
                <Edit size={16} className="text-muted-foreground" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleToggleStatus(item); }}
                className={`p-2 rounded-lg transition-colors ${item.status === 'active' ? 'hover:bg-warning/10' : 'hover:bg-success/10'}`}
                title={item.status === 'active' ? 'Deactivate' : 'Activate'}
              >
                {item.status === 'active' ? (
                  <XCircle size={16} className="text-warning" />
                ) : (
                  <CheckCircle size={16} className="text-success" />
                )}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteModal(item); }}
                className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 size={16} className="text-destructive" />
              </button>
            </>
          )}
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
      <div className="module-header">
        <div>
          <h1 className="module-title">Vendors</h1>
          <p className="text-muted-foreground">Manage supplier/vendor master data and procurement relationships</p>
        </div>
        {isAdmin && (
          <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Add Vendor
          </button>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <GeoFilter value={geoFilter} onChange={setGeoFilter} showArea={false} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10"><Truck size={24} className="text-primary" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Vendors</p>
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
            <div className="p-3 rounded-xl bg-muted"><XCircle size={24} className="text-muted-foreground" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.inactive}</p>
              <p className="text-sm text-muted-foreground">Inactive</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10"><IndianRupee size={24} className="text-secondary" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalCredit)}</p>
              <p className="text-sm text-muted-foreground">Total Credit</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10"><IndianRupee size={24} className="text-warning" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalOutstanding)}</p>
              <p className="text-sm text-muted-foreground">Outstanding</p>
            </div>
          </div>
        </motion.div>
      </div>

      <DataTable
        data={filteredData}
        columns={columns}
        searchPlaceholder="Search by name, code, phone..."
        onRowClick={(item) => navigate(`/outlets/vendors/${item.id}`)}
        emptyMessage="No vendors found. Add your first vendor!"
      />

      <DeleteConfirmModal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
        title="Delete Vendor"
        message={`Are you sure you want to delete "${deleteModal?.firm_name}"? This action cannot be undone if vendor has no PO/GRN history.`}
      />
    </div>
  );
}
