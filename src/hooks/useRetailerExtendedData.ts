import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Types
export interface RetailerCompetitorAnalysis {
  id: string;
  retailer_id: string;
  competitor_name: string;
  products: string | null;
  pricing: string | null;
  display_quality: string | null;
  remarks: string | null;
}

export interface RetailerScheme {
  id: string;
  retailer_id: string;
  scheme_id: string;
}

export interface RetailerImage {
  id: string;
  retailer_id: string;
  image_type: string;
  image_url: string;
}

// Hooks
export function useRetailerCompetitorAnalysis(retailerId: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['retailer-competitor-analysis', retailerId],
    queryFn: async () => {
      if (!retailerId) return [];
      const { data, error } = await supabase
        .from('retailer_competitor_analysis')
        .select('*')
        .eq('retailer_id', retailerId);
      if (error) throw error;
      return data as RetailerCompetitorAnalysis[];
    },
    enabled: !!user && !!retailerId,
  });
}

export function useRetailerSchemes(retailerId: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['retailer-schemes', retailerId],
    queryFn: async () => {
      if (!retailerId) return [];
      const { data, error } = await supabase
        .from('retailer_schemes')
        .select('*')
        .eq('retailer_id', retailerId);
      if (error) throw error;
      return data as RetailerScheme[];
    },
    enabled: !!user && !!retailerId,
  });
}

export function useRetailerImages(retailerId: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['retailer-images', retailerId],
    queryFn: async () => {
      if (!retailerId) return [];
      const { data, error } = await supabase
        .from('retailer_images')
        .select('*')
        .eq('retailer_id', retailerId);
      if (error) throw error;
      return data as RetailerImage[];
    },
    enabled: !!user && !!retailerId,
  });
}

// Save all retailer extended data
export function useSaveRetailerExtendedData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      retailerId,
      competitorAnalysis,
      schemes,
      images,
    }: {
      retailerId: string;
      competitorAnalysis: { competitor_name: string; products?: string; pricing?: string; display_quality?: string; remarks?: string }[];
      schemes: string[];
      images: { image_type: string; image_url: string }[];
    }) => {
      // Delete existing data
      await Promise.all([
        supabase.from('retailer_competitor_analysis').delete().eq('retailer_id', retailerId),
        supabase.from('retailer_schemes').delete().eq('retailer_id', retailerId),
        supabase.from('retailer_images').delete().eq('retailer_id', retailerId),
      ]);

      // Insert new data
      const insertPromises = [];

      if (competitorAnalysis.length > 0) {
        insertPromises.push(
          supabase.from('retailer_competitor_analysis').insert(
            competitorAnalysis.map(c => ({ retailer_id: retailerId, ...c }))
          )
        );
      }

      if (schemes.length > 0) {
        insertPromises.push(
          supabase.from('retailer_schemes').insert(
            schemes.map(s => ({ retailer_id: retailerId, scheme_id: s }))
          )
        );
      }

      if (images.length > 0) {
        insertPromises.push(
          supabase.from('retailer_images').insert(
            images.map(i => ({ retailer_id: retailerId, ...i }))
          )
        );
      }

      await Promise.all(insertPromises);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['retailer-competitor-analysis', variables.retailerId] });
      queryClient.invalidateQueries({ queryKey: ['retailer-schemes', variables.retailerId] });
      queryClient.invalidateQueries({ queryKey: ['retailer-images', variables.retailerId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save extended data');
    },
  });
}
