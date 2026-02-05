import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
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
    code: generateVariantCode(),
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEdit && id) {
      await updateCategory.mutateAsync({
        id,
        name: formData.name,
        code: formData.code,
        description: formData.description || null,
        status: formData.status,
      });
    } else {
      await createCategory.mutateAsync({
        name: formData.name,
        code: formData.code,
        description: formData.description || undefined,
        status: formData.status,
      });
    }

    navigate('/master/variants');
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
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="status">Status</Label>
                <p className="text-sm text-muted-foreground">
                  {formData.status === 'active' ? 'Variant is active and visible' : 'Variant is inactive and hidden'}
                </p>
              </div>
              <Switch
                id="status"
                checked={formData.status === 'active'}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, status: checked ? 'active' : 'inactive' })
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate('/master/variants')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEdit ? 'Update Variant' : 'Create Variant'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
