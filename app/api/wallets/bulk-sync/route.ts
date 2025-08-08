import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import { SyncService } from "@/lib/services/sync-service";
import { ErrorHandler } from "@/lib/utils/error-handler";

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

    const {
      walletIds,
      syncType = "full_sync",
      options = {},
    } = await request.json();

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, tier")
      .eq("user_id", session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get user's wallets
    const { data: wallets } = await supabase
      .from("user_wallets")
      .select("id")
      .eq("user_id", profile.id)
      .eq("is_active", true)
      .in("id", walletIds || []);

    if (!wallets || wallets.length === 0) {
      return NextResponse.json(
        { error: "No valid wallets found" },
        { status: 404 },
      );
    }

    // Check bulk sync limits
    const bulkLimits = {
      free: 3,
      pro: 10,
      enterprise: 50,
    };

    if (wallets.length > bulkLimits[profile.tier as keyof typeof bulkLimits]) {
      return NextResponse.json(
        {
          error: `Bulk sync limit exceeded for ${profile.tier} tier`,
        },
        { status: 403 },
      );
    }

    // Queue sync jobs for all wallets
    const syncService = SyncService.getInstance();
    const syncJobIds = await Promise.all(
      wallets.map((wallet, index) =>
        syncService.queueSync({
          walletId: wallet.id,
          type: syncType,
          priority: index, // Lower index = higher priority
          options,
        }),
      ),
    );

    // Update all wallets to syncing status
    await supabase
      .from("user_wallets")
      .update({ sync_status: "syncing" })
      .in(
        "id",
        wallets.map((w) => w.id),
      );

    return NextResponse.json({
      syncJobIds,
      walletsQueued: wallets.length,
      estimatedCompletionTime: new Date(
        Date.now() + wallets.length * 30000,
      ).toISOString(),
    });
  } catch (error: any) {
    ErrorHandler.handle(error, "POST /api/wallets/bulk-sync");

    return NextResponse.json(
      { error: ErrorHandler.createUserFriendlyMessage(error) },
      { status: 500 },
    );
  }
}
