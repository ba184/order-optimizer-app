import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TopSellingSectionProps {
  formatCurrency: (value: number) => string;
}

type FilterType = 'se' | 'area' | 'zone' | 'state' | 'product' | 'distributor';

const mockData: Record<FilterType, Array<{ name: string; value: number; change: number; subtext?: string }>> = {
  se: [
    { name: 'Rahul Sharma', value: 2850000, change: 15.2, subtext: 'North Zone' },
    { name: 'Priya Singh', value: 2450000, change: 12.8, subtext: 'West Zone' },
    { name: 'Amit Kumar', value: 2180000, change: 8.5, subtext: 'East Zone' },
    { name: 'Neha Gupta', value: 1950000, change: -2.3, subtext: 'South Zone' },
    { name: 'Vikram Patel', value: 1720000, change: 5.1, subtext: 'Central Zone' },
  ],
  area: [
    { name: 'Connaught Place', value: 4250000, change: 18.5 },
    { name: 'Bandra West', value: 3850000, change: 12.3 },
    { name: 'Koramangala', value: 3420000, change: 9.8 },
    { name: 'Salt Lake', value: 2980000, change: 6.2 },
    { name: 'Jubilee Hills', value: 2650000, change: -1.5 },
  ],
  zone: [
    { name: 'North Zone', value: 12500000, change: 14.2 },
    { name: 'West Zone', value: 11800000, change: 11.5 },
    { name: 'South Zone', value: 10500000, change: 8.9 },
    { name: 'East Zone', value: 8900000, change: 5.4 },
    { name: 'Central Zone', value: 7200000, change: 3.2 },
  ],
  state: [
    { name: 'Maharashtra', value: 8500000, change: 16.8 },
    { name: 'Delhi NCR', value: 7200000, change: 12.4 },
    { name: 'Karnataka', value: 6800000, change: 9.2 },
    { name: 'Tamil Nadu', value: 5900000, change: 7.5 },
    { name: 'Gujarat', value: 5200000, change: 4.8 },
  ],
  product: [
    { name: 'Premium Widget A', value: 5600000, change: 22.5, subtext: 'SKU: PWA-001' },
    { name: 'Standard Widget B', value: 4800000, change: 15.3, subtext: 'SKU: SWB-002' },
    { name: 'Economy Pack C', value: 3900000, change: 8.7, subtext: 'SKU: EPC-003' },
    { name: 'Combo Deal D', value: 3200000, change: 5.2, subtext: 'SKU: CDD-004' },
    { name: 'Seasonal Item E', value: 2800000, change: -3.1, subtext: 'SKU: SIE-005' },
  ],
  distributor: [
    { name: 'Krishna Traders', value: 4250000, change: 18.5, subtext: 'Delhi' },
    { name: 'Sharma Distributors', value: 3850000, change: 14.2, subtext: 'Mumbai' },
    { name: 'Gupta Enterprises', value: 3420000, change: 11.8, subtext: 'Chennai' },
    { name: 'Patel Trading Co', value: 2980000, change: 8.5, subtext: 'Ahmedabad' },
    { name: 'Singh & Sons', value: 2650000, change: 6.2, subtext: 'Kolkata' },
  ],
};

const filterLabels: Record<FilterType, string> = {
  se: 'Sales Executive',
  area: 'Area',
  zone: 'Zone',
  state: 'State',
  product: 'Product',
  distributor: 'Distributor',
};

export function TopSellingSection({ formatCurrency }: TopSellingSectionProps) {
  const [filter, setFilter] = useState<FilterType>('se');
  const data = mockData[filter];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Top Selling</h3>
        <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="se">Sales Executive</SelectItem>
            <SelectItem value="area">Area</SelectItem>
            <SelectItem value="zone">Zone</SelectItem>
            <SelectItem value="state">State</SelectItem>
            <SelectItem value="product">Product</SelectItem>
            <SelectItem value="distributor">Distributor</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div
            key={item.name}
            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                {index + 1}
              </div>
              <div>
                <p className="font-medium text-foreground">{item.name}</p>
                {item.subtext && (
                  <p className="text-xs text-muted-foreground">{item.subtext}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-foreground">{formatCurrency(item.value)}</p>
              <div className="flex items-center gap-1 text-xs">
                {item.change >= 0 ? (
                  <TrendingUp size={12} className="text-success" />
                ) : (
                  <TrendingDown size={12} className="text-destructive" />
                )}
                <span className={item.change >= 0 ? 'text-success' : 'text-destructive'}>
                  {item.change >= 0 ? '+' : ''}{item.change}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
