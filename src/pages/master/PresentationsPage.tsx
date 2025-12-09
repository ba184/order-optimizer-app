import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Plus,
  GraduationCap,
  FileText,
  Video,
  Image,
  Eye,
  Edit,
  Trash2,
  Upload,
  Package,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface Presentation {
  id: string;
  title: string;
  productId: string;
  productName: string;
  type: 'ppt' | 'pdf' | 'video';
  description: string;
  duration: number;
  hasQuiz: boolean;
  quizQuestions: number;
  viewCount: number;
  completionRate: number;
  status: 'active' | 'inactive';
  createdAt: string;
  createdBy: string;
}

const mockPresentations: Presentation[] = [
  { id: 'pres-001', title: 'Alpha Series Product Training', productId: 'p-001', productName: 'Alpha Pro 500', type: 'ppt', description: 'Complete product training for Alpha Pro series', duration: 30, hasQuiz: true, quizQuestions: 10, viewCount: 156, completionRate: 78, status: 'active', createdAt: '2024-12-01', createdBy: 'Admin' },
  { id: 'pres-002', title: 'Beta Range Overview', productId: 'p-002', productName: 'Beta Max 1000', type: 'video', description: 'Video walkthrough of Beta range features', duration: 15, hasQuiz: true, quizQuestions: 5, viewCount: 89, completionRate: 92, status: 'active', createdAt: '2024-11-25', createdBy: 'Admin' },
  { id: 'pres-003', title: 'Gamma Plus Benefits', productId: 'p-003', productName: 'Gamma Plus', type: 'pdf', description: 'PDF guide on Gamma Plus benefits', duration: 20, hasQuiz: false, quizQuestions: 0, viewCount: 67, completionRate: 85, status: 'active', createdAt: '2024-11-20', createdBy: 'Admin' },
  { id: 'pres-004', title: 'New Product Launch 2024', productId: 'p-004', productName: 'Delta Series', type: 'ppt', description: 'Launch presentation for Delta series', duration: 45, hasQuiz: true, quizQuestions: 15, viewCount: 234, completionRate: 65, status: 'active', createdAt: '2024-11-15', createdBy: 'Admin' },
];

const mockProducts = [
  { id: 'p-001', name: 'Alpha Pro 500' },
  { id: 'p-002', name: 'Beta Max 1000' },
  { id: 'p-003', name: 'Gamma Plus' },
  { id: 'p-004', name: 'Delta Series' },
  { id: 'p-005', name: 'Sigma Elite' },
];

const typeIcons = {
  ppt: FileText,
  pdf: FileText,
  video: Video,
};

const typeColors = {
  ppt: 'bg-warning/10 text-warning',
  pdf: 'bg-destructive/10 text-destructive',
  video: 'bg-primary/10 text-primary',
};

export default function PresentationsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    productId: '',
    type: 'ppt',
    description: '',
    duration: '',
    hasQuiz: false,
    quizQuestions: [] as { question: string; options: string[]; correctAnswer: number }[],
  });

  const handleCreate = () => {
    if (!formData.title || !formData.productId) {
      toast.error('Please fill required fields');
      return;
    }
    toast.success('Presentation created successfully');
    setShowCreateModal(false);
    setFormData({ title: '', productId: '', type: 'ppt', description: '', duration: '', hasQuiz: false, quizQuestions: [] });
  };

  const columns = [
    {
      key: 'title',
      header: 'Presentation',
      render: (item: Presentation) => {
        const TypeIcon = typeIcons[item.type];
        return (
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[item.type]}`}>
              <TypeIcon size={20} />
            </div>
            <div>
              <p className="font-medium text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.id}</p>
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'productName',
      header: 'Product',
      render: (item: Presentation) => (
        <div className="flex items-center gap-2">
          <Package size={14} className="text-muted-foreground" />
          <span>{item.productName}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (item: Presentation) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeColors[item.type]}`}>
          {item.type.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (item: Presentation) => (
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-muted-foreground" />
          <span>{item.duration} mins</span>
        </div>
      ),
    },
    {
      key: 'hasQuiz',
      header: 'Quiz',
      render: (item: Presentation) => (
        item.hasQuiz ? (
          <div className="flex items-center gap-2">
            <HelpCircle size={14} className="text-success" />
            <span className="text-success">{item.quizQuestions} Qs</span>
          </div>
        ) : (
          <span className="text-muted-foreground">No Quiz</span>
        )
      ),
    },
    {
      key: 'stats',
      header: 'Stats',
      render: (item: Presentation) => (
        <div>
          <p className="text-sm">{item.viewCount} views</p>
          <p className="text-xs text-muted-foreground">{item.completionRate}% completion</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Presentation) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Presentation) => (
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Eye size={16} className="text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Edit size={16} className="text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
            <Trash2 size={16} className="text-destructive" />
          </button>
        </div>
      ),
    },
  ];

  const stats = {
    total: mockPresentations.length,
    active: mockPresentations.filter(p => p.status === 'active').length,
    withQuiz: mockPresentations.filter(p => p.hasQuiz).length,
    totalViews: mockPresentations.reduce((sum, p) => sum + p.viewCount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Presentation Master</h1>
          <p className="text-muted-foreground">Manage product presentations and training materials</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Create Presentation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <GraduationCap size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <GraduationCap size={24} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10">
              <HelpCircle size={24} className="text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.withQuiz}</p>
              <p className="text-sm text-muted-foreground">With Quiz</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <Eye size={24} className="text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalViews}</p>
              <p className="text-sm text-muted-foreground">Total Views</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Presentations Table */}
      <DataTable data={mockPresentations} columns={columns} searchPlaceholder="Search presentations..." />

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-lg font-semibold text-foreground mb-6">Create Presentation</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter presentation title"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Product *</label>
                  <select
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select Product</option>
                    {mockProducts.map((product) => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input-field"
                  >
                    <option value="ppt">PowerPoint (PPT)</option>
                    <option value="pdf">PDF Document</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="30"
                  className="input-field"
                />
              </div>

              {/* File Upload */}
              <div className="p-4 border-2 border-dashed border-border rounded-lg text-center">
                <Upload size={24} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-foreground">Upload Presentation File</p>
                <p className="text-xs text-muted-foreground">PPT, PDF, or Video (Max 100MB)</p>
              </div>

              {/* Quiz Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="hasQuiz"
                  checked={formData.hasQuiz}
                  onChange={(e) => setFormData({ ...formData, hasQuiz: e.target.checked })}
                  className="w-4 h-4 rounded border-border"
                />
                <label htmlFor="hasQuiz" className="text-sm font-medium text-foreground">
                  Add Quiz after presentation
                </label>
              </div>

              {formData.hasQuiz && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-foreground mb-2">Quiz Questions</p>
                  <p className="text-xs text-muted-foreground">Quiz builder will be available after saving the presentation</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="btn-outline">Cancel</button>
              <button onClick={handleCreate} className="btn-primary">Create</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
