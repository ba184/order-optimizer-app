import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, FileText, Video, Presentation as PresentationIcon, ArrowLeft, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  usePresentations,
  useCreatePresentation,
  useUpdatePresentation,
} from '@/hooks/usePresentationsData';

const typeOptions = [
  { value: 'ppt', label: 'PowerPoint (PPTX)', icon: PresentationIcon },
  { value: 'pdf', label: 'PDF Document', icon: FileText },
  { value: 'video', label: 'Video', icon: Video },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const typeAccept: Record<string, string> = {
  ppt: '.ppt,.pptx',
  pdf: '.pdf',
  video: '.mp4,.mov,.avi,.webm',
};

export default function PresentationFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const { data: presentations = [] } = usePresentations();
  const createMutation = useCreatePresentation();
  const updateMutation = useUpdatePresentation();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<string>('ppt');
  const [status, setStatus] = useState<string>('active');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditMode && presentations.length > 0) {
      const presentation = presentations.find(p => p.id === id);
      if (presentation) {
        setTitle(presentation.title);
        setType(presentation.type);
        setStatus(presentation.status);
        setDescription(presentation.description || '');
        setFileUrl(presentation.file_url);
        if (presentation.file_url) {
          const parts = presentation.file_url.split('/');
          setFileName(parts[parts.length - 1]);
        }
      }
    }
  }, [id, isEditMode, presentations]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      toast.error('File size exceeds 100MB limit');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('presentation-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('presentation-files')
        .getPublicUrl(filePath);

      setFileUrl(publicUrl);
      setFileName(file.name);
      toast.success('File uploaded successfully');
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFileUrl(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!type) {
      toast.error('Type is required');
      return;
    }

    try {
      if (isEditMode && id) {
        await updateMutation.mutateAsync({
          id,
          title: title.trim(),
          type: type as 'ppt' | 'pdf' | 'video',
          status: status as 'active' | 'inactive',
          description: description.trim() || undefined,
          file_url: fileUrl || undefined,
        });
        toast.success('Presentation updated successfully');
      } else {
        await createMutation.mutateAsync({
          title: title.trim(),
          type,
          status,
          description: description.trim() || undefined,
          file_url: fileUrl || undefined,
          duration: 0,
        });
        toast.success('Presentation created successfully');
      }
      navigate('/master/presentations');
    } catch (error) {
      console.error('Error saving presentation:', error);
      toast.error('Failed to save presentation');
    }
  };

  const selectedTypeOption = typeOptions.find(t => t.value === type);
  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/master/presentations')}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditMode ? 'Edit Presentation' : 'Create Presentation'}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? 'Update presentation details' : 'Add a new presentation'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter presentation title"
                    required
                  />
                </div>

                {/* Type & Status Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {typeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <option.icon size={16} />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Status *</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* File Upload Card */}
            <Card>
              <CardHeader>
                <CardTitle>Upload File</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Max file size: 100MB</p>
                {fileUrl ? (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    {selectedTypeOption && <selectedTypeOption.icon size={20} className="text-primary" />}
                    <span className="flex-1 text-sm truncate">{fileName}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={32} className="mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {uploading ? 'Uploading...' : 'Click to upload'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {typeAccept[type] || 'All file types'}
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept={typeAccept[type]}
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-3">
                  <Button type="submit" disabled={isLoading || uploading} className="w-full">
                    <Save size={16} className="mr-2" />
                    {isLoading ? 'Saving...' : isEditMode ? 'Update Presentation' : 'Create Presentation'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/master/presentations')}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
