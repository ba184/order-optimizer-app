import { useState, useRef } from 'react';
import { Upload, X, Image, Video, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReturnMediaUploadProps {
  mediaUrls: string[];
  onMediaChange: (urls: string[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

interface MediaFile {
  url: string;
  type: 'image' | 'video';
  name: string;
}

export function ReturnMediaUpload({
  mediaUrls,
  onMediaChange,
  maxFiles = 5,
  maxSizeMB = 10,
}: ReturnMediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const parseMediaFiles = (urls: string[]): MediaFile[] => {
    return urls.map((url) => {
      const fileName = url.split('/').pop() || 'file';
      const isVideo = /\.(mp4|mov|avi|webm|mkv)$/i.test(fileName);
      return {
        url,
        type: isVideo ? 'video' : 'image',
        name: fileName,
      };
    });
  };

  const mediaFiles = parseMediaFiles(mediaUrls);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Check max files limit
    if (mediaUrls.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate each file
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const validFiles: File[] = [];

    for (const file of files) {
      // Check file type
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        toast.error(`${file.name}: Only images and videos allowed`);
        continue;
      }

      // Check file size
      if (file.size > maxSizeBytes) {
        toast.error(`${file.name}: File size exceeds ${maxSizeMB}MB limit`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `returns/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('return-media')
          .upload(filePath, file);

        if (uploadError) {
          toast.error(`Failed to upload ${file.name}`);
          console.error('Upload error:', uploadError);
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from('return-media')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrlData.publicUrl);
        setUploadProgress(Math.round(((i + 1) / validFiles.length) * 100));
      }

      if (uploadedUrls.length > 0) {
        onMediaChange([...mediaUrls, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} file(s) uploaded successfully`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleRemove = async (urlToRemove: string) => {
    // Extract the file path from the URL
    const urlParts = urlToRemove.split('/return-media/');
    if (urlParts.length > 1) {
      const filePath = urlParts[1];
      await supabase.storage.from('return-media').remove([filePath]);
    }
    
    onMediaChange(mediaUrls.filter((url) => url !== urlToRemove));
    toast.success('File removed');
  };

  const remainingSlots = maxFiles - mediaUrls.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Upload size={16} />
          Media Upload (Images/Videos)
        </label>
        <span className="text-xs text-muted-foreground">
          {mediaUrls.length}/{maxFiles} files • Max {maxSizeMB}MB each
        </span>
      </div>

      {/* Upload Area */}
      {remainingSlots > 0 && (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          className={`
            border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer
            transition-colors hover:border-primary/50 hover:bg-primary/5
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={24} className="animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading... {uploadProgress}%</p>
              <div className="w-full max-w-xs bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Image size={20} />
                <Video size={20} />
              </div>
              <p className="text-sm text-muted-foreground">
                Click to upload images or videos
              </p>
              <p className="text-xs text-muted-foreground">
                {remainingSlots} slot(s) remaining
              </p>
            </div>
          )}
        </div>
      )}

      {/* Uploaded Files Preview */}
      {mediaFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {mediaFiles.map((file, index) => (
            <div
              key={index}
              className="relative group rounded-lg border border-border overflow-hidden bg-muted"
            >
              {file.type === 'image' ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-24 object-cover"
                />
              ) : (
                <div className="w-full h-24 flex items-center justify-center bg-muted">
                  <Video size={32} className="text-muted-foreground" />
                </div>
              )}
              
              <button
                onClick={() => handleRemove(file.url)}
                className="absolute top-1 right-1 p-1 bg-destructive/90 text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
              
              <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-background/80 text-xs truncate">
                {file.type === 'video' ? '📹 ' : '🖼️ '}
                {file.name.length > 15 ? file.name.substring(0, 12) + '...' : file.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Warning for damage/leakage */}
      <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
        <AlertCircle size={16} className="text-warning mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Upload clear images/videos showing the damage or leakage for faster claim processing.
        </p>
      </div>
    </div>
  );
}