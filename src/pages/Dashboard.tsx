import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/ui/StatCard';
import {
  ShoppingCart,
  Users,
  Store,
  TrendingUp,
  MapPin,
  Clock,
  Package,
  AlertTriangle,
  CheckCircle,
  Target,
  IndianRupee,
  Calendar,
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
} from 'recharts';

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

const topDistributors = [
  { name: 'Krishna Traders', city: 'Delhi', orders: 156, value: 2450000 },
  { name: 'Sharma Distributors', city: 'Mumbai', orders: 142, value: 2180000 },
  { name: 'Gupta Enterprises', city: 'Chennai', orders: 128, value: 1950000 },
  { name: 'Patel Trading Co', city: 'Ahmedabad', orders: 115, value: 1720000 },
  { name: 'Singh & Sons', city: 'Kolkata', orders: 98, value: 1580000 },
];

const recentOrders = [
  { id: 'ORD-2024-001', distributor: 'Krishna Traders', amount: 125000, status: 'approved', time: '10 min ago' },
  { id: 'ORD-2024-002', distributor: 'Sharma Distributors', amount: 89500, status: 'pending', time: '25 min ago' },
  { id: 'ORD-2024-003', distributor: 'Gupta Enterprises', amount: 156000, status: 'dispatched', time: '1 hour ago' },
  { id: 'ORD-2024-004', distributor: 'Patel Trading Co', amount: 78000, status: 'delivered', time: '2 hours ago' },
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {profile?.name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your sales today.
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Sales"
          value={formatCurrency(1250000)}
          change="+12.5% from yesterday"
          changeType="positive"
          icon={IndianRupee}
          iconColor="bg-primary"
        />
        <StatCard
          title="Orders Placed"
          value="48"
          change="+8 from yesterday"
          changeType="positive"
          icon={ShoppingCart}
          iconColor="bg-secondary"
        />
        <StatCard
          title="Active Retailers"
          value="1,245"
          change="32 new this week"
          changeType="positive"
          icon={Store}
          iconColor="bg-success"
        />
        <StatCard
          title="Pending Approvals"
          value="12"
          change="3 urgent"
          changeType="negative"
          icon={AlertTriangle}
          iconColor="bg-warning"
        />
      </div>

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

      {/* Bottom Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Distributors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Top Distributors</h3>
            <a href="/outlets/distributors" className="text-sm text-secondary hover:underline">
              View All
            </a>
          </div>
          <div className="space-y-3">
            {topDistributors.map((dist, index) => (
              <div
                key={dist.name}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{dist.name}</p>
                    <p className="text-xs text-muted-foreground">{dist.city} • {dist.orders} orders</p>
                  </div>
                </div>
                <p className="font-semibold text-foreground">{formatCurrency(dist.value)}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl border border-border p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Orders</h3>
            <a href="/orders/list" className="text-sm text-secondary hover:underline">
              View All
            </a>
          </div>
          <div className="space-y-3">
            {recentOrders.map(order => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div>
                  <p className="font-medium text-foreground">{order.id}</p>
                  <p className="text-xs text-muted-foreground">{order.distributor}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{formatCurrency(order.amount)}</p>
                  <div className="flex items-center gap-1 text-xs">
                    {order.status === 'approved' && <CheckCircle size={12} className="text-success" />}
                    {order.status === 'pending' && <Clock size={12} className="text-warning" />}
                    {order.status === 'dispatched' && <Package size={12} className="text-info" />}
                    {order.status === 'delivered' && <CheckCircle size={12} className="text-success" />}
                    <span className="text-muted-foreground">{order.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions for Sales Executive */}
      {userRole === 'sales_executive' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-primary-foreground"
        >
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/my-work/attendance"
              className="flex flex-col items-center gap-2 p-4 bg-primary-foreground/10 rounded-xl hover:bg-primary-foreground/20 transition-colors"
            >
              <MapPin size={24} />
              <span className="text-sm font-medium">Mark Attendance</span>
            </a>
            <a
              href="/outlets/new-retailer"
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
              href="/my-work/dsr"
              className="flex flex-col items-center gap-2 p-4 bg-primary-foreground/10 rounded-xl hover:bg-primary-foreground/20 transition-colors"
            >
              <Target size={24} />
              <span className="text-sm font-medium">Submit DSR</span>
            </a>
          </div>
        </motion.div>
      )}
    </div>
  );
}
