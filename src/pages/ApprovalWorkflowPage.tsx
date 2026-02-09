import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Plus,
  Settings,
  GitBranch,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Edit,
  ArrowRight,
  Users,
  FileText,
  ShoppingCart,
  Building2,
  Wallet,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

interface ApprovalWorkflow {
  id: string;
  name: string;
  type: 'distributor' | 'order' | 'expense' | 'leave' | 'claim' | 'retailer';
  steps: ApprovalStep[];
  isActive: boolean;
  createdAt: string;
}

interface ApprovalStep {
  level: number;
  role: string;
  condition?: string;
  autoEscalate: number; // hours
}

interface PendingApproval {
  id: string;
  type: string;
  reference: string;
  description: string;
  amount?: number;
  submittedBy: string;
  submittedAt: string;
  currentStep: number;
  totalSteps: number;
  currentApprover: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
}

const mockWorkflows: ApprovalWorkflow[] = [
  {
    id: 'wf-001',
    name: 'New Distributor Onboarding',
    type: 'distributor',
    steps: [
      { level: 1, role: 'Manager', autoEscalate: 24 },
      { level: 2, role: 'Credit Team', autoEscalate: 48 },
      { level: 3, role: 'Accounts', autoEscalate: 48 },
      { level: 4, role: 'Admin', autoEscalate: 48 },
    ],
    isActive: true,
    createdAt: '2024-01-15',
  },
  {
    id: 'wf-002',
    name: 'High Value Order (>₹5L)',
    type: 'order',
    steps: [
      { level: 1, role: 'Manager', condition: 'Order > ₹2L', autoEscalate: 4 },
      { level: 2, role: 'Admin', condition: 'Order > ₹5L', autoEscalate: 8 },
    ],
    isActive: true,
    createdAt: '2024-01-15',
  },
  {
    id: 'wf-003',
    name: 'Expense Claim',
    type: 'expense',
    steps: [
      { level: 1, role: 'Manager', autoEscalate: 24 },
      { level: 2, role: 'Accounts', condition: 'Amount > ₹5000', autoEscalate: 48 },
    ],
    isActive: true,
    createdAt: '2024-01-15',
  },
  {
    id: 'wf-004',
    name: 'Leave Request',
    type: 'leave',
    steps: [
      { level: 1, role: 'Manager', autoEscalate: 12 },
      { level: 2, role: 'HR', condition: 'Days > 3', autoEscalate: 24 },
    ],
    isActive: true,
    createdAt: '2024-01-15',
  },
];

const mockPendingApprovals: PendingApproval[] = [
  {
    id: 'pa-001',
    type: 'Distributor',
    reference: 'DIST-NEW-001',
    description: 'New Distributor: Krishna Traders Pvt Ltd',
    amount: 500000,
    submittedBy: 'Rajesh Kumar',
    submittedAt: '2024-12-08 10:30 AM',
    currentStep: 2,
    totalSteps: 4,
    currentApprover: 'Manager',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'pa-002',
    type: 'Order',
    reference: 'ORD-2024-0156',
    description: 'Primary Order: Sharma Distributors',
    amount: 750000,
    submittedBy: 'Amit Sharma',
    submittedAt: '2024-12-09 09:15 AM',
    currentStep: 1,
    totalSteps: 2,
    currentApprover: 'Manager',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'pa-003',
    type: 'Expense',
    reference: 'EXP-2024-089',
    description: 'Travel Claim: Dec 1-7',
    amount: 12500,
    submittedBy: 'Priya Singh',
    submittedAt: '2024-12-08 04:00 PM',
    currentStep: 1,
    totalSteps: 2,
    currentApprover: 'Manager',
    status: 'pending',
    priority: 'medium',
  },
  {
    id: 'pa-004',
    type: 'Leave',
    reference: 'LV-2024-045',
    description: 'Earned Leave: 5 days',
    submittedBy: 'Vikram Patel',
    submittedAt: '2024-12-07 11:00 AM',
    currentStep: 2,
    totalSteps: 2,
    currentApprover: 'HR',
    status: 'pending',
    priority: 'low',
  },
];

const typeIcons: Record<string, React.ElementType> = {
  Distributor: Building2,
  Order: ShoppingCart,
  Expense: Wallet,
  Leave: FileText,
  Claim: FileText,
  Retailer: Building2,
};

const priorityColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-warning/10 text-warning',
  high: 'bg-destructive/10 text-destructive',
};

export default function ApprovalWorkflowPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'workflows'>('pending');

  const handleApprove = (id: string) => {
    toast.success('Approved successfully');
  };

  const handleReject = (id: string) => {
    toast.success('Rejected with notification');
  };

  const pendingColumns = [
    {
      key: 'reference',
      header: 'Reference',
      render: (item: PendingApproval) => {
        const Icon = typeIcons[item.type] || FileText;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{item.reference}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[item.priority]}`}>
                {item.priority}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'description',
      header: 'Description',
      render: (item: PendingApproval) => (
        <div>
          <p className="text-sm">{item.description}</p>
          {item.amount && (
            <p className="text-xs text-muted-foreground">₹{item.amount.toLocaleString()}</p>
          )}
        </div>
      ),
    },
    {
      key: 'submittedBy',
      header: 'Submitted By',
      render: (item: PendingApproval) => (
        <div>
          <p className="text-sm">{item.submittedBy}</p>
          <p className="text-xs text-muted-foreground">{item.submittedAt}</p>
        </div>
      ),
    },
    {
      key: 'progress',
      header: 'Progress',
      render: (item: PendingApproval) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden w-20">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${(item.currentStep / item.totalSteps) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {item.currentStep}/{item.totalSteps}
          </span>
        </div>
      ),
    },
    {
      key: 'currentApprover',
      header: 'Pending With',
      render: (item: PendingApproval) => (
        <span className="px-2.5 py-1 bg-warning/10 text-warning rounded-full text-xs font-medium">
          {item.currentApprover}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: PendingApproval) => (
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="View">
            <Eye size={16} className="text-muted-foreground" />
          </button>
          <button
            onClick={() => handleApprove(item.id)}
            className="p-2 hover:bg-success/10 rounded-lg transition-colors"
            title="Approve"
          >
            <CheckCircle size={16} className="text-success" />
          </button>
          <button
            onClick={() => handleReject(item.id)}
            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
            title="Reject"
          >
            <XCircle size={16} className="text-destructive" />
          </button>
        </div>
      ),
    },
  ];

  const stats = {
    pending: mockPendingApprovals.length,
    highPriority: mockPendingApprovals.filter(p => p.priority === 'high').length,
    workflows: mockWorkflows.filter(w => w.isActive).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Approval Workflow</h1>
          <p className="text-muted-foreground">Manage approvals and workflow configurations</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Configure Workflow
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <Clock size={24} className="text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending Approvals</p>
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
            <div className="p-3 rounded-xl bg-destructive/10">
              <AlertTriangle size={24} className="text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.highPriority}</p>
              <p className="text-sm text-muted-foreground">High Priority</p>
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
            <div className="p-3 rounded-xl bg-success/10">
              <GitBranch size={24} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.workflows}</p>
              <p className="text-sm text-muted-foreground">Active Workflows</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'pending' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          Pending Approvals ({stats.pending})
        </button>
        <button
          onClick={() => setActiveTab('workflows')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'workflows' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          Workflow Config
        </button>
      </div>

      {/* Content */}
      {activeTab === 'pending' ? (
        <DataTable
          data={mockPendingApprovals}
          columns={pendingColumns}
          searchPlaceholder="Search approvals..."
        />
      ) : (
        <div className="grid gap-4">
          {mockWorkflows.map((workflow, index) => (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-xl border border-border p-6 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{workflow.name}</h3>
                    <StatusBadge status={workflow.isActive ? 'active' : 'inactive'} />
                  </div>
                  <p className="text-sm text-muted-foreground capitalize">{workflow.type} Approval</p>
                </div>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <Edit size={16} className="text-muted-foreground" />
                </button>
              </div>

              {/* Workflow Steps */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {workflow.steps.map((step, stepIndex) => (
                  <div key={stepIndex} className="flex items-center">
                    <div className="flex flex-col items-center min-w-[100px]">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">{step.level}</span>
                      </div>
                      <p className="text-sm font-medium text-foreground mt-2">{step.role}</p>
                      {step.condition && (
                        <p className="text-xs text-muted-foreground text-center">{step.condition}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Escalate: {step.autoEscalate}h
                      </p>
                    </div>
                    {stepIndex < workflow.steps.length - 1 && (
                      <ArrowRight size={20} className="text-muted-foreground mx-2" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
