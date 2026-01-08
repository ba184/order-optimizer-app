import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // ====== AUTHENTICATION CHECK ======
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's token to verify authentication
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the JWT token and get claims
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error('Invalid token:', claimsError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const callerId = claimsData.claims.sub;
    console.log('Authenticated user:', callerId);

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // ====== AUTHORIZATION CHECK - Verify caller is admin ======
    const { data: callerRoles, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role_id, roles!inner(code)')
      .eq('user_id', callerId);

    if (roleError) {
      console.error('Failed to get caller role:', roleError.message);
      return new Response(
        JSON.stringify({ error: 'Failed to verify user permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if any of the user's roles is 'admin'
    const isAdmin = callerRoles?.some((ur: { roles: { code: string } | { code: string }[] }) => {
      const roles = ur.roles;
      if (Array.isArray(roles)) {
        return roles.some(r => r.code === 'admin');
      }
      return roles?.code === 'admin';
    });

    if (!isAdmin) {
      console.error('Unauthorized: User is not admin');
      return new Response(
        JSON.stringify({ error: 'Admin access required for this operation' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Admin access verified for user:', callerId);

    const { action, ...data } = await req.json();
    console.log('Action:', action, 'Data:', JSON.stringify({ ...data, password: data.password ? '[REDACTED]' : undefined }));

    if (action === 'create') {
      const { email, password, name, phone, territory, region, reporting_to, role_code } = data;

      if (!email || !password || !name) {
        return new Response(
          JSON.stringify({ error: 'Email, password, and name are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return new Response(
          JSON.stringify({ error: 'Invalid email format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Password strength validation
      if (password.length < 8) {
        return new Response(
          JSON.stringify({ error: 'Password must be at least 8 characters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === email);
      
      if (existingUser) {
        return new Response(
          JSON.stringify({ error: 'User with this email already exists' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create user in auth.users
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto confirm email
        user_metadata: { name },
      });

      if (authError) {
        console.error('Auth error:', authError);
        return new Response(
          JSON.stringify({ error: authError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const userId = authData.user.id;
      console.log('Created user:', userId, 'by admin:', callerId);

      // Update profile with additional details
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          name,
          phone: phone || null,
          territory: territory || null,
          region: region || null,
          reporting_to: reporting_to || null,
          status: 'active',
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Profile error:', profileError);
      }

      // Assign role if provided
      if (role_code) {
        const { data: roleData, error: roleError } = await supabaseAdmin
          .from('roles')
          .select('id')
          .eq('code', role_code)
          .single();

        if (roleData && !roleError) {
          const { error: userRoleError } = await supabaseAdmin
            .from('user_roles')
            .insert({ user_id: userId, role_id: roleData.id });

          if (userRoleError) {
            console.error('User role error:', userRoleError);
          }
        }
      }

      return new Response(
        JSON.stringify({ success: true, user_id: userId, message: 'User created successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'delete') {
      const { user_id } = data;

      if (!user_id) {
        return new Response(
          JSON.stringify({ error: 'User ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Prevent self-deletion
      if (user_id === callerId) {
        return new Response(
          JSON.stringify({ error: 'Cannot delete your own account' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Delete user from auth.users (this will cascade to profiles due to trigger)
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user_id);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        return new Response(
          JSON.stringify({ error: deleteError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('User deleted:', user_id, 'by admin:', callerId);

      return new Response(
        JSON.stringify({ success: true, message: 'User deleted successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'reset-password') {
      const { user_id, new_password } = data;

      if (!user_id || !new_password) {
        return new Response(
          JSON.stringify({ error: 'User ID and new password are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Password strength validation
      if (new_password.length < 8) {
        return new Response(
          JSON.stringify({ error: 'Password must be at least 8 characters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user_id,
        { password: new_password }
      );

      if (updateError) {
        console.error('Password reset error:', updateError);
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Password reset for user:', user_id, 'by admin:', callerId);

      return new Response(
        JSON.stringify({ success: true, message: 'Password reset successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Server error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
