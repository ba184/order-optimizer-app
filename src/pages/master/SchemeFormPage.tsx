 import { useState, useEffect } from 'react';
 import { useNavigate, useParams } from 'react-router-dom';
 import { motion } from 'framer-motion';
 import { 
 ArrowLeft, 
 Save, 
 X, 
 Plus, 
 Trash2, 
 Gift, 
 Calendar,
 IndianRupee,
 Percent,
 Package,
 Image,
 Upload,
 Loader2,
 AlertCircle,
 } from 'lucide-react';
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Button } from '@/components/ui/button';
 import { Textarea } from '@/components/ui/textarea';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
 import { Calendar as CalendarComponent } from '@/components/ui/calendar';
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
 import { cn } from '@/lib/utils';
 import { format } from 'date-fns';
 import { toast } from 'sonner';
 import { 
 useSchemes,
 useCreateScheme, 
 useUpdateScheme,
 SchemeType,
 SchemeStatus,
 BenefitType,
 Applicability,
 SlabConfig,
 } from '@/hooks/useSchemesData';
 import { useProducts } from '@/hooks/useProductsData';
 
 type DisplayType = 'pos' | 'rack' | 'banner' | 'standee';
 type RewardType = 'cash' | 'discount' | 'product';
 
 interface SlabRow {
 id: string;
 from_value: number;
 to_value: number;
 discount_percent: number;
 discount_amount: number;
 }
 
 interface BuyXGetYConfig {
 buy_product_id: string;
 buy_quantity: number;
 get_product_id: string;
 get_quantity: number;
 max_free_quantity: number;
 }
 
 interface ComboProduct {
 id: string;
 product_id: string;
 quantity: number;
 }
 
 interface ComboConfig {
 combo_name: string;
 products: ComboProduct[];
 combo_price: number;
 combo_discount: number;
 }
 
 interface BillWiseConfig {
 min_bill_amount: number;
 reward_type: RewardType;
 reward_value: number;
 }
 
 interface ValueWiseConfig {
 slabs: SlabRow[];
 }
 
 interface DisplayConfig {
 display_type: DisplayType;
 target_quantity: number;
 proof_url: string;
 payout_per_display: number;
 }
 
 interface FormData {
 name: string;
 code: string;
 type: SchemeType;
 status: 'active' | 'pending' | 'inactive';
 description: string;
 start_date: Date | undefined;
 end_date: Date | undefined;
 applicability: Applicability;
 benefit_summary: string;
 min_value: number;
 max_benefit: number;
 // Dynamic configs
 slab_config: SlabRow[];
 buy_x_get_y_config: BuyXGetYConfig;
 combo_config: ComboConfig;
 bill_wise_config: BillWiseConfig;
 value_wise_config: ValueWiseConfig;
 display_config: DisplayConfig;
 }
 
 const schemeTypes: { value: SchemeType; label: string }[] = [
 { value: 'slab', label: 'Slab' },
 { value: 'buy_x_get_y', label: 'Buy X Get Y' },
 { value: 'combo', label: 'Combo' },
 { value: 'bill_wise', label: 'Bill-wise' },
 { value: 'value_wise', label: 'Value-wise' },
 { value: 'display', label: 'Display' },
 ];
 
 const statusOptions = [
 { value: 'active', label: 'Active' },
 { value: 'pending', label: 'Pending' },
 { value: 'inactive', label: 'Inactive' },
 ];
 
 const applicabilityOptions: { value: Applicability; label: string }[] = [
 { value: 'all_outlets', label: 'All Outlets' },
 { value: 'distributor', label: 'Distributors' },
 { value: 'retailer', label: 'Retailers' },
 { value: 'segment', label: 'Selected Outlets' },
 { value: 'zone', label: 'Zone' },
 ];
 
 const displayTypes: { value: DisplayType; label: string }[] = [
 { value: 'pos', label: 'POS Display' },
 { value: 'rack', label: 'Rack Display' },
 { value: 'banner', label: 'Banner' },
 { value: 'standee', label: 'Standee' },
 ];
 
 const rewardTypes: { value: RewardType; label: string }[] = [
 { value: 'cash', label: 'Cash' },
 { value: 'discount', label: 'Discount' },
 { value: 'product', label: 'Product' },
 ];
 
 const initialFormData: FormData = {
 name: '',
 code: '',
 type: 'slab',
 status: 'pending',
 description: '',
 start_date: undefined,
 end_date: undefined,
 applicability: 'all_outlets',
 benefit_summary: '',
 min_value: 0,
 max_benefit: 0,
 slab_config: [],
 buy_x_get_y_config: {
   buy_product_id: '',
   buy_quantity: 1,
   get_product_id: '',
   get_quantity: 1,
   max_free_quantity: 10,
 },
 combo_config: {
   combo_name: '',
   products: [],
   combo_price: 0,
   combo_discount: 0,
 },
 bill_wise_config: {
   min_bill_amount: 0,
   reward_type: 'discount',
   reward_value: 0,
 },
 value_wise_config: {
   slabs: [],
 },
 display_config: {
   display_type: 'pos',
   target_quantity: 1,
   proof_url: '',
   payout_per_display: 0,
 },
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
 
 // Load existing scheme data for editing
 useEffect(() => {
   if (isEditing && schemes.length > 0) {
     const scheme = schemes.find(s => s.id === id);
     if (scheme) {
       setFormData({
         ...initialFormData,
         name: scheme.name,
         code: scheme.code || '',
         type: scheme.type,
         status: scheme.status === 'draft' ? 'pending' : scheme.status as 'active' | 'pending' | 'inactive',
         description: scheme.description || '',
         start_date: scheme.start_date ? new Date(scheme.start_date) : undefined,
         end_date: scheme.end_date ? new Date(scheme.end_date) : undefined,
         applicability: scheme.applicability,
         benefit_summary: '',
         min_value: scheme.min_order_value || 0,
         max_benefit: scheme.max_benefit || 0,
         slab_config: (scheme.slab_config || []).map((s, i) => ({
           id: `slab-${i}`,
           from_value: s.min_qty,
           to_value: s.max_qty,
           discount_percent: s.benefit_value,
           discount_amount: 0,
         })),
       });
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
 
   if (!formData.name.trim()) {
     newErrors.name = 'Scheme name is required';
   }
   if (!formData.code.trim()) {
     newErrors.code = 'Scheme code is required';
   }
   if (!formData.start_date) {
     newErrors.start_date = 'Start date is required';
   }
   if (!formData.end_date) {
     newErrors.end_date = 'End date is required';
   }
   if (formData.start_date && formData.end_date && formData.end_date <= formData.start_date) {
     newErrors.end_date = 'End date must be after start date';
   }
 
   // Validate dynamic fields based on type
   if (formData.type === 'slab' && formData.slab_config.length === 0) {
     newErrors.slab_config = 'At least one slab is required';
   }
 
   setErrors(newErrors);
   return Object.keys(newErrors).length === 0;
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
       start_date: formData.start_date ? format(formData.start_date, 'yyyy-MM-dd') : '',
       end_date: formData.end_date ? format(formData.end_date, 'yyyy-MM-dd') : '',
       status: formData.status === 'inactive' ? 'cancelled' : formData.status as SchemeStatus,
       applicability: formData.applicability,
       min_order_value: formData.min_value,
       max_benefit: formData.max_benefit,
       slab_config: formData.slab_config.map(s => ({
         min_qty: s.from_value,
         max_qty: s.to_value,
         benefit_value: s.discount_percent || s.discount_amount,
       })),
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
 
 // Slab management
 const addSlabRow = () => {
   const lastSlab = formData.slab_config[formData.slab_config.length - 1];
   const newSlab: SlabRow = {
     id: `slab-${Date.now()}`,
     from_value: lastSlab ? lastSlab.to_value + 1 : 1,
     to_value: lastSlab ? lastSlab.to_value + 100 : 100,
     discount_percent: 0,
     discount_amount: 0,
   };
   setFormData(prev => ({
     ...prev,
     slab_config: [...prev.slab_config, newSlab],
   }));
 };
 
 const updateSlabRow = (id: string, field: keyof SlabRow, value: number) => {
   setFormData(prev => ({
     ...prev,
     slab_config: prev.slab_config.map(slab =>
       slab.id === id ? { ...slab, [field]: value } : slab
     ),
   }));
 };
 
 const removeSlabRow = (id: string) => {
   setFormData(prev => ({
     ...prev,
     slab_config: prev.slab_config.filter(slab => slab.id !== id),
   }));
 };
 
 // Combo product management
 const addComboProduct = () => {
   setFormData(prev => ({
     ...prev,
     combo_config: {
       ...prev.combo_config,
       products: [
         ...prev.combo_config.products,
         { id: `combo-${Date.now()}`, product_id: '', quantity: 1 },
       ],
     },
   }));
 };
 
 const updateComboProduct = (id: string, field: keyof ComboProduct, value: string | number) => {
   setFormData(prev => ({
     ...prev,
     combo_config: {
       ...prev.combo_config,
       products: prev.combo_config.products.map(p =>
         p.id === id ? { ...p, [field]: value } : p
       ),
     },
   }));
 };
 
 const removeComboProduct = (id: string) => {
   setFormData(prev => ({
     ...prev,
     combo_config: {
       ...prev.combo_config,
       products: prev.combo_config.products.filter(p => p.id !== id),
     },
   }));
 };
 
 // Value-wise slab management
 const addValueWiseSlab = () => {
   const lastSlab = formData.value_wise_config.slabs[formData.value_wise_config.slabs.length - 1];
   const newSlab: SlabRow = {
     id: `value-${Date.now()}`,
     from_value: lastSlab ? lastSlab.to_value + 1 : 1000,
     to_value: lastSlab ? lastSlab.to_value + 5000 : 5000,
     discount_percent: 0,
     discount_amount: 0,
   };
   setFormData(prev => ({
     ...prev,
     value_wise_config: {
       ...prev.value_wise_config,
       slabs: [...prev.value_wise_config.slabs, newSlab],
     },
   }));
 };
 
 const updateValueWiseSlab = (id: string, field: keyof SlabRow, value: number) => {
   setFormData(prev => ({
     ...prev,
     value_wise_config: {
       ...prev.value_wise_config,
       slabs: prev.value_wise_config.slabs.map(slab =>
         slab.id === id ? { ...slab, [field]: value } : slab
       ),
     },
   }));
 };
 
 const removeValueWiseSlab = (id: string) => {
   setFormData(prev => ({
     ...prev,
     value_wise_config: {
       ...prev.value_wise_config,
       slabs: prev.value_wise_config.slabs.filter(slab => slab.id !== id),
     },
   }));
 };
 
 const renderDynamicFields = () => {
   switch (formData.type) {
     case 'slab':
       return (
         <Card className="border-dashed">
           <CardHeader className="pb-3">
             <div className="flex items-center justify-between">
               <div>
                 <CardTitle className="text-lg flex items-center gap-2">
                   <Percent className="h-5 w-5 text-primary" />
                   Slab Configuration
                 </CardTitle>
                 <CardDescription>Define quantity/value slabs and their discounts</CardDescription>
               </div>
               <Button variant="outline" size="sm" onClick={addSlabRow}>
                 <Plus className="h-4 w-4 mr-1" />
                 Add Slab
               </Button>
             </div>
           </CardHeader>
           <CardContent>
             {formData.slab_config.length === 0 ? (
               <div className="text-center py-8 border-2 border-dashed rounded-xl">
                 <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                 <p className="text-muted-foreground">No slabs configured yet</p>
                 <Button variant="outline" size="sm" className="mt-3" onClick={addSlabRow}>
                   <Plus className="h-4 w-4 mr-1" />
                   Add First Slab
                 </Button>
               </div>
             ) : (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>From Qty/Value</TableHead>
                     <TableHead>To Qty/Value</TableHead>
                     <TableHead>Discount (%)</TableHead>
                     <TableHead>Discount (₹)</TableHead>
                     <TableHead className="w-16"></TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {formData.slab_config.map((slab) => (
                     <TableRow key={slab.id}>
                       <TableCell>
                         <Input
                           type="number"
                           value={slab.from_value}
                           onChange={(e) => updateSlabRow(slab.id, 'from_value', Number(e.target.value))}
                           className="w-24"
                         />
                       </TableCell>
                       <TableCell>
                         <Input
                           type="number"
                           value={slab.to_value}
                           onChange={(e) => updateSlabRow(slab.id, 'to_value', Number(e.target.value))}
                           className="w-24"
                         />
                       </TableCell>
                       <TableCell>
                         <Input
                           type="number"
                           value={slab.discount_percent}
                           onChange={(e) => updateSlabRow(slab.id, 'discount_percent', Number(e.target.value))}
                           className="w-24"
                           placeholder="0"
                         />
                       </TableCell>
                       <TableCell>
                         <Input
                           type="number"
                           value={slab.discount_amount}
                           onChange={(e) => updateSlabRow(slab.id, 'discount_amount', Number(e.target.value))}
                           className="w-24"
                           placeholder="0"
                         />
                       </TableCell>
                       <TableCell>
                         <Button
                           variant="ghost"
                           size="icon"
                           onClick={() => removeSlabRow(slab.id)}
                           className="text-destructive hover:text-destructive"
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             )}
             {errors.slab_config && (
               <p className="text-sm text-destructive mt-2 flex items-center gap-1">
                 <AlertCircle className="h-4 w-4" />
                 {errors.slab_config}
               </p>
             )}
           </CardContent>
         </Card>
       );
 
     case 'buy_x_get_y':
       return (
         <Card className="border-dashed">
           <CardHeader className="pb-3">
             <CardTitle className="text-lg flex items-center gap-2">
               <Gift className="h-5 w-5 text-success" />
               Buy X Get Y Configuration
             </CardTitle>
             <CardDescription>Configure the buy and get quantities with products</CardDescription>
           </CardHeader>
           <CardContent className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-4 p-4 bg-muted/30 rounded-xl">
                 <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">Buy Condition</h4>
                 <div className="space-y-3">
                   <div>
                     <Label>Buy Product</Label>
                     <Select
                       value={formData.buy_x_get_y_config.buy_product_id}
                       onValueChange={(v) =>
                         setFormData(prev => ({
                           ...prev,
                           buy_x_get_y_config: { ...prev.buy_x_get_y_config, buy_product_id: v },
                         }))
                       }
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Select product" />
                       </SelectTrigger>
                       <SelectContent>
                         {products.map((p) => (
                           <SelectItem key={p.id} value={p.id}>
                             {p.name} ({p.sku})
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                   <div>
                     <Label>Buy Quantity</Label>
                     <Input
                       type="number"
                       min={1}
                       value={formData.buy_x_get_y_config.buy_quantity}
                       onChange={(e) =>
                         setFormData(prev => ({
                           ...prev,
                           buy_x_get_y_config: { ...prev.buy_x_get_y_config, buy_quantity: Number(e.target.value) },
                         }))
                       }
                     />
                   </div>
                 </div>
               </div>
 
               <div className="space-y-4 p-4 bg-success/5 rounded-xl border border-success/20">
                 <h4 className="font-medium text-sm uppercase tracking-wide text-success">Get Reward</h4>
                 <div className="space-y-3">
                   <div>
                     <Label>Get Product</Label>
                     <Select
                       value={formData.buy_x_get_y_config.get_product_id}
                       onValueChange={(v) =>
                         setFormData(prev => ({
                           ...prev,
                           buy_x_get_y_config: { ...prev.buy_x_get_y_config, get_product_id: v },
                         }))
                       }
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Select product" />
                       </SelectTrigger>
                       <SelectContent>
                         {products.map((p) => (
                           <SelectItem key={p.id} value={p.id}>
                             {p.name} ({p.sku})
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                   <div>
                     <Label>Get Quantity (Free)</Label>
                     <Input
                       type="number"
                       min={1}
                       value={formData.buy_x_get_y_config.get_quantity}
                       onChange={(e) =>
                         setFormData(prev => ({
                           ...prev,
                           buy_x_get_y_config: { ...prev.buy_x_get_y_config, get_quantity: Number(e.target.value) },
                         }))
                       }
                     />
                   </div>
                 </div>
               </div>
             </div>
 
             <div className="max-w-xs">
               <Label>Maximum Free Quantity (Per Order)</Label>
               <Input
                 type="number"
                 min={1}
                 value={formData.buy_x_get_y_config.max_free_quantity}
                 onChange={(e) =>
                   setFormData(prev => ({
                     ...prev,
                     buy_x_get_y_config: { ...prev.buy_x_get_y_config, max_free_quantity: Number(e.target.value) },
                   }))
                 }
               />
             </div>
           </CardContent>
         </Card>
       );
 
     case 'combo':
       return (
         <Card className="border-dashed">
           <CardHeader className="pb-3">
             <div className="flex items-center justify-between">
               <div>
                 <CardTitle className="text-lg flex items-center gap-2">
                   <Package className="h-5 w-5 text-secondary" />
                   Combo Configuration
                 </CardTitle>
                 <CardDescription>Create a product bundle with special pricing</CardDescription>
               </div>
               <Button variant="outline" size="sm" onClick={addComboProduct}>
                 <Plus className="h-4 w-4 mr-1" />
                 Add Product
               </Button>
             </div>
           </CardHeader>
           <CardContent className="space-y-6">
             <div className="max-w-md">
               <Label>Combo Name</Label>
               <Input
                 value={formData.combo_config.combo_name}
                 onChange={(e) =>
                   setFormData(prev => ({
                     ...prev,
                     combo_config: { ...prev.combo_config, combo_name: e.target.value },
                   }))
                 }
                 placeholder="e.g., Summer Bundle, Value Pack"
               />
             </div>
 
             {formData.combo_config.products.length === 0 ? (
               <div className="text-center py-8 border-2 border-dashed rounded-xl">
                 <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                 <p className="text-muted-foreground">No products in combo yet</p>
                 <Button variant="outline" size="sm" className="mt-3" onClick={addComboProduct}>
                   <Plus className="h-4 w-4 mr-1" />
                   Add First Product
                 </Button>
               </div>
             ) : (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Product</TableHead>
                     <TableHead className="w-32">Quantity</TableHead>
                     <TableHead className="w-16"></TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {formData.combo_config.products.map((product) => (
                     <TableRow key={product.id}>
                       <TableCell>
                         <Select
                           value={product.product_id}
                           onValueChange={(v) => updateComboProduct(product.id, 'product_id', v)}
                         >
                           <SelectTrigger>
                             <SelectValue placeholder="Select product" />
                           </SelectTrigger>
                           <SelectContent>
                             {products.map((p) => (
                               <SelectItem key={p.id} value={p.id}>
                                 {p.name} ({p.sku})
                               </SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                       </TableCell>
                       <TableCell>
                         <Input
                           type="number"
                           min={1}
                           value={product.quantity}
                           onChange={(e) => updateComboProduct(product.id, 'quantity', Number(e.target.value))}
                         />
                       </TableCell>
                       <TableCell>
                         <Button
                           variant="ghost"
                           size="icon"
                           onClick={() => removeComboProduct(product.id)}
                           className="text-destructive hover:text-destructive"
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             )}
 
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
               <div>
                 <Label>Combo Price (₹)</Label>
                 <div className="relative">
                   <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                   <Input
                     type="number"
                     min={0}
                     value={formData.combo_config.combo_price}
                     onChange={(e) =>
                       setFormData(prev => ({
                         ...prev,
                         combo_config: { ...prev.combo_config, combo_price: Number(e.target.value) },
                       }))
                     }
                     className="pl-9"
                   />
                 </div>
               </div>
               <div>
                 <Label>Combo Discount (%)</Label>
                 <div className="relative">
                   <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                   <Input
                     type="number"
                     min={0}
                     max={100}
                     value={formData.combo_config.combo_discount}
                     onChange={(e) =>
                       setFormData(prev => ({
                         ...prev,
                         combo_config: { ...prev.combo_config, combo_discount: Number(e.target.value) },
                       }))
                     }
                     className="pl-9"
                   />
                 </div>
               </div>
             </div>
           </CardContent>
         </Card>
       );
 
     case 'bill_wise':
       return (
         <Card className="border-dashed">
           <CardHeader className="pb-3">
             <CardTitle className="text-lg flex items-center gap-2">
               <IndianRupee className="h-5 w-5 text-info" />
               Bill-wise Configuration
             </CardTitle>
             <CardDescription>Set minimum bill amount and reward type</CardDescription>
           </CardHeader>
           <CardContent>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div>
                 <Label>Minimum Bill Amount (₹)</Label>
                 <div className="relative">
                   <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                   <Input
                     type="number"
                     min={0}
                     value={formData.bill_wise_config.min_bill_amount}
                     onChange={(e) =>
                       setFormData(prev => ({
                         ...prev,
                         bill_wise_config: { ...prev.bill_wise_config, min_bill_amount: Number(e.target.value) },
                       }))
                     }
                     className="pl-9"
                   />
                 </div>
               </div>
               <div>
                 <Label>Reward Type</Label>
                 <Select
                   value={formData.bill_wise_config.reward_type}
                   onValueChange={(v: RewardType) =>
                     setFormData(prev => ({
                       ...prev,
                       bill_wise_config: { ...prev.bill_wise_config, reward_type: v },
                     }))
                   }
                 >
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     {rewardTypes.map((rt) => (
                       <SelectItem key={rt.value} value={rt.value}>
                         {rt.label}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
               <div>
                 <Label>
                   Reward Value {formData.bill_wise_config.reward_type === 'discount' ? '(%)' : '(₹)'}
                 </Label>
                 <Input
                   type="number"
                   min={0}
                   value={formData.bill_wise_config.reward_value}
                   onChange={(e) =>
                     setFormData(prev => ({
                       ...prev,
                       bill_wise_config: { ...prev.bill_wise_config, reward_value: Number(e.target.value) },
                     }))
                   }
                 />
               </div>
             </div>
           </CardContent>
         </Card>
       );
 
     case 'value_wise':
       return (
         <Card className="border-dashed">
           <CardHeader className="pb-3">
             <div className="flex items-center justify-between">
               <div>
                 <CardTitle className="text-lg flex items-center gap-2">
                   <IndianRupee className="h-5 w-5 text-warning" />
                   Value-wise Configuration
                 </CardTitle>
                 <CardDescription>Configure purchase value slabs and rewards</CardDescription>
               </div>
               <Button variant="outline" size="sm" onClick={addValueWiseSlab}>
                 <Plus className="h-4 w-4 mr-1" />
                 Add Slab
               </Button>
             </div>
           </CardHeader>
           <CardContent>
             {formData.value_wise_config.slabs.length === 0 ? (
               <div className="text-center py-8 border-2 border-dashed rounded-xl">
                 <IndianRupee className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                 <p className="text-muted-foreground">No value slabs configured yet</p>
                 <Button variant="outline" size="sm" className="mt-3" onClick={addValueWiseSlab}>
                   <Plus className="h-4 w-4 mr-1" />
                   Add First Slab
                 </Button>
               </div>
             ) : (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>From Value (₹)</TableHead>
                     <TableHead>To Value (₹)</TableHead>
                     <TableHead>Reward (%)</TableHead>
                     <TableHead>Reward Amount (₹)</TableHead>
                     <TableHead className="w-16"></TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {formData.value_wise_config.slabs.map((slab) => (
                     <TableRow key={slab.id}>
                       <TableCell>
                         <Input
                           type="number"
                           value={slab.from_value}
                           onChange={(e) => updateValueWiseSlab(slab.id, 'from_value', Number(e.target.value))}
                           className="w-28"
                         />
                       </TableCell>
                       <TableCell>
                         <Input
                           type="number"
                           value={slab.to_value}
                           onChange={(e) => updateValueWiseSlab(slab.id, 'to_value', Number(e.target.value))}
                           className="w-28"
                         />
                       </TableCell>
                       <TableCell>
                         <Input
                           type="number"
                           value={slab.discount_percent}
                           onChange={(e) => updateValueWiseSlab(slab.id, 'discount_percent', Number(e.target.value))}
                           className="w-24"
                         />
                       </TableCell>
                       <TableCell>
                         <Input
                           type="number"
                           value={slab.discount_amount}
                           onChange={(e) => updateValueWiseSlab(slab.id, 'discount_amount', Number(e.target.value))}
                           className="w-28"
                         />
                       </TableCell>
                       <TableCell>
                         <Button
                           variant="ghost"
                           size="icon"
                           onClick={() => removeValueWiseSlab(slab.id)}
                           className="text-destructive hover:text-destructive"
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             )}
           </CardContent>
         </Card>
       );
 
     case 'display':
       return (
         <Card className="border-dashed">
           <CardHeader className="pb-3">
             <CardTitle className="text-lg flex items-center gap-2">
               <Image className="h-5 w-5 text-accent-foreground" />
               Display Scheme Configuration
             </CardTitle>
             <CardDescription>Configure display type, targets and payouts</CardDescription>
           </CardHeader>
           <CardContent>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <div>
                 <Label>Display Type</Label>
                 <Select
                   value={formData.display_config.display_type}
                   onValueChange={(v: DisplayType) =>
                     setFormData(prev => ({
                       ...prev,
                       display_config: { ...prev.display_config, display_type: v },
                     }))
                   }
                 >
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     {displayTypes.map((dt) => (
                       <SelectItem key={dt.value} value={dt.value}>
                         {dt.label}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
               <div>
                 <Label>Target Quantity</Label>
                 <Input
                   type="number"
                   min={1}
                   value={formData.display_config.target_quantity}
                   onChange={(e) =>
                     setFormData(prev => ({
                       ...prev,
                       display_config: { ...prev.display_config, target_quantity: Number(e.target.value) },
                     }))
                   }
                 />
               </div>
               <div>
                 <Label>Payout Per Display (₹)</Label>
                 <div className="relative">
                   <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                   <Input
                     type="number"
                     min={0}
                     value={formData.display_config.payout_per_display}
                     onChange={(e) =>
                       setFormData(prev => ({
                         ...prev,
                         display_config: { ...prev.display_config, payout_per_display: Number(e.target.value) },
                       }))
                     }
                     className="pl-9"
                   />
                 </div>
               </div>
               <div>
                 <Label>Display Proof Upload</Label>
                 <div className="flex items-center gap-2">
                   <Button variant="outline" className="w-full">
                     <Upload className="h-4 w-4 mr-2" />
                     Upload Image/PDF
                   </Button>
                 </div>
               </div>
             </div>
           </CardContent>
         </Card>
       );
 
     default:
       return null;
   }
 };
 
 return (
   <div className="min-h-screen bg-background">
     {/* Header */}
     <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
       <div className="flex items-center justify-between px-6 py-4">
         <div className="flex items-center gap-4">
           <Button variant="ghost" size="icon" onClick={() => navigate('/master/schemes')}>
             <ArrowLeft className="h-5 w-5" />
           </Button>
           <div>
             <h1 className="text-xl font-semibold">
               {isEditing ? 'Edit Scheme' : 'Create New Scheme'}
             </h1>
             <p className="text-sm text-muted-foreground">
               {isEditing ? 'Update scheme details and configuration' : 'Configure a new promotional scheme'}
             </p>
           </div>
         </div>
         <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
             <Gift className="h-4 w-4 text-primary" />
             <span className="text-sm font-medium text-primary">
               {schemeTypes.find(t => t.value === formData.type)?.label || 'Scheme'}
             </span>
           </div>
         </div>
       </div>
     </div>
 
     {/* Form Content */}
     <div className="max-w-6xl mx-auto px-6 py-8 pb-32">
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="space-y-8"
       >
         {/* Default Fields Card */}
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Gift className="h-5 w-5 text-primary" />
               Scheme Information
             </CardTitle>
             <CardDescription>Basic details about the scheme</CardDescription>
           </CardHeader>
           <CardContent className="space-y-6">
             {/* Row 1: Name, Code, Type */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-2">
                 <Label htmlFor="name">
                   Scheme Name <span className="text-destructive">*</span>
                 </Label>
                 <Input
                   id="name"
                   value={formData.name}
                   onChange={(e) => updateField('name', e.target.value)}
                   placeholder="e.g., Summer Sale 2025"
                   className={errors.name ? 'border-destructive' : ''}
                 />
                 {errors.name && (
                   <p className="text-sm text-destructive flex items-center gap-1">
                     <AlertCircle className="h-3 w-3" />
                     {errors.name}
                   </p>
                 )}
               </div>
 
               <div className="space-y-2">
                 <Label htmlFor="code">
                   Scheme Code <span className="text-destructive">*</span>
                 </Label>
                 <Input
                   id="code"
                   value={formData.code}
                   onChange={(e) => updateField('code', e.target.value.toUpperCase())}
                   placeholder="e.g., SUMMER25"
                   className={errors.code ? 'border-destructive' : ''}
                 />
                 {errors.code && (
                   <p className="text-sm text-destructive flex items-center gap-1">
                     <AlertCircle className="h-3 w-3" />
                     {errors.code}
                   </p>
                 )}
               </div>
 
               <div className="space-y-2">
                 <Label>Scheme Type</Label>
                 <Select
                   value={formData.type}
                   onValueChange={(v: SchemeType) => updateField('type', v)}
                 >
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     {schemeTypes.map((type) => (
                       <SelectItem key={type.value} value={type.value}>
                         {type.label}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
             </div>
 
             {/* Row 2: Status, Applicability */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <Label>Status</Label>
                 <Select
                   value={formData.status}
                   onValueChange={(v: 'active' | 'pending' | 'inactive') => updateField('status', v)}
                 >
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     {statusOptions.map((status) => (
                       <SelectItem key={status.value} value={status.value}>
                         {status.label}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
 
               <div className="space-y-2">
                 <Label>Applicability</Label>
                 <Select
                   value={formData.applicability}
                   onValueChange={(v: Applicability) => updateField('applicability', v)}
                 >
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     {applicabilityOptions.map((opt) => (
                       <SelectItem key={opt.value} value={opt.value}>
                         {opt.label}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
             </div>
 
             {/* Row 3: Start Date, End Date */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <Label>
                   Start Date <span className="text-destructive">*</span>
                 </Label>
                 <Popover>
                   <PopoverTrigger asChild>
                     <Button
                       variant="outline"
                       className={cn(
                         'w-full justify-start text-left font-normal',
                         !formData.start_date && 'text-muted-foreground',
                         errors.start_date && 'border-destructive'
                       )}
                     >
                       <Calendar className="mr-2 h-4 w-4" />
                       {formData.start_date ? format(formData.start_date, 'PPP') : 'Select start date'}
                     </Button>
                   </PopoverTrigger>
                   <PopoverContent className="w-auto p-0" align="start">
                     <CalendarComponent
                       mode="single"
                       selected={formData.start_date}
                       onSelect={(date) => updateField('start_date', date)}
                       initialFocus
                       className="p-3 pointer-events-auto"
                     />
                   </PopoverContent>
                 </Popover>
                 {errors.start_date && (
                   <p className="text-sm text-destructive flex items-center gap-1">
                     <AlertCircle className="h-3 w-3" />
                     {errors.start_date}
                   </p>
                 )}
               </div>
 
               <div className="space-y-2">
                 <Label>
                   End Date <span className="text-destructive">*</span>
                 </Label>
                 <Popover>
                   <PopoverTrigger asChild>
                     <Button
                       variant="outline"
                       className={cn(
                         'w-full justify-start text-left font-normal',
                         !formData.end_date && 'text-muted-foreground',
                         errors.end_date && 'border-destructive'
                       )}
                     >
                       <Calendar className="mr-2 h-4 w-4" />
                       {formData.end_date ? format(formData.end_date, 'PPP') : 'Select end date'}
                     </Button>
                   </PopoverTrigger>
                   <PopoverContent className="w-auto p-0" align="start">
                     <CalendarComponent
                       mode="single"
                       selected={formData.end_date}
                       onSelect={(date) => updateField('end_date', date)}
                       initialFocus
                       className="p-3 pointer-events-auto"
                     />
                   </PopoverContent>
                 </Popover>
                 {errors.end_date && (
                   <p className="text-sm text-destructive flex items-center gap-1">
                     <AlertCircle className="h-3 w-3" />
                     {errors.end_date}
                   </p>
                 )}
               </div>
             </div>
 
             {/* Row 4: Description */}
             <div className="space-y-2">
               <Label htmlFor="description">Description</Label>
               <Textarea
                 id="description"
                 value={formData.description}
                 onChange={(e) => updateField('description', e.target.value)}
                 placeholder="Enter scheme description and terms..."
                 rows={3}
               />
             </div>
 
             {/* Row 5: Benefit Summary, Min Value, Max Benefit */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-2">
                 <Label htmlFor="benefit_summary">Benefit Summary</Label>
                 <Input
                   id="benefit_summary"
                   value={formData.benefit_summary}
                   onChange={(e) => updateField('benefit_summary', e.target.value)}
                   placeholder="e.g., Up to 20% off"
                 />
               </div>
 
               <div className="space-y-2">
                 <Label htmlFor="min_value">Min Value (₹)</Label>
                 <div className="relative">
                   <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                   <Input
                     id="min_value"
                     type="number"
                     min={0}
                     value={formData.min_value}
                     onChange={(e) => updateField('min_value', Number(e.target.value))}
                     className="pl-9"
                     placeholder="0"
                   />
                 </div>
               </div>
 
               <div className="space-y-2">
                 <Label htmlFor="max_benefit">Max Benefit (₹)</Label>
                 <div className="relative">
                   <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                   <Input
                     id="max_benefit"
                     type="number"
                     min={0}
                     value={formData.max_benefit}
                     onChange={(e) => updateField('max_benefit', Number(e.target.value))}
                     className="pl-9"
                     placeholder="0"
                   />
                 </div>
               </div>
             </div>
           </CardContent>
         </Card>
 
         {/* Dynamic Fields Based on Scheme Type */}
         <motion.div
           key={formData.type}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.2 }}
         >
           {renderDynamicFields()}
         </motion.div>
       </motion.div>
     </div>
 
     {/* Sticky Footer */}
     <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t z-20">
       <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
         <div className="text-sm text-muted-foreground">
           <span className="text-destructive">*</span> indicates required fields
         </div>
         <div className="flex items-center gap-3">
           <Button variant="outline" onClick={() => navigate('/master/schemes')}>
             <X className="h-4 w-4 mr-2" />
             Cancel
           </Button>
           <Button onClick={handleSubmit} disabled={isSubmitting}>
             {isSubmitting ? (
               <>
                 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                 {isEditing ? 'Updating...' : 'Creating...'}
               </>
             ) : (
               <>
                 <Save className="h-4 w-4 mr-2" />
                 {isEditing ? 'Update Scheme' : 'Create Scheme'}
               </>
             )}
           </Button>
         </div>
       </div>
     </div>
   </div>
 );
 }