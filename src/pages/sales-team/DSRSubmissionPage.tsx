import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Phone,
  ShoppingCart,
  IndianRupee,
  Users,
  AlertCircle,
  Check,
  MapPin,
  Clock,
  Target,
  MessageSquare,
  Save,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';

export default function DSRSubmissionPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    totalCalls: '',
    productiveCalls: '',
    ordersCount: '',
    orderValue: '',
    collectionAmount: '',
    newRetailers: '',
    complaints: '',
    marketFeedback: '',
    competitorActivity: '',
    remarks: '',
  });

  const todayStats = {
    loginTime: '09:15 AM',
    logoutTime: '--',
    totalDistance: 32.5,
    visitedOutlets: 12,
    pendingVisits: 4,
  };

  const handleSubmit = (asDraft: boolean) => {
    if (!asDraft && (!formData.totalCalls || !formData.productiveCalls)) {
      toast.error('Please fill all mandatory fields');
      return;
    }
    
    if (asDraft) {
      toast.success('DSR saved as draft');
    } else {
      toast.success('DSR submitted successfully!');
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Daily Sales Report (DSR)</h1>
          <p className="text-muted-foreground">Submit your daily field activity report</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock size={16} />
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* Today's Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-primary-foreground"
      >
        <h3 className="font-semibold mb-4">Today's Field Activity</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{todayStats.loginTime}</p>
            <p className="text-xs text-primary-foreground/70">Login Time</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{todayStats.totalDistance} km</p>
            <p className="text-xs text-primary-foreground/70">Distance</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{todayStats.visitedOutlets}</p>
            <p className="text-xs text-primary-foreground/70">Visited</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{todayStats.pendingVisits}</p>
            <p className="text-xs text-primary-foreground/70">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{todayStats.logoutTime}</p>
            <p className="text-xs text-primary-foreground/70">Logout Time</p>
          </div>
        </div>
      </motion.div>

      {/* DSR Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border border-border p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <FileText size={20} className="text-primary" />
          Activity Summary
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Calls Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground flex items-center gap-2">
              <Phone size={16} className="text-secondary" />
              Calls & Visits
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Total Calls *</label>
                <input
                  type="number"
                  value={formData.totalCalls}
                  onChange={e => setFormData({ ...formData, totalCalls: e.target.value })}
                  placeholder="0"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Productive Calls *</label>
                <input
                  type="number"
                  value={formData.productiveCalls}
                  onChange={e => setFormData({ ...formData, productiveCalls: e.target.value })}
                  placeholder="0"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Orders Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground flex items-center gap-2">
              <ShoppingCart size={16} className="text-secondary" />
              Orders
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Orders Count</label>
                <input
                  type="number"
                  value={formData.ordersCount}
                  onChange={e => setFormData({ ...formData, ordersCount: e.target.value })}
                  placeholder="0"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Order Value (₹)</label>
                <input
                  type="number"
                  value={formData.orderValue}
                  onChange={e => setFormData({ ...formData, orderValue: e.target.value })}
                  placeholder="0"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Collection Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground flex items-center gap-2">
              <IndianRupee size={16} className="text-secondary" />
              Collections
            </h3>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Collection Amount (₹)</label>
              <input
                type="number"
                value={formData.collectionAmount}
                onChange={e => setFormData({ ...formData, collectionAmount: e.target.value })}
                placeholder="0"
                className="input-field"
              />
            </div>
          </div>

          {/* New Business Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground flex items-center gap-2">
              <Users size={16} className="text-secondary" />
              New Business
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">New Retailers</label>
                <input
                  type="number"
                  value={formData.newRetailers}
                  onChange={e => setFormData({ ...formData, newRetailers: e.target.value })}
                  placeholder="0"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Complaints</label>
                <input
                  type="number"
                  value={formData.complaints}
                  onChange={e => setFormData({ ...formData, complaints: e.target.value })}
                  placeholder="0"
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Market Intelligence */}
        <div className="mt-6 space-y-4">
          <h3 className="font-medium text-foreground flex items-center gap-2">
            <Target size={16} className="text-secondary" />
            Market Intelligence
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Market Feedback</label>
              <textarea
                value={formData.marketFeedback}
                onChange={e => setFormData({ ...formData, marketFeedback: e.target.value })}
                placeholder="Any feedback from retailers..."
                rows={3}
                className="input-field resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Competitor Activity</label>
              <textarea
                value={formData.competitorActivity}
                onChange={e => setFormData({ ...formData, competitorActivity: e.target.value })}
                placeholder="Competitor schemes, new products..."
                rows={3}
                className="input-field resize-none"
              />
            </div>
          </div>
        </div>

        {/* Remarks */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            <MessageSquare size={16} className="inline mr-2 text-secondary" />
            Additional Remarks
          </label>
          <textarea
            value={formData.remarks}
            onChange={e => setFormData({ ...formData, remarks: e.target.value })}
            placeholder="Any other observations or comments..."
            rows={3}
            className="input-field resize-none"
          />
        </div>

        {/* Warning */}
        <div className="mt-6 p-4 bg-warning/10 rounded-lg border border-warning/20">
          <p className="text-sm text-warning flex items-center gap-2">
            <AlertCircle size={16} />
            DSR submission is mandatory before logout. Incomplete DSR will affect your attendance.
          </p>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="btn-outline">
          Cancel
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => handleSubmit(true)} className="btn-outline flex items-center gap-2">
            <Save size={18} />
            Save Draft
          </button>
          <button onClick={() => handleSubmit(false)} className="btn-primary flex items-center gap-2">
            <Send size={18} />
            Submit DSR
          </button>
        </div>
      </div>
    </div>
  );
}
