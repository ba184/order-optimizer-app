 import { useState, useEffect } from 'react';
 import { useNavigate, useParams } from 'react-router-dom';
 import { ArrowLeft, RotateCcw, Loader2 } from 'lucide-react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Button } from '@/components/ui/button';
 import { Textarea } from '@/components/ui/textarea';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
 
 type BenefitTypeOption = 'flat' | 'percentage';
 
 interface FormData {
   // Default fields
   name: string;
   code: string;
   type: SchemeType;
   applicability: Applicability;
   status: 'active' | 'pending' | 'inactive';
   start_date: string;
   end_date: string;
   description: string;
   // Slab fields
   slab_min_order_value: number;
   slab_benefit_type: BenefitTypeOption;
   slab_benefit_value: number;
   slab_max_benefit: number;
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
 
 const applicabilityOptions: { value: Applicability; label: string }[] = [
   { value: 'all_outlets', label: 'All Outlets' },
   { value: 'segment', label: 'Selected Outlets' },
 ];
 
 const benefitTypeOptions = [
   { value: 'flat', label: 'Flat' },
   { value: 'percentage', label: 'Percentage' },
 ];
 
 const initialFormData: FormData = {
   name: '',
   code: '',
   type: 'slab',
   applicability: 'all_outlets',
   status: 'pending',
   start_date: '',
   end_date: '',
   description: '',
   slab_min_order_value: 0,
   slab_benefit_type: 'flat',
   slab_benefit_value: 0,
   slab_max_benefit: 0,
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
 
 export default function SchemeFormPage() {
   const navigate = useNavigate();
   const { id } = useParams();
   const isEditing = !!id;
 
   const { data: schemes = [] } = useSchemes();
   const { data: products = [] } = useProducts();
   const createScheme = useCreateScheme();
   const updateScheme = useUpdateScheme();
 
   const [formData, setFormData] = useState<FormData>(initialFormData);
   const [errors, setErrors] = useState<Record<string, string>>({});
   const [isSubmitting, setIsSubmitting] = useState(false);
 
   useEffect(() => {
     if (isEditing && schemes.length > 0) {
       const scheme = schemes.find(s => s.id === id);
       if (scheme) {
         setFormData(prev => ({
           ...prev,
           name: scheme.name,
           code: scheme.code || '',
           type: scheme.type,
           status: scheme.status === 'draft' ? 'pending' : scheme.status as 'active' | 'pending' | 'inactive',
           description: scheme.description || '',
           start_date: scheme.start_date || '',
           end_date: scheme.end_date || '',
           applicability: scheme.applicability,
           slab_min_order_value: scheme.min_order_value || 0,
           slab_max_benefit: scheme.max_benefit || 0,
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
 
   const validateForm = (): boolean => {
     const newErrors: Record<string, string> = {};
     if (!formData.name.trim()) newErrors.name = 'Scheme name is required';
     if (!formData.code.trim()) newErrors.code = 'Scheme code is required';
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
       formData.code.trim() &&
       formData.start_date &&
       formData.end_date &&
       formData.end_date > formData.start_date
     );
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
         code: formData.code,
         type: formData.type,
         description: formData.description || null,
         start_date: formData.start_date,
         end_date: formData.end_date,
         status: formData.status === 'inactive' ? 'cancelled' : formData.status as SchemeStatus,
         applicability: formData.applicability,
         min_order_value: formData.type === 'slab' ? formData.slab_min_order_value : 
                          formData.type === 'buy_x_get_y' ? formData.bxgy_min_order_value :
                          formData.type === 'value_wise' ? formData.value_min_order_value : 0,
         max_benefit: formData.type === 'slab' && formData.slab_benefit_type === 'percentage' ? formData.slab_max_benefit :
                      formData.type === 'bill_wise' ? formData.bill_max_discount :
                      formData.type === 'value_wise' ? formData.value_max_discount : 0,
         slab_config: [],
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
         <CardTitle className="text-base font-semibold">Slab Configuration</CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="space-y-2">
             <Label htmlFor="slab_min_order_value">Slab Min Order Value</Label>
             <Input
               id="slab_min_order_value"
               type="number"
               min={0}
               placeholder="Enter minimum order value"
               value={formData.slab_min_order_value || ''}
               onChange={(e) => updateField('slab_min_order_value', Number(e.target.value))}
             />
           </div>
           <div className="space-y-2">
             <Label htmlFor="slab_benefit_type">Benefit Type</Label>
             <Select
               value={formData.slab_benefit_type}
               onValueChange={(v: BenefitTypeOption) => updateField('slab_benefit_type', v)}
             >
               <SelectTrigger id="slab_benefit_type">
                 <SelectValue placeholder="Select benefit type" />
               </SelectTrigger>
               <SelectContent>
                 {benefitTypeOptions.map((opt) => (
                   <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
           <div className="space-y-2">
             <Label htmlFor="slab_benefit_value">Benefit Value</Label>
             <Input
               id="slab_benefit_value"
               type="number"
               min={0}
               placeholder={formData.slab_benefit_type === 'percentage' ? 'Enter percentage' : 'Enter amount'}
               value={formData.slab_benefit_value || ''}
               onChange={(e) => updateField('slab_benefit_value', Number(e.target.value))}
             />
           </div>
           {formData.slab_benefit_type === 'percentage' && (
             <div className="space-y-2">
               <Label htmlFor="slab_max_benefit">Slab Max Benefit</Label>
               <Input
                 id="slab_max_benefit"
                 type="number"
                 min={0}
                 placeholder="Enter maximum benefit"
                 value={formData.slab_max_benefit || ''}
                 onChange={(e) => updateField('slab_max_benefit', Number(e.target.value))}
               />
             </div>
           )}
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
                   <Label htmlFor="applicability">Applicability <span className="text-destructive">*</span></Label>
                   <Select
                     value={formData.applicability}
                     onValueChange={(v: Applicability) => updateField('applicability', v)}
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
                 <div className="space-y-2">
                   <Label htmlFor="code">Scheme Code <span className="text-destructive">*</span></Label>
                   <Input
                     id="code"
                     placeholder="Enter unique scheme code"
                     value={formData.code}
                     onChange={(e) => updateField('code', e.target.value.toUpperCase())}
                     className={cn(errors.code && 'border-destructive')}
                   />
                   {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
                 </div>
               </div>
             </CardContent>
           </Card>
 
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