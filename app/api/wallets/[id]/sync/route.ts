import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ZerionExtension } from '@/lib/extensions/crypto/zerion';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { SyncService } from '@/lib/services/sync-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { 
      syncType = 'full_sync',
      options = {},
      priority = 0 
    } = await request.json();

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, tier')
      .eq('user_id', session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Validate wallet ownership
    const { data: wallet } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('id', id)
      .eq('user_id', profile.id)
      .single();

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    // Check rate limits based on tier
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const { count: recentSyncs } = await supabase
      .from('wallet_sync_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('wallet_id', id)
      .gte('created_at', oneHourAgo.toISOString());

    const syncLimits = {
      free: 10,
      pro: 60,
      enterprise: 300
    };

    if ((recentSyncs || 0) >= syncLimits[profile.tier as keyof typeof syncLimits]) {
      return NextResponse.json({ 
        error: `Sync rate limit exceeded for ${profile.tier} tier. Please wait before syncing again.` 
      }, { status: 429 });
    }

    // Queue sync job
    const syncService = SyncService.getInstance();
    const syncJobId = await syncService.queueSync({
      walletId: id,
      type: syncType,
      priority,
      options: {
        includeTransactions: options.includeTransactions ?? true,
        includeNFTs: options.includeNFTs ?? true,
        includeChart: options.includeChart ?? true,
        chartPeriod: options.chartPeriod || 'day',
        forceRefresh: options.forceRefresh ?? false
      }
    });

    // Update wallet sync status
    await supabase
      .from('user_wallets')
      .update({ sync_status: 'syncing' })
      .eq('id', id);

    return NextResponse.json({ 
      syncJobId,
      status: 'queued',
      estimatedCompletionTime: new Date(Date.now() + 30000).toISOString() // 30 seconds estimate
    });

  } catch (error: any) {
    ErrorHandler.handle(error, `POST /api/wallets/${params.id}/sync`);
    return NextResponse.json(
      { error: ErrorHandler.createUserFriendlyMessage(error) }, 
      { status: 500 }
    );
  }
}
