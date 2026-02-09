import { useMemo, useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Scheme, SchemeType, SlabConfig } from './useSchemesData';

export interface AppliedScheme {
  schemeId: string;
  schemeName: string;
  schemeCode: string | null;
  schemeType: SchemeType;
  benefitType: string;
  discountAmount: number;
  freeQuantity: number;
  freeProducts: { productId: string; productName: string; quantity: number }[];
  appliedToProducts: string[];
  description: string;
}

export interface SchemeCalculationResult {
  appliedSchemes: AppliedScheme[];
  totalDiscount: number;
  totalFreeGoods: { productId: string; productName: string; quantity: number }[];
  originalTotal: number;
  discountedTotal: number;
}

export interface CartItemWithProduct {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  sku: string;
  category?: string | null;
}

interface SchemeOverride {
  schemeId: string;
  originalBenefit: AppliedScheme;
  overrideBenefit: Partial<AppliedScheme>;
  reason: string;
}

// Fetch active schemes
export function useActiveSchemes() {
  return useQuery({
    queryKey: ['active-schemes'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('schemes')
        .select('*')
        .eq('status', 'active')
        .lte('start_date', today)
        .gte('end_date', today)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        type: item.type as SchemeType,
        slab_config: (Array.isArray(item.slab_config) ? item.slab_config : []) as unknown as SlabConfig[],
        eligible_skus: item.eligible_skus || [],
        applicable_products: item.applicable_products || [],
      })) as Scheme[];
    },
  });
}

// Log scheme override
export function useLogSchemeOverride() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      orderId,
      preOrderId,
      schemeId,
      originalBenefit,
      overrideBenefit,
      reason,
    }: {
      orderId?: string;
      preOrderId?: string;
      schemeId: string;
      originalBenefit: AppliedScheme;
      overrideBenefit: Partial<AppliedScheme>;
      reason: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('scheme_overrides' as any)
        .insert({
          order_id: orderId || null,
          pre_order_id: preOrderId || null,
          scheme_id: schemeId,
          original_benefit: originalBenefit,
          override_benefit: overrideBenefit,
          override_reason: reason,
          overridden_by: user.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheme-overrides'] });
      toast.success('Override logged successfully');
    },
    onError: (error) => {
      toast.error('Failed to log override: ' + error.message);
    },
  });
}

// Main scheme calculation hook
export function useSchemeCalculation(
  cartItems: CartItemWithProduct[],
  customerType: 'distributor' | 'retailer',
  customerCategory?: string
) {
  const { data: schemes = [] } = useActiveSchemes();
  const [manualOverrides, setManualOverrides] = useState<Map<string, SchemeOverride>>(new Map());

  // Filter applicable schemes based on customer type and cart items
  const applicableSchemes = useMemo(() => {
    return schemes.filter(scheme => {
      // Check applicability
      const applicability = scheme.applicability || 'all_outlets';
      if (applicability !== 'all_outlets') {
        if (applicability === 'distributor' && customerType !== 'distributor') return false;
        if (applicability === 'retailer' && customerType !== 'retailer') return false;
        if (applicability === 'segment' && customerCategory && !scheme.description?.includes(customerCategory)) return false;
      }

      // Check if any cart items match eligible SKUs
      if (scheme.eligible_skus && scheme.eligible_skus.length > 0) {
        const hasEligibleProduct = cartItems.some(item => 
          scheme.eligible_skus.includes(item.productId)
        );
        if (!hasEligibleProduct) return false;
      }

      return true;
    });
  }, [schemes, cartItems, customerType, customerCategory]);

  // Calculate benefits for each scheme
  const calculateSchemeResult = useCallback((): SchemeCalculationResult => {
    const appliedSchemes: AppliedScheme[] = [];
    let totalDiscount = 0;
    const totalFreeGoods: { productId: string; productName: string; quantity: number }[] = [];
    const originalTotal = cartItems.reduce((sum, item) => sum + item.total, 0);

    for (const scheme of applicableSchemes) {
      // Get relevant cart items for this scheme
      const relevantItems = scheme.eligible_skus && scheme.eligible_skus.length > 0
        ? cartItems.filter(item => scheme.eligible_skus.includes(item.productId))
        : cartItems;

      if (relevantItems.length === 0) continue;

      const itemsTotal = relevantItems.reduce((sum, item) => sum + item.total, 0);
      const itemsQuantity = relevantItems.reduce((sum, item) => sum + item.quantity, 0);

      let discountAmount = 0;
      let freeQuantity = 0;
      const freeProducts: { productId: string; productName: string; quantity: number }[] = [];
      let description = '';

      // Check manual override
      const override = manualOverrides.get(scheme.id);
      if (override) {
        discountAmount = override.overrideBenefit.discountAmount ?? 0;
        freeQuantity = override.overrideBenefit.freeQuantity ?? 0;
        description = `[Overridden] ${override.reason}`;
      } else {
        // Calculate based on scheme type
        switch (scheme.type) {
          case 'slab': {
            // Find applicable slab based on quantity
            const slabs = scheme.slab_config || [];
            const applicableSlab = slabs.find(
              slab => itemsQuantity >= slab.min_qty && itemsQuantity <= slab.max_qty
            );
            if (applicableSlab) {
              if (scheme.benefit_type === 'discount') {
                discountAmount = (itemsTotal * applicableSlab.benefit_value) / 100;
                description = `${applicableSlab.benefit_value}% off on ${itemsQuantity} units`;
              } else if (scheme.benefit_type === 'free_qty') {
                freeQuantity = applicableSlab.benefit_value;
                description = `Get ${freeQuantity} free on ${itemsQuantity} units`;
              }
            }
            break;
          }

          case 'buy_x_get_y': {
            const minQty = scheme.min_quantity || 1;
            const freeQty = scheme.free_quantity || 0;
            if (itemsQuantity >= minQty) {
              const sets = Math.floor(itemsQuantity / minQty);
              freeQuantity = sets * freeQty;
              // Add first relevant product as free good
              if (relevantItems.length > 0) {
                freeProducts.push({
                  productId: relevantItems[0].productId,
                  productName: relevantItems[0].productName,
                  quantity: freeQuantity,
                });
              }
              description = `Buy ${minQty} Get ${freeQty} Free (${sets} sets applied)`;
            }
            break;
          }

          case 'bill_wise': {
            const minValue = scheme.min_order_value || 0;
            if (itemsTotal >= minValue) {
              if (scheme.benefit_type === 'discount' && scheme.discount_percent) {
                discountAmount = (itemsTotal * scheme.discount_percent) / 100;
                // Apply max benefit cap
                if (scheme.max_benefit > 0 && discountAmount > scheme.max_benefit) {
                  discountAmount = scheme.max_benefit;
                }
                description = `${scheme.discount_percent}% off on orders ≥ ₹${minValue}`;
              } else if (scheme.benefit_type === 'cashback') {
                discountAmount = scheme.max_benefit || 0;
                description = `₹${discountAmount} cashback on orders ≥ ₹${minValue}`;
              }
            }
            break;
          }

          case 'volume': {
            const minQty = scheme.min_quantity || 0;
            if (itemsQuantity >= minQty && scheme.discount_percent) {
              discountAmount = (itemsTotal * scheme.discount_percent) / 100;
              description = `${scheme.discount_percent}% off on ${itemsQuantity}+ units`;
            }
            break;
          }

          case 'product': {
            if (scheme.discount_percent) {
              discountAmount = (itemsTotal * scheme.discount_percent) / 100;
              description = `${scheme.discount_percent}% off on selected products`;
            }
            break;
          }

          case 'combo': {
            // Check if all required products are in cart
            const requiredProducts = scheme.applicable_products || [];
            const hasAllProducts = requiredProducts.every((prod: any) =>
              cartItems.some(item => item.productId === (prod?.id || prod))
            );
            if (hasAllProducts && scheme.discount_percent) {
              discountAmount = (itemsTotal * scheme.discount_percent) / 100;
              description = `Combo deal: ${scheme.discount_percent}% off`;
            }
            break;
          }

          case 'display':
          case 'opening': {
            if (scheme.discount_percent) {
              discountAmount = (itemsTotal * scheme.discount_percent) / 100;
              description = `${scheme.type === 'display' ? 'Display' : 'Opening'} scheme: ${scheme.discount_percent}% off`;
            }
            break;
          }
        }
      }

      // Only add if there's a benefit
      if (discountAmount > 0 || freeQuantity > 0 || freeProducts.length > 0) {
        const appliedScheme: AppliedScheme = {
          schemeId: scheme.id,
          schemeName: scheme.name,
          schemeCode: scheme.code,
          schemeType: scheme.type,
          benefitType: scheme.benefit_type,
          discountAmount,
          freeQuantity,
          freeProducts,
          appliedToProducts: relevantItems.map(item => item.productId),
          description,
        };

        appliedSchemes.push(appliedScheme);
        totalDiscount += discountAmount;
        totalFreeGoods.push(...freeProducts);
      }
    }

    return {
      appliedSchemes,
      totalDiscount,
      totalFreeGoods,
      originalTotal,
      discountedTotal: originalTotal - totalDiscount,
    };
  }, [applicableSchemes, cartItems, manualOverrides]);

  const result = useMemo(() => calculateSchemeResult(), [calculateSchemeResult]);

  const addOverride = useCallback((override: SchemeOverride) => {
    setManualOverrides(prev => new Map(prev).set(override.schemeId, override));
  }, []);

  const removeOverride = useCallback((schemeId: string) => {
    setManualOverrides(prev => {
      const newMap = new Map(prev);
      newMap.delete(schemeId);
      return newMap;
    });
  }, []);

  const clearOverrides = useCallback(() => {
    setManualOverrides(new Map());
  }, []);

  return {
    ...result,
    applicableSchemes,
    manualOverrides,
    addOverride,
    removeOverride,
    clearOverrides,
  };
}
