import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Presentation {
  id: string;
  title: string;
  product_id: string | null;
  type: 'ppt' | 'pdf' | 'video';
  description: string | null;
  duration: number;
  file_url: string | null;
  has_quiz: boolean;
  quiz_questions: any[];
  view_count: number;
  completion_rate: number;
  status: 'active' | 'inactive';
  created_by: string | null;
  created_at: string;
  updated_at: string;
  product?: { id: string; name: string };
}

export function usePresentations() {
  return useQuery({
    queryKey: ['presentations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('presentations' as any)
        .select('*, product:products(id, name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Presentation[];
    },
  });
}

export function useCreatePresentation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (presentation: {
      title: string;
      product_id?: string;
      type: string;
      description?: string;
      duration: number;
      file_url?: string;
      has_quiz?: boolean;
      quiz_questions?: any[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('presentations' as any)
        .insert({ ...presentation, created_by: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Presentation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presentations'] });
      toast.success('Presentation created successfully');
    },
    onError: (error: Error) => toast.error(`Failed to create presentation: ${error.message}`),
  });
}

export function useUpdatePresentation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Presentation> & { id: string }) => {
      const { data, error } = await supabase
        .from('presentations' as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Presentation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presentations'] });
      toast.success('Presentation updated successfully');
    },
    onError: (error: Error) => toast.error(`Failed to update presentation: ${error.message}`),
  });
}

export function useDeletePresentation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('presentations' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presentations'] });
      toast.success('Presentation deleted successfully');
    },
    onError: (error: Error) => toast.error(`Failed to delete presentation: ${error.message}`),
  });
}

// Increment view count
export function useIncrementViewCount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: current } = await supabase
        .from('presentations' as any)
        .select('view_count')
        .eq('id', id)
        .single();
      
      const { error } = await supabase
        .from('presentations' as any)
        .update({ view_count: ((current as any)?.view_count || 0) + 1 })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presentations'] });
    },
  });
}
