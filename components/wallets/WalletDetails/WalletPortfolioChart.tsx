// components/Wallets/WalletPortfolioChart.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button, Spinner, Chip } from '@heroui/react';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Calendar, 
  Clock,
  Activity,
  Zap,
  Target,
  BarChart3,
  Maximize2,
  Minimize2,
  LineChart,
  AreaChart,
  
} from 'lucide-react';
import { HugeiconsAnalyticsUp } from '@/components/icons/icons';

// Define types
interface ChartPoint {
  timestamp: number;
  value: number;
}

interface PortfolioChartProps {
  walletAddress: string;
  chartData: ChartPoint[];
  initialPeriod?: 'day' | 'week' | 'month' | 'year' | 'max';
  showBalance?: boolean;
  compact?: boolean;
  height?: number;
  showControls?: boolean;
  className?: string;
  variant?: 'default' | 'minimal' | 'detailed';
}

const WalletPortfolioChart: React.FC<PortfolioChartProps> = ({ 
  walletAddress,
  chartData,
  initialPeriod = 'week',
  showBalance = true,
  compact = false,
  height,
  showControls = true,
  className = '',
  variant = 'default'
}) => {
  // States
  const [isLoading, setIsLoading] = useState(false);
  const [period, setPeriod] = useState(initialPeriod);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState<'live' | 'fallback'>('live');
  const [chartMode, setChartMode] = useState<'area' | 'line'>('area');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  // Responsive breakpoint detection
  useEffect(() => {
    const updateBreakpoints = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    
    updateBreakpoints();
    window.addEventListener('resize', updateBreakpoints);
    return () => window.removeEventListener('resize', updateBreakpoints);
  }, []);


  // Helper to determine time unit
  const getPeriodTimeUnit = () => {
    switch (period) {
      case 'day': return 3600000; // hour in ms
      case 'week': return 86400000; // day in ms
      case 'month': return 86400000; // day in ms
      case 'year': return 2592000000; // month in ms
      default: return 86400000;
    }
  };
  
  // Format timestamp based on period
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    
    switch (period) {
      case 'day':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case 'week':
        return date.toLocaleDateString([], { weekday: 'short' });
      case 'month':
        return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
      case 'year':
      case 'max':
        return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
      default:
        return date.toLocaleDateString();
    }
  };
  
  // Currency formatter with mobile optimization
  const formatCurrency = (value: number) => {
    if (!showBalance) return '••••••';
    
    if (isMobile) {
      if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `$${(value / 1000).toFixed(1)}K`;
      } else {
        return `$${value.toFixed(0)}`;
      }
    }
    
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  };
  
  // Calculate enhanced metrics
  const chartMetrics = useMemo(() => {
    if (!chartData || chartData.length < 2) return null;
    
    const values = chartData.map(p => p.value);
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const change = lastValue - firstValue;
    const percentage = (change / firstValue) * 100;
    const high = Math.max(...values);
    const low = Math.min(...values);
    const volatility = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - (values.reduce((a, b) => a + b) / values.length), 2), 0) / values.length);
    
    return {
      current: lastValue,
      change,
      percentage,
      isPositive: percentage >= 0,
      high,
      low,
      volatility,
      range: high - low,
      rangePercent: ((high - low) / low) * 100
    };
  }, [chartData]);
  
  // Get data for hovered point
  const hoveredPointData = useMemo(() => {
    if (hoverIndex === null || !chartData[hoverIndex]) return null;
    
    const point = chartData[hoverIndex];
    const firstValue = chartData[0].value;
    const pointChange = ((point.value - firstValue) / firstValue) * 100;
    
    return {
      value: point.value,
      timestamp: point.timestamp,
      change: pointChange,
      isPositive: pointChange >= 0
    };
  }, [hoverIndex, chartData]);
  
  // Chart configuration
  const chartConfig = useMemo(() => {
    if (!chartData || chartData.length === 0) return null;
    
    // Get min/max values with padding
    const values = chartData.map(point => point.value);
    const minValue = Math.min(...values) * 0.95;
    const maxValue = Math.max(...values) * 1.05;
    const valueRange = maxValue - minValue;
    
    // Calculate normalized points for SVG
    const points = chartData.map((point, index) => {
      const x = (index / (chartData.length - 1)) * 100;
      const y = 100 - ((point.value - minValue) / valueRange) * 100;
      
      return { x, y, ...point };
    });
    
    return {
      points,
      minValue,
      maxValue,
      valueRange
    };
  }, [chartData]);

  // Generate smooth curve path
  const generatePath = useMemo(() => {
    if (!chartConfig || chartConfig.points.length < 2) return '';
    
    let path = `M ${chartConfig.points[0].x},${chartConfig.points[0].y}`;
    
    // Create smooth curve with cubic bezier
    for (let i = 1; i < chartConfig.points.length; i++) {
      const currentPoint = chartConfig.points[i];
      const prevPoint = chartConfig.points[i - 1];
      
      // Calculate control points for smooth curve
      const cp1x = prevPoint.x + (currentPoint.x - prevPoint.x) / 3;
      const cp2x = prevPoint.x + 2 * (currentPoint.x - prevPoint.x) / 3;
      
      path += ` C ${cp1x},${prevPoint.y} ${cp2x},${currentPoint.y} ${currentPoint.x},${currentPoint.y}`;
    }
    
    return path;
  }, [chartConfig]);
  
  // Generate area under curve
  const generateAreaPath = useMemo(() => {
    if (!chartConfig || !generatePath || chartConfig.points.length < 2) return '';
    
    const linePath = generatePath;
    const lastPoint = chartConfig.points[chartConfig.points.length - 1];
    const firstPoint = chartConfig.points[0];
    
    return `${linePath} L ${lastPoint.x},100 L ${firstPoint.x},100 Z`;
  }, [chartConfig, generatePath]);
  
  // Enhanced touch handling for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  }, []);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!chartConfig || isLoading || !touchStart) return;
    
    const touch = e.touches[0];
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const svgWidth = rect.width;
    
    const index = Math.round((touchX / svgWidth) * (chartData.length - 1));
    const boundedIndex = Math.max(0, Math.min(index, chartData.length - 1));
    
    setHoverIndex(boundedIndex);
    
    // Prevent scrolling while interacting with chart
    e.preventDefault();
  }, [chartConfig, isLoading, chartData.length, touchStart]);
  
  const handleTouchEnd = useCallback(() => {
    setTouchStart(null);
    // Keep hover state for a moment on mobile
    setTimeout(() => setHoverIndex(null), 2000);
  }, []);
  
  // Handle mouse interactions
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!chartConfig || isLoading) return;
    
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const svgWidth = rect.width;
    
    const index = Math.round((mouseX / svgWidth) * (chartData.length - 1));
    const boundedIndex = Math.max(0, Math.min(index, chartData.length - 1));
    
    setHoverIndex(boundedIndex);
  }, [chartConfig, isLoading, chartData.length]);
  
  const handleMouseLeave = useCallback(() => {
    if (!isMobile && !isTablet) {
      setHoverIndex(null);
    }
  }, [isMobile, isTablet]);
  
  // Handle refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    const currentPeriod = period;
    setPeriod('day');
    setTimeout(() => setPeriod(currentPeriod), 100);
  }, [period]);
  
  // Period options with modern styling
  const periodOptions = [
    { key: 'day', label: '1D', fullLabel: '24 Hours', color: 'from-blue-400 to-cyan-400' },
    { key: 'week', label: '7D', fullLabel: '1 Week', color: 'from-green-400 to-emerald-400' },
    { key: 'month', label: '1M', fullLabel: '1 Month', color: 'from-yellow-400 to-orange-400' },
    { key: 'year', label: '1Y', fullLabel: '1 Year', color: 'from-purple-400 to-pink-400' },
    { key: 'max', label: 'ALL', fullLabel: 'All Time', color: 'from-red-400 to-rose-400' }
  ];
  
  // Dynamic height calculation
  const chartHeight = useMemo(() => {
    if (height) return height;
    if (isFullscreen) return window.innerHeight - 200;
    if (isMobile) return compact ? 200 : 280;
    if (isTablet) return compact ? 240 : 320;
    return compact ? 260 : variant === 'detailed' ? 400 : 380;
  }, [height, isFullscreen, isMobile, isTablet, compact, variant]);
  
  // Loading state with modern glass effect
  if (isLoading) {
    return (
      <div 
        className={`relative w-full overflow-hidden rounded-xl lg:rounded-2xl bg-white/5 backdrop-blur-sm  ${className} animate-in fade-in-0 duration-100`}
        style={{ height: `${chartHeight}px` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-pink-500/5" />
        <div className="relative flex flex-col items-center justify-center h-full gap-4">
          <div className="flex flex-col items-center gap-4 animate-in fade-in-0 zoom-in-95 duration-700 delay-150">
            <div className="relative">
              <Spinner 
                size={isMobile ? "md" : "lg"} 
                color="primary"
                classNames={{
                  circle1: "border-b-orange-500",
                  circle2: "border-b-pink-500",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-full blur-xl animate-pulse" />
            </div>
            <p className="text-xs sm:text-sm text-white/60 font-medium">Loading portfolio data...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // No data state
  if (!chartConfig || chartData.length === 0) {
    return (
      <div 
        className={`relative w-full overflow-hidden rounded-xl lg:rounded-2xl ${className} animate-in fade-in-0 duration-100`}
        style={{ height: `${chartHeight}px` }}
      >
     
        <div className="relative flex flex-col items-center justify-center h-full gap-4">
          <div className="p-4 rounded-3xl bg-white/10 backdrop-blur-sm animate-in zoom-in-95 duration-100">
            <HugeiconsAnalyticsUp className="w-8 h-8 sm:w-12 sm:h-12 text-white/40" />
          </div>
          <div className="text-center animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ">
            <p className="text-sm sm:text-base text-white/60 mb-3 font-medium">No chart data available</p>
            <Button 
              size="sm"
              variant="flat"
              color="primary"
              startContent={<RefreshCw size={14} />}
              onPress={handleRefresh}
              className="bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-white/20 backdrop-blur-sm rounded-xl text-xs"
            >
              Refresh Data
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`relative w-full flex flex-col ${className} animate-in fade-in-0 duration-200`}>
      {/* Header Section - Modern Glass Design */}
      {!compact && variant !== 'minimal' && (
        <div className="px-4 sm:px-6 lg:px-8 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 animate-in fade-in-0 slide-in-from-top-4 duration-500">
            <div key={hoveredPointData ? `hover-${hoverIndex}` : 'default'} className="flex flex-col transition-all duration-300">
              {/* Value Display */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white via-orange-200 to-pink-200 bg-clip-text text-transparent">
                  {formatCurrency(hoveredPointData ? hoveredPointData.value : chartMetrics?.current || 0)}
                </span>
                
                <Chip
                  size="sm"
                  variant="flat"
                  color={(hoveredPointData ? hoveredPointData.isPositive : chartMetrics?.isPositive) ? "success" : "danger"}
                  startContent={
                    (hoveredPointData ? hoveredPointData.isPositive : chartMetrics?.isPositive) 
                      ? <TrendingUp size={12} /> 
                      : <TrendingDown size={12} />
                  }
                  className="text-xs font-medium bg-white/10 backdrop-blur-sm border border-white/20"
                >
                  {((hoveredPointData ? hoveredPointData.change : chartMetrics?.percentage) || 0).toFixed(2)}%
                </Chip>
                
                {dataSource === 'fallback' && (
                  <Chip 
                    size="sm" 
                    variant="flat" 
                    color="warning" 
                    className="text-[10px] h-6 bg-amber-500/20 border border-amber-500/30"
                  >
                    Demo Data
                  </Chip>
                )}
              </div>
              
              {/* Timestamp/Period Info */}
              <div className="flex items-center gap-4 text-xs text-white/60">
                <div className="flex items-center gap-1">
                  <Calendar size={10} />
                  <span>
                    {hoveredPointData ? 
                      formatTime(hoveredPointData.timestamp) : 
                      `${period.toUpperCase()} Period • ${formatCurrency(Math.abs(chartMetrics?.change || 0))} Change`
                    }
                  </span>
                </div>
                {!isMobile && (
                  <div className="flex items-center gap-1">
                    <Clock size={10} />
                    <span>Updated {lastUpdated?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Controls */}
            {showControls && (
              <div className="flex items-center gap-2 animate-in fade-in-0 slide-in-from-right-4 duration-500 delay-200">
                {!isMobile && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    className="min-w-0 w-8 h-8 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm transition-all duration-200 hover:scale-105"
                    onPress={() => setIsFullscreen(!isFullscreen)}
                  >
                    {isFullscreen ? <Minimize2 size={12} className="text-white/60" /> : <Maximize2 size={12} className="text-white/60" />}
                  </Button>
                )}
                
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  onPress={handleRefresh}
                  isLoading={isRefreshing}
                  className="min-w-0 w-8 h-8 bg-gradient-to-r from-orange-500/20 to-pink-500/20 hover:from-orange-500/30 hover:to-pink-500/30 border border-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105"
                >
                  <RefreshCw size={12} className="text-orange-300" />
                </Button>
                
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  className="min-w-0 w-8 h-8 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm transition-all duration-200 hover:scale-105"
                  onPress={() => setChartMode(chartMode === 'area' ? 'line' : 'area')}
                >
                  {chartMode === 'area' ? 
                    <LineChart size={12} className="text-white/60" /> : 
                    <AreaChart size={12} className="text-white/60" />
                  }
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Period Selector - Modern Pill Design */}
      {showControls && variant !== 'minimal' && (
        <div className="flex justify-center px-4 sm:px-6 lg:px-8 pb-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-100">
          <div className="flex bg-white/5 backdrop-blur-sm rounded-2xl p-1 border border-white/10 gap-1">
            {periodOptions.map(({ key, label, color }) => (
              <div key={key} className="transition-transform duration-200 hover:scale-105 active:scale-95">
                <Button
                  size="sm"
                  variant={period === key ? "solid" : "light"}
                  className={`min-w-0 px-3 sm:px-4 text-xs font-semibold rounded-xl transition-all duration-300 ${
                    period === key 
                      ? `bg-gradient-to-r ${color} text-white shadow-lg scale-105` 
                      : "text-white/70 hover:text-white hover:bg-white/10 scale-100"
                  }`}
                  onPress={() => setPeriod(key as any)}
                >
                  {label}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Chart Container */}
      <div className="flex-1 relative animate-in fade-in-0 zoom-in-95 duration-200 delay-100 ">
        <svg
          viewBox="0 0 100 100"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          className="cursor-crosshair drop-shadow-lg touch-none rounded-b-2xl"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ height: `${chartHeight}px` }}
        >
          {/* Enhanced Gradient Definitions */}
          <defs>
            <linearGradient id={`areaGradient-${walletAddress}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartMetrics?.isPositive ? "#f97316" : "#ef4444"} stopOpacity="0.6" />
              <stop offset="30%" stopColor={chartMetrics?.isPositive ? "#fb923c" : "#f87171"} stopOpacity="0.4" />
              <stop offset="70%" stopColor={chartMetrics?.isPositive ? "#fdba74" : "#fca5a5"} stopOpacity="0.2" />
              <stop offset="100%" stopColor={chartMetrics?.isPositive ? "#fed7aa" : "#fecaca"} stopOpacity="0.05" />
            </linearGradient>
            
            <linearGradient id={`lineGradient-${walletAddress}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={chartMetrics?.isPositive ? "#ea580c" : "#dc2626"} />
              <stop offset="25%" stopColor={chartMetrics?.isPositive ? "#f97316" : "#ef4444"} />
              <stop offset="50%" stopColor={chartMetrics?.isPositive ? "#fb923c" : "#f87171"} />
              <stop offset="75%" stopColor={chartMetrics?.isPositive ? "#fdba74" : "#fca5a5"} />
              <stop offset="100%" stopColor={chartMetrics?.isPositive ? "#fed7aa" : "#fecaca"} />
            </linearGradient>
            
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={chartMetrics?.isPositive ? "#f97316" : "#ef4444"} floodOpacity="0.3"/>
            </filter>
          </defs>
          
          {/* Subtle Grid Lines */}
          {!isMobile && (
            <g opacity="0.1">
              {[20, 40, 60, 80].map(y => (
                <line 
                  key={y} 
                  x1="0" 
                  y1={y} 
                  x2="100" 
                  y2={y} 
                  stroke="white" 
                  strokeWidth="0.1" 
                  strokeDasharray="1,2" 
                />
              ))}
            </g>
          )}
          
          {/* Area Fill (only if chartMode is 'area') */}
          {chartMode === 'area' && (
            <path
              d={generateAreaPath}
              fill={`url(#areaGradient-${walletAddress})`}
              className="transition-all duration-500 animate-in fade-in-0 duration-1200 delay-600"
              style={{
                animation: 'drawArea 1.2s ease-out 0.6s both'
              }}
            />
          )}
          
          {/* Main Line Path */}
          <path
            d={generatePath}
            fill="none"
            stroke={`url(#lineGradient-${walletAddress})`}
            strokeWidth={isMobile ? "0.6" : isTablet ? "0.5" : "0.4"}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            className="transition-all duration-500"
            style={{
              strokeDasharray: chartConfig ? chartConfig.points.length * 2 : 0,
              strokeDashoffset: chartConfig ? chartConfig.points.length * 2 : 0,
              animation: 'drawLine 1.8s ease-in-out 0.5s both'
            }}
          />
          
          {/* Data Points for mobile/tablet */}
          {(isMobile || isTablet) && chartConfig.points
            .filter((_, i) => i % Math.ceil(chartConfig.points.length / (isMobile ? 6 : 10)) === 0)
            .map((point, i) => (
              <circle
                key={i}
                cx={point.x}
                cy={point.y}
                r="0.5"
                fill={chartMetrics?.isPositive ? "#f97316" : "#ef4444"}
                opacity="0.6"
                className="animate-in zoom-in-0 duration-300"
                style={{ animationDelay: `${0.8 + i * 0.1}s` }}
              />
            ))}
          
          {/* Hover Indicator */}
          {hoverIndex !== null && chartConfig.points[hoverIndex] && (
            <g className="animate-in zoom-in-0 duration-200">
              {/* Outer ring */}
              <circle
                cx={chartConfig.points[hoverIndex].x}
                cy={chartConfig.points[hoverIndex].y}
                r={isMobile ? "2" : "1.5"}
                fill="none"
                stroke={chartMetrics?.isPositive ? "#f97316" : "#ef4444"}
                strokeWidth="0.1"
                opacity="0.6"
                className="animate-pulse"
              />
              
              {/* Inner dot */}
              <circle
                cx={chartConfig.points[hoverIndex].x}
                cy={chartConfig.points[hoverIndex].y}
                r={isMobile ? "1.2" : "0.8"}
                fill={chartMetrics?.isPositive ? "#f97316" : "#ef4444"}
                className="drop-shadow-sm"
              />
              
              {/* Vertical line */}
              <line
                x1={chartConfig.points[hoverIndex].x}
                y1="0"
                x2={chartConfig.points[hoverIndex].x}
                y2="100"
                stroke={chartMetrics?.isPositive ? "#f97316" : "#ef4444"}
                strokeWidth="0.05"
                opacity="0.3"
                strokeDasharray="0.5,0.5"
              />
            </g>
          )}
          
          {/* Interactive overlay */}
          <rect 
            x="0" 
            y="0" 
            width="100" 
            height="100" 
            fill="transparent" 
            className='rounded-b-2xl'
          />
        </svg>
        
        {/* Enhanced Mobile Tooltip */}
        {hoverIndex !== null && hoveredPointData && (
          <div 
            className={`absolute bg-background backdrop-blur-md rounded-lg shadow-xl border border-divider px-2.5 py-1 z-50 pointer-events-none transition-all duration-75 animate-in fade-in-0 zoom-in-95 ${
              isMobile ? 'text-xs' : 'text-sm'
            }`}
            style={{
              left: `${Math.min(Math.max(chartConfig.points[hoverIndex].x, 10), 90)}%`,
              top: `${chartConfig.points[hoverIndex].y < 30 ? chartConfig.points[hoverIndex].y + 15 : chartConfig.points[hoverIndex].y - 15}%`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="flex items-center gap-1 mb-1">
              <span className={`font-semibold ${isMobile ? 'text-xs' : 'text-sm'} `}>
                {formatCurrency(hoveredPointData.value)}
              </span>
              <Chip
                size="sm"
                variant="flat"
                color={hoveredPointData.isPositive ? "success" : "danger"}
                className={`${isMobile ? 'text-[9px] h-4' : 'text-[10px] h-5'} rounded-md bg-white/10 border border-white/20
                ${hoveredPointData.isPositive ? 'bg-lime-600/30' : 'bg-pink-600/30'}
                `}
              >
                {hoveredPointData.isPositive ? '+' : ''}{hoveredPointData.change.toFixed(2)}%
              </Chip>
            </div>
            <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-foreground/60">
              <Calendar size={8} />
              <span>{formatTime(hoveredPointData.timestamp)}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Enhanced Metrics Footer (for detailed variant) - Mobile Responsive */}
      {variant === 'detailed' && chartMetrics && (
        <div className="flex-shrink-0 px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 border-t border-white/10 mt-2 sm:mt-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-600">
          {[
            { icon: Target, label: 'High', value: formatCurrency(chartMetrics.high), color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
            { icon: Target, label: 'Low', value: formatCurrency(chartMetrics.low), color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
            { icon: Zap, label: 'Range', value: `${chartMetrics.rangePercent.toFixed(1)}%`, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
            { icon: Activity, label: 'Volatility', value: formatCurrency(chartMetrics.volatility), color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' }
          ].map((metric, index) => (
            <div 
              key={metric.label}
              className={`text-center backdrop-blur-sm rounded-lg p-2 sm:p-3 border transition-all duration-300 hover:scale-105 ${metric.bg} animate-in fade-in-0 zoom-in-95 duration-500`}
              style={{ animationDelay: `${0.7 + index * 0.1}s` }}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <metric.icon size={10} className={metric.color} />
                <span className="text-[9px] sm:text-xs text-white/60">{metric.label}</span>
              </div>
              <p className={`font-semibold text-xs sm:text-sm ${metric.color}`}>{metric.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes drawLine {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes drawArea {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-in {
          animation-fill-mode: both;
        }
        
        .fade-in-0 {
          animation-name: fadeIn;
        }
        
        .zoom-in-95 {
          animation-name: zoomIn95;
        }
        
        .slide-in-from-top-4 {
          animation-name: slideInFromTop4;
        }
        
        .slide-in-from-right-4 {
          animation-name: slideInFromRight4;
        }
        
        .slide-in-from-bottom-4 {
          animation-name: slideInFromBottom4;
        }
        
        .duration-200 {
          animation-duration: 200ms;
        }
        
        .duration-300 {
          animation-duration: 300ms;
        }
        
        .duration-500 {
          animation-duration: 500ms;
        }
        
        .duration-700 {
          animation-duration: 700ms;
        }
        
        .duration-1200 {
          animation-duration: 1200ms;
        }
        
        .delay-100 {
          animation-delay: 100ms;
        }
        
        .delay-150 {
          animation-delay: 150ms;
        }
        
        .delay-200 {
          animation-delay: 200ms;
        }
        
        .delay-300 {
          animation-delay: 300ms;
        }
        
        .delay-600 {
          animation-delay: 600ms;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes zoomIn95 {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slideInFromTop4 {
          from {
            opacity: 0;
            transform: translateY(-1rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInFromRight4 {
          from {
            opacity: 0;
            transform: translateX(1rem);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInFromBottom4 {
          from {
            opacity: 0;
            transform: translateY(1rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default WalletPortfolioChart;