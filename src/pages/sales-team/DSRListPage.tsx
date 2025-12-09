import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge, StatusType } from '@/components/ui/StatusBadge';
import { GeoFilter } from '@/components/ui/GeoFilter';
import { GeoFilter as GeoFilterType, employees } from '@/data/geoData';
import { useAuth } from '@/contexts/AuthContext';
import {
  Plus,
  FileText,
  Eye,
  Edit,
  Phone,
  MapPin,
  IndianRupee,
  ShoppingCart,
  Calendar,
  User,
  Filter,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

interface DSR {
  id: string;
  date: string;
  employeeId: string;
  employeeName: string;
  visitType: 'call' | 'visit';
  entityType: 'distributor' | 'retailer';
  entityName: string;
  zone: string;
  city: string;
  area: string;
  totalCalls: number;
  productiveCalls: number;
  ordersCount: number;
  orderValue: number;
  collectionAmount: number;
  marketIntelligence: string;
  status: StatusType;
  submittedAt?: string;
}

const mockDSRs: DSR[] = [
  { id: 'dsr-001', date: '2024-12-09', employeeId: 'se-001', employeeName: 'Rajesh Kumar', visitType: 'visit', entityType: 'retailer', entityName: 'Sharma Store', zone: 'North Zone', city: 'New Delhi', area: 'Connaught Place', totalCalls: 15, productiveCalls: 12, ordersCount: 8, orderValue: 45000, collectionAmount: 25000, marketIntelligence: 'Competitor launched new scheme', status: 'submitted', submittedAt: '2024-12-09 18:30' },
  { id: 'dsr-002', date: '2024-12-09', employeeId: 'se-002', employeeName: 'Amit Sharma', visitType: 'call', entityType: 'distributor', entityName: 'Krishna Traders', zone: 'North Zone', city: 'New Delhi', area: 'Karol Bagh', totalCalls: 12, productiveCalls: 10, ordersCount: 5, orderValue: 125000, collectionAmount: 85000, marketIntelligence: 'High demand for Alpha series', status: 'submitted', submittedAt: '2024-12-09 19:00' },
  { id: 'dsr-003', date: '2024-12-08', employeeId: 'se-003', employeeName: 'Priya Singh', visitType: 'visit', entityType: 'retailer', entityName: 'Gupta General Store', zone: 'North Zone', city: 'New Delhi', area: 'Lajpat Nagar', totalCalls: 18, productiveCalls: 14, ordersCount: 10, orderValue: 38000, collectionAmount: 15000, marketIntelligence: 'New outlets opening in area', status: 'submitted', submittedAt: '2024-12-08 18:45' },
  { id: 'dsr-004', date: '2024-12-08', employeeId: 'se-001', employeeName: 'Rajesh Kumar', visitType: 'visit', entityType: 'retailer', entityName: 'Jain Provisions', zone: 'North Zone', city: 'New Delhi', area: 'Connaught Place', totalCalls: 14, productiveCalls: 11, ordersCount: 7, orderValue: 52000, collectionAmount: 32000, marketIntelligence: '', status: 'submitted', submittedAt: '2024-12-08 19:15' },
  { id: 'dsr-005', date: '2024-12-07', employeeId: 'se-004', employeeName: 'Vikram Patel', visitType: 'call', entityType: 'distributor', entityName: 'Patel Trading', zone: 'East Zone', city: 'Preet Vihar', area: 'Preet Vihar', totalCalls: 10, productiveCalls: 8, ordersCount: 4, orderValue: 95000, collectionAmount: 45000, marketIntelligence: 'Stock shortage reported', status: 'draft' },
];

const formatCurrency = (value: number) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
};

export default function DSRListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [geoFilter, setGeoFilter] = useState<GeoFilterType>({ country: 'India' });
  const [dateFilter, setDateFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredDSRs = mockDSRs.filter(dsr => {
    if (geoFilter.zone && dsr.zone !== geoFilter.zone) return false;
    if (geoFilter.city && dsr.city !== geoFilter.city) return false;
    if (geoFilter.area && dsr.area !== geoFilter.area) return false;
    if (dateFilter && dsr.date !== dateFilter) return false;
    if (employeeFilter && dsr.employeeId !== employeeFilter) return false;
    return true;
  });

  const stats = {
    total: filteredDSRs.length,
    submitted: filteredDSRs.filter(d => d.status === 'submitted').length,
    totalOrders: filteredDSRs.reduce((sum, d) => sum + d.ordersCount, 0),
    totalOrderValue: filteredDSRs.reduce((sum, d) => sum + d.orderValue, 0),
    totalCollection: filteredDSRs.reduce((sum, d) => sum + d.collectionAmount, 0),
  };

  const columns = [
    {
      key: 'date',
      header: 'Date',
      render: (item: DSR) => (
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-muted-foreground" />
          <span className="text-sm">{item.date}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'employeeName',
      header: 'Employee',
      render: (item: DSR) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={16} className="text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.employeeName}</p>
            <p className="text-xs text-muted-foreground">{item.employeeId}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'visitType',
      header: 'Type',
      render: (item: DSR) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          item.visitType === 'visit' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
        }`}>
          {item.visitType === 'visit' ? 'Visit' : 'Call'}
        </span>
      ),
    },
    {
      key: 'entityName',
      header: 'Entity',
      render: (item: DSR) => (
        <div>
          <p className="font-medium text-foreground">{item.entityName}</p>
          <p className="text-xs text-muted-foreground capitalize">{item.entityType}</p>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (item: DSR) => (
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-muted-foreground" />
          <span className="text-sm">{item.city}, {item.area}</span>
        </div>
      ),
    },
    {
      key: 'calls',
      header: 'Calls',
      render: (item: DSR) => (
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-muted-foreground" />
          <span>{item.productiveCalls}/{item.totalCalls}</span>
        </div>
      ),
    },
    {
      key: 'orders',
      header: 'Orders',
      render: (item: DSR) => (
        <div>
          <p className="font-medium">{item.ordersCount}</p>
          <p className="text-xs text-muted-foreground">{formatCurrency(item.orderValue)}</p>
        </div>
      ),
    },
    {
      key: 'collection',
      header: 'Collection',
      render: (item: DSR) => (
        <span className="font-medium text-success">{formatCurrency(item.collectionAmount)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: DSR) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: DSR) => (
        <div className="flex items-center gap-1">
          <button 
            onClick={() => navigate(`/sales-team/dsr/${item.id}`)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Eye size={16} className="text-muted-foreground" />
          </button>
          {item.status === 'draft' && (
            <button 
              onClick={() => navigate(`/sales-team/dsr/${item.id}/edit`)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Edit size={16} className="text-muted-foreground" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Daily Sales Reports</h1>
          <p className="text-muted-foreground">View and manage daily sales reports from field team</p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Create DSR
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <FileText size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total DSRs</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <FileText size={24} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.submitted}</p>
              <p className="text-sm text-muted-foreground">Submitted</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10">
              <ShoppingCart size={24} className="text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-info/10">
              <IndianRupee size={24} className="text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalOrderValue)}</p>
              <p className="text-sm text-muted-foreground">Order Value</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <IndianRupee size={24} className="text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalCollection)}</p>
              <p className="text-sm text-muted-foreground">Collection</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Geo Filter */}
      <div className="bg-card rounded-xl border border-border p-4">
        <GeoFilter value={geoFilter} onChange={setGeoFilter} />
      </div>

      {/* Additional Filters */}
      <div className="filter-bar">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="input-field w-40"
        />
        <select
          value={employeeFilter}
          onChange={(e) => setEmployeeFilter(e.target.value)}
          className="input-field w-48"
        >
          <option value="">All Employees</option>
          {employees.filter(e => e.role === 'sales_executive').map((emp) => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>
        <button className="btn-outline flex items-center gap-2">
          <Download size={16} />
          Export
        </button>
      </div>

      {/* DSR Table */}
      <DataTable
        data={filteredDSRs}
        columns={columns}
        searchPlaceholder="Search by employee, entity..."
      />

      {/* Create DSR Modal */}
      {showCreateModal && (
        <CreateDSRModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}

function CreateDSRModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    visitType: 'visit',
    entityType: 'retailer',
    entityName: '',
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    zone: '',
    city: '',
    area: '',
    totalCalls: '',
    productiveCalls: '',
    ordersCount: '',
    orderValue: '',
    collectionAmount: '',
    marketIntelligence: '',
  });

  const handleSubmit = () => {
    toast.success('DSR created successfully');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-lg font-semibold text-foreground mb-6">Create DSR (Admin)</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Visit Type *</label>
              <select
                value={formData.visitType}
                onChange={(e) => setFormData({ ...formData, visitType: e.target.value })}
                className="input-field"
              >
                <option value="visit">Visit</option>
                <option value="call">Call</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Entity Type *</label>
              <select
                value={formData.entityType}
                onChange={(e) => setFormData({ ...formData, entityType: e.target.value })}
                className="input-field"
              >
                <option value="retailer">Retailer</option>
                <option value="distributor">Distributor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Select Employee *</label>
              <select
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="input-field"
              >
                <option value="">Select Employee</option>
                {employees.filter(e => e.role === 'sales_executive').map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {formData.entityType === 'retailer' ? 'Retailer Name' : 'Distributor Name'} *
            </label>
            <input
              type="text"
              value={formData.entityName}
              onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
              placeholder={`Enter ${formData.entityType} name`}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Zone *</label>
              <select
                value={formData.zone}
                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                className="input-field"
              >
                <option value="">Select Zone</option>
                <option value="North Zone">North Zone</option>
                <option value="South Zone">South Zone</option>
                <option value="East Zone">East Zone</option>
                <option value="West Zone">West Zone</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">City *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Enter city"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Area *</label>
              <input
                type="text"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="Enter area"
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Total Calls</label>
              <input
                type="number"
                value={formData.totalCalls}
                onChange={(e) => setFormData({ ...formData, totalCalls: e.target.value })}
                placeholder="0"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Productive Calls</label>
              <input
                type="number"
                value={formData.productiveCalls}
                onChange={(e) => setFormData({ ...formData, productiveCalls: e.target.value })}
                placeholder="0"
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Orders Count</label>
              <input
                type="number"
                value={formData.ordersCount}
                onChange={(e) => setFormData({ ...formData, ordersCount: e.target.value })}
                placeholder="0"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Order Value (₹)</label>
              <input
                type="number"
                value={formData.orderValue}
                onChange={(e) => setFormData({ ...formData, orderValue: e.target.value })}
                placeholder="0"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Collection (₹)</label>
              <input
                type="number"
                value={formData.collectionAmount}
                onChange={(e) => setFormData({ ...formData, collectionAmount: e.target.value })}
                placeholder="0"
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Market Intelligence</label>
            <textarea
              value={formData.marketIntelligence}
              onChange={(e) => setFormData({ ...formData, marketIntelligence: e.target.value })}
              placeholder="Competitor activity, market feedback..."
              rows={3}
              className="input-field resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={handleSubmit} className="btn-primary">Create DSR</button>
        </div>
      </motion.div>
    </div>
  );
}
