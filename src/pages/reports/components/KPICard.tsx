import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
  };
  icon: React.ElementType;
  iconColor?: string;
  delay?: number;
}

export default function KPICard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  iconColor = 'text-primary',
  delay = 0,
}: KPICardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp size={14} />;
    if (trend.value < 0) return <TrendingDown size={14} />;
    return <Minus size={14} />;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.value > 0) return 'text-success';
    if (trend.value < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="stat-card"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <p className={cn('text-sm flex items-center gap-1 mt-2', getTrendColor())}>
              {getTrendIcon()}
              {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl bg-opacity-10', iconColor.replace('text-', 'bg-').replace(/\/\d+/, '/10'))}>
          <Icon size={24} className={iconColor} />
        </div>
      </div>
    </motion.div>
  );
}
