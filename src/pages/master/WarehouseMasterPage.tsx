import { useState, useMemo } from 'react';
import { Plus, Search, Download, Eye, Edit2, Power, Warehouse, MapPin, Building2, Users } from 'lucide-react';
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
  useWarehouses,
  useCreateWarehouse,
  useUpdateWarehouse,
  Warehouse as WarehouseType,
  CreateWarehouseData,
} from '@/hooks/useWarehousesData';
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

const locationTypes = ['central', 'regional', 'distributor'] as const;

const fields: FieldConfig[] = [
  { key: 'name', label: 'Warehouse Name', type: 'text', required: true, placeholder: 'Enter warehouse name' },
  { key: 'code', label: 'Warehouse Code', type: 'text', required: true, placeholder: 'e.g., WH-001' },
  {
    key: 'location_type',
    label: 'Location Type',
    type: 'select',
    required: true,
    options: locationTypes.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) })),
  },
  { key: 'state', label: 'State', type: 'text', required: true, placeholder: 'Enter state' },
  { key: 'city', label: 'City', type: 'text', required: true, placeholder: 'Enter city' },
  { key: 'address', label: 'Address', type: 'textarea', required: false, placeholder: 'Full warehouse address' },
  { key: 'contact_person', label: 'Contact Person', type: 'text', required: false, placeholder: 'Contact name' },
  { key: 'contact_number', label: 'Contact Number', type: 'text', required: false, placeholder: '10-digit number' },
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

export default function WarehouseMasterPage() {
  const { data: warehouses, isLoading } = useWarehouses();
  const createWarehouse = useCreateWarehouse();
  const updateWarehouse = useUpdateWarehouse();

  const [modalOpen, setModalOpen] = useState(false);
  const [disableModal, setDisableModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WarehouseType | null>(null);
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>('create');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const handleCreate = () => {
    setSelectedItem(null);
    setMode('create');
    setModalOpen(true);
  };

  const handleView = (item: WarehouseType) => {
    setSelectedItem(item);
    setMode('view');
    setModalOpen(true);
  };

  const handleEdit = (item: WarehouseType) => {
    setSelectedItem(item);
    setMode('edit');
    setModalOpen(true);
  };

  const handleDisable = (item: WarehouseType) => {
    setSelectedItem(item);
    setDisableModal(true);
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (mode === 'create') {
      await createWarehouse.mutateAsync(data as unknown as CreateWarehouseData);
    } else if (mode === 'edit' && selectedItem) {
      await updateWarehouse.mutateAsync({ id: selectedItem.id, ...data } as Partial<WarehouseType> & { id: string });
    }
    setModalOpen(false);
  };

  const handleToggleStatus = async () => {
    if (selectedItem) {
      const newStatus = selectedItem.status === 'active' ? 'inactive' : 'active';
      await updateWarehouse.mutateAsync({ id: selectedItem.id, status: newStatus });
      setDisableModal(false);
    }
  };

  const filteredData = useMemo(() => {
    let data = warehouses || [];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      data = data.filter(w => 
        w.name.toLowerCase().includes(query) ||
        w.code.toLowerCase().includes(query) ||
        w.city.toLowerCase().includes(query) ||
        w.state.toLowerCase().includes(query)
      );
    }
    
    if (typeFilter !== 'all') {
      data = data.filter(w => w.location_type === typeFilter);
    }
    
    return data;
  }, [warehouses, searchQuery, typeFilter]);

  const stats = useMemo(() => {
    const data = warehouses || [];
    return {
      total: data.length,
      active: data.filter(w => w.status === 'active').length,
      central: data.filter(w => w.location_type === 'central').length,
      regional: data.filter(w => w.location_type === 'regional').length,
    };
  }, [warehouses]);

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'central': return 'default';
      case 'regional': return 'secondary';
      case 'distributor': return 'outline';
      default: return 'outline';
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Warehouse',
      render: (item: WarehouseType) => (
        <div>
          <p className="font-medium text-foreground">{item.name}</p>
          <p className="text-xs text-muted-foreground">{item.code}</p>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (item: WarehouseType) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{item.city}, {item.state}</span>
        </div>
      ),
    },
    {
      key: 'location_type',
      header: 'Type',
      render: (item: WarehouseType) => (
        <Badge variant={getTypeBadgeVariant(item.location_type)}>
          {item.location_type.charAt(0).toUpperCase() + item.location_type.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (item: WarehouseType) => (
        <div>
          <p className="text-sm">{item.contact_person || '-'}</p>
          <p className="text-xs text-muted-foreground">{item.contact_number || ''}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: WarehouseType) => (
        <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
          {item.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: WarehouseType) => (
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
          <h1 className="text-2xl font-bold text-foreground">Warehouse Master</h1>
          <p className="text-muted-foreground">Manage warehouse locations for stock storage and dispatch</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Warehouse
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Warehouses"
          value={stats.total}
          icon={Warehouse}
        />
        <StatCard
          title="Active Warehouses"
          value={stats.active}
          icon={Building2}
        />
        <StatCard
          title="Central Locations"
          value={stats.central}
          icon={MapPin}
        />
        <StatCard
          title="Regional Locations"
          value={stats.regional}
          icon={Users}
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
                  placeholder="Search warehouses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Location Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {locationTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
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
        title={mode === 'create' ? 'Add Warehouse' : mode === 'edit' ? 'Edit Warehouse' : 'Warehouse Details'}
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
              {selectedItem?.status === 'active' ? 'Disable Warehouse?' : 'Enable Warehouse?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedItem?.status === 'active'
                ? `This will mark "${selectedItem?.name}" as inactive. Inactive warehouses cannot be used for new stock entries or transfers.`
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
