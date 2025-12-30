import { useState, useMemo } from 'react';
import { Plus, Search, Download, Eye, Edit2, Power, Layers, Package, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable } from '@/components/ui/DataTable';
import { CrudModal, FieldConfig } from '@/components/ui/CrudModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCategoriesWithProductCount,
  useCreateCategory,
  useUpdateCategory,
  Category,
  CreateCategoryData,
} from '@/hooks/useCategoriesData';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const fields: FieldConfig[] = [
  { key: 'name', label: 'Category Name', type: 'text', required: true, placeholder: 'Enter category name' },
  { key: 'code', label: 'Category Code', type: 'text', required: true, placeholder: 'e.g., CAT-001' },
  { key: 'description', label: 'Description', type: 'textarea', required: false, placeholder: 'Optional description' },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
];

export default function CategoryMasterPage() {
  const { data: categories, isLoading } = useCategoriesWithProductCount();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const [modalOpen, setModalOpen] = useState(false);
  const [disableModal, setDisableModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Category | null>(null);
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>('create');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleCreate = () => {
    setSelectedItem(null);
    setMode('create');
    setModalOpen(true);
  };

  const handleView = (item: Category) => {
    setSelectedItem(item);
    setMode('view');
    setModalOpen(true);
  };

  const handleEdit = (item: Category) => {
    setSelectedItem(item);
    setMode('edit');
    setModalOpen(true);
  };

  const handleDisable = (item: Category) => {
    // Check if category has active products
    if (item.status === 'active' && (item.product_count || 0) > 0) {
      toast.error('Cannot disable category with active products. Please reassign products first.');
      return;
    }
    setSelectedItem(item);
    setDisableModal(true);
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (mode === 'create') {
      await createCategory.mutateAsync(data as unknown as CreateCategoryData);
    } else if (mode === 'edit' && selectedItem) {
      await updateCategory.mutateAsync({ id: selectedItem.id, ...data } as Partial<Category> & { id: string });
    }
    setModalOpen(false);
  };

  const handleToggleStatus = async () => {
    if (selectedItem) {
      const newStatus = selectedItem.status === 'active' ? 'inactive' : 'active';
      await updateCategory.mutateAsync({ id: selectedItem.id, status: newStatus });
      setDisableModal(false);
    }
  };

  const filteredData = useMemo(() => {
    let data = categories || [];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      data = data.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.code.toLowerCase().includes(query) ||
        (c.description?.toLowerCase().includes(query) ?? false)
      );
    }
    
    if (statusFilter !== 'all') {
      data = data.filter(c => c.status === statusFilter);
    }
    
    return data;
  }, [categories, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const data = categories || [];
    const totalProducts = data.reduce((sum, c) => sum + (c.product_count || 0), 0);
    return {
      total: data.length,
      active: data.filter(c => c.status === 'active').length,
      inactive: data.filter(c => c.status === 'inactive').length,
      totalProducts,
    };
  }, [categories]);

  const columns = [
    {
      key: 'name',
      header: 'Category',
      render: (item: Category) => (
        <div>
          <p className="font-medium text-foreground">{item.name}</p>
          <p className="text-xs text-muted-foreground">{item.code}</p>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (item: Category) => (
        <p className="text-sm text-muted-foreground max-w-[200px] truncate">
          {item.description || '-'}
        </p>
      ),
    },
    {
      key: 'product_count',
      header: 'Products',
      render: (item: Category) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{item.product_count || 0}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Category) => (
        <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
          {item.status}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (item: Category) => (
        <span className="text-sm text-muted-foreground">
          {new Date(item.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Category) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleView(item)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDisable(item)}>
            <Power className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Category Master</h1>
          <p className="text-muted-foreground">Manage product categories for classification</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Categories"
          value={stats.total}
          icon={Layers}
        />
        <StatCard
          title="Active Categories"
          value={stats.active}
          icon={CheckCircle}
        />
        <StatCard
          title="Inactive Categories"
          value={stats.inactive}
          icon={XCircle}
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        searchable={false}
      />

      {/* Create/Edit Modal */}
      <CrudModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={mode === 'create' ? 'Add Category' : mode === 'edit' ? 'Edit Category' : 'Category Details'}
        fields={fields}
        initialData={selectedItem || undefined}
        onSubmit={handleSubmit}
        mode={mode}
      />

      {/* Disable Confirmation */}
      <AlertDialog open={disableModal} onOpenChange={setDisableModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedItem?.status === 'active' ? 'Disable Category?' : 'Enable Category?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedItem?.status === 'active'
                ? `This will mark "${selectedItem?.name}" as inactive. Inactive categories cannot be assigned to new products.`
                : `This will mark "${selectedItem?.name}" as active again.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleStatus}>
              {selectedItem?.status === 'active' ? 'Disable' : 'Enable'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
