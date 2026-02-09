import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Download, Eye, Edit2, Layers, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCategoriesWithProductCount, Category } from '@/hooks/useCategoriesData';

export default function VariantMasterPage() {
  const navigate = useNavigate();
  const { data: categories, isLoading } = useCategoriesWithProductCount();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredData = useMemo(() => {
    let data = categories || [];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      data = data.filter(
        (c) =>
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
      totalProducts,
    };
  }, [categories]);

  const columns = [
    {
      key: 'code',
      header: 'Variant Code',
      render: (item: Category) => (
        <span className="font-mono text-sm text-muted-foreground">{item.code}</span>
      ),
    },
    {
      key: 'name',
      header: 'Variant Name',
      render: (item: Category) => (
        <p className="font-medium text-foreground">{item.name}</p>
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
        <StatusBadge status={item.status === 'active' ? 'active' : 'inactive'} />
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
          <Button variant="ghost" size="icon" onClick={() => navigate(`/master/variants/${item.id}`)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate(`/master/variants/${item.id}/edit`)}>
            <Edit2 className="h-4 w-4" />
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
          <h1 className="text-2xl font-bold text-foreground">Variants</h1>
          <p className="text-muted-foreground">Manage product variants for classification</p>
        </div>
        <Button onClick={() => navigate('/master/variants/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Variant
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard title="Total Variants" value={stats.total} icon={Layers} />
        <StatCard title="Total Products" value={stats.totalProducts} icon={Package} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search variants..."
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
      <DataTable columns={columns} data={filteredData} searchable={false} />
    </div>
  );
}
