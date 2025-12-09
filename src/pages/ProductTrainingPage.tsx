import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Plus,
  Presentation,
  Video,
  FileText,
  Image,
  Play,
  CheckCircle,
  Clock,
  Users,
  Award,
  Eye,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

interface ProductPresentation {
  id: string;
  title: string;
  product: string;
  type: 'ppt' | 'pdf' | 'video';
  duration: string;
  hasQuiz: boolean;
  quizQuestions?: number;
  createdAt: string;
  isActive: boolean;
}

interface PresentationLog {
  id: string;
  presentationId: string;
  presentationTitle: string;
  presentedBy: string;
  presentedTo: string;
  outletType: 'retailer' | 'distributor';
  presentedAt: string;
  duration: string;
  quizScore?: number;
  status: 'completed' | 'partial';
}

const mockPresentations: ProductPresentation[] = [
  { id: 'pres-001', title: 'Alpha Pro Launch Presentation', product: 'Alpha Pro Series', type: 'ppt', duration: '15 mins', hasQuiz: true, quizQuestions: 5, createdAt: '2024-12-01', isActive: true },
  { id: 'pres-002', title: 'Product Benefits Video', product: 'All Products', type: 'video', duration: '8 mins', hasQuiz: false, createdAt: '2024-11-15', isActive: true },
  { id: 'pres-003', title: 'Technical Specifications', product: 'Industrial Range', type: 'pdf', duration: '10 mins', hasQuiz: true, quizQuestions: 10, createdAt: '2024-10-20', isActive: true },
  { id: 'pres-004', title: 'Scheme Explanation Dec 2024', product: 'All Products', type: 'ppt', duration: '12 mins', hasQuiz: false, createdAt: '2024-12-01', isActive: true },
];

const mockPresentationLogs: PresentationLog[] = [
  { id: 'pl-001', presentationId: 'pres-001', presentationTitle: 'Alpha Pro Launch Presentation', presentedBy: 'Rajesh Kumar', presentedTo: 'New Sharma Store', outletType: 'retailer', presentedAt: '2024-12-09 10:30 AM', duration: '18 mins', quizScore: 4, status: 'completed' },
  { id: 'pl-002', presentationId: 'pres-002', presentationTitle: 'Product Benefits Video', presentedBy: 'Amit Sharma', presentedTo: 'Gupta General Store', outletType: 'retailer', presentedAt: '2024-12-09 11:00 AM', duration: '8 mins', status: 'completed' },
  { id: 'pl-003', presentationId: 'pres-001', presentationTitle: 'Alpha Pro Launch Presentation', presentedBy: 'Priya Singh', presentedTo: 'Krishna Traders', outletType: 'distributor', presentedAt: '2024-12-08 03:00 PM', duration: '20 mins', quizScore: 5, status: 'completed' },
  { id: 'pl-004', presentationId: 'pres-004', presentationTitle: 'Scheme Explanation Dec 2024', presentedBy: 'Vikram Patel', presentedTo: 'Jain Provision Store', outletType: 'retailer', presentedAt: '2024-12-08 02:00 PM', duration: '5 mins', status: 'partial' },
];

const typeIcons = {
  ppt: Presentation,
  pdf: FileText,
  video: Video,
};

const typeColors = {
  ppt: 'bg-warning/10 text-warning',
  pdf: 'bg-destructive/10 text-destructive',
  video: 'bg-info/10 text-info',
};

export default function ProductTrainingPage() {
  const [activeTab, setActiveTab] = useState<'presentations' | 'logs'>('presentations');

  const presentationColumns = [
    {
      key: 'title',
      header: 'Presentation',
      render: (item: ProductPresentation) => {
        const Icon = typeIcons[item.type];
        return (
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[item.type]}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="font-medium text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.product}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'type',
      header: 'Type',
      render: (item: ProductPresentation) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase ${typeColors[item.type]}`}>
          {item.type}
        </span>
      ),
    },
    { key: 'duration', header: 'Duration' },
    {
      key: 'hasQuiz',
      header: 'Quiz',
      render: (item: ProductPresentation) => (
        item.hasQuiz ? (
          <span className="flex items-center gap-1 text-success text-sm">
            <Award size={14} />
            {item.quizQuestions} questions
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">No quiz</span>
        )
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (item: ProductPresentation) => <StatusBadge status={item.isActive ? 'active' : 'inactive'} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: () => (
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Play size={16} className="text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Download size={16} className="text-muted-foreground" />
          </button>
        </div>
      ),
    },
  ];

  const logColumns = [
    {
      key: 'presentationTitle',
      header: 'Presentation',
      render: (item: PresentationLog) => (
        <p className="font-medium text-foreground">{item.presentationTitle}</p>
      ),
    },
    {
      key: 'presentedBy',
      header: 'Presented By',
    },
    {
      key: 'presentedTo',
      header: 'Outlet',
      render: (item: PresentationLog) => (
        <div>
          <p className="text-sm">{item.presentedTo}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            item.outletType === 'retailer' ? 'bg-info/10 text-info' : 'bg-primary/10 text-primary'
          }`}>
            {item.outletType}
          </span>
        </div>
      ),
    },
    {
      key: 'presentedAt',
      header: 'Date',
      render: (item: PresentationLog) => (
        <div>
          <p className="text-sm">{item.presentedAt.split(' ')[0]}</p>
          <p className="text-xs text-muted-foreground">{item.duration}</p>
        </div>
      ),
    },
    {
      key: 'quizScore',
      header: 'Quiz Score',
      render: (item: PresentationLog) => (
        item.quizScore !== undefined ? (
          <span className="flex items-center gap-1 text-success">
            <Award size={14} />
            {item.quizScore}/5
          </span>
        ) : (
          <span className="text-muted-foreground">--</span>
        )
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: PresentationLog) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          item.status === 'completed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
        }`}>
          {item.status === 'completed' ? 'Completed' : 'Partial'}
        </span>
      ),
    },
  ];

  const stats = {
    totalPresentations: mockPresentations.length,
    completedToday: mockPresentationLogs.filter(l => l.presentedAt.includes('2024-12-09')).length,
    completedThisMonth: mockPresentationLogs.length,
    avgQuizScore: 4.5,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Product Presentation & Training</h1>
          <p className="text-muted-foreground">Digital presentations with tracking and quizzes</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add Presentation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Presentation size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalPresentations}</p>
              <p className="text-sm text-muted-foreground">Presentations</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <CheckCircle size={24} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.completedToday}</p>
              <p className="text-sm text-muted-foreground">Completed Today</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-info/10">
              <Users size={24} className="text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.completedThisMonth}</p>
              <p className="text-sm text-muted-foreground">This Month</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <Award size={24} className="text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.avgQuizScore}/5</p>
              <p className="text-sm text-muted-foreground">Avg Quiz Score</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('presentations')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'presentations' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          Presentations
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'logs' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          Presentation Logs
        </button>
      </div>

      {/* Content */}
      {activeTab === 'presentations' ? (
        <DataTable data={mockPresentations} columns={presentationColumns} searchPlaceholder="Search presentations..." />
      ) : (
        <DataTable data={mockPresentationLogs} columns={logColumns} searchPlaceholder="Search logs..." />
      )}
    </div>
  );
}
