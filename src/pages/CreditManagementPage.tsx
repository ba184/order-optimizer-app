import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  CreditCard,
  IndianRupee,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  Eye,
  Edit,
  Phone,
  Calendar,
} from 'lucide-react';

interface CreditAccount {
  id: string;
  code: string;
  name: string;
  type: 'distributor';
  creditLimit: number;
  outstanding: number;
  overdue: number;
  lastPayment: string;
  lastPaymentAmount: number;
  creditDays: number;
  status: 'active' | 'pending' | 'inactive';
}

const mockAccounts: CreditAccount[] = [
  { id: 'ca-001', code: 'DIST-DEL-001', name: 'Krishna Traders', type: 'distributor', creditLimit: 500000, outstanding: 125000, overdue: 0, lastPayment: '2024-12-05', lastPaymentAmount: 75000, creditDays: 30, status: 'active' },
  { id: 'ca-002', code: 'DIST-DEL-002', name: 'Sharma Distributors', type: 'distributor', creditLimit: 750000, outstanding: 450000, overdue: 85000, lastPayment: '2024-11-28', lastPaymentAmount: 120000, creditDays: 45, status: 'active' },
  { id: 'ca-003', code: 'DIST-MUM-001', name: 'Patel Trading Co', type: 'distributor', creditLimit: 1000000, outstanding: 680000, overdue: 0, lastPayment: '2024-12-08', lastPaymentAmount: 200000, creditDays: 30, status: 'active' },
  { id: 'ca-004', code: 'DIST-CHE-001', name: 'Gupta Enterprises', type: 'distributor', creditLimit: 600000, outstanding: 520000, overdue: 145000, lastPayment: '2024-11-15', lastPaymentAmount: 50000, creditDays: 30, status: 'active' },
  { id: 'ca-005', code: 'DIST-KOL-001', name: 'Singh & Sons', type: 'distributor', creditLimit: 400000, outstanding: 95000, overdue: 0, lastPayment: '2024-12-07', lastPaymentAmount: 85000, creditDays: 30, status: 'active' },
];

const formatCurrency = (value: number) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
};

const columns = [
  {
    key: 'name',
    header: 'Account',
    render: (item: CreditAccount) => (
      <div>
        <p className="font-medium text-foreground">{item.name}</p>
        <p className="text-xs text-muted-foreground">{item.code}</p>
      </div>
    ),
  },
  {
    key: 'creditLimit',
    header: 'Credit Limit',
    render: (item: CreditAccount) => (
      <div>
        <p className="font-medium">{formatCurrency(item.creditLimit)}</p>
        <p className="text-xs text-muted-foreground">{item.creditDays} days</p>
      </div>
    ),
  },
  {
    key: 'outstanding',
    header: 'Outstanding',
    render: (item: CreditAccount) => {
      const utilization = (item.outstanding / item.creditLimit) * 100;
      return (
        <div>
          <p className={`font-medium ${utilization > 80 ? 'text-destructive' : ''}`}>
            {formatCurrency(item.outstanding)}
          </p>
          <div className="w-full h-1.5 bg-muted rounded-full mt-1">
            <div
              className={`h-full rounded-full ${
                utilization > 80 ? 'bg-destructive' : utilization > 60 ? 'bg-warning' : 'bg-success'
              }`}
              style={{ width: `${Math.min(utilization, 100)}%` }}
            />
          </div>
        </div>
      );
    },
  },
  {
    key: 'overdue',
    header: 'Overdue',
    render: (item: CreditAccount) => (
      item.overdue > 0 ? (
        <span className="text-destructive font-medium flex items-center gap-1">
          <AlertTriangle size={14} />
          {formatCurrency(item.overdue)}
        </span>
      ) : (
        <span className="text-success flex items-center gap-1">
          <CheckCircle size={14} />
          Clear
        </span>
      )
    ),
  },
  {
    key: 'lastPayment',
    header: 'Last Payment',
    render: (item: CreditAccount) => (
      <div>
        <p className="text-sm">{formatCurrency(item.lastPaymentAmount)}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar size={12} />
          {item.lastPayment}
        </p>
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (item: CreditAccount) => <StatusBadge status={item.status} />,
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
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <Phone size={16} className="text-muted-foreground" />
        </button>
      </div>
    ),
  },
];

export default function CreditManagementPage() {
  const stats = {
    totalCreditLimit: mockAccounts.reduce((sum, a) => sum + a.creditLimit, 0),
    totalOutstanding: mockAccounts.reduce((sum, a) => sum + a.outstanding, 0),
    totalOverdue: mockAccounts.reduce((sum, a) => sum + a.overdue, 0),
    overdueAccounts: mockAccounts.filter(a => a.overdue > 0).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Credit Management</h1>
          <p className="text-muted-foreground">Monitor credit limits, outstanding, and collections</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <CreditCard size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalCreditLimit)}</p>
              <p className="text-sm text-muted-foreground">Total Credit</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <IndianRupee size={24} className="text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalOutstanding)}</p>
              <p className="text-sm text-muted-foreground">Outstanding</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/10">
              <AlertTriangle size={24} className="text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalOverdue)}</p>
              <p className="text-sm text-muted-foreground">Overdue</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/10">
              <Clock size={24} className="text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.overdueAccounts}</p>
              <p className="text-sm text-muted-foreground">Overdue Accounts</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Credit Utilization Overview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h3 className="font-semibold text-foreground mb-4">Credit Utilization Overview</h3>
        <div className="h-8 bg-muted rounded-lg overflow-hidden flex">
          <div
            className="bg-success h-full transition-all"
            style={{ width: `${((stats.totalCreditLimit - stats.totalOutstanding) / stats.totalCreditLimit) * 100}%` }}
          />
          <div
            className="bg-warning h-full transition-all"
            style={{ width: `${((stats.totalOutstanding - stats.totalOverdue) / stats.totalCreditLimit) * 100}%` }}
          />
          <div
            className="bg-destructive h-full transition-all"
            style={{ width: `${(stats.totalOverdue / stats.totalCreditLimit) * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-muted-foreground">Available ({formatCurrency(stats.totalCreditLimit - stats.totalOutstanding)})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-muted-foreground">Current ({formatCurrency(stats.totalOutstanding - stats.totalOverdue)})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Overdue ({formatCurrency(stats.totalOverdue)})</span>
          </div>
        </div>
      </motion.div>

      {/* Accounts Table */}
      <DataTable data={mockAccounts} columns={columns} searchPlaceholder="Search accounts..." />
    </div>
  );
}
