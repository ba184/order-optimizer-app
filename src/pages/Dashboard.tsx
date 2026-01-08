import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Dashboard Components
import { DashboardKPICards } from '@/components/dashboard/DashboardKPICards';
import { TopSellingSection } from '@/components/dashboard/TopSellingSection';
import { TargetAchievementSection } from '@/components/dashboard/TargetAchievementSection';
import { ForecastingSection } from '@/components/dashboard/ForecastingSection';
import { LeadsOverviewSection } from '@/components/dashboard/LeadsOverviewSection';
import { AttendanceBeatPlanSection } from '@/components/dashboard/AttendanceBeatPlanSection';
import { ReportsDropdown } from '@/components/dashboard/ReportsDropdown';
import { TodaysOrdersSection } from '@/components/dashboard/TodaysOrdersSection';
import { SEDashboard } from '@/components/dashboard/SEDashboard';

const salesData = [
  { month: 'Jan', sales: 4200000, target: 5000000 },
  { month: 'Feb', sales: 5100000, target: 5000000 },
  { month: 'Mar', sales: 4800000, target: 5500000 },
  { month: 'Apr', sales: 5600000, target: 5500000 },
  { month: 'May', sales: 6200000, target: 6000000 },
  { month: 'Jun', sales: 5900000, target: 6000000 },
];

const categoryData = [
  { name: 'Category A', value: 35 },
  { name: 'Category B', value: 25 },
  { name: 'Category C', value: 20 },
  { name: 'Category D', value: 15 },
  { name: 'Others', value: 5 },
];

const COLORS = ['hsl(215, 70%, 23%)', 'hsl(178, 60%, 40%)', 'hsl(38, 92%, 50%)', 'hsl(142, 71%, 45%)', 'hsl(220, 20%, 70%)'];

export default function Dashboard() {
  const { profile, userRole } = useAuth();

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value}`;
  };

  const isAdmin = userRole === 'admin' || userRole === 'rsm' || userRole === 'asm';
  const isSalesExecutive = userRole === 'sales_executive' || userRole === 'se';
  const userName = profile?.name?.split(' ')[0] || 'User';

  // Sales Executive sees limited dashboard
  if (isSalesExecutive) {
    return <SEDashboard formatCurrency={formatCurrency} userName={userName} />;
  }

  // Admin/Manager Dashboard
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {userName}!
          </h1>
          <p className="text-muted-foreground">
            Organization-wide sales overview and analytics.
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

      {/* KPI Cards */}
      <DashboardKPICards isAdmin={isAdmin} formatCurrency={formatCurrency} />

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 chart-container"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Sales vs Target</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-muted-foreground">Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary" />
                <span className="text-muted-foreground">Target</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(215, 70%, 23%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(215, 70%, 23%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [formatCurrency(value)]}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="hsl(215, 70%, 23%)"
                strokeWidth={2}
                fill="url(#salesGradient)"
              />
              <Area
                type="monotone"
                dataKey="target"
                stroke="hsl(178, 60%, 40%)"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="chart-container"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value}%`]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {categoryData.slice(0, 4).map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS[index] }}
                />
                <span className="text-muted-foreground truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Selling & Target Achievement */}
          <div className="grid md:grid-cols-2 gap-6">
            <TopSellingSection formatCurrency={formatCurrency} />
            <TargetAchievementSection formatCurrency={formatCurrency} />
          </div>
          
          {/* Forecasting */}
          <ForecastingSection formatCurrency={formatCurrency} />
          
          {/* Attendance & Beat Plan */}
          <AttendanceBeatPlanSection />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Reports Dropdown */}
          <ReportsDropdown />
          
          {/* Today's Orders */}
          <TodaysOrdersSection formatCurrency={formatCurrency} />
          
          {/* Leads Overview */}
          <LeadsOverviewSection />
        </div>
      </div>
    </div>
  );
}
