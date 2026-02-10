import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge, StatusType } from '@/components/ui/StatusBadge';
import {
  Package,
  Plus,
  Eye,
  Edit,
  Trash2,
  Send,
  CheckCircle,
  Truck,
  RotateCcw,
  FileText,
  Search,
  Filter,
  Loader2,
  X,
  ArrowDownCircle,
  ArrowUpCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  useMarketingCollaterals,
  useCollateralIssues,
  useCreateMarketingCollateral,
  useUpdateMarketingCollateral,
  useDeleteMarketingCollateral,
  useCreateCollateralIssue,
  useUpdateIssueStatus,
  useCollateralStats,
  MarketingCollateral,
  CollateralIssue,
  COLLATERAL_TYPES,
  ISSUE_STAGES,
  ISSUE_STATUSES,
} from '@/hooks/useMarketingCollateralsData';
import { useDistributors, useRetailers } from '@/hooks/useOutletsData';
import { useWarehouses } from '@/hooks/useWarehousesData';
import { useProfiles } from '@/hooks/useSalesTeamData';

type TabType = 'inventory' | 'issues' | 'direct-issue';

export default function MarketingCollateralPage() {
  const [activeTab, setActiveTab] = useState<TabType>('inventory');
  const [showCollateralModal, setShowCollateralModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editingCollateral, setEditingCollateral] = useState<MarketingCollateral | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<CollateralIssue | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: collaterals = [], isLoading: collateralsLoading } = useMarketingCollaterals();
  const { data: issues = [], isLoading: issuesLoading } = useCollateralIssues();
  const { data: distributors = [] } = useDistributors();
  const { data: retailers = [] } = useRetailers();
  const { data: warehouses = [] } = useWarehouses();
  const { data: profiles = [] } = useProfiles();

  const createCollateral = useCreateMarketingCollateral();
  const updateCollateral = useUpdateMarketingCollateral();
  const deleteCollateral = useDeleteMarketingCollateral();
  const createIssue = useCreateCollateralIssue();
  const updateIssueStatus = useUpdateIssueStatus();

  const stats = useCollateralStats(issues);

  const [collateralForm, setCollateralForm] = useState({
    code: '',
    name: '',
    type: 'pos_material',
    description: '',
    current_stock: '',
    warehouse: '',
    status: 'active',
  });

  const [issueForm, setIssueForm] = useState({
    collateral_id: '',
    quantity: '',
    issued_to_type: 'distributor',
    issued_to_id: '',
    issued_to_name: '',
    remarks: '',
    in_notes: '',
  });

  const [statusForm, setStatusForm] = useState({
    status: '',
    issue_stage: '',
    in_notes: '',
    out_notes: '',
  });

  // Filter issues
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
      if (typeFilter !== 'all' && issue.collateral?.type !== typeFilter) return false;
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        return (
          issue.issue_number.toLowerCase().includes(search) ||
          issue.collateral?.name.toLowerCase().includes(search) ||
          issue.issued_to_name?.toLowerCase().includes(search)
        );
      }
      return true;
    });
  }, [issues, statusFilter, typeFilter, searchQuery]);

  const resetCollateralForm = () => {
    setCollateralForm({
      code: '',
      name: '',
      type: 'pos_material',
      description: '',
      current_stock: '',
      warehouse: '',
      status: 'active',
    });
    setEditingCollateral(null);
  };

  const resetIssueForm = () => {
    setIssueForm({
      collateral_id: '',
      quantity: '',
      issued_to_type: 'distributor',
      issued_to_id: '',
      issued_to_name: '',
      remarks: '',
      in_notes: '',
    });
  };

  const handleEditCollateral = (item: MarketingCollateral) => {
    setEditingCollateral(item);
    setCollateralForm({
      code: item.code,
      name: item.name,
      type: item.type,
      description: item.description || '',
      current_stock: item.current_stock.toString(),
      warehouse: item.warehouse || '',
      status: item.status || 'active',
    });
    setShowCollateralModal(true);
  };

  const handleSaveCollateral = async () => {
    if (!collateralForm.code || !collateralForm.name || !collateralForm.type) {
      toast.error('Please fill all required fields');
      return;
    }

    const data = {
      code: collateralForm.code,
      name: collateralForm.name,
      type: collateralForm.type,
      description: collateralForm.description || null,
      current_stock: parseInt(collateralForm.current_stock) || 0,
      warehouse: collateralForm.warehouse || null,
      status: collateralForm.status,
    };

    try {
      if (editingCollateral) {
        await updateCollateral.mutateAsync({ id: editingCollateral.id, ...data });
      } else {
        await createCollateral.mutateAsync(data);
      }
      setShowCollateralModal(false);
      resetCollateralForm();
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleDeleteCollateral = (id: string) => {
    if (confirm('Are you sure you want to delete this collateral?')) {
      deleteCollateral.mutate(id);
    }
  };

  const handleCreateIssue = async () => {
    if (!issueForm.collateral_id || !issueForm.quantity || !issueForm.issued_to_name) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await createIssue.mutateAsync({
        collateral_id: issueForm.collateral_id,
        quantity: parseInt(issueForm.quantity),
        issued_to_type: issueForm.issued_to_type,
        issued_to_id: issueForm.issued_to_id || undefined,
        issued_to_name: issueForm.issued_to_name,
        remarks: issueForm.remarks || undefined,
        in_notes: issueForm.in_notes || undefined,
      });
      setShowIssueModal(false);
      resetIssueForm();
    } catch (error) {
      // Error handled in mutation
    }
  };

  const openStatusModal = (issue: CollateralIssue) => {
    setSelectedIssue(issue);
    setStatusForm({
      status: issue.status || 'pending',
      issue_stage: issue.issue_stage || 'requested',
      in_notes: issue.in_notes || '',
      out_notes: issue.out_notes || '',
    });
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedIssue) return;

    try {
      await updateIssueStatus.mutateAsync({
        id: selectedIssue.id,
        status: statusForm.status,
        issue_stage: statusForm.issue_stage,
        in_notes: statusForm.in_notes || undefined,
        out_notes: statusForm.out_notes || undefined,
      });
      setShowStatusModal(false);
      setSelectedIssue(null);
    } catch (error) {
      // Error handled in mutation
    }
  };

  const getRecipientOptions = () => {
    if (issueForm.issued_to_type === 'distributor') {
      return distributors.map(d => ({ id: d.id, name: d.firm_name }));
    }
    if (issueForm.issued_to_type === 'retailer') {
      return retailers.map(r => ({ id: r.id, name: r.shop_name }));
    }
    return profiles.map(p => ({ id: p.id, name: p.name }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Package size={14} />;
      case 'approved': return <CheckCircle size={14} />;
      case 'dispatched': return <Truck size={14} />;
      case 'delivered': return <CheckCircle size={14} />;
      case 'returned': return <RotateCcw size={14} />;
      default: return <Package size={14} />;
    }
  };

  const inventoryColumns = [
    {
      key: 'name',
      header: 'Collateral',
      render: (item: MarketingCollateral) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (item: MarketingCollateral) => (
        <Badge variant="secondary" className="capitalize">
          {COLLATERAL_TYPES.find(t => t.value === item.type)?.label || item.type}
        </Badge>
      ),
    },
    {
      key: 'current_stock',
      header: 'Stock',
      render: (item: MarketingCollateral) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold">{item.current_stock}</span>
          <span className="text-xs text-muted-foreground">{item.unit}</span>
          {item.min_stock_threshold && item.current_stock <= item.min_stock_threshold && (
            <Badge variant="destructive" className="text-xs">Low</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'value_per_unit',
      header: 'Value',
      render: (item: MarketingCollateral) => (
        <span>₹{(item.value_per_unit || 0).toLocaleString()}</span>
      ),
    },
    {
      key: 'warehouse',
      header: 'Warehouse',
      render: (item: MarketingCollateral) => (
        <span className="text-muted-foreground">{item.warehouse || '-'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: MarketingCollateral) => <StatusBadge status={item.status as StatusType} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: MarketingCollateral) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleEditCollateral(item)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Edit"
          >
            <Edit size={16} className="text-muted-foreground" />
          </button>
          <button
            onClick={() => handleDeleteCollateral(item.id)}
            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={16} className="text-destructive" />
          </button>
        </div>
      ),
    },
  ];

  const issueColumns = [
    {
      key: 'issue_number',
      header: 'Issue #',
      render: (item: CollateralIssue) => (
        <span className="font-mono text-sm">{item.issue_number}</span>
      ),
    },
    {
      key: 'collateral',
      header: 'Collateral',
      render: (item: CollateralIssue) => (
        <div>
          <p className="font-medium">{item.collateral?.name || '-'}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {COLLATERAL_TYPES.find(t => t.value === item.collateral?.type)?.label || item.collateral?.type}
          </p>
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Qty',
      render: (item: CollateralIssue) => (
        <div className="flex items-center gap-1">
          {item.in_out_type === 'out' ? (
            <ArrowUpCircle size={14} className="text-destructive" />
          ) : (
            <ArrowDownCircle size={14} className="text-success" />
          )}
          <span className="font-semibold">{item.quantity}</span>
        </div>
      ),
    },
    {
      key: 'issued_to',
      header: 'Issued To',
      render: (item: CollateralIssue) => (
        <div>
          <p className="font-medium">{item.issued_to_name || '-'}</p>
          <p className="text-xs text-muted-foreground capitalize">{item.issued_to_type}</p>
        </div>
      ),
    },
    {
      key: 'order',
      header: 'Order',
      render: (item: CollateralIssue) => (
        <span className="text-sm text-muted-foreground">
          {item.order?.order_number || '-'}
        </span>
      ),
    },
    {
      key: 'instructed_by',
      header: 'Instructed By',
      render: (item: CollateralIssue) => (
        <span className="text-sm">{item.instructed_by_user?.name || '-'}</span>
      ),
    },
    {
      key: 'issue_stage',
      header: 'Stage',
      render: (item: CollateralIssue) => (
        <Badge variant="outline" className="gap-1 capitalize">
          {getStatusIcon(item.status || 'pending')}
          {ISSUE_STAGES.find(s => s.value === item.issue_stage)?.label || item.issue_stage}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: CollateralIssue) => <StatusBadge status={item.status as StatusType} />,
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (item: CollateralIssue) => format(new Date(item.created_at), 'dd MMM yyyy'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: CollateralIssue) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openStatusModal(item)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Update Status"
          >
            <Edit size={16} className="text-muted-foreground" />
          </button>
          <button
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="View Details"
          >
            <Eye size={16} className="text-muted-foreground" />
          </button>
        </div>
      ),
    },
  ];

  const isLoading = collateralsLoading || issuesLoading;

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
          <h1 className="module-title">Marketing Collateral Management</h1>
          <p className="text-muted-foreground">Manage collateral inventory and track issuances</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              resetIssueForm();
              setShowIssueModal(true);
            }}
            className="btn-outline flex items-center gap-2"
          >
            <Send size={18} />
            Direct Issue
          </button>
          <button
            onClick={() => {
              resetCollateralForm();
              setShowCollateralModal(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Add Collateral
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{collaterals.length}</p>
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
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <FileText size={20} className="text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
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
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Truck size={20} className="text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dispatched</p>
              <p className="text-2xl font-bold">{stats.dispatched}</p>
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
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle size={20} className="text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Delivered</p>
              <p className="text-2xl font-bold">{stats.delivered}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <RotateCcw size={20} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Returned</p>
              <p className="text-2xl font-bold">{stats.returned}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package size={16} />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="issues" className="flex items-center gap-2">
            <FileText size={16} />
            Issue Tracking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-6 shadow-sm"
          >
            <DataTable
              data={collaterals}
              columns={inventoryColumns}
              searchable
              searchPlaceholder="Search collaterals..."
            />
          </motion.div>
        </TabsContent>

        <TabsContent value="issues" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-6 shadow-sm"
          >
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {ISSUE_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {COLLATERAL_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DataTable
              data={filteredIssues}
              columns={issueColumns}
            />
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Collateral Modal */}
      {showCollateralModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 w-full max-w-lg shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {editingCollateral ? 'Edit Collateral' : 'Add Collateral'}
              </h2>
              <button
                onClick={() => {
                  setShowCollateralModal(false);
                  resetCollateralForm();
                }}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Code *</label>
                  <input
                    type="text"
                    value={collateralForm.code}
                    onChange={(e) => setCollateralForm({ ...collateralForm, code: e.target.value })}
                    className="input-field"
                    placeholder="COL-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    value={collateralForm.name}
                    onChange={(e) => setCollateralForm({ ...collateralForm, name: e.target.value })}
                    className="input-field"
                    placeholder="LED Display 32 inch"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Type *</label>
                <select
                  value={collateralForm.type}
                  onChange={(e) => setCollateralForm({ ...collateralForm, type: e.target.value })}
                  className="input-field"
                >
                  {COLLATERAL_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={collateralForm.description}
                  onChange={(e) => setCollateralForm({ ...collateralForm, description: e.target.value })}
                  className="input-field"
                  rows={2}
                  placeholder="Description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Add Stock</label>
                <input
                  type="number"
                  value={collateralForm.current_stock}
                  onChange={(e) => setCollateralForm({ ...collateralForm, current_stock: e.target.value })}
                  className="input-field"
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Warehouse</label>
                  <select
                    value={collateralForm.warehouse}
                    onChange={(e) => setCollateralForm({ ...collateralForm, warehouse: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select Warehouse</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={collateralForm.status}
                    onChange={(e) => setCollateralForm({ ...collateralForm, status: e.target.value })}
                    className="input-field"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCollateralModal(false);
                  resetCollateralForm();
                }}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCollateral}
                disabled={createCollateral.isPending || updateCollateral.isPending}
                className="btn-primary flex items-center gap-2"
              >
                {(createCollateral.isPending || updateCollateral.isPending) && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                {editingCollateral ? 'Update' : 'Create'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Direct Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 w-full max-w-lg shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Direct Collateral Issue</h2>
              <button
                onClick={() => {
                  setShowIssueModal(false);
                  resetIssueForm();
                }}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Collateral *</label>
                <select
                  value={issueForm.collateral_id}
                  onChange={(e) => setIssueForm({ ...issueForm, collateral_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select Collateral</option>
                  {collaterals.filter(c => c.status === 'active').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Stock: {c.current_stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Quantity *</label>
                <input
                  type="number"
                  value={issueForm.quantity}
                  onChange={(e) => setIssueForm({ ...issueForm, quantity: e.target.value })}
                  className="input-field"
                  placeholder="1"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Issue To *</label>
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={issueForm.issued_to_type === 'distributor'}
                      onChange={() => setIssueForm({ ...issueForm, issued_to_type: 'distributor', issued_to_id: '', issued_to_name: '' })}
                    />
                    Distributor
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={issueForm.issued_to_type === 'retailer'}
                      onChange={() => setIssueForm({ ...issueForm, issued_to_type: 'retailer', issued_to_id: '', issued_to_name: '' })}
                    />
                    Retailer
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={issueForm.issued_to_type === 'executive'}
                      onChange={() => setIssueForm({ ...issueForm, issued_to_type: 'executive', issued_to_id: '', issued_to_name: '' })}
                    />
                    Executive
                  </label>
                </div>
                <select
                  value={issueForm.issued_to_id}
                  onChange={(e) => {
                    const selected = getRecipientOptions().find(o => o.id === e.target.value);
                    setIssueForm({
                      ...issueForm,
                      issued_to_id: e.target.value,
                      issued_to_name: selected?.name || '',
                    });
                  }}
                  className="input-field"
                >
                  <option value="">Select Recipient</option>
                  {getRecipientOptions().map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">In Notes (Warehouse)</label>
                <textarea
                  value={issueForm.in_notes}
                  onChange={(e) => setIssueForm({ ...issueForm, in_notes: e.target.value })}
                  className="input-field"
                  rows={2}
                  placeholder="Acknowledgment notes..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Remarks</label>
                <textarea
                  value={issueForm.remarks}
                  onChange={(e) => setIssueForm({ ...issueForm, remarks: e.target.value })}
                  className="input-field"
                  rows={2}
                  placeholder="Additional remarks..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowIssueModal(false);
                  resetIssueForm();
                }}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateIssue}
                disabled={createIssue.isPending}
                className="btn-primary flex items-center gap-2"
              >
                {createIssue.isPending && <Loader2 size={16} className="animate-spin" />}
                Issue Collateral
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedIssue && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 w-full max-w-md shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Update Issue Status</h2>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedIssue(null);
                }}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Issue #</p>
                <p className="font-mono">{selectedIssue.issue_number}</p>
                <p className="text-sm mt-2">{selectedIssue.collateral?.name} x {selectedIssue.quantity}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={statusForm.status}
                    onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                    className="input-field"
                  >
                    {ISSUE_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stage</label>
                  <select
                    value={statusForm.issue_stage}
                    onChange={(e) => setStatusForm({ ...statusForm, issue_stage: e.target.value })}
                    className="input-field"
                  >
                    {ISSUE_STAGES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">In Notes (Received/Packed)</label>
                <textarea
                  value={statusForm.in_notes}
                  onChange={(e) => setStatusForm({ ...statusForm, in_notes: e.target.value })}
                  className="input-field"
                  rows={2}
                  placeholder="Condition, remarks..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Out Notes (Dispatch)</label>
                <textarea
                  value={statusForm.out_notes}
                  onChange={(e) => setStatusForm({ ...statusForm, out_notes: e.target.value })}
                  className="input-field"
                  rows={2}
                  placeholder="Dispatch confirmation..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedIssue(null);
                }}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={updateIssueStatus.isPending}
                className="btn-primary flex items-center gap-2"
              >
                {updateIssueStatus.isPending && <Loader2 size={16} className="animate-spin" />}
                Update Status
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
