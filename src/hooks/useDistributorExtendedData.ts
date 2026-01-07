import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Types
export interface DistributorProduct {
  id: string;
  distributor_id: string;
  product_id: string;
  margin_percent: number;
}

export interface DistributorPricingTier {
  id: string;
  distributor_id: string;
  min_qty: number;
  max_qty: number;
  margin_percent: number;
}

export interface DistributorScheme {
  id: string;
  distributor_id: string;
  scheme_id: string;
}

export interface DistributorKycDocument {
  id: string;
  distributor_id: string;
  document_type: string;
  document_number: string;
  file_url: string | null;
  status: string;
}

export interface DistributorSecondaryCounter {
  id: string;
  distributor_id: string;
  name: string;
  contact_person: string | null;
  address: string | null;
  phone: string | null;
}

export interface DistributorWarehouse {
  id: string;
  distributor_id: string;
  name: string;
  address: string | null;
  contact_person: string | null;
  phone: string | null;
  photos: string[] | null;
}

export interface DistributorPreorder {
  id: string;
  distributor_id: string;
  product_id: string | null;
  quantity: number;
  expected_delivery: string | null;
  preorder_value: number;
}

export interface DistributorVehicle {
  id: string;
  distributor_id: string;
  vehicle_number: string;
  vehicle_type: string;
  capacity: string | null;
  photos: string[] | null;
}

export interface DistributorStaff {
  id: string;
  distributor_id: string;
  name: string;
  role: string | null;
  phone: string | null;
  email: string | null;
}

// Hooks
export function useDistributorProducts(distributorId: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['distributor-products', distributorId],
    queryFn: async () => {
      if (!distributorId) return [];
      const { data, error } = await supabase
        .from('distributor_products')
        .select('*')
        .eq('distributor_id', distributorId);
      if (error) throw error;
      return data as DistributorProduct[];
    },
    enabled: !!user && !!distributorId,
  });
}

export function useDistributorPricingTiers(distributorId: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['distributor-pricing-tiers', distributorId],
    queryFn: async () => {
      if (!distributorId) return [];
      const { data, error } = await supabase
        .from('distributor_pricing_tiers')
        .select('*')
        .eq('distributor_id', distributorId)
        .order('min_qty');
      if (error) throw error;
      return data as DistributorPricingTier[];
    },
    enabled: !!user && !!distributorId,
  });
}

export function useDistributorSchemes(distributorId: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['distributor-schemes', distributorId],
    queryFn: async () => {
      if (!distributorId) return [];
      const { data, error } = await supabase
        .from('distributor_schemes')
        .select('*')
        .eq('distributor_id', distributorId);
      if (error) throw error;
      return data as DistributorScheme[];
    },
    enabled: !!user && !!distributorId,
  });
}

export function useDistributorKycDocuments(distributorId: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['distributor-kyc-documents', distributorId],
    queryFn: async () => {
      if (!distributorId) return [];
      const { data, error } = await supabase
        .from('distributor_kyc_documents')
        .select('*')
        .eq('distributor_id', distributorId);
      if (error) throw error;
      return data as DistributorKycDocument[];
    },
    enabled: !!user && !!distributorId,
  });
}

export function useDistributorSecondaryCounters(distributorId: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['distributor-secondary-counters', distributorId],
    queryFn: async () => {
      if (!distributorId) return [];
      const { data, error } = await supabase
        .from('distributor_secondary_counters')
        .select('*')
        .eq('distributor_id', distributorId);
      if (error) throw error;
      return data as DistributorSecondaryCounter[];
    },
    enabled: !!user && !!distributorId,
  });
}

export function useDistributorWarehouses(distributorId: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['distributor-warehouses', distributorId],
    queryFn: async () => {
      if (!distributorId) return [];
      const { data, error } = await supabase
        .from('distributor_warehouses')
        .select('*')
        .eq('distributor_id', distributorId);
      if (error) throw error;
      return data as DistributorWarehouse[];
    },
    enabled: !!user && !!distributorId,
  });
}

export function useDistributorPreorders(distributorId: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['distributor-preorders', distributorId],
    queryFn: async () => {
      if (!distributorId) return [];
      const { data, error } = await supabase
        .from('distributor_preorders')
        .select('*')
        .eq('distributor_id', distributorId);
      if (error) throw error;
      return data as DistributorPreorder[];
    },
    enabled: !!user && !!distributorId,
  });
}

export function useDistributorVehicles(distributorId: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['distributor-vehicles', distributorId],
    queryFn: async () => {
      if (!distributorId) return [];
      const { data, error } = await supabase
        .from('distributor_vehicles')
        .select('*')
        .eq('distributor_id', distributorId);
      if (error) throw error;
      return data as DistributorVehicle[];
    },
    enabled: !!user && !!distributorId,
  });
}

export function useDistributorStaff(distributorId: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['distributor-staff', distributorId],
    queryFn: async () => {
      if (!distributorId) return [];
      const { data, error } = await supabase
        .from('distributor_staff')
        .select('*')
        .eq('distributor_id', distributorId);
      if (error) throw error;
      return data as DistributorStaff[];
    },
    enabled: !!user && !!distributorId,
  });
}

// File upload helper
export async function uploadDistributorFile(file: File, distributorId: string, folder: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${distributorId}/${folder}/${Date.now()}.${fileExt}`;
  
  const { error } = await supabase.storage
    .from('distributor-files')
    .upload(fileName, file);
    
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('distributor-files')
    .getPublicUrl(fileName);
    
  return publicUrl;
}

// Save all distributor extended data
export function useSaveDistributorExtendedData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      distributorId,
      products,
      pricingTiers,
      schemes,
      kycDocuments,
      secondaryCounters,
      warehouses,
      preorders,
      vehicles,
      staff,
    }: {
      distributorId: string;
      products: { product_id: string; margin_percent: number }[];
      pricingTiers: { min_qty: number; max_qty: number; margin_percent: number }[];
      schemes: string[];
      kycDocuments: { document_type: string; document_number: string; file_url?: string }[];
      secondaryCounters: { name: string; contact_person?: string; address?: string; phone?: string }[];
      warehouses?: { name: string; address?: string; contact_person?: string; phone?: string; photos?: string[] }[];
      preorders?: { product_id: string; quantity: number; expected_delivery?: string; preorder_value?: number }[];
      vehicles?: { vehicle_number: string; vehicle_type: string; capacity?: string; photos?: string[] }[];
      staff?: { name: string; role?: string; phone?: string; email?: string }[];
    }) => {
      // Delete existing data in parallel
      const deletePromises = [
        supabase.from('distributor_products').delete().eq('distributor_id', distributorId),
        supabase.from('distributor_pricing_tiers').delete().eq('distributor_id', distributorId),
        supabase.from('distributor_schemes').delete().eq('distributor_id', distributorId),
        supabase.from('distributor_kyc_documents').delete().eq('distributor_id', distributorId),
        supabase.from('distributor_secondary_counters').delete().eq('distributor_id', distributorId),
        supabase.from('distributor_warehouses').delete().eq('distributor_id', distributorId),
        supabase.from('distributor_preorders').delete().eq('distributor_id', distributorId),
        supabase.from('distributor_vehicles').delete().eq('distributor_id', distributorId),
        supabase.from('distributor_staff').delete().eq('distributor_id', distributorId),
      ];
      
      await Promise.all(deletePromises);

      // Insert new data
      const insertPromises = [];

      if (products.length > 0) {
        insertPromises.push(
          supabase.from('distributor_products').insert(
            products.map(p => ({ distributor_id: distributorId, ...p }))
          )
        );
      }

      if (pricingTiers.length > 0) {
        insertPromises.push(
          supabase.from('distributor_pricing_tiers').insert(
            pricingTiers.map(t => ({ distributor_id: distributorId, ...t }))
          )
        );
      }

      if (schemes.length > 0) {
        insertPromises.push(
          supabase.from('distributor_schemes').insert(
            schemes.map(s => ({ distributor_id: distributorId, scheme_id: s }))
          )
        );
      }

      if (kycDocuments.length > 0) {
        insertPromises.push(
          supabase.from('distributor_kyc_documents').insert(
            kycDocuments.map(d => ({ distributor_id: distributorId, ...d }))
          )
        );
      }

      if (secondaryCounters.length > 0) {
        insertPromises.push(
          supabase.from('distributor_secondary_counters').insert(
            secondaryCounters.map(c => ({ distributor_id: distributorId, ...c }))
          )
        );
      }

      if (warehouses && warehouses.length > 0) {
        insertPromises.push(
          supabase.from('distributor_warehouses').insert(
            warehouses.map(w => ({ distributor_id: distributorId, ...w }))
          )
        );
      }

      if (preorders && preorders.length > 0) {
        insertPromises.push(
          supabase.from('distributor_preorders').insert(
            preorders.map(p => ({ distributor_id: distributorId, ...p }))
          )
        );
      }

      if (vehicles && vehicles.length > 0) {
        insertPromises.push(
          supabase.from('distributor_vehicles').insert(
            vehicles.map(v => ({ distributor_id: distributorId, ...v }))
          )
        );
      }

      if (staff && staff.length > 0) {
        insertPromises.push(
          supabase.from('distributor_staff').insert(
            staff.map(s => ({ distributor_id: distributorId, ...s }))
          )
        );
      }

      await Promise.all(insertPromises);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['distributor-products', variables.distributorId] });
      queryClient.invalidateQueries({ queryKey: ['distributor-pricing-tiers', variables.distributorId] });
      queryClient.invalidateQueries({ queryKey: ['distributor-schemes', variables.distributorId] });
      queryClient.invalidateQueries({ queryKey: ['distributor-kyc-documents', variables.distributorId] });
      queryClient.invalidateQueries({ queryKey: ['distributor-secondary-counters', variables.distributorId] });
      queryClient.invalidateQueries({ queryKey: ['distributor-warehouses', variables.distributorId] });
      queryClient.invalidateQueries({ queryKey: ['distributor-preorders', variables.distributorId] });
      queryClient.invalidateQueries({ queryKey: ['distributor-vehicles', variables.distributorId] });
      queryClient.invalidateQueries({ queryKey: ['distributor-staff', variables.distributorId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save extended data');
    },
  });
}