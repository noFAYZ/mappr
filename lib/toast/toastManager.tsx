// lib/toast/toastManager.ts
import { Toast, ToastAction } from '@/components/ui/Toaster';
import { 
  TrendingUp, TrendingDown, Wallet, Activity, Star, Shield, 
  Zap, Crown, Sparkles, CheckCircle2, AlertTriangle, 
  ExternalLink, Copy, Share2, Eye, RefreshCw, Bell,
  DollarSign, Clock, User, Settings, Heart, Bookmark,
  MessageSquare, Download, Upload, Globe, Lock
} from 'lucide-react';

// Enhanced toast utility class
export class ToastManager {
  private addToast: (toast: Omit<Toast, 'id' | 'createdAt'>) => string;
  private addNotification: (notification: any) => void;

  constructor(addToast: any, addNotification: any) {
    this.addToast = addToast;
    this.addNotification = addNotification;
  }

  // Wallet-specific toasts
  walletSync = {
    started: (walletName: string, walletAddress?: string) => {
      return this.addToast({
        variant: 'wallet',
        title: 'Syncing Wallet',
        description: `Fetching latest data for ${walletName}...`,
        persistent: true,
        metadata: { walletAddress },
        actions: [
          {
            label: 'View Progress',
            handler: () => window.location.href = '/portfolio',
            variant: 'ghost' as const,
            icon: <Eye className="w-3 h-3" />
          }
        ]
      });
    },

    completed: (walletName: string, totalValue?: number, change?: number) => {
      return this.addToast({
        variant: 'success',
        title: 'Wallet Synced Successfully',
        description: `${walletName} is now up to date`,
        metadata: { 
          amount: totalValue,
          percentage: change && totalValue ? ((change / totalValue) * 100) : undefined
        },
        actions: [
          {
            label: 'View Portfolio',
            handler: () => window.location.href = '/portfolio',
            variant: 'primary' as const,
            icon: <ExternalLink className="w-3 h-3" />
          },
          {
            label: 'Share',
            handler: () => {
              if (navigator.share) {
                navigator.share({ 
                  title: 'My Portfolio Update',
                  text: `My wallet ${walletName} is now worth ${totalValue ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalValue) : 'N/A'}`
                });
              } else {
                navigator.clipboard.writeText(`My wallet ${walletName} portfolio value: ${totalValue ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalValue) : 'N/A'}`);
              }
            },
            variant: 'ghost' as const,
            icon: <Share2 className="w-3 h-3" />
          }
        ]
      });
    },

    failed: (walletName: string, error: string, retryFn?: () => void) => {
      return this.addToast({
        variant: 'error',
        title: 'Sync Failed',
        description: `Failed to sync ${walletName}: ${error}`,
        duration: 8000,
        actions: [
          ...(retryFn ? [{
            label: 'Retry',
            handler: retryFn,
            variant: 'primary' as const,
            icon: <RefreshCw className="w-3 h-3" />
          }] : []),
          {
            label: 'Support',
            handler: () => window.location.href = '/support',
            variant: 'ghost' as const,
            icon: <MessageSquare className="w-3 h-3" />
          }
        ]
      });
    }
  };

  // Transaction toasts
  transaction = {
    detected: (type: 'sent' | 'received', amount: number, token: string, hash: string) => {
      return this.addToast({
        variant: 'transaction',
        title: `Transaction ${type === 'sent' ? 'Sent' : 'Received'}`,
        description: `${amount} ${token} ${type === 'sent' ? 'sent' : 'received'}`,
        metadata: { amount: type === 'received' ? amount : -amount },
        actions: [
          {
            label: 'Track',
            handler: () => window.open(`https://etherscan.io/tx/${hash}`, '_blank'),
            variant: 'primary' as const,
            icon: <ExternalLink className="w-3 h-3" />
          }
        ]
      });
    }
  };

  // Performance alerts
  performance = {
    gainAlert: (walletName: string, percentage: number, timeframe: string = '24h') => {
      return this.addToast({
        variant: 'performance',
        title: 'Strong Performance! 📈',
        description: `${walletName} is up ${percentage.toFixed(2)}% in the last ${timeframe}`,
        metadata: { percentage },
        animation: 'bounce' as const,
        actions: [
          {
            label: 'View Details',
            handler: () => window.location.href = '/portfolio',
            variant: 'primary' as const,
            icon: <TrendingUp className="w-3 h-3" />
          },
          {
            label: 'Set Alert',
            handler: () => window.location.href = '/settings/alerts',
            variant: 'ghost' as const,
            icon: <Bell className="w-3 h-3" />
          }
        ]
      });
    },

    lossAlert: (walletName: string, percentage: number, timeframe: string = '24h') => {
      return this.addToast({
        variant: 'warning',
        title: 'Performance Alert',
        description: `${walletName} is down ${Math.abs(percentage).toFixed(2)}% in the last ${timeframe}`,
        metadata: { percentage },
        duration: 8000,
        actions: [
          {
            label: 'Analyze',
            handler: () => window.location.href = '/portfolio/analytics',
            variant: 'primary' as const,
            icon: <Activity className="w-3 h-3" />
          },
          {
            label: 'Rebalance',
            handler: () => window.location.href = '/portfolio/rebalance',
            variant: 'ghost' as const,
            icon: <RefreshCw className="w-3 h-3" />
          }
        ]
      });
    },

    milestone: (milestone: string, value: number) => {
      return this.addToast({
        variant: 'achievement',
        title: 'Milestone Reached! 🎉',
        description: `Your portfolio has reached ${milestone}`,
        metadata: { amount: value },
        animation: 'glow' as const,
        duration: 10000,
        actions: [
          {
            label: 'Celebrate',
            handler: () => {
              // Trigger confetti animation or celebration
              console.log('🎉 Celebration triggered!');
            },
            variant: 'primary' as const,
            icon: <Star className="w-3 h-3" />
          },
          {
            label: 'Share Achievement',
            handler: () => {
              if (navigator.share) {
                navigator.share({
                  title: 'Portfolio Milestone',
                  text: `I just reached ${milestone} in my crypto portfolio!`
                });
              } else {
                navigator.clipboard.writeText(`I just reached ${milestone} in my crypto portfolio!`);
                this.success('Copied', 'Achievement copied to clipboard');
              }
            },
            variant: 'ghost' as const,
            icon: <Share2 className="w-3 h-3" />
          }
        ]
      });
    },

    riskWarning: (walletName: string, riskLevel: 'low' | 'medium' | 'high', details: string) => {
      return this.addToast({
        variant: riskLevel === 'high' ? 'error' : 'warning',
        title: `Risk Alert: ${riskLevel.toUpperCase()}`,
        description: `${walletName}: ${details}`,
        duration: riskLevel === 'high' ? 12000 : 8000,
        actions: [
          {
            label: 'View Risk Analysis',
            handler: () => window.location.href = '/portfolio/risk',
            variant: 'primary' as const,
            icon: <Shield className="w-3 h-3" />
          }
        ]
      });
    }
  };

  // System notifications
  system = {
    securityAlert: (message: string, severity: 'low' | 'medium' | 'high' = 'medium') => {
      return this.addToast({
        variant: severity === 'high' ? 'error' : 'warning',
        title: 'Security Alert',
        description: message,
        persistent: severity === 'high',
        duration: severity === 'high' ? undefined : 10000,
        actions: [
          {
            label: 'Review Security',
            handler: () => window.location.href = '/settings/security',
            variant: 'primary' as const,
            icon: <Shield className="w-3 h-3" />
          },
          {
            label: 'Contact Support',
            handler: () => window.location.href = '/support',
            variant: 'ghost' as const,
            icon: <MessageSquare className="w-3 h-3" />
          }
        ]
      });
    },

    update: (version: string, features: string[]) => {
      return this.addToast({
        variant: 'info',
        title: `Update Available: v${version}`,
        description: `New features: ${features.slice(0, 2).join(', ')}${features.length > 2 ? '...' : ''}`,
        duration: 8000,
        actions: [
          {
            label: 'Update Now',
            handler: () => window.location.reload(),
            variant: 'primary' as const,
            icon: <Zap className="w-3 h-3" />
          },
          {
            label: 'View Changelog',
            handler: () => window.open('/changelog', '_blank'),
            variant: 'ghost' as const,
            icon: <ExternalLink className="w-3 h-3" />
          }
        ]
      });
    },

    maintenance: (startTime: Date, duration: number) => {
      const minutesUntil = Math.round((startTime.getTime() - Date.now()) / 60000);
      return this.addToast({
        variant: 'warning',
        title: 'Scheduled Maintenance',
        description: `System maintenance in ${minutesUntil} minutes (${duration}min duration)`,
        persistent: true,
        actions: [
          {
            label: 'Learn More',
            handler: () => window.open('/status', '_blank'),
            variant: 'ghost' as const,
            icon: <ExternalLink className="w-3 h-3" />
          }
        ]
      });
    },

    connectionLost: () => {
      return this.addToast({
        variant: 'error',
        title: 'Connection Lost',
        description: 'Unable to connect to servers. Retrying...',
        persistent: true,
        actions: [
          {
            label: 'Retry Now',
            handler: () => window.location.reload(),
            variant: 'primary' as const,
            icon: <RefreshCw className="w-3 h-3" />
          }
        ]
      });
    },

    connectionRestored: () => {
      return this.addToast({
        variant: 'success',
        title: 'Connection Restored',
        description: 'Successfully reconnected to servers',
        duration: 3000
      });
    }
  };

  // Premium/upgrade toasts
  premium = {
    trialExpiring: (daysLeft: number) => {
      return this.addToast({
        variant: 'premium',
        title: 'Premium Trial Expiring',
        description: `Your premium trial expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`,
        animation: 'glow' as const,
        persistent: true,
        actions: [
          {
            label: 'Upgrade Now',
            handler: () => window.location.href = '/premium',
            variant: 'primary' as const,
            icon: <Crown className="w-3 h-3" />
          },
          {
            label: 'View Plans',
            handler: () => window.location.href = '/pricing',
            variant: 'ghost' as const,
            icon: <ExternalLink className="w-3 h-3" />
          }
        ]
      });
    },

    featureUnlocked: (feature: string, actionUrl?: string) => {
      return this.addToast({
        variant: 'premium',
        title: 'Premium Feature Unlocked! ✨',
        description: `You now have access to ${feature}`,
        animation: 'glow' as const,
        duration: 8000,
        actions: [
          {
            label: 'Try It Now',
            handler: () => window.location.href = actionUrl || '/premium/features',
            variant: 'primary' as const,
            icon: <Sparkles className="w-3 h-3" />
          }
        ]
      });
    },

    limitReached: (feature: string, limit: number) => {
      return this.addToast({
        variant: 'warning',
        title: 'Feature Limit Reached',
        description: `You've reached your ${feature} limit (${limit}). Upgrade for unlimited access.`,
        duration: 8000,
        actions: [
          {
            label: 'Upgrade',
            handler: () => window.location.href = '/premium',
            variant: 'primary' as const,
            icon: <Crown className="w-3 h-3" />
          }
        ]
      });
    }
  };

  // AI Assistant toasts
  ai = {
    insight: (insight: string, confidence: number, actionUrl?: string) => {
      return this.addToast({
        variant: 'ai',
        title: 'AI Insight',
        description: insight,
        animation: 'glow' as const,
        metadata: { confidence },
        actions: [
          {
            label: 'Ask AI',
            handler: () => window.location.href = actionUrl || '/ai',
            variant: 'primary' as const,
            icon: <Sparkles className="w-3 h-3" />
          },
          {
            label: 'Learn More',
            handler: () => window.location.href = '/ai/insights',
            variant: 'ghost' as const,
            icon: <ExternalLink className="w-3 h-3" />
          }
        ]
      });
    },

    recommendation: (action: string, reasoning: string) => {
      return this.addToast({
        variant: 'ai',
        title: 'AI Recommendation',
        description: `Consider ${action}. ${reasoning}`,
        duration: 10000,
        actions: [
          {
            label: 'Learn More',
            handler: () => window.location.href = '/ai/recommendations',
            variant: 'primary' as const,
            icon: <Sparkles className="w-3 h-3" />
          },
          {
            label: 'Not Interested',
            handler: () => {
              // Mark recommendation as dismissed
              console.log('AI recommendation dismissed');
            },
            variant: 'ghost' as const
          }
        ]
      });
    },

    analysisComplete: (analysis: string, resultsUrl?: string) => {
      return this.addToast({
        variant: 'ai',
        title: 'Analysis Complete',
        description: analysis,
        actions: [
          {
            label: 'View Results',
            handler: () => window.location.href = resultsUrl || '/ai/analysis',
            variant: 'primary' as const,
            icon: <ExternalLink className="w-3 h-3" />
          }
        ]
      });
    }
  };

  // Social/sharing toasts
  social = {
    achievement: (achievement: string, rarity: 'common' | 'rare' | 'legendary') => {
      const variants = {
        common: 'success' as const,
        rare: 'achievement' as const,
        legendary: 'premium' as const
      };

      const emojis = {
        common: '🏆',
        rare: '⭐',
        legendary: '👑'
      };

      return this.addToast({
        variant: variants[rarity],
        title: `Achievement Unlocked! ${emojis[rarity]}`,
        description: achievement,
        animation: 'bounce' as const,
        duration: 8000,
        actions: [
          {
            label: 'Share',
            handler: () => {
              if (navigator.share) {
                navigator.share({
                  title: 'Achievement Unlocked!',
                  text: `I just unlocked: ${achievement}`
                });
              } else {
                navigator.clipboard.writeText(`I just unlocked: ${achievement}`);
                this.success('Copied', 'Achievement copied to clipboard');
              }
            },
            variant: 'primary' as const,
            icon: <Share2 className="w-3 h-3" />
          },
          {
            label: 'View All',
            handler: () => window.location.href = '/achievements',
            variant: 'ghost' as const,
            icon: <Star className="w-3 h-3" />
          }
        ]
      });
    },

    newFollower: (username: string, avatar?: string) => {
      return this.addToast({
        variant: 'social',
        title: 'New Follower',
        description: `${username} started following you`,
        avatar,
        actions: [
          {
            label: 'View Profile',
            handler: () => window.location.href = `/profile/${username}`,
            variant: 'primary' as const,
            icon: <User className="w-3 h-3" />
          }
        ]
      });
    },

    portfolioShared: (views: number) => {
      return this.addToast({
        variant: 'social',
        title: 'Portfolio Shared',
        description: `Your portfolio has been viewed ${views} time${views > 1 ? 's' : ''}`,
        actions: [
          {
            label: 'View Stats',
            handler: () => window.location.href = '/portfolio/stats',
            variant: 'primary' as const,
            icon: <Eye className="w-3 h-3" />
          }
        ]
      });
    }
  };

  // File/Data operations
  data = {
    exportStarted: (type: 'portfolio' | 'transactions' | 'tax') => {
      return this.addToast({
        variant: 'loading',
        title: 'Export Started',
        description: `Preparing your ${type} export...`,
        persistent: true
      });
    },

    exportComplete: (type: 'portfolio' | 'transactions' | 'tax', downloadUrl: string) => {
      return this.addToast({
        variant: 'success',
        title: 'Export Complete',
        description: `Your ${type} export is ready for download`,
        actions: [
          {
            label: 'Download',
            handler: () => {
              const link = document.createElement('a');
              link.href = downloadUrl;
              link.download = `${type}-export.csv`;
              link.click();
            },
            variant: 'primary' as const,
            icon: <Download className="w-3 h-3" />
          }
        ]
      });
    },

    importStarted: (filename: string) => {
      return this.addToast({
        variant: 'loading',
        title: 'Import Started',
        description: `Processing ${filename}...`,
        persistent: true
      });
    },

    importComplete: (filename: string, recordsProcessed: number) => {
      return this.addToast({
        variant: 'success',
        title: 'Import Complete',
        description: `Successfully processed ${recordsProcessed} records from ${filename}`,
        actions: [
          {
            label: 'View Results',
            handler: () => window.location.href = '/portfolio',
            variant: 'primary' as const,
            icon: <ExternalLink className="w-3 h-3" />
          }
        ]
      });
    },

    backupComplete: (timestamp: string) => {
      return this.addToast({
        variant: 'success',
        title: 'Backup Complete',
        description: `Portfolio backed up successfully at ${timestamp}`,
        actions: [
          {
            label: 'View Backups',
            handler: () => window.location.href = '/settings/backups',
            variant: 'ghost' as const,
            icon: <ExternalLink className="w-3 h-3" />
          }
        ]
      });
    }
  };

  // Quick utility methods
  success = (title: string, description?: string, actions?: ToastAction[]) => {
    return this.addToast({
      variant: 'success',
      title,
      description,
      actions
    });
  };

  error = (title: string, description?: string, actions?: ToastAction[]) => {
    return this.addToast({
      variant: 'error',
      title,
      description,
      duration: 8000,
      actions
    });
  };

  info = (title: string, description?: string, actions?: ToastAction[]) => {
    return this.addToast({
      variant: 'info',
      title,
      description,
      actions
    });
  };

  warning = (title: string, description?: string, actions?: ToastAction[]) => {
    return this.addToast({
      variant: 'warning',
      title,
      description,
      duration: 6000,
      actions
    });
  };

  loading = (title: string, description?: string, persistent: boolean = true) => {
    return this.addToast({
      variant: 'loading',
      title,
      description,
      persistent
    });
  };
}

export default ToastManager; 