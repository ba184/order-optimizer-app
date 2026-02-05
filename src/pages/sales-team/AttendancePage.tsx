 import { useState } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { motion, AnimatePresence } from 'framer-motion';
 import { DataTable } from '@/components/ui/DataTable';
 import { GeoFilter } from '@/components/ui/GeoFilter';
 import { GeoFilter as GeoFilterType } from '@/data/geoData';
 import { useAttendance } from '@/hooks/useSalesTeamData';
 import { format } from 'date-fns';
 import { Button } from '@/components/ui/button';
 import {
   MapPin,
   Calendar,
   CheckCircle,
   XCircle,
   Eye,
   Navigation,
   Loader2,
   Route,
   ShoppingCart,
   Package,
   X,
   Download,
   Image as ImageIcon,
   ExternalLink,
 } from 'lucide-react';
 import { toast } from 'sonner';
 
 interface AttendanceRecord {
   id: string;
   user_id: string;
   userName: string;
   punchInDateTime: string;
   loginLocation: any;
   loginLocationAddress: string;
   totalDistance: number;
   visitCount: number;
   orderValue: number;
   preOrderValue: number;
   punchInImage: string | null;
 }
 
 export default function AttendancePage() {
   const navigate = useNavigate();
   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
   const [geoFilter, setGeoFilter] = useState<GeoFilterType>({ country: 'India' });
   const [showImageModal, setShowImageModal] = useState<string | null>(null);
   const [employeeFilter, setEmployeeFilter] = useState<string>('');
   
   const { data: attendanceData, isLoading } = useAttendance(selectedDate);
 
   // Transform data for display
   const transformedData: AttendanceRecord[] = (attendanceData || []).map((att: any) => ({
     id: att.id,
     user_id: att.user_id,
     userName: att.profiles?.name || 'Unknown',
     punchInDateTime: att.login_time 
       ? `${format(new Date(att.date), 'dd-MM-yyyy')} ${format(new Date(att.login_time), 'hh:mm a')}`
       : '--',
     loginLocation: att.login_location,
     loginLocationAddress: att.login_location?.address || '--',
     totalDistance: att.total_distance || 0,
     visitCount: att.visit_count || 0,
     orderValue: 0,
     preOrderValue: 0,
     punchInImage: att.login_selfie || null,
   }));
 
   const filteredAttendance = transformedData.filter(att => {
     if (employeeFilter && !att.userName.toLowerCase().includes(employeeFilter.toLowerCase())) return false;
     return true;
   });
 
   const stats = {
     present: filteredAttendance.length,
     absent: 0,
     totalVisits: filteredAttendance.reduce((sum, a) => sum + a.visitCount, 0),
     totalOrderValue: filteredAttendance.reduce((sum, a) => sum + a.orderValue, 0),
     totalPreOrderValue: filteredAttendance.reduce((sum, a) => sum + a.preOrderValue, 0),
     totalDistance: filteredAttendance.reduce((sum, a) => sum + a.totalDistance, 0),
   };
 
   const exportToCSV = () => {
     const headers = ['Employee Name', 'Punch-in Date & Time', 'Location', 'Distance (KM)', 'Visits', 'Order Value', 'Pre-Order Value'];
     const rows = filteredAttendance.map(a => [
       a.userName,
       a.punchInDateTime,
       a.loginLocationAddress,
       a.totalDistance,
       a.visitCount,
       a.orderValue,
       a.preOrderValue,
     ]);
     
     const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
     const blob = new Blob([csvContent], { type: 'text/csv' });
     const url = window.URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `attendance_${selectedDate}.csv`;
     a.click();
     window.URL.revokeObjectURL(url);
     toast.success('Exported to CSV');
   };
 
   const columns = [
     {
       key: 'userName',
       header: 'Employee Name',
       render: (item: AttendanceRecord) => (
         <p className="font-medium text-foreground">{item.userName}</p>
       ),
       sortable: true,
     },
     {
       key: 'punchInImage',
       header: 'Punch-in Image',
       render: (item: AttendanceRecord) => (
         item.punchInImage ? (
           <button
             onClick={() => setShowImageModal(item.punchInImage)}
             className="w-10 h-10 rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
           >
             <img src={item.punchInImage} alt="Punch-in" className="w-full h-full object-cover" />
           </button>
         ) : (
           <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
             <ImageIcon size={16} className="text-muted-foreground" />
           </div>
         )
       ),
     },
     {
       key: 'punchInDateTime',
       header: 'Punch-in Date & Time',
       render: (item: AttendanceRecord) => (
         <div className="flex items-center gap-2">
           <Calendar size={14} className="text-muted-foreground shrink-0" />
           <span>{item.punchInDateTime}</span>
         </div>
       ),
     },
     {
       key: 'loginLocation',
       header: 'Real-time Location',
       render: (item: AttendanceRecord) => (
         <button
           onClick={() => {
             if (item.loginLocation?.lat && item.loginLocation?.lng) {
               window.open(`https://maps.google.com/?q=${item.loginLocation.lat},${item.loginLocation.lng}`, '_blank');
             }
           }}
           className="flex items-center gap-2 text-primary hover:underline"
           disabled={!item.loginLocation?.lat}
         >
           <MapPin size={14} />
           <span className="truncate max-w-[150px]">{item.loginLocationAddress}</span>
           {item.loginLocation?.lat && <ExternalLink size={12} />}
         </button>
       ),
     },
     {
       key: 'totalDistance',
       header: 'Distance Covered',
       render: (item: AttendanceRecord) => (
         <span className="font-medium">{item.totalDistance > 0 ? `${item.totalDistance.toFixed(1)} KM` : '--'}</span>
       ),
       sortable: true,
     },
     { 
       key: 'visitCount', 
       header: 'Number of Visits', 
       sortable: true,
       render: (item: AttendanceRecord) => (
         <span className="font-medium">{item.visitCount}</span>
       ),
     },
     {
       key: 'orderValue',
       header: 'Order Value',
       render: (item: AttendanceRecord) => (
         <span className="font-medium">₹{item.orderValue.toLocaleString()}</span>
       ),
       sortable: true,
     },
     {
       key: 'preOrderValue',
       header: 'Pre-Order Value',
       render: (item: AttendanceRecord) => (
         <span className="font-medium">₹{item.preOrderValue.toLocaleString()}</span>
       ),
       sortable: true,
     },
     {
       key: 'liveTracking',
       header: 'Live Tracking',
       render: (item: AttendanceRecord) => (
         <Button
           size="sm"
           variant="outline"
           onClick={() => navigate(`/sales-team/tracking?user=${item.user_id}`)}
           className="flex items-center gap-1"
         >
           <Navigation size={14} />
           Track
         </Button>
       ),
     },
     {
       key: 'actions',
       header: 'Action',
       render: (item: AttendanceRecord) => (
         <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="View Details">
           <Eye size={16} className="text-muted-foreground" />
         </button>
       ),
     },
   ];
 
   if (isLoading) {
     return (
       <div className="flex items-center justify-center h-64">
         <Loader2 className="w-8 h-8 animate-spin text-primary" />
       </div>
     );
   }
 
   return (
     <div className="space-y-6">
       {/* Header */}
       <div className="module-header">
         <div>
           <h1 className="module-title">Attendance Management</h1>
           <p className="text-muted-foreground">Monitor team attendance with geo-fenced login/logout</p>
         </div>
         <div className="flex items-center gap-3">
           <div className="relative">
             <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
             <input
               type="date"
               value={selectedDate}
               onChange={e => setSelectedDate(e.target.value)}
               className="input-field pl-10 pr-4"
             />
           </div>
           <Button variant="outline" onClick={exportToCSV} className="flex items-center gap-2">
             <Download size={16} />
             Export
           </Button>
           <button 
             onClick={() => navigate('/sales-team/tracking')}
             className="btn-primary flex items-center gap-2"
           >
             <Navigation size={18} />
             Live Tracking
           </button>
         </div>
       </div>
 
       {/* Filters */}
       <div className="flex flex-wrap gap-4 items-center">
         <GeoFilter value={geoFilter} onChange={setGeoFilter} />
         <input
           type="text"
           placeholder="Search by employee name..."
           value={employeeFilter}
           onChange={(e) => setEmployeeFilter(e.target.value)}
           className="input-field"
         />
       </div>
 
       {/* Stats - 6 Cards */}
       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
           <div className="flex items-center gap-3">
             <div className="p-3 rounded-xl bg-success/10">
               <CheckCircle size={24} className="text-success" />
             </div>
             <div>
               <p className="text-2xl font-bold text-foreground">{stats.present}</p>
               <p className="text-sm text-muted-foreground">Total Present</p>
             </div>
           </div>
         </motion.div>
 
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="stat-card">
           <div className="flex items-center gap-3">
             <div className="p-3 rounded-xl bg-destructive/10">
               <XCircle size={24} className="text-destructive" />
             </div>
             <div>
               <p className="text-2xl font-bold text-foreground">{stats.absent}</p>
               <p className="text-sm text-muted-foreground">Total Absent</p>
             </div>
           </div>
         </motion.div>
 
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
           <div className="flex items-center gap-3">
             <div className="p-3 rounded-xl bg-primary/10">
               <MapPin size={24} className="text-primary" />
             </div>
             <div>
               <p className="text-2xl font-bold text-foreground">{stats.totalVisits}</p>
               <p className="text-sm text-muted-foreground">Total Visits</p>
             </div>
           </div>
         </motion.div>
 
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="stat-card">
           <div className="flex items-center gap-3">
             <div className="p-3 rounded-xl bg-warning/10">
               <ShoppingCart size={24} className="text-warning" />
             </div>
             <div>
               <p className="text-2xl font-bold text-foreground">₹{stats.totalOrderValue.toLocaleString()}</p>
               <p className="text-sm text-muted-foreground">Order Value</p>
             </div>
           </div>
         </motion.div>
 
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
           <div className="flex items-center gap-3">
             <div className="p-3 rounded-xl bg-secondary/10">
               <Package size={24} className="text-secondary-foreground" />
             </div>
             <div>
               <p className="text-2xl font-bold text-foreground">₹{stats.totalPreOrderValue.toLocaleString()}</p>
               <p className="text-sm text-muted-foreground">Pre-Order Value</p>
             </div>
           </div>
         </motion.div>
 
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="stat-card">
           <div className="flex items-center gap-3">
             <div className="p-3 rounded-xl bg-info/10">
               <Route size={24} className="text-info" />
             </div>
             <div>
               <p className="text-2xl font-bold text-foreground">{stats.totalDistance.toFixed(1)} KM</p>
               <p className="text-sm text-muted-foreground">Distance Covered</p>
             </div>
           </div>
         </motion.div>
       </div>
 
       {/* Table */}
       <div className="card-elevated">
         <DataTable
           data={filteredAttendance}
           columns={columns}
           searchable={false}
         />
       </div>
 
       {/* Image Modal */}
       <AnimatePresence>
         {showImageModal && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
             onClick={() => setShowImageModal(null)}
           >
             <motion.div
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="bg-card rounded-xl p-4 max-w-lg max-h-[80vh] overflow-auto"
               onClick={e => e.stopPropagation()}
             >
               <div className="flex justify-between items-center mb-4">
                 <h3 className="font-semibold">Punch-in Image</h3>
                 <button onClick={() => setShowImageModal(null)} className="p-1 hover:bg-muted rounded">
                   <X size={20} />
                 </button>
               </div>
               <img src={showImageModal} alt="Punch-in" className="w-full rounded-lg" />
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>
     </div>
   );
 }