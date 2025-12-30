import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { IndianRupee, ShoppingCart, Store, Users, TrendingUp } from 'lucide-react';
import ReportFilters, { FilterState, defaultFilters } from '../components/ReportFilters';
import KPICard from '../components/KPICard';
import ExportButtons from '../components/ExportButtons';

const dailySalesData = [
  { id: '1', date: '2024-12-30', fse: 'Rajesh Kumar', territory: 'North Delhi', outlets: 12, orders: 8, value: 125000, target: 100000, achievement: 125 },
  { id: '2', date: '2024-12-30', fse: 'Priya Singh', territory: 'South Delhi', outlets: 10, orders: 7, value: 98000, target: 100000, achievement: 98 },
  { id: '3', date: '2024-12-30', fse: 'Amit Sharma', territory: 'Gurgaon', outlets: 15, orders: 10, value: 145000, target: 120000, achievement: 121 },
  { id: '4', date: '2024-12-30', fse: 'Vikram Patel', territory: 'Noida', outlets: 8, orders: 5, value: 72000, target: 90000, achievement: 80 },
  { id: '5', date: '2024-12-30', fse: 'Sunita Gupta', territory: 'Faridabad', outlets: 11, orders: 6, value: 88000, target: 85000, achievement: 104 },
];

export default function DailySalesReport() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const columns = [
    { key: 'date', header: 'Date', sortable: true },
    { key: 'fse', header: 'FSE', sortable: true },
    { key: 'territory', header: 'Territory', sortable: true },
    { key: 'outlets', header: 'Outlets Visited', sortable: true },
    { key: 'orders', header: 'Orders', sortable: true },
    {
      key: 'value',
      header: 'Sales Value',
      sortable: true,
      render: (item: typeof dailySalesData[0]) => (
        <span className="font-medium">₹{item.value.toLocaleString('en-IN')}</span>
      ),
    },
    {
      key: 'achievement',
      header: 'Achievement',
      sortable: true,
      render: (item: typeof dailySalesData[0]) => (
        <span className={`font-medium ${item.achievement >= 100 ? 'text-success' : item.achievement >= 80 ? 'text-warning' : 'text-destructive'}`}>
          {item.achievement}%
        </span>
      ),
    },
  ];

  const totalSales = dailySalesData.reduce((sum, d) => sum + d.value, 0);
  const totalOrders = dailySalesData.reduce((sum, d) => sum + d.orders, 0);
  const totalOutlets = dailySalesData.reduce((sum, d) => sum + d.outlets, 0);
  const avgAchievement = Math.round(dailySalesData.reduce((sum, d) => sum + d.achievement, 0) / dailySalesData.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Daily Sales Report</h1>
          <p className="text-muted-foreground">Sales performance by executive for selected date</p>
        </div>
        <ExportButtons reportName="Daily Sales Report" />
      </div>

      {/* Filters */}
      <ReportFilters filters={filters} onFilterChange={setFilters} showFseFilter />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Sales"
          value={`₹${(totalSales / 100000).toFixed(1)}L`}
          trend={{ value: 8.5, label: 'vs yesterday' }}
          icon={IndianRupee}
          iconColor="text-primary"
        />
        <KPICard
          title="Total Orders"
          value={totalOrders.toString()}
          trend={{ value: 5.2, label: 'vs yesterday' }}
          icon={ShoppingCart}
          iconColor="text-secondary"
        />
        <KPICard
          title="Outlets Covered"
          value={totalOutlets.toString()}
          subtitle="56 unique outlets"
          icon={Store}
          iconColor="text-success"
        />
        <KPICard
          title="Avg Achievement"
          value={`${avgAchievement}%`}
          icon={TrendingUp}
          iconColor="text-warning"
        />
      </div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border overflow-hidden"
      >
        <DataTable
          data={dailySalesData}
          columns={columns}
          searchPlaceholder="Search by FSE or territory..."
        />
      </motion.div>
    </div>
  );
}
