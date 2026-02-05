 import { useState, useEffect } from 'react';
 import { useNavigate, useParams } from 'react-router-dom';
 import { motion } from 'framer-motion';
 import { ArrowLeft, Target as TargetIcon, Save, Loader2 } from 'lucide-react';
 import { useTargets, useCreateTarget, useUpdateTarget, useUsers, Target } from '@/hooks/useTargetsData';
 import { toast } from 'sonner';
 
 interface TargetFormData {
   user_id: string;
   target_type: string;
   target_value: number;
   period: string;
   start_date: string;
   end_date: string;
   status: string;
 }
 
 const periodOptions = [
   { value: 'daily', label: 'Daily' },
   { value: 'weekly', label: 'Weekly' },
   { value: 'monthly', label: 'Monthly' },
   { value: 'yearly', label: 'Yearly' },
   { value: 'custom', label: 'Custom' },
 ];
 
 const targetTypeOptions = [
   { value: 'sales', label: 'Sales', isValue: true },
   { value: 'collection', label: 'Collection', isValue: true },
   { value: 'visits', label: 'Visit', isValue: false },
   { value: 'new_outlets', label: 'New Outlet', isValue: false },
 ];
 
 const statusOptions = [
   { value: 'active', label: 'Active' },
   { value: 'inactive', label: 'Inactive' },
 ];
 
 export default function TargetFormPage() {
   const navigate = useNavigate();
   const { id } = useParams();
   const isEditMode = Boolean(id);
 
   const { data: targets = [], isLoading: isLoadingTargets } = useTargets();
   const { data: users = [], isLoading: isLoadingUsers } = useUsers();
   const createTarget = useCreateTarget();
   const updateTarget = useUpdateTarget();
 
   const [formData, setFormData] = useState<TargetFormData>({
     user_id: '',
     target_type: 'sales',
     target_value: 0,
     period: 'monthly',
     start_date: '',
     end_date: '',
     status: 'active',
   });
 
   useEffect(() => {
     if (isEditMode && targets.length > 0) {
       const target = targets.find((t) => t.id === id);
       if (target) {
         setFormData({
           user_id: target.user_id,
           target_type: target.target_type,
           target_value: target.target_value,
           period: target.period === 'quarterly' ? 'custom' : target.period,
           start_date: target.start_date,
           end_date: target.end_date,
           status: target.status,
         });
       }
     }
   }, [isEditMode, id, targets]);
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     
     if (!formData.user_id || !formData.target_value) {
       toast.error('Please fill in all required fields');
       return;
     }
 
     // Auto-calculate dates for non-custom periods
     let startDate = formData.start_date;
     let endDate = formData.end_date;
 
     if (formData.period !== 'custom') {
       const today = new Date();
       startDate = today.toISOString().split('T')[0];
 
       switch (formData.period) {
         case 'daily':
           endDate = startDate;
           break;
         case 'weekly':
           const weekEnd = new Date(today);
           weekEnd.setDate(today.getDate() + 6);
           endDate = weekEnd.toISOString().split('T')[0];
           break;
         case 'monthly':
           const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
           endDate = monthEnd.toISOString().split('T')[0];
           break;
         case 'yearly':
           const yearEnd = new Date(today.getFullYear(), 11, 31);
           endDate = yearEnd.toISOString().split('T')[0];
           break;
       }
     }
 
     try {
       if (isEditMode && id) {
         await updateTarget.mutateAsync({
           id,
           user_id: formData.user_id,
           target_type: formData.target_type as any,
           target_value: formData.target_value,
           period: formData.period as any,
           start_date: startDate,
           end_date: endDate,
           status: formData.status as any,
         });
       } else {
         await createTarget.mutateAsync({
           user_id: formData.user_id,
           target_type: formData.target_type,
           target_value: formData.target_value,
           period: formData.period,
           start_date: startDate,
           end_date: endDate,
         });
       }
       navigate('/master/targets');
     } catch (error) {
       // Error handled by mutation
     }
   };
 
   const isValueType = targetTypeOptions.find((t) => t.value === formData.target_type)?.isValue;
   const isLoading = createTarget.isPending || updateTarget.isPending;
 
   if (isEditMode && isLoadingTargets) {
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
         <button
           onClick={() => navigate('/master/targets')}
           className="p-2 hover:bg-muted rounded-lg transition-colors"
         >
           <ArrowLeft size={20} />
         </button>
         <div>
           <h1 className="text-2xl font-bold text-foreground">
             {isEditMode ? 'Edit Target' : 'Set New Target'}
           </h1>
           <p className="text-muted-foreground">
             {isEditMode ? 'Update target details' : 'Configure a new target for an employee'}
           </p>
         </div>
       </div>
 
       {/* Form Card */}
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="bg-card rounded-xl border border-border p-6"
       >
         <form onSubmit={handleSubmit} className="space-y-6">
           {/* Target Info Header */}
           <div className="flex items-center gap-3 pb-4 border-b border-border">
             <div className="p-3 rounded-xl bg-primary/10">
               <TargetIcon size={24} className="text-primary" />
             </div>
             <div>
               <h2 className="text-lg font-semibold text-foreground">Target Information</h2>
               <p className="text-sm text-muted-foreground">Define the target parameters</p>
             </div>
           </div>
 
           {/* Form Fields */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="md:col-span-2">
               <label className="block text-sm font-medium text-foreground mb-2">
                 Select Employee *
               </label>
               <select
                 value={formData.user_id}
                 onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                 className="input-field"
                 required
               >
                 <option value="">Select an employee</option>
                 {users.map((user) => (
                   <option key={user.id} value={user.id}>
                     {user.name} ({user.email})
                   </option>
                 ))}
               </select>
             </div>
 
             <div>
               <label className="block text-sm font-medium text-foreground mb-2">
                 Target Type *
               </label>
               <select
                 value={formData.target_type}
                 onChange={(e) => setFormData({ ...formData, target_type: e.target.value })}
                 className="input-field"
                 required
               >
                 {targetTypeOptions.map((opt) => (
                   <option key={opt.value} value={opt.value}>
                     {opt.label}
                   </option>
                 ))}
               </select>
             </div>
 
             <div>
               <label className="block text-sm font-medium text-foreground mb-2">
                 {isValueType ? 'Target Value (₹) *' : 'Target Count *'}
               </label>
               <input
                 type="number"
                 value={formData.target_value || ''}
                 onChange={(e) =>
                   setFormData({ ...formData, target_value: parseFloat(e.target.value) || 0 })
                 }
                 placeholder={isValueType ? '₹500000' : '100'}
                 className="input-field"
                 required
               />
             </div>
 
             <div>
               <label className="block text-sm font-medium text-foreground mb-2">Period *</label>
               <select
                 value={formData.period}
                 onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                 className="input-field"
                 required
               >
                 {periodOptions.map((opt) => (
                   <option key={opt.value} value={opt.value}>
                     {opt.label}
                   </option>
                 ))}
               </select>
             </div>
 
             <div>
               <label className="block text-sm font-medium text-foreground mb-2">Status</label>
               <select
                 value={formData.status}
                 onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                 className="input-field"
               >
                 {statusOptions.map((opt) => (
                   <option key={opt.value} value={opt.value}>
                     {opt.label}
                   </option>
                 ))}
               </select>
             </div>
 
             {formData.period === 'custom' && (
               <>
                 <div>
                   <label className="block text-sm font-medium text-foreground mb-2">
                     Start Date *
                   </label>
                   <input
                     type="date"
                     value={formData.start_date}
                     onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                     className="input-field"
                     required
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-foreground mb-2">
                     End Date *
                   </label>
                   <input
                     type="date"
                     value={formData.end_date}
                     onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                     className="input-field"
                     required
                   />
                 </div>
               </>
             )}
           </div>
 
           {/* Actions */}
           <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
             <button
               type="button"
               onClick={() => navigate('/master/targets')}
               className="btn-outline"
             >
               Cancel
             </button>
             <button type="submit" disabled={isLoading} className="btn-primary flex items-center gap-2">
               {isLoading ? (
                 <Loader2 size={18} className="animate-spin" />
               ) : (
                 <Save size={18} />
               )}
               {isLoading
                 ? isEditMode
                   ? 'Updating...'
                   : 'Creating...'
                 : isEditMode
                 ? 'Update Target'
                 : 'Create Target'}
             </button>
           </div>
         </form>
       </motion.div>
     </div>
   );
 }