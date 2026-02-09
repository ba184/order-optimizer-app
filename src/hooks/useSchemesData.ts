import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type SchemeType = 'slab' | 'buy_x_get_y' | 'combo' | 'bill_wise' | 'display' | 'volume' | 'product' | 'opening';
export type SchemeStatus = 'draft' | 'pending' | 'active' | 'expired' | 'closed' | 'cancelled';
export type BenefitType = 'discount' | 'free_qty' | 'cashback' | 'points' | 'coupon';
export type Applicability = 'all_outlets' | 'distributor' | 'retailer' | 'segment' | 'area' | 'zone';

export interface SlabConfig {
  min_qty: number;
  max_qty: number;
  benefit_value: number;
}

export interface Scheme {
  id: string;
  code: string | null;
  name: string;
  type: SchemeType;
  description: string | null;
  start_date: string;
  end_date: string;
  min_quantity: number | null;
  free_quantity: number | null;
  discount_percent: number | null;
  applicable_products: string[];
  status: SchemeStatus;
  benefit_type: BenefitType;
  applicability: Applicability;
  eligible_skus: string[];
  slab_config: SlabConfig[];
  min_order_value: number;
  max_benefit: number;
  outlet_claim_limit: number | null;
  claims_generated: number;
  claims_approved: number;
  total_payout: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSchemeData {
  code?: string;
  name: string;
  type: SchemeType;
  description?: string | null;
  start_date: string;
  end_date: string;
  min_quantity?: number | null;
  free_quantity?: number | null;
  discount_percent?: number | null;
  applicable_products?: string[];
  status?: SchemeStatus;
  benefit_type?: BenefitType;
  applicability?: Applicability;
  eligible_skus?: string[];
  slab_config?: SlabConfig[];
  min_order_value?: number;
  max_benefit?: number;
  outlet_claim_limit?: number | null;
}

export function useSchemes() {
  return useQuery({
    queryKey: ['schemes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schemes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        type: item.type as SchemeType,
        status: item.status as SchemeStatus,
        benefit_type: (item.benefit_type || 'discount') as BenefitType,
        applicability: (item.applicability || 'all_outlets') as Applicability,
        eligible_skus: item.eligible_skus || [],
        slab_config: (Array.isArray(item.slab_config) ? item.slab_config : []) as unknown as SlabConfig[],
        min_order_value: item.min_order_value || 0,
        max_benefit: item.max_benefit || 0,
        outlet_claim_limit: item.outlet_claim_limit,
        claims_generated: item.claims_generated || 0,
        claims_approved: item.claims_approved || 0,
        total_payout: item.total_payout || 0,
      })) as Scheme[];
    },
  });
}

export function useCreateScheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scheme: CreateSchemeData) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('schemes')
        .insert({
          ...scheme,
          created_by: userData.user?.id,
          slab_config: scheme.slab_config ? JSON.stringify(scheme.slab_config) : '[]',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemes'] });
      toast.success('Scheme created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create scheme: ' + error.message);
    },
  });
}

export function useUpdateScheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Scheme> & { id: string }) => {
      const updateData = {
        ...updates,
        slab_config: updates.slab_config ? JSON.stringify(updates.slab_config) : undefined,
      };

      const { data, error } = await supabase
        .from('schemes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemes'] });
      toast.success('Scheme updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update scheme: ' + error.message);
    },
  });
}

export function useDeleteScheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('schemes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemes'] });
      toast.success('Scheme deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete scheme: ' + error.message);
    },
  });
}

// Helper to calculate scheme stats
export function calculateSchemeStats(schemes: Scheme[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return {
    total: schemes.length,
    active: schemes.filter(s => s.status === 'active').length,
    expired: schemes.filter(s => new Date(s.end_date) < today || s.status === 'expired').length,
    claimsGenerated: schemes.reduce((sum, s) => sum + (s.claims_generated || 0), 0),
    claimsApproved: schemes.reduce((sum, s) => sum + (s.claims_approved || 0), 0),
    totalPayout: schemes.reduce((sum, s) => sum + (s.total_payout || 0), 0),
  };
}
