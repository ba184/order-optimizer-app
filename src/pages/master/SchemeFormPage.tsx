 import { useState, useEffect } from 'react';
 import { useNavigate, useParams } from 'react-router-dom';
 import { ArrowLeft, RotateCcw, Loader2, Plus, Trash2 } from 'lucide-react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Button } from '@/components/ui/button';
 import { Textarea } from '@/components/ui/textarea';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Checkbox } from '@/components/ui/checkbox';
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
 import { cn } from '@/lib/utils';
 import { toast } from 'sonner';
 import { 
   useSchemes,
   useCreateScheme, 
   useUpdateScheme,
   SchemeType,
   SchemeStatus,
  Applicability,
 } from '@/hooks/useSchemesData';
 import { useProducts } from '@/hooks/useProductsData';
 import { supabase } from '@/integrations/supabase/client';
 import { useQuery } from '@tanstack/react-query';
 
 type BenefitTypeOption = 'flat' | 'percentage';
 
 interface SlabRow {
   id: string;
   min_order_value: number;
   benefit_type: BenefitTypeOption;
   benefit_value: number;
   max_benefit: number;
 }
 
 interface FormData {
   name: string;
   type: SchemeType;
   applicability: string;
   selected_outlets: string[];
   status: 'active' | 'pending' | 'inactive';
   start_date: string;
   end_date: string;
   description: string;
   // Slab fields - now using array
   slabs: SlabRow[];
   // Buy X Get Y fields
   bxgy_buy_product: string;
   bxgy_get_product: string;
   bxgy_buy_quantity: number;
   bxgy_get_quantity: number;
   bxgy_min_order_value: number;
   // Combo fields
   combo_name: string;
   combo_products: string[];
   combo_price: number;
   combo_discount_type: BenefitTypeOption;
   combo_discount_value: number;
   combo_max_per_order: number;
   // Bill Wise fields
   bill_value_from: number;
   bill_value_to: number;
   bill_discount_type: BenefitTypeOption;
   bill_discount_value: number;
   bill_max_discount: number;
   // Value Wise fields
   value_discount_type: BenefitTypeOption;
   value_discount_value: number;
   value_min_order_value: number;
   value_max_discount: number;
 }
 
interface Outlet {
  id: string;
  name: string;
  code: string;
  type: 'distributor' | 'retailer';
  state?: string;
  city?: string;
  zone?: string;
}

interface GeoFilterState {
  state: string;
  city: string;
  zone: string;
}

const schemeTypes: { value: SchemeType; label: string }[] = [
  { value: 'slab', label: 'Slab' },
  { value: 'buy_x_get_y', label: 'Buy X Get Y' },
  { value: 'combo', label: 'Combo' },
  { value: 'bill_wise', label: 'Bill Wise' },
  { value: 'value_wise', label: 'Value Wise' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
];

const applicabilityOptions = [
  { value: 'all_outlets', label: 'All Outlets' },
  { value: 'selected_outlets', label: 'Selected Outlets' },
];

const benefitTypeOptions = [
  { value: 'flat', label: 'Flat' },
  { value: 'percentage', label: 'Percentage' },
];

const createEmptySlab = (): SlabRow => ({
  id: crypto.randomUUID(),
  min_order_value: 0,
  benefit_type: 'flat',
  benefit_value: 0,
  max_benefit: 0,
});

const initialFormData: FormData = {
  name: '',
  type: 'slab',
  applicability: '',
  selected_outlets: [],
  status: 'pending',
  start_date: '',
  end_date: '',
  description: '',
  slabs: [createEmptySlab()],
  bxgy_buy_product: '',
  bxgy_get_product: '',
  bxgy_buy_quantity: 1,
  bxgy_get_quantity: 1,
  bxgy_min_order_value: 0,
  combo_name: '',
  combo_products: [],
  combo_price: 0,
  combo_discount_type: 'flat',
  combo_discount_value: 0,
  combo_max_per_order: 1,
  bill_value_from: 0,
  bill_value_to: 0,
  bill_discount_type: 'flat',
  bill_discount_value: 0,
  bill_max_discount: 0,
  value_discount_type: 'flat',
  value_discount_value: 0,
  value_min_order_value: 0,
  value_max_discount: 0,
};

// Hook to fetch all outlets with location data
function useOutlets() {
  return useQuery({
    queryKey: ['all-outlets-with-location'],
    queryFn: async () => {
      const [distributorsRes, retailersRes] = await Promise.all([
        supabase.from('distributors').select('id, firm_name, code, state, city, zone').order('firm_name'),
        supabase.from('retailers').select('id, shop_name, code, state, city, zone').order('shop_name'),
      ]);

      const outlets: Outlet[] = [];
      
      if (distributorsRes.data) {
        distributorsRes.data.forEach(d => {
          outlets.push({
            id: d.id,
            name: d.firm_name,
            code: d.code,
            type: 'distributor',
            state: d.state || undefined,
            city: d.city || undefined,
            zone: d.zone || undefined,
          });
        });
      }
      
      if (retailersRes.data) {
        retailersRes.data.forEach(r => {
          outlets.push({
            id: r.id,
            name: r.shop_name,
            code: r.code,
            type: 'retailer',
            state: r.state || undefined,
            city: r.city || undefined,
            zone: r.zone || undefined,
          });
        });
      }

      return outlets;
    },
  });
}

// Hook to get unique location values from outlets
function useOutletLocations(outlets: Outlet[]) {
  const states = [...new Set(outlets.map(o => o.state).filter(Boolean))] as string[];
  
  const getCities = (state: string) => {
    if (!state) return [];
    return [...new Set(outlets.filter(o => o.state === state).map(o => o.city).filter(Boolean))] as string[];
  };
  
  const getZones = (state: string, city: string) => {
    let filtered = outlets;
    if (state) filtered = filtered.filter(o => o.state === state);
    if (city) filtered = filtered.filter(o => o.city === city);
    return [...new Set(filtered.map(o => o.zone).filter(Boolean))] as string[];
  };
  
  return { states, getCities, getZones };
}
 
 export default function SchemeFormPage() {
   const navigate = useNavigate();
   const { id } = useParams();
   const isEditing = !!id;
 
   const { data: schemes = [] } = useSchemes();
   const { data: products = [] } = useProducts();
   const { data: outlets = [] } = useOutlets();
   const createScheme = useCreateScheme();
   const updateScheme = useUpdateScheme();
 
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Geo filter state for outlet selection
  const [geoFilter, setGeoFilter] = useState<GeoFilterState>({ state: '', city: '', zone: '' });
  const { states, getCities, getZones } = useOutletLocations(outlets);
 
   useEffect(() => {
     if (isEditing && schemes.length > 0) {
       const scheme = schemes.find(s => s.id === id);
       if (scheme) {
         setFormData(prev => ({
           ...prev,
           name: scheme.name,
           type: scheme.type,
           status: scheme.status === 'draft' ? 'pending' : scheme.status as 'active' | 'pending' | 'inactive',
           description: scheme.description || '',
           start_date: scheme.start_date || '',
           end_date: scheme.end_date || '',
           applicability: scheme.applicability === 'all_outlets' ? 'all_outlets' : 
                          scheme.applicability === 'segment' ? 'selected_outlets' : scheme.applicability || '',
           slabs: scheme.slab_config?.length > 0 
             ? scheme.slab_config.map((s: any) => ({
                 id: crypto.randomUUID(),
                 min_order_value: s.min_qty || 0,
                 benefit_type: 'flat' as BenefitTypeOption,
                 benefit_value: s.benefit_value || 0,
                 max_benefit: 0,
               }))
             : [createEmptySlab()],
         }));
       }
     }
   }, [id, isEditing, schemes]);
 
   const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
     setFormData(prev => ({ ...prev, [field]: value }));
     if (errors[field]) {
       setErrors(prev => ({ ...prev, [field]: '' }));
     }
   };
 
   const toggleOutletSelection = (outletId: string) => {
     setFormData(prev => ({
       ...prev,
       selected_outlets: prev.selected_outlets.includes(outletId)
         ? prev.selected_outlets.filter(id => id !== outletId)
         : [...prev.selected_outlets, outletId],
     }));
   };
 
   const addSlab = () => {
     setFormData(prev => ({
       ...prev,
       slabs: [...prev.slabs, createEmptySlab()],
     }));
   };
 
   const removeSlab = (slabId: string) => {
     if (formData.slabs.length <= 1) return;
     setFormData(prev => ({
       ...prev,
       slabs: prev.slabs.filter(s => s.id !== slabId),
     }));
   };
 
   const updateSlab = (slabId: string, field: keyof SlabRow, value: any) => {
     setFormData(prev => ({
       ...prev,
       slabs: prev.slabs.map(s => s.id === slabId ? { ...s, [field]: value } : s),
     }));
   };
 
   const validateForm = (): boolean => {
     const newErrors: Record<string, string> = {};
     if (!formData.name.trim()) newErrors.name = 'Scheme name is required';
     if (!formData.start_date) newErrors.start_date = 'Start date is required';
     if (!formData.end_date) newErrors.end_date = 'End date is required';
     if (formData.start_date && formData.end_date && formData.end_date <= formData.start_date) {
       newErrors.end_date = 'End date must be after start date';
     }
     setErrors(newErrors);
     return Object.keys(newErrors).length === 0;
   };
 
   const isFormValid = (): boolean => {
     return !!(
       formData.name.trim() &&
       formData.start_date &&
       formData.end_date &&
       formData.end_date > formData.start_date
     );
   };
 
   const generateSchemeCode = () => {
     const prefix = formData.type.toUpperCase().substring(0, 3);
     const timestamp = Date.now().toString().slice(-6);
     return `${prefix}-${timestamp}`;
   };
 
   const handleSubmit = async () => {
     if (!validateForm()) {
       toast.error('Please fix the errors before submitting');
       return;
     }
     setIsSubmitting(true);
     try {
       const schemeData = {
         name: formData.name,
         code: generateSchemeCode(),
         type: formData.type,
         description: formData.description || null,
         start_date: formData.start_date,
         end_date: formData.end_date,
         status: formData.status === 'inactive' ? 'cancelled' : formData.status as SchemeStatus,
        applicability: (formData.applicability === 'selected_outlets' ? 'segment' : formData.applicability || 'all_outlets') as Applicability,
         min_order_value: formData.type === 'slab' && formData.slabs.length > 0 ? formData.slabs[0].min_order_value : 
                          formData.type === 'buy_x_get_y' ? formData.bxgy_min_order_value :
                          formData.type === 'value_wise' ? formData.value_min_order_value : 0,
         max_benefit: formData.type === 'slab' ? Math.max(...formData.slabs.map(s => s.max_benefit)) :
                      formData.type === 'bill_wise' ? formData.bill_max_discount :
                      formData.type === 'value_wise' ? formData.value_max_discount : 0,
         slab_config: formData.type === 'slab' 
           ? formData.slabs.map(s => ({
               min_qty: s.min_order_value,
               max_qty: s.min_order_value + 100,
               benefit_value: s.benefit_value,
               benefit_type: s.benefit_type,
               max_benefit: s.max_benefit,
             }))
           : [],
       };
       if (isEditing) {
         await updateScheme.mutateAsync({ id, ...schemeData });
       } else {
         await createScheme.mutateAsync(schemeData);
       }
       navigate('/master/schemes');
     } catch (error) {
       // Error handled by mutation
     } finally {
       setIsSubmitting(false);
     }
   };
 
   const handleReset = () => {
     setFormData(initialFormData);
     setErrors({});
   };
 
   const renderSlabFields = () => (
     <Card>
       <CardHeader className="pb-4">
         <div className="flex items-center justify-between">
           <CardTitle className="text-base font-semibold">Slab Configuration</CardTitle>
           <Button variant="outline" size="sm" onClick={addSlab}>
             <Plus className="h-4 w-4 mr-1" />
             Add Slab
           </Button>
         </div>
       </CardHeader>
       <CardContent>
         <div className="border rounded-lg overflow-hidden">
           <Table>
             <TableHeader>
               <TableRow className="bg-muted/50">
                 <TableHead className="font-medium">Slab Min Order Value</TableHead>
                 <TableHead className="font-medium">Benefit Type</TableHead>
                 <TableHead className="font-medium">Benefit Value</TableHead>
                 <TableHead className="font-medium">Slab Max Benefit</TableHead>
                 <TableHead className="w-[60px]"></TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {formData.slabs.map((slab) => (
                 <TableRow key={slab.id}>
                   <TableCell>
                     <Input
                       type="number"
                       min={0}
                       placeholder="Min order value"
                       value={slab.min_order_value || ''}
                       onChange={(e) => updateSlab(slab.id, 'min_order_value', Number(e.target.value))}
                       className="w-full"
                     />
                   </TableCell>
                   <TableCell>
                     <Select
                       value={slab.benefit_type}
                       onValueChange={(v: BenefitTypeOption) => updateSlab(slab.id, 'benefit_type', v)}
                     >
                       <SelectTrigger className="w-full">
                         <SelectValue placeholder="Select type" />
                       </SelectTrigger>
                       <SelectContent>
                         {benefitTypeOptions.map((opt) => (
                           <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </TableCell>
                   <TableCell>
                     {slab.benefit_type === 'flat' && (
                       <Input
                         type="number"
                         min={0}
                         placeholder="Amount (₹)"
                         value={slab.benefit_value || ''}
                         onChange={(e) => updateSlab(slab.id, 'benefit_value', Number(e.target.value))}
                         className="w-full"
                       />
                     )}
                     {slab.benefit_type === 'percentage' && (
                       <Input
                         type="number"
                         min={0}
                         max={100}
                         placeholder="Percentage (%)"
                         value={slab.benefit_value || ''}
                         onChange={(e) => updateSlab(slab.id, 'benefit_value', Number(e.target.value))}
                         className="w-full"
                       />
                     )}
                   </TableCell>
                   <TableCell>
                     {slab.benefit_type === 'percentage' ? (
                       <Input
                         type="number"
                         min={0}
                         placeholder="Max benefit (₹)"
                         value={slab.max_benefit || ''}
                         onChange={(e) => updateSlab(slab.id, 'max_benefit', Number(e.target.value))}
                         className="w-full"
                       />
                     ) : (
                       <span className="text-muted-foreground text-sm">N/A</span>
                     )}
                   </TableCell>
                   <TableCell>
                     <Button
                       variant="ghost"
                       size="icon"
                       onClick={() => removeSlab(slab.id)}
                       disabled={formData.slabs.length <= 1}
                       className="h-8 w-8"
                     >
                       <Trash2 className="h-4 w-4 text-destructive" />
                     </Button>
                   </TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         </div>
       </CardContent>
     </Card>
   );
 
   const renderBuyXGetYFields = () => (
     <Card>
       <CardHeader className="pb-4">
         <CardTitle className="text-base font-semibold">Buy X Get Y Configuration</CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="space-y-2">
             <Label htmlFor="bxgy_buy_product">Buy Product</Label>
             <Select
               value={formData.bxgy_buy_product}
               onValueChange={(v) => updateField('bxgy_buy_product', v)}
             >
               <SelectTrigger id="bxgy_buy_product">
                 <SelectValue placeholder="Select product" />
               </SelectTrigger>
               <SelectContent>
                 {products.map((p) => (
                   <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
           <div className="space-y-2">
             <Label htmlFor="bxgy_get_product">Get Product</Label>
             <Select
               value={formData.bxgy_get_product}
               onValueChange={(v) => updateField('bxgy_get_product', v)}
             >
               <SelectTrigger id="bxgy_get_product">
                 <SelectValue placeholder="Select product" />
               </SelectTrigger>
               <SelectContent>
                 {products.map((p) => (
                   <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
           <div className="space-y-2">
             <Label htmlFor="bxgy_buy_quantity">Buy Quantity</Label>
             <Input
               id="bxgy_buy_quantity"
               type="number"
               min={1}
               placeholder="Enter quantity"
               value={formData.bxgy_buy_quantity || ''}
               onChange={(e) => updateField('bxgy_buy_quantity', Number(e.target.value))}
             />
           </div>
           <div className="space-y-2">
             <Label htmlFor="bxgy_get_quantity">Get Quantity</Label>
             <Input
               id="bxgy_get_quantity"
               type="number"
               min={1}
               placeholder="Enter quantity"
               value={formData.bxgy_get_quantity || ''}
               onChange={(e) => updateField('bxgy_get_quantity', Number(e.target.value))}
             />
           </div>
           <div className="space-y-2">
             <Label htmlFor="bxgy_min_order_value">Buy X Min Order Value</Label>
             <Input
               id="bxgy_min_order_value"
               type="number"
               min={0}
               placeholder="Enter minimum order value"
               value={formData.bxgy_min_order_value || ''}
               onChange={(e) => updateField('bxgy_min_order_value', Number(e.target.value))}
             />
           </div>
         </div>
       </CardContent>
     </Card>
   );
 
   const renderComboFields = () => (
     <Card>
       <CardHeader className="pb-4">
         <CardTitle className="text-base font-semibold">Combo Configuration</CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="space-y-2">
             <Label htmlFor="combo_name">Combo Name <span className="text-destructive">*</span></Label>
             <Input
               id="combo_name"
               placeholder="Enter combo name"
               value={formData.combo_name}
               onChange={(e) => updateField('combo_name', e.target.value)}
             />
           </div>
           <div className="space-y-2">
             <Label htmlFor="combo_products">Combo Product</Label>
             <Select
               value={formData.combo_products[0] || ''}
               onValueChange={(v) => updateField('combo_products', [v])}
             >
               <SelectTrigger id="combo_products">
                 <SelectValue placeholder="Select products" />
               </SelectTrigger>
               <SelectContent>
                 {products.map((p) => (
                   <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
           <div className="space-y-2">
             <Label htmlFor="combo_price">Combo Price</Label>
             <Input
               id="combo_price"
               type="number"
               min={0}
               placeholder="Enter combo price"
               value={formData.combo_price || ''}
               onChange={(e) => updateField('combo_price', Number(e.target.value))}
             />
           </div>
           <div className="space-y-2">
             <Label htmlFor="combo_discount_type">Combo Discount Type</Label>
             <Select
               value={formData.combo_discount_type}
               onValueChange={(v: BenefitTypeOption) => updateField('combo_discount_type', v)}
             >
               <SelectTrigger id="combo_discount_type">
                 <SelectValue placeholder="Select discount type" />
               </SelectTrigger>
               <SelectContent>
                 {benefitTypeOptions.map((opt) => (
                   <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
           <div className="space-y-2">
             <Label htmlFor="combo_discount_value">Combo Discount Value</Label>
             <Input
               id="combo_discount_value"
               type="number"
               min={0}
               placeholder="Enter discount value"
               value={formData.combo_discount_value || ''}
               onChange={(e) => updateField('combo_discount_value', Number(e.target.value))}
             />
           </div>
           <div className="space-y-2">
             <Label htmlFor="combo_max_per_order">Max Combos Per Order</Label>
             <Input
               id="combo_max_per_order"
               type="number"
               min={1}
               placeholder="Enter max combos"
               value={formData.combo_max_per_order || ''}
               onChange={(e) => updateField('combo_max_per_order', Number(e.target.value))}
             />
           </div>
         </div>
       </CardContent>
     </Card>
   );
 
   const renderBillWiseFields = () => (
     <Card>
       <CardHeader className="pb-4">
         <CardTitle className="text-base font-semibold">Bill Wise Configuration</CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="space-y-2">
             <Label htmlFor="bill_value_from">Bill Value From</Label>
             <Input
               id="bill_value_from"
               type="number"
               min={0}
               placeholder="Enter minimum bill value"
               value={formData.bill_value_from || ''}
               onChange={(e) => updateField('bill_value_from', Number(e.target.value))}
             />
           </div>
           <div className="space-y-2">
             <Label htmlFor="bill_value_to">Bill Value To</Label>
             <Input
               id="bill_value_to"
               type="number"
               min={0}
               placeholder="Enter maximum bill value"
               value={formData.bill_value_to || ''}
               onChange={(e) => updateField('bill_value_to', Number(e.target.value))}
             />
           </div>
           <div className="space-y-2">
             <Label htmlFor="bill_discount_type">Bill Discount Type</Label>
             <Select
               value={formData.bill_discount_type}
               onValueChange={(v: BenefitTypeOption) => updateField('bill_discount_type', v)}
             >
               <SelectTrigger id="bill_discount_type">
                 <SelectValue placeholder="Select discount type" />
               </SelectTrigger>
               <SelectContent>
                 {benefitTypeOptions.map((opt) => (
                   <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
           <div className="space-y-2">
             <Label htmlFor="bill_discount_value">Bill Discount Value</Label>
             <Input
               id="bill_discount_value"
               type="number"
               min={0}
               placeholder="Enter discount value"
               value={formData.bill_discount_value || ''}
               onChange={(e) => updateField('bill_discount_value', Number(e.target.value))}
             />
           </div>
           <div className="space-y-2">
             <Label htmlFor="bill_max_discount">Bill Max Discount</Label>
             <Input
               id="bill_max_discount"
               type="number"
               min={0}
               placeholder="Enter maximum discount"
               value={formData.bill_max_discount || ''}
               onChange={(e) => updateField('bill_max_discount', Number(e.target.value))}
             />
           </div>
         </div>
       </CardContent>
     </Card>
   );
 
   const renderValueWiseFields = () => (
     <Card>
       <CardHeader className="pb-4">
         <CardTitle className="text-base font-semibold">Value Wise Configuration</CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="space-y-2">
             <Label htmlFor="value_discount_type">Value Discount Type</Label>
             <Select
               value={formData.value_discount_type}
               onValueChange={(v: BenefitTypeOption) => updateField('value_discount_type', v)}
             >
               <SelectTrigger id="value_discount_type">
                 <SelectValue placeholder="Select discount type" />
               </SelectTrigger>
               <SelectContent>
                 {benefitTypeOptions.map((opt) => (
                   <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
           <div className="space-y-2">
             <Label htmlFor="value_discount_value">Value Discount Value</Label>
             <Input
               id="value_discount_value"
               type="number"
               min={0}
               placeholder="Enter discount value"
               value={formData.value_discount_value || ''}
               onChange={(e) => updateField('value_discount_value', Number(e.target.value))}
             />
           </div>
           <div className="space-y-2">
             <Label htmlFor="value_min_order_value">Value Min Order Value</Label>
             <Input
               id="value_min_order_value"
               type="number"
               min={0}
               placeholder="Enter minimum order value"
               value={formData.value_min_order_value || ''}
               onChange={(e) => updateField('value_min_order_value', Number(e.target.value))}
             />
           </div>
           <div className="space-y-2">
             <Label htmlFor="value_max_discount">Value Max Discount</Label>
             <Input
               id="value_max_discount"
               type="number"
               min={0}
               placeholder="Enter maximum discount"
               value={formData.value_max_discount || ''}
               onChange={(e) => updateField('value_max_discount', Number(e.target.value))}
             />
           </div>
         </div>
       </CardContent>
     </Card>
   );
 
   const renderDynamicFields = () => {
     switch (formData.type) {
       case 'slab':
         return renderSlabFields();
       case 'buy_x_get_y':
         return renderBuyXGetYFields();
       case 'combo':
         return renderComboFields();
       case 'bill_wise':
         return renderBillWiseFields();
       case 'value_wise':
         return renderValueWiseFields();
       default:
         return null;
     }
   };
 
  // Filter outlets based on geo filter - hierarchical filtering
  const filterOutletsByGeo = (outletList: Outlet[]) => {
    return outletList.filter(outlet => {
      // If no filter selected, show all
      if (!geoFilter.state && !geoFilter.city && !geoFilter.zone) return true;
      
      // State level filter
      if (geoFilter.state && outlet.state !== geoFilter.state) return false;
      
      // City level filter (only if city is selected)
      if (geoFilter.city && outlet.city !== geoFilter.city) return false;
      
      // Zone/Territory level filter (only if zone is selected)
      if (geoFilter.zone && outlet.zone !== geoFilter.zone) return false;
      
      return true;
    });
  };

  const handleGeoFilterChange = (field: keyof GeoFilterState, value: string) => {
    if (field === 'state') {
      // Reset city and zone when state changes
      setGeoFilter({ state: value, city: '', zone: '' });
    } else if (field === 'city') {
      // Reset zone when city changes
      setGeoFilter(prev => ({ ...prev, city: value, zone: '' }));
    } else {
      setGeoFilter(prev => ({ ...prev, [field]: value }));
    }
  };

  const clearGeoFilter = () => {
    setGeoFilter({ state: '', city: '', zone: '' });
  };

  const distributors = filterOutletsByGeo(outlets.filter(o => o.type === 'distributor'));
  const retailers = filterOutletsByGeo(outlets.filter(o => o.type === 'retailer'));
  
  const availableCities = geoFilter.state ? getCities(geoFilter.state) : [];
  const availableZones = getZones(geoFilter.state, geoFilter.city);
 
   return (
     <div className="min-h-screen bg-background flex flex-col">
       {/* Header */}
       <div className="border-b bg-card sticky top-0 z-10">
         <div className="px-6 py-4">
           <div className="flex items-center gap-4">
             <Button
               variant="ghost"
               size="icon"
               onClick={() => navigate('/master/schemes')}
               className="shrink-0"
             >
               <ArrowLeft className="h-5 w-5" />
             </Button>
             <div>
               <h1 className="text-xl font-semibold text-foreground">
                 {isEditing ? 'Edit Scheme' : 'Create New Scheme'}
               </h1>
               <p className="text-sm text-muted-foreground">
                 {isEditing ? 'Update scheme details' : 'Configure a new sales incentive scheme'}
               </p>
             </div>
           </div>
         </div>
       </div>
 
       {/* Form Content */}
       <div className="flex-1 overflow-auto">
         <div className="max-w-5xl mx-auto p-6 space-y-6">
           {/* Default Fields Card */}
           <Card>
             <CardHeader className="pb-4">
               <CardTitle className="text-base font-semibold">Basic Information</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="name">Scheme Name <span className="text-destructive">*</span></Label>
                   <Input
                     id="name"
                     placeholder="Enter scheme name"
                     value={formData.name}
                     onChange={(e) => updateField('name', e.target.value)}
                     className={cn(errors.name && 'border-destructive')}
                   />
                   {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="type">Scheme Type <span className="text-destructive">*</span></Label>
                   <Select
                     value={formData.type}
                     onValueChange={(v: SchemeType) => updateField('type', v)}
                   >
                     <SelectTrigger id="type">
                       <SelectValue placeholder="Select scheme type" />
                     </SelectTrigger>
                     <SelectContent>
                       {schemeTypes.map((st) => (
                         <SelectItem key={st.value} value={st.value}>{st.label}</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="applicability">Applicability</Label>
                   <Select
                     value={formData.applicability}
                     onValueChange={(v: string) => updateField('applicability', v)}
                   >
                     <SelectTrigger id="applicability">
                       <SelectValue placeholder="Select applicability" />
                     </SelectTrigger>
                     <SelectContent>
                       {applicabilityOptions.map((opt) => (
                         <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="status">Status</Label>
                   <Select
                     value={formData.status}
                     onValueChange={(v: 'active' | 'pending' | 'inactive') => updateField('status', v)}
                   >
                     <SelectTrigger id="status">
                       <SelectValue placeholder="Select status" />
                     </SelectTrigger>
                     <SelectContent>
                       {statusOptions.map((s) => (
                         <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="start_date">Start Date <span className="text-destructive">*</span></Label>
                   <Input
                     id="start_date"
                     type="date"
                     value={formData.start_date}
                     onChange={(e) => updateField('start_date', e.target.value)}
                     className={cn(errors.start_date && 'border-destructive')}
                   />
                   {errors.start_date && <p className="text-sm text-destructive">{errors.start_date}</p>}
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="end_date">End Date <span className="text-destructive">*</span></Label>
                   <Input
                     id="end_date"
                     type="date"
                     value={formData.end_date}
                     onChange={(e) => updateField('end_date', e.target.value)}
                     className={cn(errors.end_date && 'border-destructive')}
                   />
                   {errors.end_date && <p className="text-sm text-destructive">{errors.end_date}</p>}
                 </div>
                 <div className="space-y-2 md:col-span-2">
                   <Label htmlFor="description">Description</Label>
                   <Textarea
                     id="description"
                     placeholder="Describe scheme benefits..."
                     value={formData.description}
                     onChange={(e) => updateField('description', e.target.value)}
                     rows={3}
                   />
                 </div>
               </div>
             </CardContent>
           </Card>
 
            {/* Selected Outlets Section - Only show when Selected Outlets is chosen */}
            {formData.applicability === 'selected_outlets' && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">Select Outlets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Hierarchical Location Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground">Filter by Location</Label>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      {/* State Filter */}
                      <Select
                        value={geoFilter.state}
                        onValueChange={(v) => handleGeoFilterChange('state', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All States" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All States</SelectItem>
                          {states.map((state) => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* City Filter */}
                      <Select
                        value={geoFilter.city}
                        onValueChange={(v) => handleGeoFilterChange('city', v)}
                        disabled={!geoFilter.state}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Cities" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Cities</SelectItem>
                          {availableCities.map((city) => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Territory/Zone Filter */}
                      <Select
                        value={geoFilter.zone}
                        onValueChange={(v) => handleGeoFilterChange('zone', v)}
                        disabled={!geoFilter.state}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Territories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Territories</SelectItem>
                          {availableZones.map((zone) => (
                            <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Clear Filter Button */}
                      {(geoFilter.state || geoFilter.city || geoFilter.zone) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearGeoFilter}
                          className="h-10"
                        >
                          Clear Filter
                        </Button>
                      )}
                    </div>
                    {(geoFilter.state || geoFilter.city || geoFilter.zone) && (
                      <p className="text-xs text-muted-foreground">
                        Showing outlets in: {[geoFilter.state, geoFilter.city, geoFilter.zone].filter(Boolean).join(' → ')}
                      </p>
                    )}
                  </div>

                  {/* Distributors Section */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground">
                      Distributors {distributors.length > 0 && `(${distributors.length})`}
                    </Label>
                    <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                      {distributors.length > 0 ? (
                        distributors.map((outlet) => (
                          <div key={outlet.id} className="flex items-center space-x-3">
                            <Checkbox
                              id={`outlet-${outlet.id}`}
                              checked={formData.selected_outlets.includes(outlet.id)}
                              onCheckedChange={() => toggleOutletSelection(outlet.id)}
                            />
                            <label
                              htmlFor={`outlet-${outlet.id}`}
                              className="text-sm cursor-pointer flex-1"
                            >
                              <span className="font-medium">{outlet.name}</span>
                              <span className="text-muted-foreground ml-2">({outlet.code})</span>
                              {outlet.city && (
                                <span className="text-muted-foreground text-xs ml-2">• {outlet.city}</span>
                              )}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {geoFilter.state ? 'No distributors found for selected location' : 'No distributors available'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Retailers Section */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground">
                      Retailers {retailers.length > 0 && `(${retailers.length})`}
                    </Label>
                    <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                      {retailers.length > 0 ? (
                        retailers.map((outlet) => (
                          <div key={outlet.id} className="flex items-center space-x-3">
                            <Checkbox
                              id={`outlet-${outlet.id}`}
                              checked={formData.selected_outlets.includes(outlet.id)}
                              onCheckedChange={() => toggleOutletSelection(outlet.id)}
                            />
                            <label
                              htmlFor={`outlet-${outlet.id}`}
                              className="text-sm cursor-pointer flex-1"
                            >
                              <span className="font-medium">{outlet.name}</span>
                              <span className="text-muted-foreground ml-2">({outlet.code})</span>
                              {outlet.city && (
                                <span className="text-muted-foreground text-xs ml-2">• {outlet.city}</span>
                              )}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {geoFilter.state ? 'No retailers found for selected location' : 'No retailers available'}
                        </p>
                      )}
                    </div>
                  </div>

                  {formData.selected_outlets.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {formData.selected_outlets.length} outlet(s) selected
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
 
           {/* Dynamic Fields Based on Scheme Type */}
           {renderDynamicFields()}
         </div>
       </div>
 
       {/* Sticky Footer */}
       <div className="border-t bg-card sticky bottom-0 z-10">
         <div className="max-w-5xl mx-auto px-6 py-4">
           <div className="flex items-center justify-end gap-3">
             <Button
               variant="outline"
               onClick={handleReset}
               disabled={isSubmitting}
             >
               <RotateCcw className="h-4 w-4 mr-2" />
               Reset
             </Button>
             <Button
               onClick={handleSubmit}
               disabled={isSubmitting || !isFormValid()}
               className="min-w-[140px]"
             >
               {isSubmitting ? (
                 <>
                   <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                   {isEditing ? 'Updating...' : 'Creating...'}
                 </>
               ) : (
                 isEditing ? 'Update Scheme' : 'Create Scheme'
               )}
             </Button>
           </div>
         </div>
       </div>
     </div>
   );
 }