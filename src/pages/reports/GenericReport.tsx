import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { BarChart3, Construction } from 'lucide-react';
import ReportFilters, { FilterState, defaultFilters } from './components/ReportFilters';
import ExportButtons from './components/ExportButtons';

// Map paths to report names
const reportNames: Record<string, { title: string; description: string }> = {
  '/reports/sales/weekly': { title: 'Weekly Trend Report', description: 'Week-over-week sales performance analysis' },
  '/reports/sales/monthly': { title: 'Monthly/Quarterly Sales', description: 'Monthly and quarterly sales breakdown' },
  '/reports/sales/revenue': { title: 'Revenue Report', description: 'Detailed revenue analysis by channel' },
  '/reports/productivity/beat': { title: 'Beat Performance', description: 'Beat-wise coverage and productivity metrics' },
  '/reports/productivity/visits': { title: 'Visit Effectiveness', description: 'Productive vs non-productive visit analysis' },
  '/reports/productivity/ratio': { title: 'Order-to-Visit Ratio', description: 'Conversion rate from visits to orders' },
  '/reports/productivity/fse': { title: 'FSE Performance', description: 'Field sales executive performance dashboard' },
  '/reports/outlets/distributors': { title: 'Distributor Sales', description: 'Sales analysis by distributor' },
  '/reports/outlets/retailers': { title: 'Retailer Sales', description: 'Retailer-wise sales breakdown' },
  '/reports/outlets/growth': { title: 'New vs Existing Outlets', description: 'Customer acquisition and retention analysis' },
  '/reports/outlets/leads': { title: 'Lead Conversion', description: 'Lead to customer conversion funnel' },
  '/reports/products/sku': { title: 'SKU Performance', description: 'Product-wise sales analysis' },
  '/reports/products/category': { title: 'Category Sales Mix', description: 'Sales distribution by product category' },
  '/reports/products/movers': { title: 'Best vs Slow Movers', description: 'Product velocity analysis' },
  '/reports/products/returns': { title: 'Returns & Damages', description: 'Return rate and damage analysis' },
  '/reports/territory/zone': { title: 'Zone Performance', description: 'Zone-wise sales and coverage' },
  '/reports/territory/area': { title: 'Area Performance', description: 'Area-wise performance metrics' },
  '/reports/territory/heatmap': { title: 'City/Beat Maps', description: 'Geographic sales heatmap' },
  '/reports/schemes/performance': { title: 'Scheme Performance', description: 'Promotional scheme effectiveness' },
  '/reports/schemes/aging': { title: 'Claim Aging', description: 'Claim processing time analysis' },
  '/reports/schemes/payout': { title: 'Payout Analysis', description: 'Scheme payout breakdown' },
  '/reports/forecast/sales': { title: 'Sales Forecast', description: 'Predictive sales analytics' },
  '/reports/forecast/abc': { title: 'ABC Classification', description: 'Customer segmentation by value' },
  '/reports/forecast/credit': { title: 'Credit Utilization', description: 'Credit limit usage analysis' },
  '/reports/forecast/inventory': { title: 'Inventory Risk', description: 'Stock-out and overstock alerts' },
};

export default function GenericReport() {
  const location = useLocation();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  
  const reportInfo = reportNames[location.pathname] || { 
    title: 'Report', 
    description: 'Report details' 
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{reportInfo.title}</h1>
          <p className="text-muted-foreground">{reportInfo.description}</p>
        </div>
        <ExportButtons reportName={reportInfo.title} />
      </div>

      {/* Filters */}
      <ReportFilters filters={filters} onFilterChange={setFilters} />

      {/* Placeholder Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-12 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <BarChart3 size={32} className="text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{reportInfo.title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          This report will display {reportInfo.description.toLowerCase()}. 
          Use the filters above to customize your view.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Construction size={16} />
          <span>Detailed data integration coming soon</span>
        </div>
      </motion.div>

      {/* Sample Data Structure */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border border-border p-6"
      >
        <h4 className="font-medium text-foreground mb-4">Report will include:</h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm font-medium text-foreground">Outlet/Product/FSE Info</p>
            <p className="text-xs text-muted-foreground mt-1">Entity identification details</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm font-medium text-foreground">Sales Quantity</p>
            <p className="text-xs text-muted-foreground mt-1">Units sold in period</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm font-medium text-foreground">Sales Value (₹)</p>
            <p className="text-xs text-muted-foreground mt-1">Revenue generated</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm font-medium text-foreground">Performance vs Target</p>
            <p className="text-xs text-muted-foreground mt-1">Achievement percentage</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
