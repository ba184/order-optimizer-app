import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Download, Eye, Edit2, Power, Warehouse, MapPin, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable } from '@/components/ui/DataTable';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useWarehouses,
  useUpdateWarehouse,
  Warehouse as WarehouseType,
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

const locationTypes = ['central', 'depot'] as const;

export default function WarehouseMasterPage() {
  const navigate = useNavigate();
  const { data: warehouses, isLoading } = useWarehouses();
  const updateWarehouse = useUpdateWarehouse();

  const [disableModal, setDisableModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WarehouseType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleCreate = () => {
    navigate('/master/warehouses/new');
  };

  const handleView = (item: WarehouseType) => {
    navigate(`/master/warehouses/${item.id}`);
  };

  const handleEdit = (item: WarehouseType) => {
    navigate(`/master/warehouses/${item.id}/edit`);
  };

  const handleDisable = (item: WarehouseType) => {
    setSelectedItem(item);
    setDisableModal(true);
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

    if (statusFilter !== 'all') {
      data = data.filter(w => w.status === statusFilter);
    }
    
    return data;
  }, [warehouses, searchQuery, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    const data = warehouses || [];
    return {
      total: data.length,
      central: data.filter(w => w.location_type === 'central').length,
      depot: data.filter(w => w.location_type === 'depot').length,
    };
  }, [warehouses]);

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'central': return 'default';
      case 'depot': return 'secondary';
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
      key: 'territory',
      header: 'Territory',
      render: (item: WarehouseType) => (
        <span className="text-sm">{item.territory || '-'}</span>
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
      key: 'capacity',
      header: 'Capacity',
      render: (item: WarehouseType) => (
        <span className="text-sm">{item.capacity || '-'}</span>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Warehouses"
          value={stats.total}
          icon={Warehouse}
        />
        <StatCard
          title="Central Warehouses"
          value={stats.central}
          icon={Building2}
        />
        <StatCard
          title="Depot Warehouses"
          value={stats.depot}
          icon={MapPin}
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
