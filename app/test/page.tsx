'use client'
import React, { useState } from 'react';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Loader2,
  Copy,
  ExternalLink,
  RefreshCw,
  Trash2,
  Wallet,
  TrendingUp,
  Clock,
  Settings,
  Download,
  Upload,
  Zap,
  Star,
  Bell,
  Shield,
  Database,
  CreditCard,
  Lock,
  EyeOff
} from 'lucide-react';

const ToastTestPage = () => {
  const [toastCount, setToastCount] = useState(0);
  const [customTitle, setCustomTitle] = useState('Custom Toast');
  const [customDescription, setCustomDescription] = useState('This is a custom toast message');
  const [customDuration, setCustomDuration] = useState('5000');
  const [customType, setCustomType] = useState('info');
  const [hasAction, setHasAction] = useState(false);
  const [isDismissible, setIsDismissible] = useState(true);

  // Helper function to increment toast count
  const incrementToastCount = () => setToastCount(prev => prev + 1);

  // Enhanced toast utilities for testing
  const testToasts = {
    // Basic toasts
    basic: {
      success: () => {
        toast.success('Operation Successful', {
          description: 'Your action has been completed successfully.',
          duration: 5000
        });
        incrementToastCount();
      },
      
      error: () => {
        toast.error('Operation Failed', {
          description: 'Something went wrong. Please try again.',
          duration: 8000
        });
        incrementToastCount();
      },
      
      warning: () => {
        toast.warning('Warning Notice', {
          description: 'Please review your settings before continuing.',
          duration: 6000
        });
        incrementToastCount();
      },
      
      info: () => {
        toast.info('Information', {
          description: 'Here is some useful information for you.',
          duration: 5000
        });
        incrementToastCount();
      },
      
      loading: () => {
        const id = toast.loading('Processing...', {
          description: 'Please wait while we process your request.'
        });
        
        setTimeout(() => {
          toast.dismiss(id);
          toast.success('Processing Complete!');
          incrementToastCount();
        }, 3000);
        incrementToastCount();
      }
    },

    // Wallet-specific toasts
    wallet: {
      connected: () => {
        toast.success('Wallet Connected', {
          description: 'MetaMask connected successfully',
          action: {
            label: 'Copy Address',
            onClick: () => {
              navigator.clipboard.writeText('0x1234567890abcdef...');
              toast.success('Address Copied', {
                description: 'Wallet address copied to clipboard',
                duration: 2000
              });
            }
          }
        });
        incrementToastCount();
      },
      
      synced: () => {
        toast.success('Wallet Synced', {
          description: 'Portfolio • 15 tokens • $12,450.00',
          action: {
            label: 'View Details',
            onClick: () => console.log('Navigate to wallet details')
          }
        });
        incrementToastCount();
      },
      
      removed: () => {
        toast.success('Wallet Removed', {
          description: 'MetaMask has been removed from your portfolio',
          duration: 4000
        });
        incrementToastCount();
      },
      
      syncError: () => {
        toast.error('Sync Failed', {
          description: 'Unable to sync wallet: Network timeout',
          duration: 8000,
          action: {
            label: 'Retry',
            onClick: () => toast.loading('Retrying sync...')
          }
        });
        incrementToastCount();
      }
    },

    // System toasts
    system: {
      newFeature: () => {
        toast.info('New Feature Available', {
          description: 'Portfolio Analytics: Advanced charts and insights',
          action: {
            label: 'Learn More',
            onClick: () => window.open('/docs/features', '_blank')
          }
        });
        incrementToastCount();
      },
      
      maintenance: () => {
        toast.warning('Scheduled Maintenance', {
          description: 'System maintenance tonight at 2:00 AM (2 hours)',
          duration: 10000
        });
        incrementToastCount();
      },
      
      limitReached: () => {
        toast.warning('Usage Limit Reached', {
          description: "You've reached your API request limit",
          action: {
            label: 'Upgrade Plan',
            onClick: () => console.log('Navigate to billing')
          }
        });
        incrementToastCount();
      },
      
      configError: () => {
        toast.error('Configuration Error', {
          description: 'API key not configured. Please check your settings.',
          duration: 10000,
          action: {
            label: 'Settings',
            onClick: () => console.log('Navigate to settings')
          }
        });
        incrementToastCount();
      }
    },

    // Data operations
    data: {
      exportSuccess: () => {
        toast.success('Export Complete', {
          description: 'Data exported as CSV (2.4 MB)',
          action: {
            label: 'Download',
            onClick: () => console.log('Trigger download')
          }
        });
        incrementToastCount();
      },
      
      importSuccess: () => {
        toast.success('Import Complete', {
          description: 'Successfully imported 1,247 records',
          duration: 6000
        });
        incrementToastCount();
      },
      
      syncComplete: () => {
        toast.success('Data Synchronized', {
          description: '1,247 records updated from Plaid Banking',
          duration: 5000
        });
        incrementToastCount();
      },
      
      validationError: () => {
        toast.error('Validation Failed', {
          description: '5 error(s) found in your data',
          action: {
            label: 'View Details',
            onClick: () => console.log('Show validation errors')
          }
        });
        incrementToastCount();
      }
    },

    // Financial operations
    financial: {
      transactionSuccess: () => {
        toast.success('Transaction Successful', {
          description: 'Sent 0.5 ETH to 0x1234...5678',
          action: {
            label: 'View on Explorer',
            onClick: () => window.open('https://etherscan.io/tx/0x...', '_blank')
          }
        });
        incrementToastCount();
      },
      
      paymentReceived: () => {
        toast.success('Payment Received', {
          description: '$1,250.00 from client payment',
          duration: 6000
        });
        incrementToastCount();
      },
      
      budgetAlert: () => {
        toast.warning('Budget Alert', {
          description: "You've spent 80% of your monthly budget",
          action: {
            label: 'View Budget',
            onClick: () => console.log('Navigate to budget')
          }
        });
        incrementToastCount();
      },
      
      subscriptionRenewal: () => {
        toast.info('Subscription Renewal', {
          description: 'Your Pro plan renews in 3 days ($29.99)',
          action: {
            label: 'Manage Billing',
            onClick: () => console.log('Navigate to billing')
          }
        });
        incrementToastCount();
      }
    },

    // Promise-based toasts
    promises: {
      successPromise: () => {
        const promise = new Promise((resolve) => {
          setTimeout(() => resolve('Success data'), 2000);
        });
        
        toast.promise(promise, {
          loading: 'Processing request...',
          success: 'Request completed successfully!',
          error: 'Request failed!'
        });
        incrementToastCount();
      },
      
      errorPromise: () => {
        const promise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Network error')), 2000);
        });
        
        toast.promise(promise, {
          loading: 'Attempting connection...',
          success: 'Connected successfully!',
          error: 'Connection failed!'
        });
        incrementToastCount();
      },
      
      randomPromise: () => {
        const promise = new Promise((resolve, reject) => {
          setTimeout(() => {
            Math.random() > 0.5 ? resolve('Success!') : reject('Failed!');
          }, 2000);
        });
        
        toast.promise(promise, {
          loading: 'Rolling the dice...',
          success: 'Lucky you!',
          error: 'Better luck next time!'
        });
        incrementToastCount();
      }
    },

    // Advanced features
    advanced: {
      persistent: () => {
        toast.success('Persistent Toast', {
          description: "This toast won't auto-dismiss",
          duration: Infinity
        });
        incrementToastCount();
      },
      
      noClose: () => {
        toast.info('No Close Button', {
          description: 'This toast cannot be manually closed',
          dismissible: false,
          duration: 5000
        });
        incrementToastCount();
      },
      
      customAction: () => {
        toast.warning('Custom Actions', {
          description: 'This toast has multiple actions',
          action: {
            label: 'Primary Action',
            onClick: () => toast.success('Primary action clicked!')
          }
        });
        incrementToastCount();
      },
      
      longContent: () => {
        toast.info('Long Content Example', {
          description: 'This is a very long description that demonstrates how the toast handles extended content. It should wrap properly and maintain good readability while providing comprehensive information to the user about what has occurred.',
          duration: 8000
        });
        incrementToastCount();
      }
    }
  };

  const showCustomToast = () => {
    const toastConfig = {
      description: customDescription,
      duration: parseInt(customDuration),
      dismissible: isDismissible,
      ...(hasAction && {
        action: {
          label: 'Custom Action',
          onClick: () => toast.success('Custom action executed!')
        }
      })
    };

    switch (customType) {
      case 'success':
        toast.success(customTitle, toastConfig);
        break;
      case 'error':
        toast.error(customTitle, toastConfig);
        break;
      case 'warning':
        toast.warning(customTitle, toastConfig);
        break;
      case 'loading':
        toast.loading(customTitle, toastConfig);
        break;
      default:
        toast.info(customTitle, toastConfig);
    }
    
    incrementToastCount();
  };

  const showMultipleToasts = () => {
    const toasts = [
      () => toast.success('Toast 1', { description: 'First toast' }),
      () => toast.info('Toast 2', { description: 'Second toast' }),
      () => toast.warning('Toast 3', { description: 'Third toast' }),
      () => toast.error('Toast 4', { description: 'Fourth toast' }),
      () => toast.loading('Toast 5', { description: 'Fifth toast' })
    ];

    toasts.forEach((toastFn, index) => {
      setTimeout(toastFn, index * 200);
    });
    
    setToastCount(prev => prev + 5);
  };

  const clearAllToasts = () => {
    toast.dismiss();
    setToastCount(0);
  };

  const TestButton = ({ onClick, children, className = "", icon }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${className}`}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  );

  const TestSection = ({ title, children, description }) => (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 mb-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        {description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{description}</p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Toast Testing Suite
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-6">
            Comprehensive testing interface for all toast notification types and features.
            Test different scenarios and customize toast behavior.
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-lg font-medium">
              Toasts Shown: {toastCount}
            </div>
            <button
              onClick={clearAllToasts}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Toasts
            </button>
          </div>
        </div>

        {/* Custom Toast Builder */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">Custom Toast Builder</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Toast Title
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  placeholder="Enter toast title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  placeholder="Enter toast description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Toast Type
                  </label>
                  <select
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                    <option value="loading">Loading</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Duration (ms)
                  </label>
                  <input
                    type="number"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    placeholder="5000"
                  />
                </div>
              </div>
              
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hasAction}
                    onChange={(e) => setHasAction(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Include Action Button</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isDismissible}
                    onChange={(e) => setIsDismissible(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Dismissible</span>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <button
                onClick={showCustomToast}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-lg transition-colors"
              >
                <Zap className="w-5 h-5" />
                Show Custom Toast
              </button>
            </div>
          </div>
        </div>

        {/* Basic Toast Types */}
        <TestSection 
          title="Basic Toast Types"
          description="Standard toast notifications with different severity levels"
        >
          <TestButton 
            onClick={testToasts.basic.success} 
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            icon={<CheckCircle />}>
            Success Toast
          </TestButton>
          <TestButton 
            onClick={testToasts.basic.error} 
            className="bg-red-500 hover:bg-red-600 text-white"
            icon={<AlertCircle />}>
            Error Toast
          </TestButton>
          <TestButton 
            onClick={testToasts.basic.warning} 
            className="bg-amber-500 hover:bg-amber-600 text-white"
            icon={<AlertTriangle />}>
            Warning Toast
          </TestButton>
          <TestButton 
            onClick={testToasts.basic.info} 
            className="bg-blue-500 hover:bg-blue-600 text-white"
            icon={<Info />}>
            Info Toast
          </TestButton>
          <TestButton 
            onClick={testToasts.basic.loading} 
            className="bg-slate-500 hover:bg-slate-600 text-white"
            icon={<Loader2 />}>
            Loading Toast
          </TestButton>
        </TestSection>

        {/* Wallet Operations */}
        <TestSection 
          title="Wallet Operations"
          description="Toast notifications for cryptocurrency wallet interactions"
        >
          <TestButton 
            onClick={testToasts.wallet.connected} 
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            icon={<Wallet />}>
            Wallet Connected
          </TestButton>
          <TestButton 
            onClick={testToasts.wallet.synced} 
            className="bg-blue-500 hover:bg-blue-600 text-white"
            icon={<RefreshCw />}>
            Wallet Synced
          </TestButton>
          <TestButton 
            onClick={testToasts.wallet.removed} 
            className="bg-slate-500 hover:bg-slate-600 text-white"
            icon={<Trash2 />}>
            Wallet Removed
          </TestButton>
          <TestButton 
            onClick={testToasts.wallet.syncError} 
            className="bg-red-500 hover:bg-red-600 text-white"
            icon={<AlertCircle />}>
            Sync Error
          </TestButton>
        </TestSection>

        {/* System Notifications */}
        <TestSection 
          title="System Notifications"
          description="Application-level notifications and announcements"
        >
          <TestButton 
            onClick={testToasts.system.newFeature} 
            className="bg-blue-500 hover:bg-blue-600 text-white"
            icon={<Star />}>
            New Feature
          </TestButton>
          <TestButton 
            onClick={testToasts.system.maintenance} 
            className="bg-amber-500 hover:bg-amber-600 text-white"
            icon={<Settings />}>
            Maintenance Notice
          </TestButton>
          <TestButton 
            onClick={testToasts.system.limitReached} 
            className="bg-amber-500 hover:bg-amber-600 text-white"
            icon={<Clock />}>
            Limit Reached
          </TestButton>
          <TestButton 
            onClick={testToasts.system.configError} 
            className="bg-red-500 hover:bg-red-600 text-white"
            icon={<Shield />}>
            Config Error
          </TestButton>
        </TestSection>

        {/* Data Operations */}
        <TestSection 
          title="Data Operations"
          description="Toast notifications for data import, export, and sync operations"
        >
          <TestButton 
            onClick={testToasts.data.exportSuccess} 
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            icon={<Download />}>
            Export Success
          </TestButton>
          <TestButton 
            onClick={testToasts.data.importSuccess} 
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            icon={<Upload />}>
            Import Success
          </TestButton>
          <TestButton 
            onClick={testToasts.data.syncComplete} 
            className="bg-blue-500 hover:bg-blue-600 text-white"
            icon={<Database />}>
            Sync Complete
          </TestButton>
          <TestButton 
            onClick={testToasts.data.validationError} 
            className="bg-red-500 hover:bg-red-600 text-white"
            icon={<AlertTriangle />}>
            Validation Error
          </TestButton>
        </TestSection>

        {/* Financial Operations */}
        <TestSection 
          title="Financial Operations"
          description="Toast notifications for financial transactions and alerts"
        >
          <TestButton 
            onClick={testToasts.financial.transactionSuccess} 
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            icon={<TrendingUp />}>
            Transaction Success
          </TestButton>
          <TestButton 
            onClick={testToasts.financial.paymentReceived} 
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            icon={<CreditCard />}>
            Payment Received
          </TestButton>
          <TestButton 
            onClick={testToasts.financial.budgetAlert} 
            className="bg-amber-500 hover:bg-amber-600 text-white"
            icon={<AlertTriangle />}>
            Budget Alert
          </TestButton>
          <TestButton 
            onClick={testToasts.financial.subscriptionRenewal} 
            className="bg-blue-500 hover:bg-blue-600 text-white"
            icon={<Bell />}>
            Subscription Renewal
          </TestButton>
        </TestSection>

        {/* Promise-based Toasts */}
        <TestSection 
          title="Promise-based Toasts"
          description="Toast notifications that track async operations"
        >
          <TestButton 
            onClick={testToasts.promises.successPromise} 
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            icon={<CheckCircle />}>
            Success Promise
          </TestButton>
          <TestButton 
            onClick={testToasts.promises.errorPromise} 
            className="bg-red-500 hover:bg-red-600 text-white"
            icon={<AlertCircle />}>
            Error Promise
          </TestButton>
          <TestButton 
            onClick={testToasts.promises.randomPromise} 
            className="bg-purple-500 hover:bg-purple-600 text-white"
            icon={<Zap />}>
            Random Promise
          </TestButton>
        </TestSection>

        {/* Advanced Features */}
        <TestSection 
          title="Advanced Features"
          description="Special toast behaviors and configurations"
        >
          <TestButton 
            onClick={testToasts.advanced.persistent} 
            className="bg-slate-500 hover:bg-slate-600 text-white"
            icon={<Lock />}>
            Persistent Toast
          </TestButton>
          <TestButton 
            onClick={testToasts.advanced.noClose} 
            className="bg-slate-500 hover:bg-slate-600 text-white"
            icon={<EyeOff />}>
            No Close Button
          </TestButton>
          <TestButton 
            onClick={testToasts.advanced.customAction} 
            className="bg-purple-500 hover:bg-purple-600 text-white"
            icon={<Zap />}>
            Custom Actions
          </TestButton>
          <TestButton 
            onClick={testToasts.advanced.longContent} 
            className="bg-blue-500 hover:bg-blue-600 text-white"
            icon={<Info />}>
            Long Content
          </TestButton>
        </TestSection>

        {/* Bulk Operations */}
        <TestSection 
          title="Bulk Operations"
          description="Test multiple toasts and bulk actions"
        >
          <TestButton 
            onClick={showMultipleToasts} 
            className="bg-purple-500 hover:bg-purple-600 text-white"
            icon={<Zap />}>
            Show 5 Toasts
          </TestButton>
          <TestButton 
            onClick={clearAllToasts} 
            className="bg-red-500 hover:bg-red-600 text-white"
            icon={<Trash2 />}>
            Clear All
          </TestButton>
        </TestSection>

        {/* Footer */}
        <div className="text-center mt-12 p-6 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <p className="text-slate-600 dark:text-slate-400">
            Toast notifications should appear in the top-right corner with smooth animations.
            Try different combinations to test the stacking behavior and responsiveness.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ToastTestPage;