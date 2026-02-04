import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2, MapPin, Phone, User, Building2, Ruler, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useWarehouse } from '@/hooks/useWarehousesData';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function WarehouseViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: warehouse, isLoading } = useWarehouse(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Warehouse not found</p>
        <Button className="mt-4" onClick={() => navigate('/master/warehouses')}>
          Back to Warehouses
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/master/warehouses')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{warehouse.name}</h1>
              <Badge variant={warehouse.status === 'active' ? 'default' : 'secondary'}>
                {warehouse.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{warehouse.code}</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/master/warehouses/${id}/edit`)}>
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Warehouse
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Warehouse Name</p>
                <p className="font-medium">{warehouse.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Warehouse Code</p>
                <p className="font-medium">{warehouse.code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location Type</p>
                <Badge variant="outline" className="mt-1">
                  {warehouse.location_type.charAt(0).toUpperCase() + warehouse.location_type.slice(1)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={warehouse.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                  {warehouse.status}
                </Badge>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground">Capacity</p>
              <p className="font-medium">{warehouse.capacity || 'Not specified'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Location Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Country</p>
                <p className="font-medium">{warehouse.country || 'India'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">State</p>
                <p className="font-medium">{warehouse.state}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">City</p>
                <p className="font-medium">{warehouse.city}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Territory</p>
                <p className="font-medium">{warehouse.territory || '-'}</p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{warehouse.address || 'Not specified'}</p>
            </div>

            {(warehouse.latitude || warehouse.longitude) && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Latitude</p>
                    <p className="font-medium">{warehouse.latitude || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Longitude</p>
                    <p className="font-medium">{warehouse.longitude || '-'}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact Person</p>
                <p className="font-medium">{warehouse.contact_person || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact Number</p>
                <p className="font-medium">{warehouse.contact_number || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Created At</p>
                <p className="font-medium">
                  {format(new Date(warehouse.created_at), 'dd MMM yyyy, hh:mm a')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {format(new Date(warehouse.updated_at), 'dd MMM yyyy, hh:mm a')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
