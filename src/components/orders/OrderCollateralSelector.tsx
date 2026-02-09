import { useState } from 'react';
import { Plus, Trash2, Package, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useActiveCollaterals } from '@/hooks/useMarketingCollateralsData';

export interface OrderCollateralItem {
  id: string;
  type: string;
  quantity: number;
  notes: string;
}

interface OrderCollateralSelectorProps {
  items: OrderCollateralItem[];
  onChange: (items: OrderCollateralItem[]) => void;
}

export function OrderCollateralSelector({ items, onChange }: OrderCollateralSelectorProps) {
  const { data: collaterals = [], isLoading } = useActiveCollaterals();

  const addItem = () => {
    const newItem: OrderCollateralItem = {
      id: crypto.randomUUID(),
      type: '',
      quantity: 1,
      notes: '',
    };
    onChange([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof OrderCollateralItem, value: string | number) => {
    onChange(
      items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  const getCollateralName = (collateralId: string) => {
    const collateral = collaterals.find(c => c.id === collateralId);
    return collateral?.name || collateralId;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground border border-dashed border-border rounded-lg">
          <Package size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No collaterals added</p>
          <p className="text-xs">Click "Add Collateral" to include marketing materials</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="p-4 bg-muted/30 rounded-lg border border-border space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Collateral #{index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 size={16} />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Collateral Name *
                  </label>
                  <Select
                    value={item.type}
                    onValueChange={(value) => updateItem(item.id, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select collateral" />
                    </SelectTrigger>
                    <SelectContent>
                      {collaterals.map(collateral => (
                        <SelectItem key={collateral.id} value={collateral.id}>
                          {collateral.name} ({collateral.current_stock} in stock)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Notes / Instructions
                </label>
                <Input
                  type="text"
                  placeholder="Add notes for this collateral..."
                  value={item.notes}
                  onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={addItem}
        className="w-full"
        disabled={collaterals.length === 0}
      >
        <Plus size={16} className="mr-2" />
        Add Collateral
      </Button>
      
      {collaterals.length === 0 && (
        <p className="text-xs text-muted-foreground text-center">
          No active collaterals available. Add collaterals in Marketing Collateral page first.
        </p>
      )}
    </div>
  );
}
