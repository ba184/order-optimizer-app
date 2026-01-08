import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TargetAchievementSectionProps {
  formatCurrency: (value: number) => string;
}

const comparisonData = [
  {
    label: 'Current Week vs Last Week',
    current: 8500000,
    previous: 7200000,
    target: 9000000,
  },
  {
    label: 'Current Month vs Last Month',
    current: 28500000,
    previous: 26800000,
    target: 32000000,
  },
  {
    label: 'Current Year vs Last Year',
    current: 285000000,
    previous: 248000000,
    target: 350000000,
  },
];

export function TargetAchievementSection({ formatCurrency }: TargetAchievementSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-5 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">Target vs Achievement</h3>
      <div className="space-y-4">
        {comparisonData.map((item) => {
          const achievement = (item.current / item.target) * 100;
          const change = ((item.current - item.previous) / item.previous) * 100;
          
          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <div className="flex items-center gap-2">
                  {change > 0 ? (
                    <TrendingUp size={14} className="text-success" />
                  ) : change < 0 ? (
                    <TrendingDown size={14} className="text-destructive" />
                  ) : (
                    <Minus size={14} className="text-muted-foreground" />
                  )}
                  <span className={change >= 0 ? 'text-success' : 'text-destructive'}>
                    {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                  </span>
                </div>
              </div>
              <Progress value={Math.min(achievement, 100)} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Current: {formatCurrency(item.current)}</span>
                <span>Target: {formatCurrency(item.target)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
