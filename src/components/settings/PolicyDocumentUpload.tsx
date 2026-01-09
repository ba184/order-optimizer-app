import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { FileText, Upload, Download, Trash2, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface PolicyDocument {
  id: string;
  policy_type: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  uploaded_by: string | null;
  uploaded_at: string | null;
  is_active: boolean;
  version: number;
}

interface PolicyDocumentUploadProps {
  policyType: 'expense' | 'payment' | 'hr' | 'return';
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function PolicyDocumentUpload({ 
  policyType, 
  title, 
  description,
  icon 
}: PolicyDocumentUploadProps) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<PolicyDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, [policyType]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('policy_documents')
        .select('*')
        .eq('policy_type', policyType)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);

    try {
      // Get next version number
      const maxVersion = documents.length > 0 
        ? Math.max(...documents.map(d => d.version)) 
        : 0;
      const newVersion = maxVersion + 1;

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${policyType}_v${newVersion}_${Date.now()}.${fileExt}`;
      const filePath = `${policyType}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('policy-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Deactivate previous active document
      if (documents.length > 0) {
        await supabase
          .from('policy_documents')
          .update({ is_active: false })
          .eq('policy_type', policyType)
          .eq('is_active', true);
      }

      // Save document metadata
      const { error: dbError } = await supabase
        .from('policy_documents')
        .insert({
          policy_type: policyType,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          uploaded_by: user?.id,
          version: newVersion,
          is_active: true
        });

      if (dbError) throw dbError;

      toast.success('Policy document uploaded successfully');
      fetchDocuments();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const handleDownload = async (doc: PolicyDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('policy-documents')
        .download(doc.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const handleDelete = async (doc: PolicyDocument) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('policy-documents')
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('policy_documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      toast.success('Document deleted successfully');
      fetchDocuments();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const activeDocument = documents.find(d => d.is_active);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Section */}
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
          <input
            type="file"
            id={`upload-${policyType}`}
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          <label
            htmlFor={`upload-${policyType}`}
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                {uploading ? 'Uploading...' : 'Upload Policy Document'}
              </p>
              <p className="text-sm text-muted-foreground">
                PDF or Word document (max 10MB)
              </p>
            </div>
          </label>
        </div>

        {/* Current Active Document */}
        {activeDocument && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <FileText className="h-8 w-8 text-primary mt-1" />
                <div>
                  <p className="font-medium text-foreground">{activeDocument.file_name}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {activeDocument.uploaded_at 
                        ? format(new Date(activeDocument.uploaded_at), 'MMM dd, yyyy HH:mm')
                        : 'Unknown date'}
                    </span>
                    <span>v{activeDocument.version}</span>
                    <span>{formatFileSize(activeDocument.file_size)}</span>
                  </div>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                    Active
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(activeDocument)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(activeDocument)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Document History */}
        {documents.filter(d => !d.is_active).length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Previous Versions</h4>
            <div className="space-y-2">
              {documents
                .filter(d => !d.is_active)
                .map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between gap-4 p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{doc.file_name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>v{doc.version}</span>
                          <span>{formatFileSize(doc.file_size)}</span>
                          {doc.uploaded_at && (
                            <span>
                              {format(new Date(doc.uploaded_at), 'MMM dd, yyyy')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(doc)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && documents.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No policy document uploaded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
