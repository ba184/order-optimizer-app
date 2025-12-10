import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const email = 'admin@toagosei.com';
    const password = 'admin123';
    const name = 'Admin User';

    console.log('Creating test admin user...');

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    let userId: string;

    if (existingUser) {
      console.log('User already exists, using existing user');
      userId = existingUser.id;
    } else {
      // Create user with admin API
      const { data: userData, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name }
      });

      if (createError) {
        console.error('Error creating user:', createError);
        throw createError;
      }

      userId = userData.user!.id;
      console.log('User created with ID:', userId);
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (!existingProfile) {
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          name,
          email,
          status: 'active'
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Profile might already exist from trigger, that's okay
      } else {
        console.log('Profile created');
      }
    }

    // Get admin role
    const { data: adminRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('code', 'admin')
      .single();

    if (roleError || !adminRole) {
      console.error('Admin role not found, creating it...');
      
      const { data: newRole, error: insertRoleError } = await supabase
        .from('roles')
        .insert({
          code: 'admin',
          name: 'Administrator',
          level: 1,
          is_system: true,
          description: 'Full system access'
        })
        .select('id')
        .single();

      if (insertRoleError) {
        console.error('Error creating admin role:', insertRoleError);
        throw insertRoleError;
      }
      
      // Assign role
      const { error: assignError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role_id: newRole.id
        }, { onConflict: 'user_id,role_id' });

      if (assignError) {
        console.error('Error assigning role:', assignError);
      }
    } else {
      // Assign existing admin role
      const { error: assignError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role_id: adminRole.id
        }, { onConflict: 'user_id,role_id' });

      if (assignError) {
        console.error('Error assigning role:', assignError);
      }
    }

    console.log('Test admin user setup complete!');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Test admin user created successfully',
        credentials: {
          email,
          password
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});