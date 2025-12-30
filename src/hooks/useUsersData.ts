import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserWithRole {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  territory: string | null;
  region: string | null;
  reporting_to: string | null;
  reporting_to_name?: string;
  status: string | null;
  created_at: string | null;
  role_code: string | null;
  role_name: string | null;
}

export function useUsersData() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get user roles with role details
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role_id,
          roles (
            code,
            name
          )
        `);

      if (rolesError) throw rolesError;

      // Create a map of user_id to role
      const roleMap = new Map();
      userRoles?.forEach((ur: any) => {
        roleMap.set(ur.user_id, {
          code: ur.roles?.code,
          name: ur.roles?.name
        });
      });

      // Create a map of profile id to name for reporting_to lookups
      const profileMap = new Map();
      profiles?.forEach((p: any) => {
        profileMap.set(p.id, p.name);
      });

      // Combine profiles with roles
      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile: any) => {
        const role = roleMap.get(profile.id);
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          territory: profile.territory,
          region: profile.region,
          reporting_to: profile.reporting_to,
          reporting_to_name: profile.reporting_to ? profileMap.get(profile.reporting_to) : null,
          status: profile.status,
          created_at: profile.created_at,
          role_code: role?.code || null,
          role_name: role?.name || null,
        };
      });

      return usersWithRoles;
    },
  });

  const createUser = useMutation({
    mutationFn: async (userData: {
      name: string;
      email: string;
      password: string;
      phone?: string;
      territory?: string;
      region?: string;
      reporting_to?: string;
      role_code?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          action: 'create',
          ...userData,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success('User created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<{
      name: string;
      email: string;
      phone: string;
      territory: string;
      region: string;
      reporting_to: string;
      status: string;
    }>) => {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success('User updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateUserRole = useMutation({
    mutationFn: async ({ userId, roleCode }: { userId: string; roleCode: string }) => {
      // Get the role id from the code
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('code', roleCode)
        .single();

      if (roleError) throw roleError;

      // Check if user already has a role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role_id: role.id })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role_id: role.id });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success('User role updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          action: 'delete',
          user_id: id,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success('User deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetPassword = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          action: 'reset-password',
          user_id: userId,
          new_password: newPassword,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      toast.success('Password reset successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    users,
    isLoading,
    error,
    createUser,
    updateUser,
    updateUserRole,
    deleteUser,
    resetPassword,
  };
}

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('status', 'active')
        .order('level', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}
