import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Video, Presentation as PresentationIcon, Download, ExternalLink, Calendar, ArrowLeft, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { usePresentations } from '@/hooks/usePresentationsData';

const typeConfig = {
  ppt: { icon: PresentationIcon, label: 'PowerPoint', color: 'bg-warning/10 text-warning' },
  pdf: { icon: FileText, label: 'PDF Document', color: 'bg-destructive/10 text-destructive' },
  video: { icon: Video, label: 'Video', color: 'bg-info/10 text-info' },
};

export default function PresentationViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: presentations = [], isLoading } = usePresentations();

  const presentation = presentations.find(p => p.id === id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!presentation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/master/presentations')}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Presentation Not Found</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">The requested presentation could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/master/presentations')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Presentation Details</h1>
            <p className="text-muted-foreground">View presentation information</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/master/presentations/edit/${presentation.id}`)}>
          <Pencil size={16} className="mr-2" />
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Header with type icon */}
              <div className="flex items-start gap-4">
                <div className={`p-4 rounded-xl ${config.color}`}>
                  <TypeIcon size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground">{presentation.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
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
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-foreground">{presentation.description}</p>
                </div>
              )}

              {/* Created Date */}
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Calendar size={20} className="text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {format(new Date(presentation.created_at), 'MMMM dd, yyyy')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* File Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>File</CardTitle>
            </CardHeader>
            <CardContent>
              {presentation.file_url ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <TypeIcon size={20} className="text-primary" />
                    <span className="flex-1 text-sm truncate">
                      {presentation.file_url.split('/').pop()}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" className="w-full" onClick={handleOpenFile}>
                      <ExternalLink size={16} className="mr-2" />
                      Open File
                    </Button>
                    <Button variant="outline" className="w-full" onClick={handleDownload}>
                      <Download size={16} className="mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No file uploaded</p>
              )}
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardContent className="pt-6">
              <Button
                variant="outline"
                onClick={() => navigate('/master/presentations')}
                className="w-full"
              >
                Back to List
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
