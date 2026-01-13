import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { usePresentations, useCreatePresentation, useDeletePresentation, Presentation } from '@/hooks/usePresentationsData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Plus,
  GraduationCap,
  FileText,
  Video,
  Eye,
  Edit,
  Trash2,
  Upload,
  Package,
  Clock,
  Loader2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

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
  const { data: presentations = [], isLoading } = usePresentations();
  const createPresentation = useCreatePresentation();
  const deletePresentation = useDeletePresentation();

  const { data: products = [] } = useQuery({
    queryKey: ['products-for-presentations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('id, name').eq('status', 'active');
      if (error) throw error;
      return data || [];
    },
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    product_id: '',
    type: 'ppt',
    description: '',
    duration: '',
  });

  const handleCreate = async () => {
    if (!formData.title) {
      toast.error('Please fill required fields');
      return;
    }
    await createPresentation.mutateAsync({
      title: formData.title,
      product_id: formData.product_id || undefined,
      type: formData.type,
      description: formData.description || undefined,
      duration: parseInt(formData.duration) || 0,
    });
    setShowCreateModal(false);
    setFormData({ title: '', product_id: '', type: 'ppt', description: '', duration: '' });
  };

  const handleDelete = async (id: string) => {
    await deletePresentation.mutateAsync(id);
  };

  const columns = [
    {
      key: 'title',
      header: 'Presentation',
      render: (item: Presentation) => {
        const TypeIcon = typeIcons[item.type as keyof typeof typeIcons] || FileText;
        return (
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[item.type as keyof typeof typeColors] || 'bg-muted'}`}>
              <TypeIcon size={20} />
            </div>
            <div>
              <p className="font-medium text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.id.slice(0, 8)}</p>
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'product',
      header: 'Product',
      render: (item: Presentation) => (
        <div className="flex items-center gap-2">
          <Package size={14} className="text-muted-foreground" />
          <span>{(item.product as any)?.name || '-'}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (item: Presentation) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeColors[item.type as keyof typeof typeColors] || 'bg-muted'}`}>
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
      key: 'stats',
      header: 'Stats',
      render: (item: Presentation) => (
        <div>
          <p className="text-sm">{item.view_count} views</p>
          <p className="text-xs text-muted-foreground">{item.completion_rate}% completion</p>
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
          <button 
            onClick={() => handleDelete(item.id)}
            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <Trash2 size={16} className="text-destructive" />
          </button>
        </div>
      ),
    },
  ];

  const stats = {
    total: presentations.length,
    active: presentations.filter(p => p.status === 'active').length,
    totalViews: presentations.reduce((sum, p) => sum + p.view_count, 0),
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

      <DataTable 
        data={presentations} 
        columns={columns} 
        searchPlaceholder="Search presentations..."
        emptyMessage="No presentations found. Create your first presentation to get started."
      />

      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Create Presentation</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-muted rounded-lg">
                <X size={20} />
              </button>
            </div>
            
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
                  <label className="block text-sm font-medium text-foreground mb-2">Product</label>
                  <select
                    value={formData.product_id}
                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select Product</option>
                    {products.map((product) => (
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

              <div className="p-4 border-2 border-dashed border-border rounded-lg text-center">
                <Upload size={24} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-foreground">Upload Presentation File</p>
                <p className="text-xs text-muted-foreground">PPT, PDF, or Video (Max 100MB)</p>
              </div>

            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="btn-outline">Cancel</button>
              <button 
                onClick={handleCreate} 
                disabled={createPresentation.isPending}
                className="btn-primary"
              >
                {createPresentation.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
