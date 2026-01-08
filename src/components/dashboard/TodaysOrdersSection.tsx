import { motion } from 'framer-motion';
import { ShoppingCart, Clock, CheckCircle, Package, Truck } from 'lucide-react';

interface TodaysOrdersSectionProps {
  formatCurrency: (value: number) => string;
}

const ordersData = {
  total: 48,
  value: 1250000,
  pending: 12,
  approved: 18,
  dispatched: 14,
  delivered: 4,
};

const recentOrders = [
  { id: 'ORD-2024-001', distributor: 'Krishna Traders', amount: 125000, status: 'approved', time: '10 min ago' },
  { id: 'ORD-2024-002', distributor: 'Sharma Distributors', amount: 89500, status: 'pending', time: '25 min ago' },
  { id: 'ORD-2024-003', distributor: 'Gupta Enterprises', amount: 156000, status: 'dispatched', time: '1 hour ago' },
  { id: 'ORD-2024-004', distributor: 'Patel Trading Co', amount: 78000, status: 'delivered', time: '2 hours ago' },
];

const statusConfig = {
  pending: { icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
  approved: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
  dispatched: { icon: Package, color: 'text-info', bg: 'bg-info/10' },
  delivered: { icon: Truck, color: 'text-success', bg: 'bg-success/10' },
};

export function TodaysOrdersSection({ formatCurrency }: TodaysOrdersSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Today's Orders</h3>
        <a href="/orders/list" className="text-sm text-secondary hover:underline">
          View All
        </a>
      </div>
      
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart size={16} className="text-primary" />
            <span className="text-sm text-muted-foreground">Count</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{ordersData.total}</p>
        </div>
        <div className="p-3 bg-success/10 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-muted-foreground">Value</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(ordersData.value)}</p>
        </div>
      </div>
      
      {/* Status breakdown */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {Object.entries({ pending: ordersData.pending, approved: ordersData.approved, dispatched: ordersData.dispatched, delivered: ordersData.delivered }).map(([status, count]) => {
          const config = statusConfig[status as keyof typeof statusConfig];
          const Icon = config.icon;
          return (
            <div key={status} className={`p-2 ${config.bg} rounded-lg text-center`}>
              <Icon size={14} className={`${config.color} mx-auto mb-1`} />
              <p className="text-lg font-bold">{count}</p>
              <p className="text-xs text-muted-foreground capitalize">{status}</p>
            </div>
          );
        })}
      </div>
      
      {/* Recent orders */}
      <div className="space-y-2">
        {recentOrders.slice(0, 3).map(order => {
          const config = statusConfig[order.status as keyof typeof statusConfig];
          const Icon = config.icon;
          return (
            <div
              key={order.id}
              className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Icon size={14} className={config.color} />
                <div>
                  <p className="text-sm font-medium text-foreground">{order.id}</p>
                  <p className="text-xs text-muted-foreground">{order.distributor}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{formatCurrency(order.amount)}</p>
                <p className="text-xs text-muted-foreground">{order.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
