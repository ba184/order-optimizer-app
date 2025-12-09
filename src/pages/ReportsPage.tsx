import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  Users,
  Store,
  ShoppingCart,
  IndianRupee,
  Target,
  MapPin,
  Package,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';

const salesTrendData = [
  { month: 'Jul', actual: 4200000, target: 4500000, lastYear: 3800000 },
  { month: 'Aug', actual: 4800000, target: 4800000, lastYear: 4200000 },
  { month: 'Sep', actual: 5200000, target: 5000000, lastYear: 4600000 },
  { month: 'Oct', actual: 5600000, target: 5500000, lastYear: 5000000 },
  { month: 'Nov', actual: 6100000, target: 6000000, lastYear: 5400000 },
  { month: 'Dec', actual: 5800000, target: 6500000, lastYear: 5800000 },
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

const reportsList = [
  { name: 'Daily Sales Report', description: 'Sales by executive, area, city' },
  { name: 'Revenue Report', description: 'Revenue breakdown by period' },
  { name: 'Target vs Achievement', description: 'Performance against targets' },
  { name: 'ABC Categorization', description: 'Retailer classification analysis' },
  { name: 'Lead Conversion', description: 'Lead to customer conversion rate' },
  { name: 'New vs Existing', description: 'New customer acquisition analysis' },
  { name: 'SKU Performance', description: 'Per product sales analysis' },
  { name: 'Distributor Sales', description: 'Sales by distributor' },
  { name: 'Territory Performance', description: 'Regional sales comparison' },
  { name: 'Sales Forecast', description: 'Predictive sales analysis' },
];

const COLORS = ['hsl(215, 70%, 23%)', 'hsl(178, 60%, 40%)', 'hsl(38, 92%, 50%)', 'hsl(142, 71%, 45%)', 'hsl(220, 20%, 70%)'];

const formatCurrency = (value: number) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return `₹${(value / 1000).toFixed(0)}K`;
};

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('this_month');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive sales analytics and reporting</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="input-field"
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="this_quarter">This Quarter</option>
            <option value="this_year">This Year</option>
          </select>
          <button className="btn-outline flex items-center gap-2">
            <Filter size={18} />
            Filters
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-bold text-foreground">₹58.2L</p>
              <p className="text-sm text-success flex items-center gap-1 mt-1">
                <TrendingUp size={14} />
                +12.5% vs last month
              </p>
            </div>
            <div className="p-3 rounded-xl bg-primary/10">
              <IndianRupee size={24} className="text-primary" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Target Achievement</p>
              <p className="text-2xl font-bold text-foreground">89.5%</p>
              <p className="text-sm text-warning flex items-center gap-1 mt-1">
                <Target size={14} />
                ₹6.8L remaining
              </p>
            </div>
            <div className="p-3 rounded-xl bg-secondary/10">
              <Target size={24} className="text-secondary" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat-card"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Outlets</p>
              <p className="text-2xl font-bold text-foreground">1,245</p>
              <p className="text-sm text-success flex items-center gap-1 mt-1">
                <TrendingUp size={14} />
                +32 new this month
              </p>
            </div>
            <div className="p-3 rounded-xl bg-success/10">
              <Store size={24} className="text-success" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="stat-card"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Orders</p>
              <p className="text-2xl font-bold text-foreground">486</p>
              <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                <TrendingDown size={14} />
                -3% vs last month
              </p>
            </div>
            <div className="p-3 rounded-xl bg-warning/10">
              <ShoppingCart size={24} className="text-warning" />
            </div>
          </div>
        </motion.div>
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
          <h3 className="text-lg font-semibold text-foreground mb-4">Sales Trend</h3>
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
              <Line type="monotone" dataKey="lastYear" stroke="hsl(220, 20%, 60%)" strokeWidth={1} name="Last Year" />
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
          <h3 className="text-lg font-semibold text-foreground mb-4">Regional Performance</h3>
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
          <h3 className="text-lg font-semibold text-foreground mb-4">Top Performers</h3>
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

      {/* Available Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card rounded-xl border border-border p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">Available Reports</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {reportsList.map(report => (
            <button
              key={report.name}
              className="p-4 bg-muted/30 rounded-xl text-left hover:bg-muted transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <BarChart3 size={20} className="text-primary" />
              </div>
              <p className="font-medium text-foreground text-sm">{report.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
