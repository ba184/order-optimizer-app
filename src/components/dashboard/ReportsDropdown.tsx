import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FileText, BarChart3, Users, TrendingUp, ArrowRight } from 'lucide-react';

const reports = [
  { value: 'daily-sales', label: 'Daily Sales Report', icon: FileText, path: '/reports/sales/daily' },
  { value: 'target-achievement', label: 'Target Achievement', icon: TrendingUp, path: '/reports/sales/target-achievement' },
  { value: 'performance', label: 'Performance Report', icon: BarChart3, path: '/reports' },
  { value: 'productivity', label: 'Productivity Report', icon: Users, path: '/reports' },
];

export function ReportsDropdown() {
  const [selectedReport, setSelectedReport] = useState('');
  const navigate = useNavigate();

  const handleViewReport = () => {
    const report = reports.find(r => r.value === selectedReport);
    if (report) {
      navigate(report.path);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-5 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">Quick Reports</h3>
      
      <div className="flex items-center gap-3">
        <Select value={selectedReport} onValueChange={setSelectedReport}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select a report..." />
          </SelectTrigger>
          <SelectContent>
            {reports.map((report) => (
              <SelectItem key={report.value} value={report.value}>
                <div className="flex items-center gap-2">
                  <report.icon size={16} />
                  <span>{report.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          onClick={handleViewReport} 
          disabled={!selectedReport}
          className="gap-2"
        >
          View <ArrowRight size={16} />
        </Button>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-2">
        {reports.slice(0, 4).map((report) => (
          <button
            key={report.value}
            onClick={() => navigate(report.path)}
            className="flex items-center gap-2 p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors text-left"
          >
            <report.icon size={14} />
            <span className="truncate">{report.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
