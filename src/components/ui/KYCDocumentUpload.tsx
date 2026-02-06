import { useState, useRef } from 'react';
import { Upload, X, FileText, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface KYCDocument {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'pdf';
}

interface KYCDocumentUploadProps {
  bucket: string;
  folder?: string;
  documents: KYCDocument[];
  onChange: (documents: KYCDocument[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  label?: string;
  required?: boolean;
}

export function KYCDocumentUpload({
  bucket,
  folder = 'kyc',
  documents,
  onChange,
  maxFiles = 5,
  maxSizeMB = 10,
  label = 'KYC Documents',
  required = false,
}: KYCDocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxFiles - documents.length;
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${maxFiles} documents allowed`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setUploading(true);

    try {
      const uploadedDocs: KYCDocument[] = [];

      for (const file of filesToUpload) {
        const isImage = file.type.startsWith('image/');
        const isPDF = file.type === 'application/pdf';
        
        if (!isImage && !isPDF) {
          toast.error(`${file.name} - Only images and PDFs are allowed`);
          continue;
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
          toast.error(`${file.name} exceeds ${maxSizeMB}MB limit`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        uploadedDocs.push({
          id: Date.now().toString() + Math.random().toString(36).substring(7),
          name: file.name,
          url: publicUrl,
          type: isImage ? 'image' : 'pdf',
        });
      }

      if (uploadedDocs.length > 0) {
        onChange([...documents, ...uploadedDocs]);
        toast.success(`${uploadedDocs.length} document(s) uploaded`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload documents');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (id: string) => {
    const newDocs = documents.filter(doc => doc.id !== id);
    onChange(newDocs);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>

      {/* Uploaded Documents Preview */}
      {documents.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {documents.map((doc) => (
            <div key={doc.id} className="relative group p-3 bg-muted/30 rounded-lg border border-border">
              {doc.type === 'image' ? (
                <img
                  src={doc.url}
                  alt={doc.name}
                  className="w-full h-20 object-cover rounded mb-2"
                />
              ) : (
                <div className="w-full h-20 bg-muted rounded flex items-center justify-center mb-2">
                  <FileText size={32} className="text-muted-foreground" />
                </div>
              )}
              <p className="text-xs text-foreground truncate">{doc.name}</p>
              <button
                type="button"
                onClick={() => handleRemove(doc.id)}
                className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-2 right-2 text-xs text-primary underline opacity-0 group-hover:opacity-100 transition-opacity"
              >
                View
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {documents.length < maxFiles && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-6 border-2 border-dashed border-border rounded-lg text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          {uploading ? (
            <Loader2 size={28} className="mx-auto text-primary animate-spin mb-2" />
          ) : (
            <Upload size={28} className="mx-auto text-muted-foreground mb-2" />
          )}
          <p className="text-sm text-foreground font-medium">
            {uploading ? 'Uploading...' : 'Click to upload KYC documents'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Images or PDF (Max {maxSizeMB}MB each, up to {maxFiles} files)
          </p>
          <p className="text-xs text-muted-foreground">
            {documents.length}/{maxFiles} uploaded
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
        </div>
      )}
    </div>
  );
}
