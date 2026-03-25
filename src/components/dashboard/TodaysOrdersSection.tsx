import { motion } from 'framer-motion';
import { ShoppingCart, Clock, CheckCircle, Package, Truck, Loader2 } from 'lucide-react';
import { useOrders } from '@/hooks/useOrdersData';
import { useMemo } from 'react';

interface TodaysOrdersSectionProps {
  formatCurrency: (value: number) => string;
}

const statusConfig = {
  pending: { icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
  approved: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
  dispatched: { icon: Package, color: 'text-info', bg: 'bg-info/10' },
  delivered: { icon: Truck, color: 'text-success', bg: 'bg-success/10' },
};

export function TodaysOrdersSection({ formatCurrency }: TodaysOrdersSectionProps) {
  const { data: orders = [], isLoading } = useOrders();

  const { todayOrders, stats } = useMemo(() => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today);
    return {
      todayOrders,
      stats: {
        total: todayOrders.length,
        value: todayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
        pending: todayOrders.filter(o => o.status === 'pending').length,
        approved: todayOrders.filter(o => o.status === 'approved').length,
        dispatched: todayOrders.filter(o => o.status === 'dispatched').length,
        delivered: todayOrders.filter(o => o.status === 'delivered').length,
      },
    };
  }, [orders]);

  const recentOrders = useMemo(() => {
    return orders.slice(0, 4).map(o => {
      const diff = Date.now() - new Date(o.created_at).getTime();
      const mins = Math.floor(diff / 60000);
      const time = mins < 60 ? `${mins} min ago` : mins < 1440 ? `${Math.floor(mins / 60)} hours ago` : `${Math.floor(mins / 1440)} days ago`;
      return {
        id: o.order_number,
        distributor: o.distributor?.firm_name || 'N/A',
        amount: o.total_amount,
        status: o.status as keyof typeof statusConfig,
        time,
      };
    });
  }, [orders]);

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-5 shadow-sm flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Today's Orders</h3>
        <a href="/orders/list" className="text-sm text-secondary hover:underline">View All</a>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart size={16} className="text-primary" />
            <span className="text-sm text-muted-foreground">Count</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="p-3 bg-success/10 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-muted-foreground">Value</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.value)}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {Object.entries({ pending: stats.pending, approved: stats.approved, dispatched: stats.dispatched, delivered: stats.delivered }).map(([status, count]) => {
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

      <div className="space-y-2">
        {recentOrders.slice(0, 3).map(order => {
          const config = statusConfig[order.status] || statusConfig.pending;
          const Icon = config.icon;
          return (
            <div key={order.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
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
