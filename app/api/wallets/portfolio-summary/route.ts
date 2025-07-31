import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ErrorHandler } from '@/lib/utils/error-handler';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
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

    // Get portfolio summary using the view
    const { data: summary, error } = await supabase
      .from('wallet_analytics')
      .select('*')
      .eq('user_id', profile.id);

    if (error) throw error;

    // Calculate aggregated metrics
    const totalValue = summary?.reduce((sum, wallet) => sum + (Number(wallet.total_value) || 0), 0) || 0;
    const totalChange = summary?.reduce((sum, wallet) => sum + (Number(wallet.day_change) || 0), 0) || 0;
    const totalPositions = summary?.reduce((sum, wallet) => sum + (wallet.positions_count || 0), 0) || 0;
    const uniqueChains = new Set(summary?.map(wallet => wallet.chain_type)).size;

    const totalChangePercent = totalValue > 0 && totalChange !== 0
      ? (totalChange / (totalValue - totalChange)) * 100
      : 0;

    // Get top performing wallets
    const topWallets = summary
      ?.sort((a, b) => (Number(b.total_value) || 0) - (Number(a.total_value) || 0))
      .slice(0, 5)
      .map(wallet => ({
        id: wallet.id,
        name: wallet.name,
        address: wallet.address,
        value: Number(wallet.total_value) || 0,
        change: Number(wallet.day_change_percent) || 0,
        performanceRating: wallet.performance_rating
      })) || [];

    // Get sync status overview
    const syncStatusCounts = summary?.reduce((counts, wallet) => {
      counts[wallet.sync_status] = (counts[wallet.sync_status] || 0) + 1;
      return counts;
    }, {} as Record<string, number>) || {};

    return NextResponse.json({
      data: {
        overview: {
          totalValue,
          totalChange,
          totalChangePercent,
          totalPositions,
          totalWallets: summary?.length || 0,
          uniqueChains,
          lastSyncTime: summary?.reduce((latest, wallet) => {
            const syncTime = wallet.last_sync_at ? new Date(wallet.last_sync_at).getTime() : 0;
            return Math.max(latest, syncTime);
          }, 0)
        },
        topWallets,
        syncStatus: syncStatusCounts,
        performanceDistribution: {
          excellent: summary?.filter(w => w.performance_rating === 'excellent').length || 0,
          good: summary?.filter(w => w.performance_rating === 'good').length || 0,
          neutral: summary?.filter(w => w.performance_rating === 'neutral').length || 0,
          poor: summary?.filter(w => w.performance_rating === 'poor').length || 0
        }
      }
    });

  } catch (error: any) {
    ErrorHandler.handle(error, 'GET /api/wallets/portfolio-summary');
    return NextResponse.json(
      { error: ErrorHandler.createUserFriendlyMessage(error) }, 
      { status: 500 }
    );
  }
}