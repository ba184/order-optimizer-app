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
  Camera,
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
  Sample,
  SampleIssue,
} from '@/hooks/useSamplesData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function SampleGiftManagementPage() {
  const [activeTab, setActiveTab] = useState<'samples' | 'issues'>('samples');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingIssue, setViewingIssue] = useState<SampleIssue | null>(null);

  const [issueData, setIssueData] = useState({
    sampleId: '',
    quantity: 1,
    issuedToName: '',
    issuedToType: 'retailer',
    notes: '',
  });

  const [sampleData, setSampleData] = useState({
    sku: '',
    name: '',
    type: 'sample',
    cost_price: 0,
    stock: 0,
    description: '',
  });

  const { data: samples = [], isLoading: loadingSamples } = useSamples();
  const { data: issues = [], isLoading: loadingIssues } = useSampleIssues();
  const { data: budget } = useCurrentBudget();
  const createSampleMutation = useCreateSample();
  const issueMutation = useIssueSample();

  // Fetch retailers and distributors for issue modal
  const { data: retailers = [] } = useQuery({
    queryKey: ['retailers-for-samples'],
    queryFn: async () => {
      const { data } = await supabase.from('retailers').select('id, shop_name').eq('status', 'active');
      return data || [];
    },
  });

  const { data: distributors = [] } = useQuery({
    queryKey: ['distributors-for-samples'],
    queryFn: async () => {
      const { data } = await supabase.from('distributors').select('id, firm_name').eq('status', 'active');
      return data || [];
    },
  });

  const handleIssue = () => {
    if (!issueData.sampleId || !issueData.issuedToName) return;
    issueMutation.mutate(
      {
        sample_id: issueData.sampleId,
        quantity: issueData.quantity,
        issued_to_name: issueData.issuedToName,
        issued_to_type: issueData.issuedToType,
        notes: issueData.notes || undefined,
      },
      {
        onSuccess: () => {
          setShowIssueModal(false);
          setIssueData({ sampleId: '', quantity: 1, issuedToName: '', issuedToType: 'retailer', notes: '' });
        },
      }
    );
  };

  const handleCreateSample = () => {
    createSampleMutation.mutate(sampleData, {
      onSuccess: () => {
        setShowCreateModal(false);
        setSampleData({ sku: '', name: '', type: 'sample', cost_price: 0, stock: 0, description: '' });
      },
    });
  };

  const sampleColumns = [
    {
      key: 'name',
      header: 'Sample/Gift',
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
      key: 'cost_price',
      header: 'Cost',
      render: (item: Sample) => <span>₹{Number(item.cost_price).toLocaleString()}</span>,
    },
    {
      key: 'stock',
      header: 'Available Stock',
      render: (item: Sample) => (
        <span className={item.stock < 100 ? 'text-destructive font-medium' : ''}>{item.stock}</span>
      ),
    },
    {
      key: 'issued_this_month',
      header: 'Issued (MTD)',
      render: (item: Sample) => <span>{item.issued_this_month || 0}</span>,
    },
    {
      key: 'conversions',
      header: 'Conversions',
      render: (item: Sample) => {
        const issued = item.issued_this_month || 0;
        const conversions = item.conversions || 0;
        const rate = issued > 0 ? ((conversions / issued) * 100).toFixed(0) : 0;
        return (
          <div className="flex items-center gap-2">
            <span>{conversions}</span>
            {conversions > 0 && <span className="text-xs text-success">({rate}%)</span>}
          </div>
        );
      },
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
      key: 'sample_name',
      header: 'Sample/Gift',
      render: (item: SampleIssue) => (
        <div>
          <p className="font-medium text-foreground">{item.sample_name}</p>
          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
        </div>
      ),
    },
    {
      key: 'issued_to_name',
      header: 'Issued To',
      render: (item: SampleIssue) => (
        <div>
          <p className="text-sm">{item.issued_to_name}</p>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              item.issued_to_type === 'retailer' ? 'bg-info/10 text-info' : 'bg-primary/10 text-primary'
            }`}
          >
            {item.issued_to_type}
          </span>
        </div>
      ),
    },
    {
      key: 'issued_by_name',
      header: 'Issued By',
      render: (item: SampleIssue) => (
        <div>
          <p className="text-sm">{item.issued_by_name}</p>
          <p className="text-xs text-muted-foreground">{format(new Date(item.created_at), 'MMM d, yyyy h:mm a')}</p>
        </div>
      ),
    },
    {
      key: 'acknowledged',
      header: 'Acknowledgement',
      render: (item: SampleIssue) =>
        item.acknowledged ? (
          <span className="flex items-center gap-1 text-success text-sm">
            <Check size={14} />
            Received
          </span>
        ) : (
          <span className="text-warning text-sm">Pending</span>
        ),
    },
    {
      key: 'converted_to_order',
      header: 'Conversion',
      render: (item: SampleIssue) =>
        item.converted_to_order ? (
          <div className="text-success">
            <p className="text-sm font-medium flex items-center gap-1">
              <TrendingUp size={14} />
              Converted
            </p>
            {item.order_value && <p className="text-xs">₹{Number(item.order_value).toLocaleString()}</p>}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">--</span>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: SampleIssue) => (
        <button onClick={() => setViewingIssue(item)} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <Eye size={16} className="text-muted-foreground" />
        </button>
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
          <p className="text-muted-foreground">Track samples, gifts, and conversion metrics</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCreateModal(true)} className="btn-outline flex items-center gap-2">
            <Plus size={18} />
            Add Sample/Gift
          </button>
          <button onClick={() => setShowIssueModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Issue Sample/Gift
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat-card"
        >
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="stat-card"
        >
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-6 shadow-sm"
      >
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
                  width: `${(Number(executiveBudget.used_amount) / Number(executiveBudget.monthly_budget)) * 100}%`,
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
          Sample/Gift Master
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
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Add Sample/Gift</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">SKU Code</label>
                <input
                  type="text"
                  value={sampleData.sku}
                  onChange={(e) => setSampleData({ ...sampleData, sku: e.target.value })}
                  className="input-field"
                  placeholder="e.g., SMP-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                <input
                  type="text"
                  value={sampleData.name}
                  onChange={(e) => setSampleData({ ...sampleData, name: e.target.value })}
                  className="input-field"
                  placeholder="Product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Type</label>
                <select
                  value={sampleData.type}
                  onChange={(e) => setSampleData({ ...sampleData, type: e.target.value })}
                  className="input-field"
                >
                  <option value="sample">Sample</option>
                  <option value="gift">Gift</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Cost Price (₹)</label>
                  <input
                    type="number"
                    value={sampleData.cost_price}
                    onChange={(e) => setSampleData({ ...sampleData, cost_price: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Initial Stock</label>
                  <input
                    type="number"
                    value={sampleData.stock}
                    onChange={(e) => setSampleData({ ...sampleData, stock: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description (Optional)</label>
                <textarea
                  value={sampleData.description}
                  onChange={(e) => setSampleData({ ...sampleData, description: e.target.value })}
                  className="input-field resize-none"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="btn-outline">
                Cancel
              </button>
              <button
                onClick={handleCreateSample}
                disabled={createSampleMutation.isPending || !sampleData.sku || !sampleData.name}
                className="btn-primary"
              >
                {createSampleMutation.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Issue Sample/Gift</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Select Item</label>
                <select
                  value={issueData.sampleId}
                  onChange={(e) => setIssueData({ ...issueData, sampleId: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select a sample/gift</option>
                  {samples.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Stock: {s.stock})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Quantity</label>
                <input
                  type="number"
                  value={issueData.quantity}
                  onChange={(e) => setIssueData({ ...issueData, quantity: Number(e.target.value) })}
                  min={1}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Issue To Type</label>
                <select
                  value={issueData.issuedToType}
                  onChange={(e) => setIssueData({ ...issueData, issuedToType: e.target.value, issuedToName: '' })}
                  className="input-field"
                >
                  <option value="retailer">Retailer</option>
                  <option value="distributor">Distributor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Select Recipient</label>
                <select
                  value={issueData.issuedToName}
                  onChange={(e) => setIssueData({ ...issueData, issuedToName: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select {issueData.issuedToType}</option>
                  {issueData.issuedToType === 'retailer'
                    ? retailers.map((r) => (
                        <option key={r.id} value={r.shop_name}>
                          {r.shop_name}
                        </option>
                      ))
                    : distributors.map((d) => (
                        <option key={d.id} value={d.firm_name}>
                          {d.firm_name}
                        </option>
                      ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Notes (Optional)</label>
                <textarea
                  value={issueData.notes}
                  onChange={(e) => setIssueData({ ...issueData, notes: e.target.value })}
                  className="input-field resize-none"
                  rows={2}
                />
              </div>
              <div className="p-4 border-2 border-dashed border-border rounded-lg text-center">
                <Camera size={24} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-foreground">Capture Acknowledgement Photo</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowIssueModal(false)} className="btn-outline">
                Cancel
              </button>
              <button
                onClick={handleIssue}
                disabled={issueMutation.isPending || !issueData.sampleId || !issueData.issuedToName}
                className="btn-primary"
              >
                {issueMutation.isPending ? 'Issuing...' : 'Issue'}
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
            <h2 className="text-lg font-semibold text-foreground mb-4">Issue Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sample/Gift</span>
                <span className="font-medium">{viewingIssue.sample_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-medium">{viewingIssue.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Issued To</span>
                <span className="font-medium">{viewingIssue.issued_to_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="capitalize">{viewingIssue.issued_to_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Issued By</span>
                <span>{viewingIssue.issued_by_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span>{format(new Date(viewingIssue.created_at), 'MMM d, yyyy h:mm a')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Acknowledged</span>
                <span>{viewingIssue.acknowledged ? 'Yes' : 'Pending'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Converted</span>
                <span>
                  {viewingIssue.converted_to_order
                    ? `Yes (₹${Number(viewingIssue.order_value).toLocaleString()})`
                    : 'No'}
                </span>
              </div>
              {viewingIssue.notes && (
                <div className="border-t border-border pt-3">
                  <p className="text-sm text-muted-foreground">Notes:</p>
                  <p className="text-sm">{viewingIssue.notes}</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end mt-6">
              <button onClick={() => setViewingIssue(null)} className="btn-outline">
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
