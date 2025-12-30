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
  zone: string | null;
  city: string | null;
  reporting_to: string | null;
  reporting_to_name?: string;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  role_code: string | null;
  role_name: string | null;
  role_level: number | null;
  employee_id: string | null;
  avatar_url: string | null;
  designation_code: string | null;
  last_login_at: string | null;
}

export interface RoleWithCount {
  id: string;
  name: string;
  code: string;
  level: number;
  description: string | null;
  is_system: boolean | null;
  status: string | null;
  created_at: string | null;
  user_count: number;
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
            name,
            level
          )
        `);

      if (rolesError) throw rolesError;

      // Create a map of user_id to role
      const roleMap = new Map();
      userRoles?.forEach((ur: any) => {
        roleMap.set(ur.user_id, {
          code: ur.roles?.code,
          name: ur.roles?.name,
          level: ur.roles?.level
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
          zone: profile.zone,
          city: profile.city,
          reporting_to: profile.reporting_to,
          reporting_to_name: profile.reporting_to ? profileMap.get(profile.reporting_to) : null,
          status: profile.status,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          role_code: role?.code || null,
          role_name: role?.name || null,
          role_level: role?.level || null,
          employee_id: profile.employee_id,
          avatar_url: profile.avatar_url,
          designation_code: profile.designation_code,
          last_login_at: profile.last_login_at,
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
      zone?: string;
      city?: string;
      reporting_to?: string;
      role_code?: string;
      employee_id?: string;
      designation_code?: string;
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
      zone: string;
      city: string;
      reporting_to: string;
      status: string;
      employee_id: string;
      designation_code: string;
      avatar_url: string;
    }>) => {
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
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
        .maybeSingle();

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

export function useRolesWithCount() {
  return useQuery({
    queryKey: ['roles-with-count'],
    queryFn: async () => {
      // Get all roles
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .order('level', { ascending: true });

      if (rolesError) throw rolesError;

      // Get user count per role
      const { data: userRoles, error: countError } = await supabase
        .from('user_roles')
        .select('role_id');

      if (countError) throw countError;

      // Count users per role
      const roleCountMap = new Map<string, number>();
      userRoles?.forEach((ur: any) => {
        const current = roleCountMap.get(ur.role_id) || 0;
        roleCountMap.set(ur.role_id, current + 1);
      });

      const rolesWithCount: RoleWithCount[] = (roles || []).map((role: any) => ({
        ...role,
        user_count: roleCountMap.get(role.id) || 0,
      }));

      return rolesWithCount;
    },
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleData: {
      name: string;
      code: string;
      level: number;
      description?: string;
      status?: string;
    }) => {
      const { data, error } = await supabase
        .from('roles')
        .insert(roleData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles-with-count'] });
      toast.success('Role created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<{
      name: string;
      code: string;
      level: number;
      description: string;
      status: string;
    }>) => {
      const { error } = await supabase
        .from('roles')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles-with-count'] });
      toast.success('Role updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles-with-count'] });
      toast.success('Role deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function usePermissions(roleId: string | null) {
  return useQuery({
    queryKey: ['permissions', roleId],
    queryFn: async () => {
      if (!roleId) return [];
      
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .eq('role_id', roleId);

      if (error) throw error;
      return data;
    },
    enabled: !!roleId,
  });
}

export function useUpdatePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, permissions }: { 
      roleId: string; 
      permissions: Array<{
        module: string;
        can_view: boolean;
        can_create: boolean;
        can_edit: boolean;
        can_delete: boolean;
        can_approve: boolean;
      }>;
    }) => {
      // Delete existing permissions
      await supabase
        .from('permissions')
        .delete()
        .eq('role_id', roleId);

      // Insert new permissions
      const permissionsToInsert = permissions.map(p => ({
        ...p,
        role_id: roleId,
      }));

      const { error } = await supabase
        .from('permissions')
        .insert(permissionsToInsert);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('Permissions updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
