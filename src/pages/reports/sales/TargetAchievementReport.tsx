import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { Target, TrendingUp, TrendingDown, Award, AlertTriangle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import ReportFilters, { FilterState, defaultFilters } from '../components/ReportFilters';
import KPICard from '../components/KPICard';
import ExportButtons from '../components/ExportButtons';

const targetData = [
  { id: '1', name: 'Rajesh Kumar', territory: 'North Delhi', target: 1200000, achieved: 1380000, gap: -180000, percentage: 115 },
  { id: '2', name: 'Priya Singh', territory: 'South Delhi', target: 1100000, achieved: 1188000, gap: -88000, percentage: 108 },
  { id: '3', name: 'Amit Sharma', territory: 'Gurgaon', target: 1000000, achieved: 1020000, gap: -20000, percentage: 102 },
  { id: '4', name: 'Vikram Patel', territory: 'Noida', target: 1050000, achieved: 997500, gap: 52500, percentage: 95 },
  { id: '5', name: 'Sunita Gupta', territory: 'Faridabad', target: 900000, achieved: 828000, gap: 72000, percentage: 92 },
  { id: '6', name: 'Arun Mehta', territory: 'Greater Noida', target: 850000, achieved: 680000, gap: 170000, percentage: 80 },
];

const chartData = targetData.map(d => ({
  name: d.name.split(' ')[0],
  target: d.target / 100000,
  achieved: d.achieved / 100000,
  percentage: d.percentage,
}));

const formatCurrency = (value: number) => `₹${value}L`;

export default function TargetAchievementReport() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const totalTarget = targetData.reduce((sum, d) => sum + d.target, 0);
  const totalAchieved = targetData.reduce((sum, d) => sum + d.achieved, 0);
  const overallPercentage = Math.round((totalAchieved / totalTarget) * 100);
  const aboveTarget = targetData.filter(d => d.percentage >= 100).length;
  const belowTarget = targetData.filter(d => d.percentage < 100).length;

  const columns = [
    {
      key: 'name',
      header: 'FSE',
      sortable: true,
      render: (item: typeof targetData[0]) => (
        <div>
          <p className="font-medium text-foreground">{item.name}</p>
          <p className="text-xs text-muted-foreground">{item.territory}</p>
        </div>
      ),
    },
    {
      key: 'target',
      header: 'Target',
      sortable: true,
      render: (item: typeof targetData[0]) => (
        <span className="font-medium">₹{(item.target / 100000).toFixed(1)}L</span>
      ),
    },
    {
      key: 'achieved',
      header: 'Achieved',
      sortable: true,
      render: (item: typeof targetData[0]) => (
        <span className="font-medium">₹{(item.achieved / 100000).toFixed(1)}L</span>
      ),
    },
    {
      key: 'gap',
      header: 'Gap',
      sortable: true,
      render: (item: typeof targetData[0]) => (
        <span className={`font-medium ${item.gap <= 0 ? 'text-success' : 'text-destructive'}`}>
          {item.gap <= 0 ? '+' : '-'}₹{Math.abs(item.gap / 100000).toFixed(1)}L
        </span>
      ),
    },
    {
      key: 'percentage',
      header: 'Achievement',
      sortable: true,
      render: (item: typeof targetData[0]) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${item.percentage >= 100 ? 'bg-success' : item.percentage >= 80 ? 'bg-warning' : 'bg-destructive'}`}
              style={{ width: `${Math.min(item.percentage, 100)}%` }}
            />
          </div>
          <span className={`text-sm font-medium ${item.percentage >= 100 ? 'text-success' : item.percentage >= 80 ? 'text-warning' : 'text-destructive'}`}>
            {item.percentage}%
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Target vs Achievement</h1>
          <p className="text-muted-foreground">Performance analysis against sales targets</p>
        </div>
        <ExportButtons reportName="Target vs Achievement" />
      </div>

      {/* Filters */}
      <ReportFilters filters={filters} onFilterChange={setFilters} showFseFilter />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Target"
          value={`₹${(totalTarget / 10000000).toFixed(1)}Cr`}
          subtitle="This month"
          icon={Target}
          iconColor="text-primary"
        />
        <KPICard
          title="Total Achieved"
          value={`₹${(totalAchieved / 10000000).toFixed(1)}Cr`}
          trend={{ value: overallPercentage - 100, label: 'of target' }}
          icon={TrendingUp}
          iconColor="text-success"
        />
        <KPICard
          title="Above Target"
          value={aboveTarget.toString()}
          subtitle={`${Math.round((aboveTarget / targetData.length) * 100)}% of team`}
          icon={Award}
          iconColor="text-success"
        />
        <KPICard
          title="Below Target"
          value={belowTarget.toString()}
          subtitle="Need attention"
          icon={AlertTriangle}
          iconColor="text-destructive"
        />
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="chart-container"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">Target vs Achievement by FSE</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={formatCurrency} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`₹${value}L`]}
            />
            <Legend />
            <Bar dataKey="target" fill="hsl(220, 20%, 70%)" name="Target" radius={[4, 4, 0, 0]} />
            <Bar dataKey="achieved" name="Achieved" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.percentage >= 100 ? 'hsl(142, 71%, 45%)' : entry.percentage >= 80 ? 'hsl(38, 92%, 50%)' : 'hsl(0, 84%, 60%)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border border-border overflow-hidden"
      >
        <DataTable
          data={targetData}
          columns={columns}
          searchPlaceholder="Search by FSE or territory..."
        />
      </motion.div>
    </div>
  );
}
