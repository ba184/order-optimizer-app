import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { FormActionButtons } from '@/components/ui/FormActionButtons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  Category,
} from '@/hooks/useCategoriesData';

// Generate variant code like VAR-1738123456-A1B2
const generateVariantCode = () => {
  const timestamp = Date.now().toString().slice(-10);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `VAR-${timestamp}-${random}`;
};

export default function VariantFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { data: categories } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const [formData, setFormData] = useState({
    name: '',
    code: '', // Blank on new creation
    description: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    if (isEdit && categories) {
      const category = categories.find((c) => c.id === id);
      if (category) {
        setFormData({
          name: category.name,
          code: category.code,
          description: category.description || '',
          status: (category.status as 'active' | 'inactive') || 'active',
        });
      }
    }
  }, [isEdit, id, categories]);

  const initialFormData = { name: '', code: '', description: '', status: 'active' as 'active' | 'inactive' };

  const handleSubmit = async (e?: React.FormEvent, addMore = false) => {
    e?.preventDefault();
    const codeToUse = isEdit ? formData.code : generateVariantCode();
    if (isEdit && id) {
      await updateCategory.mutateAsync({ id, name: formData.name, code: formData.code, description: formData.description || null, status: formData.status });
      navigate('/master/variants');
    } else {
      await createCategory.mutateAsync({ name: formData.name, code: codeToUse, description: formData.description || undefined, status: formData.status });
      if (addMore) { setFormData(initialFormData); toast.success('Variant created! Add another.'); }
      else navigate('/master/variants');
    }
  };

  const handleReset = () => {
    if (isEdit && categories) {
      const cat = categories.find(c => c.id === id);
      if (cat) setFormData({ name: cat.name, code: cat.code, description: cat.description || '', status: (cat.status as 'active' | 'inactive') || 'active' });
    } else setFormData(initialFormData);
  };

  const isLoading = createCategory.isPending || updateCategory.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/master/variants')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEdit ? 'Edit Variant' : 'New Variant'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update variant details' : 'Create a new product variant'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Variant Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Variant Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter variant name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Variant Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  readOnly
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">System generated</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'inactive') =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <FormActionButtons
          isEdit={isEdit}
          isSubmitting={isLoading}
          onCancel={() => navigate('/master/variants')}
          onReset={handleReset}
          onSubmit={() => handleSubmit()}
          onAddMore={() => handleSubmit(undefined, true)}
          entityName="Variant"
        />
      </form>
    </div>
  );
}
