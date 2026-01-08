import { motion } from 'framer-motion';
import { Users, MapPin, ShoppingCart, Phone, CheckCircle, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const attendanceData = {
  teamSize: 42,
  present: 38,
  onLeave: 3,
  absent: 1,
};

const beatPlanData = {
  totalPlanned: 156,
  visited: 128,
  zeroOrders: 18,
  productiveCalls: 98,
  totalCalls: 128,
};

export function AttendanceBeatPlanSection() {
  const attendanceRate = (attendanceData.present / attendanceData.teamSize) * 100;
  const visitRate = (beatPlanData.visited / beatPlanData.totalPlanned) * 100;
  const productivityRate = (beatPlanData.productiveCalls / beatPlanData.totalCalls) * 100;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Attendance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-5 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Today's Attendance</h3>
          <a href="/sales-team/attendance" className="text-sm text-secondary hover:underline">
            View All
          </a>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Team Size</span>
            </div>
            <span className="text-2xl font-bold text-foreground">{attendanceData.teamSize}</span>
          </div>
          
          <Progress value={attendanceRate} className="h-2" />
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-success/10 rounded-lg">
              <p className="text-lg font-bold text-success">{attendanceData.present}</p>
              <p className="text-xs text-muted-foreground">Present</p>
            </div>
            <div className="p-2 bg-warning/10 rounded-lg">
              <p className="text-lg font-bold text-warning">{attendanceData.onLeave}</p>
              <p className="text-xs text-muted-foreground">On Leave</p>
            </div>
            <div className="p-2 bg-destructive/10 rounded-lg">
              <p className="text-lg font-bold text-destructive">{attendanceData.absent}</p>
              <p className="text-xs text-muted-foreground">Absent</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Beat Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border border-border p-5 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Beat Plan (SE-wise)</h3>
          <a href="/sales-team/beat-plans" className="text-sm text-secondary hover:underline">
            View All
          </a>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              <span className="text-sm">Visited</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{beatPlanData.visited}/{beatPlanData.totalPlanned}</span>
              <span className="text-xs text-muted-foreground">({visitRate.toFixed(0)}%)</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <XCircle size={16} className="text-destructive" />
              <span className="text-sm">Zero Orders</span>
            </div>
            <span className="font-semibold text-destructive">{beatPlanData.zeroOrders}</span>
          </div>
          
          <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-success" />
              <span className="text-sm">Productive Calls</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-success">{beatPlanData.productiveCalls}</span>
              <span className="text-xs text-muted-foreground">({productivityRate.toFixed(0)}%)</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-info" />
              <span className="text-sm">Total Calls</span>
            </div>
            <span className="font-semibold">{beatPlanData.totalCalls}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
