import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Store,
  ShoppingCart,
  IndianRupee,
  Users,
  Activity,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import ReportFilters, { FilterState, defaultFilters } from './components/ReportFilters';
import KPICard from './components/KPICard';

const salesTrendData = [
  { month: 'Jul', actual: 4200000, target: 4500000 },
  { month: 'Aug', actual: 4800000, target: 4800000 },
  { month: 'Sep', actual: 5200000, target: 5000000 },
  { month: 'Oct', actual: 5600000, target: 5500000 },
  { month: 'Nov', actual: 6100000, target: 6000000 },
  { month: 'Dec', actual: 5800000, target: 6500000 },
];

const regionData = [
  { region: 'North', sales: 2850000, target: 3000000 },
  { region: 'South', sales: 2450000, target: 2500000 },
  { region: 'East', sales: 1980000, target: 2200000 },
  { region: 'West', sales: 2720000, target: 2800000 },
];

const categoryData = [
  { name: 'Alpha Series', value: 35 },
  { name: 'Beta Series', value: 28 },
  { name: 'Gamma Series', value: 20 },
  { name: 'Delta Series', value: 12 },
  { name: 'Others', value: 5 },
];

const topPerformers = [
  { name: 'Rajesh Kumar', territory: 'North Delhi', sales: 1250000, achievement: 115 },
  { name: 'Priya Singh', territory: 'South Delhi', sales: 1180000, achievement: 108 },
  { name: 'Amit Sharma', territory: 'Gurgaon', sales: 1050000, achievement: 102 },
  { name: 'Vikram Patel', territory: 'Noida', sales: 980000, achievement: 95 },
  { name: 'Sunita Gupta', territory: 'Faridabad', sales: 920000, achievement: 92 },
];

const COLORS = ['hsl(215, 70%, 23%)', 'hsl(178, 60%, 40%)', 'hsl(38, 92%, 50%)', 'hsl(142, 71%, 45%)', 'hsl(220, 20%, 70%)'];

const formatCurrency = (value: number) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return `₹${(value / 1000).toFixed(0)}K`;
};

const quickReports = [
  { label: 'Daily Sales', path: '/reports/sales/daily', icon: TrendingUp },
  { label: 'Target vs Achievement', path: '/reports/sales/target', icon: Target },
  { label: 'FSE Performance', path: '/reports/productivity/fse', icon: Users },
  { label: 'Outlet Analysis', path: '/reports/outlets/distributors', icon: Store },
];

export default function ReportsDashboard() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports Dashboard</h1>
        <p className="text-muted-foreground">Executive overview of sales performance</p>
      </div>

      {/* Filters */}
      <ReportFilters filters={filters} onFilterChange={setFilters} />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Total Sales"
          value="₹58.2L"
          trend={{ value: 12.5, label: 'vs last period' }}
          icon={IndianRupee}
          iconColor="text-primary"
          delay={0}
        />
        <KPICard
          title="Target Achievement"
          value="89.5%"
          subtitle="₹6.8L remaining"
          icon={Target}
          iconColor="text-warning"
          delay={0.1}
        />
        <KPICard
          title="Orders"
          value="486"
          trend={{ value: -3, label: 'vs last month' }}
          icon={ShoppingCart}
          iconColor="text-secondary"
          delay={0.2}
        />
        <KPICard
          title="Active Outlets"
          value="1,245"
          trend={{ value: 2.6, label: '+32 new' }}
          icon={Store}
          iconColor="text-success"
          delay={0.3}
        />
        <KPICard
          title="Avg Order Value"
          value="₹11,975"
          trend={{ value: 5.2, label: 'vs last month' }}
          icon={Activity}
          iconColor="text-info"
          delay={0.4}
        />
        <KPICard
          title="FSE Productivity"
          value="82%"
          subtitle="Composite score"
          icon={Users}
          iconColor="text-accent-foreground"
          delay={0.5}
        />
      </div>

      {/* Quick Access Reports */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {quickReports.map((report, index) => (
          <Link
            key={report.path}
            to={report.path}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors whitespace-nowrap"
          >
            <report.icon size={16} className="text-primary" />
            <span className="text-sm font-medium">{report.label}</span>
            <ArrowRight size={14} className="text-muted-foreground" />
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="chart-container"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Sales Trend</h3>
            <Link to="/reports/sales/monthly" className="text-sm text-primary hover:underline flex items-center gap-1">
              View Details <ArrowRight size={14} />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={salesTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={formatCurrency} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [formatCurrency(value)]}
              />
              <Legend />
              <Line type="monotone" dataKey="actual" stroke="hsl(215, 70%, 23%)" strokeWidth={2} name="Actual" />
              <Line type="monotone" dataKey="target" stroke="hsl(178, 60%, 40%)" strokeWidth={2} strokeDasharray="5 5" name="Target" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Region Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="chart-container"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Regional Performance</h3>
            <Link to="/reports/territory/zone" className="text-sm text-primary hover:underline flex items-center gap-1">
              View Details <ArrowRight size={14} />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={regionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={formatCurrency} />
              <YAxis type="category" dataKey="region" stroke="hsl(var(--muted-foreground))" fontSize={12} width={60} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [formatCurrency(value)]}
              />
              <Legend />
              <Bar dataKey="sales" fill="hsl(215, 70%, 23%)" name="Sales" radius={[0, 4, 4, 0]} />
              <Bar dataKey="target" fill="hsl(178, 60%, 40%)" name="Target" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Second Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="chart-container"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Sales by Category</h3>
            <Link to="/reports/products/category" className="text-sm text-primary hover:underline">
              Details
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={2}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value}%`]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                <span className="text-muted-foreground truncate">{item.name}: {item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Performers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="chart-container lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Top Performers</h3>
            <Link to="/reports/productivity/fse" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {topPerformers.map((performer, index) => (
              <div
                key={performer.name}
                className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-foreground">{performer.name}</p>
                    <p className="font-semibold text-foreground">{formatCurrency(performer.sales)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin size={12} />
                      {performer.territory}
                    </p>
                    <span className={`text-xs font-medium ${performer.achievement >= 100 ? 'text-success' : 'text-warning'}`}>
                      {performer.achievement}% achieved
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
