import { supabase } from "../supabase";
import { ErrorHandler } from "../utils/error-handler";

export class AnalyticsService {
  static async calculatePortfolioMetrics(
    walletId: string,
    timeframe: "1d" | "7d" | "30d" | "90d" | "1y" = "30d",
  ): Promise<PortfolioMetrics> {
    try {
      const { data: snapshots, error } = await supabase
        .from("portfolio_snapshots")
        .select("*")
        .eq("wallet_id", walletId)
        .gte("snapshot_date", this.getDateFromTimeframe(timeframe))
        .order("snapshot_date", { ascending: true });

      if (error) throw error;

      if (!snapshots || snapshots.length === 0) {
        return this.getEmptyMetrics();
      }

      const latest = snapshots[snapshots.length - 1];
      const earliest = snapshots[0];

      const totalReturn =
        Number(latest.total_value) - Number(earliest.total_value);
      const totalReturnPercent =
        Number(earliest.total_value) > 0
          ? (totalReturn / Number(earliest.total_value)) * 100
          : 0;

      const values = snapshots.map((s) => Number(s.total_value));
      const avgValue =
        values.reduce((sum, val) => sum + val, 0) / values.length;
      const maxValue = Math.max(...values);
      const minValue = Math.min(...values);

      // Calculate volatility (standard deviation)
      const variance =
        values.reduce((sum, val) => sum + Math.pow(val - avgValue, 2), 0) /
        values.length;
      const volatility = Math.sqrt(variance);

      // Calculate Sharpe ratio (simplified)
      const riskFreeRate = 0.02; // 2% annual risk-free rate
      const annualizedReturn = this.annualizeReturn(
        totalReturnPercent,
        timeframe,
      );
      const annualizedVolatility = this.annualizeVolatility(
        volatility / avgValue,
        timeframe,
      );
      const sharpeRatio =
        annualizedVolatility > 0
          ? (annualizedReturn - riskFreeRate) / annualizedVolatility
          : 0;

      return {
        currentValue: Number(latest.total_value),
        totalReturn,
        totalReturnPercent,
        avgValue,
        maxValue,
        minValue,
        volatility: (volatility / avgValue) * 100, // As percentage
        sharpeRatio,
        winRate: this.calculateWinRate(snapshots),
        maxDrawdown: this.calculateMaxDrawdown(values),
        timeframe,
        dataPoints: snapshots.length,
      };
    } catch (error) {
      ErrorHandler.handle(error, "AnalyticsService.calculatePortfolioMetrics");

      return this.getEmptyMetrics();
    }
  }

  private static getDateFromTimeframe(timeframe: string): string {
    const now = new Date();
    const days =
      {
        "1d": 1,
        "7d": 7,
        "30d": 30,
        "90d": 90,
        "1y": 365,
      }[timeframe] || 30;

    now.setDate(now.getDate() - days);

    return now.toISOString().split("T")[0];
  }

  private static getEmptyMetrics(): PortfolioMetrics {
    return {
      currentValue: 0,
      totalReturn: 0,
      totalReturnPercent: 0,
      avgValue: 0,
      maxValue: 0,
      minValue: 0,
      volatility: 0,
      sharpeRatio: 0,
      winRate: 0,
      maxDrawdown: 0,
      timeframe: "30d",
      dataPoints: 0,
    };
  }

  private static calculateWinRate(snapshots: any[]): number {
    if (snapshots.length < 2) return 0;

    let winningDays = 0;

    for (let i = 1; i < snapshots.length; i++) {
      const current = Number(snapshots[i].total_value);
      const previous = Number(snapshots[i - 1].total_value);

      if (current > previous) winningDays++;
    }

    return (winningDays / (snapshots.length - 1)) * 100;
  }

  private static calculateMaxDrawdown(values: number[]): number {
    let maxDrawdown = 0;
    let peak = values[0];

    for (const value of values) {
      if (value > peak) {
        peak = value;
      } else {
        const drawdown = ((peak - value) / peak) * 100;

        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    }

    return maxDrawdown;
  }

  private static annualizeReturn(
    returnPercent: number,
    timeframe: string,
  ): number {
    const days =
      {
        "1d": 1,
        "7d": 7,
        "30d": 30,
        "90d": 90,
        "1y": 365,
      }[timeframe] || 30;

    return (returnPercent / 100 + 1) ** (365 / days) - 1;
  }

  private static annualizeVolatility(
    volatility: number,
    timeframe: string,
  ): number {
    const days =
      {
        "1d": 1,
        "7d": 7,
        "30d": 30,
        "90d": 90,
        "1y": 365,
      }[timeframe] || 30;

    return volatility * Math.sqrt(365 / days);
  }
}

interface PortfolioMetrics {
  currentValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  avgValue: number;
  maxValue: number;
  minValue: number;
  volatility: number;
  sharpeRatio: number;
  winRate: number;
  maxDrawdown: number;
  timeframe: string;
  dataPoints: number;
}
