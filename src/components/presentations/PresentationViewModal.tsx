import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Video, Presentation as PresentationIcon, Download, ExternalLink, Calendar, Eye } from 'lucide-react';
import { format } from 'date-fns';
import type { Presentation } from '@/hooks/usePresentationsData';

interface PresentationViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  presentation: Presentation | null;
}

const typeConfig = {
  ppt: { icon: PresentationIcon, label: 'PowerPoint', color: 'bg-warning/10 text-warning' },
  pdf: { icon: FileText, label: 'PDF Document', color: 'bg-destructive/10 text-destructive' },
  video: { icon: Video, label: 'Video', color: 'bg-info/10 text-info' },
};

export function PresentationViewModal({ isOpen, onClose, presentation }: PresentationViewModalProps) {
  if (!presentation) return null;

  const config = typeConfig[presentation.type] || typeConfig.pdf;
  const TypeIcon = config.icon;

  const handleOpenFile = () => {
    if (presentation.file_url) {
      window.open(presentation.file_url, '_blank');
    }
  };

  const handleDownload = () => {
    if (presentation.file_url) {
      const link = document.createElement('a');
      link.href = presentation.file_url;
      link.download = presentation.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Presentation Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with type icon */}
          <div className="flex items-start gap-4">
            <div className={`p-4 rounded-xl ${config.color}`}>
              <TypeIcon size={32} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">{presentation.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={config.color}>
                  {config.label}
                </Badge>
                <Badge variant={presentation.status === 'active' ? 'default' : 'secondary'}>
                  {presentation.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Description */}
          {presentation.description && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-sm text-foreground">{presentation.description}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Eye size={14} />
                <span className="text-xs">Views</span>
              </div>
              <p className="text-lg font-semibold">{presentation.view_count}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar size={14} />
                <span className="text-xs">Created</span>
              </div>
              <p className="text-sm font-medium">
                {format(new Date(presentation.created_at), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>

          {/* File Actions */}
          {presentation.file_url && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">File</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleOpenFile}>
                  <ExternalLink size={16} className="mr-2" />
                  Open File
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleDownload}>
                  <Download size={16} className="mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
