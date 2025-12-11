import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Plus,
  IndianRupee,
  Fuel,
  Hotel,
  Upload,
  Eye,
  CheckCircle,
  Clock,
  Download,
  MapPin,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  useExpenseClaims,
  useCreateExpenseClaim,
  useApproveExpenseClaim,
  useRejectExpenseClaim,
  ExpenseClaim,
} from '@/hooks/useExpensesData';

const cityCategories = {
  A: { cities: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'], da: 800 },
  B: { cities: ['Pune', 'Hyderabad', 'Ahmedabad', 'Jaipur', 'Lucknow'], da: 600 },
  C: { cities: ['Other cities'], da: 400 },
};

export default function ExpenseManagementPage() {
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [viewingClaim, setViewingClaim] = useState<ExpenseClaim | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [claimData, setClaimData] = useState({
    startDate: '',
    endDate: '',
    cityCategory: 'B',
    workingDays: 0,
    distanceTravelled: 0,
    hotelNights: 0,
    hotelAmount: 0,
    otherExpenses: 0,
    otherDescription: '',
  });

  const { data: expenses = [], isLoading } = useExpenseClaims(statusFilter);
  const createMutation = useCreateExpenseClaim();
  const approveMutation = useApproveExpenseClaim();
  const rejectMutation = useRejectExpenseClaim();

  const calculateDA = () =>
    claimData.workingDays * cityCategories[claimData.cityCategory as keyof typeof cityCategories].da;
  const calculateFuel = () => claimData.distanceTravelled * 5;
  const calculateTotal = () => calculateDA() + calculateFuel() + claimData.hotelAmount + claimData.otherExpenses;

  const handleSubmitClaim = () => {
    createMutation.mutate({
      start_date: claimData.startDate,
      end_date: claimData.endDate,
      city_category: claimData.cityCategory,
      working_days: claimData.workingDays,
      da_amount: calculateDA(),
      distance_travelled: claimData.distanceTravelled,
      fuel_amount: calculateFuel(),
      hotel_nights: claimData.hotelNights,
      hotel_amount: claimData.hotelAmount,
      other_amount: claimData.otherExpenses,
      other_description: claimData.otherDescription || undefined,
      total_amount: calculateTotal(),
    });
    setShowClaimModal(false);
    setClaimData({
      startDate: '',
      endDate: '',
      cityCategory: 'B',
      workingDays: 0,
      distanceTravelled: 0,
      hotelNights: 0,
      hotelAmount: 0,
      otherExpenses: 0,
      otherDescription: '',
    });
  };

  const formatPeriod = (startDate: string, endDate: string) => {
    try {
      return `${format(new Date(startDate), 'MMM d')} - ${format(new Date(endDate), 'd, yyyy')}`;
    } catch {
      return `${startDate} - ${endDate}`;
    }
  };

  const columns = [
    {
      key: 'claim_number',
      header: 'Claim #',
      render: (item: ExpenseClaim) => (
        <div>
          <p className="font-medium text-foreground">{item.claim_number}</p>
          <p className="text-xs text-muted-foreground">{formatPeriod(item.start_date, item.end_date)}</p>
        </div>
      ),
    },
    {
      key: 'user_name',
      header: 'Employee',
    },
    {
      key: 'da_amount',
      header: 'DA',
      render: (item: ExpenseClaim) => <span>₹{Number(item.da_amount).toLocaleString()}</span>,
    },
    {
      key: 'fuel_amount',
      header: 'Fuel',
      render: (item: ExpenseClaim) => <span>₹{Number(item.fuel_amount).toLocaleString()}</span>,
    },
    {
      key: 'hotel_amount',
      header: 'Hotel',
      render: (item: ExpenseClaim) => <span>₹{Number(item.hotel_amount).toLocaleString()}</span>,
    },
    {
      key: 'total_amount',
      header: 'Total',
      render: (item: ExpenseClaim) => (
        <span className="font-semibold text-primary">₹{Number(item.total_amount).toLocaleString()}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: ExpenseClaim) => <StatusBadge status={item.status as any} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: ExpenseClaim) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewingClaim(item)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Eye size={16} className="text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Download size={16} className="text-muted-foreground" />
          </button>
        </div>
      ),
    },
  ];

  const stats = {
    pending: expenses.filter((e) => e.status === 'pending').length,
    approved: expenses.filter((e) => e.status === 'approved').length,
    totalPending: expenses.filter((e) => e.status === 'pending').reduce((sum, e) => sum + Number(e.total_amount), 0),
    totalApproved: expenses.filter((e) => e.status === 'approved').reduce((sum, e) => sum + Number(e.total_amount), 0),
  };

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
          <h1 className="module-title">Expense & Allowance Management</h1>
          <p className="text-muted-foreground">TA/DA claims, fuel reimbursement, and expense tracking</p>
        </div>
        <button onClick={() => setShowClaimModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          New Claim
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <Clock size={24} className="text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending Claims</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <CheckCircle size={24} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <IndianRupee size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">₹{(stats.totalPending / 1000).toFixed(1)}K</p>
              <p className="text-sm text-muted-foreground">Pending Amount</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10">
              <IndianRupee size={24} className="text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">₹{(stats.totalApproved / 1000).toFixed(1)}K</p>
              <p className="text-sm text-muted-foreground">Approved Amount</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* DA Rate Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h3 className="font-semibold text-foreground mb-4">Daily Allowance Rates</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(cityCategories).map(([category, data]) => (
            <div key={category} className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm font-semibold">
                  Category {category}
                </span>
                <span className="text-lg font-bold text-foreground">₹{data.da}/day</span>
              </div>
              <p className="text-xs text-muted-foreground">{data.cities.join(', ')}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-4 flex items-center gap-2">
          <Fuel size={16} />
          Fuel Reimbursement: ₹5/km (auto-calculated from GPS tracking)
        </p>
      </motion.div>

      {/* Filter Tabs */}
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

      {/* Claims Table */}
      <DataTable data={expenses} columns={columns} searchPlaceholder="Search claims..." />

      {/* New Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-lg font-semibold text-foreground mb-6">New Expense Claim</h2>

            <div className="space-y-6">
              {/* Period */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
                  <input
                    type="date"
                    value={claimData.startDate}
                    onChange={(e) => setClaimData({ ...claimData, startDate: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
                  <input
                    type="date"
                    value={claimData.endDate}
                    onChange={(e) => setClaimData({ ...claimData, endDate: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              {/* DA Calculation */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <MapPin size={16} className="text-primary" />
                  Daily Allowance
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">City Category</label>
                    <select
                      value={claimData.cityCategory}
                      onChange={(e) => setClaimData({ ...claimData, cityCategory: e.target.value })}
                      className="input-field"
                    >
                      <option value="A">Category A (₹800/day)</option>
                      <option value="B">Category B (₹600/day)</option>
                      <option value="C">Category C (₹400/day)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Working Days</label>
                    <input
                      type="number"
                      value={claimData.workingDays}
                      onChange={(e) => setClaimData({ ...claimData, workingDays: parseInt(e.target.value) || 0 })}
                      className="input-field"
                    />
                  </div>
                </div>
                <p className="text-sm text-foreground mt-2">
                  DA Amount: <span className="font-semibold">₹{calculateDA().toLocaleString()}</span>
                </p>
              </div>

              {/* Fuel */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <Fuel size={16} className="text-primary" />
                  Fuel Reimbursement
                </h4>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Distance Travelled (km)</label>
                  <input
                    type="number"
                    value={claimData.distanceTravelled}
                    onChange={(e) =>
                      setClaimData({ ...claimData, distanceTravelled: parseInt(e.target.value) || 0 })
                    }
                    className="input-field"
                    placeholder="Auto-filled from GPS tracking"
                  />
                </div>
                <p className="text-sm text-foreground mt-2">
                  Fuel Amount: <span className="font-semibold">₹{calculateFuel().toLocaleString()}</span>
                </p>
              </div>

              {/* Hotel */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <Hotel size={16} className="text-primary" />
                  Hotel / Stay
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Number of Nights</label>
                    <input
                      type="number"
                      value={claimData.hotelNights}
                      onChange={(e) => setClaimData({ ...claimData, hotelNights: parseInt(e.target.value) || 0 })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Total Hotel Amount (₹)</label>
                    <input
                      type="number"
                      value={claimData.hotelAmount}
                      onChange={(e) => setClaimData({ ...claimData, hotelAmount: parseInt(e.target.value) || 0 })}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Other Expenses */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Other Expenses (₹)</label>
                <input
                  type="number"
                  value={claimData.otherExpenses}
                  onChange={(e) => setClaimData({ ...claimData, otherExpenses: parseInt(e.target.value) || 0 })}
                  className="input-field"
                />
                <textarea
                  value={claimData.otherDescription}
                  onChange={(e) => setClaimData({ ...claimData, otherDescription: e.target.value })}
                  placeholder="Description of other expenses..."
                  rows={2}
                  className="input-field mt-2 resize-none"
                />
              </div>

              {/* Bill Upload */}
              <div className="p-4 border-2 border-dashed border-border rounded-lg text-center">
                <Upload size={24} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-foreground">Upload Bills & Receipts</p>
                <p className="text-xs text-muted-foreground">PDF, JPG, PNG (Max 5MB each)</p>
              </div>

              {/* Total */}
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-foreground">Total Claim Amount</span>
                  <span className="text-2xl font-bold text-primary">₹{calculateTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowClaimModal(false)} className="btn-outline">
                Cancel
              </button>
              <button
                onClick={handleSubmitClaim}
                disabled={createMutation.isPending || !claimData.startDate || !claimData.endDate}
                className="btn-primary"
              >
                {createMutation.isPending ? 'Submitting...' : 'Submit Claim'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Claim Modal */}
      {viewingClaim && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-lg"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Expense Claim Details</h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Claim Number</span>
                <span className="font-medium">{viewingClaim.claim_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Employee</span>
                <span className="font-medium">{viewingClaim.user_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Period</span>
                <span className="font-medium">{formatPeriod(viewingClaim.start_date, viewingClaim.end_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={viewingClaim.status as any} />
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily Allowance</span>
                  <span>₹{Number(viewingClaim.da_amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fuel ({viewingClaim.distance_travelled} km)</span>
                  <span>₹{Number(viewingClaim.fuel_amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hotel ({viewingClaim.hotel_nights} nights)</span>
                  <span>₹{Number(viewingClaim.hotel_amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Other Expenses</span>
                  <span>₹{Number(viewingClaim.other_amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t border-border pt-2">
                  <span>Total</span>
                  <span className="text-primary">₹{Number(viewingClaim.total_amount).toLocaleString()}</span>
                </div>
              </div>

              {viewingClaim.other_description && (
                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground">Other Expenses Description:</p>
                  <p className="text-sm">{viewingClaim.other_description}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              {viewingClaim.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      rejectMutation.mutate({ id: viewingClaim.id, reason: 'Rejected by manager' });
                      setViewingClaim(null);
                    }}
                    className="btn-outline text-destructive"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      approveMutation.mutate(viewingClaim.id);
                      setViewingClaim(null);
                    }}
                    className="btn-primary"
                  >
                    Approve
                  </button>
                </>
              )}
              <button onClick={() => setViewingClaim(null)} className="btn-outline">
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
