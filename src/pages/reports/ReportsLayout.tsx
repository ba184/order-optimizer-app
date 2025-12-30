import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Users,
  Store,
  Package,
  MapPin,
  Gift,
  Activity,
  ChevronDown,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportCategory {
  label: string;
  icon: React.ElementType;
  path: string;
  children?: { label: string; path: string }[];
}

const reportCategories: ReportCategory[] = [
  {
    label: 'Sales Performance',
    icon: TrendingUp,
    path: '/reports/sales',
    children: [
      { label: 'Daily Sales Report', path: '/reports/sales/daily' },
      { label: 'Weekly Trend Report', path: '/reports/sales/weekly' },
      { label: 'Monthly/Quarterly Sales', path: '/reports/sales/monthly' },
      { label: 'Revenue Report', path: '/reports/sales/revenue' },
      { label: 'Target vs Achievement', path: '/reports/sales/target' },
    ],
  },
  {
    label: 'Sales Productivity',
    icon: Activity,
    path: '/reports/productivity',
    children: [
      { label: 'Beat Performance', path: '/reports/productivity/beat' },
      { label: 'Visit Effectiveness', path: '/reports/productivity/visits' },
      { label: 'Order-to-Visit Ratio', path: '/reports/productivity/ratio' },
      { label: 'FSE Performance', path: '/reports/productivity/fse' },
    ],
  },
  {
    label: 'Outlet Performance',
    icon: Store,
    path: '/reports/outlets',
    children: [
      { label: 'Distributor Sales', path: '/reports/outlets/distributors' },
      { label: 'Retailer Sales', path: '/reports/outlets/retailers' },
      { label: 'New vs Existing', path: '/reports/outlets/growth' },
      { label: 'Lead Conversion', path: '/reports/outlets/leads' },
    ],
  },
  {
    label: 'Product Intelligence',
    icon: Package,
    path: '/reports/products',
    children: [
      { label: 'SKU Performance', path: '/reports/products/sku' },
      { label: 'Category Sales Mix', path: '/reports/products/category' },
      { label: 'Best vs Slow Movers', path: '/reports/products/movers' },
      { label: 'Returns & Damages', path: '/reports/products/returns' },
    ],
  },
  {
    label: 'Territory Insights',
    icon: MapPin,
    path: '/reports/territory',
    children: [
      { label: 'Zone Performance', path: '/reports/territory/zone' },
      { label: 'Area Performance', path: '/reports/territory/area' },
      { label: 'City/Beat Maps', path: '/reports/territory/heatmap' },
    ],
  },
  {
    label: 'Schemes & Claims',
    icon: Gift,
    path: '/reports/schemes',
    children: [
      { label: 'Scheme Performance', path: '/reports/schemes/performance' },
      { label: 'Claim Aging', path: '/reports/schemes/aging' },
      { label: 'Payout Analysis', path: '/reports/schemes/payout' },
    ],
  },
  {
    label: 'Forecasting & Health',
    icon: BarChart3,
    path: '/reports/forecast',
    children: [
      { label: 'Sales Forecast', path: '/reports/forecast/sales' },
      { label: 'ABC Classification', path: '/reports/forecast/abc' },
      { label: 'Credit Utilization', path: '/reports/forecast/credit' },
      { label: 'Inventory Risk', path: '/reports/forecast/inventory' },
    ],
  },
];

export default function ReportsLayout() {
  const location = useLocation();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Sales Performance']);

  const toggleCategory = (label: string) => {
    setExpandedCategories(prev =>
      prev.includes(label) ? prev.filter(c => c !== label) : [...prev, label]
    );
  };

  const isActive = (path: string) => location.pathname === path;
  const isCategoryActive = (category: ReportCategory) => {
    if (category.children) {
      return category.children.some(child => location.pathname.startsWith(child.path));
    }
    return location.pathname.startsWith(category.path);
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Sidebar Navigation */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-64 shrink-0 bg-card rounded-xl border border-border p-4 h-fit sticky top-4"
      >
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-primary" />
          Reports
        </h2>
        <nav className="space-y-1">
          {reportCategories.map(category => (
            <div key={category.label}>
              <button
                onClick={() => toggleCategory(category.label)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isCategoryActive(category)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-2">
                  <category.icon size={16} />
                  <span>{category.label}</span>
                </div>
                {category.children && (
                  expandedCategories.includes(category.label) 
                    ? <ChevronDown size={14} /> 
                    : <ChevronRight size={14} />
                )}
              </button>
              <AnimatePresence>
                {category.children && expandedCategories.includes(category.label) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                      {category.children.map(child => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          className={cn(
                            'block px-3 py-1.5 text-xs rounded-md transition-colors',
                            isActive(child.path)
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Quick Export */}
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Quick Export</p>
          <div className="flex gap-2">
            <button className="flex-1 btn-outline text-xs py-2 flex items-center justify-center gap-1">
              <FileSpreadsheet size={14} />
              Excel
            </button>
            <button className="flex-1 btn-outline text-xs py-2 flex items-center justify-center gap-1">
              <FileText size={14} />
              PDF
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
