// components/ui/modern-toaster.tsx
"use client";

import React, { createContext, useContext, useCallback, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  CheckCircle2, XCircle, AlertTriangle, Info, Loader2, Zap, TrendingUp, 
  TrendingDown, Wallet, DollarSign, Activity, Star, Crown, Shield, 
  Sparkles, X, ChevronRight, ExternalLink, Copy, Share2, Download,
  Bell, Clock, User, Settings, Heart, Bookmark, Eye, MessageSquare
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@heroui/button';
import { Avatar } from '@heroui/avatar';
import { Chip } from '@heroui/chip';
import { Progress } from '@heroui/progress';

// Enhanced Toast Types
export type ToastVariant = 
  | 'success' | 'error' | 'warning' | 'info' | 'loading'
  | 'wallet' | 'transaction' | 'performance' | 'achievement'
  | 'social' | 'system' | 'premium' | 'ai' | 'custom';

export type ToastPosition = 
  | 'top-left' | 'top-center' | 'top-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right'
  | 'center';

export type ToastAnimation = 
  | 'slide' | 'fade' | 'bounce' | 'zoom' | 'flip' | 'glow';

export interface ToastAction {
  label: string;
  handler: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: React.ReactNode;
}

export interface ToastProgress {
  current: number;
  total: number;
  label?: string;
  color?: string;
}

export interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
  persistent?: boolean;
  dismissible?: boolean;
  position?: ToastPosition;
  animation?: ToastAnimation;
  
  // Visual enhancements
  icon?: React.ReactNode;
  avatar?: string;
  image?: string;
  gradient?: string;
  glowColor?: string;
  
  // Interactive elements
  actions?: ToastAction[];
  progress?: ToastProgress;
  metadata?: Record<string, any>;
  
  // Callbacks
  onDismiss?: () => void;
  onAction?: (actionId: string) => void;
  
  // Timestamps
  createdAt: number;
  dismissedAt?: number;
}

// Toast Context
interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id' | 'createdAt'>) => string;
  dismissToast: (id: string) => void;
  dismissAll: () => void;
  updateToast: (id: string, updates: Partial<Toast>) => void;
  getToast: (id: string) => Toast | undefined;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Toast variants configuration
const toastVariants = {
  success: {
    icon: CheckCircle2,
    gradient: 'from-emerald-500 to-green-600',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    borderColor: 'border-emerald-200 dark:border-emerald-800'
  },
  error: {
    icon: XCircle,
    gradient: 'from-red-500 to-rose-600',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    borderColor: 'border-red-200 dark:border-red-800'
  },
  warning: {
    icon: AlertTriangle,
    gradient: 'from-amber-500 to-orange-600',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    borderColor: 'border-amber-200 dark:border-amber-800'
  },
  info: {
    icon: Info,
    gradient: 'from-blue-500 to-indigo-600',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  loading: {
    icon: Loader2,
    gradient: 'from-gray-500 to-slate-600',
    glowColor: 'rgba(107, 114, 128, 0.4)',
    borderColor: 'border-gray-200 dark:border-gray-800'
  },
  wallet: {
    icon: Wallet,
    gradient: 'from-purple-500 to-violet-600',
    glowColor: 'rgba(147, 51, 234, 0.4)',
    borderColor: 'border-purple-200 dark:border-purple-800'
  },
  transaction: {
    icon: Activity,
    gradient: 'from-cyan-500 to-teal-600',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    borderColor: 'border-cyan-200 dark:border-cyan-800'
  },
  performance: {
    icon: TrendingUp,
    gradient: 'from-green-500 to-emerald-600',
    glowColor: 'rgba(34, 197, 94, 0.4)',
    borderColor: 'border-green-200 dark:border-green-800'
  },
  achievement: {
    icon: Star,
    gradient: 'from-yellow-400 to-amber-500',
    glowColor: 'rgba(251, 191, 36, 0.4)',
    borderColor: 'border-yellow-200 dark:border-yellow-800'
  },
  social: {
    icon: MessageSquare,
    gradient: 'from-pink-500 to-rose-600',
    glowColor: 'rgba(236, 72, 153, 0.4)',
    borderColor: 'border-pink-200 dark:border-pink-800'
  },
  system: {
    icon: Settings,
    gradient: 'from-slate-500 to-gray-600',
    glowColor: 'rgba(100, 116, 139, 0.4)',
    borderColor: 'border-slate-200 dark:border-slate-800'
  },
  premium: {
    icon: Crown,
    gradient: 'from-violet-500 via-purple-500 to-indigo-600',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    borderColor: 'border-violet-200 dark:border-violet-800'
  },
  ai: {
    icon: Sparkles,
    gradient: 'from-indigo-500 via-blue-500 to-cyan-500',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    borderColor: 'border-indigo-200 dark:border-indigo-800'
  },
  custom: {
    icon: Info,
    gradient: 'from-gray-500 to-slate-600',
    glowColor: 'rgba(107, 114, 128, 0.4)',
    borderColor: 'border-gray-200 dark:border-gray-800'
  }
};

// Animation variants
const animationVariants = {
  slide: {
    initial: { x: 400, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 400, opacity: 0 }
  },
  fade: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  },
  bounce: {
    initial: { y: -100, opacity: 0, scale: 0.8 },
    animate: { y: 0, opacity: 1, scale: 1 },
    exit: { y: -100, opacity: 0, scale: 0.8 }
  },
  zoom: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 }
  },
  flip: {
    initial: { rotateX: -90, opacity: 0 },
    animate: { rotateX: 0, opacity: 1 },
    exit: { rotateX: 90, opacity: 0 }
  },
  glow: {
    initial: { opacity: 0, scale: 0.8, filter: 'blur(10px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 0.8, filter: 'blur(10px)' }
  }
};

// Individual Toast Component
const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({ 
  toast, 
  onDismiss 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);
  const progressRef = useRef<NodeJS.Timeout>();
  const controls = useAnimation();
  const { theme } = useTheme();

  const variant = toastVariants[toast.variant];
  const IconComponent = toast.icon || variant.icon;
  const animation = animationVariants[toast.animation || 'slide'];

  // Auto-dismiss logic
  useEffect(() => {
    if (!toast.persistent && toast.duration && toast.duration > 0) {
      const startTime = Date.now();
      const interval = 50;
      
      progressRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, toast.duration! - elapsed);
        const progressPercent = (remaining / toast.duration!) * 100;
        
        setProgress(progressPercent);
        
        if (remaining <= 0) {
          onDismiss(toast.id);
        }
      }, interval);
    }

    return () => {
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
    };
  }, [toast.duration, toast.persistent, toast.id, onDismiss]);

  // Pause/resume on hover
  useEffect(() => {
    if (progressRef.current) {
      if (isHovered) {
        clearInterval(progressRef.current);
      } else if (!toast.persistent && toast.duration) {
        // Resume countdown
        const remaining = (progress / 100) * toast.duration;
        const startTime = Date.now();
        
        progressRef.current = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const newRemaining = Math.max(0, remaining - elapsed);
          const progressPercent = (newRemaining / toast.duration!) * 100;
          
          setProgress(progressPercent);
          
          if (newRemaining <= 0) {
            onDismiss(toast.id);
          }
        }, 50);
      }
    }
  }, [isHovered, toast.persistent, toast.duration, progress, toast.id, onDismiss]);

  // Glow animation for certain variants
  useEffect(() => {
    if (toast.variant === 'premium' || toast.variant === 'ai' || toast.variant === 'achievement') {
      controls.start({
        boxShadow: [
          `0 0 20px ${variant.glowColor}`,
          `0 0 40px ${variant.glowColor}`,
          `0 0 20px ${variant.glowColor}`
        ],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      });
    }
  }, [controls, toast.variant, variant.glowColor]);

  const handleDismiss = () => {
    if (toast.dismissible !== false) {
      toast.onDismiss?.();
      onDismiss(toast.id);
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  return (
    <motion.div
      layout
      initial={animation.initial}
      animate={animation.animate}
      exit={animation.exit}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="w-full max-w-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        filter: toast.variant === 'premium' ? 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.3))' : undefined
      }}
    >
      <motion.div
        animate={controls}
        className={`
          relative overflow-hidden rounded-xl backdrop-blur-xl
          bg-white/90 dark:bg-gray-900/90 
          border ${variant.borderColor}
          shadow-xl hover:shadow-2xl
          transition-all duration-300 ease-out
          ${isHovered ? 'scale-[1.02] -translate-y-1' : ''}
        `}
      >
        {/* Gradient Accent */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${variant.gradient}`} />
        
        {/* Progress Bar */}
        {!toast.persistent && toast.duration && (
          <div className="absolute top-1 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700">
            <div 
              className={`h-full bg-gradient-to-r ${variant.gradient} transition-all duration-100 ease-linear`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            {/* Icon/Avatar */}
            <div className="flex-shrink-0">
              {toast.avatar ? (
                <Avatar src={toast.avatar} size="sm" />
              ) : (
                <div className={`
                  p-2 rounded-lg bg-gradient-to-br ${variant.gradient}
                  ${toast.variant === 'loading' ? 'animate-spin' : ''}
                `}>
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm text-foreground truncate">
                  {toast.title}
                </h4>
                {toast.variant === 'premium' && (
                  <Crown className="w-3 h-3 text-yellow-500" />
                )}
                {toast.variant === 'ai' && (
                  <Sparkles className="w-3 h-3 text-blue-500" />
                )}
              </div>
              
              {toast.description && (
                <p className="text-xs text-default-600 leading-relaxed mb-2">
                  {toast.description}
                </p>
              )}

              {/* Metadata */}
              {toast.metadata && (
                <div className="flex items-center gap-3 mb-2 text-xs text-default-500">
                  {toast.metadata.amount && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      <span className="font-medium">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format(toast.metadata.amount)}
                      </span>
                    </div>
                  )}
                  {toast.metadata.percentage !== undefined && (
                    <div className={`flex items-center gap-1 ${
                      toast.metadata.percentage >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {toast.metadata.percentage >= 0 ? 
                        <TrendingUp className="w-3 h-3" /> : 
                        <TrendingDown className="w-3 h-3" />
                      }
                      <span className="font-medium">
                        {toast.metadata.percentage >= 0 ? '+' : ''}
                        {toast.metadata.percentage.toFixed(2)}%
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(toast.createdAt)}</span>
                  </div>
                </div>
              )}

              {/* Progress */}
              {toast.progress && (
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-default-600">
                      {toast.progress.label || 'Progress'}
                    </span>
                    <span className="text-xs font-medium text-default-700">
                      {toast.progress.current}/{toast.progress.total}
                    </span>
                  </div>
                  <Progress 
                    value={(toast.progress.current / toast.progress.total) * 100}
                    color={toast.progress.color as any || 'primary'}
                    size="sm"
                    className="w-full"
                  />
                </div>
              )}

              {/* Actions */}
              {toast.actions && toast.actions.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  {toast.actions.map((action, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant={action.variant || 'flat'}
                      color="primary"
                      startContent={action.icon}
                      onPress={() => {
                        action.handler();
                        toast.onAction?.(action.label);
                      }}
                      className="text-xs"
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Dismiss Button */}
            {toast.dismissible !== false && (
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={handleDismiss}
                className="opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Image */}
        {toast.image && (
          <div className="px-4 pb-4">
            <img 
              src={toast.image} 
              alt="Toast content"
              className="w-full h-32 object-cover rounded-lg"
            />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// Toast Container Component
const ToastContainer: React.FC<{ 
  position: ToastPosition;
  toasts: Toast[];
  onDismiss: (id: string) => void;
}> = ({ position, toasts, onDismiss }) => {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
  };

  const positionedToasts = toasts.filter(toast => 
    (toast.position || 'top-right') === position
  );

  if (positionedToasts.length === 0) return null;

  return (
    <div className={`fixed z-[9999] ${positionClasses[position]} pointer-events-none`}>
      <div className="space-y-3 pointer-events-auto">
        <AnimatePresence mode="popLayout">
          {positionedToasts
            .slice()
            .reverse()
            .map((toast) => (
              <ToastItem
                key={toast.id}
                toast={toast}
                onDismiss={onDismiss}
              />
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Main Toast Provider
export const ModernToastProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const addToast = useCallback((toastData: Omit<Toast, 'id' | 'createdAt'>): string => {
    const id = `toast-${++toastIdRef.current}`;
    const toast: Toast = {
      ...toastData,
      id,
      createdAt: Date.now(),
      duration: toastData.duration ?? 5000,
      dismissible: toastData.dismissible ?? true,
      position: toastData.position ?? 'top-right',
      animation: toastData.animation ?? 'slide'
    };

    setToasts(prev => [...prev, toast]);
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, ...updates } : toast
    ));
  }, []);

  const getToast = useCallback((id: string) => {
    return toasts.find(toast => toast.id === id);
  }, [toasts]);

  const contextValue: ToastContextValue = {
    toasts,
    addToast,
    dismissToast,
    dismissAll,
    updateToast,
    getToast
  };

  // Group toasts by position
  const positions: ToastPosition[] = [
    'top-left', 'top-center', 'top-right',
    'bottom-left', 'bottom-center', 'bottom-right',
    'center'
  ];

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {typeof window !== 'undefined' && createPortal(
        <>
          {positions.map(position => (
            <ToastContainer
              key={position}
              position={position}
              toasts={toasts}
              onDismiss={dismissToast}
            />
          ))}
        </>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

// Hook to use toast
export const useModernToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useModernToast must be used within ModernToastProvider');
  }
  return context;
};

export default ModernToastProvider;