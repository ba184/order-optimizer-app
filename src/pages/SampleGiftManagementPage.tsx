import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Plus,
  Gift,
  Package,
  Users,
  TrendingUp,
  Eye,
  Edit,
  AlertTriangle,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  useSamples,
  useSampleIssues,
  useCurrentBudget,
  useCreateSample,
  useUpdateSample,
  useIssueSample,
  useApproveSampleIssue,
  useRejectSampleIssue,
  useEmployeesForSamples,
  Sample,
  SampleIssue,
} from '@/hooks/useSamplesData';
import { useProducts } from '@/hooks/useProductsData';
import { useAuth } from '@/contexts/AuthContext';

export default function SampleGiftManagementPage() {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'admin' || (userRole as any)?.code === 'admin';
  
  const [activeTab, setActiveTab] = useState<'samples' | 'issues'>('samples');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingIssue, setViewingIssue] = useState<SampleIssue | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  const [issueData, setIssueData] = useState({
    employee_id: '',
    item_type: 'sample',
    items: [] as { sample_id: string; quantity: number }[],
    remarks: '',
  });

  const [sampleData, setSampleData] = useState({
    sku: '',
    name: '',
    type: 'sample',
    cost_price: 0,
    stock: 0,
    description: '',
    product_id: '',
    status: 'active',
  });

  const { data: samples = [], isLoading: loadingSamples } = useSamples();
  const { data: issues = [], isLoading: loadingIssues } = useSampleIssues(statusFilter);
  const { data: budget } = useCurrentBudget();
  const { data: products = [] } = useProducts();
  const { data: employees = [] } = useEmployeesForSamples();
  
  const createSampleMutation = useCreateSample();
  const issueMutation = useIssueSample();
  const approveMutation = useApproveSampleIssue();
  const rejectMutation = useRejectSampleIssue();

  const filteredSamples = samples.filter(s => {
    if (issueData.item_type === 'sample') return s.type === 'sample';
    if (issueData.item_type === 'gift') return s.type === 'gift';
    return true;
  });

  const handleIssue = () => {
    if (!issueData.employee_id || issueData.items.length === 0) return;
    issueMutation.mutate(
      {
        employee_id: issueData.employee_id,
        items: issueData.items,
        remarks: issueData.remarks || undefined,
        isAdmin,
      },
      {
        onSuccess: () => {
          setShowIssueModal(false);
          setIssueData({ employee_id: '', item_type: 'sample', items: [], remarks: '' });
        },
      }
    );
  };

  const handleCreateSample = () => {
    createSampleMutation.mutate({
      sku: sampleData.sku,
      name: sampleData.name,
      type: sampleData.type,
      cost_price: sampleData.cost_price,
      stock: sampleData.stock,
      description: sampleData.description || undefined,
      product_id: sampleData.product_id || undefined,
    }, {
      onSuccess: () => {
        setShowCreateModal(false);
        setSampleData({ sku: '', name: '', type: 'sample', cost_price: 0, stock: 0, description: '', product_id: '', status: 'active' });
      },
    });
  };

  const handleReject = (id: string) => {
    if (!rejectReason.trim()) {
      alert('Rejection reason is required');
      return;
    }
    rejectMutation.mutate({ id, reason: rejectReason });
    setShowRejectModal(null);
    setRejectReason('');
  };

  const addItemToIssue = (sampleId: string) => {
    if (issueData.items.find(i => i.sample_id === sampleId)) return;
    setIssueData({
      ...issueData,
      items: [...issueData.items, { sample_id: sampleId, quantity: 1 }],
    });
  };

  const updateItemQuantity = (sampleId: string, quantity: number) => {
    setIssueData({
      ...issueData,
      items: issueData.items.map(i => 
        i.sample_id === sampleId ? { ...i, quantity: Math.max(1, quantity) } : i
      ),
    });
  };

  const removeItemFromIssue = (sampleId: string) => {
    setIssueData({
      ...issueData,
      items: issueData.items.filter(i => i.sample_id !== sampleId),
    });
  };

  const sampleColumns = [
    {
      key: 'name',
      header: 'Item Name',
      render: (item: Sample) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
            {item.type === 'gift' ? (
              <Gift size={20} className="text-secondary" />
            ) : (
              <Package size={20} className="text-primary" />
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Item Type',
      render: (item: Sample) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          item.type === 'gift' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
        }`}>
          {item.type === 'gift' ? 'Gift' : 'Sample'}
        </span>
      ),
    },
    {
      key: 'stock',
      header: 'Qty Available',
      render: (item: Sample) => (
        <span className={item.stock < 100 ? 'text-destructive font-medium' : ''}>{item.stock}</span>
      ),
    },
    {
      key: 'cost_price',
      header: 'Cost Price',
      render: (item: Sample) => <span>₹{Number(item.cost_price).toLocaleString()}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Sample) => <StatusBadge status={item.status as any} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: () => (
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Eye size={16} className="text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Edit size={16} className="text-muted-foreground" />
          </button>
        </div>
      ),
    },
  ];

  const issueColumns = [
    {
      key: 'id',
      header: 'Issue ID',
      render: (item: SampleIssue) => (
        <span className="font-medium text-foreground">{item.id.slice(0, 8).toUpperCase()}</span>
      ),
    },
    {
      key: 'issued_to_name',
      header: 'Employee Name',
      render: (item: SampleIssue) => <span>{item.issued_to_name}</span>,
    },
    {
      key: 'sample_type',
      header: 'Item Type',
      render: (item: SampleIssue) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          (item as any).sample_type === 'gift' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
        }`}>
          {(item as any).sample_type === 'gift' ? 'Gift' : 'Sample'}
        </span>
      ),
    },
    {
      key: 'sample_name',
      header: 'Item Name',
      render: (item: SampleIssue) => <span>{item.sample_name}</span>,
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (item: SampleIssue) => <span>{item.quantity}</span>,
    },
    {
      key: 'issued_by_name',
      header: 'Requested By',
      render: (item: SampleIssue) => (
        <div>
          <p className="text-sm">{item.issued_by_name}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            item.created_by_role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-info/10 text-info'
          }`}>
            {item.created_by_role === 'admin' ? 'Admin' : 'FSE'}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: SampleIssue) => <StatusBadge status={item.status as any} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: SampleIssue) => (
        <div className="flex items-center gap-1">
          <button onClick={() => setViewingIssue(item)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Eye size={16} className="text-muted-foreground" />
          </button>
          {item.status === 'pending' && isAdmin && (
            <>
              <button
                onClick={() => approveMutation.mutate(item.id)}
                className="p-2 hover:bg-success/10 rounded-lg transition-colors"
                title="Approve"
              >
                <Check size={16} className="text-success" />
              </button>
              <button
                onClick={() => setShowRejectModal(item.id)}
                className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                title="Reject"
              >
                <X size={16} className="text-destructive" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const stats = {
    totalSamples: samples.filter((s) => s.type === 'sample').length,
    totalGifts: samples.filter((s) => s.type === 'gift').length,
    issuedThisMonth: samples.reduce((sum, s) => sum + (s.issued_this_month || 0), 0),
    conversionRate:
      samples.reduce((sum, s) => sum + (s.issued_this_month || 0), 0) > 0
        ? (
            (samples.reduce((sum, s) => sum + (s.conversions || 0), 0) /
              samples.reduce((sum, s) => sum + (s.issued_this_month || 0), 0)) *
            100
          ).toFixed(0)
        : 0,
  };

  const executiveBudget = budget || { monthly_budget: 5000, used_amount: 0 };
  const budgetRemaining = Number(executiveBudget.monthly_budget) - Number(executiveBudget.used_amount);

  if (loadingSamples || loadingIssues) {
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
          <h1 className="module-title">Sample & Gift Management</h1>
          <p className="text-muted-foreground">Manage stock, issue samples/gifts, and track conversions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCreateModal(true)} className="btn-outline flex items-center gap-2">
            <Plus size={18} />
            Add Stock
          </button>
          <button onClick={() => setShowIssueModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Issue to FSE
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Package size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalSamples}</p>
              <p className="text-sm text-muted-foreground">Sample SKUs</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10">
              <Gift size={24} className="text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalGifts}</p>
              <p className="text-sm text-muted-foreground">Gift Items</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-info/10">
              <Users size={24} className="text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.issuedThisMonth}</p>
              <p className="text-sm text-muted-foreground">Issued (MTD)</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <TrendingUp size={24} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.conversionRate}%</p>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Budget Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h3 className="font-semibold text-foreground mb-4">Monthly Budget</h3>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Used: ₹{Number(executiveBudget.used_amount).toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">
                Budget: ₹{Number(executiveBudget.monthly_budget).toLocaleString()}
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  Number(executiveBudget.used_amount) / Number(executiveBudget.monthly_budget) > 0.8
                    ? 'bg-warning'
                    : 'bg-primary'
                }`}
                style={{
                  width: `${Math.min((Number(executiveBudget.used_amount) / Number(executiveBudget.monthly_budget)) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">₹{budgetRemaining.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Remaining</p>
          </div>
        </div>
        {budgetRemaining < 1000 && (
          <div className="mt-4 p-3 bg-warning/10 rounded-lg">
            <p className="text-sm text-warning flex items-center gap-2">
              <AlertTriangle size={16} />
              Low budget warning. Further issuance requires approval.
            </p>
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('samples')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'samples' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          Stock Master
        </button>
        <button
          onClick={() => setActiveTab('issues')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'issues' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          Issue History
        </button>
      </div>

      {/* Status Filter for Issues */}
      {activeTab === 'issues' && (
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {activeTab === 'samples' ? (
        <DataTable data={samples} columns={sampleColumns} searchPlaceholder="Search samples..." />
      ) : (
        <DataTable data={issues} columns={issueColumns} searchPlaceholder="Search issues..." />
      )}

      {/* Create Sample Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Add Stock Item</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Item Type *</label>
                <select
                  value={sampleData.type}
                  onChange={(e) => setSampleData({ ...sampleData, type: e.target.value })}
                  className="input-field"
                >
                  <option value="sample">Sample</option>
                  <option value="gift">Gift</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Link to Product (Optional)</label>
                <select
                  value={sampleData.product_id}
                  onChange={(e) => {
                    const selectedProduct = products.find(p => p.id === e.target.value);
                    if (selectedProduct) {
                      setSampleData({
                        ...sampleData,
                        product_id: e.target.value,
                        sku: `SMP-${selectedProduct.sku}`,
                        name: `${selectedProduct.name} (Sample)`,
                        cost_price: Math.round(Number(selectedProduct.ptr) * 0.5),
                      });
                    } else {
                      setSampleData({ ...sampleData, product_id: '' });
                    }
                  }}
                  className="input-field"
                >
                  <option value="">Select a product (optional)</option>
                  {products.filter(p => p.status === 'active').map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Item Name *</label>
                <input
                  type="text"
                  value={sampleData.name}
                  onChange={(e) => setSampleData({ ...sampleData, name: e.target.value })}
                  className="input-field"
                  placeholder="Sample/Gift name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">SKU Code *</label>
                <input
                  type="text"
                  value={sampleData.sku}
                  onChange={(e) => setSampleData({ ...sampleData, sku: e.target.value })}
                  className="input-field"
                  placeholder="e.g., SMP-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Quantity Available *</label>
                <input
                  type="number"
                  value={sampleData.stock || ''}
                  onChange={(e) => setSampleData({ ...sampleData, stock: parseInt(e.target.value) || 0 })}
                  className="input-field"
                  placeholder="Enter quantity"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Cost Price (₹) *</label>
                <input
                  type="number"
                  value={sampleData.cost_price || ''}
                  onChange={(e) => setSampleData({ ...sampleData, cost_price: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                  placeholder="Enter cost price"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  value={sampleData.description}
                  onChange={(e) => setSampleData({ ...sampleData, description: e.target.value })}
                  rows={2}
                  className="input-field resize-none"
                  placeholder="Optional description"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 btn-outline">
                Cancel
              </button>
              <button
                onClick={handleCreateSample}
                disabled={createSampleMutation.isPending || !sampleData.name || !sampleData.sku}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {createSampleMutation.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Issue Sample Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Issue Sample/Gift to FSE</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Employee *</label>
                <select
                  value={issueData.employee_id}
                  onChange={(e) => setIssueData({ ...issueData, employee_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Item Type</label>
                <select
                  value={issueData.item_type}
                  onChange={(e) => setIssueData({ ...issueData, item_type: e.target.value, items: [] })}
                  className="input-field"
                >
                  <option value="sample">Sample</option>
                  <option value="gift">Gift</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Select Items *</label>
                <select
                  onChange={(e) => {
                    if (e.target.value) addItemToIssue(e.target.value);
                    e.target.value = '';
                  }}
                  className="input-field"
                >
                  <option value="">Add item...</option>
                  {filteredSamples
                    .filter(s => s.status === 'active' && !issueData.items.find(i => i.sample_id === s.id))
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Stock: {s.stock})
                      </option>
                    ))}
                </select>
              </div>

              {issueData.items.length > 0 && (
                <div className="space-y-2">
                  {issueData.items.map((item) => {
                    const sample = samples.find(s => s.id === item.sample_id);
                    return (
                      <div key={item.sample_id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{sample?.name}</p>
                          <p className="text-xs text-muted-foreground">Available: {sample?.stock}</p>
                        </div>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(item.sample_id, parseInt(e.target.value) || 1)}
                          min={1}
                          max={sample?.stock}
                          className="w-20 input-field text-center"
                        />
                        <button
                          onClick={() => removeItemFromIssue(item.sample_id)}
                          className="p-1 hover:bg-destructive/10 rounded"
                        >
                          <X size={16} className="text-destructive" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Remarks</label>
                <textarea
                  value={issueData.remarks}
                  onChange={(e) => setIssueData({ ...issueData, remarks: e.target.value })}
                  rows={2}
                  className="input-field resize-none"
                  placeholder="Optional remarks"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowIssueModal(false)} className="flex-1 btn-outline">
                Cancel
              </button>
              <button
                onClick={handleIssue}
                disabled={issueMutation.isPending || !issueData.employee_id || issueData.items.length === 0}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {issueMutation.isPending ? 'Issuing...' : isAdmin ? 'Issue & Approve' : 'Submit for Approval'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Issue Modal */}
      {viewingIssue && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Issue Details</h2>
              <button onClick={() => setViewingIssue(null)} className="p-2 hover:bg-muted rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Issue ID</span>
                <span className="font-medium">{viewingIssue.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Employee</span>
                <span className="font-medium">{viewingIssue.issued_to_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Item</span>
                <span className="font-medium">{viewingIssue.sample_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-medium">{viewingIssue.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Requested By</span>
                <span className="font-medium">{viewingIssue.issued_by_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Request Date</span>
                <span className="font-medium">{format(new Date(viewingIssue.request_date), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={viewingIssue.status as any} />
              </div>
              {viewingIssue.notes && (
                <div>
                  <span className="text-muted-foreground block mb-1">Remarks</span>
                  <p className="text-sm bg-muted/30 p-3 rounded-lg">{viewingIssue.notes}</p>
                </div>
              )}
              {viewingIssue.rejection_reason && (
                <div>
                  <span className="text-muted-foreground block mb-1">Rejection Reason</span>
                  <p className="text-sm bg-destructive/10 text-destructive p-3 rounded-lg">{viewingIssue.rejection_reason}</p>
                </div>
              )}
            </div>

            {viewingIssue.status === 'pending' && isAdmin && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    approveMutation.mutate(viewingIssue.id);
                    setViewingIssue(null);
                  }}
                  className="flex-1 btn-primary"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(viewingIssue.id);
                    setViewingIssue(null);
                  }}
                  className="flex-1 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-medium"
                >
                  Reject
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Reject Issue Request</h2>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Rejection Reason *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="input-field resize-none"
                placeholder="Enter reason for rejection..."
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowRejectModal(null)} className="flex-1 btn-outline">
                Cancel
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                disabled={!rejectReason.trim()}
                className="flex-1 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-medium disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
