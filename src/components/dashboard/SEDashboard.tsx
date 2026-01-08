import { motion } from 'framer-motion';
import { StatCard } from '@/components/ui/StatCard';
import {
  IndianRupee,
  ShoppingCart,
  Store,
  Target,
  MapPin,
  Calendar,
  Phone,
  CheckCircle,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SEDashboardProps {
  formatCurrency: (value: number) => string;
  userName: string;
}

// Mock data for Sales Executive
const seData = {
  todaySales: 85000,
  mtdSales: 1850000,
  targetAchievement: 78.5,
  todaysOrders: 8,
  todaysOrderValue: 85000,
  beatPlan: {
    planned: 12,
    visited: 8,
    productiveCalls: 6,
    zeroOrders: 2,
  },
  pendingTasks: 3,
};

export function SEDashboard({ formatCurrency, userName }: SEDashboardProps) {
  const visitRate = (seData.beatPlan.visited / seData.beatPlan.planned) * 100;
  const productivityRate = (seData.beatPlan.productiveCalls / seData.beatPlan.visited) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome, {userName}!
          </h1>
          <p className="text-muted-foreground">
            Here's your performance overview for today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar size={16} />
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Sales"
          value={formatCurrency(seData.todaySales)}
          change="8 orders placed"
          changeType="neutral"
          icon={IndianRupee}
          iconColor="bg-primary"
        />
        <StatCard
          title="MTD Sales"
          value={formatCurrency(seData.mtdSales)}
          change="+12.5% vs last month"
          changeType="positive"
          icon={ShoppingCart}
          iconColor="bg-secondary"
        />
        <StatCard
          title="Target Achievement"
          value={`${seData.targetAchievement}%`}
          change="On track"
          changeType="positive"
          icon={Target}
          iconColor="bg-success"
        />
        <StatCard
          title="Pending Tasks"
          value={seData.pendingTasks.toString()}
          change="Complete before EOD"
          changeType="negative"
          icon={CheckCircle}
          iconColor="bg-warning"
        />
      </div>

      {/* Beat Plan Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-5 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">Today's Beat Plan</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Visits Completed</span>
                <span className="font-semibold">{seData.beatPlan.visited}/{seData.beatPlan.planned}</span>
              </div>
              <Progress value={visitRate} className="h-3" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Productivity Rate</span>
                <span className="font-semibold">{productivityRate.toFixed(0)}%</span>
              </div>
              <Progress value={productivityRate} className="h-3" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-primary/10 rounded-lg text-center">
              <MapPin size={20} className="text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{seData.beatPlan.visited}</p>
              <p className="text-xs text-muted-foreground">Visited</p>
            </div>
            <div className="p-3 bg-success/10 rounded-lg text-center">
              <Phone size={20} className="text-success mx-auto mb-2" />
              <p className="text-2xl font-bold">{seData.beatPlan.productiveCalls}</p>
              <p className="text-xs text-muted-foreground">Productive</p>
            </div>
            <div className="p-3 bg-destructive/10 rounded-lg text-center">
              <Store size={20} className="text-destructive mx-auto mb-2" />
              <p className="text-2xl font-bold">{seData.beatPlan.zeroOrders}</p>
              <p className="text-xs text-muted-foreground">Zero Orders</p>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center">
              <Target size={20} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-2xl font-bold">{seData.beatPlan.planned - seData.beatPlan.visited}</p>
              <p className="text-xs text-muted-foreground">Remaining</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-primary-foreground"
      >
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/sales-team/attendance"
            className="flex flex-col items-center gap-2 p-4 bg-primary-foreground/10 rounded-xl hover:bg-primary-foreground/20 transition-colors"
          >
            <MapPin size={24} />
            <span className="text-sm font-medium">Mark Attendance</span>
          </a>
          <a
            href="/outlets/retailers/new"
            className="flex flex-col items-center gap-2 p-4 bg-primary-foreground/10 rounded-xl hover:bg-primary-foreground/20 transition-colors"
          >
            <Store size={24} />
            <span className="text-sm font-medium">New Retailer</span>
          </a>
          <a
            href="/orders/new"
            className="flex flex-col items-center gap-2 p-4 bg-primary-foreground/10 rounded-xl hover:bg-primary-foreground/20 transition-colors"
          >
            <ShoppingCart size={24} />
            <span className="text-sm font-medium">Create Order</span>
          </a>
          <a
            href="/sales-team/dsr/submit"
            className="flex flex-col items-center gap-2 p-4 bg-primary-foreground/10 rounded-xl hover:bg-primary-foreground/20 transition-colors"
          >
            <Target size={24} />
            <span className="text-sm font-medium">Submit DSR</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
