import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ZerionExtension, WalletService } from '@/lib/extensions/crypto/zerion';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { SyncService } from '@/lib/services/sync-service';
import { AnalyticsService } from '@/lib/services/analytics-service';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') as '1d' | '7d' | '30d' | '90d' | '1y' || '30d';

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Validate wallet ownership
    const { data: wallet } = await supabase
      .from('user_wallets')
      .select('id')
      .eq('id', id)
      .eq('user_id', profile.id)
      .single();

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    // Calculate analytics
    const analytics = await AnalyticsService.calculatePortfolioMetrics(id, timeframe);

    // Get recent performance data
    const { data: snapshots } = await supabase
      .from('portfolio_snapshots')
      .select('total_value, day_change_percent, snapshot_date')
      .eq('wallet_id', id)
      .order('snapshot_date', { ascending: false })
      .limit(30);

    // Get position breakdown
    const { data: latestData } = await supabase
      .from('user_wallets')
      .select('last_sync_data')
      .eq('id', id)
      .single();

    return NextResponse.json({ 
      data: {
        metrics: analytics,
        history: snapshots || [],
        positions: latestData?.last_sync_data?.positions || [],
        lastUpdated: latestData?.last_sync_data?.metadata?.lastSyncAt
      }
    });

  } catch (error: any) {
    ErrorHandler.handle(error, `GET /api/wallets/${params.id}/analytics`);
    return NextResponse.json(
      { error: ErrorHandler.createUserFriendlyMessage(error) }, 
      { status: 500 }
    );
  }
}