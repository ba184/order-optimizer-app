import { Download, FileSpreadsheet, FileText, Printer } from 'lucide-react';
import { toast } from 'sonner';

interface ExportButtonsProps {
  reportName: string;
  onExport?: (format: 'excel' | 'csv' | 'pdf') => void;
}

export default function ExportButtons({ reportName, onExport }: ExportButtonsProps) {
  const handleExport = (format: 'excel' | 'csv' | 'pdf') => {
    if (onExport) {
      onExport(format);
    } else {
      toast.success(`Exporting ${reportName} as ${format.toUpperCase()}...`);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleExport('excel')}
        className="btn-outline text-sm py-1.5 flex items-center gap-2"
      >
        <FileSpreadsheet size={14} />
        Excel
      </button>
      <button
        onClick={() => handleExport('csv')}
        className="btn-outline text-sm py-1.5 flex items-center gap-2"
      >
        <Download size={14} />
        CSV
      </button>
      <button
        onClick={() => handleExport('pdf')}
        className="btn-outline text-sm py-1.5 flex items-center gap-2"
      >
        <FileText size={14} />
        PDF
      </button>
    </div>
  );
}
