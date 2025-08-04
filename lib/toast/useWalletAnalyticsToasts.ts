// lib/toast/useWalletAnalyticsToasts.ts
import { useToastManager } from './useToastManager';

// Wallet Analytics Integration Hook
export const useWalletAnalyticsToasts = () => {
  const toast = useToastManager();

  return {
    // Wallet sync notifications
    onSyncStart: (walletName: string, walletAddress?: string) => {
      return toast.walletSync.started(walletName, walletAddress);
    },

    onSyncComplete: (walletName: string, data: { 
      totalValue?: number; 
      change?: number; 
      changePercent?: number;
      transactionCount?: number;
    }) => {
      // Show success toast
      const toastId = toast.walletSync.completed(walletName, data.totalValue, data.change);
      
      // Show performance alert if significant change
      if (data.changePercent && Math.abs(data.changePercent) >= 5) {
        setTimeout(() => {
          if (data.changePercent! > 0) {
            toast.performance.gainAlert(walletName, data.changePercent!);
          } else {
            toast.performance.lossAlert(walletName, data.changePercent!);
          }
        }, 1000);
      }

      return toastId;
    },

    onSyncError: (walletName: string, error: string, retryFn?: () => void) => {
      return toast.walletSync.failed(walletName, error, retryFn);
    },

    // Portfolio milestone notifications
    onMilestone: (milestone: string, value: number) => {
      return toast.performance.milestone(milestone, value);
    },

    // Transaction notifications
    onTransaction: (type: 'sent' | 'received', amount: number, token: string, hash: string) => {
      return toast.transaction.detected(type, amount, token, hash);
    },

    onTransactionConfirmed: (type: 'sent' | 'received', amount: number, token: string, confirmations: number) => {
      return toast.transaction.confirmed(type, amount, token, confirmations);
    },

    onTransactionPending: (type: 'sent' | 'received', amount: number, token: string, hash: string) => {
      return toast.transaction.pending(type, amount, token, hash);
    },

    // AI insights
    onAIInsight: (insight: string, confidence: number = 85) => {
      return toast.ai.insight(insight, confidence);
    },

    onAIRecommendation: (action: string, reasoning: string) => {
      return toast.ai.recommendation(action, reasoning);
    },

    // Security alerts
    onSecurityAlert: (message: string, severity: 'low' | 'medium' | 'high' = 'medium') => {
      return toast.system.securityAlert(message, severity);
    },

    // Achievement unlocks
    onAchievement: (achievement: string, rarity: 'common' | 'rare' | 'legendary' = 'common') => {
      return toast.social.achievement(achievement, rarity);
    },

    // Risk warnings
    onRiskWarning: (walletName: string, riskLevel: 'low' | 'medium' | 'high', details: string) => {
      return toast.performance.riskWarning(walletName, riskLevel, details);
    },

    // Data operations
    onDataExportStart: (type: 'portfolio' | 'transactions' | 'tax') => {
      return toast.data.exportStarted(type);
    },

    onDataExportComplete: (type: 'portfolio' | 'transactions' | 'tax', downloadUrl: string) => {
      return toast.data.exportComplete(type, downloadUrl);
    },

    onDataImportStart: (filename: string) => {
      return toast.data.importStarted(filename);
    },

    onDataImportComplete: (filename: string, recordsProcessed: number) => {
      return toast.data.importComplete(filename, recordsProcessed);
    },

    // Premium notifications
    onPremiumTrialExpiring: (daysLeft: number) => {
      return toast.premium.trialExpiring(daysLeft);
    },

    onPremiumFeatureUnlocked: (feature: string, actionUrl?: string) => {
      return toast.premium.featureUnlocked(feature, actionUrl);
    },

    onFeatureLimitReached: (feature: string, limit: number) => {
      return toast.premium.limitReached(feature, limit);
    },

    // System notifications
    onSystemUpdate: (version: string, features: string[]) => {
      return toast.system.update(version, features);
    },

    onMaintenance: (startTime: Date, duration: number) => {
      return toast.system.maintenance(startTime, duration);
    },

    onConnectionLost: () => {
      return toast.system.connectionLost();
    },

    onConnectionRestored: () => {
      return toast.system.connectionRestored();
    },

    // Social notifications
    onNewFollower: (username: string, avatar?: string) => {
      return toast.social.newFollower(username, avatar);
    },

    onPortfolioShared: (views: number) => {
      return toast.social.portfolioShared(views);
    },

    // Backup operations
    onBackupComplete: (timestamp: string) => {
      return toast.data.backupComplete(timestamp);
    },

    // Quick utility methods for common operations
    showSuccess: (title: string, message?: string) => {
      return toast.success(title, message);
    },

    showError: (title: string, message?: string) => {
      return toast.error(title, message);
    },

    showWarning: (title: string, message?: string) => {
      return toast.warning(title, message);
    },

    showInfo: (title: string, message?: string) => {
      return toast.info(title, message);
    },

    showLoading: (title: string, message?: string) => {
      return toast.loading(title, message);
    },

    // Advanced operations
    showProgressToast: (title: string, initialProgress: number = 0) => {
      return toast.showProgress(title, initialProgress);
    },

    showConditionalToast: (condition: boolean, toastData: any) => {
      return toast.showIf(condition, toastData);
    },

    showDelayedToast: (delay: number, toastData: any) => {
      return toast.showDelayed(delay, toastData);
    },

    showRetryableAction: (toastData: any, retryFn: () => Promise<boolean>, maxRetries: number = 3) => {
      return toast.showWithRetry(toastData, retryFn, maxRetries);
    },

    // Batch operations
    showMultipleToasts: (toasts: any[]) => {
      return toast.showMultiple(toasts);
    },

    // Dismiss operations
    dismissToast: (id: string) => {
      return toast.dismissToast(id);
    },

    dismissAllToasts: () => {
      return toast.dismissAll();
    },

    updateToast: (id: string, updates: any) => {
      return toast.updateToast(id, updates);
    }
  };
};

export default useWalletAnalyticsToasts;