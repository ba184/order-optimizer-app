 import { useNavigate, useParams } from 'react-router-dom';
 import { motion } from 'framer-motion';
 import {
   ArrowLeft,
   Target as TargetIcon,
   User,
   Calendar,
   TrendingUp,
   IndianRupee,
   Users,
   Store,
   CheckCircle,
   Clock,
   AlertCircle,
   Edit,
   Loader2,
 } from 'lucide-react';
 import { useTargets, Target } from '@/hooks/useTargetsData';
 
 const targetTypeLabels: Record<string, string> = {
   sales: 'Sales Target',
   collection: 'Collection Target',
   visits: 'Visit Target',
   new_outlets: 'New Outlets',
 };
 
 const targetTypeIcons: Record<string, React.ReactNode> = {
   sales: <IndianRupee size={24} />,
   collection: <TrendingUp size={24} />,
   visits: <Users size={24} />,
   new_outlets: <Store size={24} />,
 };
 
 const periodLabels: Record<string, string> = {
   daily: 'Daily',
   weekly: 'Weekly',
   monthly: 'Monthly',
   quarterly: 'Quarterly',
   yearly: 'Yearly',
   custom: 'Custom',
 };
 
 const formatValue = (value: number, type: string) => {
   if (type === 'sales' || type === 'collection') {
     return `₹${(value / 100000).toFixed(2)}L`;
   }
   return value.toString();
 };
 
 const getProgressPercentage = (achieved: number, target: number) => {
   if (target === 0) return 0;
   return Math.min((achieved / target) * 100, 100);
 };
 
 const getProgressColor = (achieved: number, target: number) => {
   const percentage = getProgressPercentage(achieved, target);
   if (percentage >= 100) return 'bg-success';
   if (percentage >= 75) return 'bg-warning';
   if (percentage >= 50) return 'bg-info';
   return 'bg-destructive';
 };
 
 export default function TargetViewPage() {
   const navigate = useNavigate();
   const { id } = useParams();
   const { data: targets = [], isLoading } = useTargets();
 
   const target = targets.find((t) => t.id === id);
 
   if (isLoading) {
     return (
       <div className="flex items-center justify-center h-64">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
     );
   }
 
   if (!target) {
     return (
       <div className="space-y-6">
         <div className="flex items-center gap-4">
           <button
             onClick={() => navigate('/master/targets')}
             className="p-2 hover:bg-muted rounded-lg transition-colors"
           >
             <ArrowLeft size={20} />
           </button>
           <h1 className="text-2xl font-bold text-foreground">Target Not Found</h1>
         </div>
         <div className="bg-card rounded-xl border border-border p-8 text-center">
           <p className="text-muted-foreground">The requested target could not be found.</p>
         </div>
       </div>
     );
   }
 
   const percentage = getProgressPercentage(target.achieved_value, target.target_value);
   const isValueType = target.target_type === 'sales' || target.target_type === 'collection';
 
   const getStatusBadge = () => {
     if (target.status === 'completed' || percentage >= 100) {
       return (
         <div className="flex items-center gap-1.5 text-success bg-success/10 px-4 py-2 rounded-full">
           <CheckCircle size={18} />
           <span className="font-medium">Completed</span>
         </div>
       );
     }
     if (target.status === 'expired') {
       return (
         <div className="flex items-center gap-1.5 text-destructive bg-destructive/10 px-4 py-2 rounded-full">
           <AlertCircle size={18} />
           <span className="font-medium">Expired</span>
         </div>
       );
     }
     return (
       <div className="flex items-center gap-1.5 text-warning bg-warning/10 px-4 py-2 rounded-full">
         <Clock size={18} />
         <span className="font-medium">In Progress</span>
       </div>
     );
   };
 
   return (
     <div className="space-y-6">
       {/* Header */}
       <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
           <button
             onClick={() => navigate('/master/targets')}
             className="p-2 hover:bg-muted rounded-lg transition-colors"
           >
             <ArrowLeft size={20} />
           </button>
           <div>
             <h1 className="text-2xl font-bold text-foreground">Target Details</h1>
             <p className="text-muted-foreground">View target information and progress</p>
           </div>
         </div>
         <button
           onClick={() => navigate(`/master/targets/edit/${target.id}`)}
           className="btn-primary flex items-center gap-2"
         >
           <Edit size={18} />
           Edit Target
         </button>
       </div>
 
       {/* Content */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Main Info Card */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="lg:col-span-2 bg-card rounded-xl border border-border p-6 space-y-6"
         >
           {/* Employee Info */}
           <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
             <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
               <User size={28} className="text-primary" />
             </div>
             <div className="flex-1">
               <p className="text-lg font-semibold text-foreground">
                 {(target.user as any)?.name || 'Unknown'}
               </p>
               <p className="text-muted-foreground">{(target.user as any)?.email}</p>
             </div>
             {getStatusBadge()}
           </div>
 
           {/* Target Type */}
           <div className="flex items-center gap-4">
             <div className="p-4 rounded-xl bg-primary/10 text-primary">
               {targetTypeIcons[target.target_type]}
             </div>
             <div>
               <p className="text-sm text-muted-foreground">Target Type</p>
               <p className="text-xl font-semibold text-foreground">
                 {targetTypeLabels[target.target_type]}
               </p>
             </div>
           </div>
 
           {/* Progress Section */}
           <div className="bg-muted/30 rounded-xl p-6">
             <div className="flex justify-between items-center mb-4">
               <span className="text-muted-foreground font-medium">Progress</span>
               <span
                 className={`text-2xl font-bold ${
                   percentage >= 100
                     ? 'text-success'
                     : percentage >= 75
                     ? 'text-warning'
                     : 'text-foreground'
                 }`}
               >
                 {percentage.toFixed(0)}%
               </span>
             </div>
             <div className="h-4 rounded-full bg-muted overflow-hidden mb-4">
               <div
                 className={`h-full rounded-full transition-all ${getProgressColor(
                   target.achieved_value,
                   target.target_value
                 )}`}
                 style={{ width: `${percentage}%` }}
               />
             </div>
             <div className="flex justify-between">
               <div>
                 <p className="text-sm text-muted-foreground">Achieved</p>
                 <p className="text-xl font-semibold text-foreground">
                   {isValueType
                     ? formatValue(target.achieved_value, target.target_type)
                     : target.achieved_value}
                 </p>
               </div>
               <div className="text-right">
                 <p className="text-sm text-muted-foreground">
                   {isValueType ? 'Target Value' : 'Target Count'}
                 </p>
                 <p className="text-xl font-semibold text-foreground">
                   {isValueType
                     ? formatValue(target.target_value, target.target_type)
                     : target.target_value}
                 </p>
               </div>
             </div>
           </div>
         </motion.div>
 
         {/* Side Info Card */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="bg-card rounded-xl border border-border p-6 space-y-6"
         >
           {/* Period */}
           <div className="bg-muted/30 rounded-xl p-4">
             <div className="flex items-center gap-2 mb-2">
               <Calendar size={18} className="text-muted-foreground" />
               <p className="text-sm text-muted-foreground">Period</p>
             </div>
             <p className="text-lg font-semibold text-foreground">{periodLabels[target.period]}</p>
           </div>
 
           {/* Status */}
           <div className="bg-muted/30 rounded-xl p-4">
             <div className="flex items-center gap-2 mb-2">
               <TargetIcon size={18} className="text-muted-foreground" />
               <p className="text-sm text-muted-foreground">Status</p>
             </div>
             <p className="text-lg font-semibold text-foreground capitalize">{target.status}</p>
           </div>
 
           {/* Date Range */}
           <div className="bg-muted/30 rounded-xl p-4">
             <p className="text-sm text-muted-foreground mb-2">Date Range</p>
             <p className="font-medium text-foreground">
               {new Date(target.start_date).toLocaleDateString('en-IN', {
                 day: 'numeric',
                 month: 'short',
                 year: 'numeric',
               })}
             </p>
             <p className="text-muted-foreground my-1">to</p>
             <p className="font-medium text-foreground">
               {new Date(target.end_date).toLocaleDateString('en-IN', {
                 day: 'numeric',
                 month: 'short',
                 year: 'numeric',
               })}
             </p>
           </div>
 
           {/* Created At */}
           <div className="bg-muted/30 rounded-xl p-4">
             <p className="text-sm text-muted-foreground mb-2">Created</p>
             <p className="font-medium text-foreground">
               {new Date(target.created_at).toLocaleDateString('en-IN', {
                 day: 'numeric',
                 month: 'short',
                 year: 'numeric',
                 hour: '2-digit',
                 minute: '2-digit',
               })}
             </p>
           </div>
         </motion.div>
       </div>
     </div>
   );
 }