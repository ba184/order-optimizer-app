import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge, StatusType } from '@/components/ui/StatusBadge';
import { useLeads, useCreateLead, useUpdateLead } from '@/hooks/useSalesTeamData';
import { useAuth } from '@/contexts/AuthContext';
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
  Loader2,
  X,
} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  shop_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  lead_type: string | null;
  status: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  assigned_to: string | null;
  follow_up_date?: string | null;
}

export default function LeadsPage() {
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState<Lead | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    shop_name: '',
    phone: '',
    address: '',
    city: '',
    lead_type: 'retailer',
    notes: '',
  });

  const { data: leadsData, isLoading } = useLeads();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();

  const leads: Lead[] = (leadsData || []).map((l: any) => ({
    ...l,
    lead_type: l.lead_type || 'retailer',
    status: l.status || 'new',
  }));

  const handleCreate = async () => {
    if (!formData.name || !formData.shop_name) {
      return;
    }
    await createLead.mutateAsync(formData);
    setShowAddModal(false);
    setFormData({ name: '', shop_name: '', phone: '', address: '', city: '', lead_type: 'retailer', notes: '' });
  };

  const handleConvert = async (id: string) => {
    await updateLead.mutateAsync({ id, status: 'converted' });
  };

  const columns = [
    {
      key: 'shop_name',
      header: 'Lead',
      render: (item: Lead) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            item.lead_type === 'retailer' ? 'bg-secondary/10' : 'bg-primary/10'
          }`}>
            {item.lead_type === 'retailer' ? <Store size={20} className="text-secondary" /> : <Building2 size={20} className="text-primary" />}
          </div>
          <div>
            <p className="font-medium text-foreground">{item.shop_name || 'N/A'}</p>
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
          <span className="text-sm">{item.phone || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'city',
      header: 'Location',
      render: (item: Lead) => (
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-muted-foreground" />
          <span className="text-sm">{item.city || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'lead_type',
      header: 'Type',
      render: (item: Lead) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          item.lead_type === 'retailer' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
        }`}>
          {item.lead_type}
        </span>
      ),
    },
    {
      key: 'assigned_to',
      header: 'Assigned To',
      render: (item: Lead) => (
        <span className="text-sm">{item.assigned_to ? 'Assigned' : 'Unassigned'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Lead) => <StatusBadge status={item.status as StatusType} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Lead) => (
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowViewModal(item)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Eye size={16} className="text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Edit size={16} className="text-muted-foreground" />
          </button>
          {item.status !== 'converted' && item.status !== 'lost' && (
            <button
              onClick={() => handleConvert(item.id)}
              className="p-2 hover:bg-success/10 rounded-lg transition-colors"
            >
              <CheckCircle size={16} className="text-success" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    interested: leads.filter(l => l.status === 'interested').length,
    converted: leads.filter(l => l.status === 'converted').length,
    conversionRate: leads.length > 0 ? ((leads.filter(l => l.status === 'converted').length / leads.length) * 100).toFixed(0) : '0',
  };

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
      <DataTable 
        data={leads} 
        columns={columns} 
        searchPlaceholder="Search leads..." 
        emptyMessage="No leads found. Add your first lead!"
      />

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Add New Lead</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-muted rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Contact Name *</label>
                  <input 
                    type="text" 
                    placeholder="Enter name" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                  <input 
                    type="tel" 
                    placeholder="+91 98765 43210" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Shop/Firm Name *</label>
                <input 
                  type="text" 
                  placeholder="Enter shop name" 
                  value={formData.shop_name}
                  onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                  className="input-field" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Lead Type</label>
                <select 
                  value={formData.lead_type}
                  onChange={(e) => setFormData({ ...formData, lead_type: e.target.value })}
                  className="input-field"
                >
                  <option value="retailer">Retailer</option>
                  <option value="distributor">Distributor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">City</label>
                <input 
                  type="text" 
                  placeholder="Enter city" 
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="input-field" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Address</label>
                <textarea 
                  placeholder="Enter address" 
                  rows={2} 
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input-field resize-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
                <textarea 
                  placeholder="Any additional notes..." 
                  rows={2} 
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field resize-none" 
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="btn-outline">Cancel</button>
              <button 
                onClick={handleCreate} 
                disabled={createLead.isPending}
                className="btn-primary"
              >
                {createLead.isPending ? 'Adding...' : 'Add Lead'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Lead Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Lead Details</h2>
              <button onClick={() => setShowViewModal(null)} className="p-2 hover:bg-muted rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  showViewModal.lead_type === 'retailer' ? 'bg-secondary/10' : 'bg-primary/10'
                }`}>
                  {showViewModal.lead_type === 'retailer' ? <Store size={24} className="text-secondary" /> : <Building2 size={24} className="text-primary" />}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{showViewModal.shop_name}</p>
                  <p className="text-sm text-muted-foreground">{showViewModal.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{showViewModal.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">City</p>
                  <p className="font-medium">{showViewModal.city || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{showViewModal.lead_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <StatusBadge status={showViewModal.status as StatusType} />
                </div>
              </div>
              {showViewModal.address && (
                <div>
                  <p className="text-muted-foreground text-sm">Address</p>
                  <p className="font-medium">{showViewModal.address}</p>
                </div>
              )}
              {showViewModal.notes && (
                <div>
                  <p className="text-muted-foreground text-sm">Notes</p>
                  <p className="font-medium">{showViewModal.notes}</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end mt-6">
              <button onClick={() => setShowViewModal(null)} className="btn-outline">Close</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
