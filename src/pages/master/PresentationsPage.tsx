import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import {
  Plus,
  Presentation as PresentationIcon,
  Video,
  FileText,
  Eye,
  Pencil,
  Trash2,
  FileUp,
} from 'lucide-react';
import {
  usePresentations,
  useDeletePresentation,
  type Presentation,
} from '@/hooks/usePresentationsData';

const typeConfig = {
  ppt: { icon: PresentationIcon, label: 'PPTX', color: 'bg-warning/10 text-warning' },
  pdf: { icon: FileText, label: 'PDF', color: 'bg-destructive/10 text-destructive' },
  video: { icon: Video, label: 'Video', color: 'bg-info/10 text-info' },
};

export default function PresentationsPage() {
  const navigate = useNavigate();
  const { data: presentations = [], isLoading } = usePresentations();
  const deleteMutation = useDeletePresentation();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPresentation, setSelectedPresentation] = useState<Presentation | null>(null);

  // KPIs
  const totalPresentations = presentations.length;
  const activePresentations = presentations.filter(p => p.status === 'active').length;
  const inactivePresentations = presentations.filter(p => p.status === 'inactive').length;

  const handleCreate = () => {
    navigate('/master/presentations/new');
  };

  const handleEdit = (presentation: Presentation) => {
    navigate(`/master/presentations/edit/${presentation.id}`);
  };

  const handleView = (presentation: Presentation) => {
    navigate(`/master/presentations/view/${presentation.id}`);
  };

  const handleDeleteClick = (presentation: Presentation) => {
    setSelectedPresentation(presentation);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedPresentation) {
      await deleteMutation.mutateAsync(selectedPresentation.id);
      setIsDeleteOpen(false);
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Presentation',
      render: (item: Presentation) => {
        const config = typeConfig[item.type] || typeConfig.pdf;
        const Icon = config.icon;
        return (
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="font-medium text-foreground">{item.title}</p>
              {item.description && (
                <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'type',
      header: 'Type',
      render: (item: Presentation) => {
        const config = typeConfig[item.type] || typeConfig.pdf;
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase ${config.color}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      key: 'file_url',
      header: 'File',
      render: (item: Presentation) => (
        item.file_url ? (
          <span className="flex items-center gap-1 text-success text-sm">
            <FileUp size={14} />
            Uploaded
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">No file</span>
        )
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
          <button
            onClick={(e) => { e.stopPropagation(); handleView(item); }}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="View"
          >
            <Eye size={16} className="text-muted-foreground" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Edit"
          >
            <Pencil size={16} className="text-muted-foreground" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteClick(item); }}
            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={16} className="text-destructive" />
          </button>
        </div>
      ),
    },
  ];

  const kpiCards = [
    { title: 'Total Presentations', value: totalPresentations, icon: PresentationIcon, color: 'bg-primary/10 text-primary' },
    { title: 'Active', value: activePresentations, icon: FileText, color: 'bg-success/10 text-success' },
    { title: 'Inactive', value: inactivePresentations, icon: FileText, color: 'bg-muted text-muted-foreground' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Presentations</h1>
          <p className="text-muted-foreground">Manage presentation materials</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={handleCreate}>
          <Plus size={18} />
          Add Presentation
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="stat-card"
          >
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${kpi.color}`}>
                <kpi.icon size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <DataTable
        data={presentations}
        columns={columns}
        searchPlaceholder="Search presentations..."
        emptyMessage={isLoading ? 'Loading presentations...' : 'No presentations found'}
      />

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Presentation"
        message={`Are you sure you want to delete "${selectedPresentation?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
