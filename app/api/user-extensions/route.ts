import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get user extensions with extension details
    const { data: userExtensions, error } = await supabase
      .from('user_extensions')
      .select(`
        *,
        extensions (
          id,
          name,
          slug,
          description,
          category,
          provider,
          logo_url,
          supported_data_types,
          tier_restrictions,
          is_active,
          is_featured
        )
      `)
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: userExtensions });
  } catch (error) {
    console.error('Error fetching user extensions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { extensionId, connectionName, credentials, configuration = {} } = await request.json();

    if (!extensionId || !connectionName || !credentials) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, tier')
      .eq('user_id', session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get extension details and check tier restrictions
    const { data: extension } = await supabase
      .from('extensions')
      .select('*')
      .eq('id', extensionId)
      .single();

    if (!extension) {
      return NextResponse.json({ error: 'Extension not found' }, { status: 404 });
    }

    // Check tier restrictions
    const tierRestrictions = extension.tier_restrictions as Record<string, boolean>;
    if (tierRestrictions[profile.tier] !== true) {
      return NextResponse.json({ 
        error: 'Upgrade required',
        message: `This extension requires ${Object.keys(tierRestrictions).find(tier => tierRestrictions[tier] === true)} tier or higher`
      }, { status: 403 });
    }

    // Check if connection already exists
    const { data: existingConnection } = await supabase
      .from('user_extensions')
      .select('id')
      .eq('user_id', profile.id)
      .eq('extension_id', extensionId)
      .eq('connection_name', connectionName)
      .single();

    if (existingConnection) {
      return NextResponse.json({ 
        error: 'Connection already exists',
        message: 'A connection with this name already exists for this extension'
      }, { status: 409 });
    }

    // Create user extension connection
    const { data: userExtension, error } = await supabase
      .from('user_extensions')
      .insert({
        user_id: profile.id,
        extension_id: extensionId,
        connection_name: connectionName,
        credentials: credentials, // Should be encrypted in production
        configuration,
        is_enabled: true,
        sync_status: 'pending'
      })
      .select(`
        *,
        extensions (
          id,
          name,
          slug,
          description,
          category,
          provider,
          logo_url,
          supported_data_types,
          tier_restrictions,
          is_active,
          is_featured
        )
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // TODO: Trigger initial sync job here
    // await triggerSyncJob(userExtension.id);

    return NextResponse.json({ data: userExtension });
  } catch (error) {
    console.error('Error creating user extension:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}