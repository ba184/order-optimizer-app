import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge, StatusType } from '@/components/ui/StatusBadge';
import { GeoFilter } from '@/components/ui/GeoFilter';
import { GeoFilter as GeoFilterType } from '@/data/geoData';
import { useAuth } from '@/contexts/AuthContext';
import { useDailySalesReports, useCreateDSR, useProfiles } from '@/hooks/useSalesTeamData';
import { format } from 'date-fns';
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
  Loader2,
  X,
} from 'lucide-react';

interface DSR {
  id: string;
  date: string;
  user_id: string;
  employeeName: string;
  visit_type: 'call' | 'visit';
  distributor_name?: string;
  retailer_name?: string;
  zone: string;
  city: string;
  area: string;
  total_calls: number;
  productive_calls: number;
  orders_count: number;
  order_value: number;
  collection_amount: number;
  market_intelligence: string;
  status: StatusType;
  submitted_at?: string;
  profiles?: { name: string };
}

const formatCurrency = (value: number) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
};

export default function DSRListPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [geoFilter, setGeoFilter] = useState<GeoFilterType>({ country: 'India' });
  const [dateFilter, setDateFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: dsrData, isLoading } = useDailySalesReports({ date: dateFilter || undefined, userId: employeeFilter || undefined });
  const { data: profilesData } = useProfiles();
  const createDSR = useCreateDSR();

  const [formData, setFormData] = useState({
    visit_type: 'visit',
    distributor_name: '',
    retailer_name: '',
    date: new Date().toISOString().split('T')[0],
    zone: '',
    city: '',
    area: '',
    total_calls: '',
    productive_calls: '',
    orders_count: '',
    order_value: '',
    collection_amount: '',
    market_intelligence: '',
  });

  // Transform data for display
  const dsrs: DSR[] = (dsrData || []).map((dsr: any) => ({
    ...dsr,
    employeeName: dsr.profiles?.name || 'Unknown',
  }));

  const filteredDSRs = dsrs.filter(dsr => {
    if (geoFilter.zone && dsr.zone !== geoFilter.zone) return false;
    if (geoFilter.city && dsr.city !== geoFilter.city) return false;
    if (geoFilter.area && dsr.area !== geoFilter.area) return false;
    return true;
  });

  const stats = {
    total: filteredDSRs.length,
    submitted: filteredDSRs.filter(d => d.status === 'submitted').length,
    totalOrders: filteredDSRs.reduce((sum, d) => sum + (d.orders_count || 0), 0),
    totalOrderValue: filteredDSRs.reduce((sum, d) => sum + (d.order_value || 0), 0),
    totalCollection: filteredDSRs.reduce((sum, d) => sum + (d.collection_amount || 0), 0),
  };

  const handleSubmit = async () => {
    if (!user?.id) return;
    
    await createDSR.mutateAsync({
      user_id: user.id,
      visit_type: formData.visit_type,
      distributor_name: formData.distributor_name || undefined,
      retailer_name: formData.retailer_name || undefined,
      date: formData.date,
      zone: formData.zone || undefined,
      city: formData.city || undefined,
      area: formData.area || undefined,
      total_calls: parseInt(formData.total_calls) || 0,
      productive_calls: parseInt(formData.productive_calls) || 0,
      orders_count: parseInt(formData.orders_count) || 0,
      order_value: parseFloat(formData.order_value) || 0,
      collection_amount: parseFloat(formData.collection_amount) || 0,
      market_intelligence: formData.market_intelligence || undefined,
      status: 'submitted',
    });
    setShowCreateModal(false);
    setFormData({
      visit_type: 'visit',
      distributor_name: '',
      retailer_name: '',
      date: new Date().toISOString().split('T')[0],
      zone: '',
      city: '',
      area: '',
      total_calls: '',
      productive_calls: '',
      orders_count: '',
      order_value: '',
      collection_amount: '',
      market_intelligence: '',
    });
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
            <p className="text-xs text-muted-foreground">{item.user_id.slice(0, 8)}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'visit_type',
      header: 'Type',
      render: (item: DSR) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          item.visit_type === 'visit' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
        }`}>
          {item.visit_type === 'visit' ? 'Visit' : 'Call'}
        </span>
      ),
    },
    {
      key: 'entity',
      header: 'Entity',
      render: (item: DSR) => (
        <div>
          <p className="font-medium text-foreground">{item.retailer_name || item.distributor_name || 'N/A'}</p>
          <p className="text-xs text-muted-foreground capitalize">{item.retailer_name ? 'Retailer' : 'Distributor'}</p>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (item: DSR) => (
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-muted-foreground" />
          <span className="text-sm">{item.city || 'N/A'}{item.area ? `, ${item.area}` : ''}</span>
        </div>
      ),
    },
    {
      key: 'calls',
      header: 'Calls',
      render: (item: DSR) => (
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-muted-foreground" />
          <span>{item.productive_calls || 0}/{item.total_calls || 0}</span>
        </div>
      ),
    },
    {
      key: 'orders',
      header: 'Orders',
      render: (item: DSR) => (
        <div>
          <p className="font-medium">{item.orders_count || 0}</p>
          <p className="text-xs text-muted-foreground">{formatCurrency(item.order_value || 0)}</p>
        </div>
      ),
    },
    {
      key: 'collection',
      header: 'Collection',
      render: (item: DSR) => (
        <span className="font-medium text-success">{formatCurrency(item.collection_amount || 0)}</span>
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
          <h1 className="module-title">Daily Sales Reports</h1>
          <p className="text-muted-foreground">View and manage daily sales reports from field team</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Create DSR
        </button>
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
          {(profilesData || []).map((emp: any) => (
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
        emptyMessage="No DSR records found"
      />

      {/* Create DSR Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Create DSR</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-muted rounded-lg">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Visit Type *</label>
                  <select
                    value={formData.visit_type}
                    onChange={(e) => setFormData({ ...formData, visit_type: e.target.value })}
                    className="input-field"
                  >
                    <option value="visit">Visit</option>
                    <option value="call">Call</option>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Retailer Name</label>
                  <input
                    type="text"
                    value={formData.retailer_name}
                    onChange={(e) => setFormData({ ...formData, retailer_name: e.target.value })}
                    placeholder="Enter retailer name"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Distributor Name</label>
                  <input
                    type="text"
                    value={formData.distributor_name}
                    onChange={(e) => setFormData({ ...formData, distributor_name: e.target.value })}
                    placeholder="Enter distributor name"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Zone</label>
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
                  <label className="block text-sm font-medium text-foreground mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Enter city"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Area</label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="Enter area"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Total Calls</label>
                  <input
                    type="number"
                    value={formData.total_calls}
                    onChange={(e) => setFormData({ ...formData, total_calls: e.target.value })}
                    placeholder="0"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Productive Calls</label>
                  <input
                    type="number"
                    value={formData.productive_calls}
                    onChange={(e) => setFormData({ ...formData, productive_calls: e.target.value })}
                    placeholder="0"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Orders Count</label>
                  <input
                    type="number"
                    value={formData.orders_count}
                    onChange={(e) => setFormData({ ...formData, orders_count: e.target.value })}
                    placeholder="0"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Order Value (₹)</label>
                  <input
                    type="number"
                    value={formData.order_value}
                    onChange={(e) => setFormData({ ...formData, order_value: e.target.value })}
                    placeholder="0"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Collection Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.collection_amount}
                    onChange={(e) => setFormData({ ...formData, collection_amount: e.target.value })}
                    placeholder="0"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Market Intelligence</label>
                <textarea
                  value={formData.market_intelligence}
                  onChange={(e) => setFormData({ ...formData, market_intelligence: e.target.value })}
                  placeholder="Any market insights, competitor information..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="btn-outline">Cancel</button>
              <button 
                onClick={handleSubmit}
                disabled={createDSR.isPending}
                className="btn-primary"
              >
                {createDSR.isPending ? 'Creating...' : 'Create DSR'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
