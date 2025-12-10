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
  Store,
  MapPin,
  Star,
  Eye,
  Edit,
  Trash2,
  ShoppingCart,
} from 'lucide-react';
import { toast } from 'sonner';

interface Retailer {
  id: string;
  code: string;
  shopName: string;
  ownerName: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  category: 'A' | 'B' | 'C';
  distributorName: string;
  lastVisit: string;
  lastOrderValue: number;
  status: 'active' | 'pending' | 'inactive';
}

const initialRetailers: Retailer[] = [
  { id: 'r-001', code: 'RET-DEL-001', shopName: 'New Sharma Store', ownerName: 'Mohan Sharma', address: 'Shop 12, Karol Bagh Market', city: 'New Delhi', phone: '+91 98765 12345', email: 'sharma@store.com', category: 'A', distributorName: 'Krishna Traders', lastVisit: '2024-12-08', lastOrderValue: 15500, status: 'active' },
  { id: 'r-002', code: 'RET-DEL-002', shopName: 'Gupta General Store', ownerName: 'Rakesh Gupta', address: '45 Lajpat Nagar Main Road', city: 'New Delhi', phone: '+91 98765 12346', email: 'gupta@store.com', category: 'B', distributorName: 'Krishna Traders', lastVisit: '2024-12-07', lastOrderValue: 8200, status: 'active' },
  { id: 'r-003', code: 'RET-DEL-003', shopName: 'Jain Provision Store', ownerName: 'Sunil Jain', address: '78 Connaught Place', city: 'New Delhi', phone: '+91 98765 12347', email: 'jain@store.com', category: 'A', distributorName: 'Sharma Distributors', lastVisit: '2024-12-06', lastOrderValue: 22000, status: 'active' },
  { id: 'r-004', code: 'RET-DEL-004', shopName: 'Verma Kirana', ownerName: 'Vijay Verma', address: '23 Rohini Sector 5', city: 'New Delhi', phone: '+91 98765 12348', email: 'verma@store.com', category: 'C', distributorName: 'Krishna Traders', lastVisit: '2024-12-05', lastOrderValue: 3500, status: 'pending' },
  { id: 'r-005', code: 'RET-DEL-005', shopName: 'Singh Super Market', ownerName: 'Gurpreet Singh', address: '56 Dwarka Sector 12', city: 'New Delhi', phone: '+91 98765 12349', email: 'singh@store.com', category: 'B', distributorName: 'Sharma Distributors', lastVisit: '2024-12-04', lastOrderValue: 11800, status: 'active' },
];

const distributors = [
  { value: 'Krishna Traders', label: 'Krishna Traders' },
  { value: 'Sharma Distributors', label: 'Sharma Distributors' },
  { value: 'Patel Trading Co', label: 'Patel Trading Co' },
];

const fields: FieldConfig[] = [
  { key: 'code', label: 'Retailer Code', type: 'text', required: true, placeholder: 'e.g., RET-DEL-001' },
  { key: 'shopName', label: 'Shop Name', type: 'text', required: true, placeholder: 'Enter shop name' },
  { key: 'ownerName', label: 'Owner Name', type: 'text', required: true, placeholder: 'Enter owner name' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'Enter email' },
  { key: 'phone', label: 'Phone', type: 'text', required: true, placeholder: '+91 98765 12345' },
  { key: 'city', label: 'City', type: 'text', required: true, placeholder: 'Enter city' },
  { key: 'address', label: 'Address', type: 'textarea', required: true, placeholder: 'Enter full address' },
  { key: 'category', label: 'Category', type: 'select', required: true, options: [{ value: 'A', label: 'Category A' }, { value: 'B', label: 'Category B' }, { value: 'C', label: 'Category C' }] },
  { key: 'distributorName', label: 'Distributor', type: 'select', required: true, options: distributors },
  { key: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'pending', label: 'Pending' }, { value: 'inactive', label: 'Inactive' }] },
];

const formatCurrency = (value: number) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
};

const categoryColors = {
  A: 'bg-success text-success-foreground',
  B: 'bg-warning text-warning-foreground',
  C: 'bg-muted text-muted-foreground',
};

export default function RetailersPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<Retailer[]>(initialRetailers);
  const [geoFilter, setGeoFilter] = useState<GeoFilterType>({ country: 'India' });
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<Retailer | null>(null);
  const [selectedItem, setSelectedItem] = useState<Retailer | null>(null);
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>('create');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredData = data.filter(r => {
    if (geoFilter.city && r.city !== geoFilter.city) return false;
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    return true;
  });

  const handleCreate = () => {
    navigate('/outlets/retailers/new');
  };

  const handleView = (item: Retailer) => {
    setSelectedItem(item);
    setMode('view');
    setModalOpen(true);
  };

  const handleEdit = (item: Retailer) => {
    setSelectedItem(item);
    setMode('edit');
    setModalOpen(true);
  };

  const handleSubmit = (formData: Record<string, any>) => {
    if (mode === 'create') {
      const newItem: Retailer = {
        id: Date.now().toString(),
        code: formData.code,
        shopName: formData.shopName,
        ownerName: formData.ownerName,
        address: formData.address,
        city: formData.city,
        phone: formData.phone,
        email: formData.email || '',
        category: formData.category,
        distributorName: formData.distributorName,
        lastVisit: '-',
        lastOrderValue: 0,
        status: formData.status || 'pending',
      };
      setData([...data, newItem]);
      toast.success('Retailer created successfully');
    } else {
      setData(data.map(item => item.id === selectedItem?.id ? { ...item, ...formData } : item));
      toast.success('Retailer updated successfully');
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteModal) {
      setData(data.filter(item => item.id !== deleteModal.id));
      toast.success('Retailer deleted successfully');
      setDeleteModal(null);
    }
  };

  const stats = {
    total: filteredData.length,
    categoryA: filteredData.filter(r => r.category === 'A').length,
    categoryB: filteredData.filter(r => r.category === 'B').length,
    categoryC: filteredData.filter(r => r.category === 'C').length,
  };

  const columns = [
    {
      key: 'shopName',
      header: 'Retailer',
      render: (item: Retailer) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Store size={20} className="text-secondary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.shopName}</p>
            <p className="text-xs text-muted-foreground">{item.code}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    { key: 'ownerName', header: 'Owner', sortable: true },
    {
      key: 'address',
      header: 'Location',
      render: (item: Retailer) => (
        <div className="flex items-center gap-2 max-w-[200px]">
          <MapPin size={14} className="text-muted-foreground shrink-0" />
          <span className="truncate text-sm">{item.address}, {item.city}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (item: Retailer) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${categoryColors[item.category]}`}>
          {item.category}
        </span>
      ),
      sortable: true,
    },
    { key: 'distributorName', header: 'Distributor' },
    {
      key: 'lastOrderValue',
      header: 'Last Order',
      render: (item: Retailer) => (
        <div>
          <p className="font-medium">{formatCurrency(item.lastOrderValue)}</p>
          <p className="text-xs text-muted-foreground">{item.lastVisit}</p>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Retailer) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Retailer) => (
        <div className="flex items-center gap-1">
          <button onClick={() => handleView(item)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Eye size={16} className="text-muted-foreground" />
          </button>
          <button onClick={() => handleEdit(item)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Edit size={16} className="text-muted-foreground" />
          </button>
          <button onClick={() => navigate('/orders/new')} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ShoppingCart size={16} className="text-muted-foreground" />
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

      <DataTable data={filteredData} columns={columns} searchPlaceholder="Search by shop name, owner, code..." onRowClick={(item) => navigate(`/outlets/retailers/${item.id}`)} />

      <CrudModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={mode === 'create' ? 'Add Retailer' : mode === 'edit' ? 'Edit Retailer' : 'Retailer Details'} fields={fields} initialData={selectedItem || undefined} onSubmit={handleSubmit} mode={mode} />

      <DeleteConfirmModal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} onConfirm={handleDelete} title="Delete Retailer" message={`Are you sure you want to delete "${deleteModal?.shopName}"? This action cannot be undone.`} />
    </div>
  );
}
