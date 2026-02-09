import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DbRole {
  id: string;
  name: string;
  code: string;
  level: number;
  description: string | null;
  is_system: boolean;
  status: string;
  geo_level: string | null;
  zone_type: string | null;
  created_at: string;
  user_count: number;
}

export interface DbPermission {
  id: string;
  role_id: string;
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_approve: boolean;
}

export function useRolesPermissionsData() {
  const queryClient = useQueryClient();

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['db-roles'],
    queryFn: async () => {
      const { data: rolesData, error } = await supabase
        .from('roles')
        .select('*')
        .order('level', { ascending: true });
      if (error) throw error;

      // Get user counts per role
      const { data: userRoles, error: urError } = await supabase
        .from('user_roles')
        .select('role_id');
      if (urError) throw urError;

      const countMap = new Map<string, number>();
      userRoles?.forEach((ur: any) => {
        countMap.set(ur.role_id, (countMap.get(ur.role_id) || 0) + 1);
      });

      return (rolesData || []).map((r: any) => ({
        ...r,
        user_count: countMap.get(r.id) || 0,
      })) as DbRole[];
    },
  });

  const { data: allPermissions = [], isLoading: permsLoading } = useQuery({
    queryKey: ['db-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*');
      if (error) throw error;
      return (data || []) as DbPermission[];
    },
  });

  const createRole = useMutation({
    mutationFn: async (payload: {
      name: string;
      code: string;
      level: number;
      description?: string;
      geo_level: string;
      zone_type?: string;
      status: string;
      permissions: { module: string; can_view: boolean; can_create: boolean; can_edit: boolean; can_delete: boolean; can_approve: boolean }[];
    }) => {
      const { permissions, ...roleData } = payload;
      const { data: role, error } = await supabase
        .from('roles')
        .insert({ ...roleData, is_system: false })
        .select()
        .single();
      if (error) throw error;

      if (permissions.length > 0) {
        const permRows = permissions.map(p => ({ role_id: role.id, ...p }));
        const { error: permError } = await supabase.from('permissions').insert(permRows);
        if (permError) throw permError;
      }
      return role;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['db-roles'] });
      queryClient.invalidateQueries({ queryKey: ['db-permissions'] });
      toast.success('Role created successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateRole = useMutation({
    mutationFn: async (payload: {
      id: string;
      name: string;
      code: string;
      level: number;
      description?: string;
      geo_level: string;
      zone_type?: string | null;
      status: string;
      permissions: { module: string; can_view: boolean; can_create: boolean; can_edit: boolean; can_delete: boolean; can_approve: boolean }[];
    }) => {
      const { id, permissions, ...roleData } = payload;
      const { error } = await supabase.from('roles').update(roleData).eq('id', id);
      if (error) throw error;

      // Delete old permissions and re-insert
      const { error: delError } = await supabase.from('permissions').delete().eq('role_id', id);
      if (delError) throw delError;

      if (permissions.length > 0) {
        const permRows = permissions.map(p => ({ role_id: id, ...p }));
        const { error: permError } = await supabase.from('permissions').insert(permRows);
        if (permError) throw permError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['db-roles'] });
      queryClient.invalidateQueries({ queryKey: ['db-permissions'] });
      toast.success('Role updated successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteRole = useMutation({
    mutationFn: async (id: string) => {
      // Delete permissions first
      const { error: permError } = await supabase.from('permissions').delete().eq('role_id', id);
      if (permError) throw permError;
      const { error } = await supabase.from('roles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['db-roles'] });
      queryClient.invalidateQueries({ queryKey: ['db-permissions'] });
      toast.success('Role deleted successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const getPermissionsForRole = (roleId: string) => {
    return allPermissions.filter(p => p.role_id === roleId);
  };

  return {
    roles,
    allPermissions,
    isLoading: rolesLoading || permsLoading,
    createRole,
    updateRole,
    deleteRole,
    getPermissionsForRole,
  };
}
