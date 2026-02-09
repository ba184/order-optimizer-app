import { useState } from 'react';
import { Filter, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';

interface Column {
  key: string;
  header: string;
}

interface ColumnFilterPopoverProps {
  columns: Column[];
  visibleColumns: string[];
  onVisibleColumnsChange: (columns: string[]) => void;
}

export function ColumnFilterPopover({
  columns,
  visibleColumns,
  onVisibleColumnsChange,
}: ColumnFilterPopoverProps) {
  const [open, setOpen] = useState(false);

  const toggleColumn = (columnKey: string) => {
    if (visibleColumns.includes(columnKey)) {
      // Don't allow hiding all columns
      if (visibleColumns.length > 1) {
        onVisibleColumnsChange(visibleColumns.filter(c => c !== columnKey));
      }
    } else {
      onVisibleColumnsChange([...visibleColumns, columnKey]);
    }
  };

  const selectAll = () => {
    onVisibleColumnsChange(columns.map(c => c.key));
  };

  const activeFilterCount = columns.length - visibleColumns.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Filter size={16} />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Show Columns</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={selectAll}
              className="h-7 text-xs"
            >
              Show All
            </Button>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {columns.map(column => (
              <label
                key={column.key}
                className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1.5 rounded-md transition-colors"
              >
                <Checkbox
                  checked={visibleColumns.includes(column.key)}
                  onCheckedChange={() => toggleColumn(column.key)}
                />
                <span className="text-sm">{column.header}</span>
              </label>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
