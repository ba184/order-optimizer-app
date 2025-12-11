import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdvancedScheme {
  id: string;
  name: string;
  code: string;
  type: string;
  description: string | null;
  start_date: string;
  end_date: string;
  applicability: string | null;
  benefit: string | null;
  min_value: number | null;
  max_benefit: number | null;
  claims_generated: number;
  claims_approved: number;
  total_payout: number;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SchemeClaim {
  id: string;
  scheme_id: string;
  applicant_type: string;
  retailer_id: string | null;
  distributor_id: string | null;
  claim_amount: number;
  claim_status: string;
  remarks: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  retailer?: { shop_name: string; code: string; city: string } | null;
  distributor?: { firm_name: string; code: string; city: string } | null;
}

export function useAdvancedSchemes() {
  return useQuery({
    queryKey: ['advanced-schemes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advanced_schemes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AdvancedScheme[];
    },
  });
}

export function useSchemeClaims(schemeId: string | undefined) {
  return useQuery({
    queryKey: ['scheme-claims', schemeId],
    queryFn: async () => {
      if (!schemeId) return [];
      const { data, error } = await supabase
        .from('scheme_claims')
        .select(`
          *,
          retailer:retailers(shop_name, code, city),
          distributor:distributors(firm_name, code, city)
        `)
        .eq('scheme_id', schemeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SchemeClaim[];
    },
    enabled: !!schemeId,
  });
}

export function useCreateAdvancedScheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scheme: Omit<AdvancedScheme, 'id' | 'created_at' | 'updated_at' | 'claims_generated' | 'claims_approved' | 'total_payout'>) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('advanced_schemes')
        .insert({
          ...scheme,
          created_by: userData.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advanced-schemes'] });
      toast.success('Scheme created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create scheme: ' + error.message);
    },
  });
}

export function useUpdateAdvancedScheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AdvancedScheme> & { id: string }) => {
      const { data, error } = await supabase
        .from('advanced_schemes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advanced-schemes'] });
      toast.success('Scheme updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update scheme: ' + error.message);
    },
  });
}

export function useDeleteAdvancedScheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('advanced_schemes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advanced-schemes'] });
      toast.success('Scheme deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete scheme: ' + error.message);
    },
  });
}

export function useUpdateClaimStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, schemeId }: { id: string; status: string; schemeId: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const updateData: any = { claim_status: status };
      if (status === 'approved') {
        updateData.approved_by = userData.user?.id;
        updateData.approved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('scheme_claims')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Update scheme stats
      const { data: claims } = await supabase
        .from('scheme_claims')
        .select('claim_status, claim_amount')
        .eq('scheme_id', schemeId);

      if (claims) {
        const approved = claims.filter(c => c.claim_status === 'approved');
        const totalPayout = approved.reduce((sum, c) => sum + Number(c.claim_amount), 0);

        await supabase
          .from('advanced_schemes')
          .update({
            claims_generated: claims.length,
            claims_approved: approved.length,
            total_payout: totalPayout,
          })
          .eq('id', schemeId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheme-claims'] });
      queryClient.invalidateQueries({ queryKey: ['advanced-schemes'] });
      toast.success('Claim status updated');
    },
    onError: (error) => {
      toast.error('Failed to update claim: ' + error.message);
    },
  });
}
