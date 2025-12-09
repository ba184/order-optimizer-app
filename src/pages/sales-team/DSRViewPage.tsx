import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  User,
  MapPin,
  Phone,
  ShoppingCart,
  IndianRupee,
  FileText,
  Clock,
  Target,
  MessageSquare,
  Building2,
  Store,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';

const mockDSR = {
  id: 'dsr-001',
  date: '2024-12-09',
  employeeId: 'se-001',
  employeeName: 'Rajesh Kumar',
  employeePhone: '+91 98765 43210',
  visitType: 'visit',
  entityType: 'retailer',
  entityId: 'r-001',
  entityName: 'Sharma Store',
  entityAddress: 'Shop 12, Karol Bagh Market, New Delhi',
  zone: 'North Zone',
  city: 'New Delhi',
  area: 'Connaught Place',
  loginTime: '09:15 AM',
  logoutTime: '06:30 PM',
  totalDistance: 32.5,
  totalCalls: 15,
  productiveCalls: 12,
  ordersCount: 8,
  orderValue: 45000,
  collectionAmount: 25000,
  newRetailers: 2,
  complaints: 1,
  marketIntelligence: 'Competitor ABC launched new scheme with 10% extra discount. Local retailers showing interest in our new product line.',
  competitorActivity: 'XYZ brand running display scheme with free stands. Some retailers switching to cheaper alternatives.',
  remarks: 'Good day overall. Target likely to be achieved this month.',
  status: 'submitted',
  submittedAt: '2024-12-09 18:30',
};

export default function DSRViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">DSR Details</h1>
          <p className="text-muted-foreground">Daily Sales Report - {mockDSR.id}</p>
        </div>
        <StatusBadge status={mockDSR.status} />
      </div>

      {/* Employee & Date Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-primary-foreground"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <User size={28} />
            </div>
            <div>
              <p className="text-xl font-semibold">{mockDSR.employeeName}</p>
              <p className="text-sm text-primary-foreground/80">{mockDSR.employeeId}</p>
              <p className="text-sm text-primary-foreground/80">{mockDSR.employeePhone}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Calendar size={20} className="mx-auto mb-1" />
              <p className="font-semibold">{mockDSR.date}</p>
              <p className="text-xs text-primary-foreground/70">Date</p>
            </div>
            <div>
              <Clock size={20} className="mx-auto mb-1" />
              <p className="font-semibold">{mockDSR.loginTime}</p>
              <p className="text-xs text-primary-foreground/70">Login</p>
            </div>
            <div>
              <Clock size={20} className="mx-auto mb-1" />
              <p className="font-semibold">{mockDSR.logoutTime}</p>
              <p className="text-xs text-primary-foreground/70">Logout</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Entity Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border border-border p-6 shadow-sm"
      >
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          {mockDSR.entityType === 'retailer' ? (
            <Store size={20} className="text-secondary" />
          ) : (
            <Building2 size={20} className="text-primary" />
          )}
          Visit Details
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Entity Type</p>
            <p className="font-medium text-foreground capitalize">{mockDSR.entityType}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Visit Type</p>
            <p className="font-medium text-foreground capitalize">{mockDSR.visitType}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium text-foreground">{mockDSR.entityName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Address</p>
            <p className="font-medium text-foreground">{mockDSR.entityAddress}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Zone</p>
            <p className="font-medium text-foreground">{mockDSR.zone}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">City / Area</p>
            <p className="font-medium text-foreground">{mockDSR.city}, {mockDSR.area}</p>
          </div>
        </div>
      </motion.div>

      {/* Activity Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Phone size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{mockDSR.productiveCalls}/{mockDSR.totalCalls}</p>
              <p className="text-xs text-muted-foreground">Productive / Total Calls</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10">
              <ShoppingCart size={20} className="text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{mockDSR.ordersCount}</p>
              <p className="text-xs text-muted-foreground">Orders Placed</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <IndianRupee size={20} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">₹{(mockDSR.orderValue / 1000).toFixed(0)}K</p>
              <p className="text-xs text-muted-foreground">Order Value</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <IndianRupee size={20} className="text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">₹{(mockDSR.collectionAmount / 1000).toFixed(0)}K</p>
              <p className="text-xs text-muted-foreground">Collection</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Market Intelligence */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-xl border border-border p-6 shadow-sm"
      >
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Target size={20} className="text-primary" />
          Market Intelligence
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Market Feedback</p>
            <p className="text-foreground bg-muted/30 rounded-lg p-4">{mockDSR.marketIntelligence}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Competitor Activity</p>
            <p className="text-foreground bg-muted/30 rounded-lg p-4">{mockDSR.competitorActivity}</p>
          </div>
        </div>
      </motion.div>

      {/* Remarks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card rounded-xl border border-border p-6 shadow-sm"
      >
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <MessageSquare size={20} className="text-primary" />
          Additional Remarks
        </h3>
        <p className="text-foreground">{mockDSR.remarks}</p>
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Submitted at: <span className="text-foreground">{mockDSR.submittedAt}</span>
          </p>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="btn-outline">
          Back to List
        </button>
        <button onClick={() => window.print()} className="btn-primary">
          Print Report
        </button>
      </div>
    </div>
  );
}
