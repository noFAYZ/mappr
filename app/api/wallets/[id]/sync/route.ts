// app/api/wallets/[id]/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { WalletService } from '@/lib/extensions/crypto/zerion';
import { ErrorHandler } from '@/lib/utils/error-handler';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { options = {} } = await request.json();

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
      .select('*')
      .eq('id', id)
      .eq('user_id', profile.id)
      .single();

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    // Update sync status
    await supabase
      .from('user_wallets')
      .update({ sync_status: 'syncing' })
      .eq('id', id);

    try {
      // Perform sync using WalletService
      const zerionExtension = new (await import('@/lib/extensions/crypto/zerion')).ZerionExtension();
      await zerionExtension.connect({ 
        apiKey: process.env.ZERION_API_KEY || process.env.NEXT_PUBLIC_ZERION_API_KEY || '' 
      });

      const syncResult = await zerionExtension.syncWallet(wallet.address, {
        includeTransactions: options.includeTransactions ?? true,
        includeNFTs: options.includeNFTs ?? true,
        includeChart: options.includeChart ?? true,
        chartPeriod: options.chartPeriod ?? 'day',
        forceRefresh: options.forceRefresh ?? false
      });

      if (!syncResult.success) {
        throw new Error(syncResult.error || 'Sync failed');
      }

      // Store in normalized tables
      if (syncResult.data) {
        await WalletService.updateWalletData(id, syncResult.data);
      }

      // Get updated wallet data for response
      const updatedData = await WalletService.getWalletData(id);

      return NextResponse.json({ 
        success: true,
        data: updatedData,
        syncedAt: syncResult.syncedAt,
        syncDuration: syncResult.syncDuration
      });

    } catch (error: any) {
      // Update sync status to error
      await supabase
        .from('user_wallets')
        .update({ 
          sync_status: 'error',
          sync_error: error.message 
        })
        .eq('id', id);

      throw error;
    }

  } catch (error: any) {
    ErrorHandler.handle(error, `POST /api/wallets/${params.id}/sync`);
    return NextResponse.json(
      { error: ErrorHandler.createUserFriendlyMessage(error) }, 
      { status: 500 }
    );
  }
}