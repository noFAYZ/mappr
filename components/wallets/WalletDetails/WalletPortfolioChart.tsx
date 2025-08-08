// components/Wallets/WalletPortfolioChart.tsx
import React, {
  memo,
  useMemo,
  useCallback,
  useState,
  useRef,
  useEffect,
} from "react";
import {
  Button,
  Spinner,
  Chip,
  Card,
  CardBody,
  Tooltip,
  Badge,
  Avatar,
  Progress,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Calendar,
  Clock,
  Activity,
  Zap,
  Target,
  Maximize2,
  Minimize2,
  LineChart,
  AreaChart,
  Info,
  Star,
  Sparkles,
  BarChart3,
  PieChart,
  Shield,
  Crown,
  Bell,
  Settings,
  Download,
  Share2,
  Heart,
  ChevronDown,
} from "lucide-react";

import { HugeiconsAnalyticsUp } from "@/components/icons/icons";
import { formatPercent } from "@/lib/wallet-analytics/utils";
import { formatTime, timestampzToReadable } from "@/lib/utils/time";

// ==================== TYPES ====================
interface ChartPoint {
  readonly timestamp: number;
  readonly value: number;
  readonly volume?: number;
  readonly high?: number;
  readonly low?: number;
  readonly change?: number;
}

interface ChartMetrics {
  readonly current: number;
  readonly change: number;
  readonly percentage: number;
  readonly isPositive: boolean;
  readonly high: number;
  readonly low: number;
  readonly volatility: number;
  readonly range: number;
  readonly rangePercent: number;
  readonly volume?: number;
  readonly marketCap?: number;
  readonly avgVolume?: number;
  readonly momentum?: number;
  readonly rsi?: number;
  readonly sharpeRatio?: number;
}

interface HoveredPointData {
  readonly value: number;
  readonly timestamp: number;
  readonly change: number;
  readonly isPositive: boolean;
  readonly volume?: number;
  readonly index: number;
}

interface PerformanceMetric {
  readonly label: string;
  readonly value: string | number;
  readonly change?: number;
  readonly isPositive?: boolean;
  readonly icon: React.ComponentType<any>;
  readonly color: string;
  readonly bgGradient: string;
  readonly description?: string;
}

interface TradingInsight {
  readonly type: "bullish" | "bearish" | "neutral";
  readonly title: string;
  readonly description: string;
  readonly confidence: number;
  readonly timeframe: string;
}

interface PortfolioChartProps {
  readonly walletAddress: string;
  readonly chartData: ChartPoint[];
  readonly initialPeriod?: "day" | "week" | "month" | "year" | "max";
  readonly showBalance?: boolean;
  readonly compact?: boolean;
  readonly height?: number;
  readonly showControls?: boolean;
  readonly className?: string;
  readonly variant?: "default" | "minimal" | "detailed" | "premium" | "pro";
  readonly isLoading?: boolean;
  readonly theme?: "glass" | "solid" | "gradient" | "neon";
  readonly aiInsights?: TradingInsight[];
  readonly performanceMetrics?: PerformanceMetric[];
  readonly onRefresh?: () => Promise<void>;
  readonly onPeriodChange?: (period: string) => void;
  readonly onExport?: () => void;
  readonly onShare?: () => void;
  readonly onBookmark?: () => void;
  readonly isBookmarked?: boolean;
  readonly isPremiumUser?: boolean;
}

type PeriodKey = "day" | "week" | "month" | "year" | "max";
type ChartMode = "area" | "line" | "candle" | "volume";

// ==================== CONSTANTS ====================
const CHART_PERIODS = [
  {
    key: "day" as const,
    label: "24H",
    fullLabel: "24 Hours",
    color: "from-blue-400 to-cyan-400",
    icon: Clock,
    description: "Hourly data points",
  },
  {
    key: "week" as const,
    label: "7D",
    fullLabel: "1 Week",
    color: "from-green-400 to-emerald-400",
    icon: Calendar,
    description: "Daily data points",
  },
  {
    key: "month" as const,
    label: "30D",
    fullLabel: "1 Month",
    color: "from-yellow-400 to-orange-400",
    icon: BarChart3,
    description: "Daily data points",
  },
  {
    key: "year" as const,
    label: "1Y",
    fullLabel: "1 Year",
    color: "from-purple-400 to-pink-400",
    icon: PieChart,
    description: "Weekly data points",
  },
  {
    key: "max" as const,
    label: "ALL",
    fullLabel: "All Time",
    color: "from-red-400 to-rose-400",
    icon: Star,
    description: "Monthly data points",
  },
] as const;

const CHART_MODES = [
  {
    key: "area" as const,
    label: "Area",
    icon: AreaChart,
    description: "Smooth area chart",
  },
  {
    key: "line" as const,
    label: "Line",
    icon: LineChart,
    description: "Clean line chart",
  },
  {
    key: "candle" as const,
    label: "Candle",
    icon: BarChart3,
    description: "OHLC candlesticks",
  },
  {
    key: "volume" as const,
    label: "Volume",
    icon: Activity,
    description: "Volume overlay",
  },
] as const;

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
} as const;

// ==================== HOOKS ====================
const useResponsive = () => {
  const [state, setState] = useState(() => {
    if (typeof window === "undefined")
      return { isMobile: false, isTablet: false, isDesktop: true };
    const width = window.innerWidth;

    return {
      isMobile: width < BREAKPOINTS.mobile,
      isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
      isDesktop: width >= BREAKPOINTS.desktop,
    };
  });

  useEffect(() => {
    const updateBreakpoints = () => {
      const width = window.innerWidth;

      setState({
        isMobile: width < BREAKPOINTS.mobile,
        isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
        isDesktop: width >= BREAKPOINTS.desktop,
      });
    };

    const debouncedUpdate = debounce(updateBreakpoints, 100);

    window.addEventListener("resize", debouncedUpdate);

    return () => window.removeEventListener("resize", debouncedUpdate);
  }, []);

  return state;
};

const useChartInteraction = (chartData: ChartPoint[], isLoading: boolean) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [isHovering, setIsHovering] = useState(false);
  const { isMobile, isTablet } = useResponsive();
  const lastHoverTime = useRef(0);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (isLoading || chartData.length === 0) return;

      const now = Date.now();

      if (now - lastHoverTime.current < 16) return; // 60fps throttle
      lastHoverTime.current = now;

      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const svgWidth = rect.width;

      const index = Math.round((mouseX / svgWidth) * (chartData.length - 1));
      const boundedIndex = Math.max(0, Math.min(index, chartData.length - 1));

      setHoverIndex(boundedIndex);
      setIsHovering(true);
    },
    [chartData.length, isLoading],
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!isMobile && !isTablet) {
      setHoverIndex(null);
      setIsHovering(false);
    }
  }, [isMobile, isTablet]);

  const handleTouchStart = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    const touch = e.touches[0];

    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setIsHovering(true);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<SVGSVGElement>) => {
      if (isLoading || !touchStart || chartData.length === 0) return;

      const touch = e.touches[0];
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      const svgWidth = rect.width;

      const index = Math.round((touchX / svgWidth) * (chartData.length - 1));
      const boundedIndex = Math.max(0, Math.min(index, chartData.length - 1));

      setHoverIndex(boundedIndex);
      e.preventDefault();
    },
    [chartData.length, isLoading, touchStart],
  );

  const handleTouchEnd = useCallback(() => {
    setTouchStart(null);
    setTimeout(() => {
      setHoverIndex(null);
      setIsHovering(false);
    }, 3000);
  }, []);

  return {
    hoverIndex,
    isHovering,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};

// ==================== UTILITY FUNCTIONS ====================
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): T => {
  let timeoutId: NodeJS.Timeout;

  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
};

const formatCurrency = (
  value: number,
  showBalance: boolean,
  isMobile: boolean,
): string => {
  if (!showBalance) return "••••••";

  const formatLarge = (val: number, suffix: string, decimals: number) =>
    `$${val.toFixed(decimals)}${suffix}`;

  if (Math.abs(value) >= 1_000_000_000) {
    return formatLarge(value / 1_000_000_000, "B", isMobile ? 1 : 2);
  }
  if (Math.abs(value) >= 1_000_000) {
    return formatLarge(value / 1_000_000, "M", isMobile ? 1 : 2);
  }
  if (Math.abs(value) >= 1_000) {
    return formatLarge(value / 1_000, "K", isMobile ? 1 : 2);
  }

  return `$${value.toFixed(isMobile ? 0 : 2)}`;
};

const calculateAdvancedMetrics = (
  chartData: ChartPoint[],
): ChartMetrics | null => {
  if (chartData.length < 2) return null;

  const values = chartData.map((p) => p.value);
  const volumes = chartData.map((p) => p.volume || 0);
  const [firstValue] = values;
  const lastValue = values[values.length - 1];
  const change = lastValue - firstValue;
  const percentage = (change / firstValue) * 100;
  const high = Math.max(...values);
  const low = Math.min(...values);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;

  // Advanced calculations
  const volatility = Math.sqrt(
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length,
  );

  const returns = values
    .slice(1)
    .map((val, i) => (val - values[i]) / values[i]);
  const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const returnStd = Math.sqrt(
    returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) /
      returns.length,
  );

  // Sharpe ratio (assuming 2% risk-free rate annually)
  const riskFreeRate = 0.02 / 365; // Daily risk-free rate
  const sharpeRatio =
    returnStd > 0 ? (avgReturn - riskFreeRate) / returnStd : 0;

  // Momentum (rate of change over last 20% of data)
  const momentumPeriod = Math.max(1, Math.floor(values.length * 0.2));
  const recentValues = values.slice(-momentumPeriod);
  const momentum =
    recentValues.length > 1
      ? ((recentValues[recentValues.length - 1] - recentValues[0]) /
          recentValues[0]) *
        100
      : 0;

  // RSI calculation (simplified)
  const rsiPeriod = Math.min(14, Math.floor(values.length / 2));
  let gains = 0,
    losses = 0;

  for (let i = values.length - rsiPeriod; i < values.length - 1; i++) {
    const diff = values[i + 1] - values[i];

    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / rsiPeriod;
  const avgLoss = losses / rsiPeriod;
  const rs = avgLoss > 0 ? avgGain / avgLoss : 100;
  const rsi = 100 - 100 / (1 + rs);

  return {
    current: lastValue,
    change,
    percentage,
    isPositive: percentage >= 0,
    high,
    low,
    volatility,
    range: high - low,
    rangePercent: ((high - low) / low) * 100,
    volume: volumes.reduce((sum, vol) => sum + vol, 0),
    avgVolume: volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length,
    momentum,
    rsi: isNaN(rsi) ? 50 : Math.max(0, Math.min(100, rsi)),
    sharpeRatio: isNaN(sharpeRatio) ? 0 : sharpeRatio,
  };
};

const generateSmoothPath = (
  points: Array<{ x: number; y: number }>,
): string => {
  if (points.length < 2) return "";

  let path = `M ${points[0].x},${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const current = points[i];
    const previous = points[i - 1];

    // Catmull-Rom spline for smoother curves
    const tension = 0.3;
    const cp1x = previous.x + (current.x - previous.x) * tension;
    const cp2x = current.x - (current.x - previous.x) * tension;

    path += ` C ${cp1x},${previous.y} ${cp2x},${current.y} ${current.x},${current.y}`;
  }

  return path;
};

// ==================== COMPONENTS ====================
const LoadingState = memo<{ height: number; className: string; theme: string }>(
  ({ height, className, theme }) => (
    <div
      className={`relative w-full overflow-hidden rounded-2xl ${
        theme === "glass"
          ? "bg-white/5 backdrop-blur-xl border border-white/10"
          : theme === "neon"
            ? "bg-black/90 border border-cyan-500/30"
            : "bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950"
      } ${className}`}
      style={{ height: `${height}px` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-pink-500/5" />
      <div className="relative flex flex-col items-center justify-center h-full gap-6">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <Spinner
              classNames={{
                circle1: "border-b-orange-500",
                circle2: "border-b-pink-500",
              }}
              color="primary"
              size="lg"
            />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-foreground/80 font-medium">
              Loading portfolio analytics...
            </p>
            <p className="text-xs text-foreground/60">
              Analyzing market data and trends
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
);

const EmptyState = memo<{
  height: number;
  className: string;
  theme: string;
  onRefresh?: () => void;
}>(({ height, className, theme, onRefresh }) => (
  <div
    className={`relative w-full overflow-hidden rounded-3xl ${"bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950/20 dark:to-secondary-950"} ${className}`}
    style={{ height: `${height}px` }}
  >
    <div className="relative flex flex-col items-center justify-center h-full gap-3">
      <div className="p-3 rounded-3xl bg-primary-500/10 backdrop-blur-sm border border-white/20">
        <HugeiconsAnalyticsUp className="w-12 h-12 text-primary-500" />
      </div>
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-foreground">
            No Chart Data Available
          </h3>
          <p className="text-[11px] text-foreground/60 max-w-xs">
            Connect your wallet or refresh to start viewing your portfolio
            performance analytics.
          </p>
        </div>
        {onRefresh && (
          <Button
            className="bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-white/20 backdrop-blur-sm rounded-md font-medium h-6 px-2 py-1"
            color="primary"
            size="sm"
            startContent={<RefreshCw size={12} />}
            variant="flat"
            onPress={onRefresh}
          >
            Refresh
          </Button>
        )}
      </div>
    </div>
  </div>
));

const PremiumTooltip = memo<{
  data: HoveredPointData;
  position: { x: number; y: number };
  period: PeriodKey;
  showBalance: boolean;
  isMobile: boolean;
  theme: string;
}>(({ data, position, period, showBalance, isMobile, theme }) => (
  <div
    className={`absolute z-50 pointer-events-none ${
      theme === "glass"
        ? "bg-background/95 backdrop-blur-xl border border-divider"
        : theme === "neon"
          ? "bg-black/95 border border-cyan-500/50"
          : "bg-background border border-divider"
    } rounded-xl shadow-2xl p-2 min-w-[200px] `}
    style={{
      left: `${Math.min(Math.max(position.x, 10), 90)}%`,
      top: `${position.y < 30 ? position.y + 15 : position.y - 15}%`,
      transform: "translateX(-50%)",
    }}
  >
    {/* Header */}
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-md ${
            data.isPositive ? "bg-success-500" : "bg-danger-500"
          } shadow-lg`}
        />
        <span className="text-xs font-semibold text-foreground">
          Portfolio Value
        </span>
      </div>
      <Chip
        className="text-xs rounded-md px-1 font-medium py-1 h-5"
        color={data.isPositive ? "success" : "danger"}
        size="sm"
        variant="flat"
      >
        {data.isPositive ? "+" : ""}
        {data.change.toFixed(2)}%
      </Chip>
    </div>

    {/* Value */}
    <div>
      <p className="text-xl font-bold text-foreground">
        {formatCurrency(data.value, showBalance, isMobile)}
      </p>
      <div className="flex items-center gap-2 text-[11px] text-foreground/60">
        <Calendar size={12} />
        <span>
          {timestampzToReadable(String(data.timestamp), {
            format: "smart",
          })}
        </span>
      </div>
    </div>
  </div>
));

const AIInsightCard = memo<{ insight: TradingInsight; index: number }>(
  ({ insight, index }) => (
    <div>
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
        <CardBody className="p-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-lg ${
                insight.type === "bullish"
                  ? "bg-success-500/20 text-success-600"
                  : insight.type === "bearish"
                    ? "bg-danger-500/20 text-danger-600"
                    : "bg-warning-500/20 text-warning-600"
              }`}
            >
              {insight.type === "bullish" ? (
                <TrendingUp size={16} />
              ) : insight.type === "bearish" ? (
                <TrendingDown size={16} />
              ) : (
                <Activity size={16} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm text-foreground truncate">
                  {insight.title}
                </h4>
                <Badge
                  color={
                    insight.confidence > 80
                      ? "success"
                      : insight.confidence > 60
                        ? "warning"
                        : "default"
                  }
                  size="sm"
                  variant="flat"
                >
                  {insight.confidence}%
                </Badge>
              </div>
              <p className="text-xs text-foreground/70 mb-2 line-clamp-2">
                {insight.description}
              </p>
              <div className="flex items-center gap-2">
                <Clock className="text-foreground/40" size={12} />
                <span className="text-xs text-foreground/60">
                  {insight.timeframe}
                </span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  ),
);

const MetricsGrid = memo<{
  metrics: ChartMetrics;
  isMobile: boolean;
  isPremium: boolean;
  performanceMetrics?: PerformanceMetric[];
}>(({ metrics, isMobile, isPremium, performanceMetrics }) => {
  const defaultMetrics: PerformanceMetric[] = [
    {
      label: "Portfolio High",
      value: formatCurrency(metrics.high, true, isMobile),
      icon: Target,
      color: "text-success-500",
      bgGradient: "from-success-500/10 to-success-600/5",
      description: "Highest value reached",
    },
    {
      label: "Portfolio Low",
      value: formatCurrency(metrics.low, true, isMobile),
      icon: Target,
      color: "text-danger-500",
      bgGradient: "from-danger-500/10 to-danger-600/5",
      description: "Lowest value reached",
    },
    {
      label: "Volatility",
      value: `${((metrics.volatility / metrics.current) * 100).toFixed(1)}%`,
      icon: Activity,
      color: "text-warning-500",
      bgGradient: "from-warning-500/10 to-warning-600/5",
      description: "Price volatility measure",
    },
    {
      label: "Range",
      value: `${metrics.rangePercent.toFixed(1)}%`,
      icon: Zap,
      color: "text-purple-500",
      bgGradient: "from-purple-500/10 to-purple-600/5",
      description: "High-low range percentage",
    },
  ];

  if (isPremium && metrics.rsi !== undefined) {
    defaultMetrics.push(
      {
        label: "RSI",
        value: metrics.rsi.toFixed(1),
        icon: BarChart3,
        color:
          metrics.rsi > 70
            ? "text-danger-500"
            : metrics.rsi < 30
              ? "text-success-500"
              : "text-primary-500",
        bgGradient: "from-primary-500/10 to-primary-600/5",
        description: "Relative Strength Index",
      },
      {
        label: "Momentum",
        value: `${metrics.momentum?.toFixed(1) || 0}%`,
        icon: TrendingUp,
        color:
          (metrics.momentum || 0) > 0 ? "text-success-500" : "text-danger-500",
        bgGradient: "from-secondary-500/10 to-secondary-600/5",
        description: "Recent price momentum",
      },
    );
  }

  const displayMetrics = performanceMetrics || defaultMetrics;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
      {displayMetrics.map((metric, index) => (
        <div key={metric.label}>
          <Card
            className={`bg-gradient-to-br ${metric.bgGradient} border border-white/10 hover:border-white/20 transition-all duration-300 group cursor-pointer`}
          >
            <CardBody className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`p-2 rounded-lg bg-white/10 ${metric.color} group-hover:scale-110 transition-transform duration-300`}
                >
                  <metric.icon size={isMobile ? 14 : 16} />
                </div>
                {metric.change !== undefined && (
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      metric.isPositive ? "text-success-500" : "text-danger-500"
                    }`}
                  >
                    {metric.isPositive ? (
                      <TrendingUp size={10} />
                    ) : (
                      <TrendingDown size={10} />
                    )}
                    {Math.abs(metric.change).toFixed(1)}%
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-foreground/60 font-medium uppercase tracking-wide">
                  {metric.label}
                </p>
                <p
                  className={`font-bold ${isMobile ? "text-sm" : "text-base"} ${metric.color} group-hover:scale-105 transition-transform duration-300`}
                >
                  {metric.value}
                </p>
                {metric.description && (
                  <p className="text-[10px] text-foreground/50 line-clamp-1">
                    {metric.description}
                  </p>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      ))}
    </div>
  );
});

const PremiumHeader = memo<{
  metrics: ChartMetrics | null;
  hoveredData: HoveredPointData | null;
  period: PeriodKey;
  showBalance: boolean;
  isMobile: boolean;
  isPremium: boolean;
  isBookmarked: boolean;
  onBookmark?: () => void;
  onShare?: () => void;
  onExport?: () => void;
}>(
  ({
    metrics,
    hoveredData,
    period,
    showBalance,
    isMobile,
    isPremium,
    isBookmarked,
    onBookmark,
    onShare,
    onExport,
  }) => (
    <div className="space-y-2">
      {/* Main Value Display */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          {/* Portfolio Value */}
          <div className="flex items-center gap-4">
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold bg-default-600 bg-clip-text text-transparent transition-all duration-200">
              {formatCurrency(
                hoveredData?.value ?? metrics?.current ?? 0,
                showBalance,
                isMobile,
              )}
            </span>

            <div>
              <Chip
                className={`text-[11px] sm:text-xs h-6 px-0 rounded-md ${hoveredData?.isPositive ? "bg-success-100 text-success-600" : "bg-danger-100 text-danger-700"}`}
                classNames={{
                  content: "font-medium",
                }}
                color={
                  (hoveredData?.isPositive ?? metrics?.isPositive)
                    ? "success"
                    : "danger"
                }
                size={isMobile ? "sm" : "md"}
                variant="light"
              >
                {formatPercent(hoveredData?.change ?? metrics?.percentage ?? 0)}
              </Chip>
            </div>

            {isPremium && (
              <div>
                <Badge
                  color="warning"
                  content={<Crown size={8} />}
                  placement="top-right"
                  size="sm"
                >
                  <Avatar
                    className="bg-gradient-to-r from-yellow-400 to-orange-500"
                    icon={<Sparkles className="text-white" size={14} />}
                    size="sm"
                  />
                </Badge>
              </div>
            )}
          </div>

          {/* Period & Time Info */}
          <div className="flex items-center gap-4 text-xs text-foreground/60">
            <div className="flex items-center gap-2">
              <Calendar size={12} />
              <span>
                {hoveredData
                  ? timestampzToReadable(String(hoveredData.timestamp), {
                      format: "smart",
                    })
                  : `${period.toUpperCase()} Period • ${formatCurrency(Math.abs(metrics?.change ?? 0), showBalance, isMobile)} Change`}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onBookmark && (
            <Tooltip
              content={
                isBookmarked ? "Remove from favorites" : "Add to favorites"
              }
            >
              <Button
                isIconOnly
                className={`min-w-0 w-8 h-8 transition-all duration-300 hover:scale-110 ${
                  isBookmarked
                    ? "bg-warning-500/20 text-warning-500 border-warning-500/30"
                    : "bg-white/5 hover:bg-white/10 border border-white/10 text-white/60"
                }`}
                size="sm"
                variant="flat"
                onPress={onBookmark}
              >
                {isBookmarked ? (
                  <Heart className="fill-current" size={12} />
                ) : (
                  <Heart size={12} />
                )}
              </Button>
            </Tooltip>
          )}

          {onShare && (
            <Tooltip content="Share portfolio">
              <Button
                isIconOnly
                className="min-w-0 w-8 h-8 bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 hover:scale-110"
                size="sm"
                variant="flat"
                onPress={onShare}
              >
                <Share2 className="text-white/60" size={12} />
              </Button>
            </Tooltip>
          )}

          {onExport && (
            <Tooltip content="Export data">
              <Button
                isIconOnly
                className="min-w-0 w-8 h-8 bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 hover:scale-110"
                size="sm"
                variant="flat"
                onPress={onExport}
              >
                <Download className="text-white/60" size={12} />
              </Button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Premium Analytics Preview */}
      {isPremium && metrics && (
        <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Zap className="text-purple-400" size={14} />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">AI Analysis</p>
              <p className="text-[10px] text-foreground/60">
                {metrics.momentum && metrics.momentum > 5
                  ? "Strong upward momentum detected"
                  : metrics.momentum && metrics.momentum < -5
                    ? "Bearish trend identified"
                    : "Consolidation phase - monitoring for breakout"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div className="text-right">
              <p className="text-xs text-foreground/60">Sharpe Ratio</p>
              <p className="text-sm font-bold text-foreground">
                {metrics.sharpeRatio?.toFixed(2) || "N/A"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-foreground/60">Momentum</p>
              <p
                className={`text-sm font-bold ${
                  (metrics.momentum || 0) > 0
                    ? "text-success-500"
                    : "text-danger-500"
                }`}
              >
                {metrics.momentum?.toFixed(1) || 0}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  ),
);

// ==================== MAIN COMPONENT ====================
const WalletPortfolioChart: React.FC<PortfolioChartProps> = memo(
  ({
    walletAddress,
    chartData,
    initialPeriod = "week",
    showBalance = true,
    compact = false,
    height,
    showControls = true,
    className = "",
    variant = "premium",
    theme = "glass",
    isLoading = false,
    aiInsights = [
      {
        title: "No insights available",
        description: "",
        type: "neutral",
        confidence: 0,
        timeframe: "N/A",
      },
    ],
    performanceMetrics,
    onRefresh,
    onPeriodChange,
    onExport,
    onShare,
    onBookmark,
    isBookmarked = false,
    isPremiumUser = false,
  }) => {
    // State
    const [period, setPeriod] = useState<PeriodKey>(initialPeriod);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [chartMode, setChartMode] = useState<ChartMode>("area");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showInsights, setShowInsights] = useState(false);

    // Hooks
    const { isMobile, isTablet, isDesktop } = useResponsive();
    const {
      hoverIndex,
      isHovering,
      handleMouseMove,
      handleMouseEnter,
      handleMouseLeave,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
    } = useChartInteraction(chartData, isLoading);

    // Calculations
    const chartMetrics = useMemo(
      () => calculateAdvancedMetrics(chartData),
      [chartData],
    );

    const hoveredPointData = useMemo((): HoveredPointData | null => {
      if (hoverIndex === null || !chartData[hoverIndex] || !chartData[0])
        return null;

      const point = chartData[hoverIndex];
      const firstValue = chartData[0].value;
      const pointChange = ((point.value - firstValue) / firstValue) * 100;

      return {
        value: point.value,
        timestamp: point.timestamp,
        change: pointChange,
        isPositive: pointChange >= 0,
        volume: point.volume,
        index: hoverIndex,
      };
    }, [hoverIndex, chartData]);

    const chartConfig = useMemo(() => {
      if (chartData.length === 0) return null;

      const values = chartData.map((point) => point.value);
      const padding = 0.05; // 5% padding
      const minValue = Math.min(...values) * (1 - padding);
      const maxValue = Math.max(...values) * (1 + padding);
      const valueRange = maxValue - minValue;

      const points = chartData.map((point, index) => ({
        x: (index / Math.max(1, chartData.length - 1)) * 100,
        y: 100 - ((point.value - minValue) / valueRange) * 100,
        ...point,
      }));

      return { points, minValue, maxValue, valueRange };
    }, [chartData]);

    const { linePath, areaPath, gradientId } = useMemo(() => {
      if (!chartConfig || chartConfig.points.length < 2) {
        return { linePath: "", areaPath: "", gradientId: "" };
      }

      const linePath = generateSmoothPath(chartConfig.points);
      const lastPoint = chartConfig.points[chartConfig.points.length - 1];
      const firstPoint = chartConfig.points[0];
      const areaPath = `${linePath} L ${lastPoint.x},100 L ${firstPoint.x},100 Z`;
      const gradientId = `gradient-${walletAddress}-${period}`;

      return { linePath, areaPath, gradientId };
    }, [chartConfig, walletAddress, period]);

    const chartHeight = useMemo(() => {
      if (height) return height;
      if (isFullscreen) return Math.min(window?.innerHeight - 200 || 600, 800);
      if (isMobile) return compact ? 220 : variant === "premium" ? 340 : 300;
      if (isTablet) return compact ? 260 : variant === "premium" ? 420 : 360;

      return compact
        ? 280
        : variant === "premium" || variant === "pro"
          ? 480
          : variant === "detailed"
            ? 440
            : 400;
    }, [height, isFullscreen, isMobile, isTablet, compact, variant]);

    // Handlers
    const handleRefresh = useCallback(async () => {
      if (!onRefresh) return;

      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }, [onRefresh]);

    const handlePeriodChange = useCallback(
      (newPeriod: PeriodKey) => {
        setPeriod(newPeriod);
        onPeriodChange?.(newPeriod);
      },
      [onPeriodChange],
    );

    // Render loading state
    if (isLoading) {
      return (
        <LoadingState
          className={className}
          height={chartHeight}
          theme={theme}
        />
      );
    }

    // Render empty state
    if (!chartConfig || chartData.length === 0) {
      return (
        <EmptyState
          className={className}
          height={chartHeight}
          theme={theme}
          onRefresh={handleRefresh}
        />
      );
    }

    return (
      <div className={`relative w-full flex flex-col ${className}`}>
        {/* Premium Header */}
        {!compact && variant !== "minimal" && (
          <div className="flex justify-end items-center ">
            {/*  <PremiumHeader
            metrics={chartMetrics}
            hoveredData={hoveredPointData}
            period={period}
            showBalance={showBalance}
            isMobile={isMobile}
            isPremium={isPremiumUser}
            isBookmarked={isBookmarked}
            onBookmark={onBookmark}
            onShare={onShare}
            onExport={onExport}
          /> */}

            {/* Enhanced Period Selector */}
            {showControls && variant !== "minimal" && (
              <div className="flex justify-center px-4">
                {/* Desktop Controls - Hidden on mobile */}
                <div className="hidden sm:flex items-center backdrop-blur-xl rounded-2xl p-1 border border-divider gap-1 shadow-2xl">
                  {CHART_PERIODS.map(
                    ({ key, label, color, icon: Icon, description }) => (
                      <Tooltip
                        key={key}
                        className="bg-background h-5 text-xs rounded-md font-medium border border-divider"
                        content={description}
                        placement="bottom"
                      >
                        <div>
                          <Button
                            className={`min-w-0 px-3 sm:px-4 text-xs font-semibold rounded-xl  ${
                              period === key
                                ? `bg-gradient-to-br from-orange-400/90 via-orange-600/90 to-pink-400/90 rounded-xl text-white shadow-md hover:shadow-lg shadow-current/25`
                                : "text-default-600 hover:bg-default-100"
                            }`}
                            size="sm"
                            variant={period === key ? "solid" : "light"}
                            onPress={() => handlePeriodChange(key)}
                          >
                            {label}
                          </Button>
                        </div>
                      </Tooltip>
                    ),
                  )}
                </div>

                {/* Mobile Dropdown - Visible only on mobile */}
                <div className="flex sm:hidden">
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        className="backdrop-blur-xl border-divider rounded-md px-4 py-2 text-xs font-semibold shadow-2xl"
                        endContent={<ChevronDown className="w-4 h-4" />}
                        size="sm"
                        variant="faded"
                      >
                        {CHART_PERIODS.find((p) => p.key === period)?.label ||
                          "Select Period"}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Chart periods"
                      className="backdrop-blur-xl"
                      selectedKeys={[period]}
                      selectionMode="single"
                      onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0] as PeriodKey;

                        if (selectedKey) handlePeriodChange(selectedKey);
                      }}
                    >
                      {CHART_PERIODS.map(
                        ({ key, label, description, icon: Icon }) => (
                          <DropdownItem
                            key={key}
                            className="text-xs"
                            description={description}
                            startContent={Icon && <Icon className="w-4 h-4" />}
                          >
                            {label}
                          </DropdownItem>
                        ),
                      )}
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chart Mode Selector (Premium) */}
        {isPremiumUser && showControls && variant !== "minimal" && (
          <div className="flex justify-center px-4 sm:px-6 lg:px-8 pb-4">
            <div className="flex items-center bg-purple-500/10 backdrop-blur-xl rounded-xl p-1 border border-purple-500/20 gap-1">
              {CHART_MODES.map(({ key, label, icon: Icon, description }) => (
                <Tooltip key={key} content={description} placement="top">
                  <Button
                    className={`min-w-0 px-3 text-xs font-medium rounded-lg transition-all duration-300 ${
                      chartMode === key
                        ? "bg-purple-500 text-white shadow-lg"
                        : "text-purple-300 hover:text-white hover:bg-purple-500/20"
                    }`}
                    size="sm"
                    startContent={<Icon size={10} />}
                    variant={chartMode === key ? "solid" : "light"}
                    onPress={() => setChartMode(key)}
                  >
                    {!isMobile && label}
                  </Button>
                </Tooltip>
              ))}
            </div>
          </div>
        )}

        {/* Chart Container */}
        <div className="flex-1 relative">
          <svg
            className="cursor-crosshair drop-shadow-2xl touch-none rounded-2xl overflow-hidden"
            height="100%"
            preserveAspectRatio="none"
            style={{ height: `${chartHeight}px` }}
            viewBox="0 0 100 100"
            width="100%"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            onTouchStart={handleTouchStart}
          >
            {/* Enhanced Gradient Definitions */}
            <defs>
              {/* Area Gradient */}
              <linearGradient
                id={`${gradientId}-area`}
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={chartMetrics?.isPositive ? "#f97316" : "#ef4444"}
                  stopOpacity="0.8"
                />
                <stop
                  offset="20%"
                  stopColor={chartMetrics?.isPositive ? "#fb923c" : "#f87171"}
                  stopOpacity="0.6"
                />
                <stop
                  offset="50%"
                  stopColor={chartMetrics?.isPositive ? "#fdba74" : "#fca5a5"}
                  stopOpacity="0.4"
                />
                <stop
                  offset="80%"
                  stopColor={chartMetrics?.isPositive ? "#fed7aa" : "#fecaca"}
                  stopOpacity="0.2"
                />
                <stop
                  offset="100%"
                  stopColor={chartMetrics?.isPositive ? "#fff7ed" : "#fef2f2"}
                  stopOpacity="0.05"
                />
              </linearGradient>

              {/* Line Gradient */}
              <linearGradient
                id={`${gradientId}-line`}
                x1="0%"
                x2="100%"
                y1="0%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  stopColor={chartMetrics?.isPositive ? "#ea580c" : "#dc2626"}
                />
                <stop
                  offset="25%"
                  stopColor={chartMetrics?.isPositive ? "#f97316" : "#ef4444"}
                />
                <stop
                  offset="50%"
                  stopColor={chartMetrics?.isPositive ? "#fb923c" : "#f87171"}
                />
                <stop
                  offset="75%"
                  stopColor={chartMetrics?.isPositive ? "#fdba74" : "#fca5a5"}
                />
                <stop
                  offset="100%"
                  stopColor={chartMetrics?.isPositive ? "#fed7aa" : "#fecaca"}
                />
              </linearGradient>

              {/* Enhanced Filters */}
              <filter height="200%" id="glow" width="200%" x="-50%" y="-50%">
                <feGaussianBlur result="blur" stdDeviation="2" />
                <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1.5 0" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              <filter height="200%" id="shadow" width="200%" x="-50%" y="-50%">
                <feDropShadow
                  dx="0"
                  dy="4"
                  floodColor={chartMetrics?.isPositive ? "#f97316" : "#ef4444"}
                  floodOpacity="0.4"
                  stdDeviation="8"
                />
              </filter>
            </defs>

            {/* Background Grid */}
            {!isMobile && isDesktop && (
              <g opacity="0.08">
                {[16.67, 33.33, 50, 66.67, 83.33].map((y) => (
                  <line
                    key={y}
                    stroke="currentColor"
                    strokeDasharray="0.5,1"
                    strokeWidth="0.1"
                    x1="0"
                    x2="100"
                    y1={y}
                    y2={y}
                  />
                ))}
                {[20, 40, 60, 80].map((x) => (
                  <line
                    key={x}
                    stroke="currentColor"
                    strokeDasharray="0.3,1.5"
                    strokeWidth="0.05"
                    x1={x}
                    x2={x}
                    y1="0"
                    y2="100"
                  />
                ))}
              </g>
            )}

            {/* Area Fill */}
            {(chartMode === "area" || chartMode === "volume") && (
              <path
                d={areaPath}
                fill={`url(#${gradientId}-area)`}
                style={{ opacity: 1 }}
              />
            )}

            {/* Main Line Path */}
            <path
              d={linePath}
              fill="none"
              filter="url(#glow)"
              stroke={`url(#${gradientId}-line)`}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={isMobile ? "0.8" : isTablet ? "0.6" : "0.5"}
              style={{
                strokeDasharray: "1000",
                strokeDashoffset: "1000",
                animation: "draw-line 2s ease-in-out forwards",
              }}
            />

            {/* Data Points */}
            {chartConfig.points
              .filter(
                (_, i) =>
                  i %
                    Math.max(
                      1,
                      Math.ceil(
                        chartConfig.points.length / (isMobile ? 8 : 12),
                      ),
                    ) ===
                  0,
              )
              .map((point, i) => (
                <circle
                  key={i}
                  cx={point.x}
                  cy={point.y}
                  fill={chartMetrics?.isPositive ? "#f97316" : "#ef4444"}
                  filter="url(#shadow)"
                  opacity="0.8"
                  r={isMobile ? "0.4" : "0.3"}
                  style={{
                    animation: `fade-in 0.3s ease-in-out ${1 + i * 0.05}s forwards`,
                    opacity: 0,
                  }}
                />
              ))}

            {/* Enhanced Hover Indicator */}
            {hoverIndex !== null && chartConfig.points[hoverIndex] && (
              <g style={{ opacity: 1 }}>
                {/* Pulse rings */}
                {[2.5, 4, 5.5].map((radius, i) => (
                  <circle
                    key={i}
                    cx={chartConfig.points[hoverIndex].x}
                    cy={chartConfig.points[hoverIndex].y}
                    fill="none"
                    opacity={0.4 - i * 0.1}
                    r={radius}
                    stroke={chartMetrics?.isPositive ? "#f97316" : "#ef4444"}
                    strokeWidth="0.1"
                    style={{
                      animation: `pulse-ring 2s infinite ${i * 0.2}s`,
                    }}
                  />
                ))}

                {/* Center dot */}
                <circle
                  cx={chartConfig.points[hoverIndex].x}
                  cy={chartConfig.points[hoverIndex].y}
                  fill={chartMetrics?.isPositive ? "#f97316" : "#ef4444"}
                  filter="url(#shadow)"
                  r={isMobile ? "1.5" : "1.2"}
                />

                {/* Crosshair */}
                <g opacity="0.4">
                  <line
                    stroke={chartMetrics?.isPositive ? "#f97316" : "#ef4444"}
                    strokeDasharray="1,1"
                    strokeWidth="0.1"
                    x1={chartConfig.points[hoverIndex].x}
                    x2={chartConfig.points[hoverIndex].x}
                    y1="0"
                    y2="100"
                  />
                  <line
                    stroke={chartMetrics?.isPositive ? "#f97316" : "#ef4444"}
                    strokeDasharray="0.5,1"
                    strokeWidth="0.05"
                    x1="0"
                    x2="100"
                    y1={chartConfig.points[hoverIndex].y}
                    y2={chartConfig.points[hoverIndex].y}
                  />
                </g>
              </g>
            )}
          </svg>

          {/* Premium Tooltip */}
          {hoverIndex !== null && hoveredPointData && chartConfig && (
            <PremiumTooltip
              data={hoveredPointData}
              isMobile={isMobile}
              period={period}
              position={{
                x: chartConfig.points[hoverIndex].x,
                y: chartConfig.points[hoverIndex].y,
              }}
              showBalance={showBalance}
              theme={theme}
            />
          )}

          {/* Floating Action Panel */}
          {isPremiumUser && !isMobile && (
            <div className="absolute top-8 right-4 flex items-center gap-2 bg-background/90 backdrop-blur-xl rounded-xl p-2 border border-divider shadow-xl transition-all duration-200">
              <Tooltip content="Toggle fullscreen">
                <Button
                  isIconOnly
                  className="min-w-0 w-8 h-8 bg-white/10 hover:bg-white/20 border-none"
                  size="sm"
                  variant="flat"
                  onPress={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? (
                    <Minimize2 size={12} />
                  ) : (
                    <Maximize2 size={12} />
                  )}
                </Button>
              </Tooltip>

              <Tooltip content="Refresh data">
                <Button
                  isIconOnly
                  className="min-w-0 w-8 h-8 bg-gradient-to-r from-orange-500/20 to-pink-500/20 hover:from-orange-500/30 hover:to-pink-500/30 border-none"
                  isLoading={isRefreshing}
                  size="sm"
                  variant="flat"
                  onPress={handleRefresh}
                >
                  <RefreshCw size={12} />
                </Button>
              </Tooltip>

              {isPremiumUser && (
                <Tooltip content="AI Insights">
                  <Button
                    isIconOnly
                    className={`min-w-0 w-8 h-8 border-none transition-all duration-300 ${
                      showInsights
                        ? "bg-purple-500/30 text-purple-300"
                        : "bg-white/10 hover:bg-purple-500/20 text-white/60"
                    }`}
                    size="sm"
                    variant="flat"
                    onPress={() => setShowInsights(!showInsights)}
                  >
                    <Sparkles size={12} />
                  </Button>
                </Tooltip>
              )}

              <Tooltip
                content={`Switch to ${chartMode === "area" ? "line" : "area"} chart`}
              >
                <Button
                  isIconOnly
                  className="min-w-0 w-8 h-8 bg-white/10 hover:bg-white/20 border-none"
                  size="sm"
                  variant="flat"
                  onPress={() =>
                    setChartMode(chartMode === "area" ? "line" : "area")
                  }
                >
                  {chartMode === "area" ? (
                    <LineChart size={12} />
                  ) : (
                    <AreaChart size={12} />
                  )}
                </Button>
              </Tooltip>
            </div>
          )}

          {/* Performance Indicator */}
          {chartMetrics && (
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-background/90 backdrop-blur-xl rounded-md px-2 py-1 border border-divider/30">
              <div
                className={`w-2 h-2 rounded-full ${
                  chartMetrics.isPositive ? "bg-success-500" : "bg-danger-500"
                } shadow-lg animate-pulse`}
              />
              <span className="text-xs font-medium text-foreground">
                {chartMetrics.isPositive ? "Gaining" : "Declining"}
              </span>
              <span className="text-xs text-default-500 font-medium">
                {Math.abs(chartMetrics.percentage).toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        {/* AI Insights Panel (Premium) */}
        {showInsights && isPremiumUser && aiInsights.length > 0 && (
          <div className="px-4 sm:px-6 lg:px-8 py-4 transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
                  <Sparkles className="text-purple-400" size={16} />
                </div>
                <h3 className="font-semibold text-foreground">
                  AI Market Insights
                </h3>
                <Badge color="secondary" size="sm" variant="flat">
                  Beta
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {aiInsights.slice(0, 3).map((insight, index) => (
                  <AIInsightCard key={index} index={index} insight={insight} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Metrics Grid */}
        {isPremiumUser && chartMetrics && (
          <div className="px-4 sm:px-6 lg:px-8 py-4 border-t border-divider">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <BarChart3 className="text-primary-500" size={16} />
                  Portfolio Analytics
                </h3>
                {isPremiumUser && (
                  <div className="flex items-center gap-2">
                    <Badge color="warning" size="sm" variant="flat">
                      Premium
                    </Badge>
                    <Tooltip content="Advanced metrics available">
                      <Info className="text-foreground/40" size={14} />
                    </Tooltip>
                  </div>
                )}
              </div>

              <MetricsGrid
                isMobile={isMobile}
                isPremium={isPremiumUser}
                metrics={chartMetrics}
                performanceMetrics={performanceMetrics}
              />
            </div>
          </div>
        )}

        {/* Market Context Footer (Premium Pro) */}
        {isPremiumUser && chartMetrics && (
          <div className="px-4 sm:px-6 lg:px-8 py-4 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 border-t border-divider/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Market Sentiment */}
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardBody className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Activity className="text-blue-400" size={16} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">
                        Market Sentiment
                      </h4>
                      <p className="text-xs text-foreground/60">
                        Based on portfolio analysis
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-foreground/70">
                        Bullish Signals
                      </span>
                      <span className="text-xs font-medium text-success-500">
                        {chartMetrics.momentum && chartMetrics.momentum > 0
                          ? "68%"
                          : "32%"}
                      </span>
                    </div>
                    <Progress
                      className="w-full"
                      color={
                        chartMetrics.momentum && chartMetrics.momentum > 0
                          ? "success"
                          : "danger"
                      }
                      size="sm"
                      value={
                        chartMetrics.momentum && chartMetrics.momentum > 0
                          ? 68
                          : 32
                      }
                    />
                  </div>
                </CardBody>
              </Card>

              {/* Risk Assessment */}
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardBody className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Shield className="text-orange-400" size={16} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">
                        Risk Level
                      </h4>
                      <p className="text-xs text-foreground/60">
                        Volatility assessment
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-foreground/70">
                        Current Risk
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          chartMetrics.volatility < chartMetrics.current * 0.1
                            ? "text-success-500"
                            : chartMetrics.volatility <
                                chartMetrics.current * 0.2
                              ? "text-warning-500"
                              : "text-danger-500"
                        }`}
                      >
                        {chartMetrics.volatility < chartMetrics.current * 0.1
                          ? "Low"
                          : chartMetrics.volatility < chartMetrics.current * 0.2
                            ? "Medium"
                            : "High"}
                      </span>
                    </div>
                    <Progress
                      className="w-full"
                      color={
                        chartMetrics.volatility < chartMetrics.current * 0.1
                          ? "success"
                          : chartMetrics.volatility < chartMetrics.current * 0.2
                            ? "warning"
                            : "danger"
                      }
                      size="sm"
                      value={Math.min(
                        100,
                        (chartMetrics.volatility / chartMetrics.current) * 500,
                      )}
                    />
                  </div>
                </CardBody>
              </Card>

              {/* Next Action */}
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
                <CardBody className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Target className="text-purple-400" size={16} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">
                        Recommendation
                      </h4>
                      <p className="text-xs text-foreground/60">
                        AI-powered suggestion
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-foreground/80 leading-relaxed">
                      {chartMetrics.momentum && chartMetrics.momentum > 5
                        ? "Consider taking profits on recent gains while maintaining core positions."
                        : chartMetrics.momentum && chartMetrics.momentum < -5
                          ? "Dollar-cost averaging opportunity may be present at current levels."
                          : "Monitor for breakout signals above recent resistance levels."}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          chartMetrics.momentum && chartMetrics.momentum > 5
                            ? "bg-warning-500"
                            : chartMetrics.momentum &&
                                chartMetrics.momentum < -5
                              ? "bg-success-500"
                              : "bg-primary-500"
                        } animate-pulse`}
                      />
                      <span className="text-xs text-foreground/60">
                        Confidence:{" "}
                        {chartMetrics.rsi
                          ? Math.round(Math.abs(50 - chartMetrics.rsi) + 50)
                          : 75}
                        %
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        )}

        {/* Upgrade Prompt (Non-Premium) */}
        {!isPremiumUser && (variant === "premium" || variant === "pro") && (
          <div className="px-4 py-2 border-t border-divider">
            <Card className="bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/20 rounded-2xl px-2 py-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-lg">
                    <Crown className="text-orange-400" size={16} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">
                      Unlock Premium Analytics
                    </h4>
                    <p className="text-xs text-foreground/60">
                      Get AI insights, advanced metrics, and real-time alerts
                    </p>
                  </div>
                </div>
                <Button
                  className="bg-gradient-to-br from-orange-400/90 via-orange-600/90 to-pink-400/90 text-[11px] text-white shadow-md hover:shadow-lg"
                  endContent={<Crown size={12} />}
                  radius="md"
                  size="sm"
                  variant="faded"
                >
                  Upgrade Now
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Quick Actions Bar */}
        {variant === "pro" && (
          <div className="px-4 sm:px-6 lg:px-8 py-3 bg-background/50 backdrop-blur-sm border-t border-divider">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-foreground/60 font-medium">
                  Quick Actions:
                </span>
                <div className="flex items-center gap-1">
                  <Button className="h-7 px-2 text-xs" size="sm" variant="flat">
                    <Bell className="mr-1" size={10} />
                    Alerts
                  </Button>
                  <Button className="h-7 px-2 text-xs" size="sm" variant="flat">
                    <Settings className="mr-1" size={10} />
                    Settings
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-foreground/50">
                <span>
                  Last updated:{" "}
                  {new Date().toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
                <div className="w-1 h-1 bg-success-500 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes draw-line {
            to {
              stroke-dashoffset: 0;
            }
          }

          @keyframes fade-in {
            to {
              opacity: 0.8;
            }
          }

          @keyframes pulse-ring {
            0% {
              transform: scale(0.8);
              opacity: 0.4;
            }
            50% {
              transform: scale(1.2);
              opacity: 0.2;
            }
            100% {
              transform: scale(0.8);
              opacity: 0.4;
            }
          }
        `}</style>
      </div>
    );
  },
);

WalletPortfolioChart.displayName = "WalletPortfolioChart";

export default WalletPortfolioChart;

// ==================== EXPORTS ====================
export type {
  PortfolioChartProps,
  ChartPoint,
  ChartMetrics,
  TradingInsight,
  PerformanceMetric,
};

export {
  CHART_PERIODS,
  CHART_MODES,
  calculateAdvancedMetrics,
  formatCurrency,
  formatTime,
};
