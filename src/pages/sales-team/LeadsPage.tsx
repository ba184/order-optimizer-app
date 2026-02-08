import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge, StatusType } from '@/components/ui/StatusBadge';
import { useLeads, useCreateLead, useUpdateLead, useProfiles } from '@/hooks/useSalesTeamData';
import { useProducts } from '@/hooks/useProductsData';
import { useCountries, useStates, useCities } from '@/hooks/useGeoMasterData';
import { useTerritories } from '@/hooks/useTerritoriesData';
import { useAuth } from '@/contexts/AuthContext';
import {
  UserPlus,
  Phone,
  Store,
  Building2,
  User,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  Loader2,
  X,
  ShieldCheck,
} from 'lucide-react';

interface Competitor {
  name: string;
  price: string;
  strategy: string;
}

interface Lead {
  id: string;
  lead_code: string | null;
  name: string;
  shop_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zone: string | null;
  pincode: string | null;
  lead_type: string | null;
  status: string | null;
  approval_status: string | null;
  source: string | null;
  interested_products: string[] | null;
  expected_conversion_date: string | null;
  competitors: Competitor[] | null;
  converted_to: string | null;
  created_by: string;
  created_at: string;
  profiles?: { name: string };
}

const initialFormData = {
  name: '',
  phone: '',
  shop_name: '',
  lead_type: 'retailer',
  country: '',
  state: '',
  city: '',
  territory: '',
  pincode: '',
  address: '',
  interested_products: [] as string[],
  expected_conversion_date: '',
  source: 'online',
  status: 'new',
};

export default function LeadsPage() {
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Lead | null>(null);
  const [showViewModal, setShowViewModal] = useState<Lead | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);

  const { data: leadsData, isLoading } = useLeads();
  const { data: productsData } = useProducts();
  const { data: countriesData } = useCountries();
  const { data: statesData } = useStates();
  const { data: citiesData } = useCities();
  const { data: territoriesData } = useTerritories();
  const { data: profilesData } = useProfiles();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();

  // Filter states by selected country
  const filteredStates = statesData?.filter(s => {
    if (!formData.country) return true;
    const country = countriesData?.find(c => c.name === formData.country);
    return country ? s.country_id === country.id : true;
  });

  // Filter cities by selected state
  const filteredCities = citiesData?.filter(c => {
    if (!formData.state) return true;
    const state = statesData?.find(s => s.name === formData.state);
    return state ? c.state_id === state.id : true;
  });

  // Filter territories by selected city
  const filteredTerritories = territoriesData?.filter(t => {
    if (!formData.city) return true;
    const city = citiesData?.find(c => c.name === formData.city);
    return city ? t.city_id === city.id : true;
  });

  const leads: Lead[] = (leadsData || []).map((l: any) => ({
    ...l,
    lead_type: l.lead_type || 'retailer',
    status: l.status || 'new',
    approval_status: l.approval_status || 'pending',
    competitors: l.competitors || [],
    interested_products: l.interested_products || [],
  }));

  // Populate form data when editing
  useEffect(() => {
    if (showEditModal) {
      setFormData({
        name: showEditModal.name || '',
        phone: showEditModal.phone || '',
        shop_name: showEditModal.shop_name || '',
        lead_type: showEditModal.lead_type || 'retailer',
        country: showEditModal.country || '',
        state: showEditModal.state || '',
        city: showEditModal.city || '',
        territory: showEditModal.zone || '',
        pincode: showEditModal.pincode || '',
        address: showEditModal.address || '',
        interested_products: showEditModal.interested_products || [],
        expected_conversion_date: showEditModal.expected_conversion_date || '',
        source: showEditModal.source || 'online',
        status: showEditModal.status || 'new',
      });
      setCompetitors(showEditModal.competitors || []);
    }
  }, [showEditModal]);

  const handleCreate = async () => {
    if (!formData.name || !formData.phone) {
      return;
    }
    await createLead.mutateAsync({
      name: formData.name,
      phone: formData.phone,
      shop_name: formData.shop_name,
      lead_type: formData.lead_type,
      country: formData.country,
      state: formData.state,
      city: formData.city,
      zone: formData.territory || undefined,
      pincode: formData.pincode,
      address: formData.address,
      interested_products: formData.interested_products,
      expected_conversion_date: formData.expected_conversion_date || undefined,
      source: formData.source,
      competitors: competitors,
    });
    setShowAddModal(false);
    resetForm();
  };

  const handleUpdate = async () => {
    if (!showEditModal || !formData.name || !formData.phone) {
      return;
    }
    await updateLead.mutateAsync({
      id: showEditModal.id,
      name: formData.name,
      phone: formData.phone,
      shop_name: formData.shop_name,
      lead_type: formData.lead_type,
      country: formData.country,
      state: formData.state,
      city: formData.city,
      zone: formData.territory || undefined,
      pincode: formData.pincode,
      address: formData.address,
      interested_products: formData.interested_products,
      expected_conversion_date: formData.expected_conversion_date || undefined,
      source: formData.source,
      status: formData.status,
      competitors: competitors,
    });
    setShowEditModal(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setCompetitors([]);
  };

  const handleApprove = async (id: string) => {
    await updateLead.mutateAsync({ id, approval_status: 'approved' });
  };

  const handleConvert = async (lead: Lead) => {
    await updateLead.mutateAsync({ 
      id: lead.id, 
      status: 'converted',
      converted_to: lead.lead_type 
    });
  };

  const toggleProduct = (productId: string) => {
    const current = formData.interested_products;
    if (current.includes(productId)) {
      setFormData({ ...formData, interested_products: current.filter(p => p !== productId) });
    } else {
      setFormData({ ...formData, interested_products: [...current, productId] });
    }
  };

  const getCreatedByName = (createdBy: string) => {
    const profile = profilesData?.find(p => p.id === createdBy);
    return profile?.name || 'FSE';
  };

  const getProductNames = (productIds: string[] | null) => {
    if (!productIds || productIds.length === 0) return 'N/A';
    return productIds.map(id => {
      const product = productsData?.find(p => p.id === id);
      return product?.name || id;
    }).join(', ');
  };

  const columns = [
    {
      key: 'lead_code',
      header: 'Lead Code',
      render: (item: Lead) => (
        <button 
          onClick={() => setShowViewModal(item)}
          className="text-primary hover:underline font-medium"
        >
          {item.lead_code || item.id.slice(0, 8).toUpperCase()}
        </button>
      ),
    },
    {
      key: 'name',
      header: 'Contact Name',
      render: (item: Lead) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            item.lead_type === 'retailer' ? 'bg-secondary/10' : 'bg-primary/10'
          }`}>
            {item.lead_type === 'retailer' ? <Store size={16} className="text-secondary" /> : 
             <Building2 size={16} className="text-primary" />}
          </div>
          <span className="font-medium text-foreground">{item.name}</span>
        </div>
      ),
    },
    {
      key: 'shop_name',
      header: 'Business/Firm Name',
      render: (item: Lead) => <span className="text-sm">{item.shop_name || 'N/A'}</span>,
    },
    {
      key: 'phone',
      header: 'Phone Number',
      render: (item: Lead) => (
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-muted-foreground" />
          <span className="text-sm">{item.phone || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'lead_type',
      header: 'Lead Type',
      render: (item: Lead) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
          item.lead_type === 'retailer' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
        }`}>
          {item.lead_type}
        </span>
      ),
    },
    {
      key: 'interested_products',
      header: 'Interested Products',
      render: (item: Lead) => (
        <span className="text-sm max-w-[150px] truncate block">
          {getProductNames(item.interested_products)}
        </span>
      ),
    },
    {
      key: 'source',
      header: 'Lead Source',
      render: (item: Lead) => (
        <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
          item.source === 'online' ? 'bg-info/10 text-info' : 'bg-warning/10 text-warning'
        }`}>
          {item.source || 'N/A'}
        </span>
      ),
    },
    {
      key: 'created_by',
      header: 'Created By',
      render: (item: Lead) => (
        <span className="text-sm">{getCreatedByName(item.created_by)}</span>
      ),
    },
    {
      key: 'approval_status',
      header: 'Approval Status',
      render: (item: Lead) => <StatusBadge status={item.approval_status as StatusType} />,
    },
    {
      key: 'status',
      header: 'Lead Status',
      render: (item: Lead) => (
        <div>
          <StatusBadge status={item.status as StatusType} />
          {item.status === 'converted' && item.converted_to && (
            <p className="text-xs text-success mt-1">
              → {item.converted_to}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Lead) => (
        <div className="flex items-center gap-1">
          {item.approval_status === 'pending' && (
            <button
              onClick={() => handleApprove(item.id)}
              className="p-2 hover:bg-success/10 rounded-lg transition-colors"
              title="Approve"
            >
              <ShieldCheck size={16} className="text-success" />
            </button>
          )}
          {item.status !== 'converted' && item.approval_status === 'approved' && (
            <button
              onClick={() => handleConvert(item)}
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
              title="Convert"
            >
              <CheckCircle size={16} className="text-primary" />
            </button>
          )}
          <button 
            onClick={() => setShowEditModal(item)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Edit"
          >
            <Edit size={16} className="text-muted-foreground" />
          </button>
          <button 
            onClick={() => setShowViewModal(item)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="View"
          >
            <Eye size={16} className="text-muted-foreground" />
          </button>
        </div>
      ),
    },
  ];

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    converted: leads.filter(l => l.status === 'converted').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderForm = (isEdit: boolean, leadCode?: string | null) => (
    <div className="space-y-4">
      {/* Lead Code - System Generated */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Lead Code</label>
          <input 
            type="text" 
            value={isEdit ? (leadCode || 'System Generated') : ''}
            placeholder="Auto-generated"
            disabled
            className="input-field bg-muted/50 cursor-not-allowed" 
          />
        </div>
      </div>

      {/* Basic Info */}
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
          <label className="block text-sm font-medium text-foreground mb-2">Phone Number *</label>
          <input 
            type="tel" 
            placeholder="+91 98765 43210" 
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9+\s]/g, '') })}
            className="input-field" 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Business/Firm Name</label>
          <input 
            type="text" 
            placeholder="Enter firm name (optional)" 
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
      </div>

      {/* Lead Status - only in edit mode */}
      {isEdit && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Lead Status</label>
          <select 
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="input-field"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="interested">Interested</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      )}

      {/* Location */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Country</label>
          <select 
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value, state: '', city: '', territory: '' })}
            className="input-field"
          >
            <option value="">Select Country</option>
            {countriesData?.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">State</label>
          <select 
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value, city: '', territory: '' })}
            className="input-field"
          >
            <option value="">Select State</option>
            {filteredStates?.map(s => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">City</label>
          <select 
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value, territory: '' })}
            className="input-field"
          >
            <option value="">Select City</option>
            {filteredCities?.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Territory</label>
          <select 
            value={formData.territory}
            onChange={(e) => setFormData({ ...formData, territory: e.target.value })}
            className="input-field"
          >
            <option value="">Select Territory</option>
            {filteredTerritories?.map(t => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Pincode</label>
          <input 
            type="text" 
            placeholder="Enter pincode" 
            value={formData.pincode}
            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
            className="input-field" 
          />
        </div>
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

      {/* Products & Source */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Interested Products (Multi-select)</label>
        <div className="flex flex-wrap gap-2 p-3 border border-border rounded-lg bg-muted/30">
          {productsData?.slice(0, 12).map(product => (
            <button
              key={product.id}
              type="button"
              onClick={() => toggleProduct(product.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                formData.interested_products.includes(product.id)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {product.name}
            </button>
          ))}
          {(!productsData || productsData.length === 0) && (
            <span className="text-sm text-muted-foreground">No products available</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Expected Conversion Date</label>
          <input 
            type="date" 
            value={formData.expected_conversion_date}
            onChange={(e) => setFormData({ ...formData, expected_conversion_date: e.target.value })}
            className="input-field" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Lead Source</label>
          <select 
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            className="input-field"
          >
            <option value="online">Online</option>
            <option value="reference">Reference</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 h-full">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Lead Management</h1>
          <p className="text-muted-foreground">Track and convert potential retailers & distributors</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
          <UserPlus size={18} />
          Add Lead
        </button>
      </div>

      {/* Stats - Removed conversion rate */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>

      {/* Leads Table - Full width */}
      <div className="flex-1">
        <DataTable 
          data={leads} 
          columns={columns} 
          searchPlaceholder="Search leads..." 
          emptyMessage="No leads found. Add your first lead!"
        />
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-4xl my-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Add New Lead</h2>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="p-2 hover:bg-muted rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-y-auto pr-2">
              {renderForm(false, null)}
            </div>
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="btn-outline">Cancel</button>
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

      {/* Edit Lead Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-4xl my-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Edit Lead</h2>
              <button onClick={() => { setShowEditModal(null); resetForm(); }} className="p-2 hover:bg-muted rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-y-auto pr-2">
              {renderForm(true, showEditModal.lead_code)}
            </div>
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
              <button onClick={() => { setShowEditModal(null); resetForm(); }} className="btn-outline">Cancel</button>
              <button 
                onClick={handleUpdate} 
                disabled={updateLead.isPending}
                className="btn-primary"
              >
                {updateLead.isPending ? 'Updating...' : 'Update Lead'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Lead Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-4xl my-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Lead Details</h2>
              <button onClick={() => setShowViewModal(null)} className="p-2 hover:bg-muted rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
              {/* Lead Header */}
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  showViewModal.lead_type === 'retailer' ? 'bg-secondary/10' : 'bg-primary/10'
                }`}>
                  {showViewModal.lead_type === 'retailer' ? <Store size={24} className="text-secondary" /> : 
                   <Building2 size={24} className="text-primary" />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{showViewModal.shop_name}</p>
                  <p className="text-sm text-muted-foreground">{showViewModal.name}</p>
                </div>
                {showViewModal.status === 'converted' && (
                  <div className="px-3 py-1.5 bg-success/10 text-success rounded-lg text-sm font-medium">
                    Converted To: {showViewModal.converted_to || showViewModal.lead_type}
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Lead Code</p>
                  <p className="font-medium">{showViewModal.lead_code || showViewModal.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{showViewModal.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{showViewModal.lead_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Approval Status</p>
                  <StatusBadge status={showViewModal.approval_status as StatusType} />
                </div>
                <div>
                  <p className="text-muted-foreground">Lead Status</p>
                  <StatusBadge status={showViewModal.status as StatusType} />
                </div>
                <div>
                  <p className="text-muted-foreground">Source</p>
                  <p className="font-medium capitalize">{showViewModal.source || 'N/A'}</p>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="font-medium text-foreground mb-2">Location</h3>
                <div className="grid grid-cols-3 gap-4 text-sm bg-muted/30 p-3 rounded-lg">
                  <div>
                    <p className="text-muted-foreground">Country</p>
                    <p className="font-medium">{showViewModal.country || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">State</p>
                    <p className="font-medium">{showViewModal.state || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">City</p>
                    <p className="font-medium">{showViewModal.city || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Territory</p>
                    <p className="font-medium">{showViewModal.zone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pincode</p>
                    <p className="font-medium">{showViewModal.pincode || 'N/A'}</p>
                  </div>
                </div>
                {showViewModal.address && (
                  <p className="text-sm mt-2"><span className="text-muted-foreground">Address:</span> {showViewModal.address}</p>
                )}
              </div>

              {/* Products & Conversion */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-foreground mb-2">Interested Products</h3>
                  <div className="flex flex-wrap gap-1">
                    {showViewModal.interested_products && showViewModal.interested_products.length > 0 ? (
                      showViewModal.interested_products.map(productId => {
                        const product = productsData?.find(p => p.id === productId);
                        return (
                          <span key={productId} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                            {product?.name || productId}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-sm text-muted-foreground">No products selected</span>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">Expected Conversion</h3>
                  <p className="text-sm">{showViewModal.expected_conversion_date || 'Not set'}</p>
                </div>
              </div>

              {/* Competitors Section */}
              <div>
                <h3 className="font-medium text-foreground mb-2">Competitor Analysis</h3>
                {showViewModal.competitors && showViewModal.competitors.length > 0 ? (
                  <div className="space-y-2">
                    {showViewModal.competitors.map((comp, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg text-sm">
                        <div className="flex-1">
                          <p className="font-medium">{comp.name}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Price:</span> {comp.price || 'N/A'}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Strategy:</span> {comp.strategy || 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No competitor data</p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
              <button 
                onClick={() => {
                  setShowViewModal(null);
                  setShowEditModal(showViewModal);
                }} 
                className="btn-outline flex items-center gap-2"
              >
                <Edit size={16} />
                Edit
              </button>
              <button onClick={() => setShowViewModal(null)} className="btn-primary">Close</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
