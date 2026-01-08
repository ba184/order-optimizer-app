import { Tag, Gift, Percent } from 'lucide-react';
import { Scheme } from '@/hooks/useSchemesData';

interface ProductSchemesBadgeProps {
  schemes: Scheme[];
  productId: string;
  compact?: boolean;
}

export function ProductSchemesBadge({ schemes, productId, compact = false }: ProductSchemesBadgeProps) {
  // Filter schemes applicable to this product
  const applicableSchemes = schemes.filter(scheme => {
    // If no eligible_skus specified, scheme applies to all
    if (!scheme.eligible_skus || scheme.eligible_skus.length === 0) return true;
    return scheme.eligible_skus.includes(productId);
  });

  if (applicableSchemes.length === 0) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-1 mt-1">
        <Tag size={10} className="text-success" />
        <span className="text-[10px] text-success font-medium">
          {applicableSchemes.length} offer{applicableSchemes.length > 1 ? 's' : ''}
        </span>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-1">
      {applicableSchemes.slice(0, 2).map(scheme => (
        <div
          key={scheme.id}
          className="flex items-center gap-1.5 px-2 py-1 bg-success/10 rounded-md text-[11px]"
        >
          {scheme.benefit_type === 'free_qty' ? (
            <Gift size={10} className="text-success shrink-0" />
          ) : (
            <Percent size={10} className="text-success shrink-0" />
          )}
          <span className="text-success font-medium truncate">
            {getSchemeLabel(scheme)}
          </span>
        </div>
      ))}
      {applicableSchemes.length > 2 && (
        <p className="text-[10px] text-muted-foreground pl-2">
          +{applicableSchemes.length - 2} more offer{applicableSchemes.length - 2 > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

function getSchemeLabel(scheme: Scheme): string {
  switch (scheme.type) {
    case 'buy_x_get_y':
      return `Buy ${scheme.min_quantity || 0} Get ${scheme.free_quantity || 0} Free`;
    case 'slab':
      if (scheme.slab_config && scheme.slab_config.length > 0) {
        const firstSlab = scheme.slab_config[0];
        return `${firstSlab.benefit_value}% off on ${firstSlab.min_qty}+ units`;
      }
      return scheme.name;
    case 'value_wise':
    case 'bill_wise':
      return `${scheme.discount_percent || 0}% off on ₹${scheme.min_order_value || 0}+`;
    case 'volume':
      return `${scheme.discount_percent || 0}% off on ${scheme.min_quantity || 0}+ qty`;
    case 'product':
      return `${scheme.discount_percent || 0}% off`;
    case 'combo':
      return `Combo: ${scheme.discount_percent || 0}% off`;
    default:
      return scheme.name;
  }
}
