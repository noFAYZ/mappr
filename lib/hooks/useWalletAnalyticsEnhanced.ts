// lib/hooks/useEnhancedWalletAnalytics.ts
import { useCallback, useEffect, useRef } from 'react';
import { useWalletAnalytics } from './useWalletAnalytics';
import { useWalletAnalyticsToasts } from '@/lib/toast/useWalletAnalyticsToasts';
import type { UserWallet,  SyncOptions } from './useWalletAnalytics';

interface EnhancedWalletAnalyticsConfig {
  enableSyncNotifications: boolean;
  enablePerformanceAlerts: boolean;
  enableMilestoneNotifications: boolean;
  enableAIInsights: boolean;
  enableTransactionNotifications: boolean;
  enableRiskAlerts: boolean;
  performanceThreshold: number;
  milestoneThresholds: number[];
  riskThreshold: number;
}

const defaultConfig: EnhancedWalletAnalyticsConfig = {
  enableSyncNotifications: true,
  enablePerformanceAlerts: true,
  enableMilestoneNotifications: true,
  enableAIInsights: true,
  enableTransactionNotifications: true,
  enableRiskAlerts: true,
  performanceThreshold: 5, // 5% change threshold
  milestoneThresholds: [1000, 5000, 10000, 25000, 50000, 100000], // USD milestones
  riskThreshold: 20 // 20% risk threshold
};

export const useEnhancedWalletAnalytics = (config: Partial<EnhancedWalletAnalyticsConfig> = {}) => {
  const walletAnalytics = useWalletAnalytics();
  const toastManager = useWalletAnalyticsToasts();
  const finalConfig = { ...defaultConfig, ...config };

  // Track previous portfolio values for milestone detection
  const previousPortfolioRef = useRef<Map<string, number>>(new Map());
  const lastMilestoneRef = useRef<Map<string, number>>(new Map());
  const activeSyncToastsRef = useRef<Map<string, string>>(new Map());
  const lastPerformanceAlertRef = useRef<Map<string, number>>(new Map());

  // Enhanced sync wallet with comprehensive notifications
  const syncWalletEnhanced = useCallback(async (
    walletId: string, 
    options: SyncOptions = {}
  ): Promise<boolean> => {
    const wallet = walletAnalytics.wallets.find(w => w.id === walletId);
    if (!wallet) {
      return walletAnalytics.syncWallet(walletId, options);
    }

    let syncToastId: string | null = null;

    try {
      // Show sync started notification
      if (finalConfig.enableSyncNotifications) {
        syncToastId = toastManager.onSyncStart(
          wallet.name || `Wallet ${wallet.address.slice(0, 6)}...`,
          wallet.address
        );
        activeSyncToastsRef.current.set(walletId, syncToastId);
      }

      // Execute sync
      const result = await walletAnalytics.syncWallet(walletId, options);

      // Remove from active syncs
      if (syncToastId) {
        toastManager.dismissToast(syncToastId);
        activeSyncToastsRef.current.delete(walletId);
      }

      if (result) {
        // Get updated data
        const newData = walletAnalytics.walletData[walletId];
        const previousValue = previousPortfolioRef.current.get(walletId) || 0;
        const currentValue = newData?.portfolio?.totalValue || 0;
        const change = currentValue - previousValue;
        const changePercent = previousValue > 0 ? (change / previousValue) * 100 : 0;

        // Show sync success
        if (finalConfig.enableSyncNotifications) {
          toastManager.onSyncComplete(wallet.name || 'Wallet', {
            totalValue: currentValue,
            change,
            changePercent,
            transactionCount: newData?.transactions?.length || 0
          });
        }

        // Check for milestones
        if (finalConfig.enableMilestoneNotifications && currentValue > 0) {
          const lastMilestone = lastMilestoneRef.current.get(walletId) || 0;
          const newMilestone = finalConfig.milestoneThresholds.find(
            threshold => threshold > lastMilestone && currentValue >= threshold
          );

          if (newMilestone) {
            setTimeout(() => {
              toastManager.onMilestone(
                `${newMilestone.toLocaleString()}`,
                currentValue
              );
            }, 1500);
            lastMilestoneRef.current.set(walletId, newMilestone);
          }
        }

        // Generate AI insights
        if (finalConfig.enableAIInsights && changePercent !== 0) {
          setTimeout(() => {
            generateAIInsight(wallet, changePercent, currentValue);
          }, 2000);
        }

        // Check for risk alerts
        if (finalConfig.enableRiskAlerts && Math.abs(changePercent) >= finalConfig.riskThreshold) {
          setTimeout(() => {
            const riskLevel = Math.abs(changePercent) >= 30 ? 'high' : 
                             Math.abs(changePercent) >= 20 ? 'medium' : 'low';
            const details = changePercent < 0 ? 
              `Significant portfolio decline detected (${changePercent.toFixed(2)}%)` :
              `Unusually high gains detected (${changePercent.toFixed(2)}%) - consider taking profits`;
            
            toastManager.onRiskWarning(wallet.name || 'Wallet', riskLevel, details);
          }, 2500);
        }

        // Update tracking
        previousPortfolioRef.current.set(walletId, currentValue);
      }

      return result;

    } catch (error: any) {
      // Remove from active syncs
      if (syncToastId) {
        toastManager.dismissToast(syncToastId);
        activeSyncToastsRef.current.delete(walletId);
      }
      
      // Show error notification
      if (finalConfig.enableSyncNotifications) {
        toastManager.onSyncError(
          wallet.name || 'Wallet',
          error.message || 'Sync failed',
          () => syncWalletEnhanced(walletId, options) // Retry function
        );
      }

      return false;
    }
  }, [walletAnalytics, toastManager, finalConfig]);

  // AI Insight generation
  const generateAIInsight = useCallback((
    wallet: UserWallet, 
    changePercent: number, 
    currentValue: number
  ) => {
    const insights = [
      {
        condition: changePercent > 15,
        message: `${wallet.name || 'Your wallet'} is experiencing exceptional growth! Consider reviewing your portfolio allocation to lock in gains.`,
        confidence: 92
      },
      {
        condition: changePercent > 10,
        message: `Strong performance detected in ${wallet.name || 'your wallet'}! Your diversification strategy appears to be working well.`,
        confidence: 88
      },
      {
        condition: changePercent < -20,
        message: `${wallet.name || 'Your wallet'} has declined significantly. Consider reviewing your risk management strategy or dollar-cost averaging.`,
        confidence: 90
      },
      {
        condition: changePercent < -10,
        message: `${wallet.name || 'Your wallet'} is experiencing a downturn. This might be a good time to review your holdings and consider rebalancing.`,
        confidence: 85
      },
      {
        condition: changePercent > 5 && currentValue > 50000,
        message: `Your high-value portfolio is performing well! Consider exploring additional DeFi opportunities or taking partial profits.`,
        confidence: 82
      },
      {
        condition: Math.abs(changePercent) < 2 && currentValue > 10000,
        message: `${wallet.name || 'Your wallet'} shows stable performance. This stability could be ideal for exploring yield farming opportunities.`,
        confidence: 78
      },
      {
        condition: changePercent > 0 && currentValue < 1000,
        message: `Great start! Your portfolio is growing. Consider setting up automatic recurring investments to accelerate growth.`,
        confidence: 75
      }
    ];

    const applicableInsight = insights.find(insight => insight.condition);
    if (applicableInsight && finalConfig.enableAIInsights) {
      toastManager.onAIInsight(applicableInsight.message, applicableInsight.confidence);
    }
  }, [toastManager, finalConfig]);

  // Enhanced add wallet
  const addWalletEnhanced = useCallback(async (
    address: string,
    name?: string,
    chainType: string = 'ethereum'
  ): Promise<boolean> => {
    try {
      const result = await walletAnalytics.addWallet(address, name, chainType);
      
      if (result) {
        toastManager.showSuccess(
          'Wallet Added Successfully',
          `${name || 'New wallet'} has been added to your portfolio`
        );

        // Auto-sync new wallet after brief delay
        if (finalConfig.enableSyncNotifications) {
          setTimeout(() => {
            const newWallet = walletAnalytics.wallets.find(w => w.address === address);
            if (newWallet) {
              syncWalletEnhanced(newWallet.id);
            }
          }, 1000);
        }
      }

      return result;
    } catch (error: any) {
      toastManager.showError(
        'Failed to Add Wallet',
        error.message || 'Could not add wallet. Please check the address and try again.'
      );
      return false;
    }
  }, [walletAnalytics, syncWalletEnhanced, toastManager, finalConfig]);

  // Enhanced remove wallet
  const removeWalletEnhanced = useCallback(async (
    walletId: string
  ): Promise<boolean> => {
    const wallet = walletAnalytics.wallets.find(w => w.id === walletId);
    
    try {
      const result = await walletAnalytics.removeWallet(walletId);
      
      if (result) {
        toastManager.showSuccess(
          'Wallet Removed',
          `${wallet?.name || 'Wallet'} has been removed from your portfolio`
        );

        // Clean up tracking data
        previousPortfolioRef.current.delete(walletId);
        lastMilestoneRef.current.delete(walletId);
        lastPerformanceAlertRef.current.delete(walletId);
      }

      return result;
    } catch (error: any) {
      toastManager.showError(
        'Failed to Remove Wallet',
        error.message || 'Could not remove wallet. Please try again.'
      );
      return false;
    }
  }, [walletAnalytics, toastManager]);

  // Sync all wallets with progress tracking
  const syncAllWalletsEnhanced = useCallback(async (
    options: SyncOptions = {}
  ): Promise<void> => {
    const totalWallets = walletAnalytics.wallets.length;
    if (totalWallets === 0) return;

    if (!finalConfig.enableSyncNotifications) {
      return walletAnalytics.syncAllWallets(options);
    }

    // Create progress toast
    const progressHandler = toastManager.showProgressToast('Syncing All Wallets', 0);
    let completed = 0;
    let successful = 0;

    try {
      const syncPromises = walletAnalytics.wallets.map(async (wallet, index) => {
        try {
          const result = await syncWalletEnhanced(wallet.id, { 
            ...options, 
            // Disable individual notifications during batch sync
            skipNotifications: true 
          });
          
          if (result) successful++;
          completed++;
          
          progressHandler.update(
            Math.round((completed / totalWallets) * 100),
            `Synced ${completed}/${totalWallets} wallets (${successful} successful)`
          );
        } catch (error) {
          completed++;
          progressHandler.update(
            Math.round((completed / totalWallets) * 100),
            `Processing ${completed}/${totalWallets} wallets...`
          );
        }
      });

      await Promise.allSettled(syncPromises);
      
      // Complete progress toast
      if (successful === totalWallets) {
        progressHandler.complete(
          'All Wallets Synced',
          `Successfully synced all ${totalWallets} wallet${totalWallets > 1 ? 's' : ''}`
        );
      } else {
        progressHandler.complete(
          'Sync Completed',
          `${successful}/${totalWallets} wallets synced successfully`
        );
      }

    } catch (error) {
      progressHandler.fail('Sync Failed', 'Some wallets could not be synced');
    }
  }, [walletAnalytics, syncWalletEnhanced, toastManager, finalConfig]);

  // Monitor for real-time events (transactions, price changes, etc.)
  useEffect(() => {
    if (!finalConfig.enablePerformanceAlerts && !finalConfig.enableTransactionNotifications) return;

    const monitorPerformance = () => {
      walletAnalytics.wallets.forEach(wallet => {
        const data = walletAnalytics.walletData[wallet.id];
        if (data?.portfolio) {
          const previousValue = previousPortfolioRef.current.get(wallet.id) || 0;
          const currentValue = data.portfolio.totalValue;
          
          if (previousValue > 0) {
            const changePercent = ((currentValue - previousValue) / previousValue) * 100;
            
            // Alert on significant changes
            if (Math.abs(changePercent) >= finalConfig.performanceThreshold) {
              // Prevent spam by tracking last alert time
              const lastAlertTime = lastPerformanceAlertRef.current.get(wallet.id) || 0;
              const now = Date.now();
              
              if (now - lastAlertTime > 30 * 60 * 1000) { // 30 minutes
                if (finalConfig.enablePerformanceAlerts) {
                  if (changePercent > 0) {
                    toastManager.onSyncComplete(wallet.name || 'Wallet', {
                      totalValue: currentValue,
                      changePercent
                    });
                  } else {
                    // Only show loss alerts for significant drops
                    if (Math.abs(changePercent) >= 10) {
                      toastManager.onSyncComplete(wallet.name || 'Wallet', {
                        totalValue: currentValue,
                        changePercent
                      });
                    }
                  }
                }
                lastPerformanceAlertRef.current.set(wallet.id, now);
              }
            }
          }
          
          previousPortfolioRef.current.set(wallet.id, currentValue);
        }
      });
    };

    // Monitor every 60 seconds (less frequent to avoid spam)
    const interval = setInterval(monitorPerformance, 60000);
    return () => clearInterval(interval);
  }, [walletAnalytics.wallets, walletAnalytics.walletData, toastManager, finalConfig]);

  // Security monitoring
  useEffect(() => {
    if (!finalConfig.enableRiskAlerts) return;

    const checkSecurity = () => {
      // Example security checks - implement based on your security requirements
      walletAnalytics.wallets.forEach(wallet => {
        const data = walletAnalytics.walletData[wallet.id];
        if (data) {
          // Check for unusual transaction patterns
          const recentTransactions = data.transactions?.filter(tx => 
            Date.now() - new Date(tx.timestamp).getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
          ) || [];

          // Alert if many transactions in short time
          if (recentTransactions.length > 10) {
            toastManager.onSecurityAlert(
              `Unusual activity detected in ${wallet.name || 'wallet'}: ${recentTransactions.length} transactions in 24 hours`,
              'medium'
            );
          }

          // Check for large single transactions
          const largeTransactions = recentTransactions.filter(tx => 
            Math.abs(tx.value || 0) > (data.portfolio?.totalValue || 0) * 0.5
          );

          if (largeTransactions.length > 0) {
            toastManager.onSecurityAlert(
              `Large transaction detected in ${wallet.name || 'wallet'}: ${largeTransactions[0].value} ${largeTransactions[0].asset}`,
              'high'
            );
          }
        }
      });
    };

    const interval = setInterval(checkSecurity, 5 * 60 * 1000); // Every 5 minutes
    return () => clearInterval(interval);
  }, [walletAnalytics.wallets, walletAnalytics.walletData, toastManager, finalConfig]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up any active sync toasts
      activeSyncToastsRef.current.forEach(toastId => {
        toastManager.dismissToast(toastId);
      });
      activeSyncToastsRef.current.clear();
    };
  }, [toastManager]);

  return {
    // Enhanced methods
    syncWallet: syncWalletEnhanced,
    addWallet: addWalletEnhanced,
    removeWallet: removeWalletEnhanced,
    syncAllWallets: syncAllWalletsEnhanced,
    
    // Re-export original functionality
    ...walletAnalytics,
    
    // Toast management
    toastManager,
    
    // Configuration
    updateConfig: (newConfig: Partial<EnhancedWalletAnalyticsConfig>) => {
      Object.assign(finalConfig, newConfig);
    },
    
    getConfig: () => ({ ...finalConfig }),
    
    // Utility methods
    showCustomNotification: (type: string, message: string, metadata?: any) => {
      switch (type) {
        case 'achievement':
          return toastManager.onAchievement(message, metadata?.rarity || 'common');
        case 'security':
          return toastManager.onSecurityAlert(message, metadata?.severity || 'medium');
        case 'ai-insight':
          return toastManager.onAIInsight(message, metadata?.confidence || 85);
        case 'milestone':
          return toastManager.onMilestone(message, metadata?.value || 0);
        case 'transaction':
          return toastManager.onTransaction(
            metadata?.type || 'received',
            metadata?.amount || 0,
            metadata?.token || 'ETH',
            metadata?.hash || ''
          );
        default:
          return toastManager.showInfo('Notification', message);
      }
    },

    // Manual trigger methods for testing
    triggerTestNotifications: () => {
      toastManager.onMilestone('$10,000 Portfolio Value', 10000);
      
      setTimeout(() => {
        toastManager.onAIInsight('Your portfolio shows strong diversification across DeFi protocols', 92);
      }, 1000);
      
      setTimeout(() => {
        toastManager.onAchievement('First $1K Milestone Reached', 'rare');
      }, 2000);

      setTimeout(() => {
        toastManager.onTransaction('received', 0.5, 'ETH', '0x1234567890abcdef');
      }, 3000);
    },

    // Force sync with notifications disabled
    silentSync: (walletId: string, options: SyncOptions = {}) => {
      return walletAnalytics.syncWallet(walletId, options);
    },

    // Batch operations
    batchAddWallets: async (wallets: Array<{address: string, name?: string, chainType?: string}>) => {
      const results = [];
      for (const wallet of wallets) {
        const result = await addWalletEnhanced(wallet.address, wallet.name, wallet.chainType);
        results.push(result);
      }
      
      const successful = results.filter(Boolean).length;
      if (successful > 0) {
        toastManager.showSuccess(
          'Wallets Added',
          `Successfully added ${successful}/${wallets.length} wallets`
        );
      }
      
      return results;
    }
  };
};

export default useEnhancedWalletAnalytics;