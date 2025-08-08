import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import { ErrorHandler } from "@/lib/utils/error-handler";
import { SyncService } from "@/lib/services/sync-service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Get sync job with wallet ownership verification
    const { data: job, error } = await supabase
      .from("wallet_sync_jobs")
      .select(
        `
        *,
        user_wallets!inner(user_id)
      `,
      )
      .eq("id", id)
      .eq("user_wallets.user_id", session.user.id)
      .single();

    if (error || !job) {
      return NextResponse.json(
        { error: "Sync job not found" },
        { status: 404 },
      );
    }

    // Calculate progress and estimated completion
    const progress =
      job.status === "completed"
        ? 100
        : job.status === "running"
          ? 50
          : job.status === "pending"
            ? 0
            : 0;

    const estimatedCompletion =
      job.status === "running" && job.started_at
        ? new Date(new Date(job.started_at).getTime() + 30000).toISOString()
        : null;

    return NextResponse.json({
      data: {
        id: job.id,
        status: job.status,
        progress,
        startedAt: job.started_at,
        completedAt: job.completed_at,
        duration: job.duration_ms,
        result: job.sync_result,
        error: job.error_message,
        estimatedCompletion,
        retryCount: job.retry_count,
        walletId: job.wallet_id,
      },
    });
  } catch (error: any) {
    ErrorHandler.handle(error, `GET /api/sync-jobs/${params.id}/status`);

    return NextResponse.json(
      { error: ErrorHandler.createUserFriendlyMessage(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { address, name } = await request.json();

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 },
      );
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: "Invalid Ethereum address format" },
        { status: 400 },
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, tier")
      .eq("user_id", session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Check if wallet already exists
    const { data: existingWallet } = await supabase
      .from("user_wallets")
      .select("id")
      .eq("user_id", profile.id)
      .eq("address", address.toLowerCase())
      .single();

    if (existingWallet) {
      return NextResponse.json(
        { error: "Wallet already exists" },
        { status: 409 },
      );
    }

    // Check wallet limits based on tier
    const { count: walletCount } = await supabase
      .from("user_wallets")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .eq("is_active", true);

    const walletLimits = {
      free: 3,
      pro: 25,
      enterprise: 100,
    };

    if (
      (walletCount || 0) >=
      walletLimits[profile.tier as keyof typeof walletLimits]
    ) {
      return NextResponse.json(
        {
          error: `Wallet limit reached for ${profile.tier} tier. Upgrade to add more wallets.`,
        },
        { status: 403 },
      );
    }

    // Create wallet
    const { data: wallet, error: insertError } = await supabase
      .from("user_wallets")
      .insert({
        user_id: profile.id,
        address: address.toLowerCase(),
        name: name || `Wallet ${address.slice(0, 6)}...${address.slice(-4)}`,
        chain_type: "ethereum",
        wallet_type: "external",
        is_active: true,
        metadata: {
          addedAt: new Date().toISOString(),
          source: "api",
          addedBy: session.user.id,
        },
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Queue initial sync
    const syncService = SyncService.getInstance();
    const syncJobId = await syncService.queueSync({
      walletId: wallet.id,
      type: "full_sync",
      priority: 1,
      options: {
        includeTransactions: true,
        includeNFTs: true,
        includeChart: true,
      },
    });

    return NextResponse.json(
      {
        data: wallet,
        syncJobId,
      },
      { status: 201 },
    );
  } catch (error: any) {
    ErrorHandler.handle(error, "POST /api/wallets");

    return NextResponse.json(
      { error: ErrorHandler.createUserFriendlyMessage(error) },
      { status: 500 },
    );
  }
}
