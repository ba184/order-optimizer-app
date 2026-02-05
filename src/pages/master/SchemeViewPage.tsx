 import { useNavigate, useParams } from 'react-router-dom';
 import { motion } from 'framer-motion';
 import {
 ArrowLeft,
 Edit,
 Gift,
 Calendar,
 IndianRupee,
 Percent,
 Package,
 Users,
 Clock,
 CheckCircle,
 AlertTriangle,
 Loader2,
 FileCheck,
 } from 'lucide-react';
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
 import { format } from 'date-fns';
 import { useSchemes, SchemeType, SchemeStatus, Applicability, BenefitType } from '@/hooks/useSchemesData';
 
 const schemeTypeLabels: Record<SchemeType, string> = {
 slab: 'Slab',
 buy_x_get_y: 'Buy X Get Y',
 combo: 'Combo',
 value_wise: 'Value-wise',
 bill_wise: 'Bill-wise',
 display: 'Display',
 volume: 'Volume',
 product: 'Product',
 opening: 'Opening',
 };
 
 const typeColors: Record<string, string> = {
 slab: 'bg-primary/10 text-primary border-primary/20',
 buy_x_get_y: 'bg-success/10 text-success border-success/20',
 combo: 'bg-secondary/10 text-secondary border-secondary/20',
 value_wise: 'bg-warning/10 text-warning border-warning/20',
 bill_wise: 'bg-info/10 text-info border-info/20',
 display: 'bg-accent/10 text-accent-foreground border-accent/20',
 };
 
 const statusConfig: Record<SchemeStatus, { color: string; icon: any }> = {
 draft: { color: 'bg-muted text-muted-foreground', icon: Clock },
 pending: { color: 'bg-warning/10 text-warning', icon: Clock },
 active: { color: 'bg-success/10 text-success', icon: CheckCircle },
 expired: { color: 'bg-destructive/10 text-destructive', icon: AlertTriangle },
 closed: { color: 'bg-muted text-muted-foreground', icon: FileCheck },
 cancelled: { color: 'bg-destructive/10 text-destructive', icon: AlertTriangle },
 };
 
 const applicabilityLabels: Record<Applicability, string> = {
 all_outlets: 'All Outlets',
 distributor: 'Distributors Only',
 retailer: 'Retailers Only',
 segment: 'Selected Outlets',
 area: 'Area-based',
 zone: 'Zone-based',
 };
 
 const benefitTypeLabels: Record<BenefitType, string> = {
 discount: 'Discount',
 free_qty: 'Free Quantity',
 cashback: 'Cashback',
 points: 'Points',
 coupon: 'Coupon',
 };
 
 export default function SchemeViewPage() {
 const navigate = useNavigate();
 const { id } = useParams();
 const { data: schemes = [], isLoading } = useSchemes();
 
 const scheme = schemes.find(s => s.id === id);
 
 if (isLoading) {
   return (
     <div className="flex items-center justify-center min-h-screen">
       <Loader2 className="h-8 w-8 animate-spin text-primary" />
     </div>
   );
 }
 
 if (!scheme) {
   return (
     <div className="flex flex-col items-center justify-center min-h-screen">
       <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
       <h2 className="text-xl font-semibold mb-2">Scheme Not Found</h2>
       <p className="text-muted-foreground mb-4">The scheme you're looking for doesn't exist.</p>
       <Button onClick={() => navigate('/master/schemes')}>Back to Schemes</Button>
     </div>
   );
 }
 
 const statusInfo = statusConfig[scheme.status] || statusConfig.draft;
 const StatusIcon = statusInfo.icon;
 
 const isExpired = new Date(scheme.end_date) < new Date();
 const daysRemaining = Math.ceil((new Date(scheme.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
 
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
             <div className="flex items-center gap-3">
               <h1 className="text-xl font-semibold">{scheme.name}</h1>
               <Badge variant="outline" className={typeColors[scheme.type] || ''}>
                 {schemeTypeLabels[scheme.type]}
               </Badge>
               <Badge variant="outline" className={statusInfo.color}>
                 <StatusIcon className="h-3 w-3 mr-1" />
                 {scheme.status.charAt(0).toUpperCase() + scheme.status.slice(1)}
               </Badge>
             </div>
             <p className="text-sm text-muted-foreground">
               {scheme.code || 'No code'} • Created {format(new Date(scheme.created_at), 'PPP')}
             </p>
           </div>
         </div>
         <Button onClick={() => navigate(`/master/schemes/edit/${id}`)}>
           <Edit className="h-4 w-4 mr-2" />
           Edit Scheme
         </Button>
       </div>
     </div>
 
     <div className="max-w-6xl mx-auto px-6 py-8">
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="space-y-8"
       >
         {/* Stats Cards */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <Card>
             <CardContent className="pt-6">
               <div className="flex items-center gap-3">
                 <div className="p-3 rounded-xl bg-primary/10">
                   <FileCheck className="h-5 w-5 text-primary" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">{scheme.claims_generated}</p>
                   <p className="text-sm text-muted-foreground">Claims Generated</p>
                 </div>
               </div>
             </CardContent>
           </Card>
 
           <Card>
             <CardContent className="pt-6">
               <div className="flex items-center gap-3">
                 <div className="p-3 rounded-xl bg-success/10">
                   <CheckCircle className="h-5 w-5 text-success" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">{scheme.claims_approved}</p>
                   <p className="text-sm text-muted-foreground">Claims Approved</p>
                 </div>
               </div>
             </CardContent>
           </Card>
 
           <Card>
             <CardContent className="pt-6">
               <div className="flex items-center gap-3">
                 <div className="p-3 rounded-xl bg-warning/10">
                   <IndianRupee className="h-5 w-5 text-warning" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">₹{(scheme.total_payout || 0).toLocaleString('en-IN')}</p>
                   <p className="text-sm text-muted-foreground">Total Payout</p>
                 </div>
               </div>
             </CardContent>
           </Card>
 
           <Card>
             <CardContent className="pt-6">
               <div className="flex items-center gap-3">
                 <div className={`p-3 rounded-xl ${isExpired ? 'bg-destructive/10' : 'bg-info/10'}`}>
                   <Calendar className={`h-5 w-5 ${isExpired ? 'text-destructive' : 'text-info'}`} />
                 </div>
                 <div>
                   <p className={`text-2xl font-bold ${isExpired ? 'text-destructive' : ''}`}>
                     {isExpired ? 'Expired' : `${daysRemaining} days`}
                   </p>
                   <p className="text-sm text-muted-foreground">
                     {isExpired ? 'Scheme ended' : 'Remaining'}
                   </p>
                 </div>
               </div>
             </CardContent>
           </Card>
         </div>
 
         {/* Scheme Details */}
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Gift className="h-5 w-5 text-primary" />
               Scheme Details
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <div className="space-y-1">
                 <p className="text-sm text-muted-foreground">Scheme Code</p>
                 <p className="font-medium">{scheme.code || 'N/A'}</p>
               </div>
               <div className="space-y-1">
                 <p className="text-sm text-muted-foreground">Scheme Type</p>
                 <p className="font-medium">{schemeTypeLabels[scheme.type]}</p>
               </div>
               <div className="space-y-1">
                 <p className="text-sm text-muted-foreground">Status</p>
                 <Badge variant="outline" className={statusInfo.color}>
                   <StatusIcon className="h-3 w-3 mr-1" />
                   {scheme.status.charAt(0).toUpperCase() + scheme.status.slice(1)}
                 </Badge>
               </div>
               <div className="space-y-1">
                 <p className="text-sm text-muted-foreground">Benefit Type</p>
                 <p className="font-medium">{benefitTypeLabels[scheme.benefit_type]}</p>
               </div>
               <div className="space-y-1">
                 <p className="text-sm text-muted-foreground">Applicability</p>
                 <p className="font-medium flex items-center gap-2">
                   <Users className="h-4 w-4 text-muted-foreground" />
                   {applicabilityLabels[scheme.applicability]}
                 </p>
               </div>
               <div className="space-y-1">
                 <p className="text-sm text-muted-foreground">Outlet Claim Limit</p>
                 <p className="font-medium">{scheme.outlet_claim_limit || 'Unlimited'}</p>
               </div>
             </div>
 
             {scheme.description && (
               <div className="mt-6 pt-6 border-t">
                 <p className="text-sm text-muted-foreground mb-2">Description</p>
                 <p className="text-foreground">{scheme.description}</p>
               </div>
             )}
           </CardContent>
         </Card>
 
         {/* Validity & Values */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2 text-lg">
                 <Calendar className="h-5 w-5 text-info" />
                 Validity Period
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                 <span className="text-muted-foreground">Start Date</span>
                 <span className="font-medium">{format(new Date(scheme.start_date), 'PPP')}</span>
               </div>
               <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                 <span className="text-muted-foreground">End Date</span>
                 <span className="font-medium">{format(new Date(scheme.end_date), 'PPP')}</span>
               </div>
               <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                 <span className="text-muted-foreground">Duration</span>
                 <span className="font-medium">
                   {Math.ceil((new Date(scheme.end_date).getTime() - new Date(scheme.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                 </span>
               </div>
             </CardContent>
           </Card>
 
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2 text-lg">
                 <IndianRupee className="h-5 w-5 text-warning" />
                 Value Configuration
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                 <span className="text-muted-foreground">Min Order Value</span>
                 <span className="font-medium">₹{(scheme.min_order_value || 0).toLocaleString('en-IN')}</span>
               </div>
               <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                 <span className="text-muted-foreground">Max Benefit</span>
                 <span className="font-medium">₹{(scheme.max_benefit || 0).toLocaleString('en-IN')}</span>
               </div>
               {scheme.discount_percent && (
                 <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                   <span className="text-muted-foreground">Discount Percent</span>
                   <span className="font-medium flex items-center gap-1">
                     <Percent className="h-4 w-4" />
                     {scheme.discount_percent}%
                   </span>
                 </div>
               )}
               {scheme.free_quantity && (
                 <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                   <span className="text-muted-foreground">Free Quantity</span>
                   <span className="font-medium flex items-center gap-1">
                     <Package className="h-4 w-4" />
                     {scheme.free_quantity}
                   </span>
                 </div>
               )}
             </CardContent>
           </Card>
         </div>
 
         {/* Slab Configuration */}
         {scheme.slab_config && scheme.slab_config.length > 0 && (
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2 text-lg">
                 <Percent className="h-5 w-5 text-primary" />
                 Slab Configuration
               </CardTitle>
               <CardDescription>Quantity/Value based discount slabs</CardDescription>
             </CardHeader>
             <CardContent>
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Slab #</TableHead>
                     <TableHead>From Qty/Value</TableHead>
                     <TableHead>To Qty/Value</TableHead>
                     <TableHead>Benefit Value</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {scheme.slab_config.map((slab, index) => (
                     <TableRow key={index}>
                       <TableCell className="font-medium">Slab {index + 1}</TableCell>
                       <TableCell>{slab.min_qty}</TableCell>
                       <TableCell>{slab.max_qty}</TableCell>
                       <TableCell className="font-medium text-primary">
                         {slab.benefit_value}%
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </CardContent>
           </Card>
         )}
       </motion.div>
     </div>
   </div>
 );
 }