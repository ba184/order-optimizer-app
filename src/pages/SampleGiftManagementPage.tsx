import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Plus,
  Gift,
  Eye,
  Edit,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  useSamples,
  useSampleIssues,
  useCreateSample,
  useIssueSample,
  useApproveSampleIssue,
  useRejectSampleIssue,
  useEmployeesForSamples,
  Sample,
  SampleIssue,
} from '@/hooks/useSamplesData';
import { useWarehouses } from '@/hooks/useWarehousesData';
import { useAuth } from '@/contexts/AuthContext';

export default function SampleGiftManagementPage() {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'admin' || (userRole as any)?.code === 'admin';
  
  const [activeTab, setActiveTab] = useState<'gifts' | 'issues'>('gifts');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingIssue, setViewingIssue] = useState<SampleIssue | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  const [issueData, setIssueData] = useState({
    employee_id: '',
    items: [] as { sample_id: string; quantity: number }[],
    remarks: '',
  });

  const [giftData, setGiftData] = useState({
    sku: '',
    name: '',
    cost_price: 0,
    stock: 0,
    warehouse: '',
    description: '',
    status: 'active',
  });

  const { data: allItems = [], isLoading: loadingItems } = useSamples();
  const { data: issues = [], isLoading: loadingIssues } = useSampleIssues(statusFilter);
  const { data: employees = [] } = useEmployeesForSamples();
  const { data: warehouses = [] } = useWarehouses();
  
  // Filter only gifts
  const gifts = allItems.filter(item => item.type === 'gift');
  
  const createGiftMutation = useCreateSample();
  const issueMutation = useIssueSample();
  const approveMutation = useApproveSampleIssue();
  const rejectMutation = useRejectSampleIssue();

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
          setIssueData({ employee_id: '', items: [], remarks: '' });
        },
      }
    );
  };

  const handleCreateGift = () => {
    createGiftMutation.mutate({
      sku: giftData.sku,
      name: giftData.name,
      type: 'gift', // Always gift
      cost_price: giftData.cost_price,
      stock: giftData.stock,
      description: giftData.description || undefined,
    }, {
      onSuccess: () => {
        setShowCreateModal(false);
        setGiftData({ sku: '', name: '', cost_price: 0, stock: 0, warehouse: '', description: '', status: 'active' });
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

  const addItemToIssue = (giftId: string) => {
    if (issueData.items.find(i => i.sample_id === giftId)) return;
    setIssueData({
      ...issueData,
      items: [...issueData.items, { sample_id: giftId, quantity: 1 }],
    });
  };

  const updateItemQuantity = (giftId: string, quantity: number) => {
    setIssueData({
      ...issueData,
      items: issueData.items.map(i => 
        i.sample_id === giftId ? { ...i, quantity: Math.max(1, quantity) } : i
      ),
    });
  };

  const removeItemFromIssue = (giftId: string) => {
    setIssueData({
      ...issueData,
      items: issueData.items.filter(i => i.sample_id !== giftId),
    });
  };

  const giftColumns = [
    {
      key: 'name',
      header: 'Gift Name',
      render: (item: Sample) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
            <Gift size={20} className="text-secondary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.sku}</p>
          </div>
        </div>
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
      header: 'Executive Name',
      render: (item: SampleIssue) => <span>{item.issued_to_name}</span>,
    },
    {
      key: 'sample_name',
      header: 'Gift Name',
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


  if (loadingItems || loadingIssues) {
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
          <h1 className="module-title">Gift Management</h1>
          <p className="text-muted-foreground">Manage gift stock and issue gifts to executives</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCreateModal(true)} className="btn-outline flex items-center gap-2">
            <Plus size={18} />
            Add Gift
          </button>
          <button onClick={() => setShowIssueModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Issue Gift
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('gifts')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'gifts' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          Gift Stock
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
      {activeTab === 'gifts' ? (
        <DataTable data={gifts} columns={giftColumns} searchPlaceholder="Search gifts..." />
      ) : (
        <DataTable data={issues} columns={issueColumns} searchPlaceholder="Search issues..." />
      )}

      {/* Create Gift Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Add Gift Item</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Gift Name *</label>
                <input
                  type="text"
                  value={giftData.name}
                  onChange={(e) => setGiftData({ ...giftData, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., T-Shirt, Hoodie, Cap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Gift Code *</label>
                <input
                  type="text"
                  value={giftData.sku}
                  onChange={(e) => setGiftData({ ...giftData, sku: e.target.value })}
                  className="input-field"
                  placeholder="e.g., GFT-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Warehouse *</label>
                <select
                  value={giftData.warehouse}
                  onChange={(e) => setGiftData({ ...giftData, warehouse: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select Warehouse</option>
                  {warehouses.filter(w => w.status === 'active').map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Quantity *</label>
                <input
                  type="number"
                  value={giftData.stock || ''}
                  onChange={(e) => setGiftData({ ...giftData, stock: parseInt(e.target.value) || 0 })}
                  className="input-field"
                  placeholder="Enter quantity"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Status *</label>
                <select
                  value={giftData.status}
                  onChange={(e) => setGiftData({ ...giftData, status: e.target.value })}
                  className="input-field"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  value={giftData.description}
                  onChange={(e) => setGiftData({ ...giftData, description: e.target.value })}
                  rows={2}
                  className="input-field resize-none"
                  placeholder="Optional description (e.g., size, color)"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 btn-outline">
                Cancel
              </button>
              <button
                onClick={handleCreateGift}
                disabled={createGiftMutation.isPending || !giftData.name || !giftData.sku || !giftData.warehouse}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {createGiftMutation.isPending ? 'Creating...' : 'Create Gift'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Issue Gift Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Issue Gift to Executive</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Executive *</label>
                <select
                  value={issueData.employee_id}
                  onChange={(e) => setIssueData({ ...issueData, employee_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select Executive</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Select Gifts *</label>
                <select
                  onChange={(e) => {
                    if (e.target.value) addItemToIssue(e.target.value);
                    e.target.value = '';
                  }}
                  className="input-field"
                >
                  <option value="">Add gift...</option>
                  {gifts
                    .filter(g => g.status === 'active' && !issueData.items.find(i => i.sample_id === g.id))
                    .map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} (Stock: {g.stock})
                      </option>
                    ))}
                </select>
              </div>

              {issueData.items.length > 0 && (
                <div className="space-y-2">
                  {issueData.items.map((item) => {
                    const gift = gifts.find(g => g.id === item.sample_id);
                    return (
                      <div key={item.sample_id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{gift?.name}</p>
                          <p className="text-xs text-muted-foreground">Available: {gift?.stock}</p>
                        </div>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(item.sample_id, parseInt(e.target.value) || 1)}
                          min={1}
                          max={gift?.stock}
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
                <span className="text-muted-foreground">Executive</span>
                <span className="font-medium">{viewingIssue.issued_to_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gift</span>
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
