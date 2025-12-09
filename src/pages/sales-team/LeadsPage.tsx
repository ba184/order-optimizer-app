import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  UserPlus,
  Phone,
  MapPin,
  Store,
  Building2,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

interface Lead {
  id: string;
  name: string;
  shopName: string;
  phone: string;
  address: string;
  city: string;
  type: 'retailer' | 'distributor';
  status: 'new' | 'contacted' | 'interested' | 'converted' | 'lost';
  notes: string;
  createdBy: string;
  createdAt: string;
  assignedTo: string;
  followUpDate?: string;
}

const mockLeads: Lead[] = [
  { id: 'l-001', name: 'Ramesh Agarwal', shopName: 'Agarwal Stores', phone: '+91 98765 11111', address: 'Shop 15, Main Market', city: 'Delhi', type: 'retailer', status: 'interested', notes: 'Interested in Alpha series', createdBy: 'Rajesh Kumar', createdAt: '2024-12-05', assignedTo: 'Rajesh Kumar', followUpDate: '2024-12-10' },
  { id: 'l-002', name: 'Suresh Bansal', shopName: 'Bansal Trading', phone: '+91 98765 22222', address: '45 Industrial Area', city: 'Gurgaon', type: 'distributor', status: 'contacted', notes: 'Looking for distributorship', createdBy: 'Amit Sharma', createdAt: '2024-12-07', assignedTo: 'Amit Sharma', followUpDate: '2024-12-12' },
  { id: 'l-003', name: 'Mahesh Joshi', shopName: 'Joshi Provisions', phone: '+91 98765 33333', address: '78 Market Complex', city: 'Noida', type: 'retailer', status: 'new', notes: 'Walk-in inquiry', createdBy: 'Priya Singh', createdAt: '2024-12-09', assignedTo: 'Priya Singh' },
  { id: 'l-004', name: 'Dinesh Mehta', shopName: 'Mehta Mart', phone: '+91 98765 44444', address: '23 Shopping Plaza', city: 'Delhi', type: 'retailer', status: 'converted', notes: 'Converted to retailer', createdBy: 'Rajesh Kumar', createdAt: '2024-12-01', assignedTo: 'Rajesh Kumar' },
  { id: 'l-005', name: 'Rakesh Verma', shopName: 'Verma & Co', phone: '+91 98765 55555', address: '56 Business Park', city: 'Faridabad', type: 'distributor', status: 'lost', notes: 'Went with competitor', createdBy: 'Vikram Patel', createdAt: '2024-11-25', assignedTo: 'Vikram Patel' },
];

const columns = [
  {
    key: 'shopName',
    header: 'Lead',
    render: (item: Lead) => (
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          item.type === 'retailer' ? 'bg-secondary/10' : 'bg-primary/10'
        }`}>
          {item.type === 'retailer' ? <Store size={20} className="text-secondary" /> : <Building2 size={20} className="text-primary" />}
        </div>
        <div>
          <p className="font-medium text-foreground">{item.shopName}</p>
          <p className="text-xs text-muted-foreground">{item.name}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'phone',
    header: 'Contact',
    render: (item: Lead) => (
      <div className="flex items-center gap-2">
        <Phone size={14} className="text-muted-foreground" />
        <span className="text-sm">{item.phone}</span>
      </div>
    ),
  },
  {
    key: 'city',
    header: 'Location',
    render: (item: Lead) => (
      <div className="flex items-center gap-2">
        <MapPin size={14} className="text-muted-foreground" />
        <span className="text-sm">{item.city}</span>
      </div>
    ),
  },
  {
    key: 'type',
    header: 'Type',
    render: (item: Lead) => (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
        item.type === 'retailer' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
      }`}>
        {item.type}
      </span>
    ),
  },
  {
    key: 'assignedTo',
    header: 'Assigned To',
  },
  {
    key: 'status',
    header: 'Status',
    render: (item: Lead) => <StatusBadge status={item.status} />,
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (item: Lead) => (
      <div className="flex items-center gap-1">
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <Eye size={16} className="text-muted-foreground" />
        </button>
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <Edit size={16} className="text-muted-foreground" />
        </button>
        {item.status !== 'converted' && item.status !== 'lost' && (
          <button
            onClick={() => toast.success('Lead converted!')}
            className="p-2 hover:bg-success/10 rounded-lg transition-colors"
          >
            <CheckCircle size={16} className="text-success" />
          </button>
        )}
      </div>
    ),
  },
];

export default function LeadsPage() {
  const [showAddModal, setShowAddModal] = useState(false);

  const stats = {
    total: mockLeads.length,
    new: mockLeads.filter(l => l.status === 'new').length,
    interested: mockLeads.filter(l => l.status === 'interested').length,
    converted: mockLeads.filter(l => l.status === 'converted').length,
    conversionRate: ((mockLeads.filter(l => l.status === 'converted').length / mockLeads.length) * 100).toFixed(0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Leads Management</h1>
          <p className="text-muted-foreground">Track and convert potential retailers & distributors</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
          <UserPlus size={18} />
          Add Lead
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <UserPlus size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Leads</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-info/10">
              <Clock size={24} className="text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.new}</p>
              <p className="text-sm text-muted-foreground">New</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <CheckCircle size={24} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.converted}</p>
              <p className="text-sm text-muted-foreground">Converted</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10">
              <TrendingUp size={24} className="text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.conversionRate}%</p>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Leads Table */}
      <DataTable data={mockLeads} columns={columns} searchPlaceholder="Search leads..." />

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Add New Lead</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Contact Name</label>
                  <input type="text" placeholder="Enter name" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                  <input type="tel" placeholder="+91 98765 43210" className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Shop/Firm Name</label>
                <input type="text" placeholder="Enter shop name" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Lead Type</label>
                <select className="input-field">
                  <option value="retailer">Retailer</option>
                  <option value="distributor">Distributor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Address</label>
                <textarea placeholder="Enter address" rows={2} className="input-field resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
                <textarea placeholder="Any additional notes..." rows={2} className="input-field resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="btn-outline">Cancel</button>
              <button onClick={() => { toast.success('Lead added'); setShowAddModal(false); }} className="btn-primary">Add Lead</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
