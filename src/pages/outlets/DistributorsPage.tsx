import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GeoFilter } from '@/components/ui/GeoFilter';
import { GeoFilter as GeoFilterType } from '@/data/geoData';
import { CrudModal, FieldConfig } from '@/components/ui/CrudModal';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import {
  Plus,
  Building2,
  MapPin,
  Phone,
  IndianRupee,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

interface Distributor {
  id: string;
  code: string;
  firmName: string;
  ownerName: string;
  gstin: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  address: string;
  creditLimit: number;
  outstandingAmount: number;
  status: 'active' | 'pending' | 'inactive';
  lastOrderDate: string;
}

const initialDistributors: Distributor[] = [
  { id: 'd-001', code: 'DIST-DEL-001', firmName: 'Krishna Traders', ownerName: 'Ramesh Krishna', gstin: '07AABCT1234K1ZK', city: 'New Delhi', state: 'Delhi', phone: '+91 98765 43210', email: 'krishna@traders.com', address: 'Shop 1, Karol Bagh', creditLimit: 500000, outstandingAmount: 125000, status: 'active', lastOrderDate: '2024-12-08' },
  { id: 'd-002', code: 'DIST-DEL-002', firmName: 'Sharma Distributors', ownerName: 'Anil Sharma', gstin: '07BRSPS5678L2YZ', city: 'Gurgaon', state: 'Haryana', phone: '+91 98765 43211', email: 'sharma@dist.com', address: 'DLF Phase 2', creditLimit: 750000, outstandingAmount: 280000, status: 'active', lastOrderDate: '2024-12-07' },
  { id: 'd-003', code: 'DIST-MUM-001', firmName: 'Patel Trading Co', ownerName: 'Jayesh Patel', gstin: '27CCPPS9012M3AB', city: 'Mumbai', state: 'Maharashtra', phone: '+91 98765 43212', email: 'patel@trading.com', address: 'Andheri West', creditLimit: 1000000, outstandingAmount: 450000, status: 'active', lastOrderDate: '2024-12-06' },
  { id: 'd-004', code: 'DIST-CHE-001', firmName: 'Gupta Enterprises', ownerName: 'Suresh Gupta', gstin: '33DDGPS3456N4CD', city: 'Chennai', state: 'Tamil Nadu', phone: '+91 98765 43213', email: 'gupta@ent.com', address: 'T Nagar', creditLimit: 600000, outstandingAmount: 180000, status: 'pending', lastOrderDate: '2024-12-05' },
  { id: 'd-005', code: 'DIST-KOL-001', firmName: 'Singh & Sons', ownerName: 'Harpreet Singh', gstin: '19EESPS7890O5EF', city: 'Kolkata', state: 'West Bengal', phone: '+91 98765 43214', email: 'singh@sons.com', address: 'Park Street', creditLimit: 400000, outstandingAmount: 95000, status: 'active', lastOrderDate: '2024-12-04' },
];

const states = [
  { value: 'Delhi', label: 'Delhi' },
  { value: 'Haryana', label: 'Haryana' },
  { value: 'Maharashtra', label: 'Maharashtra' },
  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
  { value: 'West Bengal', label: 'West Bengal' },
];

const fields: FieldConfig[] = [
  { key: 'code', label: 'Distributor Code', type: 'text', required: true, placeholder: 'e.g., DIST-DEL-001' },
  { key: 'firmName', label: 'Firm Name', type: 'text', required: true, placeholder: 'Enter firm name' },
  { key: 'ownerName', label: 'Owner Name', type: 'text', required: true, placeholder: 'Enter owner name' },
  { key: 'gstin', label: 'GSTIN', type: 'text', required: true, placeholder: 'Enter GSTIN' },
  { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Enter email' },
  { key: 'phone', label: 'Phone', type: 'text', required: true, placeholder: '+91 98765 43210' },
  { key: 'state', label: 'State', type: 'select', required: true, options: states },
  { key: 'city', label: 'City', type: 'text', required: true, placeholder: 'Enter city' },
  { key: 'address', label: 'Address', type: 'textarea', placeholder: 'Enter full address' },
  { key: 'creditLimit', label: 'Credit Limit (₹)', type: 'number', required: true, placeholder: '500000' },
  { key: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'pending', label: 'Pending' }, { value: 'inactive', label: 'Inactive' }] },
];

const formatCurrency = (value: number) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
};

export default function DistributorsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<Distributor[]>(initialDistributors);
  const [geoFilter, setGeoFilter] = useState<GeoFilterType>({ country: 'India' });
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<Distributor | null>(null);
  const [selectedItem, setSelectedItem] = useState<Distributor | null>(null);
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>('create');

  const filteredData = data.filter(d => {
    if (geoFilter.state && d.state !== geoFilter.state) return false;
    return true;
  });

  const handleCreate = () => {
    navigate('/outlets/distributors/new');
  };

  const handleView = (item: Distributor) => {
    setSelectedItem(item);
    setMode('view');
    setModalOpen(true);
  };

  const handleEdit = (item: Distributor) => {
    setSelectedItem(item);
    setMode('edit');
    setModalOpen(true);
  };

  const handleSubmit = (formData: Record<string, any>) => {
    if (mode === 'create') {
      const newItem: Distributor = {
        id: Date.now().toString(),
        code: formData.code,
        firmName: formData.firmName,
        ownerName: formData.ownerName,
        gstin: formData.gstin,
        city: formData.city,
        state: formData.state,
        phone: formData.phone,
        email: formData.email,
        address: formData.address || '',
        creditLimit: Number(formData.creditLimit),
        outstandingAmount: 0,
        status: formData.status || 'pending',
        lastOrderDate: '-',
      };
      setData([...data, newItem]);
      toast.success('Distributor created successfully');
    } else {
      setData(data.map(item => item.id === selectedItem?.id ? { ...item, ...formData, creditLimit: Number(formData.creditLimit) } : item));
      toast.success('Distributor updated successfully');
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteModal) {
      setData(data.filter(item => item.id !== deleteModal.id));
      toast.success('Distributor deleted successfully');
      setDeleteModal(null);
    }
  };

  const stats = {
    total: filteredData.length,
    active: filteredData.filter(d => d.status === 'active').length,
    pending: filteredData.filter(d => d.status === 'pending').length,
    totalCredit: filteredData.reduce((sum, d) => sum + d.creditLimit, 0),
    totalOutstanding: filteredData.reduce((sum, d) => sum + d.outstandingAmount, 0),
  };

  const columns = [
    {
      key: 'firmName',
      header: 'Distributor',
      render: (item: Distributor) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.firmName}</p>
            <p className="text-xs text-muted-foreground">{item.code}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    { key: 'ownerName', header: 'Owner', sortable: true },
    {
      key: 'location',
      header: 'Location',
      render: (item: Distributor) => (
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-muted-foreground" />
          <span>{item.city}, {item.state}</span>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Contact',
      render: (item: Distributor) => (
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-muted-foreground" />
          <span className="text-sm">{item.phone}</span>
        </div>
      ),
    },
    {
      key: 'creditLimit',
      header: 'Credit Limit',
      render: (item: Distributor) => <span className="font-medium">{formatCurrency(item.creditLimit)}</span>,
      sortable: true,
    },
    {
      key: 'outstandingAmount',
      header: 'Outstanding',
      render: (item: Distributor) => {
        const percentage = (item.outstandingAmount / item.creditLimit) * 100;
        return (
          <div>
            <span className={`font-medium ${percentage > 80 ? 'text-destructive' : percentage > 50 ? 'text-warning' : 'text-foreground'}`}>
              {formatCurrency(item.outstandingAmount)}
            </span>
            <div className="w-full h-1.5 bg-muted rounded-full mt-1">
              <div className={`h-full rounded-full ${percentage > 80 ? 'bg-destructive' : percentage > 50 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Distributor) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Distributor) => (
        <div className="flex items-center gap-1">
          <button onClick={() => handleView(item)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Eye size={16} className="text-muted-foreground" />
          </button>
          <button onClick={() => handleEdit(item)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Edit size={16} className="text-muted-foreground" />
          </button>
          <button onClick={() => setDeleteModal(item)} className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
            <Trash2 size={16} className="text-destructive" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="module-title">Distributors</h1>
          <p className="text-muted-foreground">Manage distributor network and credit</p>
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
              <p className="text-sm text-muted-foreground">Total Distributors</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10"><Building2 size={24} className="text-success" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10"><IndianRupee size={24} className="text-secondary" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalCredit)}</p>
              <p className="text-sm text-muted-foreground">Total Credit</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10"><IndianRupee size={24} className="text-warning" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalOutstanding)}</p>
              <p className="text-sm text-muted-foreground">Outstanding</p>
            </div>
          </div>
        </motion.div>
      </div>

      <DataTable data={filteredData} columns={columns} searchPlaceholder="Search by name, code, city..." onRowClick={(item) => navigate(`/outlets/distributors/${item.id}`)} />

      <CrudModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={mode === 'create' ? 'Add Distributor' : mode === 'edit' ? 'Edit Distributor' : 'Distributor Details'} fields={fields} initialData={selectedItem || undefined} onSubmit={handleSubmit} mode={mode} />

      <DeleteConfirmModal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} onConfirm={handleDelete} title="Delete Distributor" message={`Are you sure you want to delete "${deleteModal?.firmName}"? This action cannot be undone.`} />
    </div>
  );
}
