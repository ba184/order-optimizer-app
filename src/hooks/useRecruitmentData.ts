import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Job Openings
export function useJobOpenings() {
  return useQuery({
    queryKey: ['job-openings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_openings' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateJobOpening() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (job: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('job_openings' as any)
        .insert({ ...job, posted_by: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['job-openings'] });
      toast.success('Job opening created');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}

export function useUpdateJobOpening() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { error } = await supabase.from('job_openings' as any).update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['job-openings'] });
      toast.success('Job opening updated');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}

// Candidates
export function useCandidates(jobId?: string) {
  return useQuery({
    queryKey: ['candidates', jobId],
    queryFn: async () => {
      let query = supabase
        .from('candidates' as any)
        .select('*, job:job_openings(title)')
        .order('created_at', { ascending: false });
      if (jobId) query = query.eq('job_opening_id', jobId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (candidate: any) => {
      const { data, error } = await supabase
        .from('candidates' as any)
        .insert(candidate)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidate added');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}

export function useUpdateCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { error } = await supabase.from('candidates' as any).update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidate updated');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}

// Interviews
export function useInterviews(candidateId?: string) {
  return useQuery({
    queryKey: ['interviews', candidateId],
    queryFn: async () => {
      let query = supabase
        .from('interviews' as any)
        .select('*, candidate:candidates(name, email), interviewer:profiles!interviews_interviewer_id_fkey(name)')
        .order('scheduled_at', { ascending: false });
      if (candidateId) query = query.eq('candidate_id', candidateId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (interview: any) => {
      const { data, error } = await supabase
        .from('interviews' as any)
        .insert(interview)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['interviews'] });
      toast.success('Interview scheduled');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}

export function useUpdateInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { error } = await supabase.from('interviews' as any).update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['interviews'] });
      toast.success('Interview updated');
    },
    onError: (e: any) => toast.error('Failed: ' + e.message),
  });
}
