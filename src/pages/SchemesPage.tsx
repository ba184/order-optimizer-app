import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { 
  useSchemes, 
  useCreateScheme, 
  useUpdateScheme,
  useDeleteScheme, 
  calculateSchemeStats,
  Scheme,
  SchemeType,
  SchemeStatus,
  BenefitType,
  Applicability,
  SlabConfig,
} from '@/hooks/useSchemesData';
import { useProducts } from '@/hooks/useProductsData';
import {
  Gift,
  Plus,
  Calendar,
  Percent,
  Package,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Loader2,
  AlertTriangle,
  DollarSign,
  FileCheck,
  PauseCircle,
  PlayCircle,
  Search,
  X,
  IndianRupee,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const typeColors: Record<string, string> = {
  slab: 'bg-primary/10 text-primary',
  buy_x_get_y: 'bg-success/10 text-success',
  combo: 'bg-secondary/10 text-secondary',
  value_wise: 'bg-warning/10 text-warning',
  bill_wise: 'bg-info/10 text-info',
  display: 'bg-accent/10 text-accent-foreground',
  volume: 'bg-primary/10 text-primary',
  product: 'bg-secondary/10 text-secondary',
  opening: 'bg-success/10 text-success',
};

const benefitTypeLabels: Record<BenefitType, string> = {
  discount: 'Discount',
  free_qty: 'Free Quantity',
  cashback: 'Cashback',
  points: 'Points',
  coupon: 'Coupon',
};

const applicabilityLabels: Record<Applicability, string> = {
  all_outlets: 'All Outlets',
  distributor: 'Distributors',
  retailer: 'Retailers',
  segment: 'Segment',
  area: 'Area',
  zone: 'Zone',
};

const schemeTypeLabels: Record<SchemeType, string> = {
  slab: 'Slab',
  buy_x_get_y: 'Buy X Get Y',
  combo: 'Combo',
  value_wise: 'Value-wise',
  bill_wise: 'Bill-wise',
  display: 'Display',
  volume: 'Volume',
  product: 'Product',
  opening: 'Opening',
};

interface FormData {
  code: string;
  name: string;
  type: SchemeType;
  description: string;
  start_date: string;
  end_date: string;
  min_quantity: string;
  free_quantity: string;
  discount_percent: string;
  status: SchemeStatus;
  benefit_type: BenefitType;
  applicability: Applicability;
  eligible_skus: string[];
  slab_config: SlabConfig[];
  min_order_value: string;
  max_benefit: string;
  outlet_claim_limit: string;
  // Buy X Get Y fields
  buy_product: string;
  buy_quantity: string;
  get_product: string;
  get_quantity: string;
  get_product_type: 'same' | 'different';
  // Combo scheme fields
  combo_name: string;
  combo_products: string[];
  combo_quantities: Record<string, number>;
  combo_price: string;
  combo_discount_type: 'flat' | 'percent';
  combo_discount_value: string;
  max_combos_per_order: string;
  // Bill-wise scheme fields
  bill_value_from: string;
  bill_value_to: string;
  bill_discount_type: 'flat' | 'percent';
  bill_discount_value: string;
  bill_max_discount: string;
  // Display scheme fields
  display_type: 'rack' | 'banner' | 'standee';
  display_quantity: string;
  display_free_product: string;
  display_free_quantity: string;
}

const initialFormData: FormData = {
  code: '',
  name: '',
  type: 'slab',
  description: '',
  start_date: '',
  end_date: '',
  min_quantity: '',
  free_quantity: '',
  discount_percent: '',
  status: 'draft',
  benefit_type: 'discount',
  applicability: 'all_outlets',
  eligible_skus: [],
  slab_config: [],
  min_order_value: '',
  max_benefit: '',
  outlet_claim_limit: '',
  // Buy X Get Y fields
  buy_product: '',
  buy_quantity: '',
  get_product: '',
  get_quantity: '',
  get_product_type: 'same',
  // Combo scheme fields
  combo_name: '',
  combo_products: [],
  combo_quantities: {},
  combo_price: '',
  combo_discount_type: 'percent',
  combo_discount_value: '',
  max_combos_per_order: '',
  // Bill-wise scheme fields
  bill_value_from: '',
  bill_value_to: '',
  bill_discount_type: 'percent',
  bill_discount_value: '',
  bill_max_discount: '',
  // Display scheme fields
  display_type: 'rack',
  display_quantity: '',
  display_free_product: '',
  display_free_quantity: '',
};

export default function SchemesPage() {
  const { data: schemes = [], isLoading } = useSchemes();
  const { data: products = [] } = useProducts();
  const createScheme = useCreateScheme();
  const updateScheme = useUpdateScheme();
  const deleteScheme = useDeleteScheme();
  
  const [activeTab, setActiveTab] = useState<'All' | SchemeType>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | SchemeStatus>('all');
  const [applicabilityFilter, setApplicabilityFilter] = useState<'all' | Applicability>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);
  const [viewingScheme, setViewingScheme] = useState<Scheme | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const stats = useMemo(() => calculateSchemeStats(schemes), [schemes]);

  const filteredSchemes = useMemo(() => {
    return schemes.filter(s => {
      if (activeTab !== 'All' && s.type !== activeTab) return false;
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (applicabilityFilter !== 'all' && s.applicability !== applicabilityFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(query) ||
          (s.code && s.code.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [schemes, activeTab, statusFilter, applicabilityFilter, searchQuery]);

  const handleCreateOrUpdate = async () => {
    if (!formData.name || !formData.start_date || !formData.end_date) {
      toast.error('Please fill required fields');
      return;
    }

    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      toast.error('End date must be greater than start date');
      return;
    }

    if (formData.status === 'draft' && new Date(formData.start_date) < new Date()) {
      // Only warn, don't block - user might want to activate immediately
    }

    const schemeData = {
      code: formData.code || undefined,
      name: formData.name,
      type: formData.type,
      description: formData.description || null,
      start_date: formData.start_date,
      end_date: formData.end_date,
      min_quantity: formData.min_quantity ? parseInt(formData.min_quantity) : null,
      free_quantity: formData.free_quantity ? parseInt(formData.free_quantity) : null,
      discount_percent: formData.discount_percent ? parseFloat(formData.discount_percent) : null,
      status: formData.status,
      benefit_type: formData.benefit_type,
      applicability: formData.applicability,
      eligible_skus: formData.eligible_skus,
      slab_config: formData.slab_config,
      min_order_value: formData.min_order_value ? parseFloat(formData.min_order_value) : 0,
      max_benefit: formData.max_benefit ? parseFloat(formData.max_benefit) : 0,
      outlet_claim_limit: formData.outlet_claim_limit ? parseInt(formData.outlet_claim_limit) : null,
    };

    try {
      if (editingScheme) {
        await updateScheme.mutateAsync({ id: editingScheme.id, ...schemeData });
      } else {
        await createScheme.mutateAsync(schemeData);
      }
      closeModal();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this scheme?')) {
      try {
        await deleteScheme.mutateAsync(id);
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

  const handleStatusChange = async (scheme: Scheme, newStatus: SchemeStatus) => {
    // Check if claims exist - if so, only allow closing
    if (scheme.claims_generated > 0 && newStatus !== 'closed') {
      toast.error('Scheme has claims - can only be closed');
      return;
    }

    try {
      await updateScheme.mutateAsync({ id: scheme.id, status: newStatus });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const openEditModal = (scheme: Scheme) => {
    setEditingScheme(scheme);
    setFormData({
      code: scheme.code || '',
      name: scheme.name,
      type: scheme.type,
      description: scheme.description || '',
      start_date: scheme.start_date,
      end_date: scheme.end_date,
      min_quantity: scheme.min_quantity?.toString() || '',
      free_quantity: scheme.free_quantity?.toString() || '',
      discount_percent: scheme.discount_percent?.toString() || '',
      status: scheme.status,
      benefit_type: scheme.benefit_type,
      applicability: scheme.applicability,
      eligible_skus: scheme.eligible_skus || [],
      slab_config: scheme.slab_config || [],
      min_order_value: scheme.min_order_value?.toString() || '',
      max_benefit: scheme.max_benefit?.toString() || '',
      outlet_claim_limit: scheme.outlet_claim_limit?.toString() || '',
      // Buy X Get Y fields - use initialFormData defaults for now
      buy_product: initialFormData.buy_product,
      buy_quantity: initialFormData.buy_quantity,
      get_product: initialFormData.get_product,
      get_quantity: initialFormData.get_quantity,
      get_product_type: initialFormData.get_product_type,
      // Combo scheme fields
      combo_name: initialFormData.combo_name,
      combo_products: initialFormData.combo_products,
      combo_quantities: initialFormData.combo_quantities,
      combo_price: initialFormData.combo_price,
      combo_discount_type: initialFormData.combo_discount_type,
      combo_discount_value: initialFormData.combo_discount_value,
      max_combos_per_order: initialFormData.max_combos_per_order,
      // Bill-wise scheme fields
      bill_value_from: initialFormData.bill_value_from,
      bill_value_to: initialFormData.bill_value_to,
      bill_discount_type: initialFormData.bill_discount_type,
      bill_discount_value: initialFormData.bill_discount_value,
      bill_max_discount: initialFormData.bill_max_discount,
      // Display scheme fields
      display_type: initialFormData.display_type,
      display_quantity: initialFormData.display_quantity,
      display_free_product: initialFormData.display_free_product,
      display_free_quantity: initialFormData.display_free_quantity,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingScheme(null);
    setFormData(initialFormData);
  };

  const addSlabRow = () => {
    setFormData(prev => ({
      ...prev,
      slab_config: [...prev.slab_config, { min_qty: 0, max_qty: 0, benefit_value: 0 }],
    }));
  };

  const updateSlabRow = (index: number, field: keyof SlabConfig, value: number) => {
    setFormData(prev => ({
      ...prev,
      slab_config: prev.slab_config.map((slab, i) => 
        i === index ? { ...slab, [field]: value } : slab
      ),
    }));
  };

  const removeSlabRow = (index: number) => {
    setFormData(prev => ({
      ...prev,
      slab_config: prev.slab_config.filter((_, i) => i !== index),
    }));
  };

  const columns = [
    {
      key: 'name',
      header: 'Scheme',
      render: (item: Scheme) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Gift size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.code || 'No code'}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'type',
      header: 'Type',
      render: (item: Scheme) => (
        <span className={`text-xs px-2 py-1 rounded-full ${typeColors[item.type] || 'bg-muted text-muted-foreground'}`}>
          {schemeTypeLabels[item.type] || item.type}
        </span>
      ),
    },
    {
      key: 'benefit_type',
      header: 'Benefit',
      render: (item: Scheme) => (
        <div className="text-sm">
          <span className="font-medium">{benefitTypeLabels[item.benefit_type]}</span>
          {item.discount_percent && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Percent size={12} />
              {item.discount_percent}%
            </span>
          )}
          {item.free_quantity && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Package size={12} />
              {item.free_quantity} Free
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'applicability',
      header: 'Applicability',
      render: (item: Scheme) => (
        <span className="text-sm text-muted-foreground">
          {applicabilityLabels[item.applicability]}
        </span>
      ),
    },
    {
      key: 'validity',
      header: 'Validity',
      render: (item: Scheme) => (
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={14} className="text-muted-foreground" />
          <span>
            {format(new Date(item.start_date), 'dd MMM')} - {format(new Date(item.end_date), 'dd MMM yy')}
          </span>
        </div>
      ),
    },
    {
      key: 'claims',
      header: 'Claims',
      render: (item: Scheme) => (
        <div className="text-sm">
          <span className="text-foreground">{item.claims_generated}</span>
          <span className="text-muted-foreground"> / </span>
          <span className="text-success">{item.claims_approved}</span>
        </div>
      ),
    },
    {
      key: 'payout',
      header: 'Payout',
      render: (item: Scheme) => (
        <span className="text-sm font-medium">
          ₹{(item.total_payout || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Scheme) => <StatusBadge status={item.status as any} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Scheme) => (
        <div className="flex items-center gap-1">
          <button 
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setViewingScheme(item);
            }}
          >
            <Eye size={16} className="text-muted-foreground" />
          </button>
          <button 
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(item);
            }}
            disabled={item.status === 'closed'}
          >
            <Edit size={16} className={item.status === 'closed' ? 'text-muted-foreground/50' : 'text-muted-foreground'} />
          </button>
          {item.status === 'active' ? (
            <button 
              className="p-2 hover:bg-warning/10 rounded-lg transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(item, 'closed');
              }}
            >
              <PauseCircle size={16} className="text-warning" />
            </button>
          ) : item.status === 'draft' || item.status === 'pending' ? (
            <button 
              className="p-2 hover:bg-success/10 rounded-lg transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(item, 'active');
              }}
            >
              <PlayCircle size={16} className="text-success" />
            </button>
          ) : null}
          <button 
            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item.id);
            }}
            disabled={item.claims_generated > 0}
          >
            <Trash2 size={16} className={item.claims_generated > 0 ? 'text-muted-foreground/50' : 'text-destructive'} />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Schemes & Promotions</h1>
          <p className="text-muted-foreground">Manage promotional schemes and offers</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Create Scheme
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Gift size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Schemes</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <CheckCircle size={24} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/10">
              <AlertTriangle size={24} className="text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.expired}</p>
              <p className="text-sm text-muted-foreground">Expired</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <Clock size={24} className="text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.claimsGenerated}</p>
              <p className="text-sm text-muted-foreground">Claims Generated</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-info/10">
              <FileCheck size={24} className="text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.claimsApproved}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10">
              <IndianRupee size={24} className="text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">₹{stats.totalPayout.toLocaleString('en-IN')}</p>
              <p className="text-sm text-muted-foreground">Total Payout</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or code..."
            className="input-field w-full pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <select
          className="input-field min-w-[150px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | SchemeStatus)}
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* Applicability Filter */}
        <select
          className="input-field min-w-[150px]"
          value={applicabilityFilter}
          onChange={(e) => setApplicabilityFilter(e.target.value as 'all' | Applicability)}
        >
          <option value="all">All Outlets</option>
          <option value="distributor">Distributors</option>
          <option value="retailer">Retailers</option>
          <option value="segment">Segment</option>
          <option value="area">Area</option>
          <option value="zone">Zone</option>
        </select>
      </div>

      {/* Scheme Type Tabs */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit overflow-x-auto">
        {(['All', 'slab', 'buy_x_get_y', 'combo', 'value_wise', 'bill_wise', 'display'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              tab === activeTab
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'All' ? 'All' : schemeTypeLabels[tab]}
          </button>
        ))}
      </div>

      {/* Data Table */}
      {filteredSchemes.length > 0 ? (
        <DataTable
          data={filteredSchemes}
          columns={columns}
          searchable={false}
        />
      ) : (
        <div className="card p-12 text-center">
          <Gift size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Schemes Found</h3>
          <p className="text-muted-foreground mb-4">Create your first scheme to get started</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} className="mr-2" />
            Create Scheme
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingScheme ? 'Edit Scheme' : 'Create New Scheme'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-muted rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Scheme Code</label>
                  <input
                    type="text"
                    className="input-field w-full"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="SCH-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Scheme Name *</label>
                  <input
                    type="text"
                    className="input-field w-full"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter scheme name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Scheme Type *</label>
                  <select
                    className="input-field w-full"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as SchemeType })}
                  >
                    <option value="slab">Slab</option>
                    <option value="buy_x_get_y">Buy X Get Y</option>
                    <option value="combo">Combo</option>
                    <option value="value_wise">Value-wise</option>
                    <option value="bill_wise">Bill-wise</option>
                    <option value="display">Display</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status *</label>
                  <select
                    className="input-field w-full"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as SchemeStatus })}
                    disabled={editingScheme?.claims_generated ? editingScheme.claims_generated > 0 : false}
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="input-field w-full"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Scheme description"
                />
              </div>

              {/* Validity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date *</label>
                  <input
                    type="date"
                    className="input-field w-full"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date *</label>
                  <input
                    type="date"
                    className="input-field w-full"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              {/* Applicability & Benefit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Applicability *</label>
                  <select
                    className="input-field w-full"
                    value={formData.applicability}
                    onChange={(e) => setFormData({ ...formData, applicability: e.target.value as Applicability })}
                  >
                    <option value="all_outlets">All Outlets</option>
                    <option value="distributor">Distributors</option>
                    <option value="retailer">Retailers</option>
                    <option value="segment">Segment</option>
                    <option value="area">Area</option>
                    <option value="zone">Zone</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Benefit Type *</label>
                  <select
                    className="input-field w-full"
                    value={formData.benefit_type}
                    onChange={(e) => setFormData({ ...formData, benefit_type: e.target.value as BenefitType })}
                  >
                    <option value="discount">Discount</option>
                    <option value="free_qty">Free Quantity</option>
                    <option value="cashback">Cashback</option>
                    <option value="points">Points</option>
                    <option value="coupon">Coupon</option>
                  </select>
                </div>
              </div>

              {/* Eligible SKUs */}
              <div>
                <label className="block text-sm font-medium mb-1">Eligible SKUs *</label>
                <select
                  className="input-field w-full"
                  multiple
                  value={formData.eligible_skus}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData({ ...formData, eligible_skus: selected });
                  }}
                  style={{ minHeight: '80px' }}
                >
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>

              {/* Conditional Fields based on Scheme Type */}
              
              {/* Slab Type Fields */}
              {formData.type === 'slab' && (
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium">Slab Configuration</label>
                    <button type="button" className="btn-secondary text-sm py-1" onClick={addSlabRow}>
                      <Plus size={14} className="mr-1" /> Add Slab
                    </button>
                  </div>
                  {formData.slab_config.map((slab, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 items-end">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Min Qty</label>
                        <input
                          type="number"
                          className="input-field w-full"
                          value={slab.min_qty}
                          onChange={(e) => updateSlabRow(index, 'min_qty', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Max Qty</label>
                        <input
                          type="number"
                          className="input-field w-full"
                          value={slab.max_qty}
                          onChange={(e) => updateSlabRow(index, 'max_qty', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Benefit</label>
                        <input
                          type="number"
                          className="input-field w-full"
                          value={slab.benefit_value}
                          onChange={(e) => updateSlabRow(index, 'benefit_value', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <button
                        type="button"
                        className="p-2 hover:bg-destructive/10 rounded-lg"
                        onClick={() => removeSlabRow(index)}
                      >
                        <Trash2 size={16} className="text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Buy X Get Y Type Fields */}
              {formData.type === 'buy_x_get_y' && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Gift size={16} className="text-success" />
                    Buy X Get Y Configuration
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Buy Product *</label>
                      <select
                        className="input-field w-full"
                        value={formData.buy_product}
                        onChange={(e) => setFormData({ ...formData, buy_product: e.target.value })}
                      >
                        <option value="">Select Product</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({product.sku})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Buy Quantity (X) *</label>
                      <input
                        type="number"
                        className="input-field w-full"
                        value={formData.buy_quantity}
                        onChange={(e) => setFormData({ ...formData, buy_quantity: e.target.value })}
                        placeholder="e.g., 5"
                        min="1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Buy Minimum Order Value (₹)</label>
                    <input
                      type="number"
                      className="input-field w-full"
                      value={formData.min_order_value}
                      onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Get Product Type *</label>
                      <select
                        className="input-field w-full"
                        value={formData.get_product_type}
                        onChange={(e) => setFormData({ ...formData, get_product_type: e.target.value as 'same' | 'different' })}
                      >
                        <option value="same">Same Product</option>
                        <option value="different">Different Product</option>
                      </select>
                    </div>
                    {formData.get_product_type === 'different' && (
                      <div>
                        <label className="block text-sm font-medium mb-1">Get Product (Y) *</label>
                        <select
                          className="input-field w-full"
                          value={formData.get_product}
                          onChange={(e) => setFormData({ ...formData, get_product: e.target.value })}
                        >
                          <option value="">Select Product</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name} ({product.sku})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium mb-1">Get Quantity (Y) *</label>
                      <input
                        type="number"
                        className="input-field w-full"
                        value={formData.get_quantity}
                        onChange={(e) => setFormData({ ...formData, get_quantity: e.target.value })}
                        placeholder="e.g., 1"
                        min="1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Combo Scheme Fields */}
              {formData.type === 'combo' && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Package size={16} className="text-secondary" />
                    Combo Scheme Configuration
                  </h4>
                  <div>
                    <label className="block text-sm font-medium mb-1">Combo Name *</label>
                    <input
                      type="text"
                      className="input-field w-full"
                      value={formData.combo_name}
                      onChange={(e) => setFormData({ ...formData, combo_name: e.target.value })}
                      placeholder="e.g., Summer Special Combo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Combo Products *</label>
                    <select
                      className="input-field w-full"
                      multiple
                      value={formData.combo_products}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                        const newQuantities = { ...formData.combo_quantities };
                        selected.forEach(id => {
                          if (!newQuantities[id]) newQuantities[id] = 1;
                        });
                        setFormData({ ...formData, combo_products: selected, combo_quantities: newQuantities });
                      }}
                      style={{ minHeight: '80px' }}
                    >
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">Hold Ctrl/Cmd to select multiple</p>
                  </div>
                  {formData.combo_products.length > 0 && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Quantity per Product</label>
                      {formData.combo_products.map(productId => {
                        const product = products.find(p => p.id === productId);
                        return (
                          <div key={productId} className="flex items-center gap-3">
                            <span className="text-sm flex-1">{product?.name || productId}</span>
                            <input
                              type="number"
                              className="input-field w-24"
                              value={formData.combo_quantities[productId] || 1}
                              onChange={(e) => setFormData({
                                ...formData,
                                combo_quantities: {
                                  ...formData.combo_quantities,
                                  [productId]: parseInt(e.target.value) || 1
                                }
                              })}
                              min="1"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Combo Price (₹) *</label>
                      <input
                        type="number"
                        className="input-field w-full"
                        value={formData.combo_price}
                        onChange={(e) => setFormData({ ...formData, combo_price: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Max Combos per Order</label>
                      <input
                        type="number"
                        className="input-field w-full"
                        value={formData.max_combos_per_order}
                        onChange={(e) => setFormData({ ...formData, max_combos_per_order: e.target.value })}
                        placeholder="Unlimited"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Combo Discount Type</label>
                      <select
                        className="input-field w-full"
                        value={formData.combo_discount_type}
                        onChange={(e) => setFormData({ ...formData, combo_discount_type: e.target.value as 'flat' | 'percent' })}
                      >
                        <option value="percent">Percentage (%)</option>
                        <option value="flat">Flat (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Discount Value {formData.combo_discount_type === 'percent' ? '(%)' : '(₹)'}
                      </label>
                      <input
                        type="number"
                        className="input-field w-full"
                        value={formData.combo_discount_value}
                        onChange={(e) => setFormData({ ...formData, combo_discount_value: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bill-wise Scheme Fields */}
              {formData.type === 'bill_wise' && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <DollarSign size={16} className="text-info" />
                    Bill-wise Scheme Configuration
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Bill Value From (₹) *</label>
                      <input
                        type="number"
                        className="input-field w-full"
                        value={formData.bill_value_from}
                        onChange={(e) => setFormData({ ...formData, bill_value_from: e.target.value })}
                        placeholder="e.g., 1000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Bill Value To (₹) *</label>
                      <input
                        type="number"
                        className="input-field w-full"
                        value={formData.bill_value_to}
                        onChange={(e) => setFormData({ ...formData, bill_value_to: e.target.value })}
                        placeholder="e.g., 5000"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Discount Type *</label>
                      <select
                        className="input-field w-full"
                        value={formData.bill_discount_type}
                        onChange={(e) => setFormData({ ...formData, bill_discount_type: e.target.value as 'flat' | 'percent' })}
                      >
                        <option value="percent">Percentage (%)</option>
                        <option value="flat">Flat (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Discount Value {formData.bill_discount_type === 'percent' ? '(%)' : '(₹)'} *
                      </label>
                      <input
                        type="number"
                        className="input-field w-full"
                        value={formData.bill_discount_value}
                        onChange={(e) => setFormData({ ...formData, bill_discount_value: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Max Discount (₹)</label>
                      <input
                        type="number"
                        className="input-field w-full"
                        value={formData.bill_max_discount}
                        onChange={(e) => setFormData({ ...formData, bill_max_discount: e.target.value })}
                        placeholder="Unlimited"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Display Scheme Fields */}
              {formData.type === 'display' && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Eye size={16} className="text-accent-foreground" />
                    Display Scheme Configuration
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Display Type *</label>
                      <select
                        className="input-field w-full"
                        value={formData.display_type}
                        onChange={(e) => setFormData({ ...formData, display_type: e.target.value as 'rack' | 'banner' | 'standee' })}
                      >
                        <option value="rack">Rack</option>
                        <option value="banner">Banner</option>
                        <option value="standee">Standee</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Required Display Quantity *</label>
                      <input
                        type="number"
                        className="input-field w-full"
                        value={formData.display_quantity}
                        onChange={(e) => setFormData({ ...formData, display_quantity: e.target.value })}
                        placeholder="e.g., 1"
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Free Product / Gift</label>
                      <select
                        className="input-field w-full"
                        value={formData.display_free_product}
                        onChange={(e) => setFormData({ ...formData, display_free_product: e.target.value })}
                      >
                        <option value="">Select Product (Optional)</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({product.sku})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Free Quantity</label>
                      <input
                        type="number"
                        className="input-field w-full"
                        value={formData.display_free_quantity}
                        onChange={(e) => setFormData({ ...formData, display_free_quantity: e.target.value })}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Value-wise Scheme Fields */}
              {formData.type === 'value_wise' && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <IndianRupee size={16} className="text-warning" />
                    Value-wise Scheme Configuration
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Min Order Value (₹) *</label>
                      <input
                        type="number"
                        className="input-field w-full"
                        value={formData.min_order_value}
                        onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Max Benefit (₹)</label>
                      <input
                        type="number"
                        className="input-field w-full"
                        value={formData.max_benefit}
                        onChange={(e) => setFormData({ ...formData, max_benefit: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  {formData.benefit_type === 'discount' && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Discount %</label>
                      <input
                        type="number"
                        className="input-field w-full"
                        value={formData.discount_percent}
                        onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                        placeholder="0"
                        max="100"
                      />
                    </div>
                  )}
                  {formData.benefit_type === 'free_qty' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Min Quantity (Buy)</label>
                        <input
                          type="number"
                          className="input-field w-full"
                          value={formData.min_quantity}
                          onChange={(e) => setFormData({ ...formData, min_quantity: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Free Quantity (Get)</label>
                        <input
                          type="number"
                          className="input-field w-full"
                          value={formData.free_quantity}
                          onChange={(e) => setFormData({ ...formData, free_quantity: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* General Constraints (for types that need them) */}
              {!['buy_x_get_y', 'combo', 'bill_wise', 'value_wise'].includes(formData.type) && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Min Order Value (₹)</label>
                    <input
                      type="number"
                      className="input-field w-full"
                      value={formData.min_order_value}
                      onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Benefit (₹)</label>
                    <input
                      type="number"
                      className="input-field w-full"
                      value={formData.max_benefit}
                      onChange={(e) => setFormData({ ...formData, max_benefit: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Outlet Claim Limit</label>
                    <input
                      type="number"
                      className="input-field w-full"
                      value={formData.outlet_claim_limit}
                      onChange={(e) => setFormData({ ...formData, outlet_claim_limit: e.target.value })}
                      placeholder="Unlimited"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button className="btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleCreateOrUpdate}
                disabled={createScheme.isPending || updateScheme.isPending}
              >
                {(createScheme.isPending || updateScheme.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                {editingScheme ? 'Update Scheme' : 'Create Scheme'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Modal */}
      {viewingScheme && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-semibold">Scheme Details</h2>
              <button onClick={() => setViewingScheme(null)} className="p-2 hover:bg-muted rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Code</p>
                  <p className="font-medium">{viewingScheme.code || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{viewingScheme.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{schemeTypeLabels[viewingScheme.type]}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge status={viewingScheme.status as any} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Benefit Type</p>
                  <p className="font-medium">{benefitTypeLabels[viewingScheme.benefit_type]}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Applicability</p>
                  <p className="font-medium">{applicabilityLabels[viewingScheme.applicability]}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Validity</p>
                  <p className="font-medium">
                    {format(new Date(viewingScheme.start_date), 'dd MMM yyyy')} - {format(new Date(viewingScheme.end_date), 'dd MMM yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Min Order Value</p>
                  <p className="font-medium">₹{viewingScheme.min_order_value?.toLocaleString('en-IN') || 0}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="font-medium mb-3">Performance</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-foreground">{viewingScheme.claims_generated}</p>
                    <p className="text-xs text-muted-foreground">Claims Generated</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-success">{viewingScheme.claims_approved}</p>
                    <p className="text-xs text-muted-foreground">Approved</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-foreground">₹{viewingScheme.total_payout?.toLocaleString('en-IN') || 0}</p>
                    <p className="text-xs text-muted-foreground">Total Payout</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setViewingScheme(null)}>
                Close
              </button>
              <button 
                className="btn-primary"
                onClick={() => {
                  setViewingScheme(null);
                  openEditModal(viewingScheme);
                }}
                disabled={viewingScheme.status === 'closed'}
              >
                Edit Scheme
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
