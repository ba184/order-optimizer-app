import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { FormActionButtons } from '@/components/ui/FormActionButtons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useWarehouse,
  useCreateWarehouse,
  useUpdateWarehouse,
  CreateWarehouseData,
} from '@/hooks/useWarehousesData';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

// Hook to fetch employees for contact person selection
function useEmployees() {
  return useQuery({
    queryKey: ['employees-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, phone, employee_id')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });
}

export default function WarehouseFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { data: warehouse, isLoading: isLoadingWarehouse } = useWarehouse(id);
  const { data: employees = [] } = useEmployees();
  const createWarehouse = useCreateWarehouse();
  const updateWarehouse = useUpdateWarehouse();

  const [formData, setFormData] = useState<CreateWarehouseData>({
    name: '',
    location_type: 'depot',
    country: 'India',
    state: '',
    city: '',
    territory: '',
    latitude: undefined,
    longitude: undefined,
    address: '',
    contact_person: '',
    contact_number: '',
    contact_person_id: '',
    alt_contact_person: '',
    alt_contact_number: '',
    images: [],
    capacity: '',
    status: 'active',
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (warehouse && isEdit) {
      setFormData({
        name: warehouse.name,
        location_type: warehouse.location_type,
        country: warehouse.country || 'India',
        state: warehouse.state,
        city: warehouse.city,
        territory: warehouse.territory || '',
        latitude: warehouse.latitude || undefined,
        longitude: warehouse.longitude || undefined,
        address: warehouse.address || '',
        contact_person: warehouse.contact_person || '',
        contact_number: warehouse.contact_number || '',
        contact_person_id: warehouse.contact_person_id || '',
        alt_contact_person: warehouse.alt_contact_person || '',
        alt_contact_number: warehouse.alt_contact_number || '',
        images: warehouse.images || [],
        capacity: warehouse.capacity || '',
        status: warehouse.status,
      });
    }
  }, [warehouse, isEdit]);

  // Handle contact person selection - auto-populate phone number
  const handleContactPersonSelect = (employeeId: string) => {
    const selectedEmployee = employees.find(emp => emp.id === employeeId);
    if (selectedEmployee) {
      setFormData({
        ...formData,
        contact_person_id: employeeId,
        contact_person: selectedEmployee.name,
        contact_number: selectedEmployee.phone || '',
      });
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    const newImages: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `warehouses/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('warehouse-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('warehouse-images')
          .getPublicUrl(filePath);

        newImages.push(urlData.publicUrl);
      }

      setFormData({
        ...formData,
        images: [...(formData.images || []), ...newImages],
      });
      toast.success('Images uploaded successfully');
    } catch (error: any) {
      toast.error('Failed to upload image: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    const updatedImages = [...(formData.images || [])];
    updatedImages.splice(index, 1);
    setFormData({ ...formData, images: updatedImages });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.location_type || !formData.state || !formData.city || !formData.contact_person) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (isEdit && id) {
        await updateWarehouse.mutateAsync({ id, ...formData });
      } else {
        await createWarehouse.mutateAsync(formData);
      }
      navigate('/master/warehouses');
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isEdit && isLoadingWarehouse) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/master/warehouses')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEdit ? 'Edit Warehouse' : 'Add Warehouse'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update warehouse details' : 'Create a new warehouse location'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Warehouse Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter warehouse name"
                  required
                />
              </div>

              {isEdit && warehouse && (
                <div className="space-y-2">
                  <Label>Warehouse Code</Label>
                  <Input value={warehouse.code} disabled className="bg-muted" />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="location_type">Location Type *</Label>
                <Select
                  value={formData.location_type}
                  onValueChange={(value: 'central' | 'depot') =>
                    setFormData({ ...formData, location_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="central">Central</SelectItem>
                    <SelectItem value="depot">Depot</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
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

          {/* Location Details */}
          <Card>
            <CardHeader>
              <CardTitle>Location Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData({ ...formData, country: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="India">India</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => setFormData({ ...formData, state: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {indianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Enter city"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="territory">Territory</Label>
                <Input
                  id="territory"
                  value={formData.territory}
                  onChange={(e) => setFormData({ ...formData, territory: e.target.value })}
                  placeholder="Enter territory"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, latitude: e.target.value ? parseFloat(e.target.value) : undefined })
                  }
                  placeholder="e.g., 28.6139"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, longitude: e.target.value ? parseFloat(e.target.value) : undefined })
                  }
                  placeholder="e.g., 77.2090"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter full address"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact & Capacity */}
          <Card>
            <CardHeader>
              <CardTitle>Contact & Capacity</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact_person_id">Contact Person *</Label>
                <Select
                  value={formData.contact_person_id}
                  onValueChange={handleContactPersonSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact person" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} {emp.employee_id ? `(${emp.employee_id})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_number">Contact Number</Label>
                <Input
                  id="contact_number"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  placeholder="Auto-filled from employee"
                  className="bg-muted/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alt_contact_person">Alternate Contact Person</Label>
                <Input
                  id="alt_contact_person"
                  value={formData.alt_contact_person}
                  onChange={(e) => setFormData({ ...formData, alt_contact_person: e.target.value })}
                  placeholder="Enter alternate contact name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alt_contact_number">Alternate Contact Number</Label>
                <Input
                  id="alt_contact_number"
                  value={formData.alt_contact_number}
                  onChange={(e) => setFormData({ ...formData, alt_contact_number: e.target.value })}
                  placeholder="Enter alternate contact number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="e.g., 10000 sq ft"
                />
              </div>
            </CardContent>
          </Card>

          {/* Warehouse Images/Videos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Warehouse Images/Videos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Image Upload Button */}
                <div className="flex items-center gap-4">
                  <Label
                    htmlFor="image-upload"
                    className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    {uploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Images'}</span>
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                  <span className="text-sm text-muted-foreground">
                    Upload warehouse photos (max 5 images)
                  </span>
                </div>

                {/* Image Preview Grid */}
                {formData.images && formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border">
                        <img
                          src={url}
                          alt={`Warehouse image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <FormActionButtons
            isEdit={isEdit}
            isSubmitting={createWarehouse.isPending || updateWarehouse.isPending}
            onCancel={() => navigate('/master/warehouses')}
            onReset={() => setFormData({ name: '', location_type: 'depot', country: 'India', state: '', city: '', territory: '', latitude: undefined, longitude: undefined, address: '', contact_person: '', contact_number: '', contact_person_id: '', alt_contact_person: '', alt_contact_number: '', images: [], capacity: '', status: 'active' })}
            submitViaForm
            onAddMore={async () => { await handleSubmit({ preventDefault: () => {} } as React.FormEvent); }}
            entityName="Warehouse"
          />
        </div>
      </form>
    </div>
  );
}