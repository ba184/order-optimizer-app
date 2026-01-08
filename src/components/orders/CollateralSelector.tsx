import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Minus, X, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  useActiveCollaterals,
  MarketingCollateral,
  COLLATERAL_TYPES,
} from '@/hooks/useMarketingCollateralsData';
import { useWarehouses } from '@/hooks/useWarehousesData';

export interface SelectedCollateral {
  collateralId: string;
  collateralName: string;
  quantity: number;
  warehouse?: string;
  instructions?: string;
}

interface CollateralSelectorProps {
  selectedItems: SelectedCollateral[];
  onChange: (items: SelectedCollateral[]) => void;
  className?: string;
}

export function CollateralSelector({
  selectedItems,
  onChange,
  className = '',
}: CollateralSelectorProps) {
  const [showSelector, setShowSelector] = useState(false);
  const [instructions, setInstructions] = useState<Record<string, string>>({});
  const { data: collaterals = [] } = useActiveCollaterals();
  const { data: warehouses = [] } = useWarehouses();

  const updateQuantity = (collateral: MarketingCollateral, delta: number) => {
    const existing = selectedItems.find(i => i.collateralId === collateral.id);
    const currentQty = existing?.quantity || 0;
    const newQty = Math.max(0, Math.min(collateral.current_stock, currentQty + delta));

    if (newQty === 0) {
      onChange(selectedItems.filter(i => i.collateralId !== collateral.id));
    } else if (existing) {
      onChange(selectedItems.map(i =>
        i.collateralId === collateral.id ? { ...i, quantity: newQty } : i
      ));
    } else {
      onChange([...selectedItems, {
        collateralId: collateral.id,
        collateralName: collateral.name,
        quantity: newQty,
        warehouse: collateral.warehouse || undefined,
      }]);
    }
  };

  const updateWarehouse = (collateralId: string, warehouse: string) => {
    onChange(selectedItems.map(i =>
      i.collateralId === collateralId ? { ...i, warehouse } : i
    ));
  };

  const updateInstructions = (collateralId: string, value: string) => {
    setInstructions(prev => ({ ...prev, [collateralId]: value }));
    onChange(selectedItems.map(i =>
      i.collateralId === collateralId ? { ...i, instructions: value } : i
    ));
  };

  const removeItem = (collateralId: string) => {
    onChange(selectedItems.filter(i => i.collateralId !== collateralId));
  };

  const getQuantity = (id: string) => {
    return selectedItems.find(i => i.collateralId === id)?.quantity || 0;
  };

  const totalItems = selectedItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck size={18} className="text-muted-foreground" />
          <span className="font-medium">Marketing Collaterals</span>
          {totalItems > 0 && (
            <Badge variant="secondary">{totalItems} items</Badge>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowSelector(!showSelector)}
          className="text-sm text-primary hover:underline"
        >
          {showSelector ? 'Hide' : 'Add Collaterals'}
        </button>
      </div>

      {/* Selected Items Summary */}
      {selectedItems.length > 0 && !showSelector && (
        <div className="space-y-2">
          {selectedItems.map(item => (
            <div
              key={item.collateralId}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Package size={16} className="text-muted-foreground" />
                <span className="text-sm">{item.collateralName}</span>
                <Badge variant="outline">x{item.quantity}</Badge>
                {item.warehouse && (
                  <span className="text-xs text-muted-foreground">
                    from {item.warehouse}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.collateralId)}
                className="p-1 hover:text-destructive"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Selector */}
      {showSelector && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border border-border rounded-lg p-4 space-y-4"
        >
          {/* Available Collaterals */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {collaterals.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No collaterals available
              </p>
            ) : (
              collaterals.map(collateral => {
                const qty = getQuantity(collateral.id);
                const isSelected = qty > 0;

                return (
                  <div
                    key={collateral.id}
                    className={`p-3 rounded-lg transition-colors ${
                      isSelected ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Package size={18} className="text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{collateral.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {COLLATERAL_TYPES.find(t => t.value === collateral.type)?.label} •
                            Stock: {collateral.current_stock}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(collateral, -1)}
                          disabled={qty === 0}
                          className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-50"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-medium">{qty}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(collateral, 1)}
                          disabled={qty >= collateral.current_stock}
                          className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-50"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Warehouse & Instructions for selected items */}
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-border space-y-2">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-muted-foreground">Warehouse:</label>
                          <select
                            value={selectedItems.find(i => i.collateralId === collateral.id)?.warehouse || ''}
                            onChange={(e) => updateWarehouse(collateral.id, e.target.value)}
                            className="input-field py-1 text-xs flex-1"
                          >
                            <option value="">Default ({collateral.warehouse || 'Not set'})</option>
                            {warehouses.map(w => (
                              <option key={w.id} value={w.name}>{w.name}</option>
                            ))}
                          </select>
                        </div>
                        <input
                          type="text"
                          placeholder="Add instructions/remarks..."
                          value={instructions[collateral.id] || ''}
                          onChange={(e) => updateInstructions(collateral.id, e.target.value)}
                          className="input-field py-1 text-xs w-full"
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowSelector(false)}
            className="w-full py-2 text-sm text-center text-muted-foreground hover:text-foreground"
          >
            Done
          </button>
        </motion.div>
      )}
    </div>
  );
}
