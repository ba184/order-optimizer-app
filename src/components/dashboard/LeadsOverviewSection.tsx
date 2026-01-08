import { motion } from 'framer-motion';
import { Trophy, XCircle, Clock, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const leadsData = {
  total: 245,
  won: 89,
  lost: 42,
  pending: 114,
  conversionRate: 36.3,
};

const pieData = [
  { name: 'Won', value: leadsData.won, color: 'hsl(142, 71%, 45%)' },
  { name: 'Lost', value: leadsData.lost, color: 'hsl(0, 84%, 60%)' },
  { name: 'Pending', value: leadsData.pending, color: 'hsl(38, 92%, 50%)' },
];

export function LeadsOverviewSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Leads Overview</h3>
        <a href="/sales-team/leads" className="text-sm text-secondary hover:underline">
          View All
        </a>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
            <Trophy size={20} className="text-success" />
            <div>
              <p className="text-2xl font-bold text-foreground">{leadsData.won}</p>
              <p className="text-xs text-muted-foreground">Won</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg">
            <XCircle size={20} className="text-destructive" />
            <div>
              <p className="text-2xl font-bold text-foreground">{leadsData.lost}</p>
              <p className="text-xs text-muted-foreground">Lost</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-warning/10 rounded-lg">
            <Clock size={20} className="text-warning" />
            <div>
              <p className="text-2xl font-bold text-foreground">{leadsData.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center">
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-1 text-sm mt-2">
            <TrendingUp size={14} className="text-success" />
            <span className="font-semibold text-foreground">{leadsData.conversionRate}%</span>
            <span className="text-muted-foreground">conversion</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
