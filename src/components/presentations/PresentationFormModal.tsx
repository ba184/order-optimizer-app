import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, FileText, Video, Presentation as PresentationIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Presentation } from '@/hooks/usePresentationsData';

interface PresentationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    type: string;
    description?: string;
    file_url?: string;
  }) => void;
  presentation?: Presentation | null;
  isLoading?: boolean;
}

const typeOptions = [
  { value: 'ppt', label: 'PowerPoint (PPTX)', icon: PresentationIcon },
  { value: 'pdf', label: 'PDF Document', icon: FileText },
  { value: 'video', label: 'Video', icon: Video },
];

const typeAccept: Record<string, string> = {
  ppt: '.ppt,.pptx',
  pdf: '.pdf',
  video: '.mp4,.mov,.avi,.webm',
};

export function PresentationFormModal({
  isOpen,
  onClose,
  onSubmit,
  presentation,
  isLoading,
}: PresentationFormModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<string>('ppt');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!presentation;

  useEffect(() => {
    if (presentation) {
      setTitle(presentation.title);
      setType(presentation.type);
      setDescription(presentation.description || '');
      setFileUrl(presentation.file_url);
      if (presentation.file_url) {
        const parts = presentation.file_url.split('/');
        setFileName(parts[parts.length - 1]);
      }
    } else {
      resetForm();
    }
  }, [presentation, isOpen]);

  const resetForm = () => {
    setTitle('');
    setType('ppt');
    setDescription('');
    setFileUrl(null);
    setFileName(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (100MB max)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!type) {
      toast.error('Type is required');
      return;
    }

    onSubmit({
      title: title.trim(),
      type,
      description: description.trim() || undefined,
      file_url: fileUrl || undefined,
    });
  };

  const selectedTypeOption = typeOptions.find(t => t.value === type);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Presentation' : 'Create Presentation'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          {/* Type */}
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              rows={3}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Upload File (Max 100MB)</Label>
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
                  {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
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
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || uploading}>
              {isLoading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
