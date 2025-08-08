import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Progress } from "@heroui/progress";
import { Divider } from "@heroui/divider";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Crown,
  Zap,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Shield,
  Star,
  Award,
  Bell,
  Flame,
  ChevronRight,
  Users,
  BarChart3,
  Wallet,
  Activity,
  Target,
  Rocket,
  Diamond,
  Heart,
  PieChart,
  ArrowUp,
  Settings,
} from "lucide-react";

import { LogoLoader } from "../icons";

// Enhanced Types with More Creativity
type ToastVariant =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "loading"
  | "premium"
  | "achievement"
  | "milestone"
  | "social"
  | "system";
type ToastPosition =
  | "top-right"
  | "top-left"
  | "top-center"
  | "bottom-right"
  | "bottom-left"
  | "bottom-center";
type ToastAnimation =
  | "slide"
  | "fade"
  | "bounce"
  | "glow"
  | "scale"
  | "flip"
  | "elastic"
  | "pulse";
type ToastPriority = "low" | "medium" | "high" | "urgent";
type ToastCategory =
  | "wallet"
  | "analytics"
  | "premium"
  | "social"
  | "system"
  | "achievement"
  | "financial"
  | "security";

interface ToastAction {
  label: string;
  handler: () => void;
  variant?:
    | "primary"
    | "secondary"
    | "ghost"
    | "danger"
    | "success"
    | "warning";
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
}

interface ToastReaction {
  emoji: string;
  label: string;
  handler: () => void;
}

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  category?: ToastCategory;
  priority?: ToastPriority;
  position?: ToastPosition;
  duration?: number;
  persistent?: boolean;
  dismissible?: boolean;
  animation?: ToastAnimation;
  actions?: ToastAction[];
  reactions?: ToastReaction[];
  avatar?: string;
  image?: string;
  icon?: React.ReactNode;
  progress?: number;
  value?: string | number;
  trend?: "up" | "down" | "neutral";
  timestamp?: boolean;
  sound?: boolean;
  vibrate?: boolean;
  expandable?: boolean;
  metadata?: Record<string, any>;
  createdAt: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id" | "createdAt">) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, updates: Partial<Toast>) => void;
  clearAll: () => void;
  dismissAll: () => void;
  clearByCategory: (category: ToastCategory) => void;
  getToastsByCategory: (category: ToastCategory) => Toast[];
}

// Enhanced Toast Context
const ToastContext = createContext<ToastContextValue | null>(null);

// Creative Toast Hook with Advanced Features
export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return {
    ...context,

    // Basic toast methods with enhanced styling
    success: (
      title: string,
      options?: Partial<Omit<Toast, "id" | "createdAt" | "variant" | "title">>,
    ) =>
      context.addToast({
        title,
        variant: "success",
        category: "system",
        animation: "scale",
        icon: <CheckCircle className="w-4 h-4" />,
        ...options,
      }),

    error: (
      title: string,
      options?: Partial<Omit<Toast, "id" | "createdAt" | "variant" | "title">>,
    ) =>
      context.addToast({
        title,
        variant: "error",
        category: "system",
        priority: "high",
        animation: "bounce",
        sound: true,
        vibrate: true,
        icon: <XCircle className="w-4 h-4" />,
        ...options,
      }),

    warning: (
      title: string,
      options?: Partial<Omit<Toast, "id" | "createdAt" | "variant" | "title">>,
    ) =>
      context.addToast({
        title,
        variant: "warning",
        category: "system",
        priority: "medium",
        animation: "pulse",
        icon: <AlertTriangle className="w-4 h-4" />,
        ...options,
      }),

    info: (
      title: string,
      options?: Partial<Omit<Toast, "id" | "createdAt" | "variant" | "title">>,
    ) =>
      context.addToast({
        title,
        variant: "info",
        category: "system",
        animation: "slide",
        icon: <Info className="w-4 h-4" />,
        ...options,
      }),

    loading: (
      title: string,
      options?: Partial<Omit<Toast, "id" | "createdAt" | "variant" | "title">>,
    ) =>
      context.addToast({
        title,
        variant: "loading",
        category: "system",
        duration: 0,
        persistent: true,
        animation: "fade",
        icon: <LogoLoader className="w-4 h-4 " />,
        ...options,
      }),

    // Premium & Achievement Toasts with Spectacular Effects
    achievement: (
      title: string,
      rarity: "common" | "rare" | "epic" | "legendary" = "common",
      options?: any,
    ) => {
      const rarityConfig = {
        common: {
          animation: "scale" as const,
          icon: <Star className="w-4 h-4" />,
          duration: 5000,
          reactions: [
            {
              emoji: "👍",
              label: "Nice!",
              handler: () => console.log("Nice reaction"),
            },
            {
              emoji: "🎉",
              label: "Awesome!",
              handler: () => console.log("Awesome reaction"),
            },
          ],
        },
        rare: {
          animation: "bounce" as const,
          icon: <Award className="w-4 h-4" />,
          duration: 7000,
          sound: true,
          reactions: [
            {
              emoji: "🔥",
              label: "Fire!",
              handler: () => console.log("Fire reaction"),
            },
            {
              emoji: "💎",
              label: "Gem!",
              handler: () => console.log("Gem reaction"),
            },
          ],
        },
        epic: {
          animation: "glow" as const,
          icon: <Crown className="w-4 h-4" />,
          duration: 10000,
          sound: true,
          vibrate: true,
          reactions: [
            {
              emoji: "🚀",
              label: "Epic!",
              handler: () => console.log("Epic reaction"),
            },
            {
              emoji: "⚡",
              label: "Amazing!",
              handler: () => console.log("Amazing reaction"),
            },
          ],
        },
        legendary: {
          animation: "elastic" as const,
          icon: <Diamond className="w-4 h-4" />,
          duration: 15000,
          sound: true,
          vibrate: true,
          priority: "urgent" as const,
          reactions: [
            {
              emoji: "🏆",
              label: "Legendary!",
              handler: () => console.log("Legendary reaction"),
            },
            {
              emoji: "👑",
              label: "King!",
              handler: () => console.log("King reaction"),
            },
            {
              emoji: "🎆",
              label: "Spectacular!",
              handler: () => console.log("Spectacular reaction"),
            },
          ],
        },
      };

      const config = rarityConfig[rarity];

      return context.addToast({
        variant: "achievement",
        title: `🏆 ${title}`,
        category: "achievement",
        animation: config.animation,
        icon: config.icon,
        duration: config.duration,
        sound: config.sound,
        vibrate: config.vibrate,
        priority: config.priority || "medium",
        reactions: config.reactions,
        metadata: { rarity, unlocked: new Date().toISOString() },
        ...options,
      });
    },

    // Wallet & Financial Toasts with Rich Data
    walletConnected: (
      walletName: string,
      address: string,
      balance?: string,
    ) => {
      return context.addToast({
        variant: "success",
        title: `${walletName} Connected`,
        description: `${address.slice(0, 6)}...${address.slice(-4)}${balance ? ` • ${balance}` : ""}`,
        category: "wallet",
        animation: "slide",
        icon: <Wallet className="w-4 h-4" />,
        duration: 6000,
        actions: [
          {
            label: "View Portfolio",
            handler: () => (window.location.href = "/wallets"),
            variant: "ghost",
            icon: <ExternalLink className="w-3 h-3" />,
          },
        ],
      });
    },

    portfolioUpdate: (change: number, totalValue: string, assets: number) => {
      const isPositive = change >= 0;

      return context.addToast({
        variant: isPositive ? "success" : "warning",
        title: "Portfolio Updated",
        description: `${isPositive ? "+" : ""}${change.toFixed(2)}% • ${totalValue} across ${assets} assets`,
        category: "financial",
        animation: "scale",
        trend: isPositive ? "up" : "down",
        icon: isPositive ? (
          <TrendingUp className="w-4 h-4" />
        ) : (
          <BarChart3 className="w-4 h-4" />
        ),
        value: totalValue,
        duration: 8000,
        actions: [
          {
            label: "View Analytics",
            handler: () => (window.location.href = "/analytics"),
            variant: "ghost",
            icon: <PieChart className="w-3 h-3" />,
          },
        ],
      });
    },

    premiumUnlocked: (feature: string, tier: "pro" | "enterprise" = "pro") => {
      return context.addToast({
        variant: "premium",
        title: `${tier === "pro" ? "⭐" : "💎"} Premium Feature Unlocked!`,
        description: `You now have access to ${feature}`,
        category: "premium",
        animation: "glow",
        priority: "high",
        sound: true,
        icon: <Crown className="w-4 h-4" />,
        duration: 12000,
        reactions: [
          {
            emoji: "🎉",
            label: "Celebrate!",
            handler: () => console.log("Celebrated"),
          },
          {
            emoji: "🚀",
            label: "Explore!",
            handler: () => console.log("Exploring"),
          },
        ],
        actions: [
          {
            label: `Explore ${tier.toUpperCase()}`,
            handler: () => (window.location.href = "/premium"),
            variant: "primary",
            icon: <Sparkles className="w-3 h-3" />,
          },
        ],
      });
    },

    // Social & Community Toasts
    socialActivity: (
      type: "follow" | "share" | "like" | "comment",
      user: string,
      avatar?: string,
    ) => {
      const socialConfig = {
        follow: {
          icon: <Users className="w-4 h-4" />,
          message: "started following you",
        },
        share: {
          icon: <ExternalLink className="w-4 h-4" />,
          message: "shared your portfolio",
        },
        like: {
          icon: <Heart className="w-4 h-4" />,
          message: "liked your analysis",
        },
        comment: {
          icon: <Bell className="w-4 h-4" />,
          message: "commented on your post",
        },
      };

      const config = socialConfig[type];

      return context.addToast({
        variant: "social",
        title: `${user} ${config.message}`,
        category: "social",
        animation: "slide",
        icon: config.icon,
        avatar,
        duration: 7000,
        actions: [
          {
            label: "View Activity",
            handler: () => (window.location.href = "/social"),
            variant: "ghost",
            icon: <ChevronRight className="w-3 h-3" />,
          },
        ],
      });
    },

    // System & Security Toasts
    securityAlert: (
      message: string,
      severity: "low" | "medium" | "high" | "critical" = "medium",
    ) => {
      const severityConfig = {
        low: { priority: "low" as const, duration: 5000 },
        medium: { priority: "medium" as const, duration: 8000 },
        high: { priority: "high" as const, duration: 12000, sound: true },
        critical: {
          priority: "urgent" as const,
          duration: 0,
          sound: true,
          vibrate: true,
          persistent: true,
        },
      };

      const config = severityConfig[severity];

      return context.addToast({
        variant: "error",
        title: "🔒 Security Alert",
        description: message,
        category: "security",
        animation: "bounce",
        icon: <Shield className="w-4 h-4" />,
        priority: config.priority,
        duration: config.duration,
        sound: config.sound,
        vibrate: config.vibrate,
        persistent: config.persistent,
        actions: [
          {
            label: "Review Security",
            handler: () => (window.location.href = "/security"),
            variant: "danger",
            icon: <Shield className="w-3 h-3" />,
          },
        ],
      });
    },

    // Milestone & Progress Toasts
    milestone: (
      title: string,
      description: string,
      progress: number,
      target: string,
    ) => {
      return context.addToast({
        variant: "milestone",
        title: `🎯 ${title}`,
        description,
        category: "achievement",
        animation: "elastic",
        icon: <Target className="w-4 h-4" />,
        progress,
        value: target,
        duration: 10000,
        sound: true,
        expandable: true,
        reactions: [
          {
            emoji: "🎊",
            label: "Celebrate",
            handler: () => console.log("Celebrated milestone"),
          },
          {
            emoji: "💪",
            label: "Keep Going",
            handler: () => console.log("Motivated"),
          },
        ],
        actions: [
          {
            label: "View Progress",
            handler: () => (window.location.href = "/progress"),
            variant: "primary",
            icon: <BarChart3 className="w-3 h-3" />,
          },
        ],
      });
    },
  };
};

// Enhanced Toast Item with Creative Styling
const ToastItem: React.FC<{
  toast: Toast;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Toast>) => void;
}> = ({ toast, onRemove, onUpdate }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), 50);

    // Play sound effect if enabled
    if (toast.sound && "Audio" in window) {
      try {
        const audio = new Audio(`/sounds/toast-${toast.variant}.mp3`);

        audio.volume = 0.3;
        audio.play().catch(() => {}); // Ignore errors
      } catch {}
    }

    // Vibrate if enabled and supported
    if (toast.vibrate && "vibrate" in navigator) {
      navigator.vibrate(100);
    }

    if (!toast.persistent && toast.duration !== 0) {
      timeoutRef.current = setTimeout(() => {
        handleDismiss();
      }, toast.duration || 5000);
    }

    return () => {
      clearTimeout(showTimer);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleDismiss = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  }, [toast.id, onRemove]);

  const getVariantConfig = () => {
    switch (toast.variant) {
      case "success":
        return {
          chipColor: "success" as const,
          borderColor: "border-success-100 dark:border-success-100",
          bgClass: "bg-gradient-to-br from-success-50 to-lime-500/20 ",
          glowClass: "shadow-success-500/30 dark:shadow-success-800/20",
          textColor: "text-success-600 dark:text-success-400",
        };
      case "error":
        return {
          chipColor: "danger" as const,
          borderColor: "border-danger-200 dark:border-danger-500",
          bgClass: "bg-gradient-to-br from-danger-50 to-danger-500/20 ",
          glowClass: "shadow-danger-200/30 dark:shadow-danger-800/20",
          textColor: "text-danger-600",
        };
      case "warning":
        return {
          chipColor: "warning" as const,
          borderColor: "border-warning-200 dark:border-warning-800",
          bgClass: "bg-gradient-to-br from-warning-50 to-warning-500/20 ",
          glowClass: "shadow-warning-200/30 dark:shadow-warning-800/20",
          textColor: "text-warning-600 dark:text-warning-400",
        };
      case "info":
        return {
          chipColor: "primary" as const,
          borderColor: "border-primary-200 dark:border-primary-800",
          bgClass: "bg-gradient-to-br from-blue-600/15 to-blue-500/20 ",
          glowClass: "shadow-blue-200/30 dark:shadow-blue-800/20",
          textColor: "text-blue-600 dark:text-blue-400",
        };
      case "loading":
        return {
          chipColor: "default" as const,
          borderColor: "border-divider",
          bgClass: "bg-gradient-to-br from-default-200 ",
          glowClass: "shadow-default-200/30 dark:shadow-default-800/20",
          textColor: "text-default-600 dark:text-default-400",
        };
      case "premium":
        return {
          chipColor: "primary" as const,
          borderColor:
            "border-gradient-to-r from-primary-200 to-warning-200 dark:from-primary-800 dark:to-warning-800",
          bgClass:
            "bg-gradient-to-br from-primary-50/90 via-warning-50/80 to-primary-100/70 dark:from-primary-950/60 dark:via-warning-950/50 dark:to-primary-900/40",
          glowClass:
            "shadow-xl shadow-primary-300/40 dark:shadow-primary-700/30",
          textColor: "text-primary-600 dark:text-primary-400",
        };
      case "achievement":
        return {
          chipColor: "success" as const,
          borderColor: "border-success-200 dark:border-success-800",
          bgClass:
            "bg-gradient-to-br from-success-50/90 via-warning-50/80 to-success-100/70 dark:from-success-950/60 dark:via-warning-950/50 dark:to-success-900/40",
          glowClass:
            "shadow-xl shadow-success-300/40 dark:shadow-success-700/30",
          textColor: "text-success-600 dark:text-success-400",
        };
      case "milestone":
        return {
          chipColor: "secondary" as const,
          borderColor: "border-secondary-200 dark:border-secondary-800",
          bgClass:
            "bg-gradient-to-br from-secondary-50/90 to-secondary-100/70 dark:from-secondary-950/60 dark:to-secondary-900/40",
          glowClass: "shadow-secondary-200/30 dark:shadow-secondary-800/20",
          textColor: "text-secondary-600 dark:text-secondary-400",
        };
      case "social":
        return {
          chipColor: "secondary" as const,
          borderColor: "border-secondary-200 dark:border-secondary-800",
          bgClass:
            "bg-gradient-to-br from-secondary-50/90 to-secondary-100/70 dark:from-secondary-950/60 dark:to-secondary-900/40",
          glowClass: "shadow-secondary-200/30 dark:shadow-secondary-800/20",
          textColor: "text-secondary-600 dark:text-secondary-400",
        };
      default:
        return {
          chipColor: "default" as const,
          borderColor: "border-default-200 dark:border-default-800",
          bgClass:
            "bg-gradient-to-br from-default-50/90 to-default-100/70 dark:from-default-950/60 dark:to-default-900/40",
          glowClass: "shadow-default-200/30 dark:shadow-default-800/20",
        };
    }
  };

  const getAnimationVariants = () => {
    const baseVariants = {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
    };

    switch (toast.animation) {
      case "slide":
        return {
          initial: { opacity: 0, x: 300 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 300 },
        };
      case "bounce":
        return {
          initial: { opacity: 0, y: -100, scale: 0.3 },
          animate: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: "spring", bounce: 0.6 },
          },
          exit: { opacity: 0, y: -100, scale: 0.3 },
        };
      case "glow":
        return {
          initial: { opacity: 0, scale: 0.8 },
          animate: {
            opacity: 1,
            scale: 1,
            boxShadow: "0 0 20px rgba(249, 115, 22, 0.3)",
          },
          exit: { opacity: 0, scale: 0.8 },
        };
      case "elastic":
        return {
          initial: { opacity: 0, scale: 0 },
          animate: {
            opacity: 1,
            scale: 1,
            transition: { type: "spring", stiffness: 400, damping: 10 },
          },
          exit: { opacity: 0, scale: 0 },
        };
      case "flip":
        return {
          initial: { opacity: 0, rotateY: 90 },
          animate: { opacity: 1, rotateY: 0 },
          exit: { opacity: 0, rotateY: -90 },
        };
      case "pulse":
        return {
          initial: { opacity: 0, scale: 1.1 },
          animate: {
            opacity: 1,
            scale: 1,
            transition: {
              scale: { repeat: 2, repeatType: "reverse", duration: 0.2 },
            },
          },
          exit: { opacity: 0, scale: 1.1 },
        };
      default:
        return baseVariants;
    }
  };

  const config = getVariantConfig();
  const priorityIndicator =
    toast.priority === "urgent"
      ? "animate-pulse"
      : toast.priority === "high"
        ? "border-2"
        : "";

  return (
    <motion.div
      layout
      animate="animate"
      className={`w-full max-w-lg border-[1px]  border-divider rounded-2xl`}
      exit="exit"
      initial="initial"
      variants={getAnimationVariants()}
    >
      <Card
        className={`
          dark:bg-content3-dark
         rounded-2xl  
          ${toast.variant === "premium" || toast.variant === "achievement" ? "shadow-2xl" : ""}
          ${toast.priority === "urgent" ? "ring-2 ring-danger-400 ring-opacity-75" : ""}
         
        `}
      >
        {/* Priority Bar */}
        {toast.priority === "urgent" && (
          <div className="h-1 bg-gradient-to-r from-danger-400 to-danger-600 rounded-t-lg animate-pulse" />
        )}{" "}
        <div
          className={`h-1 ${config.bgClass} rounded-t-lg  animate-indeterminate-bar`}
        />
        <div className="p-2">
          <div className="flex gap-3">
            {/* Icon/Avatar Section */}
            <div className="flex-shrink-0 flex flex-col items-center pt-0.5">
              {toast.avatar ? (
                <Avatar
                  className="w-8 h-8 border-2 border-divider shadow-lg"
                  size="sm"
                  src={toast.avatar}
                />
              ) : (
                <div
                  className={`
                    p-2 rounded-full 
                    backdrop-blur-sm shadow-lg border border-divider
                    ${config.textColor}
                     ${config.bgClass} 
                    ${toast.variant === "premium" || toast.variant === "achievement" ? "animate-pulse" : ""}
                  `}
                >
                  {toast.icon || (
                    <Info className={`w-4 h-4 ${config.textColor}`} />
                  )}
                </div>
              )}

              {/* Trend Indicator */}
              {toast.trend && (
                <div
                  className={`mt-1 p-1 rounded-full ${toast.trend === "up" ? "bg-success-100 dark:bg-success-900" : "bg-danger-100 dark:bg-danger-900"}`}
                >
                  <ArrowUp
                    className={`w-3 h-3 ${toast.trend === "up" ? "text-success-600 dark:text-success-400" : "text-danger-600 dark:text-danger-400 rotate-180"}`}
                  />
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="flex-1 min-w-0">
              {/* Header with Title, Value, and Chips */}
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold truncate flex items-center text-pretty gap-2 ${config.textColor}`}
                  >
                    {toast.title}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {toast.value && (
                    <Chip
                      className="text-xs font-semibold"
                      color={config.chipColor}
                      size="sm"
                      variant="flat"
                    >
                      {toast.value}
                    </Chip>
                  )}

                  {(toast.variant === "premium" ||
                    toast.variant === "achievement") && (
                    <Chip
                      className="text-xs font-bold"
                      color="primary"
                      size="sm"
                      startContent={
                        toast.variant === "premium" ? (
                          <Crown className="w-3 h-3" />
                        ) : (
                          <Star className="w-3 h-3" />
                        )
                      }
                      variant="solid"
                    >
                      {toast.variant === "premium" ? "PRO" : "NEW"}
                    </Chip>
                  )}

                  {toast.category && (
                    <Chip
                      className="text-[10px] px-0 h-5 uppercase tracking-wider rounded-md"
                      color="success"
                      size="sm"
                      variant="flat"
                    >
                      {toast.category}
                    </Chip>
                  )}
                </div>
              </div>

              {/* Description */}
              {toast.description && (
                <p className="text-xs text-default-600  leading-relaxed">
                  {isExpanded || !toast.expandable
                    ? toast.description
                    : `${toast.description.slice(0, 100)}${toast.description.length > 100 ? "..." : ""}`}
                  {toast.expandable && toast.description.length > 100 && (
                    <button
                      className="ml-1 text-primary-600 hover:text-primary-700 text-xs font-medium"
                      onClick={() => setIsExpanded(!isExpanded)}
                    >
                      {isExpanded ? "Show less" : "Show more"}
                    </button>
                  )}
                </p>
              )}

              {/* Progress Bar */}
              {typeof toast.progress === "number" && (
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-default-500 font-medium">
                      Progress
                    </span>
                    <span className="text-xs text-default-600 font-bold">
                      {Math.round(toast.progress)}%
                    </span>
                  </div>
                  <Progress
                    className="w-full"
                    color={config.chipColor}
                    size="sm"
                    value={toast.progress}
                  />
                </div>
              )}

              {/* Reactions */}
              {toast.reactions && toast.reactions.length > 0 && (
                <div className="flex gap-1 mb-3">
                  {toast.reactions.map((reaction, index) => (
                    <Button
                      key={index}
                      className="h-7 px-2 text-xs hover:scale-110 transition-transform"
                      size="sm"
                      variant="flat"
                      onPress={() => {
                        reaction.handler();
                        // Add visual feedback
                        console.log(`Reacted with ${reaction.emoji}`);
                      }}
                    >
                      <span className="mr-1">{reaction.emoji}</span>
                      {reaction.label}
                    </Button>
                  ))}
                </div>
              )}

              {/* Actions */}
              {toast.actions && toast.actions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {toast.actions.map((action, index) => (
                    <Button
                      key={index}
                      className={`
                          text-[11px] h-7 px-2 font-medium transition-all duration-100 
                        
                          ${action.variant === "ghost" ? "min-w-0 p-2 w-8" : ""}
                          ${action.variant === "primary" ? "shadow-primary-200/50" : ""}
                        `}
                      color={
                        action.variant === "primary"
                          ? "primary"
                          : action.variant === "danger"
                            ? "danger"
                            : action.variant === "success"
                              ? "success"
                              : action.variant === "warning"
                                ? "warning"
                                : "default"
                      }
                      isDisabled={action.disabled}
                      isLoading={action.loading}
                      size="sm"
                      startContent={action.icon}
                      variant={"faded"}
                      onPress={() => {
                        action.handler();
                        if (action.variant !== "ghost") {
                          setTimeout(handleDismiss, 1000); // Delay dismiss to show action feedback
                        }
                      }}
                    >
                      {action.variant === "ghost" ? "" : action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Dismiss Button */}
            {toast.dismissible !== false && (
              <div className="flex-shrink-0">
                <Button
                  isIconOnly
                  className="w-7 h-7 min-w-7 text-default-400 hover:text-default-600 hover:bg-default-100 transition-all duration-200 rounded-full"
                  size="sm"
                  variant="light"
                  onPress={handleDismiss}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>

          {/* Image */}
          {toast.image && (
            <div className="mt-4 -mx-1">
              <img
                alt="Toast content"
                className="w-full h-32 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                src={toast.image}
              />
            </div>
          )}

          {/* Expandable Metadata */}
          {isExpanded &&
            toast.metadata &&
            Object.keys(toast.metadata).length > 0 && (
              <div className="mt-3 p-3 bg-default-50/50 dark:bg-default-950/30 rounded-lg border border-default-200 dark:border-default-800">
                <h4 className="text-xs font-semibold text-default-700 mb-2">
                  Details
                </h4>
                <div className="space-y-1">
                  {Object.entries(toast.metadata).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center text-xs"
                    >
                      <span className="text-default-500 capitalize">
                        {key}:
                      </span>
                      <span className="text-default-700 font-medium">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
        {/* Footer Divider for Important Toasts */}
        {(toast.priority === "urgent" ||
          toast.variant === "premium" ||
          toast.variant === "achievement") && (
          <div className="h-1 bg-gradient-to-r from-transparent via-primary-400/30 to-transparent" />
        )}
      </Card>
    </motion.div>
  );
};

// Enhanced Toast Container with Smart Positioning
const ToastContainer: React.FC<{
  toasts: Toast[];
  position: ToastPosition;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Toast>) => void;
}> = ({ toasts, position, onRemove, onUpdate }) => {
  const getPositionClasses = () => {
    const base = "fixed z-[9999] pointer-events-none";

    switch (position) {
      case "top-right":
        return `${base} top-16 right-4 max-h-[90vh] overflow-hidden`;
      case "top-left":
        return `${base} top-16 left-4 max-h-[90vh] overflow-hidden`;
      case "top-center":
        return `${base} top-16 left-1/2 -translate-x-1/2 max-h-[90vh] overflow-hidden`;
      case "bottom-right":
        return `${base} bottom-4 right-4 max-h-[90vh] overflow-hidden`;
      case "bottom-left":
        return `${base} bottom-4 left-4 max-h-[90vh] overflow-hidden`;
      case "bottom-center":
        return `${base} bottom-4 left-1/2 -translate-x-1/2 max-h-[90vh] overflow-hidden`;
      default:
        return `${base} top-18 right-4 max-h-[90vh] overflow-hidden`;
    }
  };

  // Sort toasts by priority
  const sortedToasts = toasts
    .filter((toast) => (toast.position || "top-right") === position)
    .sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority || "medium"];
      const bPriority = priorityOrder[b.priority || "medium"];

      return bPriority - aPriority;
    })
    .slice(0, 5); // Limit to 5 toasts per position

  if (sortedToasts.length === 0) return null;

  return (
    <div className={getPositionClasses()}>
      <div className="space-y-2 pointer-events-auto">
        <AnimatePresence mode="popLayout">
          {sortedToasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onRemove={onRemove}
              onUpdate={onUpdate}
            />
          ))}
        </AnimatePresence>

        {/* Overflow Indicator */}
        {toasts.filter((t) => (t.position || "top-right") === position).length >
          5 && (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
          >
            <Chip className="text-xs" color="default" size="sm" variant="flat">
              +
              {toasts.filter((t) => (t.position || "top-right") === position)
                .length - 5}{" "}
              more
            </Chip>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Enhanced Toast Provider with Advanced State Management
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idCounter = useRef(0);
  const maxToasts = 20; // Prevent memory issues

  const addToast = useCallback(
    (toastData: Omit<Toast, "id" | "createdAt">): string => {
      const id = `toast-${++idCounter.current}`;
      const toast: Toast = {
        ...toastData,
        id,
        createdAt: Date.now(),
        position: toastData.position || "top-right",
        duration: toastData.duration !== undefined ? toastData.duration : 5000,
        animation: toastData.animation || "slide",
        dismissible: toastData.dismissible !== false,
        priority: toastData.priority || "medium",
        category: toastData.category || "system",
        timestamp: toastData.timestamp !== false,
      };

      setToasts((current) => {
        // Remove oldest toasts if we exceed max
        const newToasts = [...current, toast];

        if (newToasts.length > maxToasts) {
          return newToasts.slice(-maxToasts);
        }

        return newToasts;
      });

      return id;
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
    setToasts((current) =>
      current.map((toast) =>
        toast.id === id ? { ...toast, ...updates } : toast,
      ),
    );
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const dismissAll = useCallback(() => {
    setToasts((current) =>
      current.map((toast) => ({
        ...toast,
        persistent: false,
        duration: 100,
      })),
    );
  }, []);

  const clearByCategory = useCallback((category: ToastCategory) => {
    setToasts((current) =>
      current.filter((toast) => toast.category !== category),
    );
  }, []);

  const getToastsByCategory = useCallback(
    (category: ToastCategory) => {
      return toasts.filter((toast) => toast.category === category);
    },
    [toasts],
  );

  const contextValue: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    updateToast,
    clearAll,
    dismissAll,
    clearByCategory,
    getToastsByCategory,
  };

  const positions = Array.from(
    new Set(toasts.map((toast) => toast.position || "top-right")),
  ) as ToastPosition[];

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {positions.map((position) => (
        <ToastContainer
          key={position}
          position={position}
          toasts={toasts}
          onRemove={removeToast}
          onUpdate={updateToast}
        />
      ))}
    </ToastContext.Provider>
  );
};

// Spectacular Demo Component
const ToastDemo: React.FC = () => {
  const toast = useToast();
  const [counter, setCounter] = useState(0);

  const incrementAndShowToast = (toastFn: () => void) => {
    setCounter((prev) => prev + 1);
    toastFn();
  };

  const spectacularTests = [
    {
      title: "🎯 Achievement System",
      description: "Gamified notifications with rarity levels",
      color: "warning",
      icon: <Award className="w-5 h-5" />,
      tests: [
        {
          name: "Common Achievement",
          description: "Basic milestone unlocked",
          action: () => toast.achievement("First Trade Completed!", "common"),
        },
        {
          name: "Rare Achievement",
          description: "Special accomplishment",
          action: () => toast.achievement("Portfolio Diversified!", "rare"),
        },
        {
          name: "Epic Achievement",
          description: "Major milestone reached",
          action: () => toast.achievement("Diamond Hands 💎", "epic"),
        },
        {
          name: "Legendary Achievement",
          description: "Ultimate accomplishment",
          action: () =>
            toast.achievement("Crypto Millionaire! 🚀", "legendary"),
        },
      ],
    },
    {
      title: "💼 Wallet & Finance",
      description: "Rich financial data with trends",
      color: "success",
      icon: <Wallet className="w-5 h-5" />,
      tests: [
        {
          name: "Wallet Connected",
          description: "New wallet connection",
          action: () =>
            toast.walletConnected("MetaMask", "0x1234...5678", "$12,543.21"),
        },
        {
          name: "Portfolio Gain",
          description: "Positive portfolio update",
          action: () => toast.portfolioUpdate(15.7, "$47,829.33", 12),
        },
        {
          name: "Portfolio Loss",
          description: "Negative portfolio update",
          action: () => toast.portfolioUpdate(-8.2, "$41,203.87", 12),
        },
        {
          name: "Milestone Progress",
          description: "Goal achievement tracking",
          action: () =>
            toast.milestone(
              "Portfolio Growth",
              "Reached 75% of your $50K goal",
              75,
              "$50,000",
            ),
        },
      ],
    },
    {
      title: "👑 Premium Features",
      description: "Spectacular premium notifications",
      color: "primary",
      icon: <Crown className="w-5 h-5" />,
      tests: [
        {
          name: "Pro Unlocked",
          description: "Premium tier activation",
          action: () =>
            toast.premiumUnlocked("Advanced Analytics Dashboard", "pro"),
        },
        {
          name: "Enterprise Unlocked",
          description: "Enterprise tier activation",
          action: () =>
            toast.premiumUnlocked("White Label Solutions", "enterprise"),
        },
      ],
    },
    {
      title: "👥 Social Activity",
      description: "Community engagement notifications",
      color: "secondary",
      icon: <Users className="w-5 h-5" />,
      tests: [
        {
          name: "New Follower",
          description: "Someone followed you",
          action: () =>
            toast.socialActivity(
              "follow",
              "CryptoTrader_Pro",
              "https://i.pravatar.cc/40?img=1",
            ),
        },
        {
          name: "Portfolio Shared",
          description: "Your portfolio was shared",
          action: () =>
            toast.socialActivity(
              "share",
              "BlockchainExpert",
              "https://i.pravatar.cc/40?img=2",
            ),
        },
        {
          name: "Analysis Liked",
          description: "Your analysis was liked",
          action: () =>
            toast.socialActivity(
              "like",
              "DeFi_Master",
              "https://i.pravatar.cc/40?img=3",
            ),
        },
      ],
    },
    {
      title: "🔒 Security & System",
      description: "Critical system notifications",
      color: "danger",
      icon: <Shield className="w-5 h-5" />,
      tests: [
        {
          name: "Low Security Alert",
          description: "Minor security notice",
          action: () => toast.securityAlert("New device login detected", "low"),
        },
        {
          name: "High Security Alert",
          description: "Important security warning",
          action: () =>
            toast.securityAlert("Multiple failed login attempts", "high"),
        },
        {
          name: "Critical Security Alert",
          description: "Urgent security issue",
          action: () =>
            toast.securityAlert(
              "Suspicious wallet activity detected",
              "critical",
            ),
        },
      ],
    },
  ];

  const showSpectacularDemo = () => {
    const demoSequence = [
      () => toast.achievement("Welcome Bonus!", "common"),
      () => toast.walletConnected("MetaMask", "0xAbC...123", "$25,847.91"),
      () => toast.portfolioUpdate(23.4, "$31,594.78", 8),
      () => toast.premiumUnlocked("AI Trading Signals", "pro"),
      () =>
        toast.socialActivity(
          "follow",
          "WhaleWatcher",
          "https://i.pravatar.cc/40?img=5",
        ),
      () =>
        toast.milestone(
          "Diamond Status",
          "Congratulations! You've reached Diamond tier",
          100,
          "Diamond Tier",
        ),
      () => toast.achievement("Portfolio Master! 🏆", "legendary"),
    ];

    demoSequence.forEach((demo, index) => {
      setTimeout(demo, index * 1500);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-default-50 to-default-100 dark:from-background dark:via-default-950 dark:to-default-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Hero Header */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative inline-block mb-6">
            <h1 className="text-5xl font-black bg-gradient-to-r from-primary-600 via-warning-500 to-primary-600 bg-clip-text text-transparent">
              🚀 Professional Toast System
            </h1>
            <motion.div
              animate={{ rotate: 360 }}
              className="absolute -top-4 -right-4 text-2xl"
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              ✨
            </motion.div>
          </div>

          <p className="text-xl text-default-600 mb-6 max-w-3xl mx-auto">
            Experience the most advanced, creative, and visually stunning toast
            notification system built specifically for your HeroUI design system
            with rich interactions and spectacular effects.
          </p>

          <div className="flex justify-center gap-3 flex-wrap mb-8">
            <Chip
              color="primary"
              size="lg"
              startContent={<Crown className="w-4 h-4" />}
              variant="solid"
            >
              Premium Grade
            </Chip>
            <Chip
              color="success"
              size="lg"
              startContent={<CheckCircle className="w-4 h-4" />}
              variant="solid"
            >
              Zero Errors
            </Chip>
            <Chip
              color="warning"
              size="lg"
              startContent={<Sparkles className="w-4 h-4" />}
              variant="solid"
            >
              Creative Design
            </Chip>
            <Chip
              color="secondary"
              size="lg"
              startContent={<Rocket className="w-4 h-4" />}
              variant="solid"
            >
              High Performance
            </Chip>
          </div>

          <Button
            className="text-lg px-8 py-6 font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            color="primary"
            size="lg"
            startContent={<Flame className="w-5 h-5" />}
            variant="solid"
            onPress={showSpectacularDemo}
          >
            🎆 Show Spectacular Demo
          </Button>
        </motion.div>

        {/* Statistics Dashboard */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card className="mb-8 bg-gradient-to-r from-primary-50/50 to-warning-50/50 dark:from-primary-950/30 dark:to-warning-950/30 border-primary-200 dark:border-primary-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-500 rounded-full">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    Live Toast Analytics
                  </h3>
                  <p className="text-default-600">
                    Real-time toast performance metrics
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {[
                  {
                    label: "Active Toasts",
                    value: toast.toasts.length,
                    icon: <Activity className="w-5 h-5" />,
                    color: "primary",
                  },
                  {
                    label: "Success",
                    value: toast.toasts.filter((t) => t.variant === "success")
                      .length,
                    icon: <CheckCircle className="w-5 h-5" />,
                    color: "success",
                  },
                  {
                    label: "Achievements",
                    value: toast.toasts.filter(
                      (t) => t.variant === "achievement",
                    ).length,
                    icon: <Award className="w-5 h-5" />,
                    color: "warning",
                  },
                  {
                    label: "Premium",
                    value: toast.toasts.filter((t) => t.variant === "premium")
                      .length,
                    icon: <Crown className="w-5 h-5" />,
                    color: "secondary",
                  },
                  {
                    label: "Urgent",
                    value: toast.toasts.filter((t) => t.priority === "urgent")
                      .length,
                    icon: <AlertTriangle className="w-5 h-5" />,
                    color: "danger",
                  },
                  {
                    label: "Total Tests",
                    value: counter,
                    icon: <Target className="w-5 h-5" />,
                    color: "default",
                  },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div
                      className={`inline-flex p-3 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900/30 mb-2`}
                    >
                      <div
                        className={`text-${stat.color}-600 dark:text-${stat.color}-400`}
                      >
                        {stat.icon}
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </div>
                    <div className="text-xs text-default-500 uppercase tracking-wide">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              <Divider className="my-6" />

              <div className="flex gap-3 justify-center flex-wrap">
                <Button
                  color="default"
                  startContent={<Bell className="w-4 h-4" />}
                  variant="flat"
                  onPress={toast.dismissAll}
                >
                  Dismiss All ({toast.toasts.length})
                </Button>
                <Button
                  color="danger"
                  startContent={<X className="w-4 h-4" />}
                  variant="flat"
                  onPress={toast.clearAll}
                >
                  Clear All
                </Button>
                <Button
                  color="primary"
                  startContent={<Settings className="w-4 h-4" />}
                  variant="flat"
                  onPress={() => toast.clearByCategory("system")}
                >
                  Clear System
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Test Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {spectacularTests.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.1 * categoryIndex, duration: 0.6 }}
            >
              <Card
                className={`h-full bg-gradient-to-br from-${category.color}-50/50 to-${category.color}-100/30 dark:from-${category.color}-950/30 dark:to-${category.color}-900/20 border-${category.color}-200 dark:border-${category.color}-800 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 bg-${category.color}-500 rounded-full shadow-lg`}
                    >
                      <div className="text-white">{category.icon}</div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground">
                        {category.title}
                      </h3>
                      <p className="text-sm text-default-600">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardBody className="pt-0">
                  <div className="space-y-3">
                    {category.tests.map((test, testIndex) => (
                      <motion.div
                        key={test.name}
                        animate={{ opacity: 1, x: 0 }}
                        initial={{ opacity: 0, x: -20 }}
                        transition={{ delay: 0.05 * testIndex, duration: 0.4 }}
                      >
                        <Card className="bg-white/60 dark:bg-default-900/40 shadow-sm hover:shadow-md transition-all duration-200">
                          <CardBody className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-foreground text-sm">
                                {test.name}
                              </h4>
                            </div>
                            <p className="text-xs text-default-600 mb-3 leading-relaxed">
                              {test.description}
                            </p>
                            <Button
                              className="w-full font-medium hover:scale-105 transition-transform"
                              color={category.color as any}
                              size="sm"
                              startContent={<Zap className="w-3 h-3" />}
                              variant="flat"
                              onPress={() => incrementAndShowToast(test.action)}
                            >
                              Test Now
                            </Button>
                          </CardBody>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Features Showcase */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-default-50 to-primary-50/30 dark:from-default-950 dark:to-primary-950/30">
            <CardHeader>
              <div className="text-center w-full">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  🌟 Advanced Features
                </h3>
                <p className="text-default-600">
                  Cutting-edge capabilities that set this system apart
                </p>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: <Sparkles className="w-5 h-5" />,
                    title: "Rich Interactions",
                    desc: "Reactions, actions, and expandable content",
                  },
                  {
                    icon: <Crown className="w-5 h-5" />,
                    title: "Rarity System",
                    desc: "Achievements with common to legendary tiers",
                  },
                  {
                    icon: <TrendingUp className="w-5 h-5" />,
                    title: "Smart Analytics",
                    desc: "Trend indicators and progress tracking",
                  },
                  {
                    icon: <Shield className="w-5 h-5" />,
                    title: "Priority System",
                    desc: "Urgent, high, medium, low priority handling",
                  },
                  {
                    icon: <Bell className="w-5 h-5" />,
                    title: "Multi-Modal",
                    desc: "Sound effects and haptic feedback",
                  },
                  {
                    icon: <Activity className="w-5 h-5" />,
                    title: "Live Updates",
                    desc: "Real-time progress and status changes",
                  },
                  {
                    icon: <Users className="w-5 h-5" />,
                    title: "Social Features",
                    desc: "User avatars and community interactions",
                  },
                  {
                    icon: <Rocket className="w-5 h-5" />,
                    title: "Performance",
                    desc: "Optimized animations and memory usage",
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-4 rounded-lg bg-white/50 dark:bg-default-900/30 shadow-sm hover:shadow-md transition-all duration-200"
                    initial={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: 0.1 * index, duration: 0.4 }}
                  >
                    <div className="inline-flex p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-3">
                      <div className="text-primary-600 dark:text-primary-400">
                        {feature.icon}
                      </div>
                    </div>
                    <h4 className="font-semibold text-foreground text-sm mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-default-600 leading-relaxed">
                      {feature.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ToastDemo;
