import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import { AnalyticsService } from "@/lib/services/analytics-service";
import { ErrorHandler } from "@/lib/utils/error-handler";

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
    const { searchParams } = new URL(request.url);
    const timeframe =
      (searchParams.get("timeframe") as "1d" | "7d" | "30d" | "90d" | "1y") ||
      "30d";

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Validate wallet ownership
    const { data: wallet, error: walletError } = await supabase
      .from("user_wallets")
      .select("*")
      .eq("id", id)
      .eq("user_id", profile.id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Calculate analytics metrics
    const analytics = await AnalyticsService.calculatePortfolioMetrics(
      id,
      timeframe,
    );

    // Get recent performance data for charts
    const { data: snapshots, error: snapshotsError } = await supabase
      .from("portfolio_snapshots")
      .select(
        "total_value, day_change, day_change_percent, snapshot_date, positions_count, chains_count",
      )
      .eq("wallet_id", id)
      .gte("snapshot_date", AnalyticsService.getDateFromTimeframe(timeframe))
      .order("snapshot_date", { ascending: true });

    if (snapshotsError) {
      console.warn("Failed to fetch snapshots:", snapshotsError);
    }

    // Get position breakdown from latest sync data
    const latestSyncData = wallet.last_sync_data;
    const positions = latestSyncData?.positions || [];
    const nftPortfolio = latestSyncData?.nftPortfolio || {
      items: [],
      totalCount: 0,
    };
    const transactions = latestSyncData?.transactions || [];

    // Calculate position allocation
    const totalPositionValue = positions.reduce(
      (sum: number, pos: any) => sum + (pos.attributes?.value || 0),
      0,
    );

    const positionAllocation = positions
      .map((pos: any) => ({
        symbol: pos.attributes?.symbol || "Unknown",
        name: pos.attributes?.name || "Unknown Token",
        value: pos.attributes?.value || 0,
        percentage:
          totalPositionValue > 0
            ? ((pos.attributes?.value || 0) / totalPositionValue) * 100
            : 0,
        change24h: pos.attributes?.change24h || 0,
        icon: pos.attributes?.icon,
        chain: pos.attributes?.chain,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 20); // Top 20 positions

    // Calculate chain distribution
    const chainDistribution = positions.reduce(
      (acc: Record<string, any>, pos: any) => {
        const chain = pos.attributes?.chain || "unknown";

        if (!acc[chain]) {
          acc[chain] = { chain, value: 0, count: 0 };
        }
        acc[chain].value += pos.attributes?.value || 0;
        acc[chain].count += 1;

        return acc;
      },
      {},
    );

    const chainData = Object.values(chainDistribution)
      .map((chain: any) => ({
        ...chain,
        percentage:
          totalPositionValue > 0 ? (chain.value / totalPositionValue) * 100 : 0,
      }))
      .sort((a: any, b: any) => b.value - a.value);

    // Get transaction summary
    const transactionSummary = {
      total: transactions.length,
      sent: transactions.filter(
        (tx: any) => tx.attributes?.direction === "sent",
      ).length,
      received: transactions.filter(
        (tx: any) => tx.attributes?.direction === "received",
      ).length,
      failed: transactions.filter(
        (tx: any) => tx.attributes?.status === "failed",
      ).length,
      totalVolume: transactions.reduce(
        (sum: number, tx: any) => sum + (tx.attributes?.value || 0),
        0,
      ),
      totalFees: transactions.reduce(
        (sum: number, tx: any) => sum + (tx.attributes?.fee || 0),
        0,
      ),
    };

    // Calculate performance insights
    const insights = {
      topPerformer: positionAllocation[0] || null,
      worstPerformer:
        positionAllocation
          .filter((pos) => pos.change24h < 0)
          .sort((a, b) => a.change24h - b.change24h)[0] || null,
      diversification: {
        tokenCount: positions.length,
        chainCount: Object.keys(chainDistribution).length,
        concentrationRisk: positionAllocation[0]?.percentage || 0, // % in top position
        herfindahlIndex: positionAllocation.reduce(
          (sum, pos) => sum + Math.pow(pos.percentage / 100, 2),
          0,
        ), // Measure of concentration
      },
      riskMetrics: {
        volatility: analytics.volatility,
        sharpeRatio: analytics.sharpeRatio,
        maxDrawdown: analytics.maxDrawdown,
        winRate: analytics.winRate,
      },
    };

    // Format chart data
    const chartData = (snapshots || []).map((snapshot) => ({
      date: snapshot.snapshot_date,
      value: Number(snapshot.total_value) || 0,
      change: Number(snapshot.day_change) || 0,
      changePercent: Number(snapshot.day_change_percent) || 0,
      positions: snapshot.positions_count || 0,
      chains: snapshot.chains_count || 0,
    }));

    // Get comparison with previous period
    const previousPeriodEnd = new Date();

    previousPeriodEnd.setDate(
      previousPeriodEnd.getDate() - getTimeframeDays(timeframe),
    );
    const previousPeriodStart = new Date(previousPeriodEnd);

    previousPeriodStart.setDate(
      previousPeriodStart.getDate() - getTimeframeDays(timeframe),
    );

    const { data: previousSnapshots } = await supabase
      .from("portfolio_snapshots")
      .select("total_value")
      .eq("wallet_id", id)
      .gte("snapshot_date", previousPeriodStart.toISOString().split("T")[0])
      .lt("snapshot_date", previousPeriodEnd.toISOString().split("T")[0])
      .order("snapshot_date", { ascending: false })
      .limit(1);

    const previousValue = previousSnapshots?.[0]?.total_value
      ? Number(previousSnapshots[0].total_value)
      : null;
    const periodComparison = previousValue
      ? {
          previousValue,
          currentValue: analytics.currentValue,
          change: analytics.currentValue - previousValue,
          changePercent:
            ((analytics.currentValue - previousValue) / previousValue) * 100,
        }
      : null;

    return NextResponse.json({
      data: {
        wallet: {
          id: wallet.id,
          name: wallet.name,
          address: wallet.address,
          chainType: wallet.chain_type,
          lastSyncAt: wallet.last_sync_at,
          syncStatus: wallet.sync_status,
        },
        metrics: analytics,
        chart: chartData,
        positions: {
          allocation: positionAllocation,
          total: positions.length,
          totalValue: totalPositionValue,
        },
        chains: {
          distribution: chainData,
          total: Object.keys(chainDistribution).length,
        },
        nfts: {
          count: nftPortfolio.totalCount || 0,
          collections: nftPortfolio.items
            ? [
                ...new Set(
                  nftPortfolio.items
                    .map((nft: any) => nft.attributes?.collection)
                    .filter(Boolean),
                ),
              ].length
            : 0,
        },
        transactions: transactionSummary,
        insights,
        comparison: periodComparison,
        timeframe,
        lastUpdated:
          latestSyncData?.metadata?.lastSyncAt || wallet.last_sync_at,
      },
    });
  } catch (error: any) {
    ErrorHandler.handle(error, `GET /api/wallets/${params.id}/analytics`);

    return NextResponse.json(
      {
        error: ErrorHandler.createUserFriendlyMessage(error),
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

// Helper function to get number of days for timeframe
function getTimeframeDays(timeframe: string): number {
  const days = {
    "1d": 1,
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "1y": 365,
  };

  return days[timeframe as keyof typeof days] || 30;
}

// Additional endpoint for real-time wallet data
export async function POST(
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
    const { action, data } = await request.json();

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Validate wallet ownership
    const { data: wallet } = await supabase
      .from("user_wallets")
      .select("id")
      .eq("id", id)
      .eq("user_id", profile.id)
      .single();

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    switch (action) {
      case "create_snapshot":
        // Manually create a portfolio snapshot
        const { data: snapshotResult, error: snapshotError } =
          await supabase.rpc("create_portfolio_snapshot", { wallet_uuid: id });

        if (snapshotError) throw snapshotError;

        return NextResponse.json({
          data: { snapshotId: snapshotResult, created: true },
        });

      case "update_metadata":
        // Update wallet metadata
        const { error: updateError } = await supabase
          .from("user_wallets")
          .update({
            metadata: {
              ...data.metadata,
              updatedAt: new Date().toISOString(),
              updatedBy: session.user.id,
            },
          })
          .eq("id", id);

        if (updateError) throw updateError;

        return NextResponse.json({ data: { updated: true } });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    ErrorHandler.handle(error, `POST /api/wallets/${params.id}/analytics`);

    return NextResponse.json(
      { error: ErrorHandler.createUserFriendlyMessage(error) },
      { status: 500 },
    );
  }
}
