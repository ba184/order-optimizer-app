import { StatCard } from '@/components/ui/StatCard';
import {
  IndianRupee,
  ShoppingCart,
  Store,
  Users,
  TrendingUp,
  Target,
  Building2,
  Warehouse,
} from 'lucide-react';
import { useWarehouses } from '@/hooks/useWarehousesData';

interface DashboardKPICardsProps {
  isAdmin: boolean;
  formatCurrency: (value: number) => string;
}

// Mock data - would come from API
const kpiData = {
  totalSales: {
    today: 1250000,
    mtd: 28500000,
    ytd: 285000000,
  },
  orders: {
    today: 48,
    value: 1250000,
  },
  activeDistributors: 156,
  activeRetailers: 1245,
  activeSalesTeam: 42,
  targetAchievement: 87.5,
};

export function DashboardKPICards({ isAdmin, formatCurrency }: DashboardKPICardsProps) {
  const { data: warehouses } = useWarehouses();
  
  const warehouseStats = {
    total: warehouses?.length || 0,
    central: warehouses?.filter(w => w.location_type === 'central').length || 0,
    depot: warehouses?.filter(w => w.location_type === 'depot').length || 0,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Sales - Today */}
      <StatCard
        title="Today's Sales"
        value={formatCurrency(kpiData.totalSales.today)}
        change="+12.5% from yesterday"
        changeType="positive"
        icon={IndianRupee}
        iconColor="bg-primary"
      />
      
      {/* MTD Sales */}
      <StatCard
        title="MTD Sales"
        value={formatCurrency(kpiData.totalSales.mtd)}
        change="+8.2% vs last month"
        changeType="positive"
        icon={TrendingUp}
        iconColor="bg-secondary"
      />
      
      {/* Today's Orders */}
      <StatCard
        title="Today's Orders"
        value={kpiData.orders.today.toString()}
        change={formatCurrency(kpiData.orders.value)}
        changeType="neutral"
        icon={ShoppingCart}
        iconColor="bg-success"
      />
      
      {/* Target Achievement */}
      <StatCard
        title="Target Achievement"
        value={`${kpiData.targetAchievement}%`}
        change="+5.2% vs last week"
        changeType="positive"
        icon={Target}
        iconColor="bg-warning"
      />

      {isAdmin && (
        <>
          {/* Total Warehouses */}
          <StatCard
            title="Total Warehouses"
            value={warehouseStats.total.toString()}
            change={`${warehouseStats.central} Central, ${warehouseStats.depot} Depot`}
            changeType="neutral"
            icon={Warehouse}
            iconColor="bg-info"
          />
          
          {/* Active Distributors */}
          <StatCard
            title="Active Distributors"
            value={kpiData.activeDistributors.toString()}
            change="12 new this month"
            changeType="positive"
            icon={Building2}
            iconColor="bg-primary"
          />
          
          {/* Active Retailers */}
          <StatCard
            title="Active Retailers"
            value={kpiData.activeRetailers.toLocaleString()}
            change="32 new this week"
            changeType="positive"
            icon={Store}
            iconColor="bg-secondary"
          />
          
          {/* Active Sales Team */}
          <StatCard
            title="Active Sales Team"
            value={kpiData.activeSalesTeam.toString()}
            change="38 on field today"
            changeType="positive"
            icon={Users}
            iconColor="bg-success"
          />
        </>
      )}
    </div>
  );
}
