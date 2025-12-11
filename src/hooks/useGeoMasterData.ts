import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types
export interface Country {
  id: string;
  name: string;
  code: string;
  currency: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface State {
  id: string;
  name: string;
  code: string;
  country_id: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  country?: Country;
}

export interface City {
  id: string;
  name: string;
  code: string;
  state_id: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  state?: State;
}

export interface Zone {
  id: string;
  name: string;
  code: string;
  country_id: string;
  manager_id: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  country?: Country;
  manager?: { id: string; name: string };
  states?: State[];
}

// Countries hooks
export function useCountries() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries' as any)
        .select('*')
        .order('name');
      if (error) throw error;
      return (data || []) as unknown as Country[];
    },
  });
}

export function useCreateCountry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (country: { name: string; code: string; currency: string; status?: string }) => {
      const { data, error } = await supabase
        .from('countries' as any)
        .insert(country)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Country;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      toast.success('Country created successfully');
    },
    onError: (error: Error) => toast.error(`Failed to create country: ${error.message}`),
  });
}

export function useUpdateCountry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Country> & { id: string }) => {
      const { data, error } = await supabase
        .from('countries' as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Country;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      toast.success('Country updated successfully');
    },
    onError: (error: Error) => toast.error(`Failed to update country: ${error.message}`),
  });
}

export function useDeleteCountry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('countries' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      toast.success('Country deleted successfully');
    },
    onError: (error: Error) => toast.error(`Failed to delete country: ${error.message}`),
  });
}

// States hooks
export function useStates(countryId?: string) {
  return useQuery({
    queryKey: ['states', countryId],
    queryFn: async () => {
      let query = supabase.from('states' as any).select('*, country:countries(*)').order('name');
      if (countryId) query = query.eq('country_id', countryId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as State[];
    },
  });
}

export function useCreateState() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (state: { name: string; code: string; country_id: string; status?: string }) => {
      const { data, error } = await supabase.from('states' as any).insert(state).select().single();
      if (error) throw error;
      return data as unknown as State;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['states'] });
      toast.success('State created successfully');
    },
    onError: (error: Error) => toast.error(`Failed to create state: ${error.message}`),
  });
}

export function useUpdateState() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<State> & { id: string }) => {
      const { data, error } = await supabase.from('states' as any).update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data as unknown as State;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['states'] });
      toast.success('State updated successfully');
    },
    onError: (error: Error) => toast.error(`Failed to update state: ${error.message}`),
  });
}

export function useDeleteState() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('states' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['states'] });
      toast.success('State deleted successfully');
    },
    onError: (error: Error) => toast.error(`Failed to delete state: ${error.message}`),
  });
}

// Cities hooks
export function useCities(stateId?: string) {
  return useQuery({
    queryKey: ['cities', stateId],
    queryFn: async () => {
      let query = supabase.from('cities' as any).select('*, state:states(*, country:countries(*))').order('name');
      if (stateId) query = query.eq('state_id', stateId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as City[];
    },
  });
}

export function useCreateCity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (city: { name: string; code: string; state_id: string; status?: string }) => {
      const { data, error } = await supabase.from('cities' as any).insert(city).select().single();
      if (error) throw error;
      return data as unknown as City;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      toast.success('City created successfully');
    },
    onError: (error: Error) => toast.error(`Failed to create city: ${error.message}`),
  });
}

export function useUpdateCity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<City> & { id: string }) => {
      const { data, error } = await supabase.from('cities' as any).update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data as unknown as City;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      toast.success('City updated successfully');
    },
    onError: (error: Error) => toast.error(`Failed to update city: ${error.message}`),
  });
}

export function useDeleteCity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cities' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      toast.success('City deleted successfully');
    },
    onError: (error: Error) => toast.error(`Failed to delete city: ${error.message}`),
  });
}

// Zones hooks
export function useZones(countryId?: string) {
  return useQuery({
    queryKey: ['zones', countryId],
    queryFn: async () => {
      let query = supabase.from('zones' as any).select('*, country:countries(*), manager:profiles(id, name)').order('name');
      if (countryId) query = query.eq('country_id', countryId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as Zone[];
    },
  });
}

export function useCreateZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (zone: { name: string; code: string; country_id: string; manager_id?: string; status?: string }) => {
      const { data, error } = await supabase.from('zones' as any).insert(zone).select().single();
      if (error) throw error;
      return data as unknown as Zone;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      toast.success('Zone created successfully');
    },
    onError: (error: Error) => toast.error(`Failed to create zone: ${error.message}`),
  });
}

export function useUpdateZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Zone> & { id: string }) => {
      const { data, error } = await supabase.from('zones' as any).update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data as unknown as Zone;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      toast.success('Zone updated successfully');
    },
    onError: (error: Error) => toast.error(`Failed to update zone: ${error.message}`),
  });
}

export function useDeleteZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('zones' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      toast.success('Zone deleted successfully');
    },
    onError: (error: Error) => toast.error(`Failed to delete zone: ${error.message}`),
  });
}
