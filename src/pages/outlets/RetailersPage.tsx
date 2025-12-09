import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GeoFilter } from '@/components/ui/GeoFilter';
import { GeoFilter as GeoFilterType } from '@/data/geoData';
import {
  Plus,
  Store,
  MapPin,
  Phone,
  Star,
  Eye,
  Edit,
  ShoppingCart,
  Camera,
} from 'lucide-react';

interface Retailer {
  id: string;
  code: string;
  shopName: string;
  ownerName: string;
  address: string;
  city: string;
  phone: string;
  category: 'A' | 'B' | 'C';
  distributorName: string;
  lastVisit: string;
  lastOrderValue: number;
  status: 'active' | 'pending' | 'inactive';
}

const mockRetailers: Retailer[] = [
  {
    id: 'r-001',
    code: 'RET-DEL-001',
    shopName: 'New Sharma Store',
    ownerName: 'Mohan Sharma',
    address: 'Shop 12, Karol Bagh Market',
    city: 'New Delhi',
    phone: '+91 98765 12345',
    category: 'A',
    distributorName: 'Krishna Traders',
    lastVisit: '2024-12-08',
    lastOrderValue: 15500,
    status: 'active',
  },
  {
    id: 'r-002',
    code: 'RET-DEL-002',
    shopName: 'Gupta General Store',
    ownerName: 'Rakesh Gupta',
    address: '45 Lajpat Nagar Main Road',
    city: 'New Delhi',
    phone: '+91 98765 12346',
    category: 'B',
    distributorName: 'Krishna Traders',
    lastVisit: '2024-12-07',
    lastOrderValue: 8200,
    status: 'active',
  },
  {
    id: 'r-003',
    code: 'RET-DEL-003',
    shopName: 'Jain Provision Store',
    ownerName: 'Sunil Jain',
    address: '78 Connaught Place',
    city: 'New Delhi',
    phone: '+91 98765 12347',
    category: 'A',
    distributorName: 'Sharma Distributors',
    lastVisit: '2024-12-06',
    lastOrderValue: 22000,
    status: 'active',
  },
  {
    id: 'r-004',
    code: 'RET-DEL-004',
    shopName: 'Verma Kirana',
    ownerName: 'Vijay Verma',
    address: '23 Rohini Sector 5',
    city: 'New Delhi',
    phone: '+91 98765 12348',
    category: 'C',
    distributorName: 'Krishna Traders',
    lastVisit: '2024-12-05',
    lastOrderValue: 3500,
    status: 'pending',
  },
  {
    id: 'r-005',
    code: 'RET-DEL-005',
    shopName: 'Singh Super Market',
    ownerName: 'Gurpreet Singh',
    address: '56 Dwarka Sector 12',
    city: 'New Delhi',
    phone: '+91 98765 12349',
    category: 'B',
    distributorName: 'Sharma Distributors',
    lastVisit: '2024-12-04',
    lastOrderValue: 11800,
    status: 'active',
  },
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
  {
    key: 'ownerName',
    header: 'Owner',
    sortable: true,
  },
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
  {
    key: 'distributorName',
    header: 'Distributor',
    render: (item: Retailer) => (
      <span className="text-sm">{item.distributorName}</span>
    ),
  },
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
        <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="View">
          <Eye size={16} className="text-muted-foreground" />
        </button>
        <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="New Order">
          <ShoppingCart size={16} className="text-muted-foreground" />
        </button>
        <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Photos">
          <Camera size={16} className="text-muted-foreground" />
        </button>
      </div>
    ),
  },
];

export default function RetailersPage() {
  const navigate = useNavigate();
  const [geoFilter, setGeoFilter] = useState<GeoFilterType>({ country: 'India' });

  const filteredRetailers = mockRetailers.filter(r => {
    if (geoFilter.city && r.city !== geoFilter.city) return false;
    return true;
  });

  const stats = {
    total: filteredRetailers.length,
    categoryA: filteredRetailers.filter(r => r.category === 'A').length,
    categoryB: filteredRetailers.filter(r => r.category === 'B').length,
    categoryC: filteredRetailers.filter(r => r.category === 'C').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Retailers</h1>
          <p className="text-muted-foreground">Manage retail outlet network</p>
        </div>
        <button onClick={() => navigate('/outlets/new-retailer')} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add Retailer
        </button>
      </div>

      {/* Geo Filter */}
      <div className="bg-card rounded-xl border border-border p-4">
        <GeoFilter value={geoFilter} onChange={setGeoFilter} showArea={false} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Store size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Retailers</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <Star size={24} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.categoryA}</p>
              <p className="text-sm text-muted-foreground">Category A</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <Star size={24} className="text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.categoryB}</p>
              <p className="text-sm text-muted-foreground">Category B</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-muted">
              <Star size={24} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.categoryC}</p>
              <p className="text-sm text-muted-foreground">Category C</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <select className="input-field w-40">
          <option value="">All Categories</option>
          <option value="A">Category A</option>
          <option value="B">Category B</option>
          <option value="C">Category C</option>
        </select>
        <select className="input-field w-48">
          <option value="">All Distributors</option>
          <option value="krishna">Krishna Traders</option>
          <option value="sharma">Sharma Distributors</option>
        </select>
        <select className="input-field w-40">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredRetailers}
        columns={columns}
        searchPlaceholder="Search by shop name, owner, code..."
        onRowClick={(item) => navigate(`/outlets/retailers/${item.id}`)}
      />
    </div>
  );
}
