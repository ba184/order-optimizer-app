import { useState } from 'react';
import { Calendar, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FilterState {
  dateRange: string;
  startDate: string;
  endDate: string;
  zone: string;
  area: string;
  outletType: string;
  category: string;
  fse: string;
}

interface ReportFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  showOutletFilter?: boolean;
  showProductFilter?: boolean;
  showFseFilter?: boolean;
}

export const defaultFilters: FilterState = {
  dateRange: 'this_month',
  startDate: '',
  endDate: '',
  zone: 'all',
  area: 'all',
  outletType: 'all',
  category: 'all',
  fse: 'all',
};

export default function ReportFilters({
  filters,
  onFilterChange,
  showOutletFilter = true,
  showProductFilter = true,
  showFseFilter = false,
}: ReportFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFilterChange(defaultFilters);
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => key !== 'dateRange' && value !== 'all' && value !== ''
  );

  return (
    <div className="bg-card rounded-xl border border-border p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Time Period */}
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-muted-foreground" />
          <select
            value={filters.dateRange}
            onChange={(e) => updateFilter('dateRange', e.target.value)}
            className="input-field text-sm py-1.5"
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_quarter">This Quarter</option>
            <option value="this_year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {filters.dateRange === 'custom' && (
          <>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => updateFilter('startDate', e.target.value)}
              className="input-field text-sm py-1.5"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => updateFilter('endDate', e.target.value)}
              className="input-field text-sm py-1.5"
            />
          </>
        )}

        {/* Zone Filter */}
        <select
          value={filters.zone}
          onChange={(e) => updateFilter('zone', e.target.value)}
          className="input-field text-sm py-1.5"
        >
          <option value="all">All Zones</option>
          <option value="north">North</option>
          <option value="south">South</option>
          <option value="east">East</option>
          <option value="west">West</option>
        </select>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`btn-outline text-sm py-1.5 flex items-center gap-2 ${hasActiveFilters ? 'border-primary text-primary' : ''}`}
        >
          <Filter size={14} />
          More Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-primary" />
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <X size={14} />
            Reset
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-border flex flex-wrap gap-4">
              {/* Area Filter */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Area</label>
                <select
                  value={filters.area}
                  onChange={(e) => updateFilter('area', e.target.value)}
                  className="input-field text-sm py-1.5"
                >
                  <option value="all">All Areas</option>
                  <option value="area1">Area 1</option>
                  <option value="area2">Area 2</option>
                  <option value="area3">Area 3</option>
                </select>
              </div>

              {showOutletFilter && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Outlet Type</label>
                  <select
                    value={filters.outletType}
                    onChange={(e) => updateFilter('outletType', e.target.value)}
                    className="input-field text-sm py-1.5"
                  >
                    <option value="all">All Outlets</option>
                    <option value="distributor">Distributors</option>
                    <option value="retailer">Retailers</option>
                  </select>
                </div>
              )}

              {showProductFilter && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => updateFilter('category', e.target.value)}
                    className="input-field text-sm py-1.5"
                  >
                    <option value="all">All Categories</option>
                    <option value="alpha">Alpha Series</option>
                    <option value="beta">Beta Series</option>
                    <option value="gamma">Gamma Series</option>
                  </select>
                </div>
              )}

              {showFseFilter && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">FSE</label>
                  <select
                    value={filters.fse}
                    onChange={(e) => updateFilter('fse', e.target.value)}
                    className="input-field text-sm py-1.5"
                  >
                    <option value="all">All FSEs</option>
                    <option value="fse1">Rajesh Kumar</option>
                    <option value="fse2">Priya Singh</option>
                    <option value="fse3">Amit Sharma</option>
                  </select>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
