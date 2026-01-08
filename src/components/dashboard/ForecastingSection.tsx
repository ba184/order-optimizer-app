import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ForecastingSectionProps {
  formatCurrency: (value: number) => string;
}

type ViewType = 'period' | 'employee' | 'zone' | 'state' | 'distributor';

const periodData = [
  { name: 'Week', actual: 8500000, forecast: 9200000 },
  { name: 'Month', actual: 28500000, forecast: 32000000 },
  { name: 'Quarter', actual: 85000000, forecast: 95000000 },
  { name: 'H1', actual: 145000000, forecast: 160000000 },
  { name: 'H2', actual: 140000000, forecast: 155000000 },
  { name: 'Year', actual: 285000000, forecast: 315000000 },
];

const employeeData = [
  { name: 'Rahul S.', actual: 2850000, forecast: 3200000 },
  { name: 'Priya S.', actual: 2450000, forecast: 2800000 },
  { name: 'Amit K.', actual: 2180000, forecast: 2500000 },
  { name: 'Neha G.', actual: 1950000, forecast: 2200000 },
  { name: 'Vikram P.', actual: 1720000, forecast: 1900000 },
];

const zoneData = [
  { name: 'North', actual: 12500000, forecast: 14000000 },
  { name: 'West', actual: 11800000, forecast: 13200000 },
  { name: 'South', actual: 10500000, forecast: 11800000 },
  { name: 'East', actual: 8900000, forecast: 10000000 },
  { name: 'Central', actual: 7200000, forecast: 8000000 },
];

const stateData = [
  { name: 'MH', actual: 8500000, forecast: 9500000 },
  { name: 'DL', actual: 7200000, forecast: 8000000 },
  { name: 'KA', actual: 6800000, forecast: 7500000 },
  { name: 'TN', actual: 5900000, forecast: 6500000 },
  { name: 'GJ', actual: 5200000, forecast: 5800000 },
];

const distributorData = [
  { name: 'Krishna T.', actual: 4250000, forecast: 4800000 },
  { name: 'Sharma D.', actual: 3850000, forecast: 4300000 },
  { name: 'Gupta E.', actual: 3420000, forecast: 3800000 },
  { name: 'Patel T.', actual: 2980000, forecast: 3300000 },
  { name: 'Singh S.', actual: 2650000, forecast: 2900000 },
];

const dataMap: Record<ViewType, typeof periodData> = {
  period: periodData,
  employee: employeeData,
  zone: zoneData,
  state: stateData,
  distributor: distributorData,
};

export function ForecastingSection({ formatCurrency }: ForecastingSectionProps) {
  const [view, setView] = useState<ViewType>('period');
  const data = dataMap[view];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Forecasting</h3>
        <Select value={view} onValueChange={(v) => setView(v as ViewType)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="period">By Period</SelectItem>
            <SelectItem value="employee">Employee-wise</SelectItem>
            <SelectItem value="zone">Zone-wise</SelectItem>
            <SelectItem value="state">State-wise</SelectItem>
            <SelectItem value="distributor">Distributor-wise</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
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
          <Legend />
          <Bar dataKey="actual" name="Actual" fill="hsl(215, 70%, 23%)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="forecast" name="Forecast" fill="hsl(178, 60%, 40%)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
